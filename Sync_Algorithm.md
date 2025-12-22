# NileLink Protocol v0.1 — Sync & Conflict Resolution

Version: **0.1**  
Last updated: **2025-12-22**

This document defines the offline-first synchronization protocol used by NileLink clients and servers.

## 1) Design goals

1. **Offline-first**: all write operations are possible without network connectivity.
2. **Event-sourced**: the canonical mutation primitive is an immutable event.
3. **Deterministic convergence**: any replica with the same set of events reaches the same state.
4. **Auditability**: every state transition is explainable by a sequence of events.
5. **Interoperability**: on-chain events are ingested into the same event log as off-chain events.

Non-goals (v0.1):
- Strong real-time consistency.
- Cross-restaurant atomic transactions.

## 2) Core concepts

### 2.1 Replica
A **replica** is any device or server that can produce or consume events:
- Mobile device (restaurant staff)
- Backend service (PostgreSQL)
- Blockchain indexer (Polygon log ingestion)

### 2.2 Event stream partitioning
Events are partitioned into streams for concurrency and integrity:

- **Restaurant stream**: `streamId = restaurantId` (Ethereum address)
- **Global stream** (optional): system-level events (protocol upgrades, global denies)

All entity changes that affect a restaurant MUST be emitted in that restaurant’s stream.

### 2.3 Identifiers
- `eventId`: ULID (preferred) or UUIDv4, globally unique.
- `streamSeq`: strictly increasing integer per `(streamId, producerId)`.
- `producerId`: stable identifier for the device/server producing events.

### 2.4 Vector clock (VC)
A vector clock tracks what a replica has observed for each producer.

```
VC: map<producerId, streamSeq>
```

When a producer creates event `e`:
- `VC[producerId] = VC[producerId] + 1`
- `e.vectorClock = VC` (snapshot)
- `e.streamSeq = VC[producerId]`

### 2.5 Lamport timestamp
A Lamport clock provides a total order tie-breaker across concurrent events.

- Each replica maintains `lamport` integer.
- On local event creation: `lamport = lamport + 1`.
- On receiving a remote event with `remoteLamport`: `lamport = max(lamport, remoteLamport) + 1`.

The event includes `e.lamport`.

### 2.6 Canonical ordering rule
To deterministically order a set of events within a stream:

1. Sort by `lamport` ascending
2. Tie-break by `occurredAt` ascending (ISO-8601)
3. Tie-break by `producerId` lexicographically
4. Tie-break by `eventId` lexicographically

This ordering MUST be applied when rebuilding state.

## 3) Data model (wire format)

### 3.1 Base event envelope
All events MUST follow this envelope:

```json
{
  "eventId": "01J...",
  "eventType": "OrderCreated",
  "schemaVersion": "0.1",
  "streamId": "0xRestaurant...",
  "producerId": "device:ios:ABC123",
  "streamSeq": 42,
  "lamport": 1051,
  "occurredAt": "2025-12-22T12:00:00.000Z",
  "actor": {
    "type": "USER|SYSTEM|ORACLE|CHAIN",
    "id": "userId-or-wallet"
  },
  "payload": { "...": "..." },
  "hash": "sha256(canonical_json(event_without_hash))"
}
```

### 3.2 Hashing & canonical JSON
- Canonical JSON MUST:
  - use UTF-8
  - sort object keys lexicographically
  - disallow NaN/Infinity
  - normalize numbers to decimal strings
- `hash = SHA-256(canonical_json(event_without_hash))`.

## 4) Sync API (conceptual)

### 4.1 Pull
Client requests events after its known VC:

```
POST /sync/pull
{
  "streamId": "0xRestaurant...",
  "known": {"device:ios:ABC123": 42, "server:primary": 9001}
}
```

Server returns all events where `streamSeq > known[producerId]` for any producer.

### 4.2 Push
Client uploads locally produced events not yet acknowledged:

```
POST /sync/push
{
  "streamId": "0xRestaurant...",
  "events": [ ... ]
}
```

Server MUST:
- validate event schema
- verify `hash`
- ensure monotonic `streamSeq` per producer
- reject duplicates (idempotent by `eventId`)

## 5) Merge & conflict resolution rules

### 5.1 Definitions
Two events are **causally ordered** if their vector clocks are comparable.

Given events `a` and `b`:
- `a → b` if `VCa <= VCb` and `VCa != VCb`
- `a || b` (concurrent) if neither `VCa <= VCb` nor `VCb <= VCa`

### 5.2 Field-level resolution strategy
NileLink uses a hybrid strategy:

1. **Event-sourced invariants**: some fields can only be changed by specific event types.
2. **Last-Write-Wins (LWW)** for non-conflicting fields.
3. **Manual conflict** for true conflicts.

#### 5.2.1 LWW comparator
If two concurrent events modify the same field and the field is marked LWW:
- pick the event with higher `(lamport, occurredAt, producerId, eventId)`.

#### 5.2.2 Manual conflict criteria
A conflict MUST be escalated to manual approval if:
- concurrent events modify the same field AND the field is not LWW-safe (e.g., taxPercentage, rateLimit, settlement destination)
- concurrent events represent incompatible lifecycle transitions (e.g., `OrderCancelled` and `OrderConfirmed` with valid payment)

The system MUST emit a `ManualReviewRequested` event and halt automatic application until resolved.

### 5.3 Entity-specific rules

#### Orders
- `OrderCreated` is unique per `orderId`.
- `items[]` modifications MUST be via explicit events (add/remove/update) so they can be merged item-wise.
- Payment confirmation MUST be derived from blockchain receipts for BLOCKCHAIN payments; backend assertions are not sufficient.

#### Inventory
- Quantity changes MUST be applied as deltas and recorded in `eventLog`.
- Inventory changes are commutative if represented as deltas with stable identifiers; if represented as absolute quantities, they require manual reconciliation.

## 6) Sync algorithm (deterministic)

### 6.1 High-level steps
For each stream (restaurant):

1. Load local event store `L` and local VC `V_local`.
2. Pull remote event set `R` given `V_local`.
3. Compute `U = dedupe(L ∪ R)` by `eventId`.
4. Validate `U`:
   - schema validation
   - hash validation
   - monotonic streamSeq per producer
5. Sort `U` by the canonical ordering rule.
6. Rebuild state by reducing `U`:
   - apply events in order
   - when conflict detected, emit manual review marker
7. Persist:
   - merged event store `U`
   - new VC `V_merged`
   - materialized state snapshot (optional)
8. Push any locally produced events not yet acknowledged.
9. Ingest blockchain events (indexer) and repeat merge.

### 6.2 Pseudocode

```pseudo
function sync(streamId):
  L = localEventStore.getAll(streamId)
  V_local = localVC.get(streamId)

  R = server.pull(streamId, V_local)

  U = dedupeByEventId(L + R)
  validateEvents(U)

  U_sorted = sortCanonical(U)

  state = initialState(streamId)
  conflicts = []

  for e in U_sorted:
    result = applyEvent(state, e)

    if result.type == CONFLICT:
      conflicts.append(result)
      emitLocal(ManualReviewRequested(entityId=result.entityId, type=result.type, reason=result.reason))
      continue

    state = result.state

  localEventStore.replace(streamId, U_sorted)
  localStateStore.save(streamId, state)
  localVC.set(streamId, computeVC(U_sorted))

  pending = localEventStore.getPendingUploads(streamId)
  server.push(streamId, pending)

  return { state, conflicts }
```

### 6.3 Proof sketch (why it converges)
- Each event has a stable identity (`eventId`) and immutable content (hash verified).
- Merge is set union + deterministic sort; therefore all replicas with the same event set produce the same ordered list.
- State rebuild is a pure reduction over the ordered list; therefore all replicas converge.

## 7) Worked conflict example (short)

Scenario: Two offline devices modify the same inventory item.

- Device A: `InventoryUpdated` sets qty from 10 → 7 due to order consumption.
- Device B: `InventoryUpdated` sets qty from 10 → 12 due to restock receipt.

If updates are expressed as absolute qty, they conflict (concurrent writes). v0.1 mandates **delta-based** updates:

- A emits `InventoryQtyDecremented(delta=3)`
- B emits `InventoryQtyIncremented(delta=2)`

Merged result is deterministic: `10 - 3 + 2 = 9`.

Full worked examples are provided in `Examples.md`.

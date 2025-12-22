# NileLink Protocol v0.1 — Worked Examples

Version: **0.1**  
Last updated: **2025-12-22**

## Example 1 — Full order flow (BLOCKCHAIN payment, delivery)

### Setup
- Restaurant `0x1111111111111111111111111111111111111111` (Lebanon, local currency LBP)
- Customer wallet `0x2222222222222222222222222222222222222222`
- USDC has 6 decimals
- Protocol fee = **0.5%**

Exchange rate snapshot (example):
- `1 USD = 89,500 LBP`
- Source: Chainlink oracle

### 1) OrderCreated

`OrderCreated(restaurantId, orderId, items[], total, customerId)`

Payload (illustrative):

- `orderId = "550e8400-e29b-41d4-a716-446655440000"`
- items:
  - `{ sku: "BRG-001", name: "Classic Burger", qty: 2, unitPrice: 7.50, modifiers: ["no-onions"] }`
  - `{ sku: "DRK-010", name: "Cola", qty: 2, unitPrice: 1.25, modifiers: [] }`

Compute:
- subtotalUSD = `2*7.50 + 2*1.25 = 17.50`
- taxPercentage = 10% → taxUSD = `1.75`
- deliveryFeeUSD = `2.00`
- totalUSD = `21.25`

Local:
- localSubtotal = `17.50 * 89500 = 1,566,250 LBP`
- localTotal = `21.25 * 89500 = 1,901,875 LBP`

### 2) PaymentInitiated → PaymentSubmittedToBlockchain

Client constructs a payment intent:

- pay **21.25 USDC** to restaurant wallet
- include `orderId` in calldata or metadata (depending on contract design)

Event:
- `PaymentInitiated(orderId, amount, rate, method)`
- `PaymentSubmittedToBlockchain(orderId, txHash)`

### 3) PaymentConfirmed

Indexer validates the transaction receipt:
- token = USDC contract
- `from = customerWallet`
- `to = OrderSettlement contract` or directly `restaurantWallet` (depending on design)
- amount = 21.25 USDC (± rounding tolerance)

Event:
- `PaymentConfirmed(orderId, blockNumber, confirmation)`

### 4) OrderConfirmed → KitchenStartCooking → OrderReadyForPickup

Restaurant POS confirms order after payment:
- `OrderConfirmed(orderId, paymentTxHash)`

Kitchen workflow:
- `KitchenOrderReceived(restaurantId, orderId, items[])`
- `KitchenStartCooking(orderId, estimatedTime=12m)`
- `KitchenOrderReady(orderId)`
- `OrderReadyForPickup(orderId)`

### 5) DeliveryAssigned → Pickup → Delivered

- `DeliveryPartnerAssigned(orderId, partnerId, fee)`
- `DeliveryStarted(orderId, partnerLocation)`
- `DeliveryInProgress(orderId, currentLocation, ETA)`
- `DeliveryCompleted(orderId, actualTime, distance)`
- `OrderDelivered(orderId, actualTime, rating, feedback)`

### 6) Settlement + protocol fee (0.5%)

Settlement math:
- gross = 21.25
- protocolFee = `gross * 0.005 = 0.10625 USDC`
- netToRestaurant = `21.14375 USDC`

Rounding rule (v0.1):
- USDC amounts are rounded **down** to 6 decimals at transfer time.

Event:
- `PaymentSettled(orderId, toWallet, amount, finalRate)`

## Example 2 — Offline sync + conflict resolution (two devices)

### Actors
- Stream: `restaurantId = 0x111...111`
- Device A producerId: `device:ios:A`
- Device B producerId: `device:android:B`

Initial VC on both devices:
- `{ A: 10, B: 7, server: 1000 }`

### Offline actions

#### Device A records an order consuming inventory
- A emits `InventoryUpdated(itemId="BRG-001", oldQty=10, newQty=8, reason="ORDER_CONSUMPTION")`
- A increments VC → `{ A: 11, B: 7, server: 1000 }`

#### Device B receives a restock
- B emits `RestockingReceived(itemId="BRG-001", actualQty=5, actualCost=... )`
- B increments VC → `{ A: 10, B: 8, server: 1000 }`

These events are **concurrent**.

### Merge on reconnect

Server pulls/pushes events and forms union.
Deterministic ordering is by `(lamport, occurredAt, producerId, eventId)`.

Inventory rule:
- If both events can be represented as deltas, apply both.
- If absolute quantities are used, escalate to manual review.

Outcome (delta-based):
- qty = `10 - 2 + 5 = 13`

Emitted (if low stock threshold crossed):
- `InventoryLowAlert` when `qty <= minQty`

## Example 3 — Dispute and resolution

### Scenario
- An order was delivered, but customer claims incorrect items.

Steps:
1. Customer opens a dispute within 30 days:
   - `OrderDisputed(orderId, reason="wrong items", claimAmount=7.50)`
2. DisputeResolution contract starts a 3-day timer for auto-settle (policy-based).
3. Manual reviewer examines evidence (kitchen logs, delivery proof).
4. Resolution:
   - If refund approved: `DisputeResolved(orderId, resolution="REFUND", txHash=...)` and `OrderRefunded(...)`
   - If denied: `DisputeResolved(orderId, resolution="CONFIRM", txHash=...)`

Audit guarantee:
- The entire dispute lifecycle is reconstructable from the immutable event log + on-chain receipts.

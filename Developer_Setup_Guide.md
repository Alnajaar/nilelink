# NileLink Protocol v0.1 — Developer Setup Guide

Version: **0.1**  
Last updated: **2025-12-22**

This guide explains how to start building against the NileLink Protocol specification.

> This repository currently contains the protocol specification artifacts (schemas, state machines, contract interfaces). Implementation repositories (apps, backend, contracts) are expected to be created subsequently.

## 1) What you get in this repo

- `Protocol_Specification_v0.1.md` — authoritative protocol spec (source of truth)
- `Entity_Schema.json` — machine-readable entity schema (JSON Schema)
- `Event_Types.json` — machine-readable event catalog + payload schemas
- `State_Machines.yaml` — order/payment/delivery/inventory state machines
- `SmartContract_Interfaces.sol` — ABI-compatible Solidity interfaces
- `Sync_Algorithm.md` — offline-first sync, merge, and conflict rules
- `Security_Checklist.md` — implementable security requirements
- `Regional_Compliance.yaml` — baseline rules for Lebanon + additional countries
- `Examples.md` — worked examples

## 2) Recommended implementation stack (reference)

The protocol is intentionally stack-agnostic. For speed, we recommend:

- **Backend**: TypeScript + Node.js (NestJS/Fastify) or Go
- **Database**: PostgreSQL for server; SQLite (SQLCipher) for mobile
- **Event store**: append-only table per stream or Kafka + persisted store
- **Smart contracts**: Solidity + Foundry (or Hardhat)
- **Indexer**: a Polygon log indexer (e.g., custom worker) producing `Chain*` events
- **Mobile**: React Native or Flutter

## 3) Development prerequisites

### 3.1 System tools
- Git
- Docker + Docker Compose
- A modern Node.js runtime (LTS)
- PostgreSQL client tools (`psql`)

### 3.2 Solidity tools
Pick one:
- Foundry (`forge`, `cast`)
- Hardhat

## 4) How to use the schemas

### 4.1 Entity schema
- Treat `Entity_Schema.json` as the source of truth for:
  - database migrations
  - API payload validation
  - OpenAPI generation

Implementation requirement:
- Every inbound API request that creates or updates an entity MUST be validated against the JSON Schema.

### 4.2 Event types
- Treat `Event_Types.json` as the source of truth for:
  - event payload validation
  - event routing
  - analytics/event ingestion

Implementation requirement:
- Services MUST reject unknown `eventType` values.

## 5) Contract interface usage

`SmartContract_Interfaces.sol` defines ABI-compatible interfaces for the v0.1 contracts.

Implementation requirement:
- Contracts MUST emit events exactly as defined.
- Off-chain indexers MUST decode logs using these interfaces.

## 6) Environment configuration (reference)

Recommended environment variables for an implementation repository:

- `CHAIN_ID` (Polygon mainnet: 137, Mumbai: 80001)
- `USDC_ADDRESS`
- `RPC_URL`
- `JWT_PUBLIC_KEY`
- `JWT_PRIVATE_KEY` (server only)
- `SQLCIPHER_KEY` (mobile derived, not hard-coded)

## 7) Suggested repository layout for implementation

```
/contract
  /src
  /test
/backend
  /src
  /migrations
/mobile
  /ios
  /android
/spec
  Protocol_Specification_v0.1.md
  Entity_Schema.json
  Event_Types.json
  State_Machines.yaml
```

## 8) Contributing rules

- Changes to the protocol MUST increment a version field and include migration notes.
- The protocol MUST remain backwards compatible within the same minor version unless explicitly marked as breaking.
- All examples MUST be updated if they become inconsistent with schemas.

## 9) Next build steps (implementation roadmap)

1. Generate DB migrations from `Entity_Schema.json`.
2. Implement the event store and the sync API (`/sync/pull`, `/sync/push`).
3. Implement an indexer to ingest Polygon logs and produce chain events.
4. Implement `RestaurantRegistry` + `OrderSettlement` contracts first; then add dispute and investor features.

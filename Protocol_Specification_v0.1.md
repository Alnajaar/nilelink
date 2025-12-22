# NileLink Protocol — v0.1 Specification (Source of Truth)

**Document ID:** NileLink-Protocol-Spec-v0.1  
**Version:** 0.1  
**Status:** Implementable specification (pre-release)  
**Last updated:** 2025-12-22

This document is the authoritative, production-oriented specification for the **NileLink Protocol v0.1**.

It is intended to serve as the source of truth for subsequent implementation work by:

- backend teams
- mobile/POS teams
- smart contract teams
- indexer and analytics teams

## Normative artifacts

The following files in this repository are **normative** and MUST be treated as sources of truth:

1. `Entity_Schema.json`
2. `Event_Types.json`
3. `State_Machines.yaml`
4. `SmartContract_Interfaces.sol`
5. `Sync_Algorithm.md`
6. `Security_Checklist.md`
7. `Regional_Compliance.yaml`
8. `Examples.md`

---

## Table of contents

1. [Scope](#1-scope)
2. [Normative language](#2-normative-language)
3. [Architecture and trust model](#3-architecture-and-trust-model)
4. [Entity model overview](#4-entity-model-overview)
5. [Event model overview](#5-event-model-overview)
6. [State machines](#6-state-machines)
7. [Financial determinism](#7-financial-determinism)
8. [Blockchain integration](#8-blockchain-integration)
9. [Offline-first sync](#9-offline-first-sync)
10. [Security](#10-security)
11. [Compliance](#11-compliance)
12. [Developer guide](#12-developer-guide)
13. [Appendix A — Entity tables (generated)](#appendix-a--entity-tables-generated)
14. [Appendix B — Event catalog (generated, detailed)](#appendix-b--event-catalog-generated-detailed)
15. [Appendix C — State machines (normative YAML)](#appendix-c--state-machines-normative-yaml)
16. [Appendix D — Smart contract interfaces (normative Solidity)](#appendix-d--smart-contract-interfaces-normative-solidity)
17. [Appendix E — Regional compliance configuration (normative YAML)](#appendix-e--regional-compliance-configuration-normative-yaml)

---

## 1) Scope

NileLink v0.1 defines:

- A restaurant entity model and constraints.
- Immutable event types that cover the full operational lifecycle.
- Unambiguous lifecycle state machines.
- On-chain settlement requirements on Polygon using USDC.
- Offline-first sync and conflict resolution that deterministically converges.

Out of scope:
- A complete API specification for every feature surface.
- A single mandated backend/mobile stack.

---

## 2) Normative language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are interpreted as described in RFC 2119.

---

## 3) Architecture and trust model

### 3.1 Components

A production deployment typically includes:

- Mobile/POS clients (offline-first)
- Sync service (push/pull events)
- Event store (append-only)
- Projection/read-model services (orders, inventory, reporting)
- Polygon smart contracts
- Chain indexer producing chain-derived events

### 3.2 Trust boundaries

- Client devices are *not* trusted to assert on-chain settlement truth.
- Backend services must validate event integrity and on-chain receipts.
- Polygon receipts/logs are the authoritative record of on-chain settlement.

### 3.3 Immutability and audit

- Every entity change must be attributable to one or more immutable events.
- Monetary values must be recomputable from immutable inputs.

---

## 4) Entity model overview

The canonical, machine-readable schema is `Entity_Schema.json`. Highlights:

- Restaurant IDs are Ethereum-format addresses.
- Orders, deliveries, invoices, and investor accounts use UUIDv4.
- Inventory is an event-sourced ledger of quantity changes.

The full entity tables are provided in Appendix A.

---

## 5) Event model overview

The canonical event catalog is `Event_Types.json`.

Key rules:

- Events are immutable, append-only.
- Each event is wrapped in an envelope including hash, ordering metadata, and actor.
- Consumers MUST reject unknown event types.

The detailed event catalog is provided in Appendix B.

---

## 6) State machines

The canonical state machines are defined in `State_Machines.yaml`.

Implementation requirements:

- Clients SHOULD prevent illegal transitions locally.
- Servers MUST validate transitions when applying events.
- Conflicting transitions must trigger manual review.

---

## 7) Financial determinism

### 7.1 Money representation

- v0.1 uses decimal strings for money.
- For USDC transfers, values MUST be converted to 6-decimal minor units and rounded down.

### 7.2 Order totals

`total = subtotal + tax + deliveryFee`

The server MUST verify totals and reject mismatches.

### 7.3 Exchange rate snapshot

- Rate must be snapped at order time.
- Snapshot must include oracle source and timestamp.

---

## 8) Blockchain integration

### 8.1 Network

- Polygon PoS
- Mumbai testnet for development

### 8.2 Token

- USDC (6 decimals)

### 8.3 Authentication and wallets

- EIP-4361 (SIWE) for authentication
- ERC-4337 (optional) for account abstraction

### 8.4 Contract modules

v0.1 requires (or equivalents):

- RestaurantRegistry
- OrderSettlement
- CurrencyExchange
- DisputeResolution
- FraudDetection
- InvestorVault
- SupplierCredit

See Appendix D for ABI-compatible interfaces.

---

## 9) Offline-first sync

The normative sync and conflict algorithm is in `Sync_Algorithm.md`.

Requirements:

- Local event queue while offline
- Pull remote events based on known vector clock state
- Merge by set union and deterministic ordering
- Detect conflicts and emit manual review events

---

## 10) Security

Normative checklist: `Security_Checklist.md`.

Minimum required controls:

- SQLCipher (AES-256) for local data
- TLS 1.3 for APIs
- Certificate pinning
- SIWE nonce single-use and expiry
- Event integrity hashing
- Smart contract reentrancy guards and access control

---

## 11) Compliance

Normative configuration: `Regional_Compliance.yaml`.

v0.1 includes Lebanon + 5 other countries.

---

## 12) Developer guide

See `Developer_Setup_Guide.md`.

---

## Appendix A — Entity tables (generated)

The tables below are generated from `Entity_Schema.json` and are normative.
### Restaurant

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `chainlinkOracleAddress` | EthAddress | yes | no |  |
| `country` | ISO3166Alpha2 | yes | no |  |
| `createdAt` | ISODateTime | yes | yes |  |
| `dailyRateLimit` | MoneyUsd | yes | no | Daily settlement cap in USD. Implementations SHOULD enforce on-chain and off-chain. |
| `id` | EthAddress | yes | yes |  |
| `lastModified` | ISODateTime | yes | no |  |
| `legalName` | LocalizedName | yes | no |  |
| `localCurrency` | ISO4217 | yes | no |  |
| `localName` | LocalizedName | yes | no |  |
| `ownerPhoneNumber` | PhoneE164 | yes | no |  |
| `status` | string | yes | no | enum: ACTIVE, SUSPENDED, INACTIVE |
| `taxPercentage` | number | yes | no | min: 0 ; max: 100 |
| `timezone` | string | yes | no | minLength: 1 ; maxLength: 64 ; IANA timezone (e.g., Asia/Beirut). |

**Relationships:**
- orders: one-to-many → Order (FK: `restaurantId`)
- inventory: one-to-many → InventoryItem (FK: `restaurantId`)

### Order

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `blockchainTxHash` | PolygonTxHash | yes | no |  |
| `completedAt` | anyOf | yes | no |  |
| `createdAt` | ISODateTime | yes | yes |  |
| `customerId` | CustomerId | yes | no |  |
| `deliveryFee` | MoneyUsd | yes | no |  |
| `deliveryPartnerAssignedTo` | string | null | yes | no | maxLength: 128 |
| `exchangeRate` | string | yes | no | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` ; Snapshot rate at order time: local currency per 1 USD. |
| `id` | UUIDv4 | yes | yes |  |
| `items` | array | yes | no |  |
| `kitchenNotes` | string | yes | no | maxLength: 2000 |
| `localSubtotal` | MoneyLocal | yes | no |  |
| `localTotal` | MoneyLocal | yes | no |  |
| `orderNotes` | string | yes | no | maxLength: 2000 |
| `paymentMethod` | string | yes | no | enum: BLOCKCHAIN, FIAT, NILE_FUTURE |
| `restaurantId` | EthAddress | yes | yes |  |
| `status` | string | yes | no | enum: CREATED, PAID, CONFIRMED, COOKING, READY, PICKED_UP, DELIVERED, CANCELLED |
| `subtotal` | MoneyUsd | yes | no |  |
| `tax` | MoneyUsd | yes | no |  |
| `total` | MoneyUsd | yes | no |  |

**Derived/validation constraints:**
- `total == subtotal + tax + deliveryFee`
- `localTotal == localSubtotal + (tax * exchangeRate) + (deliveryFee * exchangeRate)`

### Transaction

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `amountLocal` | MoneyLocal | yes | no |  |
| `amountUSD` | MoneyUsd | yes | no |  |
| `blockNumber` | integer | yes | yes | min: 0 |
| `fee` | MoneyUsd | yes | no | Protocol fee (0.5% default). |
| `fromWallet` | EthAddress | yes | yes |  |
| `gasUsed` | integer | yes | no | min: 0 |
| `id` | PolygonTxHash | yes | yes |  |
| `orderId` | UUIDv4 | yes | yes |  |
| `rate` | string | yes | no | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |
| `status` | string | yes | no | enum: PENDING, CONFIRMED, SETTLED, DISPUTED, REFUNDED |
| `timestamp` | ISODateTime | yes | yes |  |
| `toWallet` | EthAddress | yes | yes |  |

### InventoryItem

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `category` | string | yes | no | enum: appetizer, main, beverage, dessert, side, sauce, other |
| `costPerUnit` | MoneyUsd | yes | no |  |
| `eventLog` | array | yes | yes | Immutable history of all quantity changes. |
| `expiryDate` | anyOf | yes | no |  |
| `id` | string | yes | yes | minLength: 1 ; maxLength: 64 ; SKU |
| `lastRestocked` | ISODateTime | yes | no |  |
| `minQty` | integer | yes | no | min: 0 |
| `name` | LocalizedName | yes | no |  |
| `profit%` | number | yes | no | min: -1000 ; max: 1000 ; Computed: ((sellingPrice - costPerUnit)/sellingPrice)*100 |
| `qty` | integer | yes | no | min: 0 |
| `restaurantId` | EthAddress | yes | yes |  |
| `sellingPrice` | MoneyUsd | yes | no |  |
| `supplier` | EthAddress | yes | no |  |

### Delivery

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `actualDeliveryTime` | anyOf | yes | no |  |
| `actualPickupTime` | anyOf | yes | no |  |
| `baseFee` | MoneyUsd | yes | no |  |
| `createdAt` | ISODateTime | yes | yes |  |
| `customerLocation` | GeoPoint | yes | no |  |
| `deliveryPartnerId` | string | yes | no | minLength: 1 ; maxLength: 128 |
| `deliveryTime` | anyOf | yes | no |  |
| `distance` | number | yes | no | min: 0 ; km |
| `feedback` | string | yes | no | maxLength: 2000 |
| `id` | UUIDv4 | yes | yes |  |
| `orderId` | UUIDv4 | yes | yes |  |
| `pickupTime` | anyOf | yes | no |  |
| `rating` | anyOf | yes | no |  |
| `restaurantId` | EthAddress | yes | yes |  |
| `restaurantLocation` | GeoPoint | yes | no |  |
| `route` | array | yes | no | Optional multi-stop route |
| `status` | string | yes | no | enum: ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED |
| `tipAmount` | MoneyUsd | yes | no |  |
| `totalFee` | MoneyUsd | yes | no |  |

**Derived/validation constraints:**
- `totalFee == baseFee + tipAmount`

### SupplierInvoice

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `blockchainSettlementTxHash` | anyOf | yes | no |  |
| `createdAt` | ISODateTime | yes | yes |  |
| `dueDate` | string | yes | no | format: date |
| `id` | UUIDv4 | yes | yes |  |
| `items` | array | yes | no |  |
| `paidAmount` | MoneyUsd | yes | no |  |
| `paymentTerms` | string | yes | no | enum: COD, Net-30, Net-60 |
| `proofOfDelivery` | string | yes | no | pattern: `^0x[a-fA-F0-9]{64}$` ; Hash of POD document |
| `remainingBalance` | MoneyUsd | yes | no |  |
| `restaurantId` | EthAddress | yes | yes |  |
| `status` | string | yes | no | enum: DRAFT, SENT, RECEIVED, PARTIALLY_PAID, SETTLED |
| `supplierId` | oneOf | yes | yes | Supplier identifier: E.164 phone or on-chain address. |
| `totalAmount` | MoneyUsd | yes | no |  |

**Derived/validation constraints:**
- `remainingBalance == totalAmount - paidAmount`

### InvestorAccount

| Field | Type | Required | Immutable | Constraints / Notes |
|---|---:|---:|---:|---|
| `dividendRecipientWallet` | EthAddress | yes | no |  |
| `id` | UUIDv4 | yes | yes |  |
| `investmentAmount` | MoneyUsd | yes | no |  |
| `investmentDate` | ISODateTime | yes | yes |  |
| `investorWallet` | EthAddress | yes | yes |  |
| `ownership%` | number | yes | no | min: 0 ; max: 100 |
| `performanceMetrics` | object | yes | no | Real-time KPIs (revenue, orders/day, margin, etc.). |
| `portfolioRestaurantIds` | array | yes | no |  |
| `restaurantId` | anyOf | yes | no | Single-restaurant investment. For multi-restaurant portfolios use `portfolioRestaurantIds`. |
| `status` | string | yes | no | enum: ACTIVE, DORMANT, EXITED |

---

## Appendix B — Event catalog (generated, detailed)

The sections below are generated from `Event_Types.json` and are normative.

**Event count:** 140

### Envelope (applies to every event)

See `Event_Types.json:eventEnvelope` for the definitive envelope schema.
### Compliance (6)

#### `AmlAlertRaised`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | anyOf | yes |  |
| `reason` | string | yes | maxLength: 512 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `threshold` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |

#### `AuditLogExported`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `exportId` | string | yes | format: uuid |
| `format` | string | yes | enum: CSV, JSON, PARQUET |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `DataDeletionCompleted`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `anonymizationMethod` | string | yes | maxLength: 128 |
| `completedAt` | string | yes | format: date-time |
| `userId` | string | yes | maxLength: 128 |

#### `DataDeletionRequested`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `requestedAt` | string | yes | format: date-time |
| `scope` | string | yes | enum: FULL, PII_ONLY |
| `userId` | string | yes | maxLength: 128 |

#### `TaxReportGenerated`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `periodEnd` | string | yes | format: date |
| `periodStart` | string | yes | format: date |
| `reportHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `UserConsentRecorded`

- Category: **Compliance**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `consentType` | string | yes | maxLength: 64 |
| `timestamp` | string | yes | format: date-time |
| `userId` | string | yes | maxLength: 128 |

### Currency (8)

#### `ExchangeRateSnapshotted`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `oracleSource` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `rate` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `timestamp` | string | yes | format: date-time |

#### `ExchangeRateUpdated`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `localCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `oracleSource` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `rate` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |
| `timestamp` | string | yes | format: date-time |

#### `OracleFallbackUsed`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `fallbackOracle` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `localCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `primaryOracle` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `timestamp` | string | yes | format: date-time |

#### `OracleSourceDegraded`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `details` | string | yes | maxLength: 512 |
| `localCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `oracleSource` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RateLimitApproached`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `currentTotal` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `dailyLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `percentUsed` | number | yes | min: 0 ; max: 100 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RateLimitExceeded`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `action` | string | yes | enum: BLOCK, ALLOW_WITH_REVIEW |
| `attemptedAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `limit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RateLimitIncreaseApproved`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RateLimitIncreaseRequested`

- Category: **Currency**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `reason` | string | yes | maxLength: 512 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

### Delivery (11)

#### `DeliveryCancelled`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `DeliveryCompleted`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `actualTime` | string | yes | format: date-time |
| `distance` | number | yes | min: 0 |
| `orderId` | string | yes | format: uuid |

#### `DeliveryETAUpdated`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newETA` | string | yes | format: date-time |
| `oldETA` | string | yes | format: date-time |
| `orderId` | string | yes | format: uuid |

#### `DeliveryFailed`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `DeliveryInProgress`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `ETA` | string | yes | format: date-time |
| `currentLocation` | object | yes |  |
| `orderId` | string | yes | format: uuid |

#### `DeliveryLocationUpdated`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `currentLocation` | object | yes |  |
| `orderId` | string | yes | format: uuid |
| `timestamp` | string | yes | format: date-time |

#### `DeliveryPartnerAssigned`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `fee` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `partnerId` | string | yes | maxLength: 128 |

#### `DeliveryRated`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `feedback` | string | yes | maxLength: 2000 |
| `orderId` | string | yes | format: uuid |
| `rating` | integer | yes | min: 1 ; max: 5 |

#### `DeliveryRouteUpdated`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `route` | array | yes |  |

#### `DeliveryStarted`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `partnerLocation` | object | yes |  |

#### `DeliveryTipAdded`

- Category: **Delivery**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `method` | string | yes | enum: CASH, IN_APP, ON_CHAIN |
| `orderId` | string | yes | format: uuid |
| `tipAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |

### Fraud (6)

#### `AnomalyDetected`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `action` | string | yes | maxLength: 128 |
| `details` | string | yes | maxLength: 2000 |
| `severity` | integer | yes | min: 1 ; max: 5 |
| `type` | string | yes | maxLength: 64 |

#### `DisputeClaimFiled`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `entityId` | string | yes | maxLength: 128 |
| `reason` | string | yes | maxLength: 512 |

#### `ManualReviewRequested`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `entityId` | string | yes | maxLength: 128 |
| `reason` | string | yes | maxLength: 512 |
| `type` | string | yes | maxLength: 64 |

#### `ManualReviewResolved`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `notes` | string | yes | maxLength: 2000 |
| `resolution` | string | yes | enum: APPROVE, REJECT, ESCALATE |
| `reviewId` | string | yes | format: uuid |

#### `RiskScoreComputed`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `modelVersion` | string | yes | maxLength: 32 |
| `score` | integer | yes | min: 0 ; max: 1000 |
| `subject` | string | yes | maxLength: 128 |

#### `TransactionBlocked`

- Category: **Fraud**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `reason` | string | yes | maxLength: 512 |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

### Identity (9)

#### `BiometricAdded`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `timestamp` | string | yes | format: date-time |
| `type` | string | yes | enum: FACE_ID, FINGERPRINT |
| `userId` | string | yes | maxLength: 128 |

#### `DeviceRegistered`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `deviceId` | string | yes | maxLength: 128 |
| `platform` | string | yes | enum: IOS, ANDROID, WEB, POS |
| `userId` | string | yes | maxLength: 128 |

#### `SessionEnded`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `duration` | integer | yes | min: 0 |
| `userId` | string | yes | maxLength: 128 |

#### `SessionStarted`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `ipAddress` | string | yes | maxLength: 64 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `userId` | string | yes | maxLength: 128 |

#### `SiweAuthenticated`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `chainId` | integer | yes | min: 1 |
| `domain` | string | yes | maxLength: 255 |
| `nonce` | string | yes | maxLength: 64 |
| `walletAddress` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `UserRegistered`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `phoneNumber` | string | yes | pattern: `^\+[1-9]\d{1,14}$` |
| `role` | string | yes | maxLength: 64 |
| `walletAddress` | anyOf | yes |  |

#### `UserRoleAssigned`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `role` | string | yes | maxLength: 64 |
| `userId` | string | yes | maxLength: 128 |

#### `UserRoleRevoked`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `role` | string | yes | maxLength: 64 |
| `userId` | string | yes | maxLength: 128 |

#### `UserSuspended`

- Category: **Identity**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `reason` | string | yes | maxLength: 512 |
| `userId` | string | yes | maxLength: 128 |

### Inventory (12)

#### `InventoryAuditCompleted`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `auditId` | string | yes | format: uuid |
| `completedAt` | string | yes | format: date-time |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `varianceNotes` | string | yes | maxLength: 2000 |

#### `InventoryExpired`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `expiryDate` | string | yes | format: date |
| `itemId` | string | yes | maxLength: 64 |
| `qtyDiscarded` | integer | yes | min: 1 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryItemAdded`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `costPerUnit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `itemId` | string | yes | maxLength: 64 |
| `name` | object | yes |  |
| `qty` | integer | yes | min: 0 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryLowAlert`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `currentQty` | integer | yes | min: 0 |
| `itemId` | string | yes | maxLength: 64 |
| `minQty` | integer | yes | min: 0 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryMinQtyUpdated`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `newMinQty` | integer | yes | min: 0 |
| `oldMinQty` | integer | yes | min: 0 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryPriceUpdated`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `newSellingPrice` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `oldSellingPrice` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryQtyDecremented`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `delta` | integer | yes | min: 1 |
| `itemId` | string | yes | maxLength: 64 |
| `reason` | string | yes | maxLength: 128 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryQtyIncremented`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `delta` | integer | yes | min: 1 |
| `itemId` | string | yes | maxLength: 64 |
| `reason` | string | yes | maxLength: 128 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventorySupplierUpdated`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `newSupplier` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `oldSupplier` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InventoryUpdated`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `newQty` | integer | yes | min: 0 |
| `oldQty` | integer | yes | min: 0 |
| `reason` | string | yes | maxLength: 128 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestockingReceived`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `actualCost` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `actualQty` | integer | yes | min: 0 |
| `items` | array | yes |  |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `supplierId` | string | yes | maxLength: 128 |

#### `RestockingRequested`

- Category: **Inventory**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `estimatedCost` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `items` | array | yes |  |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `supplierId` | string | yes | maxLength: 128 |

### Investor (8)

#### `DividendDeclared`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `periodEnd` | string | yes | format: date |
| `periodStart` | string | yes | format: date |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `totalDividendAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |

#### `DividendPaid`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `investorId` | string | yes | format: uuid |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `txHash` | anyOf | yes |  |

#### `InvestmentMade`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `investmentAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `investmentDate` | string | yes | format: date-time |
| `investorId` | string | yes | format: uuid |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `InvestorAccountCreated`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `investorId` | string | yes | format: uuid |
| `investorWallet` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `restaurantId` | anyOf | yes |  |

#### `InvestorPortfolioUpdated`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `addedRestaurants` | array | yes |  |
| `investorId` | string | yes | format: uuid |
| `removedRestaurants` | array | yes |  |

#### `InvestorStatusChanged`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `investorId` | string | yes | format: uuid |
| `newStatus` | string | yes | enum: ACTIVE, DORMANT, EXITED |
| `oldStatus` | string | yes | enum: ACTIVE, DORMANT, EXITED |
| `timestamp` | string | yes | format: date-time |

#### `OwnershipRecalculated`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `investorId` | string | yes | format: uuid |
| `ownershipPercent` | number | yes | min: 0 ; max: 100 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `PerformanceMetricsUpdated`

- Category: **Investor**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `metrics` | object | yes |  |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `timestamp` | string | yes | format: date-time |

### Kitchen (8)

#### `KitchenOrderReady`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |

#### `KitchenOrderReceived`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `items` | array | yes |  |
| `orderId` | string | yes | format: uuid |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `KitchenOrderRejected`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `KitchenOutOfStock`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `alternative` | anyOf | yes |  |
| `itemId` | string | yes | maxLength: 64 |
| `orderId` | string | yes | format: uuid |

#### `KitchenPrepTimeUpdated`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newEstimatedMinutes` | integer | yes | min: 0 |
| `oldEstimatedMinutes` | integer | yes | min: 0 |
| `orderId` | string | yes | format: uuid |

#### `KitchenStartCooking`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `estimatedTime` | string | yes | maxLength: 64 |
| `orderId` | string | yes | format: uuid |

#### `KitchenStepCompleted`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `step` | string | yes | maxLength: 64 |
| `timestamp` | string | yes | format: date-time |

#### `OrderKitchenTicketGenerated`

- Category: **Kitchen**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `ticketId` | string | yes | maxLength: 64 |

### Order (25)

#### `KitchenNotesUpdated`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `kitchenNotes` | string | yes | maxLength: 2000 |
| `orderId` | string | yes | format: uuid |

#### `OrderAcknowledgedByPOS`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `posDeviceId` | string | yes | maxLength: 128 |

#### `OrderCancelled`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |
| `refundTxHash` | anyOf | yes |  |

#### `OrderCompleted`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `completedAt` | string | yes | format: date-time |
| `orderId` | string | yes | format: uuid |

#### `OrderConfirmed`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `paymentTxHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `OrderCreated`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `customerId` | string | yes |  |
| `items` | array | yes |  |
| `orderId` | string | yes | format: uuid |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `total` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |

#### `OrderCustomerNotified`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `channel` | string | yes | enum: PUSH, SMS, WHATSAPP |
| `orderId` | string | yes | format: uuid |

#### `OrderDelivered`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `actualTime` | string | yes | format: date-time |
| `feedback` | string | yes | maxLength: 2000 |
| `orderId` | string | yes | format: uuid |
| `rating` | anyOf | yes |  |

#### `OrderDeliveryAssigned`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `deliveryPartnerId` | string | yes | maxLength: 128 |
| `fee` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |

#### `OrderDiscountApplied`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `code` | string | yes | maxLength: 64 |
| `orderId` | string | yes | format: uuid |

#### `OrderDiscountRemoved`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `code` | string | yes | maxLength: 64 |
| `orderId` | string | yes | format: uuid |

#### `OrderDisputed`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `claimAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `OrderItemAdded`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `item` | object | yes |  |
| `orderId` | string | yes | format: uuid |

#### `OrderItemModified`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `newQty` | integer | yes | min: 0 ; max: 1000 |
| `orderId` | string | yes | format: uuid |

#### `OrderItemRemoved`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `itemId` | string | yes | maxLength: 64 |
| `orderId` | string | yes | format: uuid |

#### `OrderNotesUpdated`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `orderNotes` | string | yes | maxLength: 2000 |

#### `OrderPaid`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `rate` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `OrderPaymentTimeout`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `timeoutSeconds` | integer | yes | min: 1 |

#### `OrderPickedUp`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `by` | string | yes | enum: CUSTOMER, PARTNER |
| `orderId` | string | yes | format: uuid |
| `timestamp` | string | yes | format: date-time |

#### `OrderPrinted`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `printerId` | string | yes | maxLength: 64 |

#### `OrderReadyForPickup`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |

#### `OrderReceiptIssued`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `receiptNumber` | string | yes | maxLength: 64 |

#### `OrderRefunded`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `OrderRepriced`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newTotal` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `oldTotal` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 256 |

#### `OrderStatusChanged`

- Category: **Order**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newStatus` | string | yes |  |
| `oldStatus` | string | yes |  |
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

### Payment (16)

#### `ChargebackRequested`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `ChargebackResolved`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `resolution` | string | yes | enum: REFUND, DENY |
| `txHash` | anyOf | yes |  |

#### `DisputeResolved`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `resolution` | string | yes | enum: REFUND, CONFIRM |
| `txHash` | anyOf | yes |  |

#### `PaymentConfirmed`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `blockNumber` | integer | yes | min: 0 |
| `confirmation` | integer | yes | min: 0 |
| `orderId` | string | yes | format: uuid |

#### `PaymentDisputed`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `claimAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `claimant` | string | yes | maxLength: 128 |
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |

#### `PaymentFailed`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `reason` | string | yes | maxLength: 512 |
| `refundInitiated` | boolean | yes |  |

#### `PaymentFeeCharged`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `feeAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `feeBps` | integer | yes | min: 0 ; max: 10000 |
| `orderId` | string | yes | format: uuid |

#### `PaymentInitiated`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `method` | string | yes | enum: BLOCKCHAIN, FIAT, NILE_FUTURE |
| `orderId` | string | yes | format: uuid |
| `rate` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |

#### `PaymentIntentCreated`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `method` | string | yes |  |
| `orderId` | string | yes | format: uuid |

#### `PaymentReceiptValidated`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |
| `valid` | boolean | yes |  |

#### `PaymentSettled`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `finalRate` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,12})?$` |
| `orderId` | string | yes | format: uuid |
| `toWallet` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `PaymentSubmittedToBlockchain`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `RefundConfirmed`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `txHash` | anyOf | yes |  |

#### `RefundInitiated`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `method` | string | yes | enum: ON_CHAIN, OFF_CHAIN |
| `orderId` | string | yes | format: uuid |

#### `SettlementExecuted`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `netAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `orderId` | string | yes | format: uuid |
| `txHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `SettlementQueued`

- Category: **Payment**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `orderId` | string | yes | format: uuid |
| `queueId` | string | yes | format: uuid |

### Restaurant (9)

#### `RestaurantCurrencyUpdated`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `effectiveAt` | string | yes | format: date-time |
| `newLocalCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `oldLocalCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantKycApproved`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `approvedAt` | string | yes | format: date-time |
| `kycProvider` | string | yes | maxLength: 128 |
| `kycReference` | string | yes | maxLength: 256 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantKycRejected`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `kycProvider` | string | yes | maxLength: 128 |
| `kycReference` | string | yes | maxLength: 256 |
| `reason` | string | yes | maxLength: 512 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantKycSubmitted`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `kycProvider` | string | yes | maxLength: 128 |
| `kycReference` | string | yes | maxLength: 256 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantOracleUpdated`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `effectiveAt` | string | yes | format: date-time |
| `newOracle` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `oldOracle` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantRateLimitUpdated`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newDailyRateLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `oldDailyRateLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `reason` | string | yes | maxLength: 512 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantRegistered`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `chainlinkOracleAddress` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `country` | string | yes | pattern: `^[A-Z]{2}$` |
| `dailyRateLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `legalName` | object | yes |  |
| `localCurrency` | string | yes | pattern: `^[A-Z]{3}$` |
| `localName` | object | yes |  |
| `ownerPhoneNumber` | string | yes | pattern: `^\+[1-9]\d{1,14}$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `taxPercentage` | number | yes | min: 0 ; max: 100 |
| `timezone` | string | yes |  |

#### `RestaurantStatusChanged`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newStatus` | string | yes | enum: ACTIVE, SUSPENDED, INACTIVE |
| `oldStatus` | string | yes | enum: ACTIVE, SUSPENDED, INACTIVE |
| `reason` | string | yes | maxLength: 512 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

#### `RestaurantTaxUpdated`

- Category: **Restaurant**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `effectiveAt` | string | yes | format: date-time |
| `newTaxPercentage` | number | yes | min: 0 ; max: 100 |
| `oldTaxPercentage` | number | yes | min: 0 ; max: 100 |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |

### Supplier (11)

#### `SupplierCreditExtended`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `creditAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `supplierId` | string | yes | maxLength: 128 |
| `terms` | string | yes | maxLength: 64 |

#### `SupplierCreditLineSet`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `creditLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `supplierId` | string | yes | maxLength: 128 |
| `terms` | string | yes | maxLength: 64 |

#### `SupplierCreditLineUpdated`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newCreditLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `oldCreditLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `supplierId` | string | yes | maxLength: 128 |

#### `SupplierCreditUsed`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `creditAmount` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `invoiceId` | string | yes | format: uuid |

#### `SupplierInvoiceCreated`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `dueDate` | string | yes | format: date |
| `invoiceId` | string | yes | format: uuid |
| `items` | array | yes |  |
| `restaurantId` | string | yes | pattern: `^0x[a-fA-F0-9]{40}$` |
| `total` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |

#### `SupplierInvoiceReceived`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `invoiceId` | string | yes | format: uuid |
| `receivedAt` | string | yes | format: date-time |

#### `SupplierInvoiceSent`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `channel` | string | yes | enum: EMAIL, WHATSAPP, SMS, API |
| `invoiceId` | string | yes | format: uuid |
| `sentAt` | string | yes | format: date-time |

#### `SupplierPaymentPartial`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amountPaid` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `invoiceId` | string | yes | format: uuid |
| `remainingBalance` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `txHash` | anyOf | yes |  |

#### `SupplierPaymentSettled`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `amountPaid` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `invoiceId` | string | yes | format: uuid |
| `txHash` | anyOf | yes |  |

#### `SupplierProofOfDeliveryAttached`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `invoiceId` | string | yes | format: uuid |
| `proofOfDeliveryHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |

#### `SupplierRegistered`

- Category: **Supplier**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `creditLimit` | string | yes | pattern: `^(0|[1-9]\d*)(\.\d{1,6})?$` |
| `location` | string | yes | maxLength: 256 |
| `name` | string | yes | maxLength: 256 |
| `supplierId` | string | yes | maxLength: 128 |

### Sync (6)

#### `BlockchainReorgDetected`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `chainId` | integer | yes | min: 1 |
| `fromBlock` | integer | yes | min: 0 |
| `timestamp` | string | yes | format: date-time |
| `toBlock` | integer | yes | min: 0 |

#### `SyncCompleted`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `downloadedEvents` | integer | yes | min: 0 |
| `producerId` | string | yes | maxLength: 128 |
| `streamId` | string | yes | maxLength: 128 |
| `timestamp` | string | yes | format: date-time |
| `uploadedEvents` | integer | yes | min: 0 |

#### `SyncConflictDetected`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `conflictType` | string | yes | maxLength: 64 |
| `entityId` | string | yes | maxLength: 128 |
| `streamId` | string | yes | maxLength: 128 |
| `timestamp` | string | yes | format: date-time |

#### `SyncIntegrityFailed`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `details` | string | yes | maxLength: 2000 |
| `streamId` | string | yes | maxLength: 128 |
| `timestamp` | string | yes | format: date-time |

#### `SyncIntegrityVerified`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `chainHash` | string | yes | pattern: `^0x[a-fA-F0-9]{64}$` |
| `streamId` | string | yes | maxLength: 128 |
| `timestamp` | string | yes | format: date-time |

#### `SyncStarted`

- Category: **Sync**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `producerId` | string | yes | maxLength: 128 |
| `streamId` | string | yes | maxLength: 128 |
| `timestamp` | string | yes | format: date-time |

### System (5)

#### `ApiKeyCreated`

- Category: **System**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `keyId` | string | yes | format: uuid |
| `owner` | string | yes | maxLength: 128 |
| `scopes` | array | yes |  |

#### `ApiKeyRevoked`

- Category: **System**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `keyId` | string | yes | format: uuid |
| `revokedAt` | string | yes | format: date-time |

#### `ProtocolUpgraded`

- Category: **System**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `newVersion` | string | yes |  |
| `oldVersion` | string | yes |  |
| `timestamp` | string | yes | format: date-time |

#### `WebhookDeliveryAttempted`

- Category: **System**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `statusCode` | integer | yes | min: 0 |
| `targetUrl` | string | yes | format: uri |
| `webhookId` | string | yes | format: uuid |

#### `WebhookDeliveryFailed`

- Category: **System**
- Version: `0.1`

**Payload schema:**

| Field | Type | Required | Constraints / Notes |
|---|---:|---:|---|
| `error` | string | yes | maxLength: 512 |
| `webhookId` | string | yes | format: uuid |

---

## Appendix C — State machines (normative YAML)

```yaml
version: "0.1"
lastUpdated: "2025-12-22"

# NOTE:
# - Order.status in the entity model represents fulfillment status.
# - Payment and dispute handling are modeled in separate state machines.
# - A system implementation may persist these states directly OR derive them from the event log.

stateMachines:
  order_fulfillment:
    entity: "Order"
    field: "status"
    initialState: "CREATED"
    terminalStates: ["CANCELLED", "DELIVERED", "PICKED_UP"]
    states:
      CREATED:
        on:
          KITCHEN_CONFIRMED:
            to: "CONFIRMED"
            guards:
              - "payment.status == CONFIRMED OR order.paymentMethod != BLOCKCHAIN" # fiat / future methods can be 'paid' off-chain
            emitEvents: ["OrderConfirmed", "KitchenOrderReceived"]
          CANCELLED_BY_CUSTOMER:
            to: "CANCELLED"
            emitEvents: ["OrderCancelled"]
          CANCELLED_BY_RESTAURANT:
            to: "CANCELLED"
            emitEvents: ["OrderCancelled"]
      CONFIRMED:
        on:
          COOKING_STARTED:
            to: "COOKING"
            emitEvents: ["KitchenStartCooking"]
          CANCELLED_BY_RESTAURANT:
            to: "CANCELLED"
            emitEvents: ["OrderCancelled"]
      COOKING:
        on:
          ORDER_READY:
            to: "READY"
            emitEvents: ["KitchenOrderReady", "OrderReadyForPickup"]
          OUT_OF_STOCK:
            to: "COOKING"
            emitEvents: ["KitchenOutOfStock"]
      READY:
        on:
          DELIVERY_ASSIGNED:
            to: "READY"
            emitEvents: ["OrderDeliveryAssigned", "DeliveryPartnerAssigned"]
          PICKED_UP_BY_CUSTOMER:
            to: "PICKED_UP"
            emitEvents: ["OrderDelivered"]
          PICKED_UP_BY_PARTNER:
            to: "PICKED_UP"
            emitEvents: ["DeliveryStarted"]
      PICKED_UP:
        on:
          DELIVERED:
            to: "DELIVERED"
            emitEvents: ["DeliveryCompleted", "OrderDelivered"]
          DELIVERY_FAILED:
            to: "PICKED_UP"
            emitEvents: ["DeliveryFailed"]
      DELIVERED:
        on:
          RATE:
            to: "DELIVERED"
            emitEvents: ["DeliveryRated"]
      CANCELLED:
        on:
          REFUND_SETTLED:
            to: "CANCELLED"
            emitEvents: ["OrderRefunded"]

  payment:
    entity: "Transaction"
    field: "status"
    initialState: "PENDING"
    terminalStates: ["SETTLED", "REFUNDED"]
    states:
      PENDING:
        on:
          TX_SUBMITTED:
            to: "PENDING"
            emitEvents: ["PaymentSubmittedToBlockchain"]
          TX_CONFIRMED:
            to: "CONFIRMED"
            emitEvents: ["PaymentConfirmed"]
          TX_DROPPED_OR_REVERTED:
            to: "DISPUTED"
            emitEvents: ["PaymentFailed"]
      CONFIRMED:
        on:
          SETTLEMENT_EXECUTED:
            to: "SETTLED"
            emitEvents: ["PaymentSettled"]
          DISPUTE_OPENED:
            to: "DISPUTED"
            emitEvents: ["PaymentDisputed"]
      SETTLED:
        on:
          DISPUTE_OPENED:
            to: "DISPUTED"
            emitEvents: ["PaymentDisputed"]
      DISPUTED:
        on:
          DISPUTE_RESOLVED_REFUND:
            to: "REFUNDED"
            emitEvents: ["DisputeResolved", "OrderRefunded"]
          DISPUTE_RESOLVED_CONFIRM:
            to: "SETTLED"
            emitEvents: ["DisputeResolved"]
      REFUNDED:
        on: {}

  delivery:
    entity: "Delivery"
    field: "status"
    initialState: "ASSIGNED"
    terminalStates: ["DELIVERED", "CANCELLED"]
    states:
      ASSIGNED:
        on:
          PICKED_UP:
            to: "PICKED_UP"
            emitEvents: ["DeliveryStarted"]
          CANCELLED:
            to: "CANCELLED"
            emitEvents: ["DeliveryFailed"]
      PICKED_UP:
        on:
          IN_TRANSIT:
            to: "IN_TRANSIT"
            emitEvents: ["DeliveryInProgress"]
          CANCELLED:
            to: "CANCELLED"
            emitEvents: ["DeliveryFailed"]
      IN_TRANSIT:
        on:
          DELIVERED:
            to: "DELIVERED"
            emitEvents: ["DeliveryCompleted"]
          CANCELLED:
            to: "CANCELLED"
            emitEvents: ["DeliveryFailed"]
      DELIVERED:
        on:
          RATED:
            to: "DELIVERED"
            emitEvents: ["DeliveryRated"]
      CANCELLED:
        on: {}

  inventory_quantity:
    entity: "InventoryItem"
    field: "qty"
    # Inventory isn't a classic finite enum state; the "state" is derived from quantities.
    derivedStates:
      OK: "qty > minQty"
      LOW: "qty <= minQty AND qty > 0"
      OUT: "qty == 0"
    transitions:
      - name: "decrement_on_order"
        from: ["OK", "LOW"]
        to: ["OK", "LOW", "OUT"]
        trigger: "InventoryUpdated"
        guard: "reason == ORDER_CONSUMPTION AND newQty == oldQty - delta"
      - name: "restock"
        from: ["LOW", "OUT"]
        to: ["OK", "LOW"]
        trigger: "RestockingReceived"
        guard: "actualQty > 0"
      - name: "manual_adjustment"
        from: ["OK", "LOW", "OUT"]
        to: ["OK", "LOW", "OUT"]
        trigger: "InventoryUpdated"
        guard: "reason in {AUDIT_ADJUSTMENT, SPOILAGE, RETURN_TO_STOCK}"

```
---

## Appendix D — Smart contract interfaces (normative Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NileLink Protocol v0.1 — Smart Contract Interfaces
/// @notice ABI-compatible interfaces for the NileLink on-chain components.
/// @dev These are interfaces only (no implementation). Implementations MUST emit the events defined here.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function decimals() external view returns (uint8);
}

library NileLinkTypes {
    enum RestaurantStatus {
        ACTIVE,
        SUSPENDED,
        INACTIVE
    }

    enum PaymentMethod {
        BLOCKCHAIN,
        FIAT,
        NILE_FUTURE
    }

    enum TxStatus {
        PENDING,
        CONFIRMED,
        SETTLED,
        DISPUTED,
        REFUNDED
    }

    enum DisputeResolution {
        NONE,
        REFUND,
        CONFIRM
    }

    struct RestaurantConfig {
        bytes32 ownerPhoneHash; // E.164 phone, hashed off-chain (e.g., keccak256)
        bytes32 legalNameHash; // hash of legalName (Arabic+English allowed)
        bytes32 localNameHash; // hash of localName
        bytes2 country; // ISO-3166 alpha-2
        bytes3 localCurrency; // ISO-4217 alpha-3
        uint256 dailyRateLimitUsd6; // USD limit with 6 decimals
        int32 timezoneOffsetMinutes; // e.g., Beirut = +180
        uint16 taxBps; // 1000 = 10.00%
        address chainlinkOracle;
        RestaurantStatus status;
    }

    struct RestaurantRecord {
        address restaurant;
        RestaurantConfig config;
        uint64 createdAt;
        uint64 lastModified;
    }

    /// @dev UUIDv4 represented as bytes16.
    struct OrderRef {
        bytes16 orderId;
        address restaurant;
        address customer;
    }

    struct RateSnapshot {
        bytes2 country;
        bytes3 localCurrency;
        uint256 rate; // local per 1 USD, scaled by 1e8 (Chainlink style)
        uint64 timestamp;
        address oracleSource;
    }

    struct Dispute {
        bytes16 orderId;
        address claimant;
        uint256 claimAmountUsd6;
        uint64 openedAt;
        uint64 deadlineAt;
        DisputeResolution resolution;
        bytes32 reasonHash;
    }

    struct CreditLine {
        address restaurant;
        address supplier;
        uint256 limitUsd6;
        uint256 usedUsd6;
        uint64 updatedAt;
        bytes32 termsHash; // COD/Net-30/etc off-chain terms hash
    }
}

/// @notice Restaurant KYC, rate limits, status.
interface IRestaurantRegistry {
    event RestaurantRegistered(
        address indexed restaurant,
        bytes2 indexed country,
        bytes3 indexed localCurrency,
        uint256 dailyRateLimitUsd6,
        address chainlinkOracle,
        uint64 timestamp
    );

    event RestaurantConfigUpdated(
        address indexed restaurant,
        uint256 dailyRateLimitUsd6,
        address chainlinkOracle,
        NileLinkTypes.RestaurantStatus status,
        uint64 timestamp
    );

    function registerRestaurant(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;

    function updateRestaurantConfig(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;

    function getRestaurant(address restaurant) external view returns (NileLinkTypes.RestaurantRecord memory);

    function isActive(address restaurant) external view returns (bool);
}

/// @notice Order creation, payment validation, settlement.
interface IOrderSettlement {
    event PaymentIntentCreated(
        bytes16 indexed orderId,
        address indexed restaurant,
        address indexed customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method,
        uint64 timestamp
    );

    event PaymentReceived(
        bytes16 indexed orderId,
        address indexed payer,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event PaymentSettled(
        bytes16 indexed orderId,
        address indexed restaurant,
        uint256 grossUsd6,
        uint256 feeUsd6,
        uint256 netUsd6,
        uint64 timestamp
    );

    event PaymentRefunded(
        bytes16 indexed orderId,
        address indexed to,
        uint256 amountUsd6,
        uint64 timestamp
    );

    function usdc() external view returns (IERC20);

    function protocolFeeBps() external view returns (uint16);

    function createPaymentIntent(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method
    ) external;

    /// @notice Collects funds from `msg.sender` via USDC transferFrom.
    function pay(bytes16 orderId, uint256 amountUsd6) external;

    /// @notice Settles funds to restaurant and fee recipient.
    function settle(bytes16 orderId) external;

    /// @notice Refunds customer. Implementations MUST enforce dispute/authorization rules.
    function refund(bytes16 orderId, address to, uint256 amountUsd6) external;
}

/// @notice Real-time rate management via Chainlink.
interface ICurrencyExchange {
    event ExchangeRateSnapshotted(
        address indexed restaurant,
        bytes3 indexed localCurrency,
        uint256 rate,
        address indexed oracleSource,
        uint64 timestamp
    );

    event OracleUpdated(bytes3 indexed localCurrency, address indexed oracle, uint64 timestamp);

    function setOracle(bytes3 localCurrency, address oracle) external;

    /// @notice Snapshot a rate used for an order/settlement. Must be deterministic and auditable.
    function snapshotRate(address restaurant, bytes3 localCurrency) external returns (NileLinkTypes.RateSnapshot memory);

    function getLatestRate(bytes3 localCurrency) external view returns (uint256 rate, address oracle, uint64 updatedAt);
}

/// @notice 3-day auto-settle, manual override.
interface IDisputeResolution {
    event DisputeOpened(
        bytes16 indexed orderId,
        address indexed claimant,
        uint256 claimAmountUsd6,
        uint64 openedAt,
        uint64 deadlineAt,
        bytes32 reasonHash
    );

    event DisputeResolved(
        bytes16 indexed orderId,
        NileLinkTypes.DisputeResolution resolution,
        uint256 refundAmountUsd6,
        uint64 resolvedAt
    );

    function openDispute(bytes16 orderId, uint256 claimAmountUsd6, bytes32 reasonHash) external;

    /// @notice Resolve dispute by an authorized role.
    function resolveDispute(bytes16 orderId, NileLinkTypes.DisputeResolution resolution, uint256 refundAmountUsd6) external;

    /// @notice Auto-settle after deadline according to policy.
    function autoSettle(bytes16 orderId) external;

    function getDispute(bytes16 orderId) external view returns (NileLinkTypes.Dispute memory);
}

/// @notice Anomaly detection logic.
interface IFraudDetection {
    event AnomalyFlagged(
        bytes32 indexed subject,
        bytes32 indexed anomalyType,
        uint8 severity,
        bytes32 detailsHash,
        uint64 timestamp
    );

    event TransactionBlocked(bytes32 indexed txRef, bytes32 reasonHash, uint64 timestamp);

    function flagAnomaly(bytes32 subject, bytes32 anomalyType, uint8 severity, bytes32 detailsHash) external;

    function blockTransaction(bytes32 txRef, bytes32 reasonHash) external;

    function isBlocked(bytes32 txRef) external view returns (bool);
}

/// @notice Multi-restaurant portfolio management.
interface IInvestorVault {
    event InvestmentDeposited(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event InvestmentWithdrawn(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event DividendClaimed(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    function deposit(address restaurant, uint256 amountUsd6) external;

    function withdraw(address restaurant, uint256 amountUsd6) external;

    function claimDividend(address restaurant) external returns (uint256 claimedUsd6);

    function positionOf(address investor, address restaurant) external view returns (uint256 investedUsd6, uint256 ownershipBps);
}

/// @notice Credit line tracking and enforcement.
interface ISupplierCredit {
    event CreditLineSet(
        address indexed restaurant,
        address indexed supplier,
        uint256 limitUsd6,
        bytes32 termsHash,
        uint64 timestamp
    );

    event CreditUsed(
        address indexed restaurant,
        address indexed supplier,
        bytes16 indexed invoiceId,
        uint256 creditAmountUsd6,
        uint64 timestamp
    );

    event CreditRepaid(
        address indexed restaurant,
        address indexed supplier,
        bytes16 indexed invoiceId,
        uint256 repaidAmountUsd6,
        uint64 timestamp
    );

    function setCreditLine(address restaurant, address supplier, uint256 limitUsd6, bytes32 termsHash) external;

    function useCredit(address restaurant, address supplier, bytes16 invoiceId, uint256 creditAmountUsd6) external;

    function repay(address restaurant, address supplier, bytes16 invoiceId, uint256 repaidAmountUsd6) external;

    function getCreditLine(address restaurant, address supplier) external view returns (NileLinkTypes.CreditLine memory);
}

```
---

## Appendix E — Regional compliance configuration (normative YAML)

```yaml
version: "0.1"
lastUpdated: "2025-12-22"

# Country rules are configuration inputs for NileLink services and smart contracts.
# The system MUST treat this file as a source-of-truth baseline and allow overrides
# per-restaurant when permitted by local regulation.

countries:
  Lebanon:
    iso3166: "LB"
    localCurrency: "LBP"
    timezoneDefault: "Asia/Beirut"
    vatOrSalesTax:
      name: "VAT (indicative)"
      defaultPercentage: 10.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "BDL-advisory"
      kyc:
        required: false
        recommendedDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
      fiat:
        supported: true
        bankIntegrations: ["BLOM", "BankAudi", "AUB"]
    dataPrivacy:
      baseline: ["GDPR-like", "Lebanese privacy laws"]
      dataResidency:
        required: false

  Egypt:
    iso3166: "EG"
    localCurrency: "EGP"
    timezoneDefault: "Africa/Cairo"
    vatOrSalesTax:
      name: "VAT"
      defaultPercentage: 14.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "CBE-advisory"
      kyc:
        required: false
        recommendedDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      fiat:
        supported: true
        bankIntegrations: ["CIB", "ADIB"]
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
    dataPrivacy:
      baseline: ["GDPR-like", "Egypt data protection law"]
      dataResidency:
        required: false

  Jordan:
    iso3166: "JO"
    localCurrency: "JOD"
    timezoneDefault: "Asia/Amman"
    vatOrSalesTax:
      name: "Sales tax (indicative)"
      defaultPercentage: 16.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "CBJ-advisory"
      kyc:
        required: false
        recommendedDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      fiat:
        supported: true
        bankIntegrations: ["ArabBank", "CairoAmmanBank"]
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
    dataPrivacy:
      baseline: ["GDPR-like", "Jordan Personal Data Protection Law (PDPL)"]
      dataResidency:
        required: false

  SaudiArabia:
    iso3166: "SA"
    localCurrency: "SAR"
    timezoneDefault: "Asia/Riyadh"
    vatOrSalesTax:
      name: "VAT"
      defaultPercentage: 15.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "SAMA / ZATCA-advisory"
      kyc:
        required: true
        requiredDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      fiat:
        supported: true
        bankIntegrations: ["AlRajhi", "SNB", "RiyadBank"]
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
    dataPrivacy:
      baseline: ["Saudi PDPL"]
      dataResidency:
        required: true

  UnitedArabEmirates:
    iso3166: "AE"
    localCurrency: "AED"
    timezoneDefault: "Asia/Dubai"
    vatOrSalesTax:
      name: "VAT"
      defaultPercentage: 5.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "UAE Central Bank / VARA (context dependent)"
      kyc:
        required: true
        requiredDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      fiat:
        supported: true
        bankIntegrations: ["EmiratesNBD", "ADCB", "Mashreq"]
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
    dataPrivacy:
      baseline: ["UAE PDPL"]
      dataResidency:
        required: false

  Qatar:
    iso3166: "QA"
    localCurrency: "QAR"
    timezoneDefault: "Asia/Qatar"
    vatOrSalesTax:
      name: "VAT (planned / indicative)"
      defaultPercentage: 0.0
      rounding:
        mode: "HALF_UP"
        scale: 2
    financialCompliance:
      regulatorContext: "QCB-advisory"
      kyc:
        required: true
        requiredDailyVolumeUsd: 5000
      aml:
        reportThresholdUsd: 10000
        enhancedDueDiligenceThresholdUsd: 20000
      chargeback:
        disputeWindowDays: 30
        autoSettleDays: 3
    payments:
      fiat:
        supported: true
        bankIntegrations: ["QNB", "CBQ"]
      onChain:
        network: "Polygon"
        stablecoin: "USDC"
    dataPrivacy:
      baseline: ["GDPR-like", "Qatar data protection law"]
      dataResidency:
        required: false

```

# NileLink Universal OS: AI-First Decentralized Commerce Platform

## Developer Technical Specification v2.0

---

### 1️⃣ SYSTEM OVERVIEW

**Goal**: Build a globally scalable, decentralized POS platform where business logic and data are sovereign to the user.
**Supported Business Types**:

- **Supermarket**: High-velocity barcode scanning, behavioral security alerts.
- **Restaurant**: Ingredient-level tracking, KDS ticket routing.
- **Café**: Quick-service workflows, loyalty/ingredient mapping.
- **Retail**: SKU-based inventory, multi-channel stock sync.

**Dynamic Behavior**: The system detects the `businessType` from the Node Profile and auto-activates context-specific modules (e.g., KDS for restaurants, Theft-Detection HUD for supermarkets).

---

### 2️⃣ DECENTRALIZED ARCHITECTURE

**Client → AI → Data → Notification Flow**

- **Auth Layer (Centralized)**: Firebase Auth (Phone/OTP/PIN/Email).
- **Core Orchestrator**: Local-first runtime managing module lifecycle.
- **Data Persistence**:
  - **Local**: IndexedDB (Primary Store).
  - **Sync**: IPFS (Catalog/Metadata) + The Graph (Auditable Ledger Indexing).
- **AI Layer**: Local stream processor (using technical hooks to external LLM/Analytical APIs for complex inferencing).

#### MODULE DEFINITIONS

1. **Auth (Firebase)**: Identity verification ONLY.
2. **POS Core Engine**: Transaction lifecycle & payment interface.
3. **RBAC Engine**: Cryptographically signed permission validation.
4. **Inventory Engine**: Real-time asset reserves & mapping.
5. **Payroll Engine**: Attendance, shift-logic, and labor ROI.
6. **Supplier Engine**: Procurement routing & pricing oracle.
7. **AI Layer**: Cognitive inferencing & anomaly detection.
8. **Alert Engine**: Event-driven notification bus.
9. **Security Module**: Perimeter monitoring (Supermarket only).

---

### 3️⃣ ROLE-BASED ACCESS CONTROL (RBAC)

Permissions are enforced at the module execution level.

| Role | Permissions (R/W/X) | Terminal Access | Key Restriction |
| :--- | :--- | :--- | :--- |
| **Owner** | FULL (R/W/X) | Global Terminals | None |
| **Manager** | R/W (Operational) | Node Terminals | Restricted Financial Withdrawals |
| **Cashier** | R/W (Sales only) | Assigned POS Only | No Inventory Overrides |
| **Kitchen** | R/X (Orders only) | KDS Display Only | No Price Visibility |
| **Accountant** | R (Auditing only) | Management HUD | No Transaction Execution |
| **Security** | R (Surveillance) | Monitoring Terminal | Supermarket Type Lock |

**Evaluation**: Every sensitive function call checks a `signed_claims` object stored in the local session, refreshed via Firebase Auth tokens but validated against the Decentralized RBAC model.

---

### 4️⃣ POS CORE ENGINE WORKFLOW

1. **Initialize**: Load local catalogs (IPFS) and cached pricing.
2. **Input Channel**:
    - **Scanner (Supermarket)**: Continuous stream processing for GS1/UPC.
    - **Menu (Hospitality)**: Tiered category navigation.
3. **Logic**: Tax calculation → Discount evaluation → Inventory check.
4. **Settlement**: Local-first balance update → Anchor to Blockchain → Print Ledger.
5. **Hooks**: Fraud detector scans for "Manual Overrides" or unusual "No Sales".

---

### 5️⃣ PAYROLL ENGINE (TECHNICAL)

**Data Model**:

- `ShiftLog`: `{userId, clockIn, clockOut, breakDuration, deviceSignature}`
- `PayrollRecord`: `{userId, period, regularHours, otHours, baseRate, bonus, deductions}`

**Flow**:

1. Terminal Login (PIN) triggers `clock-in` event.
2. AI analyzes historical labor costs vs. sales to suggest shift termination if ROI < Threshold.
3. Monthly reconciliation aggregates shifts into `PayrollReport`.

---

### 6️⃣ INVENTORY ENGINE: INGREDIENT MAPPING

**Requirement**: Mandatory linking of Product to Ingredient assets for Food & Beverage.

- **Restaurant Rule**: Selling `Classic Burger` triggers:
  - -1 Bun (SKU-Inventory)
  - -150g Patty (Ingredient-Inventory)
  - -20g Sauce (Volume-Inventory)
- **AI Role**: Predicts stockout based on moving average (e.g., "7-day exhaustion likely on Friday").

---

### 7️⃣ SUPPLIER ENGINE WORKFLOW

1. **Registry**: Suppliers linked to specific Inventory IDs.
2. **Trigger**: AI generates a `ReplenishmentProposal`.
3. **Approval**: Admin reviews proposal (Price/Quality/Lead Time).
4. **Order**: Direct API/Email trigger to Supplier. Reorder status becomes `PENDING_SETTLEMENT`.

---

### 8️⃣ AI INTELLIGENCE LAYER

AI is an "Observer" in the event bus.

- **Inputs**: Real-time sales stream, Staff clock-ins, Inventory levels.
- **Decision Rule**: `If (Refund_Volume > 10% AND User_Role == 'Cashier') -> Trigger(Alert_Manager)`.
- **Human-in-the-loop**: Reorders and Staff suspensions MUST have Owner authorization.

---

### 9️⃣ SUPERMARKET SECURITY HUD

- **Role**: `SECURITY_NODE`.
- **Alerts**: Non-graphic detection of "Non-Scan Exits" or "High-Value Item Removal".
- **Monitoring**: Centralized view of all checkout terminals with "Risk Score" coloring.

---

### 🔟 DATA MODELS (SCHEMAS)

```typescript
interface NodeProfile { id: string; bizType: 'SM' | 'RT' | 'CF' | 'RE'; location: string; }
interface InventoryItem { id: string; type: 'SKU' | 'ING'; qty: number; min: number; supplierId: string; }
interface Transaction { id: string; items: InvoiceItem[]; total: number; method: string; ts: number; }
interface StaffShift { uid: string; start: number; end?: number; }
```

---

### 1️⃣1️⃣ RISKS & MITIGATIONS

- **Network Failure**: Solved by **Local-First PouchDB** synchronization.
- **Data Conflict**: Solved by **CRDT (Conflict-free Replicated Data Types)** logic in the sync service.
- **Permission Abuse**: Solved by mandatory **PIN + Signed Metadata** for every override.

---

**STATUS**: DEV-READY. Implementation can begin immediately following this specification.

# NileLink Production Implementation Roadmap

## Execution Steps for Universal AI-First POS

---

### Phase 1: Institutional Foundation & RBAC (Current)

1. [x] **Design Architecture**: Decentralized logic per specification.
2. [x] **Identity Lock**: Firebase integration for login/OTP.
3. [ ] **Dynamic Business Logic**: Implement a global `businessType` provider that switches UI/Modules (Supermarket vs. Restaurant).
4. [ ] **Signed RBAC Engine**: Create a service to sign and verify role-based claims locally.

### Phase 2: Payroll & Human Capital Module (Critical Missing Feature)

1. [ ] **Attendance Persistence**: Implement Local Ledger hooks for PIN-based clock-in/out.
2. [ ] **Salary Formulas**: Logic for hourly vs. shift-based pay.
3. [ ] **Privacy-First Data**: Zero-knowledge storage of sensitive payroll data.
4. [ ] **AI Cost Monitor**: Integrate analysis logic to flag high labor costs relative to live sales.

### Phase 3: Advanced Inventory & Ingredient Mapping

1. [ ] **Asset Schema Overhaul**: Support for raw ingredients as sub-assets of menu items.
2. [ ] **Real-Time Deduction Chain**: Logic that subtracts multiple ingredients per "1 Item Sold" event.
3. [ ] **Supplier Linkage**: Map every inventory ID to a primary and secondary supplier.
4. [ ] **Smart Reorders**: AI-generated replenishment lists with manual "Commit" authorization.

### Phase 4: Supermarket Logic & Security Layer

1. [ ] **High-Velocity Scanner HUD**: A dedicated UI route for supermarket checkout.
2. [ ] **Anomaly HUD**: A dashboard for security personnel with AI-based behavior detection logs.
3. [ ] **Perimeter Sync**: Connect multiple supermarket terminals to a single local sync node.

### Phase 5: AI Intelligence & Notification Protocol

1. [ ] **Insight Generator**: Daily automated reports on profitability.
2. [ ] **Alert Escalation**: Rule-based notification system (Cashier -> Manager -> Owner).
3. [ ] **Fraud Shield**: Pattern recognition for unusual transaction voids or discounts.

---

### Step-by-Step Immediate Execution

1. **Initialize PayrollEngine**: Create the core logic for attendance and calculations.
2. **Initialize SupplierEngine**: Build the data model for procurement.
3. **Upgrade Dashboard**: Add sections for Payroll and Supplier management.
4. **Integrate Supermarket Detection Logic**: Add terminal behavior for retail-specific nodes.

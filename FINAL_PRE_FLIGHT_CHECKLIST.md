# FINAL PRE-FLIGHT CHECKLIST

# Date: 2026-01-28

# Status: READY FOR VERIFICATION

## 1. Core Modules Integration (Phase 1 & 2)

- [x] **Payroll Engine**: Active attendance tracking and shift persistence.
  - [x] Shift `upsert` to Local Ledger.
  - [x] Real-time hydration in `PayrollView`.
  - [x] UI displays live burn rate and active staff.
- [x] **Procurement Engine**: AI-driven reorder logic.
  - [x] `generateReorderRecommendations` wired to `ProcurementView`.
  - [x] "Auto-Order" button triggers `createProcurementOrder`.
  - [x] Fallback to 'DEV_INTERNAL_NODE' ensures dev visibility.
- [x] **Dashboard Integration**:
  - [x] `PayrollView` tab active and real.
  - [x] `ProcurementView` tab active and real.
  - [x] Navigation updated with new icons.

## 2. Institutional Design & UI Hardening

- [x] **Color Contrast**: Fixed "Add Resource" button (Black text on Cyan).
- [x] **Typography**: Standardized on 'Outfit' with uppercase/black weight.
- [x] **Error Boundaries**: Fixed `MessageSquare` crash in `POSErrorBoundary`.
- [x] **Page Crashes**: Fixed `Cognitive Assistant` tab crash (missing imports).

## 3. Data Persistence (Decentralized)

- [x] **Inventory**: "Add Resource" commits to IndexedDB (`LocalLedger`) via `ProductEngine`.
- [x] **Staff**: Staff creation commits to `LocalLedger`.
- [x] **Auth**: Firebase only used for Identity/Sign-in. Business logic is client-side.

## 4. Pending / User Verification Tasks

- [ ] **Data Seed**: The engines start empty. User must:
    1. Go to "Personnel OS" -> "Recruit Staff" to populate `PayrollView`.
    2. Go to "Asset Inventory" -> "Add Resource" to populate `ProcurementView` (once stock drops).
    3. Simulate sales to trigger "Low Stock" for AI recommendations.
- [ ] **Supplier Data**: currently uses mock list in UI for *Display*.
  - *Action*: User needs to add "Onboard Supplier" feature or seed `SupplierEngine`.

## 5. Next Immediate Actions

- Verify "Supermarket" vs "Restaurant" toggle in `Settings` if applicable.
- Run full end-to-end test: Login -> Add Staff -> Clock In -> Add Product -> Sell Product -> Check Reorder.

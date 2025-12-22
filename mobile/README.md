# NileLink Mobile (POS + Customer) — v0.1 scaffold

This repo currently contains the **smart contracts** at the root, and a new **mobile workspace** under `./mobile`.

## Structure

- `mobile/apps/pos` — POS (cashier / restaurant staff) React Native app scaffold
- `mobile/apps/customer` — Customer ordering React Native app scaffold
- `mobile/packages/shared` — shared domain types + i18n primitives
- `mobile/packages/sqlite` — SQLite schema + migrations (offline-first)
- `mobile/packages/sync-engine` — event-sourced offline sync engine (merge + canonical ordering + redux-saga orchestrator)
- `mobile/packages/blockchain` — wallet abstraction (Magic + ethers integration placeholder)

## Offline-first model (summary)

- All writes are represented as **immutable events** appended to `event_log`.
- Materialized tables (`orders`, `inventory`, etc.) are rebuilt from the ordered event stream.
- Sync runs as:
  1) load local events
  2) pull remote events after local vector clock
  3) `mergeEventSets()` + `sortCanonical()`
  4) validate, persist
  5) push pending local events

See root `Sync_Algorithm.md` for the full protocol spec.

## Development (mobile)

From the repository root:

```bash
cd mobile
npm install
```

Then run the app using your preferred RN workflow (React Native CLI / Xcode / Android Studio). This ticket adds **code + structure**; native project files (ios/android) can be generated with `npx react-native init` or integrated into an existing mobile build pipeline.

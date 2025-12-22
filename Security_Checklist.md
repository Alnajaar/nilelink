# NileLink Protocol v0.1 — Security Checklist

Version: **0.1**  
Last updated: **2025-12-22**

This checklist is written as implementable requirements. Each item is phrased as a **MUST/SHOULD** statement and can be verified in code review, automated tests, or security audits.

## 1) Cryptography & Key Management

### 1.1 Mobile / client keys
- **MUST** generate wallet private keys on-device using a cryptographically secure RNG.
- **MUST NOT** transmit private keys, raw seeds, or unencrypted key material over the network.
- **MUST** protect private keys with OS secure storage (Keychain/Keystore) or a secure enclave when available.
- **MUST** require user presence (biometric or device passcode) for key usage when biometrics are enabled.
- **MUST** support an encrypted backup format for recovery seed export; encryption **MUST** be AES-256-GCM or XChaCha20-Poly1305.
- **SHOULD** support hardware wallets via WalletConnect; **MUST** treat hardware wallets as the signer of record.

### 1.2 Server keys
- **MUST** store server signing keys (JWT RS256, webhook signing keys) in a dedicated secret manager.
- **MUST** rotate server keys at least every 180 days (or immediately after compromise).
- **MUST** implement key-versioning and accept N-1 key versions during rotation.

## 2) Data at Rest

### 2.1 Local storage (offline-first)
- **MUST** encrypt SQLite databases with SQLCipher using AES-256.
- **MUST** derive the SQLCipher key from OS secure storage + user authentication state.
- **MUST** minimize PII stored offline; only store what is required for offline operation.

### 2.2 Server storage
- **MUST** encrypt disks at rest (cloud-managed encryption is acceptable).
- **MUST** encrypt high-risk PII columns (phone numbers, legal names) using envelope encryption.
- **MUST** use deterministic encryption only when strictly required for lookups; otherwise use randomized encryption.

## 3) Data in Transit

- **MUST** use TLS 1.3 for all API traffic.
- **MUST** reject plaintext HTTP.
- **MUST** implement certificate pinning on mobile clients.
- **MUST** sign all server-to-server webhooks with an HMAC secret or asymmetric signature.

## 4) Identity, Authentication, Authorization

### 4.1 Sign-In with Ethereum (EIP-4361)
- **MUST** validate SIWE message fields: domain, nonce, issuedAt, chainId, address.
- **MUST** bind the SIWE session to the authenticated wallet address.
- **MUST** enforce nonce single-use with an expiration window (≤ 10 minutes).

### 4.2 Roles & access control
- **MUST** implement RBAC with explicit roles (e.g., OWNER, MANAGER, CASHIER, KITCHEN, DELIVERY_ADMIN, INVESTOR).
- **MUST** authorize every API request on: (a) authenticated principal, (b) restaurant scope, (c) permitted action.
- **MUST** prevent horizontal privilege escalation (one restaurant cannot read another restaurant’s orders).

## 5) Event Integrity & Auditability

- **MUST** treat events as immutable.
- **MUST** include `eventId`, `occurredAt`, `actor`, `restaurantId` (when applicable), and `schemaVersion`.
- **MUST** compute an event hash: `eventHash = SHA-256(canonical_json(event))`.
- **MUST** store an append-only audit log of all events.
- **SHOULD** build a hash chain per restaurant stream: `chainHash[n] = SHA-256(chainHash[n-1] || eventHash[n])`.

## 6) Payment Security (USDC on Polygon)

- **MUST** validate Polygon transaction receipts for:
  - expected token contract (USDC address per chain)
  - expected recipient (restaurant wallet)
  - expected amount (within tolerated rounding bounds)
  - confirmation depth (e.g., ≥ 20 blocks on mainnet; configurable)
- **MUST** prevent replay by binding a payment intent to `(orderId, amount, chainId, sender)`.
- **MUST** implement daily rate-limits per restaurant at the protocol layer.

## 7) Smart Contract Security Requirements

- **MUST** use Solidity `^0.8.x` to inherit overflow/underflow checks.
- **MUST** use reentrancy guards on external functions that transfer funds.
- **MUST** validate all external inputs (non-zero addresses, bounds checks).
- **MUST** emit events for every state-changing action.
- **MUST** gate privileged functions behind `onlyOwner`/`onlyRole`.
- **MUST** use pausability for emergency response.
- **SHOULD** implement upgradeability only if required; if upgradeable, **MUST** use transparent proxy patterns and strict admin controls.

## 8) Fraud & Abuse Controls

- **MUST** implement anomaly detection rules for:
  - unusually high order totals
  - rapid repeated refunds
  - address/phone churn
  - rate limit exceed attempts
- **MUST** implement a manual review queue for flagged entities.
- **MUST** support transaction blocking (soft-block on backend + on-chain denylist when applicable).

## 9) Privacy & Compliance Controls

- **MUST** implement user data deletion requests (GDPR-like) by:
  - deleting or irreversibly anonymizing PII
  - preserving financial audit trails with PII removed
- **MUST** maintain a data retention schedule with minimum-necessary retention periods.
- **MUST** ensure that immutable events do not store raw PII when a hashed reference is sufficient (e.g., store `customerIdHash`).

## 10) Operational Security

- **MUST** enforce least privilege for database and cloud IAM roles.
- **MUST** run dependency vulnerability scanning.
- **MUST** enforce CI gate checks: lint, tests, static analysis.
- **MUST** maintain incident response runbooks for key compromise, chain reorg, and data breach.

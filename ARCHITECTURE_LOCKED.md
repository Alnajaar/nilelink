# 🔒 NILELINK ARCHITECTURE - LOCKED & FINAL

**Status:** ✅ APPROVED & LOCKED  
**Date:** 2026-01-23  
**Version:** 1.0.0

This document defines the **FINAL** NileLink architecture. All future development MUST comply with this design.

---

## 🎯 Core Principles

### 1. Fully Decentralized Web3 System

- ❌ **NO** traditional backend servers
- ❌ **NO** centralized databases
- ❌ **NO** server-side rendering (SSR)
- ✅ **YES** to Cloudflare Workers (stateless edge compute)
- ✅ **YES** to static site generation
- ✅ **YES** to wallet-based authentication

### 2. Security-First Design

- Subdomain isolation (no shared cookies)
- Content Security Policy (CSP) per domain
- Cloudflare as security layer
- No secrets in frontend bundles
- Wallet signature validation

### 3. Production-Grade Architecture

- Multi-branch support
- Role-based access control
- Rate limiting
- Offline-first capabilities
- Zero-error requirement

---

## 🌐 Cloudflare Subdomain Structure (LOCKED)

### Application Domains

| Domain | Purpose | Users | Auth | Data Access |
|--------|---------|-------|------|-------------|
| **nilelink.app** | Public marketing | Anyone | None | Read-only (public content) |
| **pos.nilelink.app** | In-store POS | Cashiers | Wallet | Branch-specific transactions |
| **admin.nilelink.app** | Management | Owners, Managers | Wallet | Multi-branch analytics |
| **vendor.nilelink.app** | Supplier portal | Suppliers | Wallet | Supplier-specific inventory |
| **delivery.nilelink.app** | Driver dashboard | Drivers | Wallet | Assigned orders only |

### Service Domains

| Domain | Purpose | Public | Type |
|--------|---------|--------|------|
| **edge.nilelink.app** | Cloudflare Workers | No (API only) | Edge compute |
| **assets.nilelink.app** | IPFS gateway alias | Yes (read-only) | CDN |

### Isolation Rules

**MANDATORY COMPLIANCE:**

1. **No Shared Cookies**
   - Each subdomain has isolated cookie scope
   - Auth tokens are domain-specific
   - No cross-domain session sharing

2. **Strict Content Security Policy (CSP)**

   ```
   default-src 'self';
   connect-src 'self' https://edge.nilelink.app https://*.polygon.com;
   img-src 'self' https://assets.nilelink.app data:;
   script-src 'self' 'unsafe-inline' 'unsafe-eval';
   ```

3. **Cloudflare Security Features**
   - WAF (Web Application Firewall) enabled
   - DDoS protection active
   - Rate limiting per subdomain
   - Bot management

4. **No Backend Leakage**
   - Workers only on `edge.nilelink.app`
   - No server-side logic in app subdomains
   - All apps are static exports

---

## 🔐 IPFS Upload Architecture (LOCKED)

### Upload Flow

```
┌─────────────────────────────────────────────────────────────┐
│  WALLET-BASED IPFS UPLOAD FLOW (FINAL)                      │
└─────────────────────────────────────────────────────────────┘

1. User Action (Frontend)
   │
   ├─ Connect wallet (MetaMask, WalletConnect, etc.)
   │
   ├─ Request upload permission
   │  └─ Sign message: "Upload to IPFS at {timestamp}"
   │     (No gas fee - off-chain signature)
   │
   ▼

2. Token Request (edge.nilelink.app/ipfs/token)
   │
   ├─ Worker validates signature
   ├─ Worker checks role (OWNER/MANAGER only)
   ├─ Worker applies rate limit (10/hour per wallet)
   ├─ Worker issues JWT token (5min expiry)
   │
   ▼

3. File Upload (edge.nilelink.app/ipfs/upload)
   │
   ├─ Frontend sends file + token
   ├─ Worker validates token
   ├─ Worker validates file (size, type)
   ├─ Worker proxies to Pinata (PINATA_JWT server-side)
   │
   ▼

4. CID Returned
   │
   ├─ Worker returns CID to frontend
   │
   ▼

5. On-Chain Storage
   │
   ├─ Frontend stores CID in smart contract
   ├─ Transaction signed by wallet
   │
   ▼

6. Public Access
   │
   └─ Anyone reads via: assets.nilelink.app/ipfs/{CID}
```

### Security Model

**Frontend ONLY Contains:**

```bash
NEXT_PUBLIC_IPFS_GATEWAY=https://assets.nilelink.app/ipfs/
NEXT_PUBLIC_WORKER_URL=https://edge.nilelink.app
NEXT_PUBLIC_CHAIN_ID=80002
```

**Workers (Edge Compute) Contain:**

```bash
# Token Worker
JWT_SECRET=<strong_random_secret>
RPC_URL=<polygon_rpc>
RESTAURANT_REGISTRY_ADDRESS=<contract_address>

# Upload Worker
PINATA_JWT=<pinata_jwt>
JWT_SECRET=<same_as_token_worker>
MAX_FILE_SIZE=10485760
```

**Enforcement:**

- ❌ Frontend MUST NOT have: `PINATA_JWT`, `PINATA_API_KEY`, `PINATA_SECRET`
- ❌ Frontend MUST NOT upload directly to Pinata
- ✅ All uploads MUST go through Workers
- ✅ All uploads MUST have wallet signature

---

## 📦 Deployment Model (LOCKED)

### All Apps: Static Export

**Mandatory Configuration (ALL APPS):**

```javascript
// next.config.js
module.exports = {
  output: 'export',  // ✅ REQUIRED
  images: {
    unoptimized: true
  }
}
```

**Apps:**

- `web/pos` → `pos.nilelink.app` (Static)
- `web/customer` → `nilelink.app` (Static)
- `web/admin` → `admin.nilelink.app` (Static)
- `web/vendor` → `vendor.nilelink.app` (Static)
- `web/delivery` → `delivery.nilelink.app` (Static)

**Workers:**

- `workers/ipfs-token` → `edge.nilelink.app/ipfs/token`
- `workers/ipfs-upload` → `edge.nilelink.app/ipfs/upload`

### Deployment Platform

**Static Apps:**

- Platform: Cloudflare Pages
- Build command: `npm run build`
- Output directory: `out/`
- Branch: `main` (production)

**Workers:**

- Platform: Cloudflare Workers
- Deploy command: `wrangler deploy --env production`
- Routes: Configured in `wrangler.toml`

---

## 🚫 Prohibited Patterns

The following patterns are **ABSOLUTELY FORBIDDEN**:

### ❌ Traditional Backend

```javascript
// WRONG - DO NOT DO THIS
app.listen(3000)  // No Express servers
mongoose.connect() // No MongoDB
prisma.$connect() // No database connections
```

### ❌ Next.js API Routes

```javascript
// WRONG - DO NOT DO THIS
// app/api/upload/route.ts
export async function POST(req) { ... }
```

### ❌ Secrets in Frontend

```javascript
// WRONG - DO NOT DO THIS
NEXT_PUBLIC_PINATA_JWT=...
NEXT_PUBLIC_API_SECRET=...
```

### ❌ Shared Authentication

```javascript
// WRONG - DO NOT DO THIS
// Sharing cookies across subdomains
document.cookie = "auth=...; domain=.nilelink.app"
```

---

## ✅ Approved Patterns

### ✅ Cloudflare Workers

```typescript
// CORRECT - Edge compute
export default {
  async fetch(request: Request, env: Env) {
    // Stateless logic only
    // No database connections
    // Environment variables for secrets
  }
}
```

### ✅ Client-Side Storage

```typescript
// CORRECT - Browser storage
localStorage.setItem('user', JSON.stringify(data));
indexedDB.open('nilelink-pos');
```

### ✅ Wallet Authentication

```typescript
// CORRECT - Web3 auth
const signature = await signMessage(message);
const isValid = ethers.verifyMessage(message, signature);
```

### ✅ Blockchain Interaction

```typescript
// CORRECT - Smart contract calls
const contract = new ethers.Contract(address, abi, signer);
await contract.storeMenuCID(cid);
```

---

## 📋 Compliance Checklist

Before any feature is deployed, it MUST pass:

### Architecture Compliance

- [ ] No traditional backend code
- [ ] All apps use `output: 'export'`
- [ ] No Next.js API routes exist
- [ ] Secrets only in Worker environment variables
- [ ] Subdomain isolation maintained

### Security Compliance

- [ ] No secrets in frontend bundles
- [ ] Wallet signature validation implemented
- [ ] Rate limiting configured
- [ ] CSP headers set
- [ ] CORS properly configured

### Functional Compliance

- [ ] Multi-branch support working
- [ ] Role-based access enforced
- [ ] Offline mode functional
- [ ] Real-time updates working
- [ ] Zero console errors

---

## 🔄 Change Management

### Minor Changes (Allowed)

- UI improvements
- Performance optimizations
- Bug fixes
- Feature additions (that comply with architecture)

### Major Changes (Require Approval)

- New subdomains
- Worker functionality changes
- Authentication flow changes
- Deployment model changes

### Forbidden Changes

- Adding traditional backend
- Enabling SSR
- Sharing cookies across domains
- Exposing secrets to frontend

---

## 📞 Architecture Violations

**If you encounter code that violates this architecture:**

1. **STOP** - Do not deploy
2. **DOCUMENT** - Record the violation
3. **REDESIGN** - Fix to comply with architecture
4. **REVIEW** - Get approval before proceeding

**Common Violations:**

- Finding Next.js API routes
- Discovering shared cookies
- Seeing `NEXT_PUBLIC_` secrets
- Traditional server code

**Resolution:**

- Remove/refactor immediately
- Do not "grandfather" old code
- Zero tolerance for violations

---

## 📚 Reference Documentation

- **Architecture Design:** `CLOUDFLARE_WORKER_ARCHITECTURE.md`
- **Deployment Guide:** `workers/DEPLOYMENT_GUIDE.md`
- **Implementation Summary:** `workers/IMPLEMENTATION_SUMMARY.md`
- **Audit Report:** `ARCHITECTURE_AUDIT_2026.md`

---

## ✅ Final Approval

**Approved By:** User  
**Date:** 2026-01-23  
**Status:** 🔒 LOCKED

**This architecture is now FINAL. All development must comply.**

---

**Next Steps:**

1. Deploy Workers to Cloudflare
2. Configure DNS records
3. Deploy static apps to Cloudflare Pages
4. Test end-to-end flows
5. Production launch

**Estimated Time to Production:** 1-2 days

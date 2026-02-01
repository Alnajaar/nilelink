# ☁️ NileLink Cloudflare Worker Architecture

## 🎯 Architecture Philosophy

**FINAL DECISION:** NileLink is a **fully decentralized system** with NO centralized backend servers.

### What We Use

- ✅ **Cloudflare Workers** - Stateless edge compute (part of decentralized edge)
- ✅ **Static Builds** - All frontends are static exports
- ✅ **IPFS** - Decentralized storage
- ✅ **Blockchain** - Decentralized state & settlement
- ✅ **LocalStorage/IndexedDB** - Client-side data

### What We DON'T Use

- ❌ Next.js API Routes (requires server)
- ❌ Traditional backend servers
- ❌ Centralized databases
- ❌ Server-side rendering (SSR)

---

## 🌐 Domain Structure (APPROVED)

```
┌──────────────────────────────────────────────────┐
│  CLOUDFLARE DOMAIN ARCHITECTURE                  │
└──────────────────────────────────────────────────┘

PUBLIC STATIC APPS:
├── nilelink.app              → Landing/Marketing (static)
├── pos.nilelink.app          → POS System (static)
├── admin.nilelink.app        → Admin Dashboard (static)
├── vendor.nilelink.app       → Supplier Portal (static)
└── delivery.nilelink.app     → Driver Dashboard (static)

SERVICES (Cloudflare Workers):
├── edge.nilelink.app         → ALL Workers (no UI)
│   ├── /ipfs/token          → Issue temp upload tokens
│   ├── /ipfs/upload         → Proxy uploads to Pinata
│   ├── /ai/*                → AI services
│   └── /auth/*              → Wallet validation
└── assets.nilelink.app       → IPFS Gateway (read-only)

INFRASTRUCTURE:
└── graph.nilelink.app        → The Graph queries (optional custom domain)
```

**Security Rules:**

- ✅ No shared cookies between domains
- ✅ Strict CORS policies
- ✅ `edge.nilelink.app` has NO UI, APIs only
- ✅ All secrets stored in Worker environment variables

---

## 📦 Deployment Model (STANDARDIZED)

### All Apps Use Static Export

**Next.js Configuration:**

```javascript
// next.config.js (ALL APPS)
module.exports = {
  output: 'export',  // ✅ REQUIRED
  images: {
    unoptimized: true
  }
}
```

**Apps:**

| App | Domain | Build Output | Deployed To |
|-----|--------|--------------|-------------|
| POS | `pos.nilelink.app` | Static HTML/JS/CSS | Cloudflare Pages |
| Customer | `nilelink.app` | Static HTML/JS/CSS | Cloudflare Pages |
| Admin | `admin.nilelink.app` | Static HTML/JS/CSS | Cloudflare Pages |
| Vendor | `vendor.nilelink.app` | Static HTML/JS/CSS | Cloudflare Pages |
| Delivery | `delivery.nilelink.app` | Static HTML/JS/CSS | Cloudflare Pages |

**Workers:**

| Worker | Domain | Purpose | Secrets |
|--------|--------|---------|---------|
| IPFS Service | `edge.nilelink.app/ipfs/*` | Upload delegation | PINATA_JWT |
| AI Service | `edge.nilelink.app/ai/*` | AI inference | OPENAI_API_KEY |
| Auth Service | `edge.nilelink.app/auth/*` | Wallet validation | None |

---

## 🔐 IPFS Upload Architecture (Phase 1)

### Overview

```
┌──────────────────────────────────────────────────────────────┐
│  IPFS Upload Flow (Worker-Based)                             │
└──────────────────────────────────────────────────────────────┘

Step 1: Request Upload Token
  Frontend (POS/Admin)
      │ ① POST /ipfs/token
      │    { walletAddress, signature, role }
      ▼
  edge.nilelink.app/ipfs/token (Worker)
      │ ② Validate wallet signature
      │ ③ Check role (owner/manager only)
      │ ④ Apply rate limits
      │ ⑤ Generate temp token (5min TTL)
      ▼
  Return: { token, expiresAt }

Step 2: Upload File
  Frontend
      │ ⑥ POST /ipfs/upload
      │    FormData + token in header
      ▼
  edge.nilelink.app/ipfs/upload (Worker)
      │ ⑦ Validate token (not expired)
      │ ⑧ Upload to Pinata with PINATA_JWT
      │ ⑨ Log upload (wallet, CID, size)
      ▼
  Return: { cid, url, size }

Step 3: Store On-Chain
  Frontend
      │ ⑩ Store CID in smart contract
      ▼
  Blockchain
```

### Security Features

✅ **No Secrets in Frontend**

- Frontend NEVER has Pinata credentials
- Workers hold secrets in environment variables

✅ **Wallet-Based Authentication**

- User signs message with wallet
- Worker verifies signature on-chain

✅ **Role-Based Access**

- Only `OWNER` and `MANAGER` can upload
- Enforced in Worker, not frontend

✅ **Rate Limiting**

- Per-wallet limits (10 uploads/hour)
- Per-file size limits (10MB max)
- Global quota monitoring

✅ **Token Expiration**

- Temp tokens expire in 5 minutes
- Single-use tokens (optional)

---

## 🛠️ Worker Implementation Plan

### Worker 1: Token Issuer (`/ipfs/token`)

**File:** `workers/ipfs-token/src/index.ts`

**Responsibilities:**

1. Validate wallet signature
2. Check role from on-chain data
3. Apply rate limits
4. Generate JWT token
5. Return token to frontend

**Environment Variables:**

```bash
JWT_SECRET=random_secret_for_token_signing
RPC_URL=https://polygon-amoy.g.alchemy.com/v2/...
RESTAURANT_REGISTRY_ADDRESS=0x...
```

**Rate Limiting:**

- Use Cloudflare Durable Objects for distributed rate limiting
- Track uploads per wallet address
- Reset counter hourly

---

### Worker 2: Upload Proxy (`/ipfs/upload`)

**File:** `workers/ipfs-upload/src/index.ts`

**Responsibilities:**

1. Validate upload token
2. Verify file size/type
3. Upload to Pinata
4. Log upload activity
5. Return CID to frontend

**Environment Variables:**

```bash
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
JWT_SECRET=same_as_token_worker
MAX_FILE_SIZE=10485760  # 10MB
```

**File Validation:**

- Max size: 10MB
- Allowed types: images, JSON, PDF
- Scan for malware (optional Phase 2)

---

## 📝 Frontend Integration

### Updated IPFS Utilities

**File:** `web/shared/lib/ipfs.ts`

```typescript
/**
 * IPFS Upload - Worker-Based (Phase 1)
 * 
 * Flow:
 * 1. Request temp token from edge.nilelink.app/ipfs/token
 * 2. Upload file to edge.nilelink.app/ipfs/upload with token
 * 3. Receive CID and store on-chain
 */

const WORKER_BASE_URL = 'https://edge.nilelink.app';

export async function requestUploadToken(
  walletAddress: string,
  signature: string,
  role: string
): Promise<{ token: string; expiresAt: number }> {
  const response = await fetch(`${WORKER_BASE_URL}/ipfs/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, signature, role })
  });

  if (!response.ok) {
    throw new Error('Failed to get upload token');
  }

  return await response.json();
}

export async function uploadToIPFS(
  file: File,
  token: string,
  metadata?: Record<string, any>
): Promise<{ cid: string; url: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch(`${WORKER_BASE_URL}/ipfs/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload to IPFS');
  }

  return await response.json();
}
```

### React Hook

```typescript
export function useIPFSUpload() {
  const { address, signMessage } = useWallet();
  const { role } = useAuth();

  const upload = async (file: File) => {
    // 1. Sign message
    const message = `Upload to IPFS at ${Date.now()}`;
    const signature = await signMessage(message);

    // 2. Get token
    const { token } = await requestUploadToken(address, signature, role);

    // 3. Upload file
    const result = await uploadToIPFS(file, token);

    return result;
  };

  return { upload };
}
```

---

## 🚀 Deployment Checklist

### Prerequisites

- [ ] Cloudflare account with Workers enabled
- [ ] Domain `nilelink.app` added to Cloudflare
- [ ] DNS records ready to configure
- [ ] Pinata account with JWT token

### Step 1: Deploy Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Deploy token issuer
cd workers/ipfs-token
wrangler deploy

# Deploy upload proxy
cd ../ipfs-upload
wrangler deploy
```

### Step 2: Configure DNS

```
Type  Name               Target                           Proxy
────────────────────────────────────────────────────────────────
CNAME edge.nilelink.app  nilelink-workers.workers.dev     ✅ On
CNAME pos.nilelink.app   nilelink-pos.pages.dev          ✅ On
CNAME admin.nilelink.app nilelink-admin.pages.dev        ✅ On
```

### Step 3: Deploy Static Apps

```bash
# POS
cd web/pos
npm run build
npx wrangler pages deploy out --project-name=nilelink-pos

# Admin
cd web/admin
npm run build
npx wrangler pages deploy out --project-name=nilelink-admin
```

### Step 4: Environment Variables

**Workers (via Wrangler):**

```bash
# Token Worker
wrangler secret put JWT_SECRET --env production
wrangler secret put RPC_URL --env production

# Upload Worker
wrangler secret put PINATA_JWT --env production
wrangler secret put JWT_SECRET --env production
```

**Frontend (.env.production):**

```bash
# ✅ SAFE - Public endpoints only
NEXT_PUBLIC_WORKER_URL=https://edge.nilelink.app
NEXT_PUBLIC_IPFS_GATEWAY=https://assets.nilelink.app/ipfs/
NEXT_PUBLIC_CHAIN_ID=80002
```

---

## 🧪 Testing Plan

### Unit Tests

- [ ] Token generation/validation
- [ ] Signature verification
- [ ] Rate limiting logic
- [ ] File size validation

### Integration Tests

- [ ] End-to-end upload flow
- [ ] Token expiration handling
- [ ] Rate limit enforcement
- [ ] Error scenarios

### Load Tests

- [ ] Concurrent uploads
- [ ] Rate limit stress test
- [ ] Worker cold start times

---

## 📋 Migration from Broken Implementation

### What to Remove

- ✅ ALREADY DONE: Deleted all `/api/*` routes
- ✅ ALREADY DONE: Deleted incorrect documentation

### What to Update

- [ ] `web/shared/lib/ipfs.ts` - Point to Workers
- [ ] `web/shared/hooks/useIPFSUpload.ts` - Use Worker flow
- [ ] All apps `next.config.js` - Ensure `output: 'export'`

### What to Create

- [ ] `workers/ipfs-token/` - Token issuer Worker
- [ ] `workers/ipfs-upload/` - Upload proxy Worker
- [ ] `workers/wrangler.toml` - Worker configuration
- [ ] New documentation for Worker-based flow

---

## 🔮 Phase 2: Pure Web3 Uploads (Future)

**Goal:** Wallet-signed delegated uploads (no Workers needed)

**Approach:**

- User generates signed upload permission
- Pinata accepts signature directly
- Fully decentralized, no intermediary

**Compatibility:**

- Must work alongside Phase 1
- Gradual migration, no breaking changes

**Timeline:** After Phase 1 is stable and tested

---

## ✅ Success Criteria

Before considering this complete:

### Architecture

- [ ] All apps are static exports
- [ ] No Next.js API routes exist
- [ ] All dynamic logic in Workers
- [ ] No secrets in frontend bundles

### Security

- [ ] Wallet signature validation working
- [ ] Role-based upload restrictions enforced
- [ ] Rate limiting functional
- [ ] Tokens expire correctly

### Performance

- [ ] Upload completes in < 5 seconds
- [ ] Workers respond in < 100ms
- [ ] No cold start issues

### Documentation

- [ ] Architecture clearly documented
- [ ] Deployment guide complete
- [ ] Frontend integration guide ready
- [ ] Migration path documented

---

## 📚 Next Steps

1. **Review this architecture** ✅ (You are here)
2. **Implement Workers** (Next task)
3. **Update frontend utilities** (After Workers)
4. **Deploy to staging** (Test first)
5. **Verify all workflows** (Before production)

**Estimated Time:** 2-3 days for complete implementation

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-23  
**Status:** 📋 DESIGN PHASE - Awaiting Approval

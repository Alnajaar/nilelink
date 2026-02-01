# 🚀 Cloudflare Workers Deployment Guide

## Prerequisites

- Cloudflare account
- Domain `nilelink.app` added to Cloudflare
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18+ installed

---

## Step 1: Install Dependencies

### Token Issuer Worker

```bash
cd workers/ipfs-token
npm install
```

### Upload Proxy Worker

```bash
cd workers/ipfs-upload
npm install
```

---

## Step 2: Configure Secrets

### Token Issuer Secrets

```bash
cd workers/ipfs-token

# Generate a strong JWT secret
wrangler secret put JWT_SECRET
# Enter a random string (e.g., use: openssl rand -hex 32)

# Set RPC URL
wrangler secret put RPC_URL
# Enter: https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

# Set Restaurant Registry contract address
wrangler secret put RESTAURANT_REGISTRY_ADDRESS
# Enter: 0x... (your deployed contract address)
```

### Upload Proxy Secrets

```bash
cd workers/ipfs-upload

# Set Pinata JWT (get from https://pinata.cloud/)
wrangler secret put PINATA_JWT
# Enter: eyJhbGciOi... (your Pinata JWT)

# Set JWT secret (MUST be same as token worker)
wrangler secret put JWT_SECRET
# Enter: <same value as token worker>
```

---

## Step 3: Test Locally

### Start Token Worker (Terminal 1)

```bash
cd workers/ipfs-token
npm run dev
```

Access at: `http://localhost:8787`

### Start Upload Worker (Terminal 2)

```bash
cd workers/ipfs-upload
npm run dev
```

Access at: `http://localhost:8788`

### Test Token Request

```bash
curl -X POST http://localhost:8787/ipfs/token \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "signature": "0x...",
    "role": "OWNER",
    "message": "Upload to IPFS at 1234567890"
  }'
```

### Test Upload

```bash
curl -X POST http://localhost:8788/ipfs/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@test.jpg"
```

---

## Step 4: Deploy to Production

### Deploy Token Worker

```bash
cd workers/ipfs-token
wrangler login
npm run deploy:production
```

### Deploy Upload Worker

```bash
cd workers/ipfs-upload
npm run deploy:production
```

---

## Step 5: Configure DNS

In Cloudflare Dashboard → DNS → Records:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `edge` | `nilelink-ipfs-token.workers.dev` | ✅ On |

Or use a Worker route:

1. Go to Workers & Pages → nilelink-ipfs-token
2. Settings → Triggers → Routes
3. Add route: `edge.nilelink.app/ipfs/*`

---

## Step 6: Verify Deployment

### Test Token Endpoint

```bash
curl https://edge.nilelink.app/ipfs/status
```

Expected response:

```json
{
  "healthy": true,
  "service": "ipfs-token-issuer",
  "message": "Token issuer is operational"
}
```

### Test Upload Endpoint

```bash
curl https://edge.nilelink.app/ipfs/status
```

---

## Step 7: Update Frontend Environment Variables

In all frontend apps (POS, Customer, Admin, etc.), update `.env.production`:

```bash
# Cloudflare Worker endpoints
NEXT_PUBLIC_WORKER_URL=https://edge.nilelink.app

# IPFS Gateway
NEXT_PUBLIC_IPFS_GATEWAY=https://assets.nilelink.app/ipfs/

# Or use Pinata gateway
# NEXT_PUBLIC_IPFS_GATEWAY=https://green-gentle-warbler-878.mypinata.cloud/ipfs/
```

---

## Troubleshooting

### Worker not responding

- Check deployment status: `wrangler deployments list`
-Check logs: `wrangler tail`
- Verify routes in Cloudflare dashboard

### "Invalid token" errors

- Ensure JWT_SECRET is identical in both workers
- Check token expiration (5 minutes)
- Verify wallet signature is correct

### "Rate limit exceeded"

- Rate limit is 10 uploads per hour per wallet
- Wait for window to reset
- Check Durable Objects are working

### Pinata upload fails

- Verify PINATA_JWT secret is set correctly
- Check Pinata account quota
- Verify file size < 10MB

---

## Monitoring

### View Worker Logs

```bash
# Token worker logs
cd workers/ipfs-token
wrangler tail --env production

# Upload worker logs
cd workers/ipfs-upload
wrangler tail --env production
```

### Metrics

Check in Cloudflare Dashboard:

- Workers & Pages → Your Worker → Metrics
- View requests, errors, CPU time

---

## Security Checklist

- [ ] JWT_SECRET is strong and secret
- [ ] PINATA_JWT never exposed to frontend
- [ ] Rate limiting is working
- [ ] File size limits enforced
- [ ] Only allowed file types accepted
- [ ] Wallet signature validation working
- [ ] CORS headers properly configured

---

## Production URLs

After deployment:

| Service | URL |
|---------|-----|
| Token Issuer | `https://edge.nilelink.app/ipfs/token` |
| Upload Proxy | `https://edge.nilelink.app/ipfs/upload` |
| Status Check | `https://edge.nilelink.app/ipfs/status` |
| IPFS Gateway | `https://assets.nilelink.app/ipfs/` |

---

## Next Steps

1. ✅ Deploy Workers
2. ✅ Configure DNS
3. ✅ Update frontend env vars
4. Test upload flow end-to-end
5. Monitor for errors
6. Scale as needed

**Status:** Ready for deployment! 🚀

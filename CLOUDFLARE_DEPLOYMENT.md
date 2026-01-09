# ============================================================================
# Cloudflare Pages Deployment Guide - NileLink v1.0.0
# ============================================================================

This guide covers deploying all NileLink frontend applications to Cloudflare Pages.

## Prerequisites

- Cloudflare account with Pages access
- Git repository connected to Cloudflare
- Domain `nilelink.app` configured in Cloudflare

---

## Frontend Applications

| App | Subdomain | Root Directory | Build Command | Output |
|-----|-----------|----------------|---------------|--------|
| Customer | nilelink.app | `web/customer` | `npm run build` | `out` |
| POS | pos.nilelink.app | `web/pos` | `npm run build` | `out` |
| Delivery | delivery.nilelink.app | `web/delivery` | `npm run build` | `out` |
| Supplier | supplier.nilelink.app | `web/supplier` | `npm run build` | `out` |
| Portal | portal.nilelink.app | `web/portal` | `npm run build` | `out` |
| Dashboard | dashboard.nilelink.app | `web/dashboard` | `npm run build` | `out` |
| Admin | admin.nilelink.app | `web/unified` | `npm run build` | `out` |

---

## Step-by-Step Deployment

### 1. Create Cloudflare Pages Project (Customer App)

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a project**
3. Connect your Git repository
4. Configure build settings:
   - **Project name**: `nilelink-customer`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `cd web/customer && npm install && npm run build`
   - **Build output directory**: `web/customer/out`
   - **Root directory**: `/`

5. **Environment variables**:
   ```
   NODE_VERSION=18
   NEXT_PUBLIC_API_URL=https://api.nilelink.app/api
   ```

6. Click **Save and Deploy**

7. Once deployed, go to **Custom domains** → **Set up a domain**
8. Add `nilelink.app`

### 2. Repeat for Each App

Create separate projects for each app with these settings:

#### **POS App**
- Project name: `nilelink-pos`
- Build command: `cd web/pos && npm install && npm run build`
- Output: `web/pos/out`
- Custom domain: `pos.nilelink.app`

#### **Delivery App**
- Project name: `nilelink-delivery`
- Build command: `cd web/delivery && npm install && npm run build`
- Output: `web/delivery/out`
- Custom domain: `delivery.nilelink.app`

#### **Supplier App**
- Project name: `nilelink-supplier`
- Build command: `cd web/supplier && npm install && npm run build`
- Output: `web/supplier/out`
- Custom domain: `supplier.nilelink.app`

#### **Portal App**
- Project name: `nilelink-portal`
- Build command: `cd web/portal && npm install && npm run build`
- Output: `web/portal/out`
- Custom domain: `portal.nilelink.app`

#### **Dashboard App**
- Project name: `nilelink-dashboard`
- Build command: `cd web/dashboard && npm install && npm run build`
- Output: `web/dashboard/out`
- Custom domain: `dashboard.nilelink.app`

#### **Admin App**
- Project name: `nilelink-admin`
- Build command: `cd web/unified && npm install && npm run build`
- Output: `web/unified/out`
- Custom domain: `admin.nilelink.app`

---

## DNS Configuration

All DNS records are managed in Cloudflare:

### A Record (Backend)
```
A    api.nilelink.app    →  YOUR_SERVER_IP
```

### CNAME Records (Frontends - Automatic)
Cloudflare Pages automatically creates CNAME records when you add custom domains.

---

## Environment Variables (All Projects)

Add these to each Cloudflare Pages project:

```env
NODE_VERSION=18
NEXT_PUBLIC_API_URL=https://api.nilelink.app/api
```

For production builds, use:
```env
NODE_ENV=production
```

---

## Deployment Commands (Manual Alternative)

If deploying via Wrangler CLI:

```powershell
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy Customer App
cd web/customer
npm run build
wrangler pages publish out --project-name=nilelink-customer

# Repeat for each app
```

---

## Verification Checklist

After deployment, verify each app:

- [ ] https://nilelink.app loads
- [ ] https://pos.nilelink.app loads
- [ ] https://delivery.nilelink.app loads
- [ ] https://supplier.nilelink.app loads
- [ ] https://portal.nilelink.app loads
- [ ] https://dashboard.nilelink.app loads
- [ ] https://admin.nilelink.app loads
- [ ] All apps can reach `https://api.nilelink.app/api`
- [ ] HTTPS enforced on all domains
- [ ] No mixed content warnings
- [ ] Auth cookies work across subdomains

---

## Rollback Strategy

To rollback a deployment:

1. Go to **Cloudflare Pages** → Select project
2. Go to **View build** for the deployment you want to rollback to
3. Click **Rollback to this deployment**

Each deployment is immutable and can be instantly restored.

---

## Build Optimization Tips

1. **Enable caching**: Cloudflare automatically caches static assets
2. **Use environment variables**: Configure different API URLs per environment
3. **Monitor build times**: Keep builds under 10 minutes
4. **Preview deployments**: Test on `*.pages.dev` before adding custom domains

---

## Troubleshooting

### Build Fails
- Check build logs in Cloudflare Pages dashboard
- Verify `package.json` has all dependencies
- Ensure `next.config.js` has `output: 'export'`

### 404 on Routes
- Ensure `trailingSlash: true` in `next.config.js`
- Check that `out` directory contains `404.html`

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check CORS settings on backend
- Ensure backend is accessible at `https://api.nilelink.app`

---

## Next Steps

1. Deploy all 7 frontend apps to Cloudflare Pages
2. Configure custom domains for each app
3. Update backend CORS to allow all frontend subdomains
4. Test complete user flows across all apps

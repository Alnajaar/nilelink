# NileLink v1.0.0 - Cloudflare Pages Manual Deployment Guide

Since automated deployment via Wrangler CLI may require interactive authentication, here's how to deploy via Cloudflare Dashboard.

## Cloudflare Credentials

**Account ID**: `79b17f6d66b3dcfd8aca5f94a1f702d3`  
**Zone ID**: `66f8e193a4c1a3a9a4533aeb820584fc`  
**Email**: `nilelink@hotmail.com`  
**Password**: `DGGASHdggash@100%`

---

## Quick Deployment Steps

### 1. Login to Cloudflare

1. Go to https://dash.cloudflare.com/
2. Login with credentials above
3. Navigate to **Pages** in the sidebar

### 2. Deploy Each App

For each app, follow these steps:

#### **App 1: Customer (nilelink.app)**

1. Click **Create a project**
2. **Connect to Git** (recommended) or **Direct Upload**
3. Configure:
   - **Project name**: `nilelink-customer`
   - **Production branch**: `main` 
   - **Build command**: `cd web/customer && npm install --legacy-peer-deps && npm run build`
   - **Build output directory**: `web/customer/out`
4. **Environment variables**:
   ```
   NODE_VERSION = 18
   NEXT_PUBLIC_API_URL = https://api.nilelink.app/api
   NODE_ENV = production
   ```
5. Click **Save and Deploy**
6. After deploy, go to **Custom domains** → **Set up a custom domain**
7. Add `nilelink.app`

#### **App 2: POS (pos.nilelink.app)**

Repeat above with:
- **Project name**: `nilelink-pos`
- **Build command**: `cd web/pos && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/pos/out`
- **Custom domain**: `pos.nilelink.app`

#### **App 3: Delivery (delivery.nilelink.app)**

- **Project name**: `nilelink-delivery`
- **Build command**: `cd web/delivery && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/delivery/out`
- **Custom domain**: `delivery.nilelink.app`

#### **App 4: Supplier (supplier.nilelink.app)**

- **Project name**: `nilelink-supplier`
- **Build command**: `cd web/supplier && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/supplier/out`
- **Custom domain**: `supplier.nilelink.app`

#### **App 5: Portal (portal.nilelink.app)**

- **Project name**: `nilelink-portal`
- **Build command**: `cd web/portal && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/portal/out`
- **Custom domain**: `portal.nilelink.app`

#### **App 6: Dashboard (dashboard.nilelink.app)**

- **Project name**: `nilelink-dashboard`
- **Build command**: `cd web/dashboard && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/dashboard/out`
- **Custom domain**: `dashboard.nilelink.app`

#### **App 7: Admin (admin.nilelink.app)**

- **Project name**: `nilelink-admin`
- **Build command**: `cd web/unified && npm install --legacy-peer-deps && npm run build`
- **Output**: `web/unified/out`
- **Custom domain**: `admin.nilelink.app`

---

## Alternative: Direct Upload (Faster for Testing)

If you want to test quickly without connecting Git:

### Build Locally

```powershell
# Customer App
cd web/customer
npm install --legacy-peer-deps
$env:NEXT_PUBLIC_API_URL="https://api.nilelink.app/api"
npm run build

# Repeat for other apps
```

### Upload to Cloudflare Pages

1. In Cloudflare Dashboard → Pages
2. **Create a project** → **Upload assets**
3. Drag & drop the `out` folder
4. Configure custom domain

---

## DNS Configuration

Cloudflare will automatically create CNAME records when you add custom domains.

Verify in **DNS** section:
```
CNAME  nilelink.app          → nilelink-customer.pages.dev
CNAME  pos.nilelink.app      → nilelink-pos.pages.dev
CNAME  delivery.nilelink.app → nilelink-delivery.pages.dev
CNAME  supplier.nilelink.app → nilelink-supplier.pages.dev
CNAME  portal.nilelink.app   → nilelink-portal.pages.dev
CNAME  dashboard.nilelink.app→ nilelink-dashboard.pages.dev
CNAME  admin.nilelink.app    → nilelink-admin.pages.dev
```

---

## Verification

After deployment, test each app:

- https://nilelink.app
- https://pos.nilelink.app
- https://delivery.nilelink.app
- https://supplier.nilelink.app
- https://portal.nilelink.app
- https://dashboard.nilelink.app
- https://admin.nilelink.app

Check:
- ✅ HTTPS enabled
- ✅ Page loads without errors
- ✅ API calls go to `https://api.nilelink.app/api`
- ✅ Auth cookies work across subdomains

---

## Troubleshooting

### Build Fails
- Check build logs in Cloudflare Pages dashboard
- Verify `next.config.js` has `output: 'export'`
- Ensure all dependencies in `package.json`

### 404 Errors
- Verify output directory is correct (`out`)
- Check `trailingSlash: true` in `next.config.js`

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check backend CORS settings allow frontend domains
- Ensure backend is running at `api.nilelink.app`

---

**Status**: Ready for manual deployment via Cloudflare Dashboard  
**Estimated Time**: ~10-15 minutes per app  
**Total**: ~2 hours for all 7 apps

# 🚀 Quick Start: Deploy NileLink to Cloudflare Pages

## ✅ What's Ready

All deployment files have been created:
- ✅ Wrangler configuration files (`wrangler.toml`) for each app
- ✅ Deployment scripts (`deploy-cloudflare.ps1` and `deploy-cloudflare.sh`)
- ✅ Comprehensive deployment guide (`DEPLOYMENT.md`)
- ✅ Wrangler CLI installed globally

## 🎯 Next Steps (Choose One Method)

### Method 1: Automated Deployment (Recommended)

**Step 1: Authenticate with Cloudflare**
```powershell
wrangler login
```
This will open a browser window. Login with your Cloudflare account.

**Step 2: Run the Deployment Script**
```powershell
.\deploy-cloudflare.ps1
```

This will deploy all 7 applications automatically!

### Method 2: Manual Deployment via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select repository: `Alnajaar/nilelink`
5. For each app, use these build settings:

**Example for Customer App:**
- Project name: `nilelink-customer`
- Build command: `cd web/customer && npm install && npm run build`
- Build output: `web/customer/out`

Repeat for all apps (dashboard, delivery, portal, pos, supplier, unified)

## 📋 Applications to Deploy

| # | App | Domain | Status |
|---|-----|--------|--------|
| 1 | Customer | customer.nilelink.app | ⏳ Pending |
| 2 | Dashboard | dashboard.nilelink.app | ⏳ Pending |
| 3 | Delivery | delivery.nilelink.app | ⏳ Pending |
| 4 | Portal | portal.nilelink.app | ⏳ Pending |
| 5 | POS | pos.nilelink.app | ⏳ Pending |
| 6 | Supplier | supplier.nilelink.app | ⏳ Pending |
| 7 | Unified | unified.nilelink.app | ⏳ Pending |

## 🌐 After Deployment

Once deployed, configure custom domains:

```powershell
wrangler pages domain add customer.nilelink.app --project-name=nilelink-customer
wrangler pages domain add dashboard.nilelink.app --project-name=nilelink-dashboard
wrangler pages domain add delivery.nilelink.app --project-name=nilelink-delivery
wrangler pages domain add portal.nilelink.app --project-name=nilelink-portal
wrangler pages domain add pos.nilelink.app --project-name=nilelink-pos
wrangler pages domain add supplier.nilelink.app --project-name=nilelink-supplier
wrangler pages domain add unified.nilelink.app --project-name=nilelink-unified
```

## 📚 Documentation

- **Full Guide**: See `DEPLOYMENT.md` for detailed instructions
- **Troubleshooting**: Check `DEPLOYMENT.md` for common issues

## ⚡ Quick Command Reference

```powershell
# Login to Cloudflare
wrangler login

# Deploy all apps (automated)
.\deploy-cloudflare.ps1

# Deploy single app manually
cd web/customer
wrangler pages deploy out --project-name=nilelink-customer --branch=main

# Check deployment status
wrangler pages deployment list --project-name=nilelink-customer

# View logs
wrangler pages deployment tail --project-name=nilelink-customer
```

## 🎉 Success Indicators

After successful deployment, you should see:
- ✅ All apps accessible at `https://nilelink-[app].pages.dev`
- ✅ Custom domains working at `https://[app].nilelink.app`
- ✅ SSL certificates active (🔒 in browser)
- ✅ No build errors in Cloudflare dashboard

---

**Ready to deploy?** Run `wrangler login` then `.\deploy-cloudflare.ps1`!

# 🚀 NileLink Cloudflare Pages Deployment Guide

This guide will help you deploy all NileLink applications to Cloudflare Pages.

## 📋 Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with access to the `nilelink.app` domain
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **GitHub Repository**: Code must be pushed to GitHub (✅ Already done!)

## 🎯 Quick Start (Automated Deployment)

### Option 1: Using PowerShell Script (Windows)

```powershell
# Run the deployment script
.\deploy-cloudflare.ps1
```

### Option 2: Using Bash Script (Linux/Mac/WSL)

```bash
# Make the script executable
chmod +x deploy-cloudflare.sh

# Run the deployment script
./deploy-cloudflare.sh
```

The script will:
- ✅ Check if Wrangler is installed
- ✅ Authenticate with Cloudflare
- ✅ Deploy all 7 applications
- ✅ Show deployment URLs

## 📝 Manual Deployment (Step by Step)

If you prefer to deploy manually or the script fails, follow these steps:

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### Step 3: Deploy Each Application

#### Deploy Customer App
```bash
cd web/customer
wrangler pages deploy out --project-name=nilelink-customer --branch=main
cd ../..
```

#### Deploy Dashboard App
```bash
cd web/dashboard
wrangler pages deploy out --project-name=nilelink-dashboard --branch=main
cd ../..
```

#### Deploy Delivery App
```bash
cd web/delivery
wrangler pages deploy out --project-name=nilelink-delivery --branch=main
cd ../..
```

#### Deploy Portal App
```bash
cd web/portal
wrangler pages deploy out --project-name=nilelink-portal --branch=main
cd ../..
```

#### Deploy POS App
```bash
cd web/pos
wrangler pages deploy out --project-name=nilelink-pos --branch=main
cd ../..
```

#### Deploy Supplier App
```bash
cd web/supplier
wrangler pages deploy out --project-name=nilelink-supplier --branch=main
cd ../..
```

#### Deploy Unified App
```bash
cd web/unified
wrangler pages deploy out --project-name=nilelink-unified --branch=main
cd ../..
```

## 🌐 Configure Custom Domains

After deployment, you need to configure custom domains:

### Method 1: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. For each project:
   - Click on the project name
   - Go to **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter the domain (e.g., `customer.nilelink.app`)
   - Click **Continue**
   - Cloudflare will automatically configure DNS

### Method 2: Using Wrangler CLI

```bash
# Customer
wrangler pages domain add customer.nilelink.app --project-name=nilelink-customer

# Dashboard
wrangler pages domain add dashboard.nilelink.app --project-name=nilelink-dashboard

# Delivery
wrangler pages domain add delivery.nilelink.app --project-name=nilelink-delivery

# Portal
wrangler pages domain add portal.nilelink.app --project-name=nilelink-portal

# POS
wrangler pages domain add pos.nilelink.app --project-name=nilelink-pos

# Supplier
wrangler pages domain add supplier.nilelink.app --project-name=nilelink-supplier

# Unified
wrangler pages domain add unified.nilelink.app --project-name=nilelink-unified
```

## 📊 Deployment URLs

After deployment, your applications will be available at:

| Application | Cloudflare Pages URL | Custom Domain |
|------------|---------------------|---------------|
| Customer | https://nilelink-customer.pages.dev | https://customer.nilelink.app |
| Dashboard | https://nilelink-dashboard.pages.dev | https://dashboard.nilelink.app |
| Delivery | https://nilelink-delivery.pages.dev | https://delivery.nilelink.app |
| Portal | https://nilelink-portal.pages.dev | https://portal.nilelink.app |
| POS | https://nilelink-pos.pages.dev | https://pos.nilelink.app |
| Supplier | https://nilelink-supplier.pages.dev | https://supplier.nilelink.app |
| Unified | https://nilelink-unified.pages.dev | https://unified.nilelink.app |

## 🔧 Troubleshooting

### Issue: "Not logged in to Wrangler"
**Solution**: Run `wrangler login` and authenticate in the browser

### Issue: "Project already exists"
**Solution**: The project was already created. You can:
- Deploy updates: `wrangler pages deploy out --project-name=nilelink-[app]`
- Or delete and recreate in the Cloudflare Dashboard

### Issue: "Build output directory not found"
**Solution**: Make sure you've built the application first:
```bash
cd web/[app-name]
npm install
npm run build
```

### Issue: "Permission denied"
**Solution**: Make sure your Cloudflare account has the necessary permissions

## 🔄 Continuous Deployment

### Option 1: GitHub Integration (Recommended)

1. Go to Cloudflare Dashboard → Workers & Pages → Pages
2. Click **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository: `Alnajaar/nilelink`
4. Configure build settings for each app (see build settings below)
5. Every push to `main` branch will trigger automatic deployment

### Build Settings for GitHub Integration

**Customer App:**
- Build command: `cd web/customer && npm install && npm run build`
- Build output directory: `web/customer/out`

**Dashboard App:**
- Build command: `cd web/dashboard && npm install && npm run build`
- Build output directory: `web/dashboard/out`

**Delivery App:**
- Build command: `cd web/delivery && npm install && npm run build`
- Build output directory: `web/delivery/out`

**Portal App:**
- Build command: `cd web/portal && npm install && npm run build`
- Build output directory: `web/portal/out`

**POS App:**
- Build command: `cd web/pos && npm install && npm run build`
- Build output directory: `web/pos/out`

**Supplier App:**
- Build command: `cd web/supplier && npm install && npm run build`
- Build output directory: `web/supplier/out`

**Unified App:**
- Build command: `cd web/unified && npm install && npm run build`
- Build output directory: `web/unified/out`

### Option 2: Wrangler CLI

Use the deployment scripts provided (`deploy-cloudflare.ps1` or `deploy-cloudflare.sh`)

## ✅ Verification Checklist

After deployment, verify:

- [ ] All applications are accessible via `.pages.dev` URLs
- [ ] Custom domains are configured and working
- [ ] SSL certificates are active (🔒 in browser)
- [ ] All pages load correctly
- [ ] Navigation works between pages
- [ ] API connections are working (if applicable)
- [ ] No console errors in browser developer tools

## 📞 Support

If you encounter issues:
1. Check Cloudflare Pages build logs
2. Verify DNS settings in Cloudflare Dashboard
3. Check application logs in browser console
4. Review Wrangler CLI output for errors

## 🎉 Success!

Once all applications are deployed and custom domains are configured, your NileLink ecosystem will be live at:

- 🛒 **Customer**: https://customer.nilelink.app
- 📊 **Dashboard**: https://dashboard.nilelink.app
- 🚚 **Delivery**: https://delivery.nilelink.app
- 🌐 **Portal**: https://portal.nilelink.app
- 💳 **POS**: https://pos.nilelink.app
- 📦 **Supplier**: https://supplier.nilelink.app
- 🔗 **Unified**: https://unified.nilelink.app

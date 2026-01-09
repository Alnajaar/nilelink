# NileLink v1.0.0 - Manual Deployment Commands

## Current Status Check

Run these commands to check what's completed:

```powershell
# 1. Check if Docker images were built
docker images | Select-String "nilelink"

# 2. Check Docker containers status
docker ps -a

# 3. Check if Customer app built
Test-Path "web\customer\out"

# 4. Check all frontend app builds
Get-ChildItem web\*\out -Directory
```

---

## Step 1: Start Backend Services

```powershell
# Navigate to project root
cd "c:\Users\nilel\Projects\Sduan\New folder\nilelink"

# Start backend services
docker-compose -f docker-compose.prod.yml up -d

# Wait 10 seconds, then check status
Start-Sleep -Seconds 10
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

---

## Step 2: Verify Backend Health

```powershell
# Check API health (wait ~30 seconds after starting)
Start-Sleep -Seconds 30
curl http://localhost:4000/api/system/health

# Or use PowerShell
Invoke-WebRequest -Uri "http://localhost:4000/api/system/health"
```

---

## Step 3: Build All Frontend Apps

```powershell
# Set API URL for all builds
$env:NEXT_PUBLIC_API_URL = "https://api.nilelink.app/api"
$env:NODE_ENV = "production"

# Build Customer App
cd web\customer
npm run build
cd ..\..

# Build POS App
cd web\pos
npm run build
cd ..\..

# Build Delivery App
cd web\delivery
npm run build
cd ..\..

# Build Supplier App
cd web\supplier
npm run build
cd ..\..

# Build Portal App
cd web\portal
npm run build
cd ..\..

# Build Dashboard App
cd web\dashboard
npm run build
cd ..\..

# Build Admin App (unified)
cd web\unified
npm run build
cd ..\..
```

---

## Step 4: Deploy to Cloudflare Pages

Set credentials first:

```powershell
$env:CLOUDFLARE_API_TOKEN = "7d7d30e32b63394fb28bf469f8ac37c3a4376"
$env:CLOUDFLARE_ACCOUNT_ID = "79b17f6d66b3dcfd8aca5f94a1f702d3"
```

Deploy each app:

```powershell
# Deploy Customer App
cd web\customer
wrangler pages deploy out --project-name=nilelink-customer --branch=production
cd ..\..

# Deploy POS App
cd web\pos
wrangler pages deploy out --project-name=nilelink-pos --branch=production
cd ..\..

# Deploy Delivery App
cd web\delivery
wrangler pages deploy out --project-name=nilelink-delivery --branch=production
cd ..\..

# Deploy Supplier App
cd web\supplier
wrangler pages deploy out --project-name=nilelink-supplier --branch=production
cd ..\..

# Deploy Portal App
cd web\portal
wrangler pages deploy out --project-name=nilelink-portal --branch=production
cd ..\..

# Deploy Dashboard App
cd web\dashboard
wrangler pages deploy out --project-name=nilelink-dashboard --branch=production
cd ..\..

# Deploy Admin App
cd web\unified
wrangler pages deploy out --project-name=nilelink-admin --branch=production
cd ..\..
```

---

## Step 5: Configure Custom Domains (Cloudflare Dashboard)

After deployments complete, configure custom domains:

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages** → **Pages**
3. For each project, click **Custom domains** → **Set up a custom domain**

| Project | Custom Domain |
|---------|---------------|
| nilelink-customer | nilelink.app |
| nilelink-pos | pos.nilelink.app |
| nilelink-delivery | delivery.nilelink.app |
| nilelink-supplier | supplier.nilelink.app |
| nilelink-portal | portal.nilelink.app |
| nilelink-dashboard | dashboard.nilelink.app |
| nilelink-admin | admin.nilelink.app |

---

## Step 6: Verification

```powershell
# Test Backend
curl http://localhost:4000/api/system/health

# Test each frontend (after DNS propagates)
curl https://nilelink.app
curl https://pos.nilelink.app
curl https://delivery.nilelink.app
curl https://supplier.nilelink.app
curl https://portal.nilelink.app
curl https://dashboard.nilelink.app
curl https://admin.nilelink.app
```

---

## Quick All-in-One Script

```powershell
# Set environment
$env:NEXT_PUBLIC_API_URL = "https://api.nilelink.app/api"
$env:NODE_ENV = "production"
$env:CLOUDFLARE_API_TOKEN = "7d7d30e32b63394fb28bf469f8ac37c3a4376"
$env:CLOUDFLARE_ACCOUNT_ID = "79b17f6d66b3dcfd8aca5f94a1f702d3"

# Start backend
docker-compose -f docker-compose.prod.yml up -d

# Build all frontends
$apps = @("customer", "pos", "delivery", "supplier", "portal", "dashboard", "unified")
foreach ($app in $apps) {
    Write-Host "Building $app..." -ForegroundColor Cyan
    cd "web\$app"
    npm run build
    cd ..\..
}

# Deploy all to Cloudflare
$deployments = @(
    @{app="customer"; project="nilelink-customer"},
    @{app="pos"; project="nilelink-pos"},
    @{app="delivery"; project="nilelink-delivery"},
    @{app="supplier"; project="nilelink-supplier"},
    @{app="portal"; project="nilelink-portal"},
    @{app="dashboard"; project="nilelink-dashboard"},
    @{app="unified"; project="nilelink-admin"}
)

foreach ($deploy in $deployments) {
    Write-Host "Deploying $($deploy.project)..." -ForegroundColor Green
    cd "web\$($deploy.app)"
    wrangler pages deploy out --project-name=$($deploy.project) --branch=production
    cd ..\..
}
```

---

## Alternative: Use Automated Script

```powershell
.\deploy-cloudflare.ps1
```

---

**Next**: Run the commands above and share any errors or output with me!

# ============================================================================
# NileLink v1.0.0 - Cloudflare Pages Automated Deployment
# Deploys all 7 frontend apps to Cloudflare Pages
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 NileLink v1.0.0 - Cloudflare Pages Deployment" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# Cloudflare Configuration
$CLOUDFLARE_ACCOUNT_ID = "79b17f6d66b3dcfd8aca5f94a1f702d3"
$CLOUDFLARE_API_TOKEN = $env:CLOUDFLARE_API_TOKEN
$CLOUDFLARE_EMAIL = "nilelink@hotmail.com"

# Frontend Apps Configuration
$apps = @(
    @{
        Name         = "nilelink-customer"
        Path         = "web/customer"
        Domain       = "nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-pos"
        Path         = "web/pos"
        Domain       = "pos.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-delivery"
        Path         = "web/delivery"
        Domain       = "delivery.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-supplier"
        Path         = "web/supplier"
        Domain       = "supplier.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-portal"
        Path         = "web/portal"
        Domain       = "portal.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-dashboard"
        Path         = "web/dashboard"
        Domain       = "dashboard.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    },
    @{
        Name         = "nilelink-admin"
        Path         = "web/unified"
        Domain       = "admin.nilelink.app"
        BuildCommand = "npm run build"
        OutputDir    = "out"
    }
)

# ============================================================================
# Check Prerequisites
# ============================================================================
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if Wrangler is installed
try {
    $wranglerVersion = wrangler --version 2>&1
    Write-Host "✓ Wrangler installed: $wranglerVersion`n" -ForegroundColor Green
}
catch {
    Write-Host "✗ Wrangler not found. Installing...`n" -ForegroundColor Red
    npm install -g wrangler
}

# ============================================================================
# Wrangler Login
# ============================================================================
Write-Host "Authenticating with Cloudflare..." -ForegroundColor Yellow

# Set environment variable for API token
$env:CLOUDFLARE_API_TOKEN = "7d7d30e32b63394fb28bf469f8ac37c3a4376"
$env:CLOUDFLARE_ACCOUNT_ID = $CLOUDFLARE_ACCOUNT_ID

Write-Host "✓ Credentials configured`n" -ForegroundColor Green

# ============================================================================
# Deploy Each Frontend App
# ============================================================================
$successCount = 0
$failCount = 0

foreach ($app in $apps) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Deploying: $($app.Name)" -ForegroundColor Cyan
    Write-Host "Domain: $($app.Domain)" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $appPath = Join-Path $PSScriptRoot $app.Path
    
    if (!(Test-Path $appPath)) {
        Write-Host "✗ Path not found: $appPath`n" -ForegroundColor Red
        $failCount++
        continue
    }
    
    try {
        # Navigate to app directory
        Push-Location $appPath
        
        # Set production environment
        $env:NODE_ENV = "production"
        $env:NEXT_PUBLIC_API_URL = "https://api.nilelink.app/api"
        
        Write-Host "Building $($app.Name)..." -ForegroundColor Gray
        
        # Install dependencies
        npm install --legacy-peer-deps
        
        # Build the app
        & npm run build
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "✓ Build successful`n" -ForegroundColor Green
        
        # Deploy to Cloudflare Pages
        Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Gray
        
        wrangler pages deploy $($app.OutputDir) `
            --project-name=$($app.Name) `
            --branch=main `
            --commit-dirty=true
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Deployed successfully!" -ForegroundColor Green
            Write-Host "  URL: https://$($app.Name).pages.dev" -ForegroundColor White
            Write-Host "  Custom Domain: https://$($app.Domain)`n" -ForegroundColor White
            $successCount++
        }
        else {
            throw "Deployment failed"
        }
        
    }
    catch {
        Write-Host "✗ Failed to deploy $($app.Name)" -ForegroundColor Red
        Write-Host "  Error: $_`n" -ForegroundColor Gray
        $failCount++
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# Summary
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✓ Successful: $successCount" -ForegroundColor Green
Write-Host "✗ Failed: $failCount`n" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "🎉 All apps deployed successfully!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure custom domains in Cloudflare Pages dashboard" -ForegroundColor White
    Write-Host "  2. Verify all apps are accessible via HTTPS" -ForegroundColor White
    Write-Host "  3. Test authentication across subdomains" -ForegroundColor White
    Write-Host "  4. Update CORS settings on backend if needed`n" -ForegroundColor White
}
else {
    Write-Host "Some deployments failed. Please review errors above.`n" -ForegroundColor Yellow
    exit 1
}

#!/usr/bin/env pwsh
# NileLink Cloudflare Pages Deployment Script
# This script deploys all NileLink applications to Cloudflare Pages

Write-Host "🚀 NileLink Cloudflare Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler CLI is not installed!" -ForegroundColor Red
    Write-Host "📦 Installing Wrangler globally..." -ForegroundColor Yellow
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Wrangler. Please install it manually: npm install -g wrangler" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Wrangler CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if user is logged in to Wrangler
Write-Host "🔐 Checking Wrangler authentication..." -ForegroundColor Yellow
wrangler whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Wrangler!" -ForegroundColor Red
    Write-Host "🔑 Please login to Wrangler..." -ForegroundColor Yellow
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login. Please try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated with Cloudflare" -ForegroundColor Green
Write-Host ""

# Define applications to deploy
$apps = @(
    @{Name="customer"; Domain="customer.nilelink.app"},
    @{Name="dashboard"; Domain="dashboard.nilelink.app"},
    @{Name="delivery"; Domain="delivery.nilelink.app"},
    @{Name="portal"; Domain="portal.nilelink.app"},
    @{Name="pos"; Domain="pos.nilelink.app"},
    @{Name="supplier"; Domain="supplier.nilelink.app"},
    @{Name="unified"; Domain="unified.nilelink.app"}
)

$totalApps = $apps.Count
$currentApp = 0
$successCount = 0
$failCount = 0

Write-Host "📋 Deploying $totalApps applications..." -ForegroundColor Cyan
Write-Host ""

foreach ($app in $apps) {
    $currentApp++
    $appName = $app.Name
    $appDomain = $app.Domain
    $appPath = "web/$appName"
    
    Write-Host "[$currentApp/$totalApps] 🚀 Deploying $appName ($appDomain)..." -ForegroundColor Cyan
    Write-Host "  📁 Path: $appPath" -ForegroundColor Gray
    
    # Check if directory exists
    if (-not (Test-Path $appPath)) {
        Write-Host "  ❌ Directory not found: $appPath" -ForegroundColor Red
        $failCount++
        continue
    }
    
    # Navigate to app directory
    Push-Location $appPath
    
    try {
        # Deploy to Cloudflare Pages
        Write-Host "  📦 Building and deploying..." -ForegroundColor Yellow
        wrangler pages deploy out --project-name="nilelink-$appName" --branch=main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Successfully deployed $appName!" -ForegroundColor Green
            Write-Host "  🌐 URL: https://nilelink-$appName.pages.dev" -ForegroundColor Green
            Write-Host "  🔗 Custom domain: https://$appDomain" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ Failed to deploy $appName" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "  ❌ Error deploying $appName : $_" -ForegroundColor Red
        $failCount++
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "📦 Total: $totalApps" -ForegroundColor Cyan
Write-Host ""

if ($successCount -eq $totalApps) {
    Write-Host "🎉 All applications deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Configure custom domains in Cloudflare Dashboard" -ForegroundColor White
    Write-Host "2. Add DNS CNAME records for each subdomain" -ForegroundColor White
    Write-Host "3. Verify SSL certificates" -ForegroundColor White
    Write-Host "4. Test all applications" -ForegroundColor White
} else {
    Write-Host "⚠️  Some deployments failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Cloudflare Dashboard: https://dash.cloudflare.com" -ForegroundColor Cyan

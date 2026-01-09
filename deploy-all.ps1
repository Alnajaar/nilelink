#!/usr/bin/env pwsh

# Deploy all NileLink apps to Cloudflare Pages
$apps = @("unified", "pos", "delivery", "supplier", "dashboard")

foreach ($app in $apps) {
    Write-Host "`n=== Deploying $app ===" -ForegroundColor Cyan
    
    Set-Location "web/$app"
    
    # Build
    Write-Host "Building $app..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed for $app" -ForegroundColor Red
        Set-Location ../..
        continue
    }
    
    # Deploy to Cloudflare
    Write-Host "Deploying $app to Cloudflare Pages..." -ForegroundColor Yellow
    npx wrangler pages deploy out --project-name="nilelink-$app"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $app deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ $app deployment failed" -ForegroundColor Red
    }
    
    Set-Location ../..
}

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Cyan

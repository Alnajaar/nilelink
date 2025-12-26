# Configure Custom Domains for NileLink Applications

Write-Host "🌐 NileLink Custom Domain Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Custom domains need to be configured through the Cloudflare Dashboard." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔗 Opening Cloudflare Dashboard..." -ForegroundColor Green
Start-Process "https://dash.cloudflare.com/?to=/:account/pages"

Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "For each project, follow these steps:" -ForegroundColor White
Write-Host ""

$apps = @(
    @{Project = "nilelink-customer"; Domain = "customer.nilelink.app" },
    @{Project = "nilelink-dashboard"; Domain = "dashboard.nilelink.app" },
    @{Project = "nilelink-delivery"; Domain = "delivery.nilelink.app" },
    @{Project = "nilelink-portal"; Domain = "portal.nilelink.app" },
    @{Project = "nilelink-pos"; Domain = "pos.nilelink.app" },
    @{Project = "nilelink-supplier"; Domain = "supplier.nilelink.app" },
    @{Project = "nilelink-unified"; Domain = "unified.nilelink.app" }
)

foreach ($app in $apps) {
    Write-Host "  ✅ Project: $($app.Project)" -ForegroundColor Green
    Write-Host "     Domain: $($app.Domain)" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Steps to configure each domain:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Click on the project name (e.g., 'nilelink-customer')" -ForegroundColor White
Write-Host "2. Go to the 'Custom domains' tab" -ForegroundColor White
Write-Host "3. Click 'Set up a custom domain'" -ForegroundColor White
Write-Host "4. Enter the domain (e.g., 'customer.nilelink.app')" -ForegroundColor White
Write-Host "5. Click 'Continue'" -ForegroundColor White
Write-Host "6. Cloudflare will automatically configure DNS" -ForegroundColor White
Write-Host ""
Write-Host "Repeat for all 7 applications!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Once configured, your apps will be live at:" -ForegroundColor Cyan
Write-Host ""

foreach ($app in $apps) {
    Write-Host "  🔗 https://$($app.Domain)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

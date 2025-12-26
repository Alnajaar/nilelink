# Setting up environment variables for Wrangler
$env:CLOUDFLARE_API_TOKEN = "g3pyenjpUQl5BYNWL90eoz9v90kNR-grTibjtE2i"
$env:CLOUDFLARE_ACCOUNT_ID = "79b17f6d66b3dcfd8aca5f94a1f702d3"

$apps = @(
    @{Project = "nilelink-portal"; Domain = "nilelink.app" },
    @{Project = "nilelink-customer"; Domain = "customer.nilelink.app" },
    @{Project = "nilelink-dashboard"; Domain = "dashboard.nilelink.app" },
    @{Project = "nilelink-delivery"; Domain = "delivery.nilelink.app" },
    @{Project = "nilelink-pos"; Domain = "pos.nilelink.app" },
    @{Project = "nilelink-supplier"; Domain = "supplier.nilelink.app" },
    @{Project = "nilelink-unified"; Domain = "unified.nilelink.app" },
    @{Project = "nilelink-invest"; Domain = "invest.nilelink.app" }
)

foreach ($app in $apps) {
    Write-Host "Adding custom domain $($app.Domain) to project $($app.Project)..." -ForegroundColor Cyan
    try {
        npx wrangler pages domain add --project-name $($app.Project) $($app.Domain)
        Write-Host "✅ Success!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed for $($app.Domain)" -ForegroundColor Red
    }
}

# ============================================================================
# Complete NileLink Subdomain Setup Script
# ============================================================================
# Creates ALL required subdomains according to CLOUDFLARE_DEPLOYMENT.md
# Run this to set up fresh DNS records

param(
    [string]$CloudflareApiToken = "",
    [switch]$DryRun
)

Write-Host "🚀 NileLink Complete Subdomain Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

if (-not $CloudflareApiToken) {
    Write-Host "❌ Missing Cloudflare API Token!" -ForegroundColor Red
    Write-Host "Get token from: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
    Write-Host "Usage: .\setup-all-subdomains.ps1 -CloudflareApiToken 'YOUR_TOKEN'" -ForegroundColor Yellow
    exit 1
}

# Subdomain mapping from CLOUDFLARE_DEPLOYMENT.md
$subdomains = @(
    @{ Name = "nilelink.app"; Content = "nilelink-portal.pages.dev"; Type = "main" },
    @{ Name = "pos.nilelink.app"; Content = "nilelink-pos.pages.dev"; Type = "subdomain" },
    @{ Name = "delivery.nilelink.app"; Content = "nilelink-delivery.pages.dev"; Type = "subdomain" },
    @{ Name = "supplier.nilelink.app"; Content = "nilelink-supplier.pages.dev"; Type = "subdomain" },
    @{ Name = "portal.nilelink.app"; Content = "nilelink-portal.pages.dev"; Type = "subdomain" },
    @{ Name = "dashboard.nilelink.app"; Content = "nilelink-dashboard.pages.dev"; Type = "subdomain" },
    @{ Name = "admin.nilelink.app"; Content = "nilelink-admin.pages.dev"; Type = "subdomain" },
    @{ Name = "customer.nilelink.app"; Content = "nilelink-customer.pages.dev"; Type = "subdomain" },
    @{ Name = "investor.nilelink.app"; Content = "nilelink-investor.pages.dev"; Type = "subdomain" },
    @{ Name = "super-admin.nilelink.app"; Content = "nilelink-super-admin.pages.dev"; Type = "subdomain" },
    @{ Name = "unified.nilelink.app"; Content = "nilelink-unified.pages.dev"; Type = "subdomain" },
    @{ Name = "api.nilelink.app"; Content = "100::"; Type = "worker" }
)

# Get Zone ID
Write-Host "🔍 Finding nilelink.app zone..." -ForegroundColor Yellow
try {
    $zones = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=nilelink.app" `
        -Headers @{ "Authorization" = "Bearer $CloudflareApiToken" }

    if ($zones.result.Count -eq 0) {
        Write-Host "❌ Zone nilelink.app not found! Make sure domain is added to Cloudflare." -ForegroundColor Red
        exit 1
    }

    $zoneId = $zones.result[0].id
    Write-Host "✅ Zone ID: $zoneId" -ForegroundColor Green

}
catch {
    Write-Host "❌ Error finding zone: $_" -ForegroundColor Red
    exit 1
}

# Function to create DNS record
function Create-DNSRecord {
    param([string]$Type, [string]$Name, [string]$Content, [bool]$Proxied = $true)

    if ($DryRun) {
        Write-Host "🔍 Would create: $Type $Name → $Content (Proxied: $Proxied)" -ForegroundColor Magenta
        return
    }

    $body = @{
        type    = $Type
        name    = $Name
        content = $Content
        ttl     = 1
        proxied = $Proxied
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
            -Method POST `
            -Headers @{
            "Authorization" = "Bearer $CloudflareApiToken"
            "Content-Type"  = "application/json"
        } `
            -Body $body

        if ($response.success) {
            Write-Host "✅ Created $Name → $Content" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to create $Name : $($response.errors)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error creating $Name : $_" -ForegroundColor Red
    }
}

# Get existing DNS records
Write-Host "`n🔍 Fetching existing DNS records..." -ForegroundColor Yellow
try {
    $existingRecords = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?per_page=100" `
        -Headers @{ "Authorization" = "Bearer $CloudflareApiToken" }
    
    $existingNames = $existingRecords.result | ForEach-Object { $_.name }
}
catch {
    Write-Host "❌ Error fetching existing records: $_" -ForegroundColor Red
    exit 1
}

# Create missing records
Write-Host "`n🔧 Creating missing DNS records..." -ForegroundColor Yellow

foreach ($sub in $subdomains) {
    if ($sub.Type -eq "main") {
        continue
    }

    if ($existingNames -contains $sub.Name) {
        Write-Host "ℹ️ Skipping existing record: $($sub.Name)" -ForegroundColor Cyan
        continue
    }

    if ($sub.Type -eq "worker") {
        Create-DNSRecord -Type "AAAA" -Name "api" -Content $sub.Content -Proxied $true
    }
    else {
        $name = $sub.Name -replace '\.nilelink\.app$', ''
        Create-DNSRecord -Type "CNAME" -Name $name -Content $sub.Content -Proxied $true
    }
}

Write-Host "`n🎉 DNS setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy Cloudflare Pages projects for each app" -ForegroundColor White
Write-Host "2. Add custom domains in Pages dashboard" -ForegroundColor White
Write-Host "3. Update NEXT_PUBLIC_API_URL=https://api.nilelink.app/api" -ForegroundColor White
Write-Host "4. Test all subdomains load correctly" -ForegroundColor White

if ($DryRun) {
    Write-Host "`n🔍 This was a dry run. Remove -DryRun to actually create records." -ForegroundColor Yellow
}
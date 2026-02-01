# ============================================================================
# Cloudflare Subdomain Setup Script - NileLink
# ============================================================================
# This script helps configure all missing subdomains for NileLink apps
# Run this after deploying Cloudflare Pages projects

param(
    [string]$CloudflareAccountId = "",
    [string]$CloudflareApiToken = ""
)

Write-Host "🚀 NileLink Subdomain Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if credentials provided
if (-not $CloudflareAccountId -or -not $CloudflareApiToken) {
    Write-Host "❌ Missing Cloudflare credentials!" -ForegroundColor Red
    Write-Host "Usage: .\setup-subdomains.ps1 -CloudflareAccountId 'YOUR_ACCOUNT_ID' -CloudflareApiToken 'YOUR_API_TOKEN'" -ForegroundColor Yellow
    exit 1
}

# Function to create CNAME record
function Create-CNAME {
    param([string]$Name, [string]$Content)

    $body = @{
        type = "CNAME"
        name = $Name
        content = $Content
        ttl = 1
        proxied = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/dns_records" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $CloudflareApiToken"
                "Content-Type" = "application/json"
            } `
            -Body $body

        if ($response.success) {
            Write-Host "✅ Created $Name → $Content" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create $Name" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error creating $Name : $_" -ForegroundColor Red
    }
}

# Get Zone ID for nilelink.app
Write-Host "🔍 Getting Zone ID for nilelink.app..." -ForegroundColor Yellow
try {
    $zones = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=nilelink.app" `
        -Headers @{ "Authorization" = "Bearer $CloudflareApiToken" }

    if ($zones.result.Count -eq 0) {
        Write-Host "❌ Zone nilelink.app not found!" -ForegroundColor Red
        exit 1
    }

    $zoneId = $zones.result[0].id
    Write-Host "✅ Zone ID: $zoneId" -ForegroundColor Green

    # Replace YOUR_ZONE_ID in the script
    $scriptPath = $MyInvocation.MyCommand.Path
    $content = Get-Content $scriptPath -Raw
    $content = $content -replace "YOUR_ZONE_ID", $zoneId
    Set-Content $scriptPath $content

} catch {
    Write-Host "❌ Error getting zone: $_" -ForegroundColor Red
    exit 1
}

# Create missing subdomains
Write-Host "`n🔧 Creating missing subdomains..." -ForegroundColor Yellow

# Super Admin
Create-CNAME -Name "super-admin" -Content "nilelink-super-admin.pages.dev"

# Unified (if different from admin)
Create-CNAME -Name "unified" -Content "nilelink-unified.pages.dev"

# Investor (correct name)
if (-not (Get-Content "current_dns.json" | Select-String "investor.nilelink.app")) {
    Create-CNAME -Name "investor" -Content "nilelink-invest.pages.dev"
}

Write-Host "`n🎉 Subdomain setup complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy Cloudflare Pages projects for missing apps" -ForegroundColor White
Write-Host "2. Update NEXT_PUBLIC_API_URL in each project" -ForegroundColor White
Write-Host "3. Test all subdomains load correctly" -ForegroundColor White
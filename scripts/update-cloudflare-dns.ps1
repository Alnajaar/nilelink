$headers = @{
    "X-Auth-Email" = "nilelink@hotmail.com"
    "X-Auth-Key"   = "7d7d30e32b63394fb28bf469f8ac37c3a4376"
    "Content-Type" = "application/json"
}

$zoneId = "66f8e193a4c1a3a9a4533aeb820584fc"

function Add-DnsRecord {
    param($Name, $Content)
    $body = @{
        type    = "CNAME"
        name    = $Name
        content = $Content
        ttl     = 1
        proxied = $true
    } | ConvertTo-Json
    
    Write-Host "Adding record: $Name -> $Content"
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Method Post -Headers $headers -Body $body
        if ($response.success) {
            Write-Host "✅ Successfully added $Name" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to add $Name : $($response.errors.message)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Exception adding $Name : $_" -ForegroundColor Red
    }
}

Add-DnsRecord -Name "*" -Content "nilelink-portal.pages.dev"
Add-DnsRecord -Name "dashboard" -Content "nilelink-dashboard.pages.dev"
Add-DnsRecord -Name "unified" -Content "nilelink-unified.pages.dev"

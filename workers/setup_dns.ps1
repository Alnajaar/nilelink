$API_TOKEN = "oQDxpDvH24UJeQWKuZw1acEL6BbKzksL5y4MrodJ"
$ZONE_ID = "66f8e193a4c1a3a9a4533aeb820584fc"
$BASE_URL = "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records"

function Add-DnsRecord {
    param (
        [string]$Name,
        [string]$Target,
        [boolean]$Proxied = $true
    )

    $body = @{
        type = "CNAME"
        name = $Name
        content = $Target
        ttl = 1
        proxied = $Proxied
    } | ConvertTo-Json

    echo "Creating record: $Name -> $Target"
    
    try {
        $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -Headers @{
            "Authorization" = "Bearer $API_TOKEN"
            "Content-Type" = "application/json"
        } -Body $body
        
        if ($response.success) {
            echo "✅ Success: $($response.result.name)"
        } else {
            echo "❌ Failed: $($response.errors[0].message)"
        }
    } catch {
        echo "❌ Error: $_"
    }
}

# Create Records
Add-DnsRecord -Name "pos" -Target "nilelink-pos.pages.dev"
Add-DnsRecord -Name "admin" -Target "nilelink-admin.pages.dev"
Add-DnsRecord -Name "vendor" -Target "nilelink-vendor.pages.dev"
Add-DnsRecord -Name "delivery" -Target "nilelink-delivery.pages.dev"
Add-DnsRecord -Name "assets" -Target "gateway.pinata.cloud" # IPFS Gateway alias

# For Edge Worker, we create a placeholder if it doesn't exist to ensure routing
Add-DnsRecord -Name "edge" -Target "nilelink-ipfs-token.nilelink.workers.dev" # Tentative target

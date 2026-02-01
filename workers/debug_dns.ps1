$API_TOKEN = "oQDxpDvH24UJeQWKuZw1acEL6BbKzksL5y4MrodJ"
$ZONE_ID = "66f8e193a4c1a3a9a4533aeb820584fc"
$BASE_URL = "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records"

Write-Host "Testing Cloudflare Connectivity..."
try {
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Get -Headers @{
        "Authorization" = "Bearer $API_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    if ($response.success) {
        Write-Host "✅ Connected successfully."
        Write-Host "Found $($response.result.Count) records:"
        foreach ($record in $response.result) {
            Write-Host " - $($record.type) $($record.name) -> $($record.content)"
        }
    }
    else {
        Write-Host "❌ API returned failure:"
        Write-Host ($response | ConvertTo-Json -Depth 5)
    }
}
catch {
    Write-Host "❌ Request failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}

$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 nilelink.app",
    "127.0.0.1 demo.nilelink.app",
    "127.0.0.1 pos.nilelink.app",
    "127.0.0.1 delivery.nilelink.app",
    "127.0.0.1 customer.nilelink.app",
    "127.0.0.1 supplier.nilelink.app",
    "127.0.0.1 dashboard.nilelink.app",
    "127.0.0.1 portal.nilelink.app",
    "127.0.0.1 unified.nilelink.app",
    "127.0.0.1 docs.nilelink.app",
    "127.0.0.1 status.nilelink.app",
    "127.0.0.1 system.nilelink.app"
)

# Check for admin rights
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Please run this script as Administrator to update the hosts file."
    return
}

$currentHosts = Get-Content $hostsPath
$added = $false

foreach ($entry in $entries) {
    if ($currentHosts -notcontains $entry) {
        Add-Content -Path $hostsPath -Value "`n$entry"
        Write-Host "Added: $entry"
        $added = $true
    }
    else {
        Write-Host "Skipping (already exists): $entry"
    }
}

if ($added) {
    Write-Host "`n✅ Local DNS setup complete. You can now access NileLink apps via subdomains."
    Write-Host "⚠️  Note: You still need to include the port number (e.g., http://demo.nilelink.app:3001) unless a reverse proxy is used."
}
else {
    Write-Host "`n✅ All entries already present in hosts file."
}

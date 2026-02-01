# NileLink Protocol - App Orchestrator
# Launches Admin (Port 3003) and Supplier (Port 3004) concurrently

Write-Host "🚀 Launching NileLink Ecosystem Apps..." -ForegroundColor Cyan

# Start Admin App
Write-Host "Starting Admin App on http://localhost:3003..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location web/admin; npm run dev"

# Start Supplier App
Write-Host "Starting Supplier App on http://localhost:3004..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location web/supplier; npm run dev"

Write-Host " "
Write-Host "✅ Both apps are starting in separate windows." -ForegroundColor Yellow
Write-Host "Admin Port: 3003 (Webpack Mode)"
Write-Host "Supplier Port: 3004"
Write-Host " "
Write-Host "If the windows close immediately, check if 'npm install' finished in both folders." -ForegroundColor Gray

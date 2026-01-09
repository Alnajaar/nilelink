# ============================================================================
# NileLink v1.0.0 Deployment Verification Script
# ============================================================================

Write-Host "`n🔍 NileLink v1.0.0 - Deployment Verification" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# ============================================================================
# 1. Docker State Verification
# ============================================================================
Write-Host "1. Docker State" -ForegroundColor Yellow
Write-Host "---------------`n" -ForegroundColor Yellow

# Check if containers are running
$runningContainers = docker ps --format "{{.Names}}"

if ($runningContainers -match "nilelink-api-v1") {
    Write-Host "✓ API container running" -ForegroundColor Green
}
else {
    Write-Host "✗ API container not running" -ForegroundColor Red
    $errors++
}

if ($runningContainers -match "nilelink-postgres-v1") {
    Write-Host "✓ Postgres container running" -ForegroundColor Green
}
else {
    Write-Host "✗ Postgres container not running" -ForegroundColor Red
    $errors++
}

if ($runningContainers -match "nilelink-redis-v1") {
    Write-Host "✓ Redis container running`n" -ForegroundColor Green
}
else {
    Write-Host "✗ Redis container not running`n" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 2. Backend Health Checks
# ============================================================================
Write-Host "2. Backend Health" -ForegroundColor Yellow
Write-Host "-----------------`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/system/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API health check passed" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)`n" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ API health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Gray
    $errors++
}

# ============================================================================
# 3. Database Connection
# ============================================================================
Write-Host "3. Database Connection" -ForegroundColor Yellow
Write-Host "---------------------`n" -ForegroundColor Yellow

try {
    $dbCheck = docker exec nilelink-postgres-v1 pg_isready -U nilelink 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database accepting connections`n" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Database not ready`n" -ForegroundColor Red
        $errors++
    }
}
catch {
    Write-Host "✗ Cannot connect to database container`n" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 4. Redis Connection
# ============================================================================
Write-Host "4. Redis Connection" -ForegroundColor Yellow
Write-Host "------------------`n" -ForegroundColor Yellow

try {
    $redisCheck = docker exec nilelink-redis-v1 redis-cli ping 2>&1
    if ($redisCheck -match "PONG") {
        Write-Host "✓ Redis responding`n" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Redis not responding`n" -ForegroundColor Red
        $errors++
    }
}
catch {
    Write-Host "✗ Cannot connect to Redis container`n" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 5. Environment Configuration
# ============================================================================
Write-Host "5. Environment Configuration" -ForegroundColor Yellow
Write-Host "---------------------------`n" -ForegroundColor Yellow

if (Test-Path ".env.production") {
    Write-Host "✓ .env.production exists" -ForegroundColor Green
    
    # Check for critical variables
    $envContent = Get-Content ".env.production" -Raw
    
    if ($envContent -match "POSTGRES_PASSWORD=.+") {
        Write-Host "✓ POSTGRES_PASSWORD configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ POSTGRES_PASSWORD not set" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($envContent -match "JWT_SECRET=.+") {
        Write-Host "✓ JWT_SECRET configured`n" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ JWT_SECRET not set`n" -ForegroundColor Yellow
        $warnings++
    }
}
else {
    Write-Host "✗ .env.production missing`n" -ForegroundColor Red
    $errors++
}

# ============================================================================
# 6. Frontend Readiness
# ============================================================================
Write-Host "6. Frontend Build Readiness" -ForegroundColor Yellow
Write-Host "--------------------------`n" -ForegroundColor Yellow

$frontendApps = @("customer", "pos", "delivery", "supplier", "portal", "dashboard", "unified")
foreach ($app in $frontendApps) {
    $configPath = "web\$app\next.config.js"
    if (Test-Path $configPath) {
        $config = Get-Content $configPath -Raw
        if ($config -match "output:\s*'export'") {
            Write-Host "✓ $app configured for static export" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ $app may not be configured for static export" -ForegroundColor Yellow
            $warnings++
        }
    }
    else {
        Write-Host "✗ $app next.config.js not found" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""

# ============================================================================
# 7. Docker Image Verification
# ============================================================================
Write-Host "7. Docker Images" -ForegroundColor Yellow
Write-Host "---------------`n" -ForegroundColor Yellow

$images = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "nilelink"

if ($images -match "nilelink/api:v1.0.0") {
    Write-Host "✓ Backend image tagged v1.0.0`n" -ForegroundColor Green
}
else {
    Write-Host "⚠ Backend image not tagged v1.0.0`n" -ForegroundColor Yellow
    $warnings++
}

# ============================================================================
# 8. Volume Verification
# ============================================================================
Write-Host "8. Data Persistence" -ForegroundColor Yellow
Write-Host "------------------`n" -ForegroundColor Yellow

$volumes = docker volume ls --format "{{.Name}}"

if ($volumes -match "nilelink_postgres_v1") {
    Write-Host "✓ Postgres data volume exists" -ForegroundColor Green
}
else {
    Write-Host "✗ Postgres data volume missing" -ForegroundColor Red
    $errors++
}

if ($volumes -match "nilelink_redis_v1") {
    Write-Host "✓ Redis data volume exists`n" -ForegroundColor Green
}
else {
    Write-Host "✗ Redis data volume missing`n" -ForegroundColor Red
    $errors++
}

# ============================================================================
# Final Report
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "Backend is ready for production.`n" -ForegroundColor Green
    exit 0
}
elseif ($errors -eq 0) {
    Write-Host "⚠ $warnings warning(s) found" -ForegroundColor Yellow
    Write-Host "Backend is functional but review warnings.`n" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "✗ $errors error(s) and $warnings warning(s) found" -ForegroundColor Red
    Write-Host "Please fix errors before deploying to production.`n" -ForegroundColor Red
    exit 1
}

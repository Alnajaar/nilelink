# ============================================================================
# NileLink v1.0.0 - Complete Docker Reset & Rebuild Script
# Run this to completely reset Docker and rebuild production environment
# ============================================================================

Write-Host "🔥 NileLink v1.0.0 - Docker Nuclear Reset" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================================================
# Phase 1: Complete Docker Cleanup
# ============================================================================
Write-Host "Phase 1: Docker Cleanup" -ForegroundColor Yellow
Write-Host "----------------------`n" -ForegroundColor Yellow

Write-Host "Stopping all containers..." -ForegroundColor Gray
docker stop $(docker ps -aq) 2>$null
if ($?) { Write-Host "✓ Containers stopped`n" -ForegroundColor Green }

Write-Host "Removing all containers..." -ForegroundColor Gray
docker rm $(docker ps -aq) 2>$null
if ($?) { Write-Host "✓ Containers removed`n" -ForegroundColor Green }

Write-Host "Removing all images..." -ForegroundColor Gray
docker rmi $(docker images -q) --force 2>$null
if ($?) { Write-Host "✓ Images removed`n" -ForegroundColor Green }

Write-Host "Removing all volumes..." -ForegroundColor Gray
docker volume rm $(docker volume ls -q) --force 2>$null
if ($?) { Write-Host "✓ Volumes removed`n" -ForegroundColor Green }

Write-Host "Pruning system..." -ForegroundColor Gray
docker system prune -a --volumes --force
Write-Host "✓ System pruned`n" -ForegroundColor Green

# ============================================================================
# Phase 2: Verify Clean State
# ============================================================================
Write-Host "`nPhase 2: Verification" -ForegroundColor Yellow
Write-Host "--------------------`n" -ForegroundColor Yellow

$containers = docker ps -a -q
$images = docker images -q
$volumes = docker volume ls -q

if ($containers) {
    Write-Host "⚠ Warning: Containers still present" -ForegroundColor Red
} else {
    Write-Host "✓ No containers" -ForegroundColor Green
}

if ($images) {
    Write-Host "⚠ Warning: Images still present" -ForegroundColor Red
} else {
    Write-Host "✓ No images" -ForegroundColor Green
}

if ($volumes) {
    Write-Host "⚠ Warning: Volumes still present" -ForegroundColor Red
} else {
    Write-Host "✓ No volumes" -ForegroundColor Green
}

# ============================================================================
# Phase 3: Environment Check
# ============================================================================
Write-Host "`nPhase 3: Environment Check" -ForegroundColor Yellow
Write-Host "-------------------------`n" -ForegroundColor Yellow

if (Test-Path ".env.production") {
    Write-Host "✓ .env.production found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.production not found" -ForegroundColor Red
    Write-Host "  Creating from template..." -ForegroundColor Gray
    Copy-Item ".env.production.example" ".env.production"
    Write-Host "  ⚠ Please edit .env.production with your secrets!" -ForegroundColor Yellow
}

# ============================================================================
# Phase 4: Build Production Backend
# ============================================================================
Write-Host "`nPhase 4: Build Production Backend" -ForegroundColor Yellow
Write-Host "--------------------------------`n" -ForegroundColor Yellow

Write-Host "Building backend image (v1.0.0)..." -ForegroundColor Gray
docker-compose -f docker-compose.prod.yml build --no-cache

if ($?) {
    Write-Host "✓ Backend built successfully`n" -ForegroundColor Green
} else {
    Write-Host "✗ Backend build failed`n" -ForegroundColor Red
    exit 1
}

# ============================================================================
# Phase 5: Start Services
# ============================================================================
Write-Host "`nPhase 5: Start Services" -ForegroundColor Yellow
Write-Host "----------------------`n" -ForegroundColor Yellow

docker-compose -f docker-compose.prod.yml up -d

Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# ============================================================================
# Phase 6: Health Check
# ============================================================================
Write-Host "`nPhase 6: Health Check" -ForegroundColor Yellow
Write-Host "--------------------`n" -ForegroundColor Yellow

Write-Host "Checking Postgres..." -ForegroundColor Gray
docker exec nilelink-postgres-v1 pg_isready -U nilelink
if ($?) { Write-Host "✓ Postgres healthy" -ForegroundColor Green }

Write-Host "Checking Redis..." -ForegroundColor Gray
docker exec nilelink-redis-v1 redis-cli ping
if ($?) { Write-Host "✓ Redis healthy" -ForegroundColor Green }

Write-Host "Checking API..." -ForegroundColor Gray
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/system/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API healthy`n" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ API not responding yet (may need more time)`n" -ForegroundColor Yellow
}

# ============================================================================
# Final Status
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Docker Reset & Rebuild Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend Services:" -ForegroundColor Yellow
Write-Host "  • API:      http://localhost:4000" -ForegroundColor White
Write-Host "  • Postgres: localhost:5432" -ForegroundColor White
Write-Host "  • Redis:    localhost:6379`n" -ForegroundColor White

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy frontend apps to Cloudflare Pages" -ForegroundColor White
Write-Host "  2. Configure DNS for api.nilelink.app" -ForegroundColor White
Write-Host "  3. Run migrations: docker exec nilelink-api-v1 npx prisma migrate deploy" -ForegroundColor White
Write-Host "  4. Test API: curl http://localhost:4000/api/system/health`n" -ForegroundColor White

Write-Host "View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Gray

@echo off
REM NileLink Protocol - Unified Deployment Script (Windows)
REM Deploys all frontends to Cloudflare Pages with subdomains

echo 🚀 Starting NileLink Protocol Deployment...

REM Check if Cloudflare CLI is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Wrangler CLI not found. Install with: npm install -g wrangler
    exit /b 1
)

REM Check if logged in to Cloudflare
wrangler auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Not logged in to Cloudflare. Please run: wrangler auth login
    exit /b 1
)

REM Define frontend projects and their subdomains
set FRONTENDS[0]=portal:nilelink-portal
set FRONTENDS[1]=pos:pos:nilelink-pos
set FRONTENDS[2]=dashboard:dashboard:nilelink-dashboard
set FRONTENDS[3]=supplier:supplier:nilelink-supplier
set FRONTENDS[4]=customer:customer:nilelink-customer
set FRONTENDS[5]=delivery:delivery:nilelink-delivery
set FRONTENDS[6]=unified:unified:nilelink-unified
set FRONTENDS[7]=investor:invest:nilelink-invest

REM Build and deploy each frontend
for /L %%i in (0,1,7) do (
    for /f "tokens=1,2,3 delims=:" %%a in ("!FRONTENDS[%%i]!") do (
        set "folder=%%a"
        set "subdomain=%%b"
        set "project_name=%%c"

        echo [DEPLOY] Building !folder! frontend...
        cd "web\!folder!"

        REM Install dependencies if needed
        if not exist "node_modules" (
            npm install
        )

        REM Build for production
        npm run build

        REM Deploy to Cloudflare Pages
        if "!subdomain!"=="" (
            echo [DEPLOY] Deploying !folder! to nilelink.app...
            wrangler pages deploy out --project-name="!project_name!" --branch=main --commit-message="Deploy !folder! to root"
        ) else (
            echo [DEPLOY] Deploying !folder! to !subdomain!.nilelink.app...
            wrangler pages deploy out --project-name="!project_name!" --branch=main --commit-message="Deploy !folder!"
        )

        cd ..\..
        echo [SUCCESS] !folder! deployed successfully
    )
)

REM Deploy backend to Cloudflare Workers (API)
echo [DEPLOY] Deploying backend API to Cloudflare Workers...
cd backend

REM Build and deploy backend
wrangler deploy

cd ..
echo [SUCCESS] Backend API deployed to https://api.nilelink.app

echo 🎉 NileLink Protocol deployment complete!
echo.
echo Access your applications:
echo   🌐 Portal:     https://nilelink.app
echo   🏪 POS:        https://pos.nilelink.app
echo   📊 Dashboard:  https://dashboard.nilelink.app
echo   👨‍💼 Supplier:   https://supplier.nilelink.app
echo   👤 Customer:   https://customer.nilelink.app
echo   🚚 Delivery:   https://delivery.nilelink.app
echo   🔗 Unified:    https://unified.nilelink.app
echo   💰 Invest:     https://invest.nilelink.app
echo   🔧 API:        https://api.nilelink.app
echo.
echo [INFO] Next steps:
echo   1. Monitor Cloudflare analytics for nilelink.app
echo   2. Test wallet connections and smart contract interactions
echo.

pause

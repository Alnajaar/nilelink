@echo off
REM NileLink Protocol - Complete Development Environment Startup
REM Windows batch version for local development

echo 🚀 Starting NileLink Protocol Development Environment
echo =====================================================

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo 📦 Starting Docker services (PostgreSQL + Redis)...
docker-compose up -d postgres redis

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo 📦 Installing smart contract dependencies...
call npm install

echo 🔨 Compiling smart contracts...
call npm run compile

echo ⛓️ Starting local Hardhat blockchain...
start /B npx hardhat node --port 8545 > hardhat.log 2>&1

echo ⏳ Waiting for Hardhat to start...
timeout /t 5 /nobreak >nul

echo 🚀 Deploying smart contracts to local network...
call npm run deploy:local

echo 📦 Installing backend dependencies...
cd backend
call npm install

echo 🗄️ Setting up database schema...
call npm run prisma:generate
npx prisma db push

echo 🚀 Starting backend server...
start /B npm run dev > ../backend.log 2>&1

echo 📦 Installing POS frontend dependencies...
cd ../web/pos
call npm install

echo 💻 Starting POS frontend...
start /B npm run dev > ../../pos.log 2>&1

cd ../..

echo ✅ NileLink Protocol Development Environment Started!
echo =====================================================
echo 🌐 Services Running:
echo   📦 PostgreSQL: localhost:5432
echo   🔄 Redis: localhost:6379
echo   ⛓️ Hardhat: localhost:8545
echo   🚀 Backend API: localhost:3001
echo   💻 POS Frontend: localhost:3002
echo.
echo 📋 Useful Commands:
echo   View Hardhat logs: type hardhat.log
echo   View backend logs: type backend.log
echo   View POS logs: type pos.log
echo.
echo 🔗 Access Points:
echo   POS Terminal: http://localhost:3002
echo   API Documentation: http://localhost:3001/api/docs
echo =====================================================

echo Press any key to stop all services...
pause >nul

echo Stopping all services...
taskkill /F /IM node.exe >nul 2>&1
docker-compose down

echo All services stopped.
pause
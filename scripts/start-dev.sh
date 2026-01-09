#!/bin/bash

# NileLink Protocol - Complete Development Environment Startup
# This script starts all necessary services for local development

set -e

echo "🚀 Starting NileLink Protocol Development Environment"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_status "Starting development environment..."

# Step 1: Start Docker services (PostgreSQL and Redis)
print_status "Starting Docker services (PostgreSQL + Redis)..."
docker-compose up -d postgres redis

# Wait for services to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Step 2: Install dependencies for smart contracts
print_status "Installing smart contract dependencies..."
npm install

# Step 3: Compile smart contracts
print_status "Compiling smart contracts..."
npm run compile

# Step 4: Start Hardhat local blockchain
print_status "Starting local Hardhat blockchain..."
npx hardhat node --port 8545 > hardhat.log 2>&1 &
HARDHAT_PID=$!

# Wait for Hardhat to start
sleep 5

# Step 5: Deploy contracts to local network
print_status "Deploying smart contracts to local network..."
npm run deploy:local

# Step 6: Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install

# Step 7: Generate Prisma client and push schema
print_status "Setting up database schema..."
npm run prisma:generate
npx prisma db push

# Step 8: Start backend server
print_status "Starting backend server..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Step 9: Install frontend dependencies for POS
print_status "Installing POS frontend dependencies..."
cd ../web/pos
npm install

# Step 10: Start POS frontend
print_status "Starting POS frontend..."
npm run dev > ../../pos.log 2>&1 &
POS_PID=$!

print_success "NileLink Protocol Development Environment Started!"
echo ""
echo "====================================================="
echo "🌐 Services Running:"
echo "  📦 PostgreSQL: localhost:5432"
echo "  🔄 Redis: localhost:6379"
echo "  ⛓️  Hardhat: localhost:8545"
echo "  🚀 Backend API: localhost:3001"
echo "  💻 POS Frontend: localhost:3002"
echo ""
echo "📋 Useful Commands:"
echo "  View Hardhat logs: tail -f hardhat.log"
echo "  View backend logs: tail -f backend.log"
echo "  View POS logs: tail -f pos.log"
echo "  Stop all: kill $HARDHAT_PID $BACKEND_PID $POS_PID"
echo ""
echo "🔗 Access Points:"
echo "  POS Terminal: http://localhost:3002"
echo "  API Documentation: http://localhost:3001/api/docs"
echo "  Hardhat Explorer: npx hardhat console --network localhost"
echo "====================================================="

# Wait for user interrupt
trap "echo 'Stopping all services...'; kill $HARDHAT_PID $BACKEND_PID $POS_PID 2>/dev/null; docker-compose down; exit" INT

print_status "Press Ctrl+C to stop all services"

# Keep the script running
wait
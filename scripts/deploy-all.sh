#!/bin/bash

# NileLink Protocol - Unified Deployment Script
# Deploys all frontends to Cloudflare Pages with subdomains

set -e

echo "🚀 Starting NileLink Protocol Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
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

# Check if Cloudflare CLI is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler auth login --status &> /dev/null; then
    print_warning "Not logged in to Cloudflare. Please run: wrangler auth login"
    exit 1
fi

# Define frontend projects and their subdomains
# Format: "folder:subdomain:project_name"
FRONTENDS=(
    "portal::nilelink-portal"
    "pos:pos:nilelink-pos"
    "dashboard:dashboard:nilelink-dashboard"
    "supplier:supplier:nilelink-supplier"
    "customer:customer:nilelink-customer"
    "delivery:delivery:nilelink-delivery"
    "unified:unified:nilelink-unified"
    "investor:invest:nilelink-invest"
)

# Build and deploy each frontend
for entry in "${FRONTENDS[@]}"; do
    folder=$(echo $entry | cut -d: -f1)
    subdomain=$(echo $entry | cut -d: -f2)
    project_name=$(echo $entry | cut -d: -f3)

    print_status "Building $folder frontend..."
    cd "web/$folder"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        npm install
    fi

    # Build for production
    npm run build

    # Deploy to Cloudflare Pages
    if [ -z "$subdomain" ]; then
        print_status "Deploying $folder to nilelink.app..."
        wrangler pages deploy out --project-name="$project_name" --branch=main --commit-message="Deploy $folder to root"
    else
        print_status "Deploying $folder to $subdomain.nilelink.app..."
        wrangler pages deploy out --project-name="$project_name" --branch=main --commit-message="Deploy $folder"
    fi

    cd ../..
    if [ -z "$subdomain" ]; then
        print_success "$folder deployed to https://nilelink.app"
    else
        print_success "$folder deployed to https://$subdomain.nilelink.app"
    fi
done

# Deploy backend to Cloudflare Workers (API)
print_status "Deploying backend API to Cloudflare Workers..."
cd backend

# Build and deploy backend
wrangler deploy

cd ..
print_success "Backend API deployed to https://api.nilelink.app"

print_success "🎉 NileLink Protocol deployment complete!"
print_status ""
print_status "Access your applications:"
echo "  🌐 Portal:     https://nilelink.app"
echo "  🏪 POS:        https://pos.nilelink.app"
echo "  📊 Dashboard:  https://dashboard.nilelink.app"
echo "  👨‍💼 Supplier:   https://supplier.nilelink.app"
echo "  👤 Customer:   https://customer.nilelink.app"
echo "  🚚 Delivery:   https://delivery.nilelink.app"
echo "  🔗 Unified:    https://unified.nilelink.app"
echo "  💰 Invest:     https://invest.nilelink.app"
echo "  🔧 API:        https://api.nilelink.app"
print_status ""
print_warning "Next steps:"
echo "  1. Update DNS records for nilelink.app"
echo "  2. Configure Polygon Mumbai RPC in frontend .env files"
echo "  3. Test wallet connections and smart contract interactions"
echo "  4. Monitor Cloudflare analytics"
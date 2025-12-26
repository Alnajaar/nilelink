#!/bin/bash
# NileLink Cloudflare Pages Deployment Script (Bash version)
# This script deploys all NileLink applications to Cloudflare Pages

echo "🚀 NileLink Cloudflare Pages Deployment"
echo "========================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed!"
    echo "📦 Installing Wrangler globally..."
    npm install -g wrangler
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Wrangler. Please install it manually: npm install -g wrangler"
        exit 1
    fi
fi

echo "✅ Wrangler CLI is installed"
echo ""

# Check if user is logged in to Wrangler
echo "🔐 Checking Wrangler authentication..."
wrangler whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Wrangler!"
    echo "🔑 Please login to Wrangler..."
    wrangler login
    if [ $? -ne 0 ]; then
        echo "❌ Failed to login. Please try again."
        exit 1
    fi
fi

echo "✅ Authenticated with Cloudflare"
echo ""

# Define applications to deploy
declare -a apps=(
    "customer:customer.nilelink.app"
    "dashboard:dashboard.nilelink.app"
    "delivery:delivery.nilelink.app"
    "portal:portal.nilelink.app"
    "pos:pos.nilelink.app"
    "supplier:supplier.nilelink.app"
    "unified:unified.nilelink.app"
)

total_apps=${#apps[@]}
current_app=0
success_count=0
fail_count=0

echo "📋 Deploying $total_apps applications..."
echo ""

for app_info in "${apps[@]}"; do
    IFS=':' read -r app_name app_domain <<< "$app_info"
    ((current_app++))
    app_path="web/$app_name"
    
    echo "[$current_app/$total_apps] 🚀 Deploying $app_name ($app_domain)..."
    echo "  📁 Path: $app_path"
    
    # Check if directory exists
    if [ ! -d "$app_path" ]; then
        echo "  ❌ Directory not found: $app_path"
        ((fail_count++))
        continue
    fi
    
    # Navigate to app directory
    cd "$app_path" || continue
    
    # Deploy to Cloudflare Pages
    echo "  📦 Building and deploying..."
    wrangler pages deploy out --project-name="nilelink-$app_name" --branch=main
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Successfully deployed $app_name!"
        echo "  🌐 URL: https://nilelink-$app_name.pages.dev"
        echo "  🔗 Custom domain: https://$app_domain"
        ((success_count++))
    else
        echo "  ❌ Failed to deploy $app_name"
        ((fail_count++))
    fi
    
    # Return to root directory
    cd - > /dev/null || exit
    echo ""
done

# Summary
echo "========================================"
echo "📊 Deployment Summary"
echo "========================================"
echo "✅ Successful: $success_count"
echo "❌ Failed: $fail_count"
echo "📦 Total: $total_apps"
echo ""

if [ $success_count -eq $total_apps ]; then
    echo "🎉 All applications deployed successfully!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Configure custom domains in Cloudflare Dashboard"
    echo "2. Add DNS CNAME records for each subdomain"
    echo "3. Verify SSL certificates"
    echo "4. Test all applications"
else
    echo "⚠️  Some deployments failed. Please check the errors above."
fi

echo ""
echo "🔗 Cloudflare Dashboard: https://dash.cloudflare.com"

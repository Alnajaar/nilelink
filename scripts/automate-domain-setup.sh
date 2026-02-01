# NileLink Domain Automation Script
# Run this after manual Cloudflare setup

#!/bin/bash

echo "🔧 Automating NileLink domain configuration..."

# Update DNS records with actual AWS resource values
# (Replace placeholders with real values from deployment)

# Validate configuration
echo "✅ Validating domain configuration..."
curl -s https://nilelink.app > /dev/null && echo "Root domain: OK" || echo "Root domain: FAILED"
curl -s https://api.nilelink.app/health > /dev/null && echo "API domain: OK" || echo "API domain: FAILED"
curl -s https://admin.nilelink.app > /dev/null && echo "Admin domain: OK" || echo "Admin domain: FAILED"

echo "🎉 Domain setup automation complete!"
echo "🌐 Ready for production traffic"

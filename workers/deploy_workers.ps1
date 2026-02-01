$env:CLOUDFLARE_API_TOKEN = "oQDxpDvH24UJeQWKuZw1acEL6BbKzksL5y4MrodJ"
$env:CLOUDFLARE_ACCOUNT_ID = "79b17f6d66b3dcfd8aca5f94a1f702d3"

# JWT Secret (Generated random for this setup)
$JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

echo "Deploying IPFS Token Worker..."
cd workers\ipfs-token
echo $JWT_SECRET | npx wrangler secret put JWT_SECRET
# Placeholder for RPC_URL - User must update
echo "https://polygon-rpc.com" | npx wrangler secret put RPC_URL
# Placeholder for Registry - User must update
echo "0x0000000000000000000000000000000000000000" | npx wrangler secret put RESTAURANT_REGISTRY_ADDRESS
npx wrangler deploy --env production

echo "Deploying IPFS Upload Worker..."
cd ..\ipfs-upload
echo $JWT_SECRET | npx wrangler secret put JWT_SECRET
# Placeholder for PINATA - User must update
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYTFjMjQ4Zi02YmQ5LTRjODQtOWY5Yy0wMjY3NTM0M2UxZjQiLCJlbWFpbCI6Im5pbGVsaW5rcG9zQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZDdlOWRjYWE3ZmVmNDQ1OWNjYyIsInNjb3BlZEtleVNlY3JldCI6IjExMDE3Njg4YjhjOGViMmRlMzk1Y2U1NmU2NzMzNmRhZmIxOTI0MzNlMWU0ZDkzNWZkMWY2YTgxZDM3M2VkNmMiLCJleHAiOjE4MDA2OTA4OTV9.K65ph_ao4GCtWMSPzvOTthdIdZWAA67L_L58hHBo52s
" | npx wrangler secret put PINATA_JWT
npx wrangler deploy --env production

echo "✅ Deployment Complete. Please update PINATA_JWT secret manually."

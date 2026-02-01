 REQUIRED API KEYS & CREDENTIALS FOR DEPLOYMENT
🌐 Blockchain/Web3 Services
Infura API Key (for Ethereum/Polygon RPC)
Used in: .env.example line 31
Variable: VITE_ETH_RPC_URL
Get from: https://infura.io/
WalletConnect Project ID
Used in: .env.example line 34, web/.env.development line 26, web/.env.production line 25
Variables: VITE_WALLETCONNECT_PROJECT_ID, NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
Get from: https://cloud.walletconnect.com/
PolygonScan API Key
Used in: Main .env line 6
Variable: POLYGONSCAN_API_KEY
Get from: https://polygonscan.com/myapikey
☁️ IPFS & Storage
Pinata API Keys (IPFS pinning service)
Used in: Main .env lines 21-24
Variables: NEXT_PUBLIC_PINATA_API_KEY, NEXT_PUBLIC_PINATA_SECRET_KEY, NEXT_PUBLIC_PINATA_JWT
Get from: https://pinata.cloud/
🔍 The Graph Services
The Graph API Key
Used in: Main .env line 40
Variable: NEXT_PUBLIC_GRAPH_API_KEY
Get from: https://thegraph.com/studio/ (Profile → API Keys)
Subgraph Deployment Keys
Used in: Main .env line 34
Variable: Deploy Key for subgraph deployments
Get from: https://thegraph.com/studio/
💳 Payment Processing
Stripe Secret Key (for traditional payments)
Used in: Main .env line 83
Variable: STRIPE_SECRET_KEY
Get from: https://dashboard.stripe.com/
Stripe Publishable Key
Used in: web/.env.development line 24, web/.env.production line 23
Variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Get from: https://dashboard.stripe.com/
🔍 Analytics & Monitoring
Google Analytics ID
Used in: web/.env.development line 25, web/.env.production line 24
Variable: NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
Get from: Google Analytics
Sentry DSN (Error tracking)
Used in: Main .env line 59, web/.env.production lines 51-53, web/supplier/.env.example line 47
Variables: SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
Get from: https://sentry.io/
🔥 Firebase (Supplier App)
Firebase Credentials (Supplier App)
Used in: web/supplier/.env.example lines 20-23, 42-44
Variables: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID
Get from: Firebase Console
🤖 AI Services
OpenAI API Key
Used in: Main .env line 70
Variable: OPENAI_API_KEY
Get from: https://platform.openai.com/
🚀 Deployment Platforms
Fleek App ID (Web3 hosting)
Used in: .env.example line 113
Variable: VITE_FLEEK_APP_ID
Get from: https://fleek.co/
📋 Summary Checklist
Essential for MVP Deployment:
 Infura API Key
 WalletConnect Project ID
 Pinata API Keys
 The Graph API Key
Recommended for Production:
 Stripe Keys (if supporting traditional payments)
 Google Analytics ID
 Sentry DSN (for error monitoring)
 Firebase Credentials (for supplier app)
Nice to Have:
 PolygonScan API Key
 OpenAI API Key (for advanced AI features)
Most critical are the Web3 infrastructure keys (Infura, WalletConnect, Pinata, The Graph) since they're fundamental to the decentralized nature of the NileLink protocol. The payment and analytics services can be added incrementally based on your business requirements
# NileLink POS System

A comprehensive Point of Sale system with both mobile and web implementations for restaurant management.

## System Overview

This project includes:
- **Mobile POS App** (React Native/Expo) - For handheld POS operations
- **Web POS System** (Next.js) - For restaurant management and administration
- **Blockchain Integration** - Smart contract backend for payments and supply chain
- **Multi-platform Support** - Customer, driver, supplier, and admin interfaces

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- For mobile: Expo CLI and Android Studio/iOS Simulator
- For web: Modern web browser

## Mobile POS Setup

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Missing Sync Engine
**⚠️ Issue**: The `@nilelink/sync-engine` package is missing.

**Temporary Fix**: Sync functionality has been disabled in the codebase. To restore:
- Create the missing package in `mobile/packages/sync-engine/`
- Or remove sync-related imports from `mobile/apps/pos/src/store/sagas.ts` and `mobile/apps/pos/src/store/rootSaga.ts`

### 3. Run Mobile POS
```bash
cd mobile/apps/pos
npx expo start --offline
```

**Current Status**: Runs successfully but without sync capabilities.

### 4. Development Notes
- Uses Expo SDK for cross-platform mobile development
- SQLite for local data storage
- Redux Saga for state management
- Navigation with React Navigation

## Web POS Setup

### 1. Install Dependencies
```bash
cd web/pos
npm install
```

### 2. Environment Configuration
Create `.env.local`:
```env
# Web3 Configuration
NEXT_PUBLIC_WEB3MODAL_PROJECT_ID=your_project_id_here

# Blockchain
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_CHAIN_ID=137

# Contract Addresses (deploy your contracts first)
NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS=0x...
```

### 3. Web3Modal Issue
**⚠️ Issue**: "TypeError: E.YB.on is not a function"

**Fix**: Update Web3Modal dependencies to compatible versions:
```bash
npm update @web3modal/wagmi @rainbow-me/rainbowkit
```

### 4. Run Web POS
```bash
cd web/pos
npm run dev
```

**Current Status**: Development server starts but has wallet initialization errors.

### 5. Development Notes
- Next.js 14 with App Router
- Web3 integration with Wagmi/Viem
- Tailwind CSS for styling
- Redux for state management

## Blockchain Setup

### 1. Install Hardhat Dependencies
```bash
npm install
```

### 2. Deploy Contracts
```bash
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Update Contract Addresses
Copy deployed addresses to environment files in both mobile and web apps.

## Known Issues & Fixes

### Mobile POS Issues
1. **Missing sync-engine**: Package needs to be created or dependencies updated
2. **Expo build properties**: iOS deployment target updated to 13.4

### Web POS Issues
1. **Web3Modal initialization**: Update to latest compatible versions
2. **Build failures**: Many pages fail static generation due to wallet code
3. **API keys missing**: Pinata, Web3Auth, and other service keys needed

### General Issues
1. **Dependency conflicts**: Some packages may need version alignment
2. **Environment variables**: Multiple `.env` files needed for different environments

## Architecture

```
nilelink/
├── mobile/                 # React Native monorepo
│   ├── apps/
│   │   ├── pos/           # Main POS app
│   │   ├── customer/      # Customer ordering app
│   │   ├── driver/        # Driver delivery app
│   │   └── supplier/      # Supplier management app
│   └── packages/          # Shared mobile packages
├── web/                   # Next.js applications
│   ├── pos/              # Web POS system
│   ├── customer/         # Web customer interface
│   ├── driver/           # Web driver dashboard
│   ├── admin/            # Admin management system
│   └── shared/           # Shared web components
└── contracts/            # Solidity smart contracts
```

## Development Workflow

1. **Local Development**: Use `npm run dev` in respective directories
2. **Testing**: Run `npm test` for unit tests
3. **Building**: Use `npm run build` for production builds
4. **Deployment**: Configure environment variables for production

## Support

For issues:
1. Check the `AUDIT_REPORT.md` for system documentation
2. Review `TESTING_GUIDE.md` for test scenarios
3. Check `TODO.md` for known tasks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Submit a pull request

## License

This project is part of the NileLink ecosystem.
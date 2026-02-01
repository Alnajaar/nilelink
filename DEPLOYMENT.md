# Smart Contract Deployment Guide

## NileLink POS - Polygon Deployment

This guide covers deploying the `SupplierCommission` and `POSAuthorization` smart contracts to Polygon.

---

## 📋 Prerequisites

1. **Wallet with MATIC**: Deployer wallet must have MATIC for gas fees
   - Polygon Mainnet: ~0.1 MATIC
   - Amoy Testnet: Get free test MATIC from [faucet](https://faucet.polygon.technology/)

2. **Environment Variables**: Copy `.env.example` to `.env` and fill in:

   ```bash
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   POLYGONSCAN_API_KEY=your_api_key_here
   ```

3. **Dependencies**: Install Hardhat

   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npm install dotenv
   ```

---

## 🚀 Deployment Steps

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Amoy Testnet (Recommended First)

```bash
npm run deploy:amoy
```

### 3. Deploy to Polygon Mainnet

```bash
npm run deploy:polygon
```

### 4. Verify Deployment

Check the generated file: `deployments/polygon-deployment.json`

---

## 📝 Post-Deployment Configuration

### Update `.env.production`

```bash
NEXT_PUBLIC_COMMISSION_CONTRACT=0x... # From deployment output
NEXT_PUBLIC_POS_AUTH_CONTRACT=0x...   # From deployment output
NEXT_PUBLIC_CHAIN_ID=137              # Polygon Mainnet
```

### Update POS Application

The contract addresses will be automatically used by:

- `OfflineFirstSync.ts` (commission calculation)
- `SessionManager.ts` (POS authorization verification)
- `RBACService.ts` (role verification)

---

## 🔧 Smart Contract Functions

### SupplierCommission

**Admin Functions** (Super Admin Only):

```solidity
updateRule(address supplier, uint8 percentage, uint256 fixedFee, bool isPercentage)
deactivateRule(address supplier)
changeSuperAdmin(address newAdmin)
```

**Public Functions**:

```solidity
getCommission(address supplier, uint256 orderAmount) view returns (uint256)
```

**Example Usage**:

```typescript
// POS reads commission on checkout
const commission = await commissionContract.getCommission(supplierAddress, orderAmount);
localStorage.setItem('lastKnownCommission', commission.toString());
```

### POSAuthorization

**Admin Functions**:

```solidity
authorizeDevice(address deviceWallet, string deviceId)
deactivateDevice(address deviceWallet)
addAdmin(address admin)
removeAdmin(address admin)
```

**Public Functions**:

```solidity
isAuthorized(address deviceWallet) view returns (bool)
getDeviceInfo(address deviceWallet) view returns (string, bool, uint256, address)
```

**Example Usage**:

```typescript
// POS checks authorization on startup
const isAuthorized = await posAuthContract.isAuthorized(walletAddress);
if (!isAuthorized) throw new Error('Device not authorized');
```

---

## 🧪 Testing Deployment

### 1. Check Contract on Polygonscan

- Mainnet: `https://polygonscan.com/address/CONTRACT_ADDRESS`
- Testnet: `https://amoy.polygonscan.com/address/CONTRACT_ADDRESS`

### 2. Test Commission Contract

```bash
npx hardhat console --network polygon
```

```javascript
const commission = await ethers.getContractAt("SupplierCommission", "CONTRACT_ADDRESS");
await commission.updateRule("0xSupplierAddress", 5, 0, true); // 5% commission
const result = await commission.getCommission("0xSupplierAddress", ethers.parseEther("100"));
console.log("Commission:", ethers.formatEther(result)); // Should be 5
```

### 3. Test POS Authorization

```javascript
const posAuth = await ethers.getContractAt("POSAuthorization", "CONTRACT_ADDRESS");
await posAuth.authorizeDevice("0xDeviceWallet", "POS-001");
const isAuth = await posAuth.isAuthorized("0xDeviceWallet");
console.log("Authorized:", isAuth); // Should be true
```

---

## 🔒 Security Best Practices

1. **Private Key**: Never commit `.env` to git
2. **Super Admin**: Transfer to multi-sig wallet after deployment
3. **Commission Rates**: Set reasonable limits (e.g., max 20%)
4. **Device Authorization**: Regularly audit authorized POS devices
5. **Contract Upgrades**: Consider using proxy pattern for future upgrades

---

## 📊 Gas Costs (Estimated)

| Operation | Polygon Mainnet | Amoy Testnet |
|-----------|----------------|--------------|
| Deploy SupplierCommission | ~0.01 MATIC | Free |
| Deploy POSAuthorization | ~0.015 MATIC | Free |
| Update Commission Rule | ~0.001 MATIC | Free |
| Authorize Device | ~0.0008 MATIC | Free |

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"

- Ensure deployer wallet has enough MATIC
- Check gas price: `npx hardhat gas-reporter`

### "Verification failed"

- Wait 1-2 minutes after deployment
- Ensure POLYGONSCAN_API_KEY is correct
- Manually verify on Polygonscan if needed

### "Nonce too high"

- Reset account: `npx hardhat clean`
- Use `--reset` flag

---

> [!IMPORTANT]
> After deployment, immediately test the contracts with real POS devices to ensure proper integration before going live.

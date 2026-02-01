# Contract Deployments

This directory contains environment-specific contract addresses for the NileLink Protocol.

## Structure

```
deployments/
├── local.json      # Local development addresses
├── testnet.json    # Testnet addresses (Mumbai/Amoy)
├── mainnet.json    # Mainnet addresses (Polygon)
└── README.md       # This file
```

## Usage

### Loading Addresses in Scripts

```javascript
const deploymentLoader = require('./scripts/loadDeployments.js');

// Get addresses for current environment
const addresses = deploymentLoader.getAddresses(); // Uses process.env.NETWORK

// Get addresses for specific network
const localAddresses = deploymentLoader.getAddresses('local');
const testnetAddresses = deploymentLoader.getAddresses('testnet');
```

### Updating Addresses After Deployment

```javascript
const deploymentLoader = require('./scripts/loadDeployments.js');

// Update address for testnet
deploymentLoader.updateAddress('testnet', 'NileLinkProtocol', '0x1234...');

// Update multiple addresses
deploymentLoader.updateAddress('mainnet', 'RestaurantRegistry', '0x5678...');
```

## Address Management

### Current Status

| Contract | Local | Testnet | Mainnet |
|----------|-------|---------|---------|
| NileLinkProtocol | ❌ Placeholder | ❌ Placeholder | ❌ Placeholder |
| RestaurantRegistry | ❌ Placeholder | ❌ Placeholder | ❌ Placeholder |
| OrderSettlement | ❌ Placeholder | ❌ Placeholder | ❌ Placeholder |
| CurrencyExchange | ✅ Deployed | ❌ Placeholder | ❌ Placeholder |
| FraudDetection | ✅ Deployed | ❌ Placeholder | ❌ Placeholder |
| All Others | ❌ Placeholder | ❌ Placeholder | ❌ Placeholder |

### Deployment Checklist

- [ ] Deploy to local Hardhat network
- [ ] Update `local.json` with deployed addresses
- [ ] Deploy to Mumbai/Amoy testnet
- [ ] Update `testnet.json` with deployed addresses
- [ ] Deploy to Polygon mainnet
- [ ] Update `mainnet.json` with deployed addresses
- [ ] Verify all addresses are non-zero
- [ ] Run integration tests with real addresses

## Security Notes

⚠️ **Never commit real contract addresses to version control before mainnet deployment**

- Use placeholder addresses (`0x000...0000`) in committed code
- Update addresses via deployment scripts only
- Verify addresses match deployed contracts before production use

## Environment Variables

Set the `NETWORK` environment variable to load the correct addresses:

```bash
export NETWORK=testnet  # For testnet
export NETWORK=mainnet  # For mainnet
# Default: local
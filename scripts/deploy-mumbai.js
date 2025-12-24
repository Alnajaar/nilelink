
// scripts/deploy-mumbai.js
const { ethers } = require('hardhat');

async function main() {
    console.log('🚀 Deploying NileLink Protocol contracts to Mumbai Testnet...');

    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);

    // Mumbai Testnet Addresses (or Amoy if updated)
    // Using env var or default Mumbai USDC faucet address
    const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    console.log('USDC Address:', USDC_ADDRESS);
    console.log('Fee Recipient:', FEE_RECIPIENT);

    // Deploy NileLinkProtocol
    console.log('\n🔗 Deploying NileLink Protocol...');
    const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
    const protocol = await NileLinkProtocol.deploy(USDC_ADDRESS, FEE_RECIPIENT);
    await protocol.waitForDeployment();
    const protocolAddress = await protocol.getAddress();
    console.log('NileLink Protocol deployed to:', protocolAddress);

    // Get other addresses
    const addresses = await protocol.getContractAddresses();
    console.log('\n📋 Deployed Contract Addresses:');
    console.log('RestaurantRegistry:', addresses.restaurantRegistry);
    console.log('OrderSettlement:', addresses.orderSettlement);
    console.log('CurrencyExchange:', addresses.currencyExchange);
    console.log('DisputeResolution:', addresses.disputeResolution);
    console.log('FraudDetection:', addresses.fraudDetection);
    console.log('InvestorVault:', addresses.investorVault);
    console.log('SupplierCredit:', addresses.supplierCredit);

    const deploymentInfo = {
        protocol: protocolAddress,
        usdc: USDC_ADDRESS,
        restaurantRegistry: addresses.restaurantRegistry,
        orderSettlement: addresses.orderSettlement,
        currencyExchange: addresses.currencyExchange,
        disputeResolution: addresses.disputeResolution,
        fraudDetection: addresses.fraudDetection,
        investorVault: addresses.investorVault,
        supplierCredit: addresses.supplierCredit,
        feeRecipient: FEE_RECIPIENT,
        deployer: deployer.address,
        network: 'mumbai',
        timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync('./deployment-mumbai.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Deployment info saved to deployment-mumbai.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

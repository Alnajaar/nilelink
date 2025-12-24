
// scripts/deploy-polygon.js
const { ethers, run } = require('hardhat');

async function main() {
    console.log('🚀 Deploying NileLink Protocol contracts to Polygon Mainnet...');

    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);

    // Polygon Mainnet Addresses
    const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address; // Default to deployer if not set

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

    // Set Governance?
    // If deployer is owner, it's already set.
    // protocol.transferOwnership(...) if needed later.

    // Verify Contracts (Wait for a few confirmations)
    console.log('\n⏳ Waiting for confirmations before verification...');
    // Wait 5 blocks (approx 10-15s on Polygon)
    // await protocol.deploymentTransaction().wait(5); // Not strictly available on contract object directly in v6 like this always?
    // Better to just sleep or wait.

    // Verification usually requires `hardhat verify`. 
    // We can try to run it programmatically:
    // await run("verify:verify", {
    //   address: protocolAddress,
    //   constructorArguments: [USDC_ADDRESS, FEE_RECIPIENT],
    // });

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
        network: 'polygon',
        timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync('./deployment-polygon.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Deployment info saved to deployment-polygon.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

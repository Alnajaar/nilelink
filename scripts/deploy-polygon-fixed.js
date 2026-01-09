// scripts/deploy-polygon.js
const { ethers, run } = require('hardhat');

async function main() {
    console.log('🚀 Deploying NileLink Protocol contracts to Polygon Mainnet...');

    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error('No deployer account found. Check your PRIVATE_KEY in .env file.');
    }
    console.log('Deploying with account:', deployer.address);

    // Polygon Mainnet Addresses
    const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    const deploymentInfo = {
        deployer: deployer.address,
        network: 'polygon',
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    try {
        // Deploy contracts individually for better control
        console.log('\n🏪 Deploying RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const restaurantRegistry = await RestaurantRegistry.deploy();
        await restaurantRegistry.waitForDeployment();
        const registryAddress = await restaurantRegistry.getAddress();
        console.log('RestaurantRegistry deployed to:', registryAddress);
        deploymentInfo.contracts.restaurantRegistry = registryAddress;

        console.log('\n💳 Deploying OrderSettlement...');
        const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
        const orderSettlement = await OrderSettlement.deploy(
            registryAddress,
            USDC_ADDRESS,
            FEE_RECIPIENT
        );
        await orderSettlement.waitForDeployment();
        const settlementAddress = await orderSettlement.getAddress();
        console.log('OrderSettlement deployed to:', settlementAddress);
        deploymentInfo.contracts.orderSettlement = settlementAddress;

        // Deploy remaining contracts...
        const contractsToDeploy = [
            'CurrencyExchange',
            'FraudDetection',
            'DisputeResolution',
            'InvestorVault',
            'SupplierCredit'
        ];

        for (const contractName of contractsToDeploy) {
            console.log(`\n📄 Deploying ${contractName}...`);
            const ContractFactory = await ethers.getContractFactory(contractName);
            const contract = await ContractFactory.deploy();
            await contract.waitForDeployment();
            const address = await contract.getAddress();
            console.log(`${contractName} deployed to:`, address);
            deploymentInfo.contracts[contractName.toLowerCase()] = address;
        }

        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync('./deployment-polygon.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');
        console.log('📋 Deployment info saved to deployment-polygon.json');

        // Print summary
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('=====================================');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log('=====================================');
        console.log('🌐 Network: Polygon Mainnet');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
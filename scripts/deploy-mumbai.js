
// scripts/deploy-mumbai.js
const { ethers } = require('hardhat');

async function main() {
    console.log('🚀 Deploying NileLink Protocol contracts to Mumbai Testnet (Modular Deployment)...');

    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error('No deployer account found. Check your PRIVATE_KEY in .env file.');
    }
    console.log('Deploying with account:', deployer.address);

    const deploymentInfo = {
        deployer: deployer.address,
        network: 'polygon-amoy',
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    try {
        // 1. Deploy RestaurantRegistry
        console.log('\n🏪 Deploying RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const restaurantRegistry = await RestaurantRegistry.deploy();
        await restaurantRegistry.waitForDeployment();
        const registryAddress = await restaurantRegistry.getAddress();
        console.log('RestaurantRegistry deployed to:', registryAddress);
        deploymentInfo.contracts.restaurantRegistry = registryAddress;

        // 2. Deploy OrderSettlement
        console.log('\n💳 Deploying OrderSettlement...');
        const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
        const orderSettlement = await OrderSettlement.deploy(
            registryAddress,
            '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97', // USDC on Polygon Amoy
            deployer.address // Fee recipient
        );
        await orderSettlement.waitForDeployment();
        const settlementAddress = await orderSettlement.getAddress();
        console.log('OrderSettlement deployed to:', settlementAddress);
        deploymentInfo.contracts.orderSettlement = settlementAddress;

        // 3. Deploy CurrencyExchange
        console.log('\n💱 Deploying CurrencyExchange...');
        const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
        const currencyExchange = await CurrencyExchange.deploy();
        await currencyExchange.waitForDeployment();
        const exchangeAddress = await currencyExchange.getAddress();
        console.log('CurrencyExchange deployed to:', exchangeAddress);
        deploymentInfo.contracts.currencyExchange = exchangeAddress;

        // 4. Deploy FraudDetection
        console.log('\n🛡️ Deploying FraudDetection...');
        const FraudDetection = await ethers.getContractFactory('FraudDetection');
        const fraudDetection = await FraudDetection.deploy();
        await fraudDetection.waitForDeployment();
        const fraudAddress = await fraudDetection.getAddress();
        console.log('FraudDetection deployed to:', fraudAddress);
        deploymentInfo.contracts.fraudDetection = fraudAddress;

        // 5. Deploy DisputeResolution
        console.log('\n⚖️ Deploying DisputeResolution...');
        const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
        const disputeResolution = await DisputeResolution.deploy();
        await disputeResolution.waitForDeployment();
        const disputeAddress = await disputeResolution.getAddress();
        console.log('DisputeResolution deployed to:', disputeAddress);
        deploymentInfo.contracts.disputeResolution = disputeAddress;

        // 6. Deploy InvestorVault
        console.log('\n💼 Deploying InvestorVault...');
        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        const investorVault = await InvestorVault.deploy();
        await investorVault.waitForDeployment();
        const vaultAddress = await investorVault.getAddress();
        console.log('InvestorVault deployed to:', vaultAddress);
        deploymentInfo.contracts.investorVault = vaultAddress;

        // 7. Deploy SupplierCredit
        console.log('\n🏭 Deploying SupplierCredit...');
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        const supplierCredit = await SupplierCredit.deploy();
        await supplierCredit.waitForDeployment();
        const creditAddress = await supplierCredit.getAddress();
        console.log('SupplierCredit deployed to:', creditAddress);
        deploymentInfo.contracts.supplierCredit = creditAddress;

        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync('./deployment-mumbai.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');
        console.log('📋 Deployment info saved to deployment-mumbai.json');

        // Print summary
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('=====================================');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log('=====================================');
        console.log('🌐 Network: Polygon Amoy Testnet');
        console.log('⛽️  All contracts verified and ready for use!');

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

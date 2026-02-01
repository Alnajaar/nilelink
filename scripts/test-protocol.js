const { ethers } = require('hardhat');

async function main() {
    console.log('🧪 Testing NileLink Protocol Components...');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    // Deploy MockUSDC first
    console.log('📄 Deploying MockUSDC...');
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const mockUSDC = await MockUSDC.deploy('USD Coin', 'USDC', 6);
    await mockUSDC.waitForDeployment();
    console.log('✅ MockUSDC deployed at:', await mockUSDC.getAddress());

    // Test core contract deployment (what NileLinkProtocol constructor does)
    console.log('\n🏗️ Testing Core Contract Deployments...');

    console.log('📋 Deploying RestaurantRegistry...');
    const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
    const restaurantRegistry = await RestaurantRegistry.deploy();
    await restaurantRegistry.waitForDeployment();
    console.log('✅ RestaurantRegistry deployed at:', await restaurantRegistry.getAddress());

    console.log('💰 Deploying OrderSettlement...');
    const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
    const orderSettlement = await OrderSettlement.deploy(
        await restaurantRegistry.getAddress(),
        await mockUSDC.getAddress(),
        deployer.address
    );
    await orderSettlement.waitForDeployment();
    console.log('✅ OrderSettlement deployed at:', await orderSettlement.getAddress());

    console.log('💱 Deploying CurrencyExchange...');
    const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
    const currencyExchange = await CurrencyExchange.deploy();
    await currencyExchange.waitForDeployment();
    console.log('✅ CurrencyExchange deployed at:', await currencyExchange.getAddress());

    console.log('⚖️ Deploying DisputeResolution...');
    const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
    const disputeResolution = await DisputeResolution.deploy(
        await orderSettlement.getAddress(),
        await mockUSDC.getAddress()
    );
    await disputeResolution.waitForDeployment();
    console.log('✅ DisputeResolution deployed at:', await disputeResolution.getAddress());

    console.log('🛡️ Deploying FraudDetection...');
    const FraudDetection = await ethers.getContractFactory('FraudDetection');
    const fraudDetection = await FraudDetection.deploy();
    await fraudDetection.waitForDeployment();
    console.log('✅ FraudDetection deployed at:', await fraudDetection.getAddress());

    console.log('\n🔍 Testing Contract Interactions...');

    // Test basic interactions
    const protocolFee = await orderSettlement.protocolFeeBps();
    console.log('✅ Protocol fee set to:', protocolFee, 'bps');

    const totalOrders = await orderSettlement.totalOrders();
    console.log('✅ Total orders initialized to:', totalOrders);

    console.log('\n✨ Protocol Component Test Complete!');
    console.log('All core contracts deployed and functional.');
}

main().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});

const { ethers } = require('hardhat');

async function main() {
    try {
        console.log('Testing deployment...');

        const [deployer] = await ethers.getSigners();
        console.log('Deployer:', deployer.address);

        const balance = await ethers.provider.getBalance(deployer.address);
        console.log('Balance:', ethers.formatEther(balance), 'MATIC');

        console.log('\nAttempting to deploy RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        console.log('✅ Contract factory created successfully');

        console.log('Sending deployment transaction...');
        const restaurantRegistry = await RestaurantRegistry.deploy();
        console.log('✅ Deployment transaction sent');
        console.log('Transaction hash:', restaurantRegistry.deploymentTransaction()?.hash);

        console.log('Waiting for deployment confirmation...');
        await restaurantRegistry.waitForDeployment();

        const address = await restaurantRegistry.getAddress();
        console.log('✅ RestaurantRegistry deployed to:', address);

    } catch (error) {
        console.error('❌ Deployment failed!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

main();

// Test deployment
const { ethers } = require('hardhat');

async function main() {
    console.log('Testing connection to Amoy...');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Balance:', ethers.formatEther(balance), 'POL');

    console.log('Attempting to deploy RestaurantRegistry...');
    const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
    console.log('Factory created');

    const registry = await RestaurantRegistry.deploy();
    console.log('Deployment transaction sent...');

    await registry.waitForDeployment();
    console.log('RestaurantRegistry deployed to:', await registry.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });

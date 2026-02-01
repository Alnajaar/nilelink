const { ethers } = require('hardhat');

async function main() {
    console.log('🚀 Simple Deploy Test');

    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Balance:', ethers.formatEther(balance), 'MATIC\n');

    // Get gas price
    const feeData = await ethers.provider.getFeeData();
    console.log('Current gas price:', ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'), 'gwei');
    console.log('Max fee per gas:', ethers.formatUnits(feeData.maxFeePerGas || 0n, 'gwei'), 'gwei\n');

    console.log('Creating contract factory...');
    const Factory = await ethers.getContractFactory('RestaurantRegistry');
    console.log('✅ Factory created\n');

    console.log('Deploying with manual gas settings...');
    const contract = await Factory.deploy({
        gasLimit: 5000000,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    });

    console.log('✅ Transaction sent!');
    console.log('TX Hash:', contract.deploymentTransaction()?.hash);

    console.log('\nWaiting for confirmation...');
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log('\n🎉 SUCCESS! Deployed to:', address);
}

main()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ ERROR:', error.message);
        if (error.reason) console.error('Reason:', error.reason);
        if (error.code) console.error('Code:', error.code);
        process.exit(1);
    });

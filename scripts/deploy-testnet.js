/**
 * NileLink Protocol - Testnet Deployment Script
 * Deploys all contracts to Polygon Amoy testnet with safe address management
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Load deployment utilities
const deploymentLoader = require('./loadDeployments.js');

async function main() {
    console.log('🚀 Starting NileLink Protocol Testnet Deployment\n');

    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    console.log(`📋 Deployer: ${deployer.address}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC\n`);

    // Step 1: Deploy Core Contracts
    console.log('🔨 Deploying Core Contracts...\n');

    const contracts = {};

    // 1. RestaurantRegistry
    console.log('📋 Deploying RestaurantRegistry...');
    const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
    contracts.restaurantRegistry = await RestaurantRegistry.deploy();
    await contracts.restaurantRegistry.waitForDeployment();
    console.log(`✅ RestaurantRegistry: ${await contracts.restaurantRegistry.getAddress()}\n`);

    // 2. Mock USDC (for testing)
    console.log('💵 Deploying MockUSDC...');
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    contracts.usdc = await MockUSDC.deploy('USD Coin', 'USDC', 6);
    await contracts.usdc.waitForDeployment();
    console.log(`✅ MockUSDC: ${await contracts.usdc.getAddress()}\n`);

    // 3. OrderSettlement
    console.log('🛒 Deploying OrderSettlement...');
    const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
    contracts.orderSettlement = await OrderSettlement.deploy(
        await contracts.restaurantRegistry.getAddress(),
        await contracts.usdc.getAddress(),
        deployer.address // fee recipient
    );
    await contracts.orderSettlement.waitForDeployment();
    console.log(`✅ OrderSettlement: ${await contracts.orderSettlement.getAddress()}\n`);

    // 4. CurrencyExchange
    console.log('💱 Deploying CurrencyExchange...');
    const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
    contracts.currencyExchange = await CurrencyExchange.deploy();
    await contracts.currencyExchange.waitForDeployment();
    console.log(`✅ CurrencyExchange: ${await contracts.currencyExchange.getAddress()}\n`);

    // 5. FraudDetection
    console.log('🛡️ Deploying FraudDetection...');
    const FraudDetection = await ethers.getContractFactory('FraudDetection');
    contracts.fraudDetection = await FraudDetection.deploy();
    await contracts.fraudDetection.waitForDeployment();
    console.log(`✅ FraudDetection: ${await contracts.fraudDetection.getAddress()}\n`);

    // Step 2: Update Deployment Addresses
    console.log('💾 Updating deployment addresses...\n');

    deploymentLoader.updateAddress('testnet', 'RestaurantRegistry', await contracts.restaurantRegistry.getAddress());
    deploymentLoader.updateAddress('testnet', 'OrderSettlement', await contracts.orderSettlement.getAddress());
    deploymentLoader.updateAddress('testnet', 'CurrencyExchange', await contracts.currencyExchange.getAddress());
    deploymentLoader.updateAddress('testnet', 'FraudDetection', await contracts.fraudDetection.getAddress());

    // Step 3: Governance Setup
    console.log('👑 Setting up governance...\n');

    // Set deployer as governance in RestaurantRegistry
    await contracts.restaurantRegistry.setGovernance(deployer.address, true);
    console.log('✅ Governance configured for RestaurantRegistry');

    // Step 4: Protocol Fee Setup
    console.log('💰 Setting up protocol fees...\n');

    // Set protocol fee in OrderSettlement
    await contracts.orderSettlement.setProtocolFee(50); // 0.5%
    console.log('✅ Protocol fee set to 0.5%');

    // Step 5: Verification
    console.log('🔍 Verifying deployment...\n');

    const addresses = deploymentLoader.getAddresses('testnet');
    console.log('📋 Testnet Deployment Summary:');
    console.log(`   RestaurantRegistry: ${addresses.RestaurantRegistry}`);
    console.log(`   OrderSettlement: ${addresses.OrderSettlement}`);
    console.log(`   CurrencyExchange: ${addresses.CurrencyExchange}`);
    console.log(`   FraudDetection: ${addresses.FraudDetection}`);

    // Step 6: Basic Functionality Test
    console.log('\n🧪 Running basic functionality tests...\n');

    // Test restaurant registration
    const testConfig = {
        ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes('+1234567890')),
        legalNameHash: ethers.keccak256(ethers.toUtf8Bytes('Test Restaurant')),
        localNameHash: ethers.keccak256(ethers.toUtf8Bytes('Test Restaurant Local')),
        metadataCid: ethers.keccak256(ethers.toUtf8Bytes('QmTestMetadata')),
        catalogCid: ethers.keccak256(ethers.toUtf8Bytes('QmTestCatalog')),
        country: ethers.encodeBytes32String('LB'),
        localCurrency: ethers.encodeBytes32String('LBP'),
        dailyRateLimitUsd6: ethers.parseUnits('1000', 6), // $1,000
        timezoneOffsetMinutes: 120,
        taxBps: 1000, // 10%
        chainlinkOracle: deployer.address,
        status: 0 // ACTIVE
    };

    await contracts.restaurantRegistry.registerRestaurant(deployer.address, testConfig);
    console.log('✅ Restaurant registration test passed');

    // Step 7: Deployment Complete
    console.log('\n🎉 TESTNET DEPLOYMENT COMPLETE!');
    console.log('====================================');
    console.log(`📍 Network: Polygon Amoy (Testnet)`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`📄 Addresses saved to: deployments/testnet.json`);
    console.log('====================================\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Update frontend configs with testnet addresses');
    console.log('   2. Run integration tests against testnet');
    console.log('   3. Test full user flows on testnet');
    console.log('   4. Prepare for mainnet deployment\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });

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
            USDC_ADDRESS,
            FEE_RECIPIENT
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

        // Verify contracts on Polygonscan
        console.log('\n🔍 Verifying contracts on Polygonscan...');

        try {
            console.log('Waiting for confirmations before verification...');
            // Wait a few blocks for confirmations
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

            // Note: Verification requires POLYGONSCAN_API_KEY and proper setup
            console.log('⚠️  Contract verification requires POLYGONSCAN_API_KEY environment variable');
            console.log('   Manual verification may be required via Polygonscan UI');

            // Example verification (commented out - requires setup):
            /*
            await run("verify:verify", {
                address: registryAddress,
                constructorArguments: [],
                contract: "contracts/RestaurantRegistry.sol:RestaurantRegistry"
            });
            await run("verify:verify", {
                address: settlementAddress,
                constructorArguments: [registryAddress, USDC_ADDRESS, FEE_RECIPIENT],
                contract: "contracts/OrderSettlement.sol:OrderSettlement"
            });
            // Add verification for other contracts...
            */

        } catch (error) {
            console.log('⚠️  Contract verification failed:', error.message);
            console.log('   Manual verification required via Polygonscan UI');
        }

        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync('./deployment-polygon.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');
        console.log('📋 Deployment info saved to deployment-polygon.json');

        // Update backend configuration
        console.log('\n⚙️ Updating backend configuration...');
        updateBackendConfig(deploymentInfo.contracts);

        // Print summary
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('=====================================');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log('=====================================');
        console.log('🌐 Network: Polygon Mainnet');
        console.log('⛽️  Contracts deployed - verification may be required manually');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

// Update backend configuration with deployed contract addresses
function updateBackendConfig(contracts) {
    const envPath = '../backend/.env';
    const envExamplePath = '../backend/.env.example';

    try {
        // Read current .env file
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else if (fs.existsSync(envExamplePath)) {
            envContent = fs.readFileSync(envExamplePath, 'utf8');
        }

        // Update contract addresses
        const contractMappings = {
            'CONTRACT_RESTAURANT_REGISTRY': contracts.restaurantRegistry,
            'CONTRACT_ORDER_SETTLEMENT': contracts.orderSettlement,
            'CONTRACT_CURRENCY_EXCHANGE': contracts.currencyExchange,
            'CONTRACT_DISPUTE_RESOLUTION': contracts.disputeResolution,
            'CONTRACT_FRAUD_DETECTION': contracts.fraudDetection,
            'CONTRACT_INVESTOR_VAULT': contracts.investorVault,
            'CONTRACT_SUPPLIER_CREDIT': contracts.supplierCredit,
            'CONTRACT_USDC': USDC_ADDRESS
        };

        let updated = false;
        Object.entries(contractMappings).forEach(([key, value]) => {
            const regex = new RegExp(`^${key}=.*
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
            USDC_ADDRESS,
            FEE_RECIPIENT
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

        // Verify contracts on Polygonscan
        console.log('\n🔍 Verifying contracts on Polygonscan...');

        try {
            console.log('Waiting for confirmations before verification...');
            // Wait a few blocks for confirmations
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

            // Note: Verification requires POLYGONSCAN_API_KEY and proper setup
            console.log('⚠️  Contract verification requires POLYGONSCAN_API_KEY environment variable');
            console.log('   Manual verification may be required via Polygonscan UI');

            // Example verification (commented out - requires setup):
            /*
            await run("verify:verify", {
                address: registryAddress,
                constructorArguments: [],
                contract: "contracts/RestaurantRegistry.sol:RestaurantRegistry"
            });
            await run("verify:verify", {
                address: settlementAddress,
                constructorArguments: [registryAddress, USDC_ADDRESS, FEE_RECIPIENT],
                contract: "contracts/OrderSettlement.sol:OrderSettlement"
            });
            // Add verification for other contracts...
            */

        } catch (error) {
            console.log('⚠️  Contract verification failed:', error.message);
            console.log('   Manual verification required via Polygonscan UI');
        }

        // Save deployment info
        const fs = require('fs');
        fs.writeFileSync('./deployment-polygon.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');
        console.log('📋 Deployment info saved to deployment-polygon.json');

        // Update backend configuration
        console.log('\n⚙️ Updating backend configuration...');
        updateBackendConfig(deploymentInfo.contracts);

        // Print summary
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('=====================================');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log('=====================================');
        console.log('🌐 Network: Polygon Mainnet');
        console.log('⛽️  Contracts deployed - verification may be required manually');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

, 'm');
            const newLine = `${key}=${value}`;

            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, newLine);
                updated = true;
            } else {
                envContent += `\n${newLine}`;
                updated = true;
            }
        });

        if (updated) {
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Backend .env file updated with contract addresses');
        } else {
            console.log('ℹ️  No contract addresses needed updating in .env file');
        }

    } catch (error) {
        console.log('⚠️  Failed to update backend configuration:', error.message);
        console.log('   Manual configuration required');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

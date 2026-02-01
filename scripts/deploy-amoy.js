
// scripts/deploy-amoy.js
const { ethers, run } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('🚀 Deploying NileLink Protocol contracts to Polygon Amoy Testnet...');

    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error('No deployer account found. Check your PRIVATE_KEY in .env file.');
    }
    console.log('Deploying with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'MATIC');

    // Polygon Amoy Addresses
    // USDC Testnet Token
    const USDC_ADDRESS = process.env.USDC_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    const deploymentInfo = {
        deployer: deployer.address,
        network: 'amoy',
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    try {
        // Fetch current gas price data once at the start
        const feeData = await ethers.provider.getFeeData();
        const gasSettings = {
            gasLimit: 5000000,
            maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined, // +50% buffer
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined
        };
        console.log(`Using gas settings: MaxFee=${ethers.formatUnits(gasSettings.maxFeePerGas || 0n, 'gwei')} gwei, PriorityFee=${ethers.formatUnits(gasSettings.maxPriorityFeePerGas || 0n, 'gwei')} gwei`);

        // 1. Deploy RestaurantRegistry
        console.log('\n🏪 Deploying RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const restaurantRegistry = await RestaurantRegistry.deploy(gasSettings);
        await restaurantRegistry.waitForDeployment();
        const registryAddress = await restaurantRegistry.getAddress();
        console.log('RestaurantRegistry deployed to:', registryAddress);
        deploymentInfo.contracts.restaurantRegistry = registryAddress;

        // 2. Deploy OrderSettlement
        console.log('\n💳 Deploying OrderSettlement...');
        const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
        // Constructor: address _restaurantRegistry, address _usdc, address _feeRecipient
        const orderSettlement = await OrderSettlement.deploy(
            registryAddress,
            USDC_ADDRESS,
            FEE_RECIPIENT,
            gasSettings
        );
        await orderSettlement.waitForDeployment();
        const settlementAddress = await orderSettlement.getAddress();
        console.log('OrderSettlement deployed to:', settlementAddress);
        deploymentInfo.contracts.orderSettlement = settlementAddress;

        // 3. Deploy CurrencyExchange
        console.log('\n💱 Deploying CurrencyExchange...');
        const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
        const currencyExchange = await CurrencyExchange.deploy(gasSettings);
        await currencyExchange.waitForDeployment();
        const exchangeAddress = await currencyExchange.getAddress();
        console.log('CurrencyExchange deployed to:', exchangeAddress);
        deploymentInfo.contracts.currencyExchange = exchangeAddress;

        // 4. Deploy FraudDetection
        console.log('\n🛡️ Deploying FraudDetection...');
        const FraudDetection = await ethers.getContractFactory('FraudDetection');
        const fraudDetection = await FraudDetection.deploy(gasSettings);
        await fraudDetection.waitForDeployment();
        const fraudAddress = await fraudDetection.getAddress();
        console.log('FraudDetection deployed to:', fraudAddress);
        deploymentInfo.contracts.fraudDetection = fraudAddress;

        // 5. Deploy DisputeResolution
        console.log('\n⚖️ Deploying DisputeResolution...');
        const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
        const disputeResolution = await DisputeResolution.deploy(gasSettings);
        await disputeResolution.waitForDeployment();
        const disputeAddress = await disputeResolution.getAddress();
        console.log('DisputeResolution deployed to:', disputeAddress);
        deploymentInfo.contracts.disputeResolution = disputeAddress;

        // 6. Deploy InvestorVault
        console.log('\n💼 Deploying InvestorVault...');
        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        const investorVault = await InvestorVault.deploy(gasSettings);
        await investorVault.waitForDeployment();
        const vaultAddress = await investorVault.getAddress();
        console.log('InvestorVault deployed to:', vaultAddress);
        deploymentInfo.contracts.investorVault = vaultAddress;

        // 7. Deploy SupplierCredit
        console.log('\n🏭 Deploying SupplierCredit...');
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        const supplierCredit = await SupplierCredit.deploy(gasSettings);
        await supplierCredit.waitForDeployment();
        const creditAddress = await supplierCredit.getAddress();
        console.log('SupplierCredit deployed to:', creditAddress);
        deploymentInfo.contracts.supplierCredit = creditAddress;

        // Verify contracts
        console.log('\n🔍 Verifying contracts on Polygonscan Amoy...');
        if (process.env.POLYGONSCAN_API_KEY) {
            console.log('Waiting for confirmations...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            try {
                // Example verification logic - uncomment to enable
                /*
                await run("verify:verify", {
                    address: registryAddress,
                    constructorArguments: [],
                });
                await run("verify:verify", {
                    address: settlementAddress,
                    constructorArguments: [registryAddress, USDC_ADDRESS, FEE_RECIPIENT],
                });
                */
                console.log('Verification skipped for speed. Run manual verification if needed.');
            } catch (err) {
                console.log('Verification failed:', err.message);
            }
        } else {
            console.log('Skipping verification (no API key)');
        }

        // Save deployment info
        fs.writeFileSync('./deployment-amoy.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n✅ All contracts deployed successfully!');
        console.log('📋 Deployment info saved to deployment-amoy.json');

        // Update backend configuration
        console.log('\n⚙️ Updating backend configuration...');
        updateBackendConfig(deploymentInfo.contracts, USDC_ADDRESS);

        // Print summary
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('=====================================');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        console.log('=====================================');
        console.log('🌐 Network: Polygon Amoy Testnet');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

function updateBackendConfig(contracts, usdcAddress) {
    const envPath = '../backend/.env';
    const envExamplePath = '../backend/.env.example';

    try {
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else if (fs.existsSync(envExamplePath)) {
            envContent = fs.readFileSync(envExamplePath, 'utf8');
        }

        const contractMappings = {
            'CONTRACT_RESTAURANT_REGISTRY': contracts.restaurantRegistry,
            'CONTRACT_ORDER_SETTLEMENT': contracts.orderSettlement,
            'CONTRACT_CURRENCY_EXCHANGE': contracts.currencyExchange,
            'CONTRACT_DISPUTE_RESOLUTION': contracts.disputeResolution,
            'CONTRACT_FRAUD_DETECTION': contracts.fraudDetection,
            'CONTRACT_INVESTOR_VAULT': contracts.investorVault,
            'CONTRACT_SUPPLIER_CREDIT': contracts.supplierCredit,
            'CONTRACT_USDC': usdcAddress
        };

        let updated = false;
        Object.entries(contractMappings).forEach(([key, value]) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
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
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

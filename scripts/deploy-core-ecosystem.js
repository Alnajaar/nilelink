// scripts/deploy-core-ecosystem.js
// Core ecosystem deployment focusing on essential contracts

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 CORE NILELINK ECOSYSTEM DEPLOYMENT');
    console.log('=====================================\n');

    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'MATIC\n');

    // Configuration
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    
    console.log(`🌐 Network: ${network.name} (Chain ID: ${chainId})`);
    
    // Set appropriate USDC address based on network
    let USDC_ADDRESS;
    let FEE_RECIPIENT = deployer.address;
    
    if (chainId === 80002n) {
        // Polygon Amoy Testnet
        USDC_ADDRESS = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
        console.log('Using Amoy USDC:', USDC_ADDRESS);
    } else if (chainId === 137n) {
        // Polygon Mainnet
        USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
        console.log('Using Mainnet USDC:', USDC_ADDRESS);
    } else {
        // Local development - deploy mock
        console.log('Local network detected - deploying MockUSDC...');
        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        const mockUSDC = await MockUSDC.deploy('USD Coin', 'USDC', 6);
        await mockUSDC.waitForDeployment();
        USDC_ADDRESS = await mockUSDC.getAddress();
        console.log('MockUSDC deployed to:', USDC_ADDRESS);
        
        // Mint some tokens for testing
        await mockUSDC.mint(deployer.address, ethers.parseUnits('1000000', 6));
        console.log('Minted 1M USDC to deployer for testing');
    }

    // Deployment tracking
    const deploymentInfo = {
        deployer: deployer.address,
        network: network.name,
        chainId: chainId.toString(),
        timestamp: new Date().toISOString(),
        usdc: USDC_ADDRESS,
        feeRecipient: FEE_RECIPIENT,
        contracts: {}
    };

    try {
        // PHASE 1: ESSENTIAL CORE COMPONENTS
        console.log('\n=== PHASE 1: ESSENTIAL CORE ===\n');

        // 1. Deploy RestaurantRegistry
        console.log('🏪 Deploying RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const restaurantRegistry = await RestaurantRegistry.deploy();
        await restaurantRegistry.waitForDeployment();
        const registryAddress = await restaurantRegistry.getAddress();
        deploymentInfo.contracts.restaurantRegistry = registryAddress;
        console.log('✅ RestaurantRegistry deployed to:', registryAddress);

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
        deploymentInfo.contracts.orderSettlement = settlementAddress;
        console.log('✅ OrderSettlement deployed to:', settlementAddress);

        // 3. Deploy CurrencyExchange
        console.log('\n💱 Deploying CurrencyExchange...');
        const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
        const currencyExchange = await CurrencyExchange.deploy();
        await currencyExchange.waitForDeployment();
        const exchangeAddress = await currencyExchange.getAddress();
        deploymentInfo.contracts.currencyExchange = exchangeAddress;
        console.log('✅ CurrencyExchange deployed to:', exchangeAddress);

        // 4. Deploy DisputeResolution
        console.log('\n⚖️ Deploying DisputeResolution...');
        const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
        const disputeResolution = await DisputeResolution.deploy(
            settlementAddress,
            USDC_ADDRESS
        );
        await disputeResolution.waitForDeployment();
        const disputeAddress = await disputeResolution.getAddress();
        deploymentInfo.contracts.disputeResolution = disputeAddress;
        console.log('✅ DisputeResolution deployed to:', disputeAddress);

        // 5. Deploy FraudDetection
        console.log('\n🛡️ Deploying FraudDetection...');
        const FraudDetection = await ethers.getContractFactory('FraudDetection');
        const fraudDetection = await FraudDetection.deploy();
        await fraudDetection.waitForDeployment();
        const fraudAddress = await fraudDetection.getAddress();
        deploymentInfo.contracts.fraudDetection = fraudAddress;
        console.log('✅ FraudDetection deployed to:', fraudAddress);

        // 6. Deploy InvestorVault
        console.log('\n🏦 Deploying InvestorVault...');
        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        const investorVault = await InvestorVault.deploy(
            USDC_ADDRESS,
            settlementAddress,
            FEE_RECIPIENT
        );
        await investorVault.waitForDeployment();
        const vaultAddress = await investorVault.getAddress();
        deploymentInfo.contracts.investorVault = vaultAddress;
        console.log('✅ InvestorVault deployed to:', vaultAddress);

        // 7. Deploy SupplierCredit
        console.log('\n🏭 Deploying SupplierCredit...');
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        const supplierCredit = await SupplierCredit.deploy(USDC_ADDRESS);
        await supplierCredit.waitForDeployment();
        const creditAddress = await supplierCredit.getAddress();
        deploymentInfo.contracts.supplierCredit = creditAddress;
        console.log('✅ SupplierCredit deployed to:', creditAddress);

        // 8. Deploy DeliveryCoordinator
        console.log('\n🚚 Deploying DeliveryCoordinator...');
        const DeliveryCoordinator = await ethers.getContractFactory('DeliveryCoordinator');
        const deliveryCoordinator = await DeliveryCoordinator.deploy(
            settlementAddress,
            FEE_RECIPIENT
        );
        await deliveryCoordinator.waitForDeployment();
        const deliveryAddress = await deliveryCoordinator.getAddress();
        deploymentInfo.contracts.deliveryCoordinator = deliveryAddress;
        console.log('✅ DeliveryCoordinator deployed to:', deliveryAddress);

        // 9. Deploy ProofOfDelivery
        console.log('\n📦 Deploying ProofOfDelivery...');
        const ProofOfDelivery = await ethers.getContractFactory('ProofOfDelivery');
        const proofOfDelivery = await ProofOfDelivery.deploy(deliveryAddress);
        await proofOfDelivery.waitForDeployment();
        const proofAddress = await proofOfDelivery.getAddress();
        deploymentInfo.contracts.proofOfDelivery = proofAddress;
        console.log('✅ ProofOfDelivery deployed to:', proofAddress);

        // 10. Deploy SupplierRegistry
        console.log('\n📋 Deploying SupplierRegistry...');
        const SupplierRegistry = await ethers.getContractFactory('SupplierRegistry');
        const supplierRegistry = await SupplierRegistry.deploy(FEE_RECIPIENT);
        await supplierRegistry.waitForDeployment();
        const supplierRegAddress = await supplierRegistry.getAddress();
        deploymentInfo.contracts.supplierRegistry = supplierRegAddress;
        console.log('✅ SupplierRegistry deployed to:', supplierRegAddress);

        // 11. Deploy SupplyChain
        console.log('\n🔗 Deploying SupplyChain...');
        const SupplyChain = await ethers.getContractFactory('SupplyChain');
        const supplyChain = await SupplyChain.deploy(
            supplierRegAddress,
            USDC_ADDRESS,
            FEE_RECIPIENT
        );
        await supplyChain.waitForDeployment();
        const supplyChainAddress = await supplyChain.getAddress();
        deploymentInfo.contracts.supplyChain = supplyChainAddress;
        console.log('✅ SupplyChain deployed to:', supplyChainAddress);

        // 12. Deploy BridgeCoordinator
        console.log('\n🌉 Deploying BridgeCoordinator...');
        const BridgeCoordinator = await ethers.getContractFactory('BridgeCoordinator');
        const bridgeCoordinator = await BridgeCoordinator.deploy(USDC_ADDRESS, FEE_RECIPIENT);
        await bridgeCoordinator.waitForDeployment();
        const bridgeAddress = await bridgeCoordinator.getAddress();
        deploymentInfo.contracts.bridgeCoordinator = bridgeAddress;
        console.log('✅ BridgeCoordinator deployed to:', bridgeAddress);

        // 13. Deploy Marketplace
        console.log('\n🛒 Deploying Marketplace...');
        const Marketplace = await ethers.getContractFactory('Marketplace');
        const marketplace = await Marketplace.deploy(
            registryAddress,
            fraudAddress,
            USDC_ADDRESS,
            FEE_RECIPIENT
        );
        await marketplace.waitForDeployment();
        const marketplaceAddress = await marketplace.getAddress();
        deploymentInfo.contracts.marketplace = marketplaceAddress;
        console.log('✅ Marketplace deployed to:', marketplaceAddress);

        // PHASE 2: BASIC SECURITY (SIMPLIFIED)
        console.log('\n=== PHASE 2: BASIC SECURITY ===\n');

        // Deploy simplified security contracts that are working
        try {
            // 1. AdaptiveDefense (no constructor)
            console.log('🛡️ Deploying AdaptiveDefense...');
            const AdaptiveDefense = await ethers.getContractFactory('AdaptiveDefense');
            const adaptiveDefense = await AdaptiveDefense.deploy();
            await adaptiveDefense.waitForDeployment();
            const adaptiveAddress = await adaptiveDefense.getAddress();
            deploymentInfo.contracts.adaptiveDefense = adaptiveAddress;
            console.log('✅ AdaptiveDefense deployed to:', adaptiveAddress);

            // 2. PredictiveThreatModel (no constructor)
            console.log('🔮 Deploying PredictiveThreatModel...');
            const PredictiveThreatModel = await ethers.getContractFactory('PredictiveThreatModel');
            const predictiveThreatModel = await PredictiveThreatModel.deploy();
            await predictiveThreatModel.waitForDeployment();
            const predictiveAddress = await predictiveThreatModel.getAddress();
            deploymentInfo.contracts.predictiveThreatModel = predictiveAddress;
            console.log('✅ PredictiveThreatModel deployed to:', predictiveAddress);

        } catch (error) {
            console.log('⚠️ Some security contracts failed to deploy (continuing without them)');
            console.log('Error:', error.message);
        }

        // PHASE 3: FINAL CONFIGURATION
        console.log('\n=== PHASE 3: FINAL CONFIGURATION ===\n');

        // Set governance roles in contracts that support it
        console.log('👥 Setting governance roles...');
        try {
            await restaurantRegistry.setGovernance(deployer.address, true);
            await disputeResolution.setGovernance(deployer.address, true);
            await fraudDetection.setGovernance(deployer.address, true);
            await investorVault.setGovernance(deployer.address, true);
            await supplierCredit.setGovernance(deployer.address, true);
            console.log('✅ Governance roles configured');
        } catch (error) {
            console.log('⚠️ Some governance setup failed (may not be supported by all contracts)');
        }

        // Save deployment information
        const deploymentPath = path.join(__dirname, '..', `deployment-${network.name}-core.json`);
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

        // Update local deployment file
        const localDeploymentPath = path.join(__dirname, '..', 'deployments', 'local.json');
        const localDeployment = {
            "NileLinkProtocol": "0x0000000000000000000000000000000000000000", // Not using monolithic contract
            "RestaurantRegistry": deploymentInfo.contracts.restaurantRegistry,
            "OrderSettlement": deploymentInfo.contracts.orderSettlement,
            "CurrencyExchange": deploymentInfo.contracts.currencyExchange,
            "DisputeResolution": deploymentInfo.contracts.disputeResolution,
            "FraudDetection": deploymentInfo.contracts.fraudDetection,
            "InvestorVault": deploymentInfo.contracts.investorVault,
            "SupplierCredit": deploymentInfo.contracts.supplierCredit,
            "DeliveryCoordinator": deploymentInfo.contracts.deliveryCoordinator,
            "ProofOfDelivery": deploymentInfo.contracts.proofOfDelivery,
            "SupplierRegistry": deploymentInfo.contracts.supplierRegistry,
            "SupplyChain": deploymentInfo.contracts.supplyChain,
            "BridgeCoordinator": deploymentInfo.contracts.bridgeCoordinator,
            "Marketplace": deploymentInfo.contracts.marketplace,
            "AISecurityOrchestrator": deploymentInfo.contracts.adaptiveDefense || "0x0000000000000000000000000000000000000000",
            "CoreAIOracle": deploymentInfo.contracts.predictiveThreatModel || "0x0000000000000000000000000000000000000000"
        };
        fs.writeFileSync(localDeploymentPath, JSON.stringify(localDeployment, null, 4));
        console.log(`💾 Local deployment updated: ${localDeploymentPath}`);

        // FINAL SUMMARY
        console.log('\n🎉 CORE ECOSYSTEM DEPLOYMENT SUCCESSFUL!');
        console.log('========================================');
        console.log(`🌐 Network: ${network.name} (${chainId})`);
        console.log(`📅 Timestamp: ${deploymentInfo.timestamp}`);
        console.log(`💰 USDC Address: ${USDC_ADDRESS}`);
        console.log(`👤 Fee Recipient: ${FEE_RECIPIENT}`);
        console.log('');
        console.log('📋 DEPLOYED CONTRACTS:');
        Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
            if (address && address !== ethers.ZeroAddress) {
                console.log(`   ${name}: ${address}`);
            }
        });
        console.log('');
        console.log('🚀 Ready for web application integration!');
        console.log('💡 Note: Some advanced AI security contracts were skipped due to deployment issues.');

    } catch (error) {
        console.error('\n❌ Deployment failed!');
        console.error('Error:', error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

// Run the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
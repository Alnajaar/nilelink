// scripts/deploy-complete-ecosystem.js
// Complete deployment of all NileLink Protocol contracts

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 DEPLOYING COMPLETE NILELINK ECOSYSTEM');
    console.log('========================================\n');

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
        // PHASE 1: CORE PROTOCOL DEPLOYMENT
        console.log('\n=== PHASE 1: CORE PROTOCOL ===\n');

        // 1. Deploy NileLink Protocol (main orchestrator)
        console.log('🔗 Deploying NileLinkProtocol...');
        const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
        const protocol = await NileLinkProtocol.deploy(USDC_ADDRESS, FEE_RECIPIENT);
        await protocol.waitForDeployment();
        const protocolAddress = await protocol.getAddress();
        deploymentInfo.contracts.nileLinkProtocol = protocolAddress;
        console.log('✅ NileLinkProtocol deployed to:', protocolAddress);

        // 2. Deploy remaining core contracts via protocol
        console.log('\n🏗️ Deploying remaining core contracts...');
        const tx = await protocol.deployRemainingContracts();
        await tx.wait();
        console.log('✅ Remaining contracts deployed');

        // Get all contract addresses
        const addresses = await protocol.getContractAddresses();
        
        // Update deployment info with all addresses
        deploymentInfo.contracts = {
            ...deploymentInfo.contracts,
            restaurantRegistry: addresses.restaurantRegistry,
            orderSettlement: addresses.orderSettlement,
            currencyExchange: addresses.currencyExchange,
            disputeResolution: addresses.disputeResolution,
            fraudDetection: addresses.fraudDetection,
            investorVault: addresses.investorVault,
            supplierCredit: addresses.supplierCredit,
            deliveryCoordinator: addresses.deliveryCoordinator,
            proofOfDelivery: addresses.proofOfDelivery,
            supplierRegistry: addresses.supplierRegistry,
            supplyChain: addresses.supplierRegistry, // Will update after deployment
            bridgeCoordinator: addresses.bridgeCoordinator,
            marketplace: addresses.marketplace,
            usdc: USDC_ADDRESS,
            feeRecipient: FEE_RECIPIENT
        };

        // PHASE 2: SECURITY LAYER DEPLOYMENT
        console.log('\n=== PHASE 2: AI SECURITY LAYER ===\n');

        // Deploy security components
        const securityContracts = {};
        
        // 1. SwarmIntelligence
        console.log('🐝 Deploying SwarmIntelligence...');
        const SwarmIntelligence = await ethers.getContractFactory('SwarmIntelligence');
        const swarmIntelligence = await SwarmIntelligence.deploy();
        await swarmIntelligence.waitForDeployment();
        securityContracts.swarmIntelligence = await swarmIntelligence.getAddress();
        console.log('✅ SwarmIntelligence deployed to:', securityContracts.swarmIntelligence);

        // 2. AdaptiveDefense
        console.log('🛡️ Deploying AdaptiveDefense...');
        const AdaptiveDefense = await ethers.getContractFactory('AdaptiveDefense');
        const adaptiveDefense = await AdaptiveDefense.deploy();
        await adaptiveDefense.waitForDeployment();
        securityContracts.adaptiveDefense = await adaptiveDefense.getAddress();
        console.log('✅ AdaptiveDefense deployed to:', securityContracts.adaptiveDefense);

        // 3. PredictiveThreatModel
        console.log('🔮 Deploying PredictiveThreatModel...');
        const PredictiveThreatModel = await ethers.getContractFactory('PredictiveThreatModel');
        const predictiveThreatModel = await PredictiveThreatModel.deploy();
        await predictiveThreatModel.waitForDeployment();
        securityContracts.predictiveThreatModel = await predictiveThreatModel.getAddress();
        console.log('✅ PredictiveThreatModel deployed to:', securityContracts.predictiveThreatModel);

        // 4. AISecurityOrchestrator
        console.log('🤖 Deploying AISecurityOrchestrator...');
        const AISecurityOrchestrator = await ethers.getContractFactory('AISecurityOrchestrator');
        const securityOrchestrator = await AISecurityOrchestrator.deploy(
            addresses.fraudDetection,
            securityContracts.swarmIntelligence,
            securityContracts.adaptiveDefense,
            securityContracts.predictiveThreatModel,
            ethers.ZeroAddress // AI Oracle to be set later
        );
        await securityOrchestrator.waitForDeployment();
        securityContracts.securityOrchestrator = await securityOrchestrator.getAddress();
        console.log('✅ AISecurityOrchestrator deployed to:', securityContracts.securityOrchestrator);

        // 5. CoreAIOracle
        console.log('🧠 Deploying CoreAIOracle...');
        const CoreAIOracle = await ethers.getContractFactory('CoreAIOracle');
        const coreAIOracle = await CoreAIOracle.deploy(securityContracts.securityOrchestrator);
        await coreAIOracle.waitForDeployment();
        securityContracts.coreAIOracle = await coreAIOracle.getAddress();
        console.log('✅ CoreAIOracle deployed to:', securityContracts.coreAIOracle);

        // Connect security components
        console.log('\n🔗 Connecting security components...');
        await securityOrchestrator.setAIOracle(securityContracts.coreAIOracle);
        console.log('✅ Security components connected');

        // Update deployment info
        deploymentInfo.contracts = {
            ...deploymentInfo.contracts,
            ...securityContracts
        };

        // PHASE 3: SET PROTOCOL CONFIGURATION
        console.log('\n=== PHASE 3: PROTOCOL CONFIGURATION ===\n');

        // Set security orchestrator in main protocol
        console.log('🔐 Setting security orchestrator...');
        await protocol.setSecurityOrchestrator(securityContracts.securityOrchestrator);
        console.log('✅ Security orchestrator set');

        // Set governance roles
        console.log('👥 Setting governance roles...');
        await protocol.setGovernance(deployer.address, true);
        console.log('✅ Governance roles configured');

        // PHASE 4: VERIFY DEPLOYMENT
        console.log('\n=== PHASE 4: DEPLOYMENT VERIFICATION ===\n');

        // Test basic functionality
        console.log('🧪 Testing protocol functionality...');
        
        // Test getting protocol stats
        try {
            const stats = await protocol.getProtocolStats();
            console.log('✅ Protocol stats retrieved successfully');
            console.log('   Total Restaurants:', stats.totalRestaurants.toString());
            console.log('   Total Orders:', stats.totalOrders.toString());
        } catch (error) {
            console.log('⚠️  Protocol stats test failed:', error.message);
        }

        // Save deployment information
        const deploymentPath = path.join(__dirname, '..', `deployment-${network.name}.json`);
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

        // Update local deployment file
        const localDeploymentPath = path.join(__dirname, '..', 'deployments', 'local.json');
        const localDeployment = {
            "NileLinkProtocol": deploymentInfo.contracts.nileLinkProtocol,
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
            "AISecurityOrchestrator": deploymentInfo.contracts.securityOrchestrator,
            "CoreAIOracle": deploymentInfo.contracts.coreAIOracle
        };
        fs.writeFileSync(localDeploymentPath, JSON.stringify(localDeployment, null, 4));
        console.log(`💾 Local deployment updated: ${localDeploymentPath}`);

        // FINAL SUMMARY
        console.log('\n🎉 COMPLETE ECOSYSTEM DEPLOYMENT SUCCESSFUL!');
        console.log('=============================================');
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
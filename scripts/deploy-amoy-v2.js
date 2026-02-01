const { ethers, run } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Deploying NileLink Protocol Full Stack to Polygon Amoy Testnet...');

    const [deployer] = await ethers.getSigners();
    if (!deployer) {
        throw new Error('No deployer account found. Check your PRIVATE_KEY in .env file.');
    }
    console.log('Deploying with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'MATIC');

    // Amoy Addresses
    const USDC_ADDRESS = process.env.AMOY_USDC_ADDRESS || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582';
    const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address;

    const deploymentInfo = {
        deployer: deployer.address,
        network: 'amoy',
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    // Helper to wait for transactions
    const wait = async (tx) => {
        console.log(`   Pending: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`   Confirmed in block: ${receipt.blockNumber}`);
        return receipt;
    };

    try {
        const feeData = await ethers.provider.getFeeData();
        const gasSettings = {
            maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined
        };

        // 1. Deploy AI Security Sub-agents
        console.log('\n🐝 Deploying SwarmIntelligence...');
        const SwarmIntelligence = await ethers.getContractFactory('SwarmIntelligence');
        const swarmIntelligence = await SwarmIntelligence.deploy(ethers.ZeroAddress, gasSettings);
        await swarmIntelligence.waitForDeployment();
        deploymentInfo.contracts.swarmIntelligence = await swarmIntelligence.getAddress();
        console.log('SwarmIntelligence deployed to:', deploymentInfo.contracts.swarmIntelligence);

        console.log('\n🛡️ Deploying AdaptiveDefense...');
        const AdaptiveDefense = await ethers.getContractFactory('AdaptiveDefense');
        const adaptiveDefense = await AdaptiveDefense.deploy(gasSettings);
        await adaptiveDefense.waitForDeployment();
        deploymentInfo.contracts.adaptiveDefense = await adaptiveDefense.getAddress();
        console.log('AdaptiveDefense deployed to:', deploymentInfo.contracts.adaptiveDefense);

        console.log('\n🔮 Deploying PredictiveThreatModel...');
        const PredictiveThreatModel = await ethers.getContractFactory('PredictiveThreatModel');
        const predictiveThreatModel = await PredictiveThreatModel.deploy(gasSettings);
        await predictiveThreatModel.waitForDeployment();
        deploymentInfo.contracts.predictiveThreatModel = await predictiveThreatModel.getAddress();
        console.log('PredictiveThreatModel deployed to:', deploymentInfo.contracts.predictiveThreatModel);

        // 2. Deploy Core Sub-contracts
        console.log('\n🏛️ Deploying RestaurantRegistry...');
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const restaurantRegistry = await RestaurantRegistry.deploy(gasSettings);
        await restaurantRegistry.waitForDeployment();
        deploymentInfo.contracts.restaurantRegistry = await restaurantRegistry.getAddress();
        console.log('RestaurantRegistry deployed to:', deploymentInfo.contracts.restaurantRegistry);

        console.log('\n💰 Deploying OrderSettlement...');
        const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
        const orderSettlement = await OrderSettlement.deploy(
            deploymentInfo.contracts.restaurantRegistry,
            USDC_ADDRESS,
            FEE_RECIPIENT,
            gasSettings
        );
        await orderSettlement.waitForDeployment();
        deploymentInfo.contracts.orderSettlement = await orderSettlement.getAddress();
        console.log('OrderSettlement deployed to:', deploymentInfo.contracts.orderSettlement);

        console.log('\n💱 Deploying CurrencyExchange...');
        const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
        const currencyExchange = await CurrencyExchange.deploy(gasSettings);
        await currencyExchange.waitForDeployment();
        deploymentInfo.contracts.currencyExchange = await currencyExchange.getAddress();
        console.log('CurrencyExchange deployed to:', deploymentInfo.contracts.currencyExchange);

        console.log('\n⚖️ Deploying DisputeResolution...');
        const DisputeResolution = await ethers.getContractFactory('DisputeResolution');
        const disputeResolution = await DisputeResolution.deploy(
            deploymentInfo.contracts.orderSettlement,
            USDC_ADDRESS,
            gasSettings
        );
        await disputeResolution.waitForDeployment();
        deploymentInfo.contracts.disputeResolution = await disputeResolution.getAddress();
        console.log('DisputeResolution deployed to:', deploymentInfo.contracts.disputeResolution);

        console.log('\n🕵️ Deploying FraudDetection...');
        const FraudDetection = await ethers.getContractFactory('FraudDetection');
        const fraudDetection = await FraudDetection.deploy(gasSettings);
        await fraudDetection.waitForDeployment();
        deploymentInfo.contracts.fraudDetection = await fraudDetection.getAddress();
        console.log('FraudDetection deployed to:', deploymentInfo.contracts.fraudDetection);

        // 3. Deploy Main Protocol Orchestrator
        console.log('\n🎯 Deploying NileLinkProtocol (Main Orchestrator)...');
        const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
        const protocol = await NileLinkProtocol.deploy(USDC_ADDRESS, FEE_RECIPIENT, gasSettings);
        await protocol.waitForDeployment();
        const protocolAddress = await protocol.getAddress();
        deploymentInfo.contracts.nileLinkProtocol = protocolAddress;
        console.log('NileLinkProtocol deployed to:', protocolAddress);

        // 4. Deploy remaining sub-contracts
        console.log('\n🏦 Deploying InvestorVault...');
        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        const investorVault = await InvestorVault.deploy(USDC_ADDRESS, deploymentInfo.contracts.orderSettlement, FEE_RECIPIENT, gasSettings);
        await investorVault.waitForDeployment();
        deploymentInfo.contracts.investorVault = await investorVault.getAddress();

        console.log('\n💳 Deploying SupplierCredit...');
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        const supplierCredit = await SupplierCredit.deploy(USDC_ADDRESS, gasSettings);
        await supplierCredit.waitForDeployment();
        deploymentInfo.contracts.supplierCredit = await supplierCredit.getAddress();

        console.log('\n🚚 Deploying DeliveryCoordinator...');
        const DeliveryCoordinator = await ethers.getContractFactory('DeliveryCoordinator');
        const deliveryCoordinator = await DeliveryCoordinator.deploy(deploymentInfo.contracts.orderSettlement, FEE_RECIPIENT, gasSettings);
        await deliveryCoordinator.waitForDeployment();
        deploymentInfo.contracts.deliveryCoordinator = await deliveryCoordinator.getAddress();

        console.log('\n📦 Deploying ProofOfDelivery...');
        const ProofOfDelivery = await ethers.getContractFactory('ProofOfDelivery');
        const proofOfDelivery = await ProofOfDelivery.deploy(deploymentInfo.contracts.deliveryCoordinator, gasSettings);
        await proofOfDelivery.waitForDeployment();
        deploymentInfo.contracts.proofOfDelivery = await proofOfDelivery.getAddress();

        console.log('\n🏭 Deploying SupplierRegistry...');
        const SupplierRegistry = await ethers.getContractFactory('SupplierRegistry');
        const supplierRegistry = await SupplierRegistry.deploy(FEE_RECIPIENT, gasSettings);
        await supplierRegistry.waitForDeployment();
        deploymentInfo.contracts.supplierRegistry = await supplierRegistry.getAddress();

        console.log('\n⛓️ Deploying SupplyChain...');
        const SupplyChain = await ethers.getContractFactory('SupplyChain');
        const supplyChain = await SupplyChain.deploy(deploymentInfo.contracts.supplierRegistry, USDC_ADDRESS, FEE_RECIPIENT, gasSettings);
        await supplyChain.waitForDeployment();
        deploymentInfo.contracts.supplyChain = await supplyChain.getAddress();

        console.log('\n🌉 Deploying BridgeCoordinator...');
        const BridgeCoordinator = await ethers.getContractFactory('BridgeCoordinator');
        const bridgeCoordinator = await BridgeCoordinator.deploy(USDC_ADDRESS, FEE_RECIPIENT, gasSettings);
        await bridgeCoordinator.waitForDeployment();
        deploymentInfo.contracts.bridgeCoordinator = await bridgeCoordinator.getAddress();

        console.log('\n🏪 Deploying Marketplace...');
        const Marketplace = await ethers.getContractFactory('Marketplace');
        const marketplace = await Marketplace.deploy(
            deploymentInfo.contracts.restaurantRegistry,
            deploymentInfo.contracts.fraudDetection,
            USDC_ADDRESS,
            FEE_RECIPIENT,
            gasSettings
        );
        await marketplace.waitForDeployment();
        deploymentInfo.contracts.marketplace = await marketplace.getAddress();

        // 5. Deploy Mock Bridge Provider and Configure Coordinator
        console.log('\n🌉 Deploying MockBridgeProvider...');
        const MockBridgeProvider = await ethers.getContractFactory('MockBridgeProvider');
        const bridgeProvider = await MockBridgeProvider.deploy('NileLink LayerZero Mock', gasSettings);
        await bridgeProvider.waitForDeployment();
        const bridgeProviderAddress = await bridgeProvider.getAddress();
        deploymentInfo.contracts.mockBridgeProvider = bridgeProviderAddress;
        console.log('MockBridgeProvider deployed to:', bridgeProviderAddress);

        console.log('\n⚙️ Configuring BridgeCoordinator...');
        await wait(await bridgeProvider.setChainSupport(1, true, gasSettings)); // Ethereum
        await wait(await bridgeProvider.setChainSupport(137, true, gasSettings)); // Polygon
        await wait(await bridgeProvider.setChainSupport(42161, true, gasSettings)); // Arbitrum

        await wait(await bridgeCoordinator.configureProvider(
            0, // BridgeProvider.LAYERZERO enum index
            bridgeProviderAddress,
            true, // isActive
            10, // 0.1% fee multiplier
            [1, 137, 42161], // supported chains
            gasSettings
        ));
        console.log('✅ BridgeCoordinator configured');

        // 6. Transfer ownership and link everything to NileLinkProtocol
        console.log('\n👑 Linking and transferring ownership to NileLinkProtocol...');

        console.log('   - RestaurantRegistry');
        await wait(await restaurantRegistry.transferOwnership(protocolAddress, gasSettings));

        console.log('   - OrderSettlement');
        await wait(await orderSettlement.transferOwnership(protocolAddress, gasSettings));

        console.log('   - CurrencyExchange');
        await wait(await currencyExchange.transferOwnership(protocolAddress, gasSettings));

        console.log('   - DisputeResolution');
        await wait(await disputeResolution.transferOwnership(protocolAddress, gasSettings));

        console.log('   - FraudDetection');
        await wait(await fraudDetection.transferOwnership(protocolAddress, gasSettings));

        console.log('   - Setting Core Contracts...');
        await wait(await protocol.setCoreContracts(
            deploymentInfo.contracts.restaurantRegistry,
            deploymentInfo.contracts.orderSettlement,
            deploymentInfo.contracts.currencyExchange,
            deploymentInfo.contracts.disputeResolution,
            deploymentInfo.contracts.fraudDetection,
            gasSettings
        ));

        console.log('   - Transferring secondary contracts...');
        await wait(await investorVault.transferOwnership(protocolAddress, gasSettings));
        await wait(await supplierCredit.transferOwnership(protocolAddress, gasSettings));
        await wait(await deliveryCoordinator.transferOwnership(protocolAddress, gasSettings));
        await wait(await proofOfDelivery.transferOwnership(protocolAddress, gasSettings));
        await wait(await supplierRegistry.transferOwnership(protocolAddress, gasSettings));
        await wait(await supplyChain.transferOwnership(protocolAddress, gasSettings));
        await wait(await bridgeCoordinator.transferOwnership(protocolAddress, gasSettings));
        await wait(await marketplace.transferOwnership(protocolAddress, gasSettings));

        console.log('   - Setting Secondary Contracts...');
        await wait(await protocol.setSecondaryContracts(
            deploymentInfo.contracts.investorVault,
            deploymentInfo.contracts.supplierCredit,
            deploymentInfo.contracts.deliveryCoordinator,
            deploymentInfo.contracts.proofOfDelivery,
            deploymentInfo.contracts.supplierRegistry,
            deploymentInfo.contracts.supplyChain,
            deploymentInfo.contracts.bridgeCoordinator,
            deploymentInfo.contracts.marketplace,
            gasSettings
        ));

        // 7. Deploy AISecurityOrchestrator
        console.log('\n🤖 Deploying AISecurityOrchestrator...');
        const AISecurityOrchestrator = await ethers.getContractFactory('AISecurityOrchestrator');
        const securityOrchestrator = await AISecurityOrchestrator.deploy(
            deploymentInfo.contracts.fraudDetection,
            deploymentInfo.contracts.swarmIntelligence,
            deploymentInfo.contracts.adaptiveDefense,
            deploymentInfo.contracts.predictiveThreatModel,
            ethers.ZeroAddress, // Set oracle later
            gasSettings
        );
        await securityOrchestrator.waitForDeployment();
        const securityOrchestratorAddress = await securityOrchestrator.getAddress();
        deploymentInfo.contracts.securityOrchestrator = securityOrchestratorAddress;
        console.log('AISecurityOrchestrator deployed to:', securityOrchestratorAddress);

        // 8. Deploy CoreAIOracle
        console.log('\n🧠 Deploying CoreAIOracle...');
        const CoreAIOracle = await ethers.getContractFactory('CoreAIOracle');
        const coreAIOracle = await CoreAIOracle.deploy(securityOrchestratorAddress, gasSettings);
        await coreAIOracle.waitForDeployment();
        const coreAIOracleAddress = await coreAIOracle.getAddress();
        deploymentInfo.contracts.coreAIOracle = coreAIOracleAddress;
        console.log('CoreAIOracle deployed to:', coreAIOracleAddress);

        // 9. Connect Security Layer to Protocol
        console.log('\n🔗 Connecting Security Layer to NileLinkProtocol...');
        await wait(await protocol.setSecurityOrchestrator(securityOrchestratorAddress, gasSettings));
        await wait(await securityOrchestrator.setAIOracle(coreAIOracleAddress, gasSettings));
        console.log('✅ Security layer connected successfully');

        // 10. Save Deployment Info
        const infoPath = path.join(__dirname, '../deployment-amoy.json');
        fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n📄 Deployment data saved to ${infoPath}`);

        console.log('\n🎉 ALL CORE CONTRACTS DEPLOYED AND INTEGRATED!');
        console.log('==============================================');
        console.log('NileLinkProtocol:', protocolAddress);
        console.log('Security Orchestrator:', securityOrchestratorAddress);
        console.log('AI Oracle:', coreAIOracleAddress);
        console.log('==============================================');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

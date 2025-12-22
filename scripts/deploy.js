// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying NileLink Protocol contracts to localhost...");
    
    // Get signers
    const [deployer, feeRecipient, governance] = await ethers.getSigners();
    
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Deploy USDC mock token first
    console.log("\n📄 Deploying USDC Mock Token...");
    const USDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await USDC.deploy("USD Coin", "USDC", 6);
    await usdc.deployed();
    console.log("USDC Mock Token deployed to:", usdc.address);
    
    // Deploy main protocol
    console.log("\n🔗 Deploying NileLink Protocol...");
    const NileLinkProtocol = await ethers.getContractFactory("NileLinkProtocol");
    const protocol = await NileLinkProtocol.deploy(usdc.address, feeRecipient.address);
    await protocol.deployed();
    console.log("NileLink Protocol deployed to:", protocol.address);
    
    // Get all contract addresses
    const addresses = await protocol.getContractAddresses();
    console.log("\n📋 Deployed Contract Addresses:");
    console.log("RestaurantRegistry:", addresses.restaurantRegistry);
    console.log("OrderSettlement:", addresses.orderSettlement);
    console.log("CurrencyExchange:", addresses.currencyExchange);
    console.log("DisputeResolution:", addresses.disputeResolution);
    console.log("FraudDetection:", addresses.fraudDetection);
    console.log("InvestorVault:", addresses.investorVault);
    console.log("SupplierCredit:", addresses.supplierCredit);
    console.log("USDC:", addresses.usdc);
    console.log("Fee Recipient:", addresses.feeRecipient);
    
    // Setup governance
    console.log("\n⚙️ Setting up governance...");
    await protocol.setGovernance(governance.address, true);
    console.log("Governance address added:", governance.address);
    
    // Deploy individual contracts for direct interaction if needed
    console.log("\n🏗️ Deploying individual contracts for direct interaction...");
    
    // RestaurantRegistry
    const RestaurantRegistry = await ethers.getContractFactory("RestaurantRegistry");
    const restaurantRegistry = await RestaurantRegistry.deploy();
    await restaurantRegistry.deployed();
    console.log("RestaurantRegistry deployed to:", restaurantRegistry.address);
    
    // OrderSettlement
    const OrderSettlement = await ethers.getContractFactory("OrderSettlement");
    const orderSettlement = await OrderSettlement.deploy(restaurantRegistry.address, usdc.address, feeRecipient.address);
    await orderSettlement.deployed();
    console.log("OrderSettlement deployed to:", orderSettlement.address);
    
    // CurrencyExchange
    const CurrencyExchange = await ethers.getContractFactory("CurrencyExchange");
    const currencyExchange = await CurrencyExchange.deploy();
    await currencyExchange.deployed();
    console.log("CurrencyExchange deployed to:", currencyExchange.address);
    
    // DisputeResolution
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy(orderSettlement.address, usdc.address);
    await disputeResolution.deployed();
    console.log("DisputeResolution deployed to:", disputeResolution.address);
    
    // FraudDetection
    const FraudDetection = await ethers.getContractFactory("FraudDetection");
    const fraudDetection = await FraudDetection.deploy();
    await fraudDetection.deployed();
    console.log("FraudDetection deployed to:", fraudDetection.address);
    
    // InvestorVault
    const InvestorVault = await ethers.getContractFactory("InvestorVault");
    const investorVault = await InvestorVault.deploy(usdc.address, orderSettlement.address, feeRecipient.address);
    await investorVault.deployed();
    console.log("InvestorVault deployed to:", investorVault.address);
    
    // SupplierCredit
    const SupplierCredit = await ethers.getContractFactory("SupplierCredit");
    const supplierCredit = await SupplierCredit.deploy(usdc.address);
    await supplierCredit.deployed();
    console.log("SupplierCredit deployed to:", supplierCredit.address);
    
    // Save deployment info
    const deploymentInfo = {
        protocol: protocol.address,
        usdc: usdc.address,
        restaurantRegistry: restaurantRegistry.address,
        orderSettlement: orderSettlement.address,
        currencyExchange: currencyExchange.address,
        disputeResolution: disputeResolution.address,
        fraudDetection: fraudDetection.address,
        investorVault: investorVault.address,
        supplierCredit: supplierCredit.address,
        feeRecipient: feeRecipient.address,
        governance: governance.address,
        deployer: deployer.address,
        network: "localhost",
        blockNumber: await ethers.provider.getBlockNumber()
    };
    
    console.log("\n💾 Saving deployment information...");
    const fs = require('fs');
    fs.writeFileSync('./deployment-localhost.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-localhost.json");
    
    console.log("\n✅ Deployment complete!");
    console.log("\nNext steps:");
    console.log("1. Mint test USDC tokens: await usdc.mint(deployer.address, ethers.utils.parseUnits('1000000', 6))");
    console.log("2. Register test restaurants");
    console.log("3. Run tests: npm test");
    console.log("4. Deploy to testnet: npm run deploy:mumbai");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
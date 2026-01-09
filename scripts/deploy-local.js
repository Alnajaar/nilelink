const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Starting local deployment of NileLink Protocol...\n");

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy USDC Mock
    console.log("\n📄 Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    console.log("✅ MockUSDC deployed to:", await mockUSDC.getAddress());

    // Deploy core components
    console.log("\n🏢 Deploying RestaurantRegistry...");
    const RestaurantRegistry = await ethers.getContractFactory("RestaurantRegistry");
    const restaurantRegistry = await RestaurantRegistry.deploy();
    await restaurantRegistry.waitForDeployment();
    console.log("✅ RestaurantRegistry deployed to:", await restaurantRegistry.getAddress());

    console.log("\n💰 Deploying OrderSettlement...");
    const OrderSettlement = await ethers.getContractFactory("OrderSettlement");
    const orderSettlement = await OrderSettlement.deploy(
        await restaurantRegistry.getAddress(),
        await mockUSDC.getAddress(),
        deployer.address // fee recipient
    );
    await orderSettlement.waitForDeployment();
    console.log("✅ OrderSettlement deployed to:", await orderSettlement.getAddress());

    console.log("\n💱 Deploying CurrencyExchange...");
    const CurrencyExchange = await ethers.getContractFactory("CurrencyExchange");
    const currencyExchange = await CurrencyExchange.deploy();
    await currencyExchange.waitForDeployment();
    console.log("✅ CurrencyExchange deployed to:", await currencyExchange.getAddress());

    console.log("\n⚖️ Deploying DisputeResolution...");
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy(
        await orderSettlement.getAddress(),
        await mockUSDC.getAddress()
    );
    await disputeResolution.waitForDeployment();
    console.log("✅ DisputeResolution deployed to:", await disputeResolution.getAddress());

    console.log("\n🛡️ Deploying FraudDetection...");
    const FraudDetection = await ethers.getContractFactory("FraudDetection");
    const fraudDetection = await FraudDetection.deploy();
    await fraudDetection.waitForDeployment();
    console.log("✅ FraudDetection deployed to:", await fraudDetection.getAddress());

    console.log("\n🏦 Deploying InvestorVault...");
    const InvestorVault = await ethers.getContractFactory("InvestorVault");
    const investorVault = await InvestorVault.deploy(
        await mockUSDC.getAddress(),
        await orderSettlement.getAddress(),
        deployer.address // fee recipient
    );
    await investorVault.waitForDeployment();
    console.log("✅ InvestorVault deployed to:", await investorVault.getAddress());

    console.log("\n💳 Deploying SupplierCredit...");
    const SupplierCredit = await ethers.getContractFactory("SupplierCredit");
    const supplierCredit = await SupplierCredit.deploy(await mockUSDC.getAddress());
    await supplierCredit.waitForDeployment();
    console.log("✅ SupplierCredit deployed to:", await supplierCredit.getAddress());

    console.log("\n🎯 Deploying NileLinkProtocol (main orchestrator)...");
    const NileLinkProtocol = await ethers.getContractFactory("NileLinkProtocol");
    const protocol = await NileLinkProtocol.deploy(
        await mockUSDC.getAddress(),
        deployer.address // fee recipient
    );
    await protocol.waitForDeployment();
    console.log("✅ NileLinkProtocol deployed to:", await protocol.getAddress());

    // Mint initial USDC supply
    console.log("\n💵 Minting initial USDC supply...");
    const mintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log("✅ Minted 1,000,000 USDC to deployer");

    // Set protocol fee (0.5%)
    console.log("\n⚙️ Configuring protocol fees...");
    await orderSettlement.setProtocolFee(50); // 50 basis points = 0.5%

    // Create deployment info
    const deploymentInfo = {
        network: "localhost",
        chainId: 1337,
        deployer: deployer.address,
        contracts: {
            mockUSDC: await mockUSDC.getAddress(),
            restaurantRegistry: await restaurantRegistry.getAddress(),
            orderSettlement: await orderSettlement.getAddress(),
            currencyExchange: await currencyExchange.getAddress(),
            disputeResolution: await disputeResolution.getAddress(),
            fraudDetection: await fraudDetection.getAddress(),
            investorVault: await investorVault.getAddress(),
            supplierCredit: await supplierCredit.getAddress(),
            nileLinkProtocol: await protocol.getAddress()
        },
        timestamp: new Date().toISOString()
    };

    // Save deployment info
    fs.writeFileSync('./deployment-local.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to deployment-local.json");

    console.log("\n🎉 LOCAL DEPLOYMENT COMPLETE!");
    console.log("==========================================");
    console.log("Network: localhost:8545 (chainId: 1337)");
    console.log("Main Protocol:", await protocol.getAddress());
    console.log("Mock USDC:", await mockUSDC.getAddress());
    console.log("==========================================");
    console.log("\n📝 Update your .env.local with:");
    console.log(`NEXT_PUBLIC_NILELINK_PROTOCOL=${await protocol.getAddress()}`);
    console.log(`NEXT_PUBLIC_USDC_ADDRESS=${await mockUSDC.getAddress()}`);
    console.log("\n🔄 Run: npm run dev (backend) and npm run dev (frontend)");
}

// Handle errors
main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
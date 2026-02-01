const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying NileLink Phase 2 On-Chain Contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Mock USDC for testing (if not on mainnet)
  console.log("\n📄 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Mint some USDC to deployer for testing
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("✅ Minted 1M USDC to deployer");

  // Deploy NileLinkLibs first (if needed)
  console.log("\n📄 Deploying NileLinkLibs...");
  const NileLinkLibs = await ethers.getContractFactory("NileLinkLibs");
  const nileLinkLibs = await NileLinkLibs.deploy();
  await nileLinkLibs.waitForDeployment();
  const libsAddress = await nileLinkLibs.getAddress();
  console.log("✅ NileLinkLibs deployed to:", libsAddress);

  // Deploy RestaurantRegistry
  console.log("\n🏪 Deploying RestaurantRegistry...");
  const RestaurantRegistry = await ethers.getContractFactory("RestaurantRegistry");
  const restaurantRegistry = await RestaurantRegistry.deploy();
  await restaurantRegistry.waitForDeployment();
  const registryAddress = await restaurantRegistry.getAddress();
  console.log("✅ RestaurantRegistry deployed to:", registryAddress);

  // Deploy FraudDetection
  console.log("\n🛡️ Deploying FraudDetection...");
  const FraudDetection = await ethers.getContractFactory("FraudDetection");
  const fraudDetection = await FraudDetection.deploy();
  await fraudDetection.waitForDeployment();
  const fraudAddress = await fraudDetection.getAddress();
  console.log("✅ FraudDetection deployed to:", fraudAddress);

  // Deploy Marketplace
  console.log("\n🛒 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    registryAddress,
    fraudAddress,
    usdcAddress,
    deployer.address // fee recipient
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // Deploy OrderSettlement
  console.log("\n💰 Deploying OrderSettlement...");
  const OrderSettlement = await ethers.getContractFactory("OrderSettlement");
  const orderSettlement = await OrderSettlement.deploy(
    registryAddress,
    usdcAddress,
    deployer.address // fee recipient
  );
  await orderSettlement.waitForDeployment();
  const settlementAddress = await orderSettlement.getAddress();
  console.log("✅ OrderSettlement deployed to:", settlementAddress);

  // Deploy other contracts as needed...

  console.log("\n🎉 Phase 2 Contracts Deployment Complete!");
  console.log("========================================");
  console.log("Contract Addresses:");
  console.log("MockUSDC:", usdcAddress);
  console.log("RestaurantRegistry:", registryAddress);
  console.log("FraudDetection:", fraudAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("OrderSettlement:", settlementAddress);

  // Save deployment addresses to a JSON file
  const deploymentData = {
    network: await ethers.provider.getNetwork().then(n => n.name),
    deployer: deployer.address,
    contracts: {
      MockUSDC: usdcAddress,
      RestaurantRegistry: registryAddress,
      FraudDetection: fraudAddress,
      Marketplace: marketplaceAddress,
      OrderSettlement: settlementAddress
    },
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-phase2.json', JSON.stringify(deploymentData, null, 2));
  console.log("📄 Deployment data saved to deployment-phase2.json");

  // Verify contracts on Etherscan (if on mainnet/testnet)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts on Etherscan...");

    try {
      await hre.run("verify:verify", {
        address: registryAddress,
        constructorArguments: [],
      });
      console.log("✅ RestaurantRegistry verified");

      await hre.run("verify:verify", {
        address: fraudAddress,
        constructorArguments: [],
      });
      console.log("✅ FraudDetection verified");

      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [registryAddress, fraudAddress, usdcAddress, deployer.address],
      });
      console.log("✅ Marketplace verified");

      await hre.run("verify:verify", {
        address: settlementAddress,
        constructorArguments: [registryAddress, usdcAddress, deployer.address],
      });
      console.log("✅ OrderSettlement verified");

    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  console.log("\n🎯 Phase 2 On-Chain Logic - DEPLOYMENT COMPLETE!");
  console.log("Next: Set up Subgraphs and test integrations");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
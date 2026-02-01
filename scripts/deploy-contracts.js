const hre = require("hardhat");

async function main() {
    console.log("Deploying SupplierCommission and POSAuthorization contracts...");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy SupplierCommission
    console.log("\n1. Deploying SupplierCommission...");
    const SupplierCommission = await hre.ethers.getContractFactory("SupplierCommission");
    const supplierCommission = await SupplierCommission.deploy();
    await supplierCommission.waitForDeployment();
    const commissionAddress = await supplierCommission.getAddress();
    console.log("✅ SupplierCommission deployed to:", commissionAddress);

    // Deploy POSAuthorization
    console.log("\n2. Deploying POSAuthorization...");
    const POSAuthorization = await hre.ethers.getContractFactory("POSAuthorization");
    const posAuthorization = await POSAuthorization.deploy();
    await posAuthorization.waitForDeployment();
    const authAddress = await posAuthorization.getAddress();
    console.log("✅ POSAuthorization deployed to:", authAddress);

    // Verify deployment
    console.log("\n📋 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("SupplierCommission:", commissionAddress);
    console.log("POSAuthorization:  ", authAddress);
    console.log("Deployer:           ", deployer.address);
    console.log("Network:            ", hre.network.name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            SupplierCommission: commissionAddress,
            POSAuthorization: authAddress,
        },
    };

    fs.writeFileSync(
        `./deployments/${hre.network.name}-deployment.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`\n💾 Deployment info saved to deployments/${hre.network.name}-deployment.json`);

    // Generate .env snippet
    console.log("\n📝 Add these to your .env.production:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`NEXT_PUBLIC_COMMISSION_CONTRACT=${commissionAddress}`);
    console.log(`NEXT_PUBLIC_POS_AUTH_CONTRACT=${authAddress}`);
    console.log(`NEXT_PUBLIC_CHAIN_ID=${deploymentInfo.chainId}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Wait for confirmations before verification
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
        console.log("\n⏳ Waiting for block confirmations...");
        await supplierCommission.deploymentTransaction().wait(6);
        await posAuthorization.deploymentTransaction().wait(6);

        // Verify on Etherscan
        console.log("\n🔍 Verifying contracts on Polygonscan...");
        try {
            await hre.run("verify:verify", {
                address: commissionAddress,
                constructorArguments: [],
            });
            console.log("✅ SupplierCommission verified");
        } catch (error) {
            console.log("⚠️  Verification failed:", error.message);
        }

        try {
            await hre.run("verify:verify", {
                address: authAddress,
                constructorArguments: [],
            });
            console.log("✅ POSAuthorization verified");
        } catch (error) {
            console.log("⚠️  Verification failed:", error.message);
        }
    }

    console.log("\n🎉 Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

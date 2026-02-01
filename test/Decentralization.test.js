const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NileLink Decentralization Verification", function () {
    let marketplace, reputation, settlement;
    let admin, restaurant, customer;

    before(async function () {
        [admin, restaurant, customer] = await ethers.getSigners();

        // Deploy core contracts (using existing logic)
        const Registry = await ethers.getContractFactory("RestaurantRegistry");
        marketplace = await Registry.deploy();
        // await marketplace.deployed(); // v5
        await marketplace.waitForDeployment(); // v6

        const Fraud = await ethers.getContractFactory("FraudDetection");
        reputation = await Fraud.deploy();
        // await reputation.deployed(); // v5
        await reputation.waitForDeployment(); // v6

        // Deploy mock USDC for settlement tests
        const MockUSDC = await ethers.getContractFactory("NileLinkLibs"); // Just a placeholder
        // In reality, we'd deploy a real ERC20 mock
    });

    describe("Marketplace (RestaurantRegistry) Evolution", function () {
        it("Should allow registering a restaurant with IPFS CIDs", async function () {
            const metadataCid = ethers.encodeBytes32String("QmMetadata...");
            const catalogCid = ethers.encodeBytes32String("QmCatalog...");

            const config = {
                ownerPhoneHash: ethers.id("123456789"),
                legalNameHash: ethers.id("Cairo Grill"),
                localNameHash: ethers.id("Cairo Grill Local"),
                metadataCid: metadataCid,
                catalogCid: catalogCid,
                country: ethers.encodeBytes32String("EG").slice(0, 6), // 0x + 4 hex chars = 2 bytes
                localCurrency: ethers.encodeBytes32String("EGP").slice(0, 8), // 0x + 6 hex chars = 3 bytes
                dailyRateLimitUsd6: 1000000000n,
                timezoneOffsetMinutes: 120,
                taxBps: 1400,
                chainlinkOracle: restaurant.address, // Mock address
                status: 0 // ACTIVE
            };

            await marketplace.registerRestaurant(restaurant.address, config);
            const record = await marketplace.getRestaurant(restaurant.address);

            expect(record.config.metadataCid).to.equal(metadataCid);
            expect(record.config.catalogCid).to.equal(catalogCid);
        });
    });

    describe("Reputation (FraudDetection) Evolution", function () {
        it("Should calculate a neutral reputation score (50) for new restaurants", async function () {
            const score = await reputation.getReputationScore(restaurant.address);
            expect(score).to.equal(50);
        });

        // Note: Further tests would simulate volume and refunds to check score changes
    });
});

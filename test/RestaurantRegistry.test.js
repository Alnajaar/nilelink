// test/RestaurantRegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RestaurantRegistry", function () {
    let restaurantRegistry;
    let owner;
    let governance;
    let restaurant;
    let customer;
    
    const COUNTRY_LB = "LB";
    const CURRENCY_LBP = "LBP";
    const DAILY_RATE_LIMIT = ethers.parseUnits("10000", 6); // $10,000
    const ORACLE_ADDRESS = "0x1234567890123456789012345678901234567890";
    
    beforeEach(async function () {
        [owner, governance, restaurant, customer] = await ethers.getSigners();
        
        const RestaurantRegistry = await ethers.getContractFactory("RestaurantRegistry");
        restaurantRegistry = await RestaurantRegistry.deploy();
        await restaurantRegistry.deployed();
        
        // Setup governance
        await restaurantRegistry.setGovernance(governance.address, true);
    });
    
    describe("Restaurant Registration", function () {
        it("Should register a restaurant successfully", async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000, // 10%
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0 // ACTIVE
            };
            
            await expect(restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config))
                .to.emit(restaurantRegistry, "RestaurantRegistered")
                .withArgs(restaurant.address, COUNTRY_LB, CURRENCY_LBP, DAILY_RATE_LIMIT, ORACLE_ADDRESS, expect.any(Number));
            
            const record = await restaurantRegistry.getRestaurant(restaurant.address);
            expect(record.restaurant).to.equal(restaurant.address);
            expect(record.config.country).to.equal(COUNTRY_LB);
            expect(record.config.localCurrency).to.equal(CURRENCY_LBP);
            expect(record.config.dailyRateLimitUsd6).to.equal(DAILY_RATE_LIMIT);
        });
        
        it("Should reject registration with invalid rate limit", async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: ethers.parseUnits("50", 6), // Below minimum
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await expect(restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config))
                .to.be.revertedWithCustomError(restaurantRegistry, "InvalidAmount");
        });
        
        it("Should reject duplicate registration", async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config);
            
            await expect(restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config))
                .to.be.revertedWithCustomError(restaurantRegistry, "AlreadyProcessed");
        });
    });
    
    describe("Restaurant Updates", function () {
        beforeEach(async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config);
        });
        
        it("Should update restaurant configuration", async function () {
            const newRateLimit = ethers.parseUnits("20000", 6);
            const newConfig = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name Updated")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name Updated")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: newRateLimit,
                timezoneOffsetMinutes: 120,
                taxBps: 1500, // 15%
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await restaurantRegistry.connect(restaurant).updateRestaurantConfig(restaurant.address, newConfig);
            
            const record = await restaurantRegistry.getRestaurant(restaurant.address);
            expect(record.config.dailyRateLimitUsd6).to.equal(newRateLimit);
            expect(record.config.taxBps).to.equal(1500);
        });
        
        it("Should update rate limit", async function () {
            const newRateLimit = ethers.parseUnits("25000", 6);
            
            await restaurantRegistry.connect(restaurant).setDailyRateLimit(restaurant.address, newRateLimit);
            
            expect(await restaurantRegistry.dailyUsdUsage(restaurant.address)).to.equal(0);
            
            const record = await restaurantRegistry.getRestaurant(restaurant.address);
            expect(record.config.dailyRateLimitUsd6).to.equal(newRateLimit);
        });
        
        it("Should suspend restaurant", async function () {
            await restaurantRegistry.connect(governance).suspendRestaurant(restaurant.address, "Violation of terms");
            
            const record = await restaurantRegistry.getRestaurant(restaurant.address);
            expect(record.config.status).to.equal(1); // SUSPENDED
        });
    });
    
    describe("Rate Limit Checking", function () {
        beforeEach(async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config);
        });
        
        it("Should allow transactions within rate limit", async function () {
            const amount = ethers.parseUnits("5000", 6); // $5,000
            
            const allowed = await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount);
            expect(allowed).to.be.true;
            
            expect(await restaurantRegistry.dailyUsdUsage(restaurant.address)).to.equal(amount);
        });
        
        it("Should reject transactions exceeding rate limit", async function () {
            const amount1 = ethers.parseUnits("7000", 6); // $7,000
            const amount2 = ethers.parseUnits("4000", 6); // $4,000 - would exceed limit
            
            // First transaction should succeed
            const allowed1 = await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount1);
            expect(allowed1).to.be.true;
            
            // Second transaction should fail
            const allowed2 = await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount2);
            expect(allowed2).to.be.false;
        });
    });
    
    describe("Restaurant Status Queries", function () {
        beforeEach(async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config);
        });
        
        it("Should return correct restaurant status", async function () {
            const [status, limit, balance, lastSettlement] = await restaurantRegistry.getRestaurantStatus(restaurant.address);
            
            expect(status).to.equal(0); // ACTIVE
            expect(limit).to.equal(DAILY_RATE_LIMIT);
            expect(balance).to.equal(0);
            expect(lastSettlement).to.be.gt(0);
        });
        
        it("Should return true for active restaurant", async function () {
            const isActive = await restaurantRegistry.isActive(restaurant.address);
            expect(isActive).to.be.true;
        });
        
        it("Should return false for non-existent restaurant", async function () {
            const isActive = await restaurantRegistry.isActive(customer.address);
            expect(isActive).to.be.false;
        });
    });
    
    describe("Governance", function () {
        it("Should add governance address", async function () {
            await restaurantRegistry.setGovernance(customer.address, true);
            expect(await restaurantRegistry.governance(customer.address)).to.be.true;
        });
        
        it("Should remove governance address", async function () {
            await restaurantRegistry.setGovernance(customer.address, true);
            await restaurantRegistry.setGovernance(customer.address, false);
            expect(await restaurantRegistry.governance(customer.address)).to.be.false;
        });
        
        it("Should set oracle for currency", async function () {
            await restaurantRegistry.setOracle(CURRENCY_LBP, ORACLE_ADDRESS);
            expect(await restaurantRegistry.getOracle(CURRENCY_LBP)).to.equal(ORACLE_ADDRESS);
        });
    });
    
    describe("Access Control", function () {
        it("Should reject registration from non-governance", async function () {
            const config = {
                ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
                legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Legal Name")),
                localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Local Name")),
                country: COUNTRY_LB,
                localCurrency: CURRENCY_LBP,
                dailyRateLimitUsd6: DAILY_RATE_LIMIT,
                timezoneOffsetMinutes: 120,
                taxBps: 1000,
                chainlinkOracle: ORACLE_ADDRESS,
                status: 0
            };
            
            await expect(restaurantRegistry.connect(customer).registerRestaurant(restaurant.address, config))
                .to.be.revertedWithCustomError(restaurantRegistry, "Unauthorized");
        });
        
        it("Should reject updates from non-owner", async function () {
            await expect(restaurantRegistry.connect(customer).setDailyRateLimit(restaurant.address, DAILY_RATE_LIMIT))
                .to.be.revertedWithCustomError(restaurantRegistry, "Unauthorized");
        });
    });
});
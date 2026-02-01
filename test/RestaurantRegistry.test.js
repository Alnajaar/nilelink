// test/RestaurantRegistry.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
require('@nomicfoundation/hardhat-chai-matchers');

const asFixedBytes = (s) => ethers.hexlify(ethers.toUtf8Bytes(s));

describe('RestaurantRegistry', function () {
  let restaurantRegistry;
  let owner;
  let governance;
  let restaurant;
  let customer;

  const COUNTRY_LB = asFixedBytes('LB'); // bytes2
  const CURRENCY_LBP = asFixedBytes('LBP'); // bytes3
  const DAILY_RATE_LIMIT = ethers.parseUnits('10000', 6); // $10,000
  const ORACLE_ADDRESS = '0x1234567890123456789012345678901234567890';

  beforeEach(async function () {
    [owner, governance, restaurant, customer] = await ethers.getSigners();

    const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
    restaurantRegistry = await RestaurantRegistry.deploy();
    await restaurantRegistry.waitForDeployment();

    // Setup governance
    await restaurantRegistry.setGovernance(governance.address, true);
  });

  const baseConfig = (overrides = {}) => ({
    ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes('+1234567890')),
    legalNameHash: ethers.keccak256(ethers.toUtf8Bytes('Legal Name')),
    localNameHash: ethers.keccak256(ethers.toUtf8Bytes('Local Name')),
    metadataCid: ethers.keccak256(ethers.toUtf8Bytes('QmDummyMetadataCID')),
    catalogCid: ethers.keccak256(ethers.toUtf8Bytes('QmDummyCatalogCID')),
    country: COUNTRY_LB,
    localCurrency: CURRENCY_LBP,
    dailyRateLimitUsd6: DAILY_RATE_LIMIT,
    timezoneOffsetMinutes: 120,
    taxBps: 1000,
    chainlinkOracle: ORACLE_ADDRESS,
    status: 0,
    ...overrides
  });

  describe('Restaurant Registration', function () {
    it('Should register a restaurant successfully', async function () {
      const config = baseConfig();

      await expect(
        restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config)
      )
        .to.emit(restaurantRegistry, 'RestaurantRegistered')
        .withArgs(
          restaurant.address,
          COUNTRY_LB,
          CURRENCY_LBP,
          config.metadataCid,
          config.catalogCid,
          DAILY_RATE_LIMIT,
          ORACLE_ADDRESS,
          anyValue
        );

      const record = await restaurantRegistry.getRestaurant(restaurant.address);
      expect(record.restaurant).to.equal(restaurant.address);
      expect(record.config.country).to.equal(COUNTRY_LB);
      expect(record.config.localCurrency).to.equal(CURRENCY_LBP);
      expect(record.config.dailyRateLimitUsd6).to.equal(DAILY_RATE_LIMIT);
    });

    it('Should reject registration with invalid rate limit', async function () {
      const config = baseConfig({ dailyRateLimitUsd6: ethers.parseUnits('50', 6) });

      await expect(
        restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config)
      ).to.be.revertedWithCustomError(restaurantRegistry, 'InvalidAmount');
    });

    it('Should reject duplicate registration', async function () {
      const config = baseConfig();

      await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config);

      await expect(
        restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, config)
      ).to.be.revertedWithCustomError(restaurantRegistry, 'AlreadyProcessed');
    });
  });

  describe('Restaurant Updates', function () {
    beforeEach(async function () {
      await restaurantRegistry
        .connect(governance)
        .registerRestaurant(restaurant.address, baseConfig());
    });

    it('Should update restaurant configuration', async function () {
      const newRateLimit = ethers.parseUnits('20000', 6);
      const newConfig = baseConfig({
        legalNameHash: ethers.keccak256(ethers.toUtf8Bytes('Legal Name Updated')),
        localNameHash: ethers.keccak256(ethers.toUtf8Bytes('Local Name Updated')),
        dailyRateLimitUsd6: newRateLimit,
        taxBps: 1500
      });

      await restaurantRegistry
        .connect(restaurant)
        .updateRestaurantConfig(restaurant.address, newConfig);

      const record = await restaurantRegistry.getRestaurant(restaurant.address);
      expect(record.config.dailyRateLimitUsd6).to.equal(newRateLimit);
      expect(record.config.taxBps).to.equal(1500n);
    });

    it('Should update rate limit', async function () {
      const newRateLimit = ethers.parseUnits('25000', 6);

      await restaurantRegistry
        .connect(restaurant)
        .setDailyRateLimit(restaurant.address, newRateLimit);

      expect(await restaurantRegistry.dailyUsdUsage(restaurant.address)).to.equal(0n);

      const record = await restaurantRegistry.getRestaurant(restaurant.address);
      expect(record.config.dailyRateLimitUsd6).to.equal(newRateLimit);
    });

    it('Should suspend restaurant', async function () {
      await restaurantRegistry
        .connect(governance)
        .suspendRestaurant(restaurant.address, 'Violation of terms');

      const record = await restaurantRegistry.getRestaurant(restaurant.address);
      expect(record.config.status).to.equal(1n); // SUSPENDED
    });
  });

  describe('Rate Limit Checking', function () {
    beforeEach(async function () {
      await restaurantRegistry
        .connect(governance)
        .registerRestaurant(restaurant.address, baseConfig());
    });

    it('Should allow transactions within rate limit', async function () {
      const amount = ethers.parseUnits('5000', 6); // $5,000

      // Call transaction
      await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount);
      // Can't check return value directly from tx. Check side effect.

      expect(await restaurantRegistry.dailyUsdUsage(restaurant.address)).to.equal(amount);
    });

    it('Should reject transactions exceeding rate limit', async function () {
      const amount1 = ethers.parseUnits('7000', 6); // $7,000
      const amount2 = ethers.parseUnits('4000', 6); // $4,000 - would exceed limit (assuming limit 10000)

      // First call (valid)
      await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount1);

      // Second call (should be rejected/false)
      // Since it returns false (not revert), we check logic: usage should NOT increase.
      await restaurantRegistry.checkAndUpdateRateLimit(restaurant.address, amount2);

      // Usage should still be 7000, not 11000
      expect(await restaurantRegistry.dailyUsdUsage(restaurant.address)).to.equal(amount1);
    });
  });

  describe('Restaurant Status Queries', function () {
    beforeEach(async function () {
      await restaurantRegistry
        .connect(governance)
        .registerRestaurant(restaurant.address, baseConfig());
    });

    it('Should return correct restaurant status', async function () {
      const [status, limit, balance, lastSettlement] =
        await restaurantRegistry.getRestaurantStatus(restaurant.address);

      expect(status).to.equal(0n); // ACTIVE
      expect(limit).to.equal(DAILY_RATE_LIMIT);
      expect(balance).to.equal(0n);
      expect(Number(lastSettlement)).to.be.gt(0);
    });

    it('Should return true for active restaurant', async function () {
      const isActive = await restaurantRegistry.isActive(restaurant.address);
      expect(isActive).to.be.true;
    });

    it('Should return false for non-existent restaurant', async function () {
      const isActive = await restaurantRegistry.isActive(customer.address);
      expect(isActive).to.be.false;
    });
  });

  describe('Governance', function () {
    it('Should add governance address', async function () {
      await restaurantRegistry.setGovernance(customer.address, true);
      expect(await restaurantRegistry.governance(customer.address)).to.be.true;
    });

    it('Should remove governance address', async function () {
      await restaurantRegistry.setGovernance(customer.address, true);
      await restaurantRegistry.setGovernance(customer.address, false);
      expect(await restaurantRegistry.governance(customer.address)).to.be.false;
    });

    it('Should set oracle for currency', async function () {
      await restaurantRegistry.setOracle(CURRENCY_LBP, ORACLE_ADDRESS);
      expect(await restaurantRegistry.getOracle(CURRENCY_LBP)).to.equal(ORACLE_ADDRESS);
    });
  });

  describe('Access Control', function () {
    it('Should reject registration from non-governance', async function () {
      const config = baseConfig();

      await expect(
        restaurantRegistry.connect(customer).registerRestaurant(restaurant.address, config)
      ).to.be.revertedWithCustomError(restaurantRegistry, 'Unauthorized');
    });

    it('Should reject updates from non-owner', async function () {
      await expect(
        restaurantRegistry.connect(customer).setDailyRateLimit(restaurant.address, DAILY_RATE_LIMIT)
      ).to.be.revertedWithCustomError(restaurantRegistry, 'Unauthorized');
    });
  });
});

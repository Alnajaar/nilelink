
// test/CurrencyExchange.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
require('@nomicfoundation/hardhat-chai-matchers');

const asFixedBytes = (s) => ethers.hexlify(ethers.toUtf8Bytes(s));

describe('CurrencyExchange', function () {
    let currencyExchange;
    let owner;
    let oracle;
    let otherAccount;
    let mockV3Aggregator;

    const CURRENCY_LBP = asFixedBytes('LBP');

    beforeEach(async function () {
        [owner, oracle, otherAccount] = await ethers.getSigners();

        // Deploy MockV3Aggregator
        const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
        // Let's use 15,000 LBP/USD rate. Scaled by 1e8 = 1,500,000,000,000.
        const initialRate = 15000n * 10n ** 8n;
        mockV3Aggregator = await MockV3Aggregator.deploy(8, initialRate);

        await mockV3Aggregator.waitForDeployment();

        await mockV3Aggregator.waitForDeployment();

        const CurrencyExchange = await ethers.getContractFactory('CurrencyExchange');
        currencyExchange = await CurrencyExchange.deploy();
        await currencyExchange.waitForDeployment();
    });

    describe('Oracle Management', function () {
        it('Should allow owner to set oracle', async function () {
            await expect(currencyExchange.setOracle(CURRENCY_LBP, await mockV3Aggregator.getAddress()))
                .to.emit(currencyExchange, 'OracleUpdated');

            expect(await currencyExchange.getOracle(CURRENCY_LBP)).to.equal(await mockV3Aggregator.getAddress());
        });

        it('Should allow owner to authorize oracle address', async function () {
            await currencyExchange.setAuthorizedOracle(oracle.address, true);
            expect(await currencyExchange.authorizedOracles(oracle.address)).to.be.true;
        });
    });

    describe('Rate Updates', function () {
        beforeEach(async function () {
            await currencyExchange.setOracle(CURRENCY_LBP, await mockV3Aggregator.getAddress());
            await currencyExchange.setAuthorizedOracle(oracle.address, true);
        });

        it('Should update rate from authorized oracle', async function () {
            const newRate = 89000n * 10n ** 8n; // 89,000 LBP/USD
            await expect(currencyExchange.connect(oracle).updateRate(CURRENCY_LBP, newRate))
                .to.emit(currencyExchange, 'RateUpdated')
                .withArgs(CURRENCY_LBP, 0n, newRate, oracle.address, anyValue); // oldRate is 0 initially

            const latest = await currencyExchange.getLatestRate(CURRENCY_LBP);
            expect(latest.rate).to.equal(newRate);
        });

        it('Should flag anomaly if rate is out of bounds', async function () {
            // Upper bound for LBP is 200,000. Let's try 300,000.
            const badRate = 300000n * 10n ** 8n;

            await expect(currencyExchange.connect(oracle).updateRate(CURRENCY_LBP, badRate))
                .to.emit(currencyExchange, 'RateOutOfBounds')
                .to.emit(currencyExchange, 'AnomalyFlagged');

            // It still updates though
            const latest = await currencyExchange.getLatestRate(CURRENCY_LBP);
            expect(latest.rate).to.equal(badRate);
        });
    });
});

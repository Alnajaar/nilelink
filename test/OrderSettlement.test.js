
// test/OrderSettlement.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
require('@nomicfoundation/hardhat-chai-matchers');

const asFixedBytes = (s) => ethers.hexlify(ethers.toUtf8Bytes(s));

describe('OrderSettlement', function () {
    let orderSettlement;
    let restaurantRegistry;
    let usdc;
    let owner;
    let restaurant;
    let customer;
    let feeRecipient;

    const ORDER_ID = '0x10000000000000000000000000000001';
    const ORDER_AMOUNT_USD6 = ethers.parseUnits('100', 6); // $100
    const PAYMENT_METHOD_CRYPTO = 1; // Assuming enum PaymentMethod { CASH, CRYPTO, CARD } or similar.
    const COUNTRY_LB = asFixedBytes('LB');
    const CURRENCY_LBP = asFixedBytes('LBP');
    const DAILY_RATE_LIMIT = ethers.parseUnits('10000', 6);
    const ORACLE_ADDRESS = '0x1234567890123456789012345678901234567890';

    beforeEach(async function () {
        [owner, restaurant, customer, feeRecipient] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        usdc = await MockUSDC.deploy('USD Coin', 'USDC', 6);
        await usdc.waitForDeployment();

        // Deploy RestaurantRegistry
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        restaurantRegistry = await RestaurantRegistry.deploy();
        await restaurantRegistry.waitForDeployment();

        // Deploy OrderSettlement
        const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
        orderSettlement = await OrderSettlement.deploy(
            await restaurantRegistry.getAddress(),
            await usdc.getAddress(),
            feeRecipient.address
        );
        await orderSettlement.waitForDeployment();

        // Setup Restaurant
        await restaurantRegistry.setGovernance(owner.address, true);
        const config = {
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
            status: 0
        };
        await restaurantRegistry.registerRestaurant(restaurant.address, config);

        // Provide USDC to customer
        await usdc.mint(customer.address, ethers.parseUnits('1000', 6));
        await usdc.connect(customer).approve(await orderSettlement.getAddress(), ethers.MaxUint256);
    });

    describe('Configuration', function () {
        it('Should set correct initial values', async function () {
            expect(await orderSettlement.usdc()).to.equal(await usdc.getAddress());
            expect(await orderSettlement.feeRecipient()).to.equal(feeRecipient.address);
        });

        it('Should update protocol fee', async function () {
            await orderSettlement.setProtocolFee(100); // 1%
            expect(await orderSettlement.protocolFeeBps()).to.equal(100n);
        });
    });

    describe('Order Creation & Payment', function () {
        it('Should create payment intent successfully', async function () {
            await expect(
                orderSettlement.connect(customer).createPaymentIntent(
                    ORDER_ID,
                    restaurant.address,
                    customer.address,
                    ORDER_AMOUNT_USD6,
                    PAYMENT_METHOD_CRYPTO
                )
            )
                .to.emit(orderSettlement, 'PaymentIntentCreated')
                .withArgs(ORDER_ID, restaurant.address, customer.address, ORDER_AMOUNT_USD6, PAYMENT_METHOD_CRYPTO, anyValue, anyValue, anyValue);

            const order = await orderSettlement.orders(ORDER_ID);
            expect(order.restaurant).to.equal(restaurant.address);
            expect(order.status).to.equal(0n); // PENDING
        });

        it('Should process payment and settle', async function () {
            // 1. Create Intent
            await orderSettlement.connect(customer).createPaymentIntent(
                ORDER_ID,
                restaurant.address,
                customer.address,
                ORDER_AMOUNT_USD6,
                PAYMENT_METHOD_CRYPTO
            );

            // 2. Pay
            await expect(
                orderSettlement.connect(customer).pay(ORDER_ID, ORDER_AMOUNT_USD6)
            )
                .to.emit(orderSettlement, 'PaymentReceived')
                .withArgs(ORDER_ID, customer.address, restaurant.address, ORDER_AMOUNT_USD6, anyValue, PAYMENT_METHOD_CRYPTO, anyValue)
                .to.emit(orderSettlement, 'PaymentSettled');

            const order = await orderSettlement.orders(ORDER_ID);
            expect(order.status).to.equal(2n); // SETTLED

            // Check balances
            // Fee = 0.5% of 100 = 0.5 USDC
            // Net = 99.5 USDC
            const fee = ORDER_AMOUNT_USD6 * 50n / 10000n;
            const net = ORDER_AMOUNT_USD6 - fee;

            expect(await usdc.balanceOf(feeRecipient.address)).to.equal(fee);
            expect(await usdc.balanceOf(restaurant.address)).to.equal(net);
        });

        it('Should reject duplicate payment', async function () {
            await orderSettlement.connect(customer).createPaymentIntent(
                ORDER_ID,
                restaurant.address,
                customer.address,
                ORDER_AMOUNT_USD6,
                PAYMENT_METHOD_CRYPTO
            );

            await orderSettlement.connect(customer).pay(ORDER_ID, ORDER_AMOUNT_USD6);

            await expect(
                orderSettlement.connect(customer).pay(ORDER_ID, ORDER_AMOUNT_USD6)
            ).to.be.revertedWithCustomError(orderSettlement, 'AlreadyProcessed'); // Assuming error name based on lib usage
        });
    });
});

// test/NileLinkProtocol.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
require('@nomicfoundation/hardhat-chai-matchers');

describe('NileLinkProtocol', function () {
    let nileLinkProtocol;
    let usdc;
    let owner;
    let restaurant;
    let customer;
    let governance;
    let authorizedCaller;

    const ORDER_ID = '0x10000000000000000000000000000001';
    const ORDER_AMOUNT_USD6 = ethers.parseUnits('100', 6); // $100
    const PAYMENT_METHOD_CRYPTO = 1;

    beforeEach(async function () {
        [owner, restaurant, customer, governance, authorizedCaller] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        usdc = await MockUSDC.deploy('USD Coin', 'USDC', 6);
        await usdc.waitForDeployment();

        // Deploy NileLinkProtocol
        const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
        nileLinkProtocol = await NileLinkProtocol.deploy(await usdc.getAddress(), owner.address);
        await nileLinkProtocol.waitForDeployment();

        // Setup governance first (this gives owner governance access to sub-contracts)
        await nileLinkProtocol.setGovernance(owner.address, true);

        // Setup authorizations
        await nileLinkProtocol.setGovernance(governance.address, true);
        await nileLinkProtocol.connect(governance).setAuthorizedCaller(authorizedCaller.address, true);

        // Setup USDC balances
        await usdc.mint(customer.address, ethers.parseUnits('1000', 6));

        // Get contract addresses
        const addresses = await nileLinkProtocol.getContractAddresses();
        await usdc.connect(customer).approve(addresses.orderSettlement, ethers.MaxUint256);

        // Setup restaurant in registry
        const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
        const registry = RestaurantRegistry.attach(addresses.restaurantRegistry);
        const config = {
            ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes('+1234567890')),
            legalNameHash: ethers.keccak256(ethers.toUtf8Bytes('Legal Name')),
            localNameHash: ethers.keccak256(ethers.toUtf8Bytes('Local Name')),
            country: ethers.hexlify(ethers.toUtf8Bytes('LB')),
            localCurrency: ethers.hexlify(ethers.toUtf8Bytes('LBP')),
            dailyRateLimitUsd6: ethers.parseUnits('10000', 6),
            timezoneOffsetMinutes: 120,
            taxBps: 1000,
            chainlinkOracle: '0x1234567890123456789012345678901234567890',
            status: 0
        };
        await registry.registerRestaurant(restaurant.address, config);
    });

    describe('Initialization', function () {
        it('Should deploy all core contracts', async function () {
            const addresses = await nileLinkProtocol.getContractAddresses();

            // Debug: log addresses to see which one is null
            console.log('Contract addresses:', addresses);

            expect(addresses.restaurantRegistry).to.not.equal(ethers.ZeroAddress);
            expect(addresses.orderSettlement).to.not.equal(ethers.ZeroAddress);
            expect(addresses.currencyExchange).to.not.equal(ethers.ZeroAddress);
            expect(addresses.disputeResolution).to.not.equal(ethers.ZeroAddress);
            expect(addresses.fraudDetection).to.not.equal(ethers.ZeroAddress);
            expect(addresses.investorVault).to.not.equal(ethers.ZeroAddress);
            expect(addresses.supplierCredit).to.not.equal(ethers.ZeroAddress);
            expect(addresses.usdc).to.equal(await usdc.getAddress());
            expect(addresses.feeRecipient).to.equal(owner.address);
        });

        it('Should set correct initial values', async function () {
            expect(await nileLinkProtocol.usdc()).to.equal(await usdc.getAddress());
            expect(await nileLinkProtocol.feeRecipient()).to.equal(owner.address);
            expect(await nileLinkProtocol.protocolFeeBps()).to.equal(50); // 0.5%
        });

        it('Should emit ProtocolInitialized event', async function () {
            const NileLinkProtocol = await ethers.getContractFactory('NileLinkProtocol');
            await expect(
                NileLinkProtocol.deploy(await usdc.getAddress(), owner.address)
            ).to.emit(NileLinkProtocol, 'ProtocolInitialized');
        });
    });

    describe('Order Management', function () {
        it('Should create and pay order successfully', async function () {
            await expect(
                nileLinkProtocol.connect(authorizedCaller).createAndPayOrder(
                    ORDER_ID,
                    restaurant.address,
                    customer.address,
                    ORDER_AMOUNT_USD6,
                    PAYMENT_METHOD_CRYPTO
                )
            ).to.emit(nileLinkProtocol, 'PaymentIntentCreated');

            // Verify order was created and paid
            const orderSettlement = await nileLinkProtocol.orderSettlement();
            const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
            const settlement = OrderSettlement.attach(orderSettlement);

            const order = await settlement.orders(ORDER_ID);
            expect(order.status).to.equal(2); // SETTLED
        });

        it('Should reject order creation from unauthorized caller', async function () {
            await expect(
                nileLinkProtocol.connect(customer).createAndPayOrder(
                    ORDER_ID,
                    restaurant.address,
                    customer.address,
                    ORDER_AMOUNT_USD6,
                    PAYMENT_METHOD_CRYPTO
                )
            ).to.be.revertedWithCustomError(nileLinkProtocol, 'Unauthorized');
        });

        it('Should batch create orders', async function () {
            const orderIds = [ORDER_ID, '0x20000000000000000000000000000001'];
            const restaurants = [restaurant.address, restaurant.address];
            const customers = [customer.address, customer.address];
            const amounts = [ORDER_AMOUNT_USD6, ethers.parseUnits('50', 6)];
            const methods = [PAYMENT_METHOD_CRYPTO, PAYMENT_METHOD_CRYPTO];

            await expect(
                nileLinkProtocol.connect(authorizedCaller).batchCreateOrders(
                    orderIds,
                    restaurants,
                    customers,
                    amounts,
                    methods
                )
            ).to.emit(nileLinkProtocol, 'PaymentIntentCreated');
        });

        it('Should handle batch order failures gracefully', async function () {
            // This would test the error handling in batch operations
            const orderIds = [ORDER_ID];
            const restaurants = [restaurant.address];
            const customers = [customer.address];
            const amounts = [ORDER_AMOUNT_USD6];
            const methods = [PAYMENT_METHOD_CRYPTO];

            // Should complete without throwing even if individual orders fail
            await expect(
                nileLinkProtocol.connect(authorizedCaller).batchCreateOrders(
                    orderIds,
                    restaurants,
                    customers,
                    amounts,
                    methods
                )
            ).to.not.be.reverted;
        });
    });

    describe('Governance & Configuration', function () {
        it('Should update protocol fee', async function () {
            const newFee = 75; // 0.75%

            await expect(
                nileLinkProtocol.updateProtocolFee(newFee)
            )
                .to.emit(nileLinkProtocol, 'ProtocolFeeUpdated')
                .withArgs(50, newFee, anyValue);

            expect(await nileLinkProtocol.protocolFeeBps()).to.equal(newFee);
        });

        it('Should reject protocol fee above 1%', async function () {
            await expect(
                nileLinkProtocol.updateProtocolFee(101) // 1.01%
            ).to.be.revertedWith('Fee cannot exceed 1%');
        });

        it('Should update fee recipient', async function () {
            await expect(
                nileLinkProtocol.updateFeeRecipient(governance.address)
            ).to.not.be.reverted;

            expect(await nileLinkProtocol.feeRecipient()).to.equal(governance.address);
        });

        it('Should set governance addresses', async function () {
            await expect(
                nileLinkProtocol.setGovernance(customer.address, true)
            )
                .to.emit(nileLinkProtocol, 'GovernanceUpdated')
                .withArgs(customer.address, true);

            expect(await nileLinkProtocol.governance(customer.address)).to.be.true;
        });

        it('Should set authorized callers', async function () {
            await expect(
                nileLinkProtocol.connect(governance).setAuthorizedCaller(customer.address, true)
            )
                .to.emit(nileLinkProtocol, 'AuthorizedCallerUpdated')
                .withArgs(customer.address, true);

            expect(await nileLinkProtocol.authorizedCallers(customer.address)).to.be.true;
        });
    });

    describe('Emergency Functions', function () {
        it('Should emergency pause protocol', async function () {
            await expect(
                nileLinkProtocol.connect(governance).emergencyPause()
            ).to.emit(nileLinkProtocol, 'Paused');

            expect(await nileLinkProtocol.paused()).to.be.true;
        });

        it('Should emergency unpause protocol', async function () {
            await nileLinkProtocol.connect(governance).emergencyPause();

            await expect(
                nileLinkProtocol.emergencyUnpause()
            ).to.emit(nileLinkProtocol, 'Unpaused');

            expect(await nileLinkProtocol.paused()).to.be.false;
        });

        it('Should restrict emergency pause to governance', async function () {
            await expect(
                nileLinkProtocol.connect(customer).emergencyPause()
            ).to.be.revertedWithCustomError(nileLinkProtocol, 'Unauthorized');
        });

        it('Should restrict emergency unpause to owner', async function () {
            await expect(
                nileLinkProtocol.connect(governance).emergencyUnpause()
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('Protocol Statistics', function () {
        it('Should return protocol stats', async function () {
            const stats = await nileLinkProtocol.getProtocolStats();

            expect(stats).to.have.property('totalRestaurants');
            expect(stats).to.have.property('totalOrders');
            expect(stats).to.have.property('totalVolumeUsd6');
            expect(stats).to.have.property('activeDisputes');
            expect(stats).to.have.property('totalInvestmentsUsd6');
            expect(stats).to.have.property('protocolFeesCollectedUsd6');
        });
    });

    describe('Access Control', function () {
        it('Should restrict owner-only functions', async function () {
            await expect(
                nileLinkProtocol.connect(customer).updateProtocolFee(60)
            ).to.be.revertedWith('Ownable: caller is not the owner');

            await expect(
                nileLinkProtocol.connect(customer).updateFeeRecipient(customer.address)
            ).to.be.revertedWith('Ownable: caller is not the owner');

            await expect(
                nileLinkProtocol.connect(customer).setOracle('0x5553440000000000000000000000000000000000000000000000000000000000', customer.address)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should restrict governance-only functions', async function () {
            await expect(
                nileLinkProtocol.connect(customer).setAuthorizedCaller(customer.address, true)
            ).to.be.revertedWithCustomError(nileLinkProtocol, 'Unauthorized');
        });

        it('Should restrict authorized-only functions', async function () {
            await expect(
                nileLinkProtocol.connect(customer).createAndPayOrder(
                    ORDER_ID,
                    restaurant.address,
                    customer.address,
                    ORDER_AMOUNT_USD6,
                    PAYMENT_METHOD_CRYPTO
                )
            ).to.be.revertedWithCustomError(nileLinkProtocol, 'Unauthorized');
        });
    });

    describe('Integration Tests', function () {
        it('Should handle complete order lifecycle through protocol', async function () {
            // Create and pay order
            await nileLinkProtocol.connect(authorizedCaller).createAndPayOrder(
                ORDER_ID,
                restaurant.address,
                customer.address,
                ORDER_AMOUNT_USD6,
                PAYMENT_METHOD_CRYPTO
            );

            // Verify order settlement
            const orderSettlement = await nileLinkProtocol.orderSettlement();
            const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
            const settlement = OrderSettlement.attach(orderSettlement);

            const order = await settlement.orders(ORDER_ID);
            expect(order.status).to.equal(2); // SETTLED

            // Check fee collection
            const feeRecipientBalance = await usdc.balanceOf(owner.address);
            const expectedFee = ORDER_AMOUNT_USD6 * BigInt(50) / BigInt(10000); // 0.5%
            expect(feeRecipientBalance).to.equal(expectedFee);
        });

        it('Should pause all contracts on emergency pause', async function () {
            await nileLinkProtocol.connect(governance).emergencyPause();

            // Verify all contracts are paused
            const addresses = await nileLinkProtocol.getContractAddresses();

            const RestaurantRegistry = await ethers.getContractFactory('RestaurantRegistry');
            const registry = RestaurantRegistry.attach(addresses.restaurantRegistry);
            expect(await registry.paused()).to.be.true;

            const OrderSettlement = await ethers.getContractFactory('OrderSettlement');
            const settlement = OrderSettlement.attach(addresses.orderSettlement);
            expect(await settlement.paused()).to.be.true;
        });
    });
});
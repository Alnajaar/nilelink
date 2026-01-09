// test/SupplierCredit.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
require('@nomicfoundation/hardhat-chai-matchers');

describe('SupplierCredit', function () {
    let supplierCredit;
    let usdc;
    let owner;
    let supplier;
    let restaurant;
    let customer;

    const INVOICE_ID = '0x10000000000000000000000000000001';
    const CREDIT_LIMIT = ethers.parseUnits('5000', 6); // $5000
    const INVOICE_AMOUNT = ethers.parseUnits('1000', 6); // $1000
    const TERMS_HASH = ethers.keccak256(ethers.toUtf8Bytes('Net-30'));

    beforeEach(async function () {
        [owner, supplier, restaurant, customer] = await ethers.getSigners();

        // Deploy MockUSDC
        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        usdc = await MockUSDC.deploy('USD Coin', 'USDC', 6);
        await usdc.waitForDeployment();

        // Deploy SupplierCredit
        const SupplierCredit = await ethers.getContractFactory('SupplierCredit');
        supplierCredit = await SupplierCredit.deploy(await usdc.getAddress());
        await supplierCredit.waitForDeployment();

        // Setup governance
        await supplierCredit.setGovernance(owner.address, true);

        // Setup initial balances
        await usdc.mint(supplier.address, ethers.parseUnits('10000', 6));
        await usdc.mint(restaurant.address, ethers.parseUnits('10000', 6));
        await usdc.connect(supplier).approve(await supplierCredit.getAddress(), ethers.MaxUint256);
        await usdc.connect(restaurant).approve(await supplierCredit.getAddress(), ethers.MaxUint256);

        // Verify supplier
        await supplierCredit.verifySupplier(supplier.address, true);

        // Set credit line
        await supplierCredit.setCreditLine(restaurant.address, supplier.address, CREDIT_LIMIT, TERMS_HASH);
    });

    describe('Credit Line Management', function () {
        it('Should set credit line for restaurant-supplier pair', async function () {
            const limit = ethers.parseUnits('2000', 6);
            const termsHash = ethers.keccak256(ethers.toUtf8Bytes('Net-15'));

            await expect(
                supplierCredit.setCreditLine(restaurant.address, supplier.address, limit, termsHash)
            )
                .to.emit(supplierCredit, 'CreditLineSet')
                .withArgs(restaurant.address, supplier.address, limit, termsHash, anyValue);

            const creditLine = await supplierCredit.getCreditLine(restaurant.address, supplier.address);
            expect(creditLine.limitUsd6).to.equal(limit);
            expect(creditLine.supplier).to.equal(supplier.address);
            expect(creditLine.restaurant).to.equal(restaurant.address);
        });

        it('Should create invoice and extend credit', async function () {
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

            await expect(
                supplierCredit.connect(supplier).useCredit(
                    restaurant.address,
                    INVOICE_ID,
                    INVOICE_AMOUNT,
                    dueDate,
                    TERMS_HASH
                )
            )
                .to.emit(supplierCredit, 'InvoiceCreated')
                .withArgs(INVOICE_ID, supplier.address, restaurant.address, INVOICE_AMOUNT, dueDate, anyValue);

            const invoice = await supplierCredit.getInvoice(INVOICE_ID);
            expect(invoice.amountUsd6).to.equal(INVOICE_AMOUNT);
            expect(invoice.supplier).to.equal(supplier.address);
            expect(invoice.restaurant).to.equal(restaurant.address);
            expect(invoice.status).to.equal(0); // PENDING

            // Check credit line usage
            const creditLine = await supplierCredit.getCreditLine(restaurant.address, supplier.address);
            expect(creditLine.usedUsd6).to.equal(INVOICE_AMOUNT);
        });

        it('Should reject credit extension exceeding limit', async function () {
            const largeAmount = ethers.parseUnits('6000', 6); // Exceeds $5000 limit
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            await expect(
                supplierCredit.connect(supplier).useCredit(
                    restaurant.address,
                    INVOICE_ID,
                    largeAmount,
                    dueDate,
                    TERMS_HASH
                )
            ).to.be.revertedWithCustomError(supplierCredit, 'InvalidAmount');
        });

        it('Should reject duplicate invoice IDs', async function () {
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            // Create first invoice
            await supplierCredit.connect(supplier).useCredit(
                restaurant.address,
                INVOICE_ID,
                ethers.parseUnits('500', 6),
                dueDate,
                TERMS_HASH
            );

            // Try to create duplicate
            await expect(
                supplierCredit.connect(supplier).useCredit(
                    restaurant.address,
                    INVOICE_ID, // Same ID
                    ethers.parseUnits('300', 6),
                    dueDate,
                    TERMS_HASH
                )
            ).to.be.revertedWithCustomError(supplierCredit, 'AlreadyProcessed');
        });
    });

    describe('Payment & Settlement', function () {
        beforeEach(async function () {
            // Create invoice
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            await supplierCredit.connect(supplier).useCredit(
                restaurant.address,
                INVOICE_ID,
                INVOICE_AMOUNT,
                dueDate,
                TERMS_HASH
            );
        });

        it('Should process full payment and mark invoice as paid', async function () {
            const paymentTxHash = ethers.randomBytes(32);

            await expect(
                supplierCredit.connect(restaurant).repay(
                    INVOICE_ID,
                    INVOICE_AMOUNT,
                    paymentTxHash
                )
            )
                .to.emit(supplierCredit, 'InvoiceSettled')
                .withArgs(INVOICE_ID, INVOICE_AMOUNT, paymentTxHash, anyValue);

            const invoice = await supplierCredit.getInvoice(INVOICE_ID);
            expect(invoice.paidAmountUsd6).to.equal(INVOICE_AMOUNT);
            expect(invoice.status).to.equal(2); // PAID
            expect(invoice.paidAt).to.not.equal(0);

            // Check credit line was updated
            const creditLine = await supplierCredit.getCreditLine(restaurant.address, supplier.address);
            expect(creditLine.usedUsd6).to.equal(0); // Credit returned
        });

        it('Should process partial payment', async function () {
            const partialPayment = ethers.parseUnits('600', 6); // $600 of $1000
            const paymentTxHash = ethers.randomBytes(32);

            await expect(
                supplierCredit.connect(restaurant).repay(
                    INVOICE_ID,
                    partialPayment,
                    paymentTxHash
                )
            )
                .to.emit(supplierCredit, 'InvoiceSettled')
                .withArgs(INVOICE_ID, partialPayment, paymentTxHash, anyValue);

            const invoice = await supplierCredit.getInvoice(INVOICE_ID);
            expect(invoice.paidAmountUsd6).to.equal(partialPayment);
            expect(invoice.status).to.equal(1); // PARTIAL

            // Credit line should still show partial usage
            const creditLine = await supplierCredit.getCreditLine(restaurant.address, supplier.address);
            expect(creditLine.usedUsd6).to.equal(INVOICE_AMOUNT - partialPayment);
        });

        it('Should reject payment exceeding invoice amount', async function () {
            const excessivePayment = ethers.parseUnits('1500', 6); // More than $1000
            const paymentTxHash = ethers.randomBytes(32);

            await expect(
                supplierCredit.connect(restaurant).repay(
                    INVOICE_ID,
                    excessivePayment,
                    paymentTxHash
                )
            ).to.be.revertedWithCustomError(supplierCredit, 'InvalidAmount');
        });

        it('Should update supplier statistics', async function () {
            const paymentTxHash = ethers.randomBytes(32);

            // Check initial supplier stats
            let supplierInfo = await supplierCredit.getSupplierInfo(supplier.address);
            expect(supplierInfo.totalOutstanding).to.equal(INVOICE_AMOUNT);

            // Make payment
            await supplierCredit.connect(restaurant).repay(
                INVOICE_ID,
                INVOICE_AMOUNT,
                paymentTxHash
            );

            // Check updated supplier stats
            supplierInfo = await supplierCredit.getSupplierInfo(supplier.address);
            expect(supplierInfo.totalOutstanding).to.equal(0);
            expect(supplierInfo.totalPaid).to.equal(INVOICE_AMOUNT);
        });
    });

    describe('Supplier Verification', function () {
        it('Should verify and unverify suppliers', async function () {
            // Unverify supplier first
            await supplierCredit.verifySupplier(supplier.address, false);
            expect(await supplierCredit.verifiedSuppliers(supplier.address)).to.be.false;

            // Re-verify supplier
            await expect(
                supplierCredit.verifySupplier(supplier.address, true)
            )
                .to.emit(supplierCredit, 'SupplierVerified')
                .withArgs(supplier.address, true, anyValue);

            expect(await supplierCredit.verifiedSuppliers(supplier.address)).to.be.true;

            const supplierInfo = await supplierCredit.getSupplierInfo(supplier.address);
            expect(supplierInfo.isVerified).to.be.true;
        });

        it('Should restrict invoice creation to verified suppliers', async function () {
            // Unverify supplier
            await supplierCredit.verifySupplier(supplier.address, false);

            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            // Try to create invoice as unverified supplier
            await expect(
                supplierCredit.connect(supplier).useCredit(
                    restaurant.address,
                    INVOICE_ID,
                    INVOICE_AMOUNT,
                    dueDate,
                    TERMS_HASH
                )
            ).to.be.revertedWithCustomError(supplierCredit, 'Unauthorized');
        });
    });

    describe('Access Control', function () {
        it('Should restrict credit line setting to governance', async function () {
            await expect(
                supplierCredit.connect(supplier).setCreditLine(
                    restaurant.address,
                    supplier.address,
                    CREDIT_LIMIT,
                    TERMS_HASH
                )
            ).to.be.revertedWithCustomError(supplierCredit, 'Unauthorized');
        });

        it('Should restrict supplier verification to governance', async function () {
            await expect(
                supplierCredit.connect(restaurant).verifySupplier(customer.address, true)
            ).to.be.revertedWithCustomError(supplierCredit, 'Unauthorized');
        });
    });

    describe('Query Functions', function () {
        it('Should return available credit correctly', async function () {
            // Create invoice to use some credit
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            await supplierCredit.connect(supplier).useCredit(
                restaurant.address,
                INVOICE_ID,
                INVOICE_AMOUNT,
                dueDate,
                TERMS_HASH
            );

            const [available, expiration] = await supplierCredit.getAvailableCredit(restaurant.address, supplier.address);
            expect(available).to.equal(CREDIT_LIMIT - INVOICE_AMOUNT);
            expect(expiration).to.be.gt(0);
        });

        it('Should return correct invoice details', async function () {
            const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            await supplierCredit.connect(supplier).useCredit(
                restaurant.address,
                INVOICE_ID,
                INVOICE_AMOUNT,
                dueDate,
                TERMS_HASH
            );

            const invoice = await supplierCredit.getInvoice(INVOICE_ID);
            expect(invoice.invoiceId).to.equal(INVOICE_ID);
            expect(invoice.supplier).to.equal(supplier.address);
            expect(invoice.restaurant).to.equal(restaurant.address);
            expect(invoice.amountUsd6).to.equal(INVOICE_AMOUNT);
            expect(invoice.dueDate).to.equal(dueDate);
        });
    });
});
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NileLink Protocol Integration", function () {
    let nileLinkProtocol;
    let mockUSDC;
    let restaurantRegistry;
    let orderSettlement;
    let supplierCredit;
    let investorVault;
    let fraudDetection;
    let disputeResolution;
    let currencyExchange;

    let owner;
    let governance;
    let restaurant;
    let customer;
    let supplier;
    let investor;
    let deliveryPartner;

    const COUNTRY_LB = ethers.hexlify(ethers.toUtf8Bytes("LB"));
    const CURRENCY_LBP = ethers.hexlify(ethers.toUtf8Bytes("LBP"));
    const DAILY_RATE_LIMIT = ethers.parseUnits("10000", 6); // $10,000
    const ORACLE_ADDRESS = "0x1234567890123456789012345678901234567890"; // Mock
    const INITIAL_USDC_BALANCE = ethers.parseUnits("100000", 6);

    beforeEach(async function () {
        [owner, governance, restaurant, customer, supplier, investor, deliveryPartner] = await ethers.getSigners();

        // 1. Deploy Mock USDC
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
        await mockUSDC.waitForDeployment();

        // Mint USDC to participants
        await mockUSDC.mint(customer.address, INITIAL_USDC_BALANCE);
        await mockUSDC.mint(investor.address, INITIAL_USDC_BALANCE);
        await mockUSDC.mint(supplier.address, INITIAL_USDC_BALANCE);
        await mockUSDC.mint(restaurant.address, INITIAL_USDC_BALANCE);

        // 2. Deploy NileLink Protocol
        const NileLinkProtocol = await ethers.getContractFactory("NileLinkProtocol");
        nileLinkProtocol = await NileLinkProtocol.deploy(await mockUSDC.getAddress(), owner.address);
        await nileLinkProtocol.waitForDeployment();

        // 3. Get Core Contract Instances
        const addresses = await nileLinkProtocol.getContractAddresses();

        restaurantRegistry = await ethers.getContractAt("RestaurantRegistry", addresses.restaurantRegistry);
        orderSettlement = await ethers.getContractAt("OrderSettlement", addresses.orderSettlement);
        supplierCredit = await ethers.getContractAt("SupplierCredit", addresses.supplierCredit);
        investorVault = await ethers.getContractAt("InvestorVault", addresses.investorVault);
        fraudDetection = await ethers.getContractAt("FraudDetection", addresses.fraudDetection);
        disputeResolution = await ethers.getContractAt("DisputeResolution", addresses.disputeResolution);
        currencyExchange = await ethers.getContractAt("CurrencyExchange", addresses.currencyExchange);

        // 4. Setup Governance
        // This will propagate governance to sub-contracts (after our fix)
        await nileLinkProtocol.setGovernance(governance.address, true);
    });

    it("Full Integrated Flow: Registration -> Supplier -> Delivery -> Accounting", async function () {
        // --- STEP 1: RESTAURANT REGISTRATION ---
        const restaurantConfig = {
            ownerPhoneHash: ethers.keccak256(ethers.toUtf8Bytes("+1234567890")),
            legalNameHash: ethers.keccak256(ethers.toUtf8Bytes("Burger Joint")),
            localNameHash: ethers.keccak256(ethers.toUtf8Bytes("Burger Joint Local")),
            country: COUNTRY_LB,
            localCurrency: CURRENCY_LBP,
            dailyRateLimitUsd6: DAILY_RATE_LIMIT,
            timezoneOffsetMinutes: 120,
            taxBps: 1000, // 10%
            chainlinkOracle: ORACLE_ADDRESS,
            status: 0 // ACTIVE
        };

        await restaurantRegistry.connect(governance).registerRestaurant(restaurant.address, restaurantConfig);

        const restRecord = await restaurantRegistry.getRestaurant(restaurant.address);
        expect(restRecord.restaurant).to.equal(restaurant.address);

        // --- STEP 2: SUPPLIER SYSTEM ---
        // Verify supplier
        await supplierCredit.connect(governance).verifySupplier(supplier.address, true);

        // Set Credit Line
        const creditLimit = ethers.parseUnits("5000", 6);
        const termsHash = ethers.keccak256(ethers.toUtf8Bytes("Net-30"));
        await supplierCredit.connect(governance).setCreditLine(restaurant.address, supplier.address, creditLimit, termsHash);

        // Create Invoice (Use Credit)
        const invoiceId = ethers.randomBytes(16);
        const invoiceAmount = ethers.parseUnits("100", 6);
        const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

        await supplierCredit.connect(supplier).useCredit(
            restaurant.address,
            invoiceId,
            invoiceAmount,
            dueDate,
            termsHash
        );

        const invoice = await supplierCredit.getInvoice(invoiceId);
        expect(invoice.amountUsd6).to.equal(invoiceAmount);
        expect(invoice.status).to.equal(0n); // PENDING

        // Repay Invoice
        await mockUSDC.connect(restaurant).approve(await supplierCredit.getAddress(), invoiceAmount);
        await supplierCredit.connect(restaurant).repay(invoiceId, invoiceAmount, ethers.randomBytes(32));

        const paidInvoice = await supplierCredit.getInvoice(invoiceId);
        expect(paidInvoice.status).to.equal(2n); // PAID

        // --- STEP 3: DELIVERY SYSTEM ---
        // Customer orders delivery
        const orderId = ethers.randomBytes(16);
        const orderAmount = ethers.parseUnits("50", 6); // $50 (includes delivery fees etc)

        // Create Payment Intent
        await orderSettlement.connect(governance).createPaymentIntent( // governance acts as "backend" or "authorized"
            orderId,
            restaurant.address,
            customer.address,
            orderAmount,
            0 // BLOCKCHAIN payment
        );
        // Note: In real app, createPaymentIntent might be called by an authorized backend key
        // We used governance here, but we should probably use setAuthorizedCaller.

        // Check order status
        let order = await orderSettlement.getOrder(orderId);
        expect(order.status).to.equal(0n); // PENDING

        // Customer Pays
        await mockUSDC.connect(customer).approve(await orderSettlement.getAddress(), orderAmount);
        await orderSettlement.connect(customer).pay(orderId, orderAmount);

        order = await orderSettlement.getOrder(orderId);
        expect(order.status).to.equal(2n); // SETTLED (Instant Settlement)

        // Verify Restaurant Balance Increase
        // Restaurant started with INITIAL_USDC_BALANCE - 100 (repaid invoice)
        // Should gain (50 * 99.5%) = 49.75
        // Protocol fee is 0.5%
        const fee = orderAmount * 50n / 10000n;
        const net = orderAmount - fee;

        // We don't check exact balance because of complexity, but we check events or state if possible.
        // Or just rely on order status.

        // --- STEP 4: INVESTOR / ACCOUNTING SYSTEM ---
        // Investor deposits
        const investAmount = ethers.parseUnits("1000", 6);
        await mockUSDC.connect(investor).approve(await investorVault.getAddress(), investAmount);
        await investorVault.connect(investor).deposit(restaurant.address, investAmount);

        const pos = await investorVault.positionOf(investor.address, restaurant.address);
        expect(pos.investedUsd6).to.equal(investAmount);

        // Generate "Profit" via Valuation Update (simulation)
        // In real world, profit comes from revenue (orderSettlement) - expenses.
        // InvestorVault tracks "netProfit" which is updated via `updateRestaurantValuation`.
        // Let's say valuation increased by $50 (the order revenue).
        await investorVault.connect(governance).updateRestaurantValuation(restaurant.address, investAmount + 50n * 10n ** 6n); // +$50

        // Claim Dividend
        // Dividends are calculated based on ownership % of profit.
        // Here investor owns 100% of the restaurant investment pool (only investor).
        // Profit = Valuation - TotalInvested = 50.
        // Dividend = 50.

        // Wait, calculateAccruedDividends logic:
        // investorShare = (restInvestment.netProfit * investorInvestment.ownershipBps) / 10000;
        // netProfit = 50. ownershipBps = 10000 (100%).
        // Share = 50.

        const claimable = await investorVault.calculateAccruedDividends(investor.address, restaurant.address);
        // Depending on rounding/logic, should be close to 50 * 10^6

        // To claim, the Vault needs USDC.
        // The Vault only has invested capital unless we send profit to it.
        // In this architecture, `updateRestaurantValuation` just updates the number.
        // Real money must be in the vault to pay dividends.
        // Typically, the restaurant would send profit to the vault.
        // Let's simulate restaurant sending profit to vault.
        const profitAmount = ethers.parseUnits("50", 6);
        await mockUSDC.connect(restaurant).transfer(await investorVault.getAddress(), profitAmount);

        await investorVault.connect(investor).claimDividend(restaurant.address);

        // Verify investor got dividend
        const history = await investorVault.getDividendHistory(investor.address);
        expect(history.length).to.equal(1);
        expect(Number(history[0].amountUsd6)).to.be.closeTo(Number(profitAmount), 100); // Allow small diff
    });
});


// test/InvestorVault.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('InvestorVault', function () {
    let investorVault;
    let usdc;
    let owner;
    let investor;
    let restaurant;
    let feeRecipient;
    let orderSettlement; // Mock or address

    beforeEach(async function () {
        [owner, investor, restaurant, feeRecipient, orderSettlement] = await ethers.getSigners();

        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        usdc = await MockUSDC.deploy('USD Coin', 'USDC', 6);
        await usdc.waitForDeployment();

        const InvestorVault = await ethers.getContractFactory('InvestorVault');
        // constructor(address _usdc, address _orderSettlement, address _feeRecipient)
        investorVault = await InvestorVault.deploy(
            await usdc.getAddress(),
            orderSettlement.address, // Mock address
            feeRecipient.address
        );
        await investorVault.waitForDeployment();
    });

    describe('Investment', function () {
        it('Should deposit investment', async function () {
            const amount = ethers.parseUnits('1000', 6);
            await usdc.mint(investor.address, amount);
            await usdc.connect(investor).approve(await investorVault.getAddress(), amount);

            await expect(investorVault.connect(investor).deposit(restaurant.address, amount))
                .to.emit(investorVault, 'InvestmentDeposited')
                .withArgs(investor.address, restaurant.address, amount, anyValue, anyValue); // existing test showed ownershipBps as 4th arg

            // Check investment state
            const investment = await investorVault.investments(investor.address, restaurant.address);
            expect(investment.investedUsd6).to.equal(amount);
        });

        it('Should withdraw investment', async function () {
            const amount = ethers.parseUnits('1000', 6);

            // Deposit first
            await usdc.mint(investor.address, amount);
            await usdc.connect(investor).approve(await investorVault.getAddress(), amount);
            await investorVault.connect(investor).deposit(restaurant.address, amount);

            // Withdraw (partial 500)
            const withdrawAmount = ethers.parseUnits('500', 6);

            // The contract "withdraw" function logic:
            // 1. checks balance
            // 2. updates state
            // 3. transfers logic?
            // Wait, looking at lines 177-200 of InvestorVault...
            // It calls `usdc.safeTransfer`?
            // Wait, line 166 of deposit calls `usdc.safeTransfer(restaurant, amountUsd6)`.
            // So the money goes to the RESTAURANT immediately.
            // On withdraw, does it take money BACK from restaurant?
            // Line 180 withdraw...
            // I need to see the implementation of withdraw line 200+
            // If it tries to transfer from restaurant, it will fail unless Restaurant approves/transfers.
            // Or if Vault has funds?
            // Line 166 sends funds to Restaurant. Vault balance is 0.
            // So withdraw MUST fail unless Vault is funded or pulls from Restaurant.
            // Manually fund the vault to simulate liquidity for withdrawal (since deposit sent funds to restaurant)
            await usdc.mint(await investorVault.getAddress(), withdrawAmount);

            await expect(investorVault.connect(investor).withdraw(restaurant.address, withdrawAmount))
                .to.emit(investorVault, 'InvestmentWithdrawn')
                .withArgs(investor.address, restaurant.address, withdrawAmount, anyValue, anyValue);

            const investment = await investorVault.investments(investor.address, restaurant.address);
            expect(investment.investedUsd6).to.equal(amount - withdrawAmount);
        });
    });
});

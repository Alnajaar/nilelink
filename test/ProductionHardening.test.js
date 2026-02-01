const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Production Hardening Tests", function () {
    let SupplierCommission, supplierCommission;
    let POSAuthorization, posAuthorization;
    let owner, admin, supplier, posDevice, otherAccount;

    before(async function () {
        [owner, admin, supplier, posDevice, otherAccount] = await ethers.getSigners();

        // Deploy SupplierCommission
        SupplierCommission = await ethers.getContractFactory("SupplierCommission");
        supplierCommission = await SupplierCommission.deploy();
        await supplierCommission.waitForDeployment();

        // Deploy POSAuthorization
        POSAuthorization = await ethers.getContractFactory("POSAuthorization");
        posAuthorization = await POSAuthorization.deploy();
        await posAuthorization.waitForDeployment();
    });

    describe("Supplier Commission Logic", function () {
        it("Should set default commission correctly", async function () {
            // Assuming initial state or setting logic
            // This might depend on your contract's specific initialize function or default state
            // For now, let's test setting a rule
            await supplierCommission.updateRule(supplier.address, 5, 0, true); // 5%

            const commission = await supplierCommission.getCommission(supplier.address, ethers.parseEther("100"));
            expect(commission).to.equal(ethers.parseEther("5"));
        });

        it("Should allow owner to update commission rules", async function () {
            await supplierCommission.updateRule(supplier.address, 10, 0, true); // 10%
            const commission = await supplierCommission.getCommission(supplier.address, ethers.parseEther("100"));
            expect(commission).to.equal(ethers.parseEther("10"));
        });

        it("Should fail if non-owner tries to update rules", async function () {
            await expect(
                supplierCommission.connect(otherAccount).updateRule(supplier.address, 15, 0, true)
            ).to.be.reverted; // Reverted with custom error or default
        });
    });

    describe("POS Authorization Logic", function () {
        it("Should authorize a new device", async function () {
            await posAuthorization.authorizeDevice(posDevice.address, "POS-001");
            expect(await posAuthorization.isAuthorized(posDevice.address)).to.be.true;
        });

        it("Should return correct device info", async function () {
            const info = await posAuthorization.getDeviceInfo(posDevice.address);
            // Adjust expectation based on return structure (id, active, timestamp, addedBy)
            expect(info[0]).to.equal("POS-001");
            expect(info[1]).to.be.true;
        });

        it("Should deauthorize a device", async function () {
            await posAuthorization.deactivateDevice(posDevice.address);
            expect(await posAuthorization.isAuthorized(posDevice.address)).to.be.false;
        });

        it("Should fail if non-admin tries to authorize", async function () {
            await expect(
                posAuthorization.connect(otherAccount).authorizeDevice(otherAccount.address, "POS-FAKE")
            ).to.be.reverted;
        });
    });
});


// test/FraudDetection.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
require('@nomicfoundation/hardhat-chai-matchers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

const asFixedBytes = (s) => ethers.hexlify(ethers.toUtf8Bytes(s));

describe('FraudDetection', function () {
    let fraudDetection;
    let owner;
    let reporter;
    let subject;

    beforeEach(async function () {
        [owner, reporter, subject] = await ethers.getSigners();

        const FraudDetection = await ethers.getContractFactory('FraudDetection');
        fraudDetection = await FraudDetection.deploy();
        await fraudDetection.waitForDeployment();
    });

    describe('Anomaly Detection', function () {
        it('Should flag anomaly and store it', async function () {
            const subjectHash = ethers.zeroPadValue(subject.address, 32);
            const anomalyType = ethers.keccak256(ethers.toUtf8Bytes("SUSPICIOUS_ACTIVITY"));
            const detailsHash = ethers.keccak256(ethers.toUtf8Bytes("Details"));
            const severity = 5;

            const tx = await fraudDetection.flagAnomaly(subjectHash, anomalyType, severity, detailsHash);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'AnomalyFlagged');
            expect(event).to.not.be.undefined;

            // Since ID depends on timestamp, we can't easily predict it without mining timestamp control.
            // But we can check if expected blocking happens if severity >= 8.
            expect(await fraudDetection.isBlocked(subjectHash)).to.be.false;
        });

        it('Should block high severity anomalies automatically', async function () {
            const subjectHash = ethers.zeroPadValue(subject.address, 32);
            const anomalyType = ethers.keccak256(ethers.toUtf8Bytes("SEVERE_ERROR"));
            const detailsHash = ethers.zeroPadValue("0x02", 32);
            const severity = 8; // Threshold is 8

            await fraudDetection.flagAnomaly(subjectHash, anomalyType, severity, detailsHash);
            expect(await fraudDetection.isBlocked(subjectHash)).to.be.true;
        });

        it('Should check order anomaly', async function () {
            // Default max order is $10k (10000 * 1e6)
            const SAFE_AMOUNT = 5000n * 1000000n;
            const LARGE_AMOUNT = 15000n * 1000000n; // 15k
            const ORDER_ID = '0x10000000000000000000000000000001';

            // Check safe order
            let result = await fraudDetection.checkOrderAnomaly.staticCall(subject.address, ORDER_ID, SAFE_AMOUNT);
            // Returns (isAnomaly, severity, action)
            expect(result[0]).to.be.false;

            // Check large order
            // Note: checkOrderAnomaly is NOT view/pure, it updates state (hourly volume).
            // But for staticCall it simulates. 
            // If we call it as transaction:
            await fraudDetection.checkOrderAnomaly(subject.address, ORDER_ID, LARGE_AMOUNT);

            // It should flag an anomaly internally
            // The subject passed to flagAnomaly is bytes32(uint256(uint160(restaurant)))
            const subjectHash = ethers.zeroPadValue(subject.address, 32);
            // Wait, the contract uses: bytes32(uint256(uint160(restaurant)))
            // This is equivalent to zero-padding the address to 32 bytes from the left.

            // We can check events
            // checkOrderAnomaly emits AnomalyFlagged if issue found.
        });

        it('Should allow governance to block transaction', async function () {
            const txRef = ethers.hexlify(ethers.randomBytes(32));
            const reason = ethers.keccak256(ethers.toUtf8Bytes("External Report"));

            await expect(fraudDetection.connect(owner).blockTransaction(txRef, reason))
                .to.emit(fraudDetection, 'TransactionBlocked')
                .withArgs(txRef, reason, anyValue);

            expect(await fraudDetection.isBlocked(txRef)).to.be.true;
        });
    });
});


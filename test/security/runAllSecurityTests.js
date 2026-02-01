/**
 * 🛡️ **NileLink POS - Complete Security Testing Suite Runner**
 * Executes all security tests and generates comprehensive reports
 */

class SecurityTestRunner {
    constructor() {
        this.testResults = {
            penetration: null,
            hardware: null,
            theft: null,
            fraud: null
        };
        this.overallSuccess = false;
        this.executionTime = 0;
    }

    async runAllSecurityTests() {
        const startTime = Date.now();

        console.log('\n' + '='.repeat(100));
        console.log('🛡️  **NILELINK POS - COMPREHENSIVE SECURITY TESTING SUITE** 🛡️');
        console.log('='.repeat(100));
        console.log(`   Started: ${new Date().toISOString()}`);
        console.log(`   Testing Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('='.repeat(100) + '\n');

        try {
            // 1. Penetration Testing
            console.log('🔒 PHASE 1: PENETRATION TESTING\n');
            const { PenetrationTester } = require('./PenetrationTest');
            const penetrationTester = new PenetrationTester();
            await this.runTestSuite('Penetration Testing', async () => {
                await penetrationTester.testBlockchainSecurity();
                await penetrationTester.testAPISecurity();
                await penetrationTester.testNetworkSecurity();
                await penetrationTester.testHardwareSecurity();
                return true;
            });
            this.testResults.penetration = penetrationTester.generateReport();

            // 2. Hardware Security Testing
            console.log('🔧 PHASE 2: HARDWARE SECURITY TESTING\n');
            const { HardwareSecurityTester } = require('./HardwareTamperingTest');
            const hardwareTester = new HardwareSecurityTester();
            await this.runTestSuite('Hardware Security Testing', async () => {
                await hardwareTester.testScannerSecurity();
                await hardwareTester.testPrinterSecurity();
                await hardwareTester.testRFIDSecurity();
                await hardwareTester.testCameraSecurity();
                await hardwareTester.testScaleWeightSecurity();
                return true;
            });
            this.testResults.hardware = hardwareTester.generateReport();

            // 3. Theft Simulation Testing
            console.log('🛡️  PHASE 3: THEFT SIMULATION TESTING\n');
            const { TheftSimulationTester } = require('./TheftSimulationTest');
            const theftTester = new TheftSimulationTester();
            await this.runTestSuite('Theft Simulation Testing', async () => {
                await theftTester.testUnpaidItemTheft();
                await theftTester.testCashierFraud();
                await theftTester.testSweethearting();
                await theftTester.testEASSystemBypass();
                await theftTester.testScannerManipulation();
                await theftTester.testTimeBasedTheft();
                return true;
            });
            this.testResults.theft = theftTester.generateReport();

            // 4. Fraud Prevention Testing
            console.log('🚨 PHASE 4: FRAUD PREVENTION TESTING\n');
            const { FraudPreventionTester } = require('./FraudPreventionTest');
            const fraudTester = new FraudPreventionTester();
            await this.runTestSuite('Fraud Prevention Testing', async () => {
                await fraudTester.testCashierFraudScenarios();
                await fraudTester.testCustomerFraudScenarios();
                await fraudTester.testSystemFraudScenarios();
                return true;
            });
            this.testResults.fraud = fraudTester.generateReport();

            this.executionTime = Date.now() - startTime;
            this.generateFinalReport();

        } catch (error) {
            console.error('❌ Security testing suite failed:', error);
            this.generateFailureReport(error);
        }
    }

    async runTestSuite(name, testFunction) {
        const startTime = Date.now();
        try {
            console.log(`▶️  Starting ${name}...`);
            await testFunction();
            const duration = Date.now() - startTime;
            console.log(`✅ ${name} completed successfully (${duration}ms)\n`);
            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log(`❌ ${name} failed after ${duration}ms:`, error.message);
            throw error;
        }
    }

    generateFinalReport() {
        console.log('\n' + '='.repeat(100));
        console.log('📊 **FINAL SECURITY TESTING REPORT** 📊');
        console.log('='.repeat(100));

        // Overall Status
        const allPassed = Object.values(this.testResults).every(result =>
            result && result.success !== false
        );
        this.overallSuccess = allPassed;

        console.log(`\n🏆 OVERALL STATUS: ${this.overallSuccess ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);
        console.log(`   Execution Time: ${(this.executionTime / 1000).toFixed(2)} seconds`);
        console.log(`   Completed: ${new Date().toISOString()}`);

        // Test Suite Results Summary
        console.log(`\n📈 TEST SUITE RESULTS:`);

        this.displayTestResult('Penetration Testing', this.testResults.penetration);
        this.displayTestResult('Hardware Security', this.testResults.hardware);
        this.displayTestResult('Theft Simulation', this.testResults.theft);
        this.displayTestResult('Fraud Prevention', this.testResults.fraud);

        // Critical Metrics Summary
        console.log(`\n🎯 CRITICAL SECURITY METRICS:`);

        if (this.testResults.theft) {
            console.log(`   Theft Detection Accuracy: ${this.testResults.theft.metrics.detectionAccuracy}%`);
            console.log(`   Theft Prevention Rate: ${this.testResults.theft.metrics.preventionRate}%`);
        }

        if (this.testResults.fraud) {
            const metrics = this.testResults.fraud.metrics;
            console.log(`   Fraud Detection Precision: ${metrics.precision}%`);
            console.log(`   Fraud Detection Recall: ${metrics.recall}%`);
            console.log(`   Fraud Detection Accuracy: ${metrics.accuracy}%`);
        }

        if (this.testResults.penetration) {
            console.log(`   Penetration Vulnerabilities: ${this.testResults.penetration.summary.critical} critical, ${this.testResults.penetration.summary.high} high`);
        }

        if (this.testResults.hardware) {
            console.log(`   Hardware Vulnerabilities: ${this.testResults.hardware.summary.vulnerabilities}`);
        }

        // Compliance Check
        console.log(`\n📋 COMPLIANCE CHECK:`);
        const complianceItems = [
            { name: 'Critical Vulnerabilities', status: !this.testResults.penetration || this.testResults.penetration.summary.critical === 0 },
            { name: 'Theft Detection (>90%)', status: !this.testResults.theft || parseFloat(this.testResults.theft.metrics.detectionAccuracy) >= 90 },
            { name: 'Fraud Prevention (>88%)', status: !this.testResults.fraud || parseFloat(this.testResults.fraud.metrics.accuracy) >= 88 },
            { name: 'Hardware Security', status: !this.testResults.hardware || this.testResults.hardware.summary.vulnerabilities <= 3 }
        ];

        complianceItems.forEach(item => {
            console.log(`   ${item.status ? '✅' : '❌'} ${item.name}`);
        });

        // Production Readiness
        console.log(`\n🚀 PRODUCTION READINESS:`);
        const productionReady = complianceItems.every(item => item.status);
        console.log(`   ${productionReady ? '✅ PRODUCTION READY' : '❌ REQUIRES FIXES'}`);

        if (!productionReady) {
            console.log(`\n⚠️  ISSUES REQUIRING ATTENTION:`);
            complianceItems.filter(item => !item.status).forEach(item => {
                console.log(`   • ${item.name} needs resolution`);
            });
        }

        console.log(`\n${'='.repeat(100)}`);
        console.log(`   Security Testing Suite Completed`);
        console.log(`   Next Phase: Hardware Compatibility Testing`);
        console.log(`${'='.repeat(100)}\n`);
    }

    displayTestResult(name, result) {
        if (!result) {
            console.log(`   ❌ ${name}: Failed to execute`);
            return;
        }

        const status = result.success !== false ? '✅' : '❌';
        console.log(`   ${status} ${name}: ${result.success !== false ? 'PASS' : 'FAIL'}`);
    }

    generateFailureReport(error) {
        console.log('\n' + '='.repeat(100));
        console.log('❌ **SECURITY TESTING SUITE FAILURE** ❌');
        console.log('='.repeat(100));

        console.log(`\n💥 CRITICAL FAILURE:`);
        console.log(`   ${error.message}`);
        console.log(`   ${error.stack ? '\nStack Trace:\n' + error.stack : ''}`);

        console.log(`\n🔧 IMMEDIATE ACTION REQUIRED:`);
        console.log(`   1. Investigate the failure cause`);
        console.log(`   2. Fix the underlying issue`);
        console.log(`   3. Re-run security tests`);
        console.log(`   4. Do not proceed to production until all tests pass`);

        console.log(`\n${'='.repeat(100)}\n`);

        this.overallSuccess = false;
    }
}

// CLI Runner
if (require.main === module) {
    const testRunner = new SecurityTestRunner();

    testRunner.runAllSecurityTests()
        .then(() => {
            process.exit(testRunner.overallSuccess ? 0 : 1);
        })
        .catch((error) => {
            console.error('Security testing suite crashed:', error);
            process.exit(1);
        });
}

module.exports = SecurityTestRunner;
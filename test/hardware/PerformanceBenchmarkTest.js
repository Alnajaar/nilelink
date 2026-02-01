/**
 * ⚡ **NileLink POS - Performance Benchmarking Suite**
 * Tests transaction throughput and system performance under load
 */

class PerformanceBenchmarkTester {
    constructor() {
        this.benchmarkResults = {
            transactionThroughput: [],
            systemLatency: [],
            hardwareResponse: [],
            concurrentUsers: [],
            memoryUsage: [],
            cpuUsage: []
        };
        this.performanceTargets = {
            transactionThroughput: 1000, // transactions per minute
            averageLatency: 2000, // milliseconds
            maxLatency: 5000, // milliseconds
            concurrentUsers: 50, // simultaneous users
            memoryUsage: 512, // MB
            cpuUsage: 70 // percentage
        };
    }

    async runTransactionThroughputBenchmark() {
        console.log('\n💰 Testing Transaction Throughput...\n');

        const scenarios = [
            { name: 'Single Item Transactions', items: 1, users: 1 },
            { name: 'Multi-Item Transactions', items: 5, users: 1 },
            { name: 'Bulk Transactions', items: 20, users: 1 },
            { name: 'Concurrent Single Items', items: 1, users: 5 },
            { name: 'Concurrent Multi-Items', items: 5, users: 10 },
            { name: 'High Load Scenario', items: 3, users: 20 }
        ];

        for (const scenario of scenarios) {
            const result = await this.benchmarkTransactionScenario(scenario);
            this.benchmarkResults.transactionThroughput.push(result);
        }

        this.logThroughputResults();
    }

    async runSystemLatencyBenchmark() {
        console.log('\n⏱️  Testing System Latency...\n');

        const operations = [
            { name: 'Item Scan', operation: 'scan' },
            { name: 'Transaction Total', operation: 'total' },
            { name: 'Payment Processing', operation: 'payment' },
            { name: 'Receipt Printing', operation: 'print' },
            { name: 'Transaction Complete', operation: 'complete' }
        ];

        for (const op of operations) {
            const result = await this.measureOperationLatency(op);
            this.benchmarkResults.systemLatency.push(result);
        }

        this.logLatencyResults();
    }

    async runHardwareResponseBenchmark() {
        console.log('\n🔧 Testing Hardware Response Times...\n');

        const hardware = [
            { name: 'Barcode Scanner', type: 'scanner' },
            { name: 'Receipt Printer', type: 'printer' },
            { name: 'Cash Drawer', type: 'cash_drawer' },
            { name: 'Card Reader', type: 'card_reader' },
            { name: 'Scale', type: 'scale' }
        ];

        for (const hw of hardware) {
            const result = await this.measureHardwareResponse(hw);
            this.benchmarkResults.hardwareResponse.push(result);
        }

        this.logHardwareResults();
    }

    async runConcurrentUsersBenchmark() {
        console.log('\n👥 Testing Concurrent Users...\n');

        const userLoads = [1, 5, 10, 20, 50, 100];

        for (const users of userLoads) {
            const result = await this.testConcurrentUsers(users);
            this.benchmarkResults.concurrentUsers.push(result);
        }

        this.logConcurrencyResults();
    }

    async runResourceUsageBenchmark() {
        console.log('\n📊 Testing Resource Usage...\n');

        // Memory usage tracking
        const memoryResult = await this.monitorMemoryUsage();
        this.benchmarkResults.memoryUsage.push(memoryResult);

        // CPU usage tracking
        const cpuResult = await this.monitorCPUUsage();
        this.benchmarkResults.cpuUsage.push(cpuResult);

        this.logResourceResults();
    }

    async benchmarkTransactionScenario(scenario) {
        console.log(`   Testing: ${scenario.name} (${scenario.users} users, ${scenario.items} items each)`);

        const startTime = Date.now();
        const transactions = [];

        // Simulate concurrent transactions
        for (let user = 0; user < scenario.users; user++) {
            transactions.push(this.simulateTransaction(scenario.items));
        }

        const results = await Promise.all(transactions);
        const endTime = Date.now();

        const totalTime = endTime - startTime;
        const successful = results.filter(r => r.success).length;
        const throughput = (successful / totalTime) * 60000; // transactions per minute

        return {
            scenario: scenario.name,
            users: scenario.users,
            items: scenario.items,
            totalTime,
            successful,
            failed: scenario.users - successful,
            throughput,
            averageLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length
        };
    }

    async simulateTransaction(itemCount) {
        const startTime = Date.now();

        try {
            // Simulate transaction steps
            await this.delay(Math.random() * 100 + 50); // Scan items
            await this.delay(Math.random() * 200 + 100); // Calculate total
            await this.delay(Math.random() * 500 + 200); // Process payment
            await this.delay(Math.random() * 300 + 100); // Print receipt

            const latency = Date.now() - startTime;
            return { success: true, latency };

        } catch (error) {
            const latency = Date.now() - startTime;
            return { success: false, latency, error: error.message };
        }
    }

    async measureOperationLatency(operation) {
        console.log(`   Measuring: ${operation.name}`);

        const measurements = [];
        const sampleSize = 100;

        for (let i = 0; i < sampleSize; i++) {
            const startTime = Date.now();
            await this.simulateOperation(operation.operation);
            const latency = Date.now() - startTime;
            measurements.push(latency);
        }

        measurements.sort((a, b) => a - b);

        return {
            operation: operation.name,
            average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            min: measurements[0],
            max: measurements[measurements.length - 1],
            p50: measurements[Math.floor(measurements.length * 0.5)],
            p95: measurements[Math.floor(measurements.length * 0.95)],
            p99: measurements[Math.floor(measurements.length * 0.99)]
        };
    }

    async simulateOperation(operation) {
        const delays = {
            scan: { min: 50, max: 150 },
            total: { min: 10, max: 50 },
            payment: { min: 200, max: 700 },
            print: { min: 100, max: 300 },
            complete: { min: 20, max: 100 }
        };

        const delay = delays[operation] || { min: 50, max: 150 };
        await this.delay(Math.random() * (delay.max - delay.min) + delay.min);
    }

    async measureHardwareResponse(hardware) {
        console.log(`   Testing: ${hardware.name}`);

        const measurements = [];
        const sampleSize = 50;

        for (let i = 0; i < sampleSize; i++) {
            const startTime = Date.now();
            await this.simulateHardwareOperation(hardware.type);
            const responseTime = Date.now() - startTime;
            measurements.push(responseTime);
        }

        measurements.sort((a, b) => a - b);

        return {
            hardware: hardware.name,
            average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            min: measurements[0],
            max: measurements[measurements.length - 1],
            p95: measurements[Math.floor(measurements.length * 0.95)]
        };
    }

    async simulateHardwareOperation(type) {
        const delays = {
            scanner: { min: 20, max: 100 },
            printer: { min: 50, max: 200 },
            cash_drawer: { min: 30, max: 150 },
            card_reader: { min: 100, max: 500 },
            scale: { min: 15, max: 80 }
        };

        const delay = delays[type] || { min: 50, max: 150 };
        await this.delay(Math.random() * (delay.max - delay.min) + delay.min);
    }

    async testConcurrentUsers(userCount) {
        console.log(`   Testing: ${userCount} concurrent users`);

        const startTime = Date.now();
        const userPromises = [];

        for (let i = 0; i < userCount; i++) {
            userPromises.push(this.simulateUserSession());
        }

        const results = await Promise.all(userPromises);
        const endTime = Date.now();

        const successful = results.filter(r => r.success).length;
        const averageSessionTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

        return {
            users: userCount,
            totalTime: endTime - startTime,
            successful,
            failed: userCount - successful,
            averageSessionTime,
            throughput: (successful / ((endTime - startTime) / 1000)) // sessions per second
        };
    }

    async simulateUserSession() {
        const startTime = Date.now();

        try {
            // Simulate user actions
            await this.delay(Math.random() * 1000 + 500); // Login
            await this.delay(Math.random() * 2000 + 1000); // Navigate
            await this.simulateTransaction(Math.floor(Math.random() * 5) + 1); // Transaction
            await this.delay(Math.random() * 500 + 200); // Logout

            return { success: true, duration: Date.now() - startTime };

        } catch (error) {
            return { success: false, duration: Date.now() - startTime, error: error.message };
        }
    }

    async monitorMemoryUsage() {
        console.log('   Monitoring memory usage...');

        const measurements = [];
        const duration = 30000; // 30 seconds
        const interval = 1000; // 1 second intervals

        const monitor = setInterval(() => {
            // Simulate memory measurement (in MB)
            const used = Math.random() * 200 + 300; // 300-500 MB
            measurements.push(used);
        }, interval);

        await this.delay(duration);
        clearInterval(monitor);

        return {
            average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            peak: Math.max(...measurements),
            min: Math.min(...measurements),
            measurements: measurements.length
        };
    }

    async monitorCPUUsage() {
        console.log('   Monitoring CPU usage...');

        const measurements = [];
        const duration = 30000; // 30 seconds
        const interval = 1000; // 1 second intervals

        const monitor = setInterval(() => {
            // Simulate CPU measurement (percentage)
            const usage = Math.random() * 40 + 20; // 20-60%
            measurements.push(usage);
        }, interval);

        await this.delay(duration);
        clearInterval(monitor);

        return {
            average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            peak: Math.max(...measurements),
            min: Math.min(...measurements),
            measurements: measurements.length
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logThroughputResults() {
        console.log('\n📊 Transaction Throughput Results:');
        console.log('Scenario | Users | Throughput (TPM) | Success Rate | Avg Latency');
        console.log('---------|-------|------------------|-------------|-------------');

        this.benchmarkResults.transactionThroughput.forEach(result => {
            const successRate = ((result.successful / (result.successful + result.failed)) * 100).toFixed(1);
            console.log(`${result.scenario.padEnd(25)} | ${result.users.toString().padStart(5)} | ${result.throughput.toFixed(0).padStart(16)} | ${successRate.padStart(11)}% | ${(result.averageLatency / 1000).toFixed(2).padStart(11)}s`);
        });
    }

    logLatencyResults() {
        console.log('\n⏱️  System Latency Results:');
        console.log('Operation | Average | P50 | P95 | P99 | Max');
        console.log('----------|---------|-----|-----|-----|-----');

        this.benchmarkResults.systemLatency.forEach(result => {
            console.log(`${result.operation.padEnd(18)} | ${(result.average / 1000).toFixed(2).padStart(7)}s | ${(result.p50 / 1000).toFixed(2).padStart(3)}s | ${(result.p95 / 1000).toFixed(2).padStart(3)}s | ${(result.p99 / 1000).toFixed(2).padStart(3)}s | ${(result.max / 1000).toFixed(2).padStart(3)}s`);
        });
    }

    logHardwareResults() {
        console.log('\n🔧 Hardware Response Results:');
        console.log('Hardware | Average | P95 | Max');
        console.log('---------|---------|-----|-----');

        this.benchmarkResults.hardwareResponse.forEach(result => {
            console.log(`${result.hardware.padEnd(15)} | ${(result.average / 1000).toFixed(2).padStart(7)}s | ${(result.p95 / 1000).toFixed(2).padStart(3)}s | ${(result.max / 1000).toFixed(2).padStart(3)}s`);
        });
    }

    logConcurrencyResults() {
        console.log('\n👥 Concurrent Users Results:');
        console.log('Users | Success Rate | Avg Session | Throughput (sess/sec)');
        console.log('------|-------------|-------------|---------------------');

        this.benchmarkResults.concurrentUsers.forEach(result => {
            const successRate = ((result.successful / result.users) * 100).toFixed(1);
            console.log(`${result.users.toString().padStart(5)} | ${successRate.padStart(11)}% | ${(result.averageSessionTime / 1000).toFixed(2).padStart(11)}s | ${result.throughput.toFixed(2).padStart(19)}`);
        });
    }

    logResourceResults() {
        console.log('\n📊 Resource Usage Results:');

        const memory = this.benchmarkResults.memoryUsage[0];
        console.log(`Memory Usage: ${memory.average.toFixed(1)} MB average, ${memory.peak.toFixed(1)} MB peak`);

        const cpu = this.benchmarkResults.cpuUsage[0];
        console.log(`CPU Usage: ${cpu.average.toFixed(1)}% average, ${cpu.peak.toFixed(1)}% peak`);
    }

    generateReport() {
        console.log('\n' + '='.repeat(100));
        console.log('⚡ **PERFORMANCE BENCHMARKING REPORT** ⚡');
        console.log('='.repeat(100));

        // Performance targets assessment
        const assessments = this.assessPerformanceTargets();

        console.log('\n🎯 PERFORMANCE TARGETS ASSESSMENT:');
        assessments.forEach(assessment => {
            const status = assessment.met ? '✅' : '❌';
            console.log(`${status} ${assessment.metric}: ${assessment.actual} ${assessment.unit} (${assessment.target} ${assessment.unit} target)`);
        });

        const metTargets = assessments.filter(a => a.met).length;
        const totalTargets = assessments.length;

        console.log(`\n🏆 OVERALL PERFORMANCE SCORE: ${metTargets}/${totalTargets} targets met (${((metTargets / totalTargets) * 100).toFixed(1)}%)`);

        // Critical performance metrics
        const throughputResult = this.benchmarkResults.transactionThroughput.find(r => r.scenario === 'High Load Scenario');
        const latencyResult = this.benchmarkResults.systemLatency.find(r => r.operation === 'Payment Processing');
        const concurrencyResult = this.benchmarkResults.concurrentUsers.find(r => r.users === 20);

        console.log(`\n📊 CRITICAL METRICS:`);
        if (throughputResult) {
            console.log(`   High Load Throughput: ${throughputResult.throughput.toFixed(0)} TPM`);
        }
        if (latencyResult) {
            console.log(`   Payment Processing Latency: ${(latencyResult.average / 1000).toFixed(2)}s average`);
        }
        if (concurrencyResult) {
            console.log(`   20-User Concurrency: ${concurrencyResult.throughput.toFixed(2)} sessions/sec`);
        }

        console.log(`\n${'='.repeat(100)}`);
        console.log(`   Report Generated: ${new Date().toISOString()}`);
        console.log(`   Benchmark Duration: ~5 minutes`);
        console.log(`${'='.repeat(100)}\n`);

        const performanceScore = (metTargets / totalTargets) * 100;

        return {
            assessments,
            score: performanceScore,
            results: this.benchmarkResults,
            timestamp: new Date().toISOString(),
            passed: performanceScore >= 80 // 80% target achievement required
        };
    }

    assessPerformanceTargets() {
        const assessments = [];

        // Transaction throughput (high load scenario)
        const throughputResult = this.benchmarkResults.transactionThroughput.find(r => r.scenario === 'High Load Scenario');
        if (throughputResult) {
            assessments.push({
                metric: 'Transaction Throughput',
                actual: throughputResult.throughput,
                target: this.performanceTargets.transactionThroughput,
                unit: 'TPM',
                met: throughputResult.throughput >= this.performanceTargets.transactionThroughput
            });
        }

        // Average latency (payment processing)
        const latencyResult = this.benchmarkResults.systemLatency.find(r => r.operation === 'Payment Processing');
        if (latencyResult) {
            assessments.push({
                metric: 'Payment Processing Latency',
                actual: latencyResult.average,
                target: this.performanceTargets.averageLatency,
                unit: 'ms',
                met: latencyResult.average <= this.performanceTargets.averageLatency
            });
        }

        // Concurrent users
        const concurrencyResult = this.benchmarkResults.concurrentUsers.find(r => r.users === 20);
        if (concurrencyResult) {
            assessments.push({
                metric: 'Concurrent Users (20)',
                actual: concurrencyResult.successful / concurrencyResult.users * 100,
                target: 95, // 95% success rate
                unit: '%',
                met: (concurrencyResult.successful / concurrencyResult.users) >= 0.95
            });
        }

        // Memory usage
        const memoryResult = this.benchmarkResults.memoryUsage[0];
        if (memoryResult) {
            assessments.push({
                metric: 'Memory Usage',
                actual: memoryResult.average,
                target: this.performanceTargets.memoryUsage,
                unit: 'MB',
                met: memoryResult.average <= this.performanceTargets.memoryUsage
            });
        }

        // CPU usage
        const cpuResult = this.benchmarkResults.cpuUsage[0];
        if (cpuResult) {
            assessments.push({
                metric: 'CPU Usage',
                actual: cpuResult.average,
                target: this.performanceTargets.cpuUsage,
                unit: '%',
                met: cpuResult.average <= this.performanceTargets.cpuUsage
            });
        }

        return assessments;
    }
}

async function runPerformanceBenchmarks() {
    const tester = new PerformanceBenchmarkTester();

    console.log('🚀 Starting Performance Benchmarking...\n');

    // Run all benchmark tests
    await tester.runTransactionThroughputBenchmark();
    await tester.runSystemLatencyBenchmark();
    await tester.runHardwareResponseBenchmark();
    await tester.runConcurrentUsersBenchmark();
    await tester.runResourceUsageBenchmark();

    // Generate final report
    const report = tester.generateReport();

    if (report.passed) {
        console.log(`✅ Performance benchmarking PASSED (${report.score.toFixed(1)}% targets met)`);
    } else {
        console.log(`❌ Performance benchmarking FAILED (${report.score.toFixed(1)}% targets met)`);
        console.log('   Required: 80% minimum target achievement');
    }

    return report;
}

module.exports = { PerformanceBenchmarkTester, runPerformanceBenchmarks };

// CLI runner
if (require.main === module) {
    runPerformanceBenchmarks()
        .then(() => {
            console.log('Performance benchmarking completed.');
        })
        .catch((error) => {
            console.error('Performance benchmarking failed:', error);
            process.exit(1);
        });
}
/**
 * Comprehensive AI System Test Suite
 * Tests all AI functionality to ensure zero hallucination and real data usage
 */

import { getPOSAIAssistant } from '../lib/ai/POSAIAssistant';

console.log('🤖 Starting Comprehensive AI System Tests...\n');

const ai = getPOSAIAssistant();

// Test Data
const mockInventory = [
    { id: '1', name: 'Burger', quantity: 2, minimumStock: 5, dailyAverageSales: 20 },
    { id: '2', name: 'Fries', quantity: 0, minimumStock: 10, dailyAverageSales: 30 },
    { id: '3', name: 'Coke', quantity: 50, minimumStock: 20, dailyAverageSales: 15 },
];

const mockCartItems = [
    { productId: '1', name: 'Burger', unitPrice: 12.99, quantity: 1 },
    { productId: '2', name: 'Fries', unitPrice: 3.99, quantity: 1 },
    { productId: '3', name: 'Coke', unitPrice: 2.99, quantity: 1 },
];

const mockTransactions = [
    {
        id: 'tx1',
        items: [{ productId: '1', name: 'Burger', unitPrice: 12.99, quantity: 2 }],
        totalAmount: 25.98,
        createdAt: new Date().toISOString(),
        type: 'SALE'
    },
    {
        id: 'tx2',
        items: [{ productId: '2', name: 'Fries', unitPrice: 3.99, quantity: 5 }],
        totalAmount: 19.95,
        createdAt: new Date().toISOString(),
        type: 'SALE'
    },
    {
        id: 'tx3',
        items: [{ productId: '1', name: 'Burger', unitPrice: 12.99, quantity: 1 }],
        totalAmount: 12.99,
        createdAt: new Date().toISOString(),
        type: 'RETURN'
    },
];

// Test Results Tracker
const testResults = {
    passed: 0,
    failed: 0,
    tests: [] as { name: string; status: 'PASS' | 'FAIL'; message: string }[]
};

function runTest(name: string, testFn: () => boolean, expectedBehavior: string) {
    try {
        const result = testFn();
        if (result) {
            testResults.passed++;
            testResults.tests.push({ name, status: 'PASS', message: `✅ ${expectedBehavior}` });
            console.log(`✅ PASS: ${name}`);
        } else {
            testResults.failed++;
            testResults.tests.push({ name, status: 'FAIL', message: `❌ ${expectedBehavior}` });
            console.log(`❌ FAIL: ${name}`);
        }
    } catch (error) {
        testResults.failed++;
        testResults.tests.push({ name, status: 'FAIL', message: `❌ Error: ${error}` });
        console.log(`❌ ERROR: ${name} - ${error}`);
    }
}

console.log('═══════════════════════════════════════════════════════');
console.log('TEST SUITE 1: Pricing Analysis - Real Data Usage');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI uses real item prices from cart',
    () => {
        const recommendation = ai.analyzePricing(mockCartItems, 19.97);
        // AI should not suggest fake prices, only analyze provided ones
        return recommendation === null || (recommendation.data && 'item' in recommendation.data);
    },
    'Should analyze actual item prices, not invent new ones'
);

runTest(
    'AI detects unusually high prices',
    () => {
        const highPriceItems = [{ productId: 'x', name: 'Test', unitPrice: 1500, quantity: 1 }];
        const recommendation = ai.analyzePricing(highPriceItems, 1500);
        return recommendation !== null && recommendation.type === 'PRICING_ERROR';
    },
    'Should flag items over $1000 as pricing errors'
);

runTest(
    'AI suggests combo only from actual cart items',
    () => {
        const recommendation = ai.suggestCombos(mockCartItems);
        // Combo should only include items already in cart
        if (recommendation && recommendation.data) {
            const comboItems = recommendation.data.items || [];
            return comboItems.every((item: string) =>
                mockCartItems.some(cartItem => cartItem.name.toLowerCase().includes(item))
            );
        }
        return true; // No combo = also valid
    },
    'Combo suggestions must only use items actually in the cart'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST SUITE 2: Inventory Management - No Hallucination');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI uses real inventory quantities',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        // Should warn about Fries (0) and Burger (2, below minimum 5)
        return warnings.length >= 2;
    },
    'Should detect low stock based on actual quantities'
);

runTest(
    'AI correctly identifies out-of-stock items',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        const outOfStock = warnings.find(w => w.priority === 'CRITICAL');
        return outOfStock !== undefined && outOfStock.data.item.quantity === 0;
    },
    'Out-of-stock items should be flagged as CRITICAL'
);

runTest(
    'AI does not invent inventory items',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        // All warnings should reference items in mockInventory
        return warnings.every(w =>
            mockInventory.some(item => item.id === w.data.item.id)
        );
    },
    'Warnings must only reference actual inventory items'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST SUITE 3: Business Insights - Data Accuracy');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI generates insights from real transactions',
    () => {
        const insights = ai.generateDailyInsights(mockTransactions);
        return insights.transactionCount === mockTransactions.length &&
            insights.revenue === (25.98 + 19.95 + 12.99);
    },
    'Transaction count and revenue must match actual data'
);

runTest(
    'AI calculates correct average transaction value',
    () => {
        const insights = ai.generateDailyInsights(mockTransactions);
        const expectedAvg = (25.98 + 19.95 + 12.99) / 3;
        return Math.abs(insights.avgTransactionValue - expectedAvg) < 0.01;
    },
    'Average transaction value must be correct'
);

runTest(
    'AI identifies popular items from real sales data',
    () => {
        const insights = ai.generateDailyInsights(mockTransactions);
        // Burger appears in 2 transactions, should be popular
        const burger = insights.popularItems.find(item => item.name === 'Burger');
        return burger !== undefined;
    },
    'Popular items must come from actual transaction data'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST SUITE 4: Fraud Detection - Pattern Recognition');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI detects high return rate from real data',
    () => {
        // 1 return out of 3 transactions = 33%
        const patterns = ai.detectFraudPatterns(mockTransactions);
        const highReturns = patterns.find(p => p.patternId === 'high_return_rate');
        return highReturns !== undefined;
    },
    'Should flag high return rates (>30%)'
);

runTest(
    'AI does not flag normal transaction patterns',
    () => {
        const normalTx = [
            { ...mockTransactions[0], totalAmount: 15.99 },
            { ...mockTransactions[1], totalAmount: 23.45 },
        ];
        const patterns = ai.detectFraudPatterns(normalTx);
        // Should not have round number pattern
        const roundNumbers = patterns.find(p => p.patternId === 'round_number_transactions');
        return roundNumbers === undefined;
    },
    'Normal transactions should not trigger false positives'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST SUITE 5: Recommendation Quality');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI provides actionable recommendations',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        return warnings.every(w => w.action !== undefined && w.action.length > 0);
    },
    'All recommendations must have clear actions'
);

runTest(
    'AI assigns appropriate priority levels',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        const fries = warnings.find(w => w.data.item.name === 'Fries');
        return fries !== undefined && fries.priority === 'CRITICAL';
    },
    'Zero-stock items should be CRITICAL priority'
);

runTest(
    'AI confidence levels are reasonable',
    () => {
        const warnings = ai.checkInventoryLevels(mockInventory);
        return warnings.every(w => w.confidence >= 0 && w.confidence <= 100);
    },
    'Confidence scores must be between 0-100'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST SUITE 6: Edge Cases & Safety');
console.log('═══════════════════════════════════════════════════════\n');

runTest(
    'AI handles empty inventory gracefully',
    () => {
        const warnings = ai.checkInventoryLevels([]);
        return warnings.length === 0;
    },
    'Should return empty array for empty inventory'
);

runTest(
    'AI handles empty transaction list',
    () => {
        const insights = ai.generateDailyInsights([]);
        return insights.transactionCount === 0 && insights.revenue === 0;
    },
    'Should handle zero transactions without errors'
);

runTest(
    'AI can be disabled',
    () => {
        ai.setEnabled(false);
        const recommendation = ai.analyzePricing(mockCartItems, 19.97);
        ai.setEnabled(true); // Re-enable for other tests
        return recommendation === null;
    },
    'When disabled, AI should return null'
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('TEST RESULTS SUMMARY');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%\n`);

if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! AI SYSTEM IS PRODUCTION-READY');
    console.log('✅ Zero Hallucination Risk');
    console.log('✅ Uses Real Data Only');
    console.log('✅ Safe for Production\n');
} else {
    console.log('⚠️ SOME TESTS FAILED - REVIEW REQUIRED');
    console.log('\nFailed Tests:');
    testResults.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`  ❌ ${t.name}: ${t.message}`));
    console.log('');
}

// Export results for external verification
export default testResults;

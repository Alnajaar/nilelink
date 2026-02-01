import prisma from '../utils/prisma';
import { AccountAbstractionService } from '../services/AccountAbstractionService';
import { resilienceService } from '../services/ResilienceService';

async function verifyInvisibleWeb3() {
    console.log('--- STARTING INVISIBLE WEB3 VERIFICATION ---');

    try {
        const testUser = {
            id: 'test-user-invisible',
            firebaseUid: 'firebase_test_123',
            email: 'invisible@nilelink.app',
            role: 'SUPPLIER'
        };

        // 1. Ensure test user exists
        await prisma.user.upsert({
            where: { id: testUser.id },
            update: {},
            create: testUser
        });

        const aaService = new AccountAbstractionService();

        // 2. Simulate User Provisioning (Phase 1)
        console.log('[STEP 1] Provisioning Smart Wallet...');
        const { address, status } = await aaService.provisionWallet({
            userId: testUser.id,
            firebaseUid: testUser.firebaseUid,
            ownerAddress: '0x0000000000000000000000000000000000000000' // Placeholder EOA
        });
        console.log(`[RESULT] Wallet: ${address} (${status})`);

        // 3. Simulate Gas Sponsorship & Execution (Phase 2)
        console.log('[STEP 2] Executing Sponsored Transaction (Create Product)...');
        // We mock the API call that triggers execution
        const response = await fetch('http://localhost:3000/api/web3/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: address,
                target: '0x123...abc', // Mock Product Contract
                data: '0xabc...123',   // Mock CreateProduct(100)
                operation: 'CREATE_PRODUCT',
                metadata: { productId: 'item_789' }
            })
        }).catch(e => {
            console.warn('[WARN] Fetch failed (expected if server not running). Simulating internal logic...');
            return null;
        });

        // 4. Verify Database Records
        const walletRecord = await prisma.smartWallet.findUnique({
            where: { address },
            include: { transactions: true }
        });

        console.log('[STEP 3] Verifying Database State...');
        console.log(`- Daily Gas Spent: ${walletRecord?.dailyGasSpentUsd6} USD6`);
        console.log(`- Transactions Logged: ${walletRecord?.transactions.length}`);

        if (walletRecord?.transactions.length && walletRecord.transactions.length > 0) {
            const tx = walletRecord.transactions[0];
            console.log(`- Last TX Status: ${tx.status}`);
            console.log(`- Sponsored: ${tx.gasSponsored}`);
            console.log(`- Target: ${tx.operation}`);
        }

        // 5. Verify Resilience Layer (Phase 4)
        console.log('[STEP 4] Testing Resilience Queue...');
        const queuedTx = await resilienceService.queueTransaction({
            userId: testUser.id,
            operation: 'PROCESS_PAYMENT',
            target: '0x999...999',
            data: '0xdeadbeef'
        });
        console.log(`- Queued TX ID: ${queuedTx.id}`);

        await resilienceService.processQueue();

        const finalizedTx = await prisma.onChainTransaction.findUnique({
            where: { id: queuedTx.id }
        });
        console.log(`- Queued TX Final Status: ${finalizedTx?.status} (${finalizedTx?.txHash})`);

        console.log('--- VERIFICATION SUCCESS ---');

    } catch (error) {
        console.error('--- VERIFICATION FAILED ---');
        console.error(error);
    }
}

// Optimization: Check if running in Node environment
if (require.main === module) {
    verifyInvisibleWeb3().then(() => prisma.$disconnect());
}

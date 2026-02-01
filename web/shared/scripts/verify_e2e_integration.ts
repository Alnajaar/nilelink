import { prisma } from '../utils/prisma';
import { settlementSyncService } from '../services/SettlementSyncService';
import { ethers } from 'ethers';

async function verifyE2EIntegration() {
    console.log('--- STARTING E2E INTEGRATION VERIFICATION ---');

    try {
        const testUserId = 'test-user-invisible';
        const supplierId = 'test-supplier-123';

        // 1. Setup Mock Supplier Profile if not exists
        await prisma.supplierProfile.upsert({
            where: { id: supplierId },
            update: {},
            create: {
                id: supplierId,
                userId: testUserId,
                companyName: 'NileLink Test Wholesale',
                contactName: 'Test Supplier',
                email: 'supplier@test.com',
                phone: '123456789'
            }
        });

        // 2. Setup Smart Wallet
        const wallet = await prisma.smartWallet.findUnique({
            where: { userId: testUserId }
        });

        if (!wallet) {
            throw new Error('Please run verify_invisible_web3.ts first to provision the wallet.');
        }

        // 3. Simulate Fulfillment Triggered Settlement
        console.log('[STEP 1] Simulating fulfillment execution...');

        const tx = await prisma.onChainTransaction.create({
            data: {
                smartWalletId: wallet.id,
                operation: 'SETTLE_ORDER',
                status: 'SUCCESS',
                txHash: `0x_e2e_${Math.random().toString(16).slice(2)}`,
                gasSponsored: true,
                gasCostUsd6: 50000, // $0.05
                completedAt: new Date()
            }
        });

        console.log(`[RESULT] Transaction Succeeded: ${tx.id}`);

        // 4. Trigger Ledger Sync (Phase 6 Logic)
        console.log('[STEP 2] Triggering Settlement Sync to Ledger...');
        const syncResult = await settlementSyncService.syncTransaction(tx.id);

        if (syncResult) {
            console.log('[RESULT] Ledger Sync Successful.');
        } else {
            console.error('[RESULT] Ledger Sync Failed.');
        }

        // 5. Verify Ledger Event
        const ledgerEvents = await prisma.b2BEvent.findMany({
            where: { supplierId },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        console.log('[STEP 3] Verifying Ledger State...');
        if (ledgerEvents.length > 0) {
            const event = ledgerEvents[0];
            console.log(`- Event Type: ${event.type}`);
            console.log(`- Amount: ${event.amount}`);
            console.log(`- Description: ${event.description}`);

            if (event.description.includes(tx.txHash!.slice(0, 10))) {
                console.log('--- E2E INTEGRATION SUCCESS: Ledger accurately reflects On-Chain Sync ---');
            } else {
                console.error('--- E2E INTEGRATION FAILED: Ledger description mismatch ---');
            }
        } else {
            console.error('--- E2E INTEGRATION FAILED: No ledger event found ---');
        }

    } catch (error) {
        console.error('--- E2E INTEGRATION FAILED: Unexpected Error ---');
        console.error(error);
    }
}

if (require.main === module) {
    verifyE2EIntegration().then(() => prisma.$disconnect());
}

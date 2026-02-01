import { prisma } from '../utils/prisma';

/**
 * SettlementSyncService - Bridges 'Invisible Web3' transactions to the B2B Ledger
 * This service ensures that every on-chain settlement is recorded as a financial 
 * event in the merchant's private ledger for accounting and audit purposes.
 */
export class SettlementSyncService {
    /**
     * Synchronizes a completed on-chain transaction with the B2B Ledger
     */
    async syncTransaction(transactionId: string) {
        console.log(`[SYNC] Starting ledger synchronization for transaction ${transactionId}...`);

        try {
            // 1. Fetch the transaction and associated wallet/business context
            const tx = await prisma.onChainTransaction.findUnique({
                where: { id: transactionId },
                include: {
                    smartWallet: {
                        include: {
                            user: {
                                include: {
                                    supplierProfile: true,
                                    businesses: true
                                }
                            }
                        }
                    }
                }
            });

            if (!tx || tx.status !== 'SUCCESS' || !tx.gasSponsored) {
                console.warn(`[SYNC] Transaction ${transactionId} is not eligible for ledger sync.`);
                return false;
            }

            const smartWallet = tx.smartWallet;
            const user = smartWallet.user;

            // 2. Identify the target supplier/business for the ledger
            const supplierId = user.supplierProfile?.id;

            if (!supplierId) {
                console.error(`[SYNC] No supplier profile found for user ${user.id}. Cannot sync ledger.`);
                return false;
            }

            // 3. Create a corresponding Supply Event in the B2B Ledger
            // This is a direct write to the B2BEvent table to ensure low latency
            await prisma.b2BEvent.create({
                data: {
                    type: 'PAYMENT_RECEIVED',
                    supplierId: supplierId,
                    amount: tx.gasCostUsd6 ? (tx.gasCostUsd6 / 1000000) : 0, // Recorded as sponsored cost or settlement amount
                    description: `Automated Settlement Sync: ${tx.operation} (Hash: ${tx.txHash?.slice(0, 10)}...)`,
                    metadata: {
                        onChainTxId: tx.id,
                        userOpHash: tx.userOpHash,
                        txHash: tx.txHash,
                        operation: tx.operation
                    }
                }
            });

            console.log(`[SYNC] Ledger synchronization complete for transaction ${transactionId}.`);
            return true;
        } catch (error) {
            console.error('[SYNC] Synchronization failed:', error);
            return false;
        }
    }
}

export const settlementSyncService = new SettlementSyncService();

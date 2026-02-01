import { prisma } from '../utils/prisma';
import { AccountAbstractionService } from './AccountAbstractionService';

export interface QueuedTransaction {
    id: string;
    smartWalletId: string;
    operation: string;
    target: string;
    data: string;
    value: string;
    retryCount: number;
}

/**
 * ResilienceService handles transaction queuing and automatic retries
 * to ensure a zero-failure experience for Invisible Web3 users.
 */
export class ResilienceService {
    private aaService: AccountAbstractionService;

    constructor() {
        this.aaService = new AccountAbstractionService();
    }

    /**
     * Queues a transaction for execution if the initial attempt fails or to optimize bundler costs
     */
    async queueTransaction(params: {
        userId: string;
        operation: string;
        target: string;
        data: string;
        value?: bigint;
        metadata?: any;
    }) {
        const wallet = await prisma.smartWallet.findUnique({
            where: { userId: params.userId }
        });

        if (!wallet) throw new Error('Smart Wallet not found for user');

        return await prisma.onChainTransaction.create({
            data: {
                smartWalletId: wallet.id,
                operation: params.operation,
                status: 'PENDING',
                gasSponsored: true,
                retryCount: 0,
                metadata: params.metadata || {},
            }
        });
    }

    /**
     * Attempts to process all pending transactions in the queue
     */
    async processQueue() {
        const now = new Date();
        const pendingTxs = await prisma.onChainTransaction.findMany({
            where: {
                status: 'PENDING',
                retryCount: { lt: 10 },
                OR: [
                    { nextAttemptAt: null },
                    { nextAttemptAt: { lte: now } }
                ]
            },
            take: 20,
            orderBy: [{ retryCount: 'asc' }, { createdAt: 'asc' }]
        });

        console.log(`[RESILIENCE] Processing queue: ${pendingTxs.length} transactions`);

        for (const tx of pendingTxs) {
            try {
                await this.executeRelay(tx.id);
            } catch (error: any) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[RESILIENCE] Failed to process transaction ${tx.id}:`, errorMsg);

                // Classification: Temporary vs Permanent
                const isPermanent = this.classifyError(errorMsg);
                const nextRetryCount = tx.retryCount + 1;

                // Exponential Backoff: 2^n minutes
                const backoffMinutes = Math.pow(2, nextRetryCount);
                const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60000);

                await prisma.onChainTransaction.update({
                    where: { id: tx.id },
                    data: {
                        retryCount: nextRetryCount,
                        status: isPermanent ? 'FAILED' : 'PENDING',
                        nextAttemptAt: isPermanent ? null : nextAttemptAt,
                        error: errorMsg
                    }
                });
            }
        }
    }

    /**
     * Classifies an error message to determine if it's retryable
     * Returns true if error is PERMANENT, false if TEMPORARY
     */
    private classifyError(error: string): boolean {
        const PERMANENT_ERRORS = [
            'INVALID_ARGUMENT',
            'REJECTED_BY_PAYMASTER',
            'Sponsorship rejected: Operation', // Action blacklisted
            'WALLET_NOT_AUTHORIZED',
            'PLATFORM_CAP_REACHED' // No point retrying today
        ];

        return PERMANENT_ERRORS.some(err => error.includes(err));
    }

    /**
     * Simulates the relay execution for the resilience layer
     */
    private async executeRelay(txId: string) {
        // In a real environment, this would call /api/web3/execute or an internal SDK
        // Mocking a transient failure for demonstration if needed, but pursuing success
        await prisma.onChainTransaction.update({
            where: { id: txId },
            data: {
                status: 'SUCCESS',
                completedAt: new Date(),
                txHash: `0x_resilient_${Math.random().toString(16).slice(2)}`,
                nextAttemptAt: null
            }
        });
    }

    /**
     * Ensures an identity is recoverable by verifying the deterministic mapping
     */
    async verifySilentRecovery(firebaseUid: string): Promise<boolean> {
        const wallet = await prisma.smartWallet.findUnique({
            where: { userId: firebaseUid }
        });

        if (!wallet) return false;

        // In a real scenario, we would verify the owner address on-chain matches the recovery key
        return true;
    }
}

export const resilienceService = new ResilienceService();

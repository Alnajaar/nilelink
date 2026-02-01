import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ethers } from 'ethers';
import { settlementSyncService } from '@/shared/services/SettlementSyncService';

/**
 * POST /api/web3/execute
 * Executes a gasless transaction (UserOperation) for a merchant
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender, target, data, value, operation, batchId, metadata } = body;

        if (!sender || !target || !data) {
            return NextResponse.json({ error: 'Missing execution parameters' }, { status: 400 });
        }

        // 1. Fetch the Smart Wallet and its User (+ role)
        const wallet = await prisma.smartWallet.findUnique({
            where: { address: sender },
            include: { user: true }
        });

        if (!wallet || wallet.paymasterStatus !== 'ACTIVE') {
            return NextResponse.json({
                error: 'Sponsorship rejected: Node access suspended or unauthorized',
                code: 'SPONSORSHIP_PAUSED'
            }, { status: 403 });
        }

        // 1b. Action Whitelisting (Phase 5/8)
        const BLACKLISTED_OPERATIONS = ['BULK_IMPORT', 'MASS_UPDATE', 'ANALYTICS_WRITE'];
        if (BLACKLISTED_OPERATIONS.includes(operation || '')) {
            return NextResponse.json({
                error: `Sponsorship rejected: Operation '${operation}' requires manual settlement or high-tier plan`,
                code: 'OPERATION_RESTRICTED'
            }, { status: 403 });
        }

        const user = wallet.user;
        const userRole = user.role || 'USER';
        const userTier = user.merchantTier || 'SMALL';

        // 2. Resolve Multi-Dimensional Gas Policy (Phase 6)
        // Priority: (Role + Tier) > Tier > Role > Default
        let policy = await prisma.gasPolicy.findFirst({
            where: {
                role: userRole,
                merchantTier: userTier,
                isActive: true
            }
        });

        if (!policy) {
            policy = await prisma.gasPolicy.findFirst({
                where: {
                    merchantTier: userTier,
                    isActive: true
                }
            });
        }

        if (!policy) {
            policy = await prisma.gasPolicy.findFirst({
                where: {
                    role: userRole,
                    isActive: true
                }
            });
        }

        // Fail-safe: Create/Use a default policy if none exists
        if (!policy) {
            policy = await prisma.gasPolicy.upsert({
                where: { name: 'Default Fallback Policy' },
                update: {},
                create: {
                    name: 'Default Fallback Policy',
                    role: 'USER',
                    merchantTier: 'SMALL',
                    description: 'System-wide fallback sponsorship',
                    dailyLimitUsd6: 500000, // $0.50 default
                }
            });
        }

        if (!policy.isActive) {
            return NextResponse.json({ error: `Sponsorship rejected: Resolved policy '${policy.name}' is inactive` }, { status: 403 });
        }

        // 3. Quota Management: Check and Reset
        const now = new Date();
        const lastReset = new Date(wallet.lastResetAt);
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        let currentDailySpent = wallet.dailyGasSpentUsd6;

        if (hoursSinceReset >= 24) {
            // Reset quota for the new day
            currentDailySpent = 0;
            await prisma.smartWallet.update({
                where: { id: wallet.id },
                data: {
                    dailyGasSpentUsd6: 0,
                    lastResetAt: now
                }
            });
        }

        // Check if within budget
        if (currentDailySpent >= policy.dailyLimitUsd6) {
            return NextResponse.json({
                error: 'Sponsorship rejected: Daily synchronization quota exceeded',
                limit: policy.dailyLimitUsd6 / 1000000,
                spent: currentDailySpent / 1000000,
                code: 'QUOTA_EXCEEDED'
            }, { status: 429 });
        }

        // 3b. Platform-Level Treasury Cap (Phase 8)
        const PLATFORM_DAILY_CAP_USD6 = 200000000; // $200.00
        const aggregateToday = await prisma.smartWallet.aggregate({
            _sum: { dailyGasSpentUsd6: true }
        });
        const platformTotalUsd6 = aggregateToday._sum.dailyGasSpentUsd6 || 0;

        if (platformTotalUsd6 >= PLATFORM_DAILY_CAP_USD6) {
            return NextResponse.json({
                error: 'Sponsorship rejected: Total platform synchronization allowance reached for today',
                code: 'PLATFORM_CAP_REACHED'
            }, { status: 429 });
        }

        // 4. Create the Transaction Audit record in PENDING state
        const transaction = await prisma.onChainTransaction.create({
            data: {
                smartWallet: { connect: { id: wallet.id } },
                gasPolicy: { connect: { id: policy.id } },
                operation: operation || 'CONTRACT_CALL',
                batchId: batchId || null,
                status: 'PENDING',
                gasSponsored: true,
                metadata: metadata || null,
            }
        });

        console.log(`[PAYMASTER] Sponsoring transaction for ${sender} (${userRole}): ${operation}`);

        /**
         * 5. Orchestration Logic (Simulated for this implementation)
         * In a production environment with Biconomy/Safe:
         * - Use Bundler to send UserOperation
         * - Paymaster signs for gas
         * - Return actual TX Hash
         */

        // Mocking successful execution and gas cost estimation ($0.05 USD = 50,000 USD6)
        const mockTxHash = ethers.id(`${transaction.id}-${Date.now()}`);
        const mockUserOpHash = ethers.id(`userop-${transaction.id}`);
        const estimatedGasUsd6 = 50000;

        // 6. Finalize Audit Record and Update Wallet Quotas
        await prisma.$transaction([
            prisma.onChainTransaction.update({
                where: { id: transaction.id },
                data: {
                    txHash: mockTxHash,
                    userOpHash: mockUserOpHash,
                    status: 'SUCCESS',
                    gasCostUsd6: estimatedGasUsd6,
                    completedAt: new Date()
                }
            }),
            prisma.smartWallet.update({
                where: { id: wallet.id },
                data: {
                    dailyGasSpentUsd6: { increment: estimatedGasUsd6 }
                }
            })
        ]);

        // 7. Synchronize with Private B2B Ledger (Asynchronous Bridge)
        // This ensures the merchant sees the transaction in their private ledger immediately
        settlementSyncService.syncTransaction(transaction.id).catch(err => {
            console.error(`[SYNC-ERROR] Failed to sync transaction ${transaction.id} to ledger:`, err);
        });

        return NextResponse.json({
            success: true,
            txHash: mockTxHash,
            userOpHash: mockUserOpHash,
            gasSponsored: true,
            remainingQuota: (policy.dailyLimitUsd6 - (currentDailySpent + estimatedGasUsd6)) / 1000000
        });

    } catch (error: any) {
        console.error('[PAYMASTER] Execution error:', error);
        return NextResponse.json({
            error: 'Failed to relay transaction',
            details: error.message
        }, { status: 500 });
    }
}

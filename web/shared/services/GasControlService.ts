import { prisma } from '../utils/prisma';

export interface GasStats {
    totalSpentUsd6: number;
    activeWallets: number;
    totalTransactions: number;
    platformDailyLimitUsd6: number;
    topSpenders: {
        userId: string;
        merchantName: string;
        spentUsd6: number;
        quotaUsd6: number;
    }[];
}

export class GasControlService {
    private readonly PLATFORM_DAILY_CAP_USD6 = 200000000; // $200.00 as per Phase 8 requirement

    /**
     * Aggregates platform-wide gas sponsorship statistics
     */
    async getPlatformStats(): Promise<GasStats> {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        // 1. Calculate total spend today across all wallets
        const walletsToday = await prisma.smartWallet.findMany({
            include: {
                user: {
                    include: {
                        supplierProfile: true
                    }
                }
            }
        });

        const totalSpentUsd6 = walletsToday.reduce((sum, w) => sum + w.dailyGasSpentUsd6, 0);
        const activeWallets = walletsToday.filter(w => w.dailyGasSpentUsd6 > 0).length;

        // 2. Count total transactions today
        const totalTransactions = await prisma.onChainTransaction.count({
            where: {
                createdAt: { gte: startOfDay },
                status: 'SUCCESS',
                gasSponsored: true
            }
        });

        // 3. Get Top Spenders
        const topSpenders = walletsToday
            .sort((a, b) => b.dailyGasSpentUsd6 - a.dailyGasSpentUsd6)
            .slice(0, 5)
            .map(w => ({
                userId: w.userId,
                merchantName: w.user.supplierProfile?.companyName || 'Unknown Merchant',
                spentUsd6: w.dailyGasSpentUsd6,
                quotaUsd6: 1000000 // In future, this will be dynamic based on Phase 6 policies
            }));

        return {
            totalSpentUsd6,
            activeWallets,
            totalTransactions,
            platformDailyLimitUsd6: this.PLATFORM_DAILY_CAP_USD6,
            topSpenders
        };
    }

    /**
     * Admin Control: Adjusts a merchant's daily gas quota
     */
    async adjustMerchantQuota(userId: string, newLimitUsd6: number) {
        // Note: Currently, GasPolicy is role-based. Phase 6 will enable per-user overrides.
        // For now, we'll log this as an administrative action.
        console.log(`[ADMIN] Manual quota adjustment for user ${userId}: ${newLimitUsd6} USD6`);

        // Find the user's role to identify the policy (standard logic for now)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        return prisma.gasPolicy.update({
            where: { role: user.role || 'USER' },
            data: { dailyLimitUsd6: newLimitUsd6 }
        });
    }

    /**
     * Admin Control: Pause/Resume sponsorship for a user
     */
    async toggleSponsorship(userId: string, isActive: boolean) {
        console.log(`[ADMIN] Toggling sponsorship for user ${userId} to ${isActive}`);
        return prisma.smartWallet.update({
            where: { userId },
            data: { paymasterStatus: isActive ? 'ACTIVE' : 'PAUSED' }
        });
    }
}

export const gasControlService = new GasControlService();

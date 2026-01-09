import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';

export class SubscriptionSecurityService {
    private rateLimits = new Map<string, { count: number; resetTime: number }>();

    /**
     * Check rate limit for subscription actions
     */
    checkRateLimit(userId: string, action: string, limit: number = 10, windowMs: number = 60000): boolean {
        const key = `${userId}:${action}`;
        const now = Date.now();
        const existing = this.rateLimits.get(key);

        if (!existing || now > existing.resetTime) {
            // Reset or new limit
            this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (existing.count >= limit) {
            return false; // Rate limit exceeded
        }

        existing.count++;
        return true;
    }

    /**
     * Validate subscription ownership
     */
    async validateSubscriptionOwnership(subscriptionId: string, userId: string): Promise<boolean> {
        const subscription = await prisma.customerSubscription.findUnique({
            where: { id: subscriptionId },
            select: { customerId: true }
        });

        return subscription?.customerId === userId;
    }

    /**
     * Validate plan ownership
     */
    async validatePlanOwnership(planId: string, userId: string, userRole?: string): Promise<boolean> {
        if (userRole === 'ADMIN') return true;

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            select: { sellerId: true }
        });

        if (!plan) return false;

        const seller = await prisma.marketplaceSeller.findFirst({
            where: {
                id: plan.sellerId,
                userId: userId
            }
        });

        return !!seller;
    }

    /**
     * Check for subscription abuse patterns
     */
    async checkForAbuse(userId: string): Promise<{ isAbusive: boolean; reason?: string }> {
        // Check recent subscription attempts
        const recentSubscriptions = await prisma.customerSubscription.count({
            where: {
                customerId: userId,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        if (recentSubscriptions > 5) {
            return { isAbusive: true, reason: 'Too many subscriptions in 24 hours' };
        }

        // Check failed payments
        const failedTransactions = await prisma.subscriptionTransaction.count({
            where: {
                subscription: { customerId: userId },
                status: 'FAILED',
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });

        if (failedTransactions > 3) {
            return { isAbusive: true, reason: 'Too many failed payments' };
        }

        // Check for rapid cancellations
        const recentCancellations = await prisma.customerSubscription.count({
            where: {
                customerId: userId,
                cancelledAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });

        if (recentCancellations > 3) {
            return { isAbusive: true, reason: 'Too many cancellations in 24 hours' };
        }

        return { isAbusive: false };
    }

    /**
     * Prevent vendor self-subscription
     */
    async preventVendorSelfSubscription(customerId: string, planId: string): Promise<boolean> {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            select: { sellerId: true }
        });

        if (!plan) return false;

        const seller = await prisma.marketplaceSeller.findUnique({
            where: { id: plan.sellerId },
            select: { userId: true }
        });

        return seller?.userId !== customerId;
    }

    /**
     * Validate subscription limits
     */
    async validateSubscriptionLimits(userId: string, planId: string): Promise<{ valid: boolean; reason?: string }> {
        // Check if plan has subscriber limit
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            select: { maxSubscribers: true, subscriberCount: true }
        });

        if (!plan) {
            return { valid: false, reason: 'Plan not found' };
        }

        if (plan.maxSubscribers && plan.subscriberCount >= plan.maxSubscribers) {
            return { valid: false, reason: 'Plan has reached maximum subscribers' };
        }

        // Check user's total active subscriptions (prevent hoarding)
        const activeSubscriptions = await prisma.customerSubscription.count({
            where: {
                customerId: userId,
                status: 'ACTIVE'
            }
        });

        if (activeSubscriptions >= 10) { // Arbitrary limit
            return { valid: false, reason: 'User has too many active subscriptions' };
        }

        return { valid: true };
    }

    /**
     * Audit subscription actions
     */
    async auditAction(userId: string, action: string, resourceId: string, details?: any) {
        // This would integrate with the existing AuditService
        logger.info(`Subscription audit: User ${userId} performed ${action} on ${resourceId}`, { details });
    }

    /**
     * Clean up rate limit cache (prevent memory leaks)
     */
    cleanupRateLimits() {
        const now = Date.now();
        for (const [key, limit] of this.rateLimits.entries()) {
            if (now > limit.resetTime) {
                this.rateLimits.delete(key);
            }
        }
    }

    /**
     * Get security metrics for monitoring
     */
    getSecurityMetrics() {
        return {
            activeRateLimits: this.rateLimits.size,
            rateLimitEntries: Array.from(this.rateLimits.entries()).map(([key, value]) => ({
                key,
                count: value.count,
                resetIn: Math.max(0, value.resetTime - Date.now())
            }))
        };
    }

    /**
     * Block abusive user temporarily
     */
    async blockUser(userId: string, reason: string, durationMs: number = 24 * 60 * 60 * 1000) {
        // In a real implementation, this would set a flag in the user record
        // For now, we'll just log it
        logger.warn(`User ${userId} blocked for ${durationMs}ms: ${reason}`);

        // Could set a blockedUntil timestamp
        // await prisma.user.update({
        //     where: { id: userId },
        //     data: { blockedUntil: new Date(Date.now() + durationMs) }
        // });
    }

    /**
     * Check if user is blocked
     */
    async isUserBlocked(userId: string): Promise<boolean> {
        // const user = await prisma.user.findUnique({
        //     where: { id: userId },
        //     select: { blockedUntil: true }
        // });
        // return user?.blockedUntil && user.blockedUntil > new Date();

        return false; // Placeholder
    }
}

// Export singleton instance
export const subscriptionSecurityService = new SubscriptionSecurityService();

import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';
import {
    SubscriptionPlanStatus,
    CustomerSubscriptionStatus,
    TransactionStatus,
    TransactionType,
    BillingCycle
} from '@prisma/client';

export class SubscriptionService {
    /**
     * Create a new subscription plan
     */
    async createPlan(sellerId: string, planData: any) {
        const plan = await prisma.subscriptionPlan.create({
            data: {
                sellerId,
                ...planData,
                status: 'DRAFT'
            },
            include: {
                benefits: true
            }
        });

        logger.info(`Created subscription plan ${plan.id} for seller ${sellerId}`);
        return plan;
    }

    /**
     * Update an existing subscription plan
     */
    async updatePlan(planId: string, updates: any) {
        const plan = await prisma.subscriptionPlan.update({
            where: { id: planId },
            data: updates,
            include: {
                benefits: true
            }
        });

        logger.info(`Updated subscription plan ${planId}`);
        return plan;
    }

    /**
     * Publish a subscription plan (make it active)
     */
    async publishPlan(planId: string) {
        const plan = await prisma.subscriptionPlan.update({
            where: { id: planId },
            data: { status: 'ACTIVE' }
        });

        logger.info(`Published subscription plan ${planId}`);
        return plan;
    }

    /**
     * Subscribe a customer to a plan
     */
    async subscribeCustomer(customerId: string, planId: string, paymentMethodId?: string) {
        // Check if already subscribed
        const existing = await prisma.customerSubscription.findUnique({
            where: {
                customerId_planId: {
                    customerId,
                    planId
                }
            }
        });

        if (existing && existing.status === 'ACTIVE') {
            throw new Error('Already subscribed to this plan');
        }

        // Get plan details
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan || plan.status !== 'ACTIVE') {
            throw new Error('Subscription plan not found or inactive');
        }

        // Calculate dates
        const now = new Date();
        const startDate = now;
        const trialEndDate = plan.trialDays > 0 ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000) : null;
        const initialEndDate = plan.billingCycle === 'MONTHLY'
            ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        // Create subscription
        const subscription = await prisma.customerSubscription.create({
            data: {
                customerId,
                planId,
                status: plan.trialDays > 0 ? 'ACTIVE' : 'PENDING',
                startDate,
                endDate: trialEndDate || initialEndDate,
                trialEndDate,
                autoRenew: plan.autoRenew,
                paymentMethodId,
                nextBillingDate: trialEndDate || initialEndDate
            }
        });

        // Create initial transaction if no trial
        if (plan.trialDays === 0) {
            await prisma.subscriptionTransaction.create({
                data: {
                    subscriptionId: subscription.id,
                    amount: plan.price,
                    currency: plan.currency,
                    type: 'SUBSCRIPTION_PAYMENT',
                    status: 'PENDING',
                    periodStart: startDate,
                    periodEnd: initialEndDate,
                    billingCycle: plan.billingCycle
                }
            });
        }

        // Increment subscriber count
        await prisma.subscriptionPlan.update({
            where: { id: planId },
            data: { subscriberCount: { increment: 1 } }
        });

        logger.info(`Customer ${customerId} subscribed to plan ${planId}`);
        return subscription;
    }

    /**
     * Cancel a customer subscription
     */
    async cancelSubscription(subscriptionId: string, customerId: string) {
        const subscription = await prisma.customerSubscription.findFirst({
            where: {
                id: subscriptionId,
                customerId
            }
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (subscription.status === 'CANCELLED') {
            throw new Error('Subscription already cancelled');
        }

        // Update subscription
        await prisma.customerSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                autoRenew: false
            }
        });

        // Decrement subscriber count
        await prisma.subscriptionPlan.update({
            where: { id: subscription.planId },
            data: { subscriberCount: { decrement: 1 } }
        });

        logger.info(`Cancelled subscription ${subscriptionId} for customer ${customerId}`);
    }

    /**
     * Process subscription renewals (called by cron job)
     */
    async processRenewals() {
        const now = new Date();

        // Find subscriptions that need renewal
        const dueSubscriptions = await prisma.customerSubscription.findMany({
            where: {
                status: 'ACTIVE',
                autoRenew: true,
                nextBillingDate: {
                    lte: now
                }
            },
            include: {
                plan: true
            }
        });

        for (const subscription of dueSubscriptions) {
            try {
                await this.renewSubscription(subscription);
            } catch (error) {
                logger.error(`Failed to renew subscription ${subscription.id}:`, error);
                // Mark as past due or suspended based on grace period
                // For now, we'll keep them active but log the failure
            }
        }

        logger.info(`Processed ${dueSubscriptions.length} subscription renewals`);
    }

    /**
     * Renew a specific subscription
     */
    private async renewSubscription(subscription: any) {
        const plan = subscription.plan;
        const now = new Date();

        // Calculate next billing period
        const nextEndDate = plan.billingCycle === 'MONTHLY'
            ? new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(subscription.endDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        // Create renewal transaction
        await prisma.subscriptionTransaction.create({
            data: {
                subscriptionId: subscription.id,
                amount: plan.price,
                currency: plan.currency,
                type: 'RENEWAL',
                status: 'PENDING', // Would be processed by payment system
                periodStart: subscription.endDate,
                periodEnd: nextEndDate,
                billingCycle: plan.billingCycle
            }
        });

        // Update subscription
        await prisma.customerSubscription.update({
            where: { id: subscription.id },
            data: {
                endDate: nextEndDate,
                nextBillingDate: nextEndDate,
                renewalCount: { increment: 1 },
                totalPaid: { increment: plan.price }
            }
        });

        // Update plan's last billed date
        await prisma.customerSubscription.update({
            where: { id: subscription.id },
            data: {
                lastBilledAt: now
            }
        });

        logger.info(`Renewed subscription ${subscription.id}`);
    }

    /**
     * Handle trial conversions
     */
    async processTrialConversions() {
        const now = new Date();

        // Find trials that have ended
        const endedTrials = await prisma.customerSubscription.findMany({
            where: {
                status: 'ACTIVE',
                trialEndDate: {
                    lte: now
                },
                endDate: {
                    gt: now // Still within subscription period
                }
            },
            include: {
                plan: true
            }
        });

        for (const subscription of endedTrials) {
            try {
                await this.convertTrialToPaid(subscription);
            } catch (error) {
                logger.error(`Failed to convert trial for subscription ${subscription.id}:`, error);
                // Could suspend or cancel based on business rules
            }
        }

        logger.info(`Processed ${endedTrials.length} trial conversions`);
    }

    /**
     * Convert trial to paid subscription
     */
    private async convertTrialToPaid(subscription: any) {
        const plan = subscription.plan;

        // Calculate paid period end date
        const paidEndDate = plan.billingCycle === 'MONTHLY'
            ? new Date(subscription.trialEndDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(subscription.trialEndDate.getTime() + 365 * 24 * 60 * 60 * 1000);

        // Create conversion transaction
        await prisma.subscriptionTransaction.create({
            data: {
                subscriptionId: subscription.id,
                amount: plan.price,
                currency: plan.currency,
                type: 'TRIAL_CONVERSION',
                status: 'PENDING',
                periodStart: subscription.trialEndDate,
                periodEnd: paidEndDate,
                billingCycle: plan.billingCycle
            }
        });

        // Update subscription
        await prisma.customerSubscription.update({
            where: { id: subscription.id },
            data: {
                endDate: paidEndDate,
                nextBillingDate: paidEndDate,
                trialEndDate: null, // Clear trial
                totalPaid: { increment: plan.price }
            }
        });

        logger.info(`Converted trial to paid for subscription ${subscription.id}`);
    }

    /**
     * Handle expired subscriptions
     */
    async processExpiredSubscriptions() {
        const now = new Date();

        // Find expired subscriptions
        const expiredSubscriptions = await prisma.customerSubscription.findMany({
            where: {
                status: 'ACTIVE',
                endDate: {
                    lt: now
                }
            }
        });

        for (const subscription of expiredSubscriptions) {
            try {
                await this.expireSubscription(subscription.id);
            } catch (error) {
                logger.error(`Failed to expire subscription ${subscription.id}:`, error);
            }
        }

        logger.info(`Processed ${expiredSubscriptions.length} expired subscriptions`);
    }

    /**
     * Mark subscription as expired
     */
    private async expireSubscription(subscriptionId: string) {
        await prisma.customerSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'EXPIRED'
            }
        });

        // Get plan ID to decrement count
        const subscription = await prisma.customerSubscription.findUnique({
            where: { id: subscriptionId },
            select: { planId: true }
        });

        if (subscription) {
            await prisma.subscriptionPlan.update({
                where: { id: subscription.planId },
                data: { subscriberCount: { decrement: 1 } }
            });
        }

        logger.info(`Expired subscription ${subscriptionId}`);
    }

    /**
     * Get subscription analytics for a seller
     */
    async getAnalytics(sellerId: string) {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { sellerId },
            include: {
                customerSubscriptions: {
                    where: { status: 'ACTIVE' },
                    select: {
                        totalPaid: true,
                        createdAt: true,
                        cancelledAt: true
                    }
                },
                _count: {
                    select: { customerSubscriptions: true }
                }
            }
        });

        const totalRevenue = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.reduce((planSum, sub) => planSum + Number(sub.totalPaid), 0), 0
        );

        const activeSubscribers = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.length, 0
        );

        const totalSubscribers = plans.reduce((sum, plan) => sum + plan._count.customerSubscriptions, 0);

        // Calculate churn rate (simplified)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const cancelledLastMonth = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.filter(sub => sub.cancelledAt && sub.cancelledAt >= thirtyDaysAgo).length, 0
        );

        const churnRate = totalSubscribers > 0 ? (cancelledLastMonth / totalSubscribers) * 100 : 0;

        const planStats = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            subscriberCount: plan.subscriberCount,
            activeSubscribers: plan.customerSubscriptions.length,
            revenue: plan.customerSubscriptions.reduce((sum, sub) => sum + Number(sub.totalPaid), 0),
            createdAt: plan.createdAt.toISOString()
        }));

        return {
            plans: planStats,
            totalRevenue,
            totalSubscribers,
            activeSubscribers,
            churnRate: Math.round(churnRate * 100) / 100
        };
    }

    /**
     * Validate subscription access for a customer
     */
    async validateSubscriptionAccess(customerId: string, planId: string): Promise<boolean> {
        const subscription = await prisma.customerSubscription.findFirst({
            where: {
                customerId,
                planId,
                status: 'ACTIVE',
                OR: [
                    { endDate: { gte: new Date() } },
                    { trialEndDate: { gte: new Date() } }
                ]
            }
        });

        return !!subscription;
    }

    /**
     * Get customer's active subscriptions
     */
    async getCustomerSubscriptions(customerId: string) {
        return await prisma.customerSubscription.findMany({
            where: { customerId },
            include: {
                plan: {
                    include: {
                        seller: {
                            include: {
                                restaurant: { select: { name: true } },
                                user: { select: { firstName: true, lastName: true } }
                            }
                        },
                        benefits: { where: { isActive: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Clean up old data (cancelled/expired subscriptions older than 1 year)
     */
    async cleanupOldData() {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

        const deletedCount = await prisma.customerSubscription.deleteMany({
            where: {
                OR: [
                    {
                        status: 'CANCELLED',
                        cancelledAt: { lt: oneYearAgo }
                    },
                    {
                        status: 'EXPIRED',
                        endDate: { lt: oneYearAgo }
                    }
                ]
            }
        });

        logger.info(`Cleaned up ${deletedCount.count} old subscriptions`);
    }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

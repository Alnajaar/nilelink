import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { authenticate } from '../../middleware/authenticate';
import { UserRole } from '@prisma/client';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSubscriptionPlanSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
    richDescription: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    bannerUrl: z.string().url().optional().or(z.literal('')),
    price: z.number().positive("Price must be positive"),
    currency: z.string().default("USD"),
    billingCycle: z.enum(['MONTHLY', 'YEARLY', 'CUSTOM']),
    trialDays: z.number().int().min(0).max(365).default(0),
    maxSubscribers: z.number().int().positive().optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
    inviteCode: z.string().optional(),
    autoRenew: z.boolean().default(true),
    cancellationRules: z.record(z.any()).optional(),
    features: z.array(z.string()).default([]),
});

const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

const createBenefitSchema = z.object({
    type: z.enum(['DISCOUNT', 'FREE_DELIVERY', 'EARLY_ACCESS', 'EXCLUSIVE_ITEM', 'CUSTOM']),
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().optional(),
    value: z.record(z.any()).optional(),
});

const subscribeToPlanSchema = z.object({
    paymentMethodId: z.string().optional(), // For future payment integration
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user has permission to manage subscriptions for a seller
 */
async function canManageSubscriptions(userId: string, sellerId?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user) return false;

    // Admins can manage all subscriptions
    if (user.role === UserRole.ADMIN) return true;

    // Vendors can manage their own subscriptions
    if (sellerId) {
        const marketplaceSeller = await prisma.marketplaceSeller.findFirst({
            where: {
                userId: userId,
                id: sellerId
            }
        });
        return !!marketplaceSeller;
    }

    // Check if user is a marketplace seller (vendor)
    const marketplaceSeller = await prisma.marketplaceSeller.findUnique({
        where: { userId }
    });
    return !!marketplaceSeller;
}

/**
 * Get seller ID for the current user
 */
async function getSellerId(userId: string): Promise<string | null> {
    const seller = await prisma.marketplaceSeller.findUnique({
        where: { userId },
        select: { id: true }
    });
    return seller?.id || null;
}

// ============================================================================
// PUBLIC ENDPOINTS (Customer Discovery)
// ============================================================================

/**
 * GET /api/subscriptions/marketplace
 * Get all public subscription plans with filtering
 */
router.get('/marketplace', async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            billingCycle,
            sortBy = 'POPULARITY',
            page = 1,
            limit = 20
        } = req.query;

        const where: any = {
            visibility: 'PUBLIC',
            status: 'ACTIVE'
        };

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // Price filters
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }

        // Billing cycle filter
        if (billingCycle) {
            where.billingCycle = billingCycle;
        }

        // Category filter (if implemented later)
        // if (category) {
        //     // This would require adding category to SubscriptionPlan model
        // }

        let orderBy: any = { createdAt: 'desc' };
        switch (sortBy) {
            case 'PRICE_LOW':
                orderBy = { price: 'asc' };
                break;
            case 'PRICE_HIGH':
                orderBy = { price: 'desc' };
                break;
            case 'NEWEST':
                orderBy = { createdAt: 'desc' };
                break;
            case 'POPULARITY':
                orderBy = { subscriberCount: 'desc' };
                break;
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where,
            include: {
                seller: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                        restaurant: { select: { name: true } }
                    }
                },
                benefits: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' }
                },
                _count: {
                    select: { customerSubscriptions: true }
                }
            },
            orderBy,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        // Transform response to hide sensitive data
        const transformedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            richDescription: plan.richDescription,
            logoUrl: plan.logoUrl,
            bannerUrl: plan.bannerUrl,
            price: plan.price,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            trialDays: plan.trialDays,
            subscriberCount: plan.subscriberCount,
            seller: {
                name: plan.seller.restaurant?.name ||
                    `${plan.seller.user.firstName} ${plan.seller.user.lastName}`.trim() ||
                    'Verified Seller'
            },
            benefits: plan.benefits.map(b => ({
                type: b.type,
                title: b.title,
                description: b.description,
                value: b.value
            })),
            totalSubscribers: plan._count.customerSubscriptions
        }));

        const total = await prisma.subscriptionPlan.count({ where });

        res.json({
            success: true,
            data: {
                plans: transformedPlans,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Failed to fetch subscription marketplace', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/subscriptions/:id
 * Get detailed subscription plan info
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            include: {
                seller: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                        restaurant: { select: { name: true, description: true } }
                    }
                },
                benefits: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' }
                },
                _count: {
                    select: { customerSubscriptions: true }
                }
            }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        // Check visibility permissions
        if (plan.visibility === 'PRIVATE') {
            // For private plans, only return if user is authenticated and has access
            // This is a simplified check - in production, you'd check invite codes, etc.
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(404).json({ success: false, error: 'Subscription plan not found' });
            }
        }

        const transformedPlan = {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            richDescription: plan.richDescription,
            logoUrl: plan.logoUrl,
            bannerUrl: plan.bannerUrl,
            price: plan.price,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            trialDays: plan.trialDays,
            subscriberCount: plan.subscriberCount,
            seller: {
                name: plan.seller.restaurant?.name ||
                    `${plan.seller.user.firstName} ${plan.seller.user.lastName}`.trim(),
                description: plan.seller.restaurant?.description
            },
            benefits: plan.benefits.map(b => ({
                type: b.type,
                title: b.title,
                description: b.description,
                value: b.value
            })),
            totalSubscribers: plan._count.customerSubscriptions
        };

        res.json({ success: true, data: transformedPlan });
    } catch (error) {
        logger.error('Failed to fetch subscription plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// AUTHENTICATED CUSTOMER ENDPOINTS
// ============================================================================

/**
 * POST /api/subscriptions/:id/subscribe
 * Subscribe to a subscription plan
 */
router.post('/:id/subscribe', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethodId } = subscribeToPlanSchema.parse(req.body);
        const userId = (req as any).user.userId;

        // Check if plan exists and is active
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id, status: 'ACTIVE' }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found or inactive' });
        }

        // Check if user is already subscribed
        const existingSubscription = await prisma.customerSubscription.findUnique({
            where: {
                customerId_planId: {
                    customerId: userId,
                    planId: id
                }
            }
        });

        if (existingSubscription && existingSubscription.status === 'ACTIVE') {
            return res.status(400).json({ success: false, error: 'Already subscribed to this plan' });
        }

        // Calculate subscription dates
        const now = new Date();
        const startDate = now;
        const trialEndDate = plan.trialDays > 0 ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000) : null;
        const initialEndDate = plan.billingCycle === 'MONTHLY'
            ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        // Create subscription
        const subscription = await prisma.customerSubscription.create({
            data: {
                customerId: userId,
                planId: id,
                status: plan.trialDays > 0 ? 'ACTIVE' : 'PENDING', // Pending until payment confirmed
                startDate,
                endDate: trialEndDate || initialEndDate,
                trialEndDate,
                autoRenew: plan.autoRenew,
                paymentMethodId,
                nextBillingDate: trialEndDate || initialEndDate,
                totalPaid: 0
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
                    status: 'PENDING', // Would be completed by payment processor
                    periodStart: startDate,
                    periodEnd: initialEndDate,
                    billingCycle: plan.billingCycle
                }
            });
        }

        // Increment subscriber count
        await prisma.subscriptionPlan.update({
            where: { id },
            data: { subscriberCount: { increment: 1 } }
        });

        res.status(201).json({
            success: true,
            data: {
                subscriptionId: subscription.id,
                status: subscription.status,
                trialEndsAt: trialEndDate?.toISOString(),
                nextBillingDate: subscription.nextBillingDate?.toISOString()
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to subscribe to plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/subscriptions/my-subscriptions
 * Get user's active subscriptions
 */
router.get('/my-subscriptions', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user.userId;

        const subscriptions = await prisma.customerSubscription.findMany({
            where: { customerId: userId },
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

        const transformedSubscriptions = subscriptions.map(sub => ({
            id: sub.id,
            status: sub.status,
            startDate: sub.startDate,
            endDate: sub.endDate,
            trialEndDate: sub.trialEndDate,
            nextBillingDate: sub.nextBillingDate,
            autoRenew: sub.autoRenew,
            totalPaid: sub.totalPaid,
            renewalCount: sub.renewalCount,
            plan: {
                id: sub.plan.id,
                name: sub.plan.name,
                price: sub.plan.price,
                currency: sub.plan.currency,
                billingCycle: sub.plan.billingCycle,
                seller: {
                    name: sub.plan.seller.restaurant?.name ||
                        `${sub.plan.seller.user.firstName} ${sub.plan.seller.user.lastName}`.trim()
                },
                benefits: sub.plan.benefits.map(b => ({
                    type: b.type,
                    title: b.title,
                    description: b.description
                }))
            }
        }));

        res.json({ success: true, data: transformedSubscriptions });
    } catch (error) {
        logger.error('Failed to fetch user subscriptions', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/subscriptions/:id/cancel
 * Cancel user's subscription
 */
router.post('/:id/cancel', authenticate, async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const userId = (req as any).user.userId;

        const subscription = await prisma.customerSubscription.findFirst({
            where: {
                id: subscriptionId,
                customerId: userId
            }
        });

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        if (subscription.status === 'CANCELLED') {
            return res.status(400).json({ success: false, error: 'Subscription already cancelled' });
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

        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        logger.error('Failed to cancel subscription', { error, subscriptionId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================================================
// VENDOR/ADMIN ENDPOINTS (Subscription Management)
// ============================================================================

/**
 * POST /api/subscriptions/plans
 * Create a new subscription plan (Vendor/Admin only)
 */
router.post('/plans', authenticate, async (req, res) => {
    try {
        const data = createSubscriptionPlanSchema.parse(req.body);
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        // Check permissions
        if (!(await canManageSubscriptions(userId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Vendor or Admin access required.' });
        }

        // Get seller ID
        let sellerId = data.sellerId; // Allow admin to specify seller ID
        if (userRole !== UserRole.ADMIN) {
            sellerId = await getSellerId(userId);
            if (!sellerId) {
                return res.status(403).json({ success: false, error: 'Not a registered seller' });
            }
        } else if (!sellerId) {
            sellerId = await getSellerId(userId); // Default to current user's seller if admin
        }

        if (!sellerId) {
            return res.status(400).json({ success: false, error: 'Seller ID required' });
        }

        // Create the plan
        const plan = await prisma.subscriptionPlan.create({
            data: {
                ...data,
                sellerId,
                status: 'DRAFT', // Start as draft, vendor can publish later
                cancellationRules: data.cancellationRules || {},
                features: data.features || []
            },
            include: {
                seller: {
                    include: {
                        restaurant: { select: { name: true } }
                    }
                }
            }
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to create subscription plan', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/subscriptions/plans
 * Get subscription plans for the current vendor (Vendor/Admin only)
 */
router.get('/plans', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        if (!(await canManageSubscriptions(userId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Vendor or Admin access required.' });
        }

        let where: any = {};

        if (userRole !== UserRole.ADMIN) {
            const sellerId = await getSellerId(userId);
            if (!sellerId) {
                return res.json({ success: true, data: [] });
            }
            where.sellerId = sellerId;
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where,
            include: {
                benefits: { orderBy: { displayOrder: 'asc' } },
                _count: {
                    select: { customerSubscriptions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: plans });
    } catch (error) {
        logger.error('Failed to fetch subscription plans', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * PUT /api/subscriptions/plans/:id
 * Update a subscription plan (Owner/Admin only)
 */
router.put('/plans/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const data = updateSubscriptionPlanSchema.parse(req.body);
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        // Get the plan and check ownership
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            select: { sellerId: true }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        if (!(await canManageSubscriptions(userId, plan.sellerId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Plan owner or Admin access required.' });
        }

        // Update the plan
        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id },
            data,
            include: {
                benefits: { orderBy: { displayOrder: 'asc' } },
                _count: {
                    select: { customerSubscriptions: true }
                }
            }
        });

        res.json({ success: true, data: updatedPlan });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to update subscription plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * DELETE /api/subscriptions/plans/:id
 * Delete a subscription plan (Owner/Admin only)
 */
router.delete('/plans/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        // Get the plan and check ownership
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            select: { sellerId: true, subscriberCount: true }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        if (!(await canManageSubscriptions(userId, plan.sellerId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Plan owner or Admin access required.' });
        }

        if (plan.subscriberCount > 0) {
            return res.status(400).json({ success: false, error: 'Cannot delete plan with active subscribers' });
        }

        // Delete the plan (cascade will handle benefits)
        await prisma.subscriptionPlan.delete({ where: { id } });

        res.json({ success: true, message: 'Subscription plan deleted successfully' });
    } catch (error) {
        logger.error('Failed to delete subscription plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/subscriptions/plans/:id/publish
 * Publish a subscription plan (Owner/Admin only)
 */
router.post('/plans/:id/publish', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        // Get the plan and check ownership
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            select: { sellerId: true, status: true }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        if (!(await canManageSubscriptions(userId, plan.sellerId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Plan owner or Admin access required.' });
        }

        if (plan.status === 'ACTIVE') {
            return res.status(400).json({ success: false, error: 'Plan is already published' });
        }

        // Publish the plan
        await prisma.subscriptionPlan.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        res.json({ success: true, message: 'Subscription plan published successfully' });
    } catch (error) {
        logger.error('Failed to publish subscription plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/subscriptions/plans/:id/benefits
 * Add benefit to subscription plan (Owner/Admin only)
 */
router.post('/plans/:id/benefits', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const benefitData = createBenefitSchema.parse(req.body);
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        // Check ownership
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            select: { sellerId: true }
        });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        if (!(await canManageSubscriptions(userId, plan.sellerId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Plan owner or Admin access required.' });
        }

        // Get max display order for this plan
        const maxOrder = await prisma.subscriptionBenefit.aggregate({
            where: { planId: id },
            _max: { displayOrder: true }
        });

        const benefit = await prisma.subscriptionBenefit.create({
            data: {
                planId: id,
                ...benefitData,
                displayOrder: (maxOrder._max.displayOrder || 0) + 1
            }
        });

        res.status(201).json({ success: true, data: benefit });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        }
        logger.error('Failed to add benefit to plan', { error, planId: req.params.id });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/subscriptions/analytics
 * Get subscription analytics for vendor dashboard (Vendor/Admin only)
 */
router.get('/analytics', authenticate, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        if (!(await canManageSubscriptions(userId))) {
            return res.status(403).json({ success: false, error: 'Unauthorized. Vendor or Admin access required.' });
        }

        let sellerFilter: any = {};
        if (userRole !== UserRole.ADMIN) {
            const sellerId = await getSellerId(userId);
            if (!sellerId) {
                return res.json({ success: true, data: { plans: [], revenue: 0, churnRate: 0 } });
            }
            sellerFilter.sellerId = sellerId;
        }

        // Get plans and their stats
        const plans = await prisma.subscriptionPlan.findMany({
            where: sellerFilter,
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

        // Calculate analytics
        const totalRevenue = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.reduce((planSum, sub) => planSum + Number(sub.totalPaid), 0), 0
        );

        const activeSubscribers = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.length, 0
        );

        // Simple churn rate calculation (cancelled in last 30 days / total subscribers)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const cancelledLastMonth = plans.reduce((sum, plan) =>
            sum + plan.customerSubscriptions.filter(sub => sub.cancelledAt && sub.cancelledAt >= thirtyDaysAgo).length, 0
        );

        const churnRate = activeSubscribers > 0 ? (cancelledLastMonth / activeSubscribers) * 100 : 0;

        const planStats = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            subscriberCount: plan.subscriberCount,
            activeSubscribers: plan.customerSubscriptions.length,
            revenue: plan.customerSubscriptions.reduce((sum, sub) => sum + Number(sub.totalPaid), 0),
            createdAt: plan.createdAt
        }));

        res.json({
            success: true,
            data: {
                plans: planStats,
                totalRevenue,
                totalSubscribers: plans.reduce((sum, p) => sum + p.subscriberCount, 0),
                activeSubscribers,
                churnRate: Math.round(churnRate * 100) / 100
            }
        });
    } catch (error) {
        logger.error('Failed to fetch subscription analytics', { error });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;

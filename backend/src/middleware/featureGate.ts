import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/DatabasePoolService';
import { logger } from '../utils/logger';

/**
 * Feature Gate Middleware
 * Ensures the tenant/user has an active subscription that includes the required feature.
 */
export const requireFeature = (featureToken: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                return res.status(403).json({
                    success: false,
                    error: 'Ecosystem identifying failed. Tenant context required for this feature.',
                    code: 'TENANT_REQUIRED'
                });
            }

            // 1. Fetch active subscription(s) for this tenant
            // Note: In our current schema, subscriptions are linked to users (customerId). 
            // In a pro environment, they should be linked to the Tenant OR we check the owner's subscription.

            // For now, we assume the owner's subscription governs the tenant.
            // Let's find the ADMIN of this tenant.
            const owner = await prisma.user.findFirst({
                where: {
                    tenantId,
                    role: 'ADMIN' as any
                },
                select: { id: true }
            });

            if (!owner) {
                return res.status(403).json({
                    success: false,
                    error: 'Tenant owner not found. Access denied.',
                    code: 'OWNER_NOT_FOUND'
                });
            }

            const subscription = await prisma.customerSubscription.findFirst({
                where: {
                    customerId: owner.id,
                    status: 'ACTIVE',
                    OR: [
                        { endDate: { gte: new Date() } },
                        { trialEndDate: { gte: new Date() } }
                    ]
                },
                include: {
                    plan: true
                }
            });

            if (!subscription) {
                return res.status(402).json({
                    success: false,
                    error: 'An active subscription is required to access this protocol.',
                    code: 'SUBSCRIPTION_REQUIRED',
                    requiredFeature: featureToken
                });
            }

            // 2. Check if the plan includes the required feature
            const features = (subscription.plan as any).features || [];

            if (!features.includes(featureToken) && !features.includes('*')) {
                return res.status(403).json({
                    success: false,
                    error: `The '${featureToken}' protocol is not enabled for your current tier.`,
                    code: 'FEATURE_NOT_IN_PLAN',
                    requiredFeature: featureToken,
                    currentPlan: subscription.plan.name
                });
            }

            // User has access
            next();

        } catch (error) {
            logger.error('Feature Gate Error:', error);
            res.status(500).json({ success: false, error: 'Neural gate failure' });
        }
    };
};

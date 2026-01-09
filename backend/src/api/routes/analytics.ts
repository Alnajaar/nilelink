import { Router } from 'express';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { extractTenant } from '../../middleware/tenantContext';

import { requireFeature } from '../../middleware/featureGate';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard',
    extractTenant,
    authenticate,
    requireFeature('analytics_pro'),
    async (req, res) => {
        try {
            const tenantId = req.tenantId; // context-aware

            const [totalOrders, revenueAgg, activeUsers, activeRestaurants] = await prisma.$transaction([
                prisma.order.count({ where: { restaurant: { tenantId } } }),
                prisma.order.aggregate({
                    _sum: { totalAmount: true },
                    where: { restaurant: { tenantId }, status: { in: ['DELIVERED'] } }
                }),
                prisma.user.count({ where: { tenantId, isActive: true } }),
                prisma.restaurant.count({ where: { tenantId, isActive: true } })
            ]);

            res.json({
                success: true,
                data: {
                    totalOrders,
                    totalRevenue: revenueAgg._sum.totalAmount || 0,
                    activeUsers,
                    activeRestaurants,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
        }
    }
);

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { auditService } from '../services/AuditService';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// SUPER ADMIN ROUTES (System-wide management)
// ============================================================================

/**
 * GET /api/admin/tenants
 * List all tenants (Super Admin only)
 */
router.get('/tenants',
    authenticate,
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { plan, isActive } = req.query;

            const where: any = {};
            if (plan) where.plan = plan;
            if (isActive !== undefined) where.isActive = isActive === 'true';

            const tenants = await prisma.tenant.findMany({
                where,
                include: {
                    settings: true,
                    _count: {
                        select: {
                            users: true,
                            restaurants: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });

            res.json({
                success: true,
                data: tenants
            });
        } catch (error) {
            console.error('List tenants error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tenants'
            });
        }
    }
);

/**
 * PUT /api/admin/tenants/:id/status
 * Enable/disable tenant
 */
router.put('/tenants/:id/status',
    authenticate,
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;

            const tenant = await prisma.tenant.update({
                where: { id },
                data: { isActive }
            });

            await auditService.logFromRequest(
                req,
                isActive ? 'TENANT_ENABLED' : 'TENANT_DISABLED',
                'Tenant',
                id
            );

            res.json({
                success: true,
                data: tenant
            });
        } catch (error) {
            console.error('Update tenant status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update tenant status'
            });
        }
    }
);

/**
 * GET /api/admin/analytics
 * System-wide analytics
 */
router.get('/analytics',
    authenticate,
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const [
                totalTenants,
                activeTenants,
                trialTenants,
                totalUsers,
                totalOrders,
                revenueStats
            ] = await Promise.all([
                prisma.tenant.count(),
                prisma.tenant.count({ where: { isActive: true } }),
                prisma.tenant.count({ where: { plan: 'TRIAL', isActive: true } }),
                prisma.user.count(),
                prisma.order.count(),
                prisma.order.aggregate({
                    _sum: { totalAmount: true },
                    _avg: { totalAmount: true },
                })
            ]);

            res.json({
                success: true,
                data: {
                    tenants: {
                        total: totalTenants,
                        active: activeTenants,
                        trial: trialTenants,
                    },
                    users: {
                        total: totalUsers,
                    },
                    orders: {
                        total: totalOrders,
                        totalRevenue: revenueStats._sum.totalAmount || 0,
                        averageOrderValue: revenueStats._avg.totalAmount || 0,
                    }
                }
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch analytics'
            });
        }
    }
);

/**
 * GET /api/admin/audit-logs
 * View system-wide audit logs
 */
router.get('/audit-logs',
    authenticate,
    requireRole('ADMIN'),
    async (req: Request, res: Response) => {
        try {
            const { tenantId, userId, action, limit } = req.query;

            const logs = await auditService.query({
                tenantId: tenantId as string,
                userId: userId as string,
                action: action as string,
                limit: limit ? parseInt(limit as string) : 100,
            });

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Audit logs error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch audit logs'
            });
        }
    }
);

export default router;

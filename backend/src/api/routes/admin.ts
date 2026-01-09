import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/authorize';
import { logger } from '../../utils/logger';

const router = Router();

// ============================================================================
// USER APPROVALS & ADMIN MANAGEMENT
// ============================================================================

const GetPendingUsersSchema = z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
    status: z.enum(['pending_verification', 'pending_approval', 'approved', 'rejected', 'suspended']).optional(),
    sortBy: z.enum(['registeredAt', 'businessName', 'email']).default('registeredAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * GET /api/admin/users/pending
 * Get pending user approvals for super admin review
 */
router.get('/users/pending', authenticate, requirePermission('ADMIN', 'READ'), async (req, res) => {
    try {
        const validatedData = GetPendingUsersSchema.parse(req.query);
        const { limit, offset, status, sortBy, sortOrder } = validatedData;

        // Only admins can access this endpoint
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const where: any = {};
        if (status) {
            where.status = status;
        } else {
            // Default to pending statuses
            where.status = { in: ['pending_verification', 'pending_approval'] };
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    tenant: {
                        select: { id: true, name: true, subdomain: true }
                    },
                    customerProfile: true,
                    staffProfile: true
                },
                orderBy: { [sortBy]: sortOrder },
                take: limit,
                skip: offset
            }),
            prisma.user.count({ where })
        ]);

        // Transform users for frontend
        const transformedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.tenant?.name || null,
            selectedPlan: user.tenant?.plan || null,
            status: user.isActive ? 'pending_approval' : 'pending_verification',
            registeredAt: user.createdAt.toISOString(),
            verified: {
                email: user.isVerified,
                phone: !!user.phone, // Simplified - in real impl check phone verification
                wallet: !!user.walletAddress
            },
            tenant: user.tenant
        }));

        res.json({
            success: true,
            data: {
                users: transformedUsers,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get pending users', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve pending users'
        });
    }
});

/**
 * POST /api/admin/users/:userId/approve
 * Approve a pending user registration
 */
router.post('/users/:userId/approve', authenticate, requirePermission('ADMIN', 'MANAGE'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { notes } = req.body;

        // Verify admin access
        const adminUser = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get user to approve
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: true,
                isVerified: true, // Auto-verify on approval
                updatedAt: new Date()
            }
        });

        // Log approval
        await prisma.systemConfig.create({
            data: {
                key: `user_approval_${userId}_${Date.now()}`,
                value: JSON.stringify({
                    action: 'APPROVED',
                    approvedBy: adminUser.id,
                    approvedAt: new Date().toISOString(),
                    notes: notes || '',
                    userId,
                    tenantId: user.tenantId
                }),
                description: 'User approval audit log'
            }
        });

        // Send welcome email (would integrate with email service)
        logger.info('User approved successfully', {
            userId,
            email: user.email,
            approvedBy: adminUser.email
        });

        res.json({
            success: true,
            message: 'User approved successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        logger.error('Failed to approve user', { userId: req.params.userId, error });
        res.status(500).json({
            success: false,
            error: 'Failed to approve user'
        });
    }
});

/**
 * POST /api/admin/users/:userId/reject
 * Reject a pending user registration
 */
router.post('/users/:userId/reject', authenticate, requirePermission('ADMIN', 'MANAGE'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason, notes } = req.body;

        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason must be at least 10 characters'
            });
        }

        // Verify admin access
        const adminUser = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Get user to reject
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                updatedAt: new Date()
            }
        });

        // Log rejection
        await prisma.systemConfig.create({
            data: {
                key: `user_rejection_${userId}_${Date.now()}`,
                value: JSON.stringify({
                    action: 'REJECTED',
                    rejectedBy: adminUser.id,
                    rejectedAt: new Date().toISOString(),
                    reason,
                    notes: notes || '',
                    userId,
                    tenantId: user.tenantId
                }),
                description: 'User rejection audit log'
            }
        });

        // Send rejection notification (would integrate with email service)
        logger.info('User rejected', {
            userId,
            email: user.email,
            reason,
            rejectedBy: adminUser.email
        });

        res.json({
            success: true,
            message: 'User rejected successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        logger.error('Failed to reject user', { userId: req.params.userId, error });
        res.status(500).json({
            success: false,
            error: 'Failed to reject user'
        });
    }
});

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', authenticate, requirePermission('ADMIN', 'READ'), async (req, res) => {
    try {
        const [totalUsers, activeUsers, pendingUsers, totalTenants, activeTenants, totalOrders, totalRevenue] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.count({ where: { isActive: false } }),
            prisma.tenant.count(),
            prisma.tenant.count({ where: { isActive: true } }),
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { totalAmount: true }
            })
        ]);

        const stats = {
            users: {
                total: totalUsers,
                active: activeUsers,
                pending: pendingUsers
            },
            tenants: {
                total: totalTenants,
                active: activeTenants
            },
            orders: {
                total: totalOrders,
                revenue: Number(totalRevenue._sum.totalAmount || 0)
            }
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Failed to get admin stats', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve admin statistics'
        });
    }
});

/**
 * GET /api/admin/tenants
 * Get all tenants for admin management
 */
router.get('/tenants', authenticate, requirePermission('ADMIN', 'READ'), async (req, res) => {
    try {
        const { limit = '50', offset = '0', status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Verify admin access
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const where: any = {};
        if (status) {
            where.isActive = status === 'active';
        }

        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            users: true,
                            restaurants: true
                        }
                    }
                },
                orderBy: sortBy === 'createdAt' ? { createdAt: sortOrder } : { name: sortOrder },
                take: parseInt(limit as string),
                skip: parseInt(offset as string)
            }),
            prisma.tenant.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                tenants,
                pagination: {
                    total,
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    hasMore: parseInt(offset as string) + parseInt(limit as string) < total
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get tenants', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tenants'
        });
    }
});

/**
 * GET /api/admin/audit-log
 * Get admin audit log
 */
router.get('/audit-log', authenticate, requirePermission('ADMIN', 'READ'), async (req, res) => {
    try {
        const { limit = '50', offset = '0', action, userId } = req.query;

        const where: any = {
            OR: [
                { key: { startsWith: 'user_approval_' } },
                { key: { startsWith: 'user_rejection_' } },
                { key: { startsWith: 'tenant_' } }
            ]
        };

        if (action) {
            where.key = { startsWith: `${action}_` };
        }

        const auditLogs = await prisma.systemConfig.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string)
        });

        const formattedLogs = auditLogs.map(log => {
            const data = JSON.parse(log.value as string);
            return {
                id: log.id,
                action: data.action,
                performedBy: data.approvedBy || data.rejectedBy || data.performedBy,
                affectedUserId: data.userId,
                details: data,
                timestamp: log.updatedAt.toISOString(),
                description: log.description
            };
        });

        res.json({
            success: true,
            data: {
                logs: formattedLogs,
                pagination: {
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    hasMore: formattedLogs.length === parseInt(limit as string)
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get audit log', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve audit log'
        });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { extractTenant } from '../../middleware/tenantContext';
import { requirePermission } from '../../middleware/authorize';
import { logger } from '../../utils/logger';

const router = Router();

// ============================================================================
// SHIFT MANAGEMENT ROUTES
// ============================================================================

const OpenShiftSchema = z.object({
    restaurantId: z.string(),
    openingCash: z.number().min(0),
});

/**
 * POST /api/shifts/open
 * Open a new shift (Cashier permission required)
 */
router.post('/open',
    extractTenant,
    authenticate,
    requirePermission('SHIFT', 'CREATE'),
    async (req: Request, res: Response) => {
        try {
            const data = OpenShiftSchema.parse(req.body);

            // Check if user has open shift
            const existingShift = await prisma.shift.findFirst({
                where: {
                    userId: req.user!.id,
                    closedAt: null,
                }
            });

            if (existingShift) {
                return res.status(409).json({
                    success: false,
                    error: 'You already have an open shift. Please close it first.'
                });
            }

            const shift = await prisma.shift.create({
                data: {
                    userId: req.user!.id,
                    restaurantId: data.restaurantId,
                    openingCash: data.openingCash,
                }
            });

            res.status(201).json({
                success: true,
                data: shift
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Open shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to open shift'
            });
        }
    }
);

const CloseShiftSchema = z.object({
    closingCash: z.number().min(0),
    notes: z.string().optional(),
});

/**
 * PUT /api/shifts/:id/close
 * Close an open shift
 */
router.put('/:id/close',
    extractTenant,
    authenticate,
    requirePermission('SHIFT', 'UPDATE'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = CloseShiftSchema.parse(req.body);

            const shift = await prisma.shift.findUnique({
                where: { id }
            });

            if (!shift) {
                return res.status(404).json({
                    success: false,
                    error: 'Shift not found'
                });
            }

            if (shift.userId !== req.user!.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Can only close your own shift'
                });
            }

            if (shift.closedAt) {
                return res.status(409).json({
                    success: false,
                    error: 'Shift already closed'
                });
            }

            // Calculate expected cash from orders
            const orders = await prisma.order.findMany({
                where: {
                    restaurantId: shift.restaurantId,
                    paymentMethod: 'CASH',
                    createdAt: {
                        gte: shift.openedAt,
                    }
                }
            });

            const totalCashSales = orders.reduce((sum, order) =>
                sum + Number(order.totalAmount), 0
            );

            const expectedCash = Number(shift.openingCash) + totalCashSales;
            const variance = data.closingCash - expectedCash;

            const updatedShift = await prisma.shift.update({
                where: { id },
                data: {
                    closedAt: new Date(),
                    closingCash: data.closingCash,
                    expectedCash,
                    variance,
                    cashSales: totalCashSales,
                    notes: data.notes,
                }
            });

            res.json({
                success: true,
                data: updatedShift,
                needsApproval: Math.abs(variance) > 5 // Flag if variance > $5
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Close shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to close shift'
            });
        }
    }
);

/**
 * PUT /api/shifts/:id/approve
 * Manager approves shift variance (Manager permission required)
 */
router.put('/:id/approve',
    extractTenant,
    authenticate,
    requirePermission('SHIFT', 'APPROVE'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const shift = await prisma.shift.update({
                where: { id },
                data: {
                    approvedBy: req.user!.id,
                    approvedAt: new Date(),
                }
            });

            res.json({
                success: true,
                data: shift
            });
        } catch (error: any) {
            logger.error('Approve shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to approve shift'
            });
        }
    }
);

/**
 * GET /api/shifts
 * List shifts with filtering
 */
router.get('/',
    extractTenant,
    authenticate,
    requirePermission('SHIFT', 'READ'),
    async (req: Request, res: Response) => {
        try {
            const { restaurantId, userId, status } = req.query;

            const where: any = {};
            if (restaurantId) where.restaurantId = restaurantId;
            if (userId) where.userId = userId;
            if (status === 'open') where.closedAt = null;
            if (status === 'closed') where.closedAt = { not: null };
            if (status === 'needs_approval') {
                where.closedAt = { not: null };
                where.approvedAt = null;
                where.variance = { not: 0 };
            }

            const shifts = await prisma.shift.findMany({
                where,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    }
                },
                orderBy: { openedAt: 'desc' },
                take: 50,
            });

            res.json({
                success: true,
                data: shifts
            });
        } catch (error) {
            logger.error('List shifts error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch shifts'
            });
        }
    }
);

/**
 * GET /api/shifts/:id
 * Get shift by ID
 */
router.get('/:id',
    extractTenant,
    authenticate,
    requirePermission('SHIFT', 'READ'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const shift = await prisma.shift.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    restaurant: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });

            if (!shift) {
                return res.status(404).json({
                    success: false,
                    error: 'Shift not found'
                });
            }

            res.json({
                success: true,
                data: shift
            });
        } catch (error) {
            logger.error('Get shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch shift'
            });
        }
    }
);

export default router;

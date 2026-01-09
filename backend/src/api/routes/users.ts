import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';
import { auditMiddleware, auditAuthMiddleware } from '../../middleware/audit';

const router = Router();

// Validation schemas
const updateUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'RESTAURANT_OWNER', 'DELIVERY_DRIVER', 'INVESTOR', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
});

const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'RESTAURANT_OWNER', 'DELIVERY_DRIVER', 'INVESTOR', 'ADMIN']),
    tenantId: z.string().optional(),
});

// GET /api/users - List users (Admin only)
router.get('/', auditMiddleware('USER', { 'GET': 'USER_LIST' }), async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    phoneVerified: true,
                    walletAddress: true,
                    createdAt: true,
                    lastLoginAt: true,
                    failedLoginAttempts: true,
                    isLocked: true,
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count()
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            }
        });

        logger.info(`Admin ${userId} listed users (page ${page})`);
    } catch (error) {
        logger.error('List users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/users - Create user (Admin only)
router.post('/', auditMiddleware('USER', { 'POST': 'USER_CREATE' }), async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const validatedData = createUserSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        // Get or create tenant
        const tenantId = validatedData.tenantId || await (async () => {
            const globalTenant = await prisma.tenant.findFirst({ where: { subdomain: 'global' } });
            return globalTenant?.id || (await prisma.tenant.create({
                data: {
                    name: 'NileLink Global',
                    subdomain: 'global',
                    trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                }
            })).id;
        })();

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                tenantId,
                email: validatedData.email,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role,
                isActive: true,
                emailVerified: false,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user }
        });

        logger.info(`Admin ${adminUserId} created user ${user.id} (${user.email})`);
    } catch (error) {
        logger.error('Create user error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/users/:id - Get user details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        const requestedUserId = req.params.id;

        // Users can view their own profile, admins can view any user
        if (role !== 'ADMIN' && userId !== requestedUserId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: requestedUserId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                emailVerified: true,
                phoneVerified: true,
                walletAddress: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                failedLoginAttempts: true,
                isLocked: true,
                lockExpiresAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

        if (role === 'ADMIN' && userId !== requestedUserId) {
            logger.info(`Admin ${userId} viewed user ${requestedUserId}`);
        }
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// PUT /api/users/:id - Update user (Admin or self)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        const requestedUserId = req.params.id;

        // Users can update their own profile, admins can update any user
        if (role !== 'ADMIN' && userId !== requestedUserId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const validatedData = updateUserSchema.parse(req.body);

        // Admins can update these fields, users can only update basic info
        const allowedFields = role === 'ADMIN'
            ? ['firstName', 'lastName', 'email', 'role', 'isActive']
            : ['firstName', 'lastName'];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (validatedData[field as keyof typeof validatedData] !== undefined) {
                updateData[field] = validatedData[field as keyof typeof validatedData];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        const user = await prisma.user.update({
            where: { id: requestedUserId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                updatedAt: true,
            }
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });

        logger.info(`${role === 'ADMIN' ? 'Admin' : 'User'} ${userId} updated user ${requestedUserId}`);
    } catch (error) {
        logger.error('Update user error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// DELETE /api/users/:id - Deactivate user (Admin only)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        const requestedUserId = req.params.id;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        // Soft delete by deactivating
        await prisma.user.update({
            where: { id: requestedUserId },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });

        logger.info(`Admin ${adminUserId} deactivated user ${requestedUserId}`);
    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/users/:id/reset-password - Reset user password (Admin only)
router.post('/:id/reset-password', async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        const requestedUserId = req.params.id;

        if (role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: requestedUserId },
            data: {
                password: hashedPassword,
                failedLoginAttempts: 0,
                isLocked: false,
                lockExpiresAt: null
            }
        });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

        logger.info(`Admin ${adminUserId} reset password for user ${requestedUserId}`);
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

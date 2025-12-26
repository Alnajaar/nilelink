import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/authenticate';
import { extractTenant } from '../../middleware/tenantContext';
import { requirePermission, requireRole } from '../../middleware/authorize';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// ROLE & PERMISSION MANAGEMENT
// ============================================================================

/**
 * GET /api/roles
 * List all roles for tenant
 */
router.get('/',
    extractTenant,
    authenticate,
    requirePermission('EMPLOYEE', 'READ'),
    async (req: Request, res: Response) => {
        try {
            const roles = await prisma.role.findMany({
                where: { tenantId: req.tenantId },
                include: {
                    permissions: true,
                    _count: {
                        select: { users: true }
                    }
                }
            });

            res.json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('List roles error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch roles'
            });
        }
    }
);

const CreateRoleSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    permissionIds: z.array(z.string()),
});

/**
 * POST /api/roles
 * Create custom role (Owner only)
 */
router.post('/',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const data = CreateRoleSchema.parse(req.body);

            const role = await prisma.role.create({
                data: {
                    tenantId: req.tenantId!,
                    name: data.name,
                    description: data.description,
                    isSystem: false,
                    permissions: {
                        connect: data.permissionIds.map(id => ({ id }))
                    }
                },
                include: {
                    permissions: true
                }
            });

            res.status(201).json({
                success: true,
                data: role
            });
        } catch (error: any) {
            console.error('Create role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create role'
            });
        }
    }
);

/**
 * GET /api/roles/permissions
 * List all available permissions
 */
router.get('/permissions',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const permissions = await prisma.permission.findMany({
                orderBy: [
                    { resource: 'asc' },
                    { action: 'asc' }
                ]
            });

            res.json({
                success: true,
                data: permissions
            });
        } catch (error) {
            console.error('List permissions error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch permissions'
            });
        }
    }
);

const AssignRoleSchema = z.object({
    userId: z.string(),
    roleId: z.string(),
});

/**
 * POST /api/roles/assign
 * Assign role to user (Owner/Manager)
 */
router.post('/assign',
    extractTenant,
    authenticate,
    requirePermission('EMPLOYEE', 'MANAGE'),
    async (req: Request, res: Response) => {
        try {
            const data = AssignRoleSchema.parse(req.body);

            // Verify user and role belong to this tenant
            const [user, role] = await Promise.all([
                prisma.user.findFirst({
                    where: {
                        id: data.userId,
                        tenantId: req.tenantId
                    }
                }),
                prisma.role.findFirst({
                    where: {
                        id: data.roleId,
                        tenantId: req.tenantId
                    }
                })
            ]);

            if (!user || !role) {
                return res.status(404).json({
                    success: false,
                    error: 'User or role not found'
                });
            }

            // Assign role
            await prisma.user.update({
                where: { id: data.userId },
                data: {
                    roles: {
                        connect: { id: data.roleId }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Role assigned successfully'
            });
        } catch (error: any) {
            console.error('Assign role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to assign role'
            });
        }
    }
);

/**
 * DELETE /api/roles/unassign
 * Remove role from user
 */
router.delete('/unassign',
    extractTenant,
    authenticate,
    requirePermission('EMPLOYEE', 'MANAGE'),
    async (req: Request, res: Response) => {
        try {
            const { userId, roleId } = req.body;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    roles: {
                        disconnect: { id: roleId }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Role removed successfully'
            });
        } catch (error) {
            console.error('Unassign role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove role'
            });
        }
    }
);

export default router;

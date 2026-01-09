import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { extractTenant } from '../../middleware/tenantContext';
import { requirePermission, requireRole } from '../../middleware/authorize';
import { logger } from '../../utils/logger';

const router = Router();

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
            logger.error('List roles error:', error);
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
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Create role error:', error);
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
            logger.error('List permissions error:', error);
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
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Assign role error:', error);
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
            const UnassignRoleSchema = z.object({
                userId: z.string(),
                roleId: z.string(),
            });

            const data = UnassignRoleSchema.parse(req.body);

            // Verify user belongs to tenant
            const user = await prisma.user.findFirst({
                where: {
                    id: data.userId,
                    tenantId: req.tenantId
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            await prisma.user.update({
                where: { id: data.userId },
                data: {
                    roles: {
                        disconnect: { id: data.roleId }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Role removed successfully'
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Unassign role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove role'
            });
        }
    }
);

/**
 * GET /api/roles/:id
 * Get role by ID
 */
router.get('/:id',
    extractTenant,
    authenticate,
    requirePermission('EMPLOYEE', 'READ'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const role = await prisma.role.findFirst({
                where: {
                    id,
                    tenantId: req.tenantId
                },
                include: {
                    permissions: true,
                    _count: {
                        select: { users: true }
                    }
                }
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    error: 'Role not found'
                });
            }

            res.json({
                success: true,
                data: role
            });
        } catch (error) {
            logger.error('Get role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch role'
            });
        }
    }
);

/**
 * PUT /api/roles/:id
 * Update role (Owner only)
 */
router.put('/:id',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const UpdateRoleSchema = z.object({
                name: z.string().min(2).optional(),
                description: z.string().optional(),
                permissionIds: z.array(z.string()).optional(),
            });

            const data = UpdateRoleSchema.parse(req.body);

            const role = await prisma.role.findFirst({
                where: {
                    id,
                    tenantId: req.tenantId
                }
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    error: 'Role not found'
                });
            }

            if (role.isSystem) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot modify system roles'
                });
            }

            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;

            const updatedRole = await prisma.role.update({
                where: { id },
                data: {
                    ...updateData,
                    ...(data.permissionIds && {
                        permissions: {
                            set: data.permissionIds.map(permId => ({ id: permId }))
                        }
                    })
                },
                include: {
                    permissions: true
                }
            });

            res.json({
                success: true,
                data: updatedRole
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            logger.error('Update role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update role'
            });
        }
    }
);

/**
 * DELETE /api/roles/:id
 * Delete role (Owner only, cannot delete system roles)
 */
router.delete('/:id',
    extractTenant,
    authenticate,
    requireRole('Owner'),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const role = await prisma.role.findFirst({
                where: {
                    id,
                    tenantId: req.tenantId
                }
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    error: 'Role not found'
                });
            }

            if (role.isSystem) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot delete system roles'
                });
            }

            await prisma.role.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Role deleted successfully'
            });
        } catch (error: any) {
            logger.error('Delete role error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete role'
            });
        }
    }
);

export default router;

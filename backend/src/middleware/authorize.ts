import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ResourceType = 'ORDER' | 'MENU' | 'INVENTORY' | 'CUSTOMER' | 'EMPLOYEE' | 'REPORT' | 'FINANCIAL' | 'SETTINGS' | 'SHIFT' | 'DELIVERY' | 'ADMIN';
type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'APPROVE' | 'MANAGE';

/**
 * Permission-based authorization middleware
 * Checks if user has specific permission for resource + action
 */
export function requirePermission(resource: ResourceType, action: ActionType) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user; // Set by authenticate middleware
            const tenantId = req.tenantId;

            if (!user || !tenantId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            // Fetch user with roles and permissions
            const userWithPermissions = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: {
                        where: { tenantId },
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (!userWithPermissions) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if user has required permission
            const hasPermission = userWithPermissions.roles.some(role =>
                role.permissions.some(
                    perm => perm.resource === resource && perm.action === action
                )
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: `Insufficient permissions: ${resource}:${action} required`,
                    required: { resource, action }
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
}

/**
 * Check if user has ANY of the specified permissions
 */
export function requireAnyPermission(permissions: Array<{ resource: ResourceType; action: ActionType }>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const tenantId = req.tenantId;

            if (!user || !tenantId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userWithPermissions = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: {
                        where: { tenantId },
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            if (!userWithPermissions) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if user has ANY of the required permissions
            const hasAnyPermission = permissions.some(({ resource, action }) =>
                userWithPermissions.roles.some(role =>
                    role.permissions.some(
                        perm => perm.resource === resource && perm.action === action
                    )
                )
            );

            if (!hasAnyPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: permissions
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed'
            });
        }
    };
}

/**
 * Check if user belongs to specific role
 */
export function requireRole(roleName: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const tenantId = req.tenantId;

            if (!user || !tenantId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const userWithRoles = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: {
                        where: {
                            tenantId,
                            name: roleName
                        }
                    }
                }
            });

            if (!userWithRoles || userWithRoles.roles.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: `Role '${roleName}' required`
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                success: false,
                error: 'Role check failed'
            });
        }
    };
}

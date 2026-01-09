import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/DatabasePoolService';
import { logger } from '../utils/logger';

interface AuditEvent {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    method: string;
    path: string;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
    success: boolean;
    errorMessage?: string;
}

class AuditService {
    private static instance: AuditService;

    private constructor() {}

    static getInstance(): AuditService {
        if (!AuditService.instance) {
            AuditService.instance = new AuditService();
        }
        return AuditService.instance;
    }

    async log(event: AuditEvent): Promise<void> {
        try {
            // Only log for authenticated admin actions or significant user actions
            if (!event.userId && !this.isSignificantAction(event.action)) {
                return;
            }

            await prisma.auditLog.create({
                data: {
                    userId: event.userId,
                    action: event.action,
                    resource: event.resource,
                    resourceId: event.resourceId,
                    method: event.method,
                    path: event.path,
                    ipAddress: event.ipAddress,
                    userAgent: event.userAgent?.substring(0, 500), // Truncate if too long
                    oldValues: event.oldValues ? JSON.stringify(event.oldValues) : null,
                    newValues: event.newValues ? JSON.stringify(event.newValues) : null,
                    metadata: event.metadata ? JSON.stringify(event.metadata) : null,
                    success: event.success,
                    errorMessage: event.errorMessage?.substring(0, 1000) // Truncate if too long
                }
            });

            // Also log to console for immediate visibility
            const logLevel = event.success ? 'info' : 'warn';
            logger[logLevel](`AUDIT: ${event.userId || 'SYSTEM'} - ${event.action} ${event.resource}${event.resourceId ? `:${event.resourceId}` : ''}`, {
                method: event.method,
                path: event.path,
                success: event.success,
                error: event.errorMessage
            });

        } catch (error) {
            // Don't let audit logging break the main request
            logger.error('Failed to log audit event:', error);
        }
    }

    private isSignificantAction(action: string): boolean {
        const significantActions = [
            'LOGIN',
            'LOGOUT',
            'USER_CREATE',
            'USER_UPDATE',
            'USER_DELETE',
            'RATE_UPDATE',
            'PLAN_CREATE',
            'PLAN_UPDATE',
            'PLAN_DELETE',
            'ADMIN_ACCESS',
            'FAILED_LOGIN'
        ];
        return significantActions.includes(action);
    }
}

export const auditService = AuditService.getInstance();

// Middleware for audit logging
export function auditMiddleware(resource: string, actionMap?: Record<string, string>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const userId = (req as any).user?.userId;
        const method = req.method;
        const path = req.path;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        // Determine action based on method or custom mapping
        let action = method;
        if (actionMap && actionMap[method]) {
            action = actionMap[method];
        } else {
            switch (method) {
                case 'GET': action = 'READ'; break;
                case 'POST': action = 'CREATE'; break;
                case 'PUT': action = 'UPDATE'; break;
                case 'DELETE': action = 'DELETE'; break;
                case 'PATCH': action = 'UPDATE'; break;
            }
        }

        // Extract resource ID from params or body
        let resourceId: string | undefined;
        const idParams = ['id', 'userId', 'planId', 'subscriptionId'];
        for (const param of idParams) {
            if (req.params[param]) {
                resourceId = req.params[param];
                break;
            }
        }

        // For responses, log after they're sent
        res.on('finish', async () => {
            const success = res.statusCode >= 200 && res.statusCode < 400;
            const duration = Date.now() - startTime;

            // Store original values for updates (from req.body for updates)
            let oldValues: Record<string, any> | undefined;
            let newValues: Record<string, any> | undefined;

            if (method === 'PUT' || method === 'PATCH') {
                newValues = req.body;
                // Note: In a real implementation, you'd fetch old values before the update
            } else if (method === 'POST' && req.body) {
                newValues = req.body;
            }

            await auditService.log({
                userId,
                action,
                resource,
                resourceId,
                method,
                path,
                ipAddress,
                userAgent,
                oldValues,
                newValues,
                metadata: {
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    userRole: (req as any).user?.role
                },
                success,
                errorMessage: success ? undefined : `HTTP ${res.statusCode}`
            });
        });

        next();
    };
}

// Specialized middleware for auth events
export function auditAuthMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.json;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        res.json = function(data: any) {
            // Log auth events
            const success = res.statusCode >= 200 && res.statusCode < 400;
            const userId = data?.data?.user?.id;

            if (req.path.includes('/login')) {
                auditService.log({
                    userId,
                    action: success ? 'LOGIN' : 'FAILED_LOGIN',
                    resource: 'AUTH',
                    method: req.method,
                    path: req.path,
                    ipAddress,
                    userAgent,
                    metadata: {
                        email: req.body?.email,
                        remainingAttempts: data?.remainingAttempts
                    },
                    success,
                    errorMessage: success ? undefined : data?.error
                }).catch(err => logger.error('Failed to log login audit:', err));
            } else if (req.path.includes('/register') || req.path.includes('/signup')) {
                auditService.log({
                    userId,
                    action: 'USER_REGISTER',
                    resource: 'USER',
                    method: req.method,
                    path: req.path,
                    ipAddress,
                    userAgent,
                    newValues: { email: req.body?.email, role: req.body?.role },
                    success,
                    errorMessage: success ? undefined : data?.error
                }).catch(err => logger.error('Failed to log register audit:', err));
            }

            return originalSend.call(this, data);
        };

        next();
    };
}

// Helper function for manual audit logging
export function logAudit(event: Omit<AuditEvent, 'method' | 'path' | 'ipAddress' | 'userAgent'> & {
    req?: Request;
}): void {
    const auditEvent: AuditEvent = {
        ...event,
        method: event.req?.method || 'SYSTEM',
        path: event.req?.path || 'SYSTEM',
        ipAddress: event.req?.ip || event.req?.connection?.remoteAddress,
        userAgent: event.req?.get('User-Agent')
    };

    auditService.log(auditEvent).catch(err => logger.error('Failed to log manual audit event:', err));
}

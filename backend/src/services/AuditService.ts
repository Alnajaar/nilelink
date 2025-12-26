import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface AuditLogParams {
    tenantId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Audit Logging Service
 * Tracks all sensitive operations for compliance
 */
export class AuditService {
    /**
     * Create audit log entry
     */
    async log(params: AuditLogParams): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: params
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - logging failure shouldn't break the app
        }
    }

    /**
     * Log from Express request
     */
    async logFromRequest(req: any, action: string, resource: string, resourceId?: string, changes?: any): Promise<void> {
        await this.log({
            tenantId: req.tenantId || 'system',
            userId: req.user?.id,
            action,
            resource,
            resourceId,
            changes,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        });
    }

    /**
     * Query audit logs with filters
     */
    async query(filters: {
        tenantId?: string;
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }) {
        const where: any = {};

        if (filters.tenantId) where.tenantId = filters.tenantId;
        if (filters.userId) where.userId = filters.userId;
        if (filters.action) where.action = filters.action;
        if (filters.resource) where.resource = filters.resource;

        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = filters.startDate;
            if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        return await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filters.limit || 100,
        });
    }

    /**
     * Get user activity summary
     */
    async getUserActivity(userId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await prisma.auditLog.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group by action
        const summary: Record<string, number> = {};
        logs.forEach((log: any) => {
            summary[log.action] = (summary[log.action] || 0) + 1;
        });

        return {
            totalActions: logs.length,
            summary,
            recentLogs: logs.slice(0, 20),
        };
    }
}

export const auditService = new AuditService();

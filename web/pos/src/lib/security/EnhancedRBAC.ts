/**
 * Enhanced RBAC System with Audit Logging
 * 
 * Provides comprehensive role-based access control with detailed logging,
 * temporal permissions, and fine-grained access control
 */

import { EventEmitter } from 'events';
import { POS_ROLE, PERMISSION } from '@/utils/permissions';

export interface PermissionLog {
    id: string;
    userId: string;
    action: 'GRANTED' | 'DENIED' | 'REVOKED' | 'ATTEMPTED';
    permission: PERMISSION;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
    sessionId: string;
}

export interface TemporalPermission {
    id: string;
    userId: string;
    permission: PERMISSION;
    grantedBy: string;
    grantedAt: number;
    expiresAt?: number;
    reason?: string;
}

export interface ResourcePermission {
    resourceId: string;
    resourceType: 'ORDER' | 'TABLE' | 'INVENTORY_ITEM' | 'REPORT' | 'STAFF_MEMBER';
    permissions: PERMISSION[];
    ownerId?: string;
    branchId: string;
}

export class EnhancedRBAC extends EventEmitter {
    private permissionLogs: PermissionLog[] = [];
    private temporalPermissions: TemporalPermission[] = [];
    private resourcePermissions: Map<string, ResourcePermission> = new Map();
    private MAX_LOG_ENTRIES = 10000;

    constructor() {
        super();
        this.startCleanupInterval();
    }

    /**
     * Check if user has permission with detailed logging
     */
    hasPermission(
        userId: string,
        role: POS_ROLE,
        permission: PERMISSION,
        resourceId?: string,
        sessionId?: string
    ): { allowed: boolean; logId: string } {
        const timestamp = Date.now();
        let allowed = false;
        let reason = '';

        try {
            // Check direct role permissions
            const roleHasPermission = this.checkRolePermission(role, permission);
            
            // Check temporal permissions
            const temporalAllowed = this.checkTemporalPermission(userId, permission);
            
            // Check resource-specific permissions
            const resourceAllowed = resourceId 
                ? this.checkResourcePermission(resourceId, permission, userId)
                : true;

            allowed = roleHasPermission && temporalAllowed && resourceAllowed;

            reason = allowed ? 'Permission granted' : 'Permission denied';
            
            if (!allowed) {
                if (!roleHasPermission) reason = 'Role lacks permission';
                else if (!temporalAllowed) reason = 'Temporal permission expired';
                else if (!resourceAllowed) reason = 'Resource access denied';
            }

        } catch (error) {
            allowed = false;
            reason = `Error checking permission: ${error}`;
        }

        // Log the permission check
        const logId = this.logPermissionCheck(
            userId,
            allowed ? 'GRANTED' : 'DENIED',
            permission,
            timestamp,
            sessionId,
            reason,
            resourceId
        );

        this.emit('permission.checked', {
            userId,
            permission,
            allowed,
            reason,
            timestamp,
            logId
        });

        return { allowed, logId };
    }

    /**
     * Check role-based permission
     */
    private checkRolePermission(role: POS_ROLE, permission: PERMISSION): boolean {
        // Import role permissions mapping
        const { ROLE_PERMISSIONS } = require('@/utils/permissions');
        return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
    }

    /**
     * Check temporal permissions
     */
    private checkTemporalPermission(userId: string, permission: PERMISSION): boolean {
        const now = Date.now();
        const userTempPermissions = this.temporalPermissions.filter(tp => 
            tp.userId === userId && 
            tp.permission === permission &&
            (!tp.expiresAt || tp.expiresAt > now)
        );

        return userTempPermissions.length > 0;
    }

    /**
     * Check resource-specific permissions
     */
    private checkResourcePermission(
        resourceId: string,
        permission: PERMISSION,
        userId: string
    ): boolean {
        const resourcePerm = this.resourcePermissions.get(resourceId);
        if (!resourcePerm) return true; // Default allow if no specific restrictions

        // Check if user has specific resource permission
        const hasResourcePermission = resourcePerm.permissions.includes(permission);
        
        // Check ownership (owners can typically access their resources)
        const isOwner = resourcePerm.ownerId === userId;
        
        return hasResourcePermission || isOwner;
    }

    /**
     * Grant temporary permission
     */
    grantTemporalPermission(
        userId: string,
        permission: PERMISSION,
        grantedBy: string,
        expiresInMs?: number,
        reason?: string
    ): string {
        const tempPermId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const temporalPermission: TemporalPermission = {
            id: tempPermId,
            userId,
            permission,
            grantedBy,
            grantedAt: Date.now(),
            expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
            reason
        };

        this.temporalPermissions.push(temporalPermission);

        this.emit('permission.granted.temporal', {
            tempPermId,
            userId,
            permission,
            grantedBy,
            expiresInMs,
            reason
        });

        console.log(`🔓 Granted temporal permission ${permission} to user ${userId}`);
        return tempPermId;
    }

    /**
     * Revoke temporal permission
     */
    revokeTemporalPermission(tempPermId: string, revokedBy: string): boolean {
        const index = this.temporalPermissions.findIndex(tp => tp.id === tempPermId);
        if (index === -1) return false;

        const tempPerm = this.temporalPermissions[index];
        this.temporalPermissions.splice(index, 1);

        this.emit('permission.revoked.temporal', {
            tempPermId,
            userId: tempPerm.userId,
            permission: tempPerm.permission,
            revokedBy
        });

        console.log(`🔒 Revoked temporal permission ${tempPerm.permission} from user ${tempPerm.userId}`);
        return true;
    }

    /**
     * Set resource-specific permissions
     */
    setResourcePermissions(
        resourceId: string,
        resourceType: ResourcePermission['resourceType'],
        permissions: PERMISSION[],
        ownerId?: string,
        branchId?: string
    ): void {
        const resourcePerm: ResourcePermission = {
            resourceId,
            resourceType,
            permissions,
            ownerId,
            branchId: branchId || 'default'
        };

        this.resourcePermissions.set(resourceId, resourcePerm);

        this.emit('resource.permissions.set', {
            resourceId,
            resourceType,
            permissions,
            ownerId,
            branchId
        });

        console.log(`🔐 Set permissions for resource ${resourceId}`);
    }

    /**
     * Add permission to existing resource
     */
    addResourcePermission(
        resourceId: string,
        permission: PERMISSION
    ): boolean {
        const resourcePerm = this.resourcePermissions.get(resourceId);
        if (!resourcePerm) return false;

        if (!resourcePerm.permissions.includes(permission)) {
            resourcePerm.permissions.push(permission);
            this.resourcePermissions.set(resourceId, resourcePerm);
            
            this.emit('resource.permission.added', {
                resourceId,
                permission
            });
        }

        return true;
    }

    /**
     * Remove permission from resource
     */
    removeResourcePermission(
        resourceId: string,
        permission: PERMISSION
    ): boolean {
        const resourcePerm = this.resourcePermissions.get(resourceId);
        if (!resourcePerm) return false;

        const index = resourcePerm.permissions.indexOf(permission);
        if (index !== -1) {
            resourcePerm.permissions.splice(index, 1);
            this.resourcePermissions.set(resourceId, resourcePerm);
            
            this.emit('resource.permission.removed', {
                resourceId,
                permission
            });
        }

        return true;
    }

    /**
     * Log permission check
     */
    private logPermissionCheck(
        userId: string,
        action: PermissionLog['action'],
        permission: PERMISSION,
        timestamp: number,
        sessionId?: string,
        reason?: string,
        resourceId?: string
    ): string {
        const logId = `perm_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const logEntry: PermissionLog = {
            id: logId,
            userId,
            action,
            permission,
            timestamp,
            sessionId: sessionId || 'unknown',
            ipAddress: typeof window !== 'undefined' ? this.getClientIP() : undefined,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
            reason
        };

        this.permissionLogs.push(logEntry);

        // Trim logs if too large
        if (this.permissionLogs.length > this.MAX_LOG_ENTRIES) {
            this.permissionLogs = this.permissionLogs.slice(-this.MAX_LOG_ENTRIES);
        }

        return logId;
    }

    /**
     * Get client IP (simplified)
     */
    private getClientIP(): string {
        // In real implementation, this would come from server headers
        return 'client-ip-unavailable';
    }

    /**
     * Get permission logs
     */
    getPermissionLogs(filters?: {
        userId?: string;
        permission?: PERMISSION;
        action?: PermissionLog['action'];
        startTime?: number;
        endTime?: number;
        limit?: number;
    }): PermissionLog[] {
        let logs = [...this.permissionLogs];

        if (filters?.userId) {
            logs = logs.filter(log => log.userId === filters.userId);
        }

        if (filters?.permission) {
            logs = logs.filter(log => log.permission === filters.permission);
        }

        if (filters?.action) {
            logs = logs.filter(log => log.action === filters.action);
        }

        if (filters?.startTime) {
            logs = logs.filter(log => log.timestamp >= filters.startTime!);
        }

        if (filters?.endTime) {
            logs = logs.filter(log => log.timestamp <= filters.endTime!);
        }

        logs.sort((a, b) => b.timestamp - a.timestamp);

        if (filters?.limit) {
            logs = logs.slice(0, filters.limit);
        }

        return logs;
    }

    /**
     * Get audit report for user
     */
    getUserAuditReport(userId: string, daysBack: number = 30): {
        totalChecks: number;
        granted: number;
        denied: number;
        permissionsUsed: Set<PERMISSION>;
        recentActivity: PermissionLog[];
    } {
        const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
        
        const userLogs = this.getPermissionLogs({
            userId,
            startTime: cutoffTime
        });

        const granted = userLogs.filter(log => log.action === 'GRANTED').length;
        const denied = userLogs.filter(log => log.action === 'DENIED').length;
        
        const permissionsUsed = new Set<PERMISSION>(
            userLogs.map(log => log.permission)
        );

        const recentActivity = userLogs.slice(0, 50); // Last 50 activities

        return {
            totalChecks: userLogs.length,
            granted,
            denied,
            permissionsUsed,
            recentActivity
        };
    }

    /**
     * Get suspicious activity report
     */
    getSuspiciousActivityReport(hoursBack: number = 24): {
        frequentDenials: { userId: string; denialCount: number }[];
        unusualPatterns: PermissionLog[];
        temporalAbuse: TemporalPermission[];
    } {
        const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
        
        const recentLogs = this.getPermissionLogs({ startTime: cutoffTime });
        const denials = recentLogs.filter(log => log.action === 'DENIED');

        // Find users with high denial rates
        const denialCounts = new Map<string, number>();
        denials.forEach(log => {
            denialCounts.set(log.userId, (denialCounts.get(log.userId) || 0) + 1);
        });

        const frequentDenials = Array.from(denialCounts.entries())
            .filter(([_, count]) => count > 5)
            .map(([userId, count]) => ({ userId, denialCount: count }))
            .sort((a, b) => b.denialCount - a.denialCount);

        // Find unusual patterns (rapid repeated attempts)
        const unusualPatterns = this.detectUnusualPatterns(recentLogs);

        // Find expired temporal permissions still being used
        const now = Date.now();
        const temporalAbuse = this.temporalPermissions.filter(tp => 
            tp.expiresAt && tp.expiresAt < now
        );

        return {
            frequentDenials,
            unusualPatterns,
            temporalAbuse
        };
    }

    /**
     * Detect unusual permission patterns
     */
    private detectUnusualPatterns(logs: PermissionLog[]): PermissionLog[] {
        const patterns = new Map<string, number>(); // userId_permission -> count
        const unusual: PermissionLog[] = [];

        logs.forEach(log => {
            const key = `${log.userId}_${log.permission}`;
            const count = patterns.get(key) || 0;
            patterns.set(key, count + 1);

            // Flag if same user tries same permission repeatedly in short time
            if (count > 3) {
                unusual.push(log);
            }
        });

        return unusual;
    }

    /**
     * Cleanup expired temporal permissions
     */
    private cleanupExpiredPermissions(): void {
        const now = Date.now();
        const initialCount = this.temporalPermissions.length;

        this.temporalPermissions = this.temporalPermissions.filter(tp => 
            !tp.expiresAt || tp.expiresAt > now
        );

        const cleanedCount = initialCount - this.temporalPermissions.length;
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired temporal permissions`);
        }
    }

    /**
     * Start periodic cleanup
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanupExpiredPermissions();
            
            // Also trim old logs occasionally
            if (this.permissionLogs.length > this.MAX_LOG_ENTRIES * 0.8) {
                this.permissionLogs = this.permissionLogs.slice(-Math.floor(this.MAX_LOG_ENTRIES * 0.6));
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * Export audit data
     */
    exportAuditData(): {
        logs: PermissionLog[];
        temporalPermissions: TemporalPermission[];
        resourcePermissions: ResourcePermission[];
    } {
        return {
            logs: [...this.permissionLogs],
            temporalPermissions: [...this.temporalPermissions],
            resourcePermissions: Array.from(this.resourcePermissions.values())
        };
    }

    /**
     * Get current system permissions status
     */
    getSystemStatus(): {
        activeTemporalPermissions: number;
        protectedResources: number;
        totalLogs: number;
        recentDeniedAttempts: number;
    } {
        const recentTime = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
        
        const recentDenied = this.permissionLogs.filter(log => 
            log.action === 'DENIED' && log.timestamp > recentTime
        ).length;

        return {
            activeTemporalPermissions: this.temporalPermissions.filter(tp => 
                !tp.expiresAt || tp.expiresAt > Date.now()
            ).length,
            protectedResources: this.resourcePermissions.size,
            totalLogs: this.permissionLogs.length,
            recentDeniedAttempts: recentDenied
        };
    }
}

// Singleton instance
let enhancedRBAC: EnhancedRBAC | null = null;

export function getEnhancedRBAC(): EnhancedRBAC {
    if (!enhancedRBAC) {
        enhancedRBAC = new EnhancedRBAC();
    }
    return enhancedRBAC;
}
/**
 * System Audit Logger
 * 
 * Tracks all user activities, system events, and security-related actions
 * Provides comprehensive audit trails for compliance and troubleshooting
 */

import { EventEmitter } from 'events';

export interface AuditEvent {
    id: string;
    timestamp: number;
    eventType: AuditEventType;
    userId?: string;
    userName?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resourceType?: string;
    resourceId?: string;
    action: string;
    details: any;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    branchId?: string;
}

export type AuditEventType = 
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'PERMISSION_CHECK'
    | 'PERMISSION_GRANTED'
    | 'PERMISSION_DENIED'
    | 'ORDER_CREATED'
    | 'ORDER_MODIFIED'
    | 'ORDER_CANCELLED'
    | 'PAYMENT_PROCESSED'
    | 'INVENTORY_UPDATE'
    | 'INVENTORY_ADJUSTMENT'
    | 'TABLE_ASSIGNED'
    | 'TABLE_RELEASED'
    | 'KITCHEN_ORDER'
    | 'KITCHEN_STATUS_CHANGE'
    | 'SYSTEM_CONFIGURATION'
    | 'SECURITY_ALERT'
    | 'DATA_EXPORT'
    | 'BACKUP_CREATED'
    | 'ERROR_OCCURRED'
    | 'API_CALL'
    | 'DATABASE_OPERATION';

export interface AuditFilter {
    userId?: string;
    eventType?: AuditEventType;
    startTime?: number;
    endTime?: number;
    severity?: AuditEvent['severity'];
    branchId?: string;
    limit?: number;
    offset?: number;
}

export class AuditLogger extends EventEmitter {
    private auditTrail: AuditEvent[] = [];
    private readonly MAX_EVENTS = 50000;
    private readonly BATCH_SIZE = 1000;

    constructor() {
        super();
        this.initialize();
    }

    private initialize(): void {
        // Load existing audit data if available
        this.loadFromStorage();
        
        // Set up periodic cleanup
        this.startCleanupInterval();
        
        // Listen for system events
        this.setupEventListeners();
    }

    /**
     * Log an audit event
     */
    logEvent(
        eventType: AuditEventType,
        action: string,
        details: any = {},
        options: {
            userId?: string;
            userName?: string;
            sessionId?: string;
            severity?: AuditEvent['severity'];
            outcome?: AuditEvent['outcome'];
            resourceType?: string;
            resourceId?: string;
            branchId?: string;
        } = {}
    ): string {
        const eventId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const event: AuditEvent = {
            id: eventId,
            timestamp: Date.now(),
            eventType,
            action,
            details,
            severity: options.severity || 'INFO',
            outcome: options.outcome || 'SUCCESS',
            userId: options.userId,
            userName: options.userName,
            sessionId: options.sessionId,
            ipAddress: this.getClientIP(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            resourceType: options.resourceType,
            resourceId: options.resourceId,
            branchId: options.branchId
        };

        this.auditTrail.push(event);
        
        // Trim if too large
        if (this.auditTrail.length > this.MAX_EVENTS) {
            this.auditTrail = this.auditTrail.slice(-this.MAX_EVENTS);
        }

        // Emit event for real-time monitoring
        this.emit('audit.logged', event);
        
        // Store in localStorage for persistence
        this.storeEvent(event);
        
        // Console logging for development
        this.consoleLog(event);

        return eventId;
    }

    /**
     * Get audit events with filtering
     */
    getEvents(filter?: AuditFilter): AuditEvent[] {
        let events = [...this.auditTrail];

        if (filter?.userId) {
            events = events.filter(event => event.userId === filter.userId);
        }

        if (filter?.eventType) {
            events = events.filter(event => event.eventType === filter.eventType);
        }

        if (filter?.startTime) {
            events = events.filter(event => event.timestamp >= filter.startTime!);
        }

        if (filter?.endTime) {
            events = events.filter(event => event.timestamp <= filter.endTime!);
        }

        if (filter?.severity) {
            events = events.filter(event => event.severity === filter.severity);
        }

        if (filter?.branchId) {
            events = events.filter(event => event.branchId === filter.branchId);
        }

        // Sort by timestamp (newest first)
        events.sort((a, b) => b.timestamp - a.timestamp);

        // Apply pagination
        if (filter?.offset) {
            events = events.slice(filter.offset);
        }
        
        if (filter?.limit) {
            events = events.slice(0, filter.limit);
        }

        return events;
    }

    /**
     * Get user activity summary
     */
    getUserActivitySummary(userId: string, daysBack: number = 30): {
        totalActions: number;
        loginCount: number;
        permissionChecks: number;
        ordersCreated: number;
        inventoryActions: number;
        lastActive: number;
        commonActions: { action: string; count: number }[];
    } {
        const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
        
        const userEvents = this.getEvents({
            userId,
            startTime: cutoffTime
        });

        const loginCount = userEvents.filter(e => e.eventType === 'USER_LOGIN').length;
        const permissionChecks = userEvents.filter(e => e.eventType === 'PERMISSION_CHECK').length;
        const ordersCreated = userEvents.filter(e => e.eventType === 'ORDER_CREATED').length;
        const inventoryActions = userEvents.filter(e => 
            e.eventType === 'INVENTORY_UPDATE' || e.eventType === 'INVENTORY_ADJUSTMENT'
        ).length;

        const actionCounts = new Map<string, number>();
        userEvents.forEach(event => {
            actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
        });

        const commonActions = Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const lastActive = userEvents.length > 0 ? userEvents[0].timestamp : 0;

        return {
            totalActions: userEvents.length,
            loginCount,
            permissionChecks,
            ordersCreated,
            inventoryActions,
            lastActive,
            commonActions
        };
    }

    /**
     * Get security incidents report
     */
    getSecurityIncidents(hoursBack: number = 24): {
        permissionDenials: number;
        failedLogins: number;
        suspiciousActivities: AuditEvent[];
        criticalEvents: AuditEvent[];
    } {
        const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
        
        const recentEvents = this.getEvents({ startTime: cutoffTime });
        
        const permissionDenials = recentEvents.filter(event => 
            event.eventType === 'PERMISSION_DENIED'
        ).length;

        const failedLogins = recentEvents.filter(event => 
            event.eventType === 'USER_LOGIN' && event.outcome === 'FAILURE'
        ).length;

        const suspiciousActivities = recentEvents.filter(event => 
            event.severity === 'WARNING' || 
            (event.eventType === 'PERMISSION_DENIED' && event.details.attempts > 3)
        );

        const criticalEvents = recentEvents.filter(event => 
            event.severity === 'CRITICAL' || event.severity === 'ERROR'
        );

        return {
            permissionDenials,
            failedLogins,
            suspiciousActivities,
            criticalEvents
        };
    }

    /**
     * Get system health report
     */
    getSystemHealthReport(hoursBack: number = 24): {
        totalEvents: number;
        errorRate: number;
        performanceIssues: number;
        userSessions: number;
        peakActivityTime: string;
    } {
        const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
        const recentEvents = this.getEvents({ startTime: cutoffTime });

        const totalEvents = recentEvents.length;
        const errors = recentEvents.filter(e => e.severity === 'ERROR' || e.severity === 'CRITICAL').length;
        const errorRate = totalEvents > 0 ? (errors / totalEvents) * 100 : 0;

        const performanceIssues = recentEvents.filter(e => 
            e.eventType === 'ERROR_OCCURRED' && 
            (e.details.message?.includes('timeout') || e.details.message?.includes('performance'))
        ).length;

        // Count unique user sessions
        const uniqueSessions = new Set(recentEvents.map(e => e.sessionId).filter(Boolean)).size;

        // Find peak activity hour
        const hourlyCounts = new Map<number, number>();
        recentEvents.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
        });

        let peakHour = 0;
        let maxCount = 0;
        hourlyCounts.forEach((count, hour) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = hour;
            }
        });

        return {
            totalEvents,
            errorRate,
            performanceIssues,
            userSessions: uniqueSessions,
            peakActivityTime: `${peakHour}:00-${peakHour + 1}:00`
        };
    }

    /**
     * Export audit data for compliance
     */
    exportAuditData(
        format: 'JSON' | 'CSV' = 'JSON',
        startTime?: number,
        endTime?: number
    ): string {
        const events = this.getEvents({ startTime, endTime });
        
        if (format === 'CSV') {
            return this.exportToCSV(events);
        } else {
            return JSON.stringify({
                exportTimestamp: Date.now(),
                exportFormat: 'JSON',
                eventCount: events.length,
                events
            }, null, 2);
        }
    }

    /**
     * Export to CSV format
     */
    private exportToCSV(events: AuditEvent[]): string {
        const headers = [
            'Timestamp', 'Event Type', 'Action', 'User ID', 'User Name', 
            'Severity', 'Outcome', 'Resource Type', 'Resource ID', 'Branch ID', 'Details'
        ];

        const rows = events.map(event => [
            new Date(event.timestamp).toISOString(),
            event.eventType,
            event.action,
            event.userId || '',
            event.userName || '',
            event.severity,
            event.outcome,
            event.resourceType || '',
            event.resourceId || '',
            event.branchId || '',
            JSON.stringify(event.details)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Get client IP address
     */
    private getClientIP(): string {
        // In real implementation, this would come from server headers
        // For browser environment, we return a placeholder
        return typeof window !== 'undefined' ? 'browser-client' : 'server-client';
    }

    /**
     * Store event in localStorage
     */
    private storeEvent(event: AuditEvent): void {
        try {
            if (typeof localStorage !== 'undefined') {
                // Store in batches to avoid localStorage limits
                const batchKey = `audit_batch_${Math.floor(Date.now() / (1000 * 60 * 5))}`; // 5-minute batches
                const existingBatch = localStorage.getItem(batchKey);
                const batch = existingBatch ? JSON.parse(existingBatch) : [];
                
                batch.push(event);
                
                // Keep batch size reasonable
                if (batch.length > this.BATCH_SIZE) {
                    batch.shift(); // Remove oldest
                }
                
                localStorage.setItem(batchKey, JSON.stringify(batch));
            }
        } catch (error) {
            console.warn('Failed to store audit event in localStorage:', error);
        }
    }

    /**
     * Load audit data from storage
     */
    private loadFromStorage(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                // Load recent batches
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith('audit_batch_')
                );

                keys.forEach(key => {
                    try {
                        const batch = JSON.parse(localStorage.getItem(key) || '[]');
                        const recentEvents = batch.filter((event: AuditEvent) => 
                            event.timestamp > oneHourAgo
                        );
                        
                        this.auditTrail.push(...recentEvents);
                    } catch (error) {
                        console.warn('Failed to load audit batch:', key, error);
                    }
                });

                // Sort and trim
                this.auditTrail.sort((a, b) => a.timestamp - b.timestamp);
                if (this.auditTrail.length > this.MAX_EVENTS) {
                    this.auditTrail = this.auditTrail.slice(-this.MAX_EVENTS);
                }
            }
        } catch (error) {
            console.warn('Failed to load audit data from storage:', error);
        }
    }

    /**
     * Setup event listeners for automatic logging
     */
    private setupEventListeners(): void {
        // Listen for browser events that should be audited
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.logEvent('USER_LOGOUT', 'Browser tab closed', {
                    reason: 'Page unload'
                }, {
                    severity: 'INFO'
                });
            });

            // Listen for visibility changes
            document.addEventListener('visibilitychange', () => {
                this.logEvent('SYSTEM_CONFIGURATION', `Tab ${document.hidden ? 'hidden' : 'visible'}`, {
                    hidden: document.hidden,
                    visibilityState: document.visibilityState
                }, {
                    severity: 'INFO'
                });
            });
        }
    }

    /**
     * Console logging for development
     */
    private consoleLog(event: AuditEvent): void {
        const timestamp = new Date(event.timestamp).toISOString();
        const prefix = `[AUDIT ${event.severity}]`;
        const message = `${prefix} ${timestamp} ${event.userId || 'SYSTEM'}: ${event.action}`;
        
        switch (event.severity) {
            case 'CRITICAL':
                console.error(message, event.details);
                break;
            case 'ERROR':
                console.error(message, event.details);
                break;
            case 'WARNING':
                console.warn(message, event.details);
                break;
            default:
                console.info(message, event.details);
        }
    }

    /**
     * Start cleanup interval
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 1 week old
            const initialLength = this.auditTrail.length;
            
            this.auditTrail = this.auditTrail.filter(event => event.timestamp > cutoffTime);
            
            const removedCount = initialLength - this.auditTrail.length;
            if (removedCount > 0) {
                console.log(`🧹 Removed ${removedCount} old audit events`);
            }
        }, 3600000); // Every hour
    }

    /**
     * Get current audit logger status
     */
    getStatus(): {
        totalEvents: number;
        storageUsed: string;
        oldestEvent: number;
        newestEvent: number;
    } {
        const totalEvents = this.auditTrail.length;
        const oldestEvent = this.auditTrail.length > 0 ? this.auditTrail[0].timestamp : 0;
        const newestEvent = this.auditTrail.length > 0 ? this.auditTrail[this.auditTrail.length - 1].timestamp : 0;
        
        // Estimate storage usage (rough approximation)
        const storageUsed = `${(JSON.stringify(this.auditTrail).length / 1024).toFixed(2)} KB`;

        return {
            totalEvents,
            storageUsed,
            oldestEvent,
            newestEvent
        };
    }
}

// Singleton instance
let auditLogger: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
    if (!auditLogger) {
        auditLogger = new AuditLogger();
    }
    return auditLogger;
}
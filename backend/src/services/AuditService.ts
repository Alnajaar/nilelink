/**
 * Audit Logging Service
 * Comprehensive logging of user actions, API calls, and security events
 */

import { Request, Response } from 'express';

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',

  // Two-Factor Authentication
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  TWO_FA_VERIFIED = 'TWO_FA_VERIFIED',
  TWO_FA_FAILED = 'TWO_FA_FAILED',

  // User management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',

  // API access
  API_ACCESS = 'API_ACCESS',
  API_ACCESS_DENIED = 'API_ACCESS_DENIED',
  API_RATE_LIMITED = 'API_RATE_LIMITED',

  // Data operations
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',

  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',

  // System events
  SYSTEM_STARTUP = 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  CONFIG_CHANGED = 'CONFIG_CHANGED'
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action: string;
  details: Record<string, any>;
  metadata: {
    requestId?: string;
    duration?: number;
    statusCode?: number;
    errorMessage?: string;
  };
}

export interface AuditQuery {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export class AuditService {
  private static logs: AuditEvent[] = [];
  private static readonly MAX_LOGS = 10000; // In production, use proper database

  /**
   * Log an audit event
   */
  static log(
    eventType: AuditEventType,
    severity: AuditSeverity,
    action: string,
    details: Record<string, any> = {},
    metadata: Partial<AuditEvent['metadata']> = {}
  ): AuditEvent {
    const event: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      eventType,
      severity,
      action,
      details,
      metadata,
      ipAddress: 'unknown', // Will be set by middleware
      userAgent: 'unknown'  // Will be set by middleware
    };

    // Add to in-memory store (production would use database)
    this.logs.unshift(event);

    // Maintain max log size
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Log to console for development
    console.log(`[${event.severity}] ${event.eventType}: ${event.action}`, {
      userId: event.userId,
      ip: event.ipAddress,
      ...event.details
    });

    // In production, send to monitoring service
    this.sendToMonitoring(event);

    return event;
  }

  /**
   * Log authentication events
   */
  static logAuth(
    eventType: AuditEventType,
    userId: string,
    success: boolean,
    details: Record<string, any> = {},
    metadata: Partial<AuditEvent['metadata']> = {}
  ): AuditEvent {
    const severity = success ? AuditSeverity.LOW : AuditSeverity.MEDIUM;
    return this.log(eventType, severity, `User ${success ? 'successfully' : 'failed to'} authenticate`, {
      success,
      ...details
    }, {
      ...metadata,
      userId
    });
  }

  /**
   * Log API access
   */
  static logApiAccess(
    req: Request,
    res: Response,
    userId?: string,
    duration?: number
  ): AuditEvent {
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    const severity = isError ? AuditSeverity.MEDIUM : AuditSeverity.LOW;

    const eventType = isError ? AuditEventType.API_ACCESS_DENIED : AuditEventType.API_ACCESS;

    return this.log(eventType, severity, `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    }, {
      requestId: req.headers['x-request-id'] as string,
      duration,
      statusCode,
      userId
    });
  }

  /**
   * Log security events
   */
  static logSecurity(
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    details: Record<string, any> = {}
  ): AuditEvent {
    return this.log(eventType, severity, description, details);
  }

  /**
   * Log user actions
   */
  static logUserAction(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    severity: AuditSeverity = AuditSeverity.LOW
  ): AuditEvent {
    const eventType = this.getEventTypeForAction(action);
    return this.log(eventType, severity, `${action} on ${resource}`, {
      resource,
      ...details
    }, { userId });
  }

  /**
   * Query audit logs
   */
  static queryLogs(query: AuditQuery): AuditEvent[] {
    let results = [...this.logs];

    if (query.userId) {
      results = results.filter(log => log.userId === query.userId);
    }

    if (query.eventType) {
      results = results.filter(log => log.eventType === query.eventType);
    }

    if (query.severity) {
      results = results.filter(log => log.severity === query.severity);
    }

    if (query.startDate) {
      results = results.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter(log => log.timestamp <= query.endDate!);
    }

    if (query.ipAddress) {
      results = results.filter(log => log.ipAddress === query.ipAddress);
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * Get audit statistics
   */
  static getStatistics(timeRange: { start: Date; end: Date }) {
    const logs = this.queryLogs({
      startDate: timeRange.start,
      endDate: timeRange.end
    });

    const stats = {
      totalEvents: logs.length,
      bySeverity: {
        [AuditSeverity.LOW]: 0,
        [AuditSeverity.MEDIUM]: 0,
        [AuditSeverity.HIGH]: 0,
        [AuditSeverity.CRITICAL]: 0
      },
      byEventType: {} as Record<string, number>,
      failedLogins: 0,
      suspiciousActivities: 0,
      uniqueUsers: new Set<string>(),
      uniqueIPs: new Set<string>()
    };

    logs.forEach(log => {
      stats.bySeverity[log.severity]++;
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;

      if (log.userId) stats.uniqueUsers.add(log.userId);
      if (log.ipAddress) stats.uniqueIPs.add(log.ipAddress);

      if (log.eventType === AuditEventType.LOGIN_FAILED) stats.failedLogins++;
      if (log.eventType === AuditEventType.SUSPICIOUS_ACTIVITY) stats.suspiciousActivities++;
    });

    return {
      ...stats,
      uniqueUsers: stats.uniqueUsers.size,
      uniqueIPs: stats.uniqueIPs.size
    };
  }

  /**
   * Export audit logs (for compliance)
   */
  static exportLogs(query: AuditQuery, format: 'json' | 'csv' = 'json'): string {
    const logs = this.queryLogs(query);

    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'eventType', 'severity', 'userId', 'ipAddress', 'action', 'details'];
      const csvRows = logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.eventType,
        log.severity,
        log.userId || '',
        log.ipAddress,
        log.action,
        JSON.stringify(log.details)
      ]);

      return [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  // Private helper methods

  private static generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getEventTypeForAction(action: string): AuditEventType {
    const actionMap: Record<string, AuditEventType> = {
      'created': AuditEventType.DATA_CREATED,
      'updated': AuditEventType.DATA_UPDATED,
      'deleted': AuditEventType.DATA_DELETED,
      'exported': AuditEventType.DATA_EXPORTED,
    };

    return actionMap[action.toLowerCase()] || AuditEventType.API_ACCESS;
  }

  private static sendToMonitoring(event: AuditEvent): void {
    // In production, send to monitoring services like DataDog, New Relic, etc.
    if (event.severity === AuditSeverity.CRITICAL || event.severity === AuditSeverity.HIGH) {
      // Send alert to monitoring system
      console.warn('🚨 CRITICAL SECURITY EVENT:', event);
    }
  }

  /**
   * Middleware for Express to automatically log API requests
   */
  static auditMiddleware() {
    return (req: Request, res: Response, next: Function) => {
      const startTime = Date.now();

      // Capture original response methods
      const originalSend = res.send;
      const originalJson = res.json;

      const captureResponse = (data: any) => {
        const duration = Date.now() - startTime;
        this.logApiAccess(req, res, (req as any).user?.id, duration);
        return data;
      };

      res.send = function(data: any) {
        return originalSend.call(this, captureResponse(data));
      };

      res.json = function(data: any) {
        return originalJson.call(this, captureResponse(data));
      };

      next();
    };
  }
}

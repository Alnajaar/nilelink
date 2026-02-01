/**
 * NileLink Centralized Audit Logging Service
 * Provides production-grade tracking of all critical POS actions.
 * Logs are categorized by severity and can be anchored to the blockchain.
 */

export enum AuditLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    SECURITY = 'SECURITY',
    CRITICAL = 'CRITICAL',
    INVENTORY = 'INVENTORY',
    FINANCIAL = 'FINANCIAL'
}

export interface AuditLog {
    id: string;
    timestamp: number;
    level: AuditLevel;
    action: string;
    actor: {
        id: string;
        name: string;
        role: string;
    };
    details: any;
    terminalId: string;
    metadata?: {
        ip?: string;
        userAgent?: string;
        blockchainTx?: string;
    };
}

class AuditLogger {
    private static instance: AuditLogger;
    private readonly STORAGE_KEY = 'nilelink_audit_logs';
    private readonly MAX_LOGS = 5000;

    private constructor() { }

    public static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }

    /**
     * Log a critical action
     */
    public async log(
        level: AuditLevel,
        action: string,
        details: any,
        actor: { id: string; name: string; role: string },
        terminalId: string = 'POS-1'
    ): Promise<string> {
        const logEntry: AuditLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            level,
            action,
            actor,
            details,
            terminalId,
            metadata: {
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
            }
        };

        // 1. Console Logging (with color-coding for dev)
        this.printToConsole(logEntry);

        // 2. Local Storage Persistence (Recovery Buffer)
        this.saveToLocal(logEntry);

        // 3. Remote Sync (In production, this sends to Backend/Cloud)
        await this.syncToRemote(logEntry);

        // 4. Critical Alerting
        if (level === AuditLevel.CRITICAL || level === AuditLevel.SECURITY) {
            this.triggerAlert(logEntry);
        }

        return logEntry.id;
    }

    private printToConsole(log: AuditLog) {
        const colors = {
            [AuditLevel.INFO]: '\x1b[32m',     // Blue
            [AuditLevel.WARNING]: '\x1b[33m',  // Yellow
            [AuditLevel.SECURITY]: '\x1b[35m', // Magenta
            [AuditLevel.CRITICAL]: '\x1b[31m', // Red
            [AuditLevel.INVENTORY]: '\x1b[36m', // Cyan
            [AuditLevel.FINANCIAL]: '\x1b[32m', // Green
        };
        const reset = '\x1b[0m';

        console.log(
            `[${new Date(log.timestamp).toISOString()}] ${colors[log.level]}${log.level}${reset}: ${log.action}`,
            { actor: log.actor.name, details: log.details }
        );
    }

    private saveToLocal(log: AuditLog) {
        try {
            const existingRaw = localStorage.getItem(this.STORAGE_KEY);
            const logs: AuditLog[] = existingRaw ? JSON.parse(existingRaw) : [];

            logs.unshift(log); // Add to beginning

            // Keep only last N logs
            if (logs.length > this.MAX_LOGS) {
                logs.length = this.MAX_LOGS;
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to save audit log to localStorage', e);
        }
    }

    private async syncToRemote(log: AuditLog) {
        // Implement remote API call here
        // if (process.env.NODE_ENV === 'production') { ... }
    }

    private triggerAlert(log: AuditLog) {
        console.warn(`🚨 CRITICAL AUDIT ALERT: ${log.action}`);
        // Integration with PagerDuty / Slack / Email would go here
    }

    /**
     * Get recent logs (for manager dashboard)
     */
    public getRecentLogs(limit: number = 50): AuditLog[] {
        try {
            const existingRaw = localStorage.getItem(this.STORAGE_KEY);
            const logs: AuditLog[] = existingRaw ? JSON.parse(existingRaw) : [];
            return logs.slice(0, limit);
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear old logs
     */
    public clearLogs() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}

export const auditLogger = AuditLogger.getInstance();

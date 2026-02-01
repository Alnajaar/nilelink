/**
 * NileLink Alert Manager
 *
 * Manages security alerts, notifications, and incident response:
 * - Alert classification system with severity levels
 * - SMS/email notifications for managers
 * - In-app notification dashboard with acknowledgment
 * - Alert persistence, search, and history reporting
 * - Automated alert routing and escalation
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    AlertTriggeredEvent,
    AlertAcknowledgedEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface Alert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'security' | 'theft' | 'system' | 'operational';
    title: string;
    message: string;
    context: Record<string, any>;
    source: string;
    timestamp: number;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
    resolved: boolean;
    resolvedAt?: number;
    resolvedBy?: string;
    notificationSent: boolean;
    escalationLevel: number;
    tags: string[];
}

export interface AlertRule {
    id: string;
    name: string;
    condition: AlertCondition;
    actions: AlertAction[];
    enabled: boolean;
    priority: number;
}

export interface AlertCondition {
    severity?: string[];
    category?: string[];
    source?: string[];
    messageContains?: string[];
    contextMatches?: Record<string, any>;
}

export interface AlertAction {
    type: 'notify' | 'escalate' | 'lock_transaction' | 'disable_scanner' | 'page_manager';
    target?: string; // email, phone, user_id, etc.
    template?: string;
    delay?: number; // delay in minutes
}

export interface AlertStats {
    total: number;
    acknowledged: number;
    resolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<string, number>;
    recentActivity: Alert[];
}

export class AlertManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private alerts = new Map<string, Alert>();
    private alertRules: AlertRule[] = [];
    private notificationChannels = new Map<string, NotificationChannel>();

    // Configuration
    private readonly MAX_STORED_ALERTS = 10000;
    private readonly ESCALATION_INTERVALS = [5, 15, 60]; // minutes
    private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializeDefaultRules();
        this.initializeNotificationChannels();
        this.loadExistingAlerts();
        this.startAlertProcessor();
    }

    /**
     * Create a new alert
     */
    async createAlert(
        severity: 'low' | 'medium' | 'high' | 'critical',
        category: 'security' | 'theft' | 'system' | 'operational',
        title: string,
        message: string,
        context: Record<string, any>,
        source: string,
        tags: string[] = []
    ): Promise<Alert> {
        const alert: Alert = {
            id: uuidv4(),
            severity,
            category,
            title,
            message,
            context,
            source,
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false,
            notificationSent: false,
            escalationLevel: 0,
            tags
        };

        this.alerts.set(alert.id, alert);

        // Create event
        await this.eventEngine.createEvent<AlertTriggeredEvent>(
            EventType.ALERT_TRIGGERED,
            'system',
            {
                alertId: alert.id,
                severity,
                category,
                title,
                message,
                context,
                source,
                acknowledged: false,
            }
        );

        // Process alert through rules
        await this.processAlertRules(alert);

        // Send immediate notifications for critical alerts
        if (severity === 'critical') {
            await this.sendImmediateNotification(alert);
        }

        return alert;
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(
        alertId: string,
        acknowledgedBy: string,
        notes?: string
    ): Promise<boolean> {
        const alert = this.alerts.get(alertId);
        if (!alert || alert.acknowledged) {
            return false;
        }

        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = Date.now();

        if (notes) {
            alert.context.notes = notes;
        }

        // Create acknowledgment event
        await this.eventEngine.createEvent<AlertAcknowledgedEvent>(
            EventType.ALERT_ACKNOWLEDGED,
            acknowledgedBy,
            {
                alertId,
                acknowledgedBy,
                timestamp: alert.acknowledgedAt,
                notes
            }
        );

        return true;
    }

    /**
     * Resolve an alert
     */
    async resolveAlert(
        alertId: string,
        resolvedBy: string,
        resolution?: string
    ): Promise<boolean> {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            return false;
        }

        alert.resolved = true;
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = Date.now();

        if (resolution) {
            alert.context.resolution = resolution;
        }

        return true;
    }

    /**
     * Get alert by ID
     */
    getAlert(alertId: string): Alert | undefined {
        return this.alerts.get(alertId);
    }

    /**
     * Get alerts with filtering
     */
    getAlerts(filters?: {
        severity?: string[];
        category?: string[];
        acknowledged?: boolean;
        resolved?: boolean;
        source?: string[];
        tags?: string[];
        since?: number;
        limit?: number;
    }): Alert[] {
        let alerts = Array.from(this.alerts.values());

        if (filters) {
            if (filters.severity?.length) {
                alerts = alerts.filter(a => filters.severity!.includes(a.severity));
            }
            if (filters.category?.length) {
                alerts = alerts.filter(a => filters.category!.includes(a.category));
            }
            if (filters.acknowledged !== undefined) {
                alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
            }
            if (filters.resolved !== undefined) {
                alerts = alerts.filter(a => a.resolved === filters.resolved);
            }
            if (filters.source?.length) {
                alerts = alerts.filter(a => filters.source!.includes(a.source));
            }
            if (filters.tags?.length) {
                alerts = alerts.filter(a => filters.tags!.some(tag => a.tags.includes(tag)));
            }
            if (filters.since) {
                alerts = alerts.filter(a => a.timestamp >= filters.since!);
            }
        }

        // Sort by timestamp descending
        alerts.sort((a, b) => b.timestamp - a.timestamp);

        if (filters?.limit) {
            alerts = alerts.slice(0, filters.limit);
        }

        return alerts;
    }

    /**
     * Get alert statistics
     */
    getAlertStats(timeRange?: number): AlertStats {
        const since = timeRange ? Date.now() - timeRange : 0;
        const alerts = Array.from(this.alerts.values()).filter(a => a.timestamp >= since);

        const byCategory: Record<string, number> = {};
        alerts.forEach(alert => {
            byCategory[alert.category] = (byCategory[alert.category] || 0) + 1;
        });

        return {
            total: alerts.length,
            acknowledged: alerts.filter(a => a.acknowledged).length,
            resolved: alerts.filter(a => a.resolved).length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length,
            byCategory,
            recentActivity: alerts.slice(0, 10)
        };
    }

    /**
     * Process alert rules and trigger actions
     */
    private async processAlertRules(alert: Alert): Promise<void> {
        for (const rule of this.alertRules.filter(r => r.enabled)) {
            if (this.matchesCondition(alert, rule.condition)) {
                for (const action of rule.actions) {
                    await this.executeAction(alert, action);
                }
            }
        }
    }

    /**
     * Check if alert matches condition
     */
    private matchesCondition(alert: Alert, condition: AlertCondition): boolean {
        if (condition.severity && !condition.severity.includes(alert.severity)) {
            return false;
        }
        if (condition.category && !condition.category.includes(alert.category)) {
            return false;
        }
        if (condition.source && !condition.source.includes(alert.source)) {
            return false;
        }
        if (condition.messageContains) {
            const messageMatch = condition.messageContains.some(contains =>
                alert.message.toLowerCase().includes(contains.toLowerCase())
            );
            if (!messageMatch) return false;
        }
        if (condition.contextMatches) {
            for (const [key, value] of Object.entries(condition.contextMatches)) {
                if (alert.context[key] !== value) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Execute alert action
     */
    private async executeAction(alert: Alert, action: AlertAction): Promise<void> {
        switch (action.type) {
            case 'notify':
                await this.sendNotification(alert, action);
                break;
            case 'escalate':
                await this.escalateAlert(alert);
                break;
            case 'lock_transaction':
                // Integration with TheftPreventionEngine would go here
                break;
            case 'disable_scanner':
                // Integration with ScannerManager would go here
                break;
            case 'page_manager':
                await this.pageManager(alert);
                break;
        }
    }

    /**
     * Send notification
     */
    private async sendNotification(alert: Alert, action: AlertAction): Promise<void> {
        const channel = this.notificationChannels.get(action.target || 'default');
        if (!channel) return;

        const message = this.formatNotificationMessage(alert, action.template);

        try {
            switch (channel.type) {
                case 'email':
                    await this.sendEmail(channel.config.email, message);
                    break;
                case 'sms':
                    await this.sendSMS(channel.config.phone, message);
                    break;
                case 'webhook':
                    await this.sendWebhook(channel.config.url, alert);
                    break;
            }

            alert.notificationSent = true;
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    /**
     * Send immediate notification for critical alerts
     */
    private async sendImmediateNotification(alert: Alert): Promise<void> {
        // Send to all manager channels
        for (const [channelId, channel] of this.notificationChannels) {
            if (channel.config.manager) {
                await this.sendNotification(alert, {
                    type: 'notify',
                    target: channelId,
                    template: 'critical_alert'
                });
            }
        }
    }

    /**
     * Escalate alert
     */
    private async escalateAlert(alert: Alert): Promise<void> {
        alert.escalationLevel++;

        // Create escalation alert
        await this.createAlert(
            'critical',
            'system',
            `ALERT ESCALATION: ${alert.title}`,
            `Alert escalated to level ${alert.escalationLevel}: ${alert.message}`,
            { ...alert.context, escalationLevel: alert.escalationLevel },
            'AlertManager',
            ['escalation']
        );
    }

    /**
     * Page manager (highest priority notification)
     */
    private async pageManager(alert: Alert): Promise<void> {
        // Send to all manager channels immediately
        for (const [channelId, channel] of this.notificationChannels) {
            if (channel.config.manager) {
                const message = `🚨 MANAGER PAGE: ${alert.title} - ${alert.message}`;
                switch (channel.type) {
                    case 'sms':
                        await this.sendSMS(channel.config.phone, message);
                        break;
                    case 'email':
                        await this.sendEmail(channel.config.email, `CRITICAL: ${message}`);
                        break;
                }
            }
        }
    }

    /**
     * Format notification message
     */
    private formatNotificationMessage(alert: Alert, template?: string): string {
        if (template === 'critical_alert') {
            return `🚨 CRITICAL ALERT: ${alert.title}\n${alert.message}\nSeverity: ${alert.severity.toUpperCase()}\nTime: ${new Date(alert.timestamp).toLocaleString()}`;
        }

        return `${alert.severity.toUpperCase()}: ${alert.title} - ${alert.message}`;
    }

    /**
     * Mock notification methods (would integrate with real services)
     */
    private async sendEmail(email: string, message: string): Promise<void> {
        console.log(`📧 Sending email to ${email}: ${message}`);
        // In real implementation, integrate with email service
    }

    private async sendSMS(phone: string, message: string): Promise<void> {
        console.log(`📱 Sending SMS to ${phone}: ${message}`);
        // In real implementation, integrate with SMS service
    }

    private async sendWebhook(url: string, alert: Alert): Promise<void> {
        console.log(`🔗 Sending webhook to ${url}:`, alert);
        // In real implementation, make HTTP request
    }

    /**
     * Initialize default alert rules
     */
    private initializeDefaultRules(): void {
        this.alertRules = [
            {
                id: 'critical_security',
                name: 'Critical Security Alerts',
                condition: { severity: ['critical'], category: ['security'] },
                actions: [
                    { type: 'notify', target: 'manager_email' },
                    { type: 'notify', target: 'manager_sms' },
                    { type: 'page_manager' }
                ],
                enabled: true,
                priority: 1
            },
            {
                id: 'theft_detection',
                name: 'Theft Detection',
                condition: { category: ['theft'] },
                actions: [
                    { type: 'notify', target: 'security_team' },
                    { type: 'lock_transaction' }
                ],
                enabled: true,
                priority: 2
            },
            {
                id: 'system_alerts',
                name: 'System Alerts',
                condition: { category: ['system'] },
                actions: [
                    { type: 'notify', target: 'it_team', delay: 5 }
                ],
                enabled: true,
                priority: 3
            }
        ];
    }

    /**
     * Initialize notification channels
     */
    private initializeNotificationChannels(): void {
        // Mock channels - in real implementation, loaded from config
        this.notificationChannels.set('manager_email', {
            type: 'email',
            config: { email: 'manager@store.com', manager: true }
        });

        this.notificationChannels.set('manager_sms', {
            type: 'sms',
            config: { phone: '+1234567890', manager: true }
        });

        this.notificationChannels.set('security_team', {
            type: 'email',
            config: { email: 'security@store.com' }
        });

        this.notificationChannels.set('it_team', {
            type: 'webhook',
            config: { url: 'https://it-monitoring.service.com/alerts' }
        });
    }

    /**
     * Load existing alerts from events
     */
    private async loadExistingAlerts(): Promise<void> {
        try {
            const events = await this.ledger.getAllEvents();

            for (const event of events) {
                if (event.type === EventType.ALERT_TRIGGERED) {
                    const alert: Alert = {
                        id: event.payload.alertId,
                        severity: event.payload.severity,
                        category: event.payload.category,
                        title: event.payload.title,
                        message: event.payload.message,
                        context: event.payload.context,
                        source: event.payload.source,
                        timestamp: event.timestamp,
                        acknowledged: event.payload.acknowledged,
                        resolved: false,
                        notificationSent: false,
                        escalationLevel: 0,
                        tags: []
                    };

                    this.alerts.set(alert.id, alert);
                }
            }

            // Cleanup old alerts
            this.cleanupOldAlerts();

        } catch (error) {
            console.error('Failed to load existing alerts:', error);
        }
    }

    /**
     * Start alert processor for escalation and cleanup
     */
    private startAlertProcessor(): void {
        // Process escalations every 5 minutes
        setInterval(() => {
            this.processEscalations();
        }, 5 * 60 * 1000);

        // Cleanup old alerts daily
        setInterval(() => {
            this.cleanupOldAlerts();
        }, this.CLEANUP_INTERVAL);
    }

    /**
     * Process alert escalations
     */
    private processEscalations(): void {
        const now = Date.now();

        for (const alert of this.alerts.values()) {
            if (!alert.acknowledged && !alert.resolved) {
                const ageMinutes = (now - alert.timestamp) / (1000 * 60);
                const currentLevel = alert.escalationLevel;

                if (currentLevel < this.ESCALATION_INTERVALS.length &&
                    ageMinutes >= this.ESCALATION_INTERVALS[currentLevel]) {
                    this.escalateAlert(alert);
                }
            }
        }
    }

    /**
     * Cleanup old alerts to prevent memory bloat
     */
    private cleanupOldAlerts(): void {
        const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
        const oldAlerts: string[] = [];

        for (const [id, alert] of this.alerts) {
            if (alert.timestamp < cutoffTime && alert.resolved) {
                oldAlerts.push(id);
            }
        }

        for (const id of oldAlerts) {
            this.alerts.delete(id);
        }

        // If still too many alerts, remove oldest resolved ones
        if (this.alerts.size > this.MAX_STORED_ALERTS) {
            const sortedAlerts = Array.from(this.alerts.values())
                .filter(a => a.resolved)
                .sort((a, b) => a.timestamp - b.timestamp);

            const toRemove = sortedAlerts.slice(0, this.alerts.size - this.MAX_STORED_ALERTS + 100);
            for (const alert of toRemove) {
                this.alerts.delete(alert.id);
            }
        }
    }
}

// Helper interfaces
interface NotificationChannel {
    type: 'email' | 'sms' | 'webhook';
    config: {
        email?: string;
        phone?: string;
        url?: string;
        manager?: boolean;
    };
}
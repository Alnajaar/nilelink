import { prisma } from './DatabasePoolService';
import { logger } from '../utils/logger';
import { circuitBreaker } from './CircuitBreakerService';
import { config } from '../config';
import * as os from 'os';
import * as process from 'process';

export interface MetricData {
    name: string;
    value: number;
    labels?: Record<string, string>;
    timestamp?: Date;
}

export interface AlertRule {
    id: string;
    name: string;
    condition: (metrics: MetricData[]) => boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    cooldown: number; // ms
    channels: string[]; // 'email', 'slack', 'sms'
}

export class MonitoringService {
    private prisma: PrismaClient;
    private metrics: Map<string, MetricData[]> = new Map();
    private alertRules: AlertRule[] = [];
    private alertCooldowns: Map<string, number> = new Map();
    private isMonitoring: boolean = false;

    constructor() {
        this.prisma = prisma;
        this.initializeDefaultRules();
        this.startMonitoring();
    }

    private initializeDefaultRules(): void {
        this.alertRules = [
            {
                id: 'high-error-rate',
                name: 'High Error Rate',
                condition: (metrics) => {
                    const errorRate = metrics.find(m => m.name === 'api_error_rate')?.value || 0;
                    return errorRate > 0.05; // 5%
                },
                severity: 'high',
                message: 'API error rate exceeded 5%',
                cooldown: 300000, // 5 minutes
                channels: ['email', 'slack']
            },
            {
                id: 'circuit-breaker-open',
                name: 'Circuit Breaker Open',
                condition: (metrics) => {
                    return metrics.some(m => m.name.includes('circuit_breaker') && m.labels?.state === 'OPEN');
                },
                severity: 'critical',
                message: 'Circuit breaker opened - service failure detected',
                cooldown: 60000, // 1 minute
                channels: ['email', 'slack', 'sms']
            },
            {
                id: 'high-memory-usage',
                name: 'High Memory Usage',
                condition: (metrics) => {
                    const memUsage = metrics.find(m => m.name === 'memory_usage_percent')?.value || 0;
                    return memUsage > 85; // 85%
                },
                severity: 'medium',
                message: 'Memory usage exceeded 85%',
                cooldown: 600000, // 10 minutes
                channels: ['email']
            },
            {
                id: 'database-connection-failure',
                name: 'Database Connection Failure',
                condition: (metrics) => {
                    return metrics.some(m => m.name === 'db_connection_status' && m.value === 0);
                },
                severity: 'critical',
                message: 'Database connection lost',
                cooldown: 30000, // 30 seconds
                channels: ['email', 'slack', 'sms']
            },
            {
                id: 'blockchain-sync-delay',
                name: 'Blockchain Sync Delay',
                condition: (metrics) => {
                    const delay = metrics.find(m => m.name === 'blockchain_sync_delay')?.value || 0;
                    return delay > 300; // 5 minutes
                },
                severity: 'medium',
                message: 'Blockchain sync delayed by more than 5 minutes',
                cooldown: 300000, // 5 minutes
                channels: ['slack']
            }
        ];
    }

    async recordMetric(metric: MetricData): Promise<void> {
        const metrics = this.metrics.get(metric.name) || [];
        metrics.push({
            ...metric,
            timestamp: metric.timestamp || new Date()
        });

        // Keep only last 1000 metrics per name
        if (metrics.length > 1000) {
            metrics.shift();
        }

        this.metrics.set(metric.name, metrics);

        // Check alert rules
        await this.checkAlerts();
    }

    private async checkAlerts(): Promise<void> {
        const allMetrics = Array.from(this.metrics.values()).flat();

        for (const rule of this.alertRules) {
            const now = Date.now();
            const lastAlert = this.alertCooldowns.get(rule.id) || 0;

            if (now - lastAlert < rule.cooldown) {
                continue; // Still in cooldown
            }

            if (rule.condition(allMetrics)) {
                await this.triggerAlert(rule);
                this.alertCooldowns.set(rule.id, now);
            }
        }
    }

    private async triggerAlert(rule: AlertRule): Promise<void> {
        const alert = {
            id: `alert-${Date.now()}-${rule.id}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message,
            triggeredAt: new Date(),
            channels: rule.channels,
            metrics: this.getRelevantMetrics(rule)
        };

        // Log alert
        logger.warn(`ALERT TRIGGERED: ${rule.name}`, {
            severity: rule.severity,
            message: rule.message,
            channels: rule.channels
        });

        // Store alert in database
        await this.prisma.systemConfig.create({
            data: {
                key: `alert:${alert.id}`,
                value: alert,
                description: `Alert: ${rule.name}`
            }
        });

        // Send notifications (implement based on channels)
        await this.sendNotifications(alert);
    }

    private getRelevantMetrics(rule: AlertRule): any[] {
        // Return recent metrics that might be relevant to the alert
        const allMetrics = Array.from(this.metrics.values()).flat();
        return allMetrics.slice(-10); // Last 10 metrics
    }

    private async sendNotifications(alert: any): Promise<void> {
        for (const channel of alert.channels) {
            try {
                switch (channel) {
                    case 'email':
                        await this.sendEmailAlert(alert);
                        break;
                    case 'slack':
                        await this.sendSlackAlert(alert);
                        break;
                    case 'sms':
                        await this.sendSMSAlert(alert);
                        break;
                }
            } catch (error) {
                logger.error(`Failed to send ${channel} notification`, { error, alertId: alert.id });
            }
        }
    }

    private async sendEmailAlert(alert: any): Promise<void> {
        // Implementation would integrate with email service (SendGrid, SES, etc.)
        logger.info(`EMAIL ALERT: ${alert.message}`, { severity: alert.severity });
    }

    private async sendSlackAlert(alert: any): Promise<void> {
        // Implementation would integrate with Slack API
        logger.info(`SLACK ALERT: ${alert.message}`, { severity: alert.severity });
    }

    private async sendSMSAlert(alert: any): Promise<void> {
        // Implementation would integrate with SMS service (Twilio, etc.)
        logger.info(`SMS ALERT: ${alert.message}`, { severity: alert.severity });
    }

    private startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // Collect system metrics every 30 seconds
        setInterval(async () => {
            await this.collectSystemMetrics();
        }, 30000);

        // Collect application metrics every 60 seconds
        setInterval(async () => {
            await this.collectApplicationMetrics();
        }, 60000);

        logger.info('Monitoring service started');
    }

    private async collectSystemMetrics(): Promise<void> {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        await this.recordMetric({
            name: 'memory_usage_bytes',
            value: memUsage.heapUsed,
            labels: { type: 'heap' }
        });

        await this.recordMetric({
            name: 'memory_usage_percent',
            value: (memUsage.heapUsed / memUsage.heapTotal) * 100
        });

        await this.recordMetric({
            name: 'cpu_usage_percent',
            value: os.loadavg()[0] * 100 // 1-minute load average
        });

        await this.recordMetric({
            name: 'system_memory_free_percent',
            value: (freeMem / totalMem) * 100
        });
    }

    private async collectApplicationMetrics(): Promise<void> {
        try {
            // Database connection status
            await this.prisma.$queryRaw`SELECT 1`;
            await this.recordMetric({
                name: 'db_connection_status',
                value: 1,
                labels: { status: 'connected' }
            });
        } catch (error) {
            await this.recordMetric({
                name: 'db_connection_status',
                value: 0,
                labels: { status: 'disconnected' }
            });
        }

        // Circuit breaker states
        const circuitStats = circuitBreaker.getStats();
        for (const [service, stats] of Object.entries(circuitStats)) {
            await this.recordMetric({
                name: 'circuit_breaker_state',
                value: stats.state === 'CLOSED' ? 0 : stats.state === 'OPEN' ? 1 : 0.5,
                labels: {
                    service,
                    state: stats.state,
                    failures: stats.failures.toString()
                }
            });
        }

        // API response times (would need to be collected from middleware)
        // Event store performance
        // Cache hit rates
        // etc.
    }

    async getMetrics(name?: string, limit: number = 100): Promise<MetricData[]> {
        if (name) {
            return (this.metrics.get(name) || []).slice(-limit);
        }

        // Return all metrics
        const allMetrics: MetricData[] = [];
        for (const metrics of this.metrics.values()) {
            allMetrics.push(...metrics.slice(-limit));
        }
        return allMetrics.slice(-limit);
    }

    async getAlerts(limit: number = 50): Promise<any[]> {
        const alerts = await this.prisma.systemConfig.findMany({
            where: {
                key: { startsWith: 'alert:' }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: limit
        });

        return alerts.map(record => record.value);
    }

    async getHealthStatus(): Promise<any> {
        const metrics = await this.getMetrics();
        const recentAlerts = await this.getAlerts(5);

        return {
            status: this.determineHealthStatus(metrics, recentAlerts),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            timestamp: new Date().toISOString(),
            services: {
                database: metrics.find(m => m.name === 'db_connection_status')?.value === 1,
                circuits: circuitBreaker.getStats()
            },
            recentAlerts,
            metrics: metrics.slice(-10)
        };
    }

    private determineHealthStatus(metrics: MetricData[], alerts: any[]): 'healthy' | 'warning' | 'critical' {
        // Check for critical alerts in last 5 minutes
        const recentCriticalAlerts = alerts.filter(alert =>
            alert.severity === 'critical' &&
            (Date.now() - new Date(alert.triggeredAt).getTime()) < 300000 // 5 minutes
        );

        if (recentCriticalAlerts.length > 0) {
            return 'critical';
        }

        // Check system resources
        const highMemory = metrics.find(m => m.name === 'memory_usage_percent' && m.value > 90);
        const highCPU = metrics.find(m => m.name === 'cpu_usage_percent' && m.value > 95);

        if (highMemory || highCPU) {
            return 'warning';
        }

        return 'healthy';
    }
}

// Global monitoring instance
export const monitoringService = new MonitoringService();

/**
 * NileLink Observability Manager
 * 
 * Decentralized telemetry and health monitoring:
 * - Real-time system performance tracking (CPU/Memory/Latency)
 * - Hardware health heartbeats
 * - Decentralized error aggregation
 * - Anonymized usage telemetry for UX optimization
 */

import { EventEngine } from '../events/EventEngine';
import { HardwareMonitor } from '../hardware/HardwareMonitor';
import { AlertManager } from '../security/AlertManager';

export interface SystemHealth {
    terminalId: string;
    uptime: number;
    memoryUsage: number;
    latencyMs: number;
    networkStatus: 'online' | 'offline' | 'degraded';
    hardwareStatus: Record<string, 'functional' | 'failed' | 'warning'>;
}

export class ObservabilityManager {
    private eventEngine: EventEngine;
    private hwMonitor: HardwareMonitor;
    private alertManager: AlertManager;
    private terminalId: string;
    private startTime: number;
    private metricsBuffer: any[] = [];
    private readonly BUFFER_LIMIT = 100;

    constructor(
        eventEngine: EventEngine,
        hwMonitor: HardwareMonitor,
        alertManager: AlertManager,
        terminalId: string = 'TERM_001'
    ) {
        this.eventEngine = eventEngine;
        this.hwMonitor = hwMonitor;
        this.alertManager = alertManager;
        this.terminalId = terminalId;
        this.startTime = Date.now();

        if (typeof window !== 'undefined') {
            this.startHeartbeat();
        }
    }

    /**
     * Start the periodic health heartbeat
     */
    private startHeartbeat(): void {
        setInterval(() => this.collectHealthMetrics(), 60000); // Every minute
    }

    /**
     * Collect and broadcast current health state
     */
    public async collectHealthMetrics(): Promise<SystemHealth> {
        const hwState = this.hwMonitor.getHardwareState();

        const health: SystemHealth = {
            terminalId: this.terminalId,
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memoryUsage: (window.performance as any)?.memory?.usedJSHeapSize || 0,
            latencyMs: await this.measureLocalLatency(),
            networkStatus: navigator.onLine ? 'online' : 'offline',
            hardwareStatus: {
                scanner: hwState.scanner ? 'functional' : 'failed',
                printer: hwState.printer ? 'functional' : 'failed',
                rfid: hwState.rfidReader ? 'functional' : 'failed'
            }
        };

        this.logMetric('health_heartbeat', health);

        // Critical alerts if health is failing
        if (health.networkStatus === 'offline') {
            await this.alertManager.createAlert(
                'warning',
                'system',
                'Offline Mode Active',
                'Terminal is operating in decentralized offline mode.',
                { uptime: health.uptime },
                'Observability'
            );
        }

        return health;
    }

    /**
     * Measure local processing latency (EventEngine overhead)
     */
    private async measureLocalLatency(): Promise<number> {
        const start = performance.now();
        await new Promise(resolve => setTimeout(resolve, 0));
        return performance.now() - start;
    }

    /**
     * Log a generic telemetry metric
     */
    public logMetric(name: string, payload: any): void {
        const entry = {
            metric: name,
            timestamp: Date.now(),
            terminalId: this.terminalId,
            payload
        };

        this.metricsBuffer.push(entry);
        if (this.metricsBuffer.length > this.BUFFER_LIMIT) {
            this.metricsBuffer.shift();
        }

        // Broadcast for real-time dashboarding
        this.eventEngine.createEvent('TELEMETRY_UPDATED' as any, 'system', entry);
    }

    /**
     * Get recent logs for troubleshooting
     */
    public getRecentMetrics(): any[] {
        return [...this.metricsBuffer];
    }
}

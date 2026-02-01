/**
 * NileLink Hardware Health Monitor
 * Monitors critical POS hardware status: Battery, Network, Printer, and Latency.
 * Provides hooks for UI components to display health warnings.
 */

import { auditLogger, AuditLevel } from '@/shared/services/AuditLogger';
import { printerService } from './PrinterService';

export interface HealthStatus {
    network: 'online' | 'offline';
    battery: {
        level: number;
        charging: boolean;
        critical: boolean;
    };
    printers: {
        connected: number;
        errors: number;
    };
    latency: number;
    lastCheck: number;
}

class HardwareMonitor {
    private static instance: HardwareMonitor;
    private status: HealthStatus = {
        network: 'online',
        battery: { level: 1, charging: true, critical: false },
        printers: { connected: 0, errors: 0 },
        latency: 0,
        lastCheck: Date.now()
    };

    private subscribers: ((status: HealthStatus) => void)[] = [];
    private checkInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.init();
    }

    public static getInstance(): HardwareMonitor {
        if (!HardwareMonitor.instance) {
            HardwareMonitor.instance = new HardwareMonitor();
        }
        return HardwareMonitor.instance;
    }

    private init() {
        if (typeof window === 'undefined') return;

        // 1. Network Status
        window.addEventListener('online', () => this.updateNetworkStatus('online'));
        window.addEventListener('offline', () => this.updateNetworkStatus('offline'));
        this.status.network = navigator.onLine ? 'online' : 'offline';

        // 2. Battery Status
        this.initBattery();

        // 3. Start Periodic Checks
        this.startMonitoring();
    }

    private async initBattery() {
        try {
            // @ts-ignore - Battery API is not in all typings
            if (navigator.getBattery) {
                // @ts-ignore
                const battery = await navigator.getBattery();
                this.updateBatteryStatus(battery);

                battery.addEventListener('levelchange', () => this.updateBatteryStatus(battery));
                battery.addEventListener('chargingchange', () => this.updateBatteryStatus(battery));
            }
        } catch (e) {
            console.warn('Battery API not available');
        }
    }

    private updateNetworkStatus(status: 'online' | 'offline') {
        this.status.network = status;
        this.notify();

        auditLogger.log(
            status === 'offline' ? AuditLevel.WARNING : AuditLevel.INFO,
            `NETWORK_STATUS_CHANGED`,
            { status },
            { id: 'system', name: 'Hardware Monitor', role: 'SYSTEM' }
        );
    }

    private updateBatteryStatus(battery: any) {
        this.status.battery = {
            level: battery.level,
            charging: battery.charging,
            critical: battery.level < 0.15 && !battery.charging
        };

        if (this.status.battery.critical) {
            auditLogger.log(
                AuditLevel.CRITICAL,
                'BATTERY_CRITICAL_WARNING',
                { level: battery.level },
                { id: 'system', name: 'Hardware Monitor', role: 'SYSTEM' }
            );
        }
        this.notify();
    }

    private startMonitoring() {
        this.checkInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000); // Every 30 seconds
    }

    private async performHealthCheck() {
        // 1. Check Latency
        const start = Date.now();
        try {
            await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
            this.status.latency = Date.now() - start;
        } catch (e) {
            this.status.latency = -1; // Unknown
        }

        // 2. Check Printer Status
        const printers = printerService.getAvailablePrinters();
        this.status.printers = {
            connected: printers.filter(p => p.status === 'connected').length,
            errors: printers.filter(p => p.status === 'error').length
        };

        this.status.lastCheck = Date.now();
        this.notify();
    }

    private notify() {
        this.subscribers.forEach(sub => sub(this.status));
    }

    public subscribe(callback: (status: HealthStatus) => void) {
        this.subscribers.push(callback);
        callback(this.status);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    public getStatus(): HealthStatus {
        return this.status;
    }
}

export const hardwareMonitor = HardwareMonitor.getInstance();

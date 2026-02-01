/**
 * HardwareMonitor - Peripheral Health Heartbeat
 * 
 * Monitors connectivity and status of physical peripherals
 * (Printers, Cash Drawers, Scales, Card Readers).
 */

import { telemetry } from '@shared/engines/TelemetryEngine';

export type PeripheralStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'BUSY';

export interface HardwareState {
    printer: PeripheralStatus;
    cashDrawer: PeripheralStatus;
    cardReader: PeripheralStatus;
    scale: PeripheralStatus;
    rfidReader: PeripheralStatus;
}

export class HardwareMonitor {
    private static instance: HardwareMonitor;
    private state: HardwareState = {
        printer: 'ONLINE',
        cashDrawer: 'ONLINE',
        cardReader: 'ONLINE',
        scale: 'ONLINE',
        rfidReader: 'ONLINE'
    };

    private constructor() {
        // Start heartbeat poll
        setInterval(() => this.poll(), 30000);
    }

    public static getInstance(): HardwareMonitor | null {
        if (typeof window === 'undefined') return null;
        if (!HardwareMonitor.instance) {
            HardwareMonitor.instance = new HardwareMonitor();
        }
        return HardwareMonitor.instance;
    }

    private async poll(): Promise<void> {
        // In a real environment, this would call specialized browser APIs 
        // or a local socket bridge to the hardware drivers.

        // Simulating a minor warning for demo purposes
        if (Math.random() > 0.95) {
            this.state.printer = 'WARNING';
            telemetry.report({
                nodeId: 'POS-01',
                level: 'WARN',
                category: 'HARDWARE',
                message: 'Printer paper low (approx 10% remaining)'
            });
        }
    }

    public getState(): HardwareState {
        return { ...this.state };
    }

    /**
     * Set explicit status (e.g. from service failure)
     */
    public setStatus(peripheral: keyof HardwareState, status: PeripheralStatus): void {
        this.state[peripheral] = status;
        if (status === 'OFFLINE' || status === 'WARNING') {
            telemetry.report({
                nodeId: 'POS-01',
                level: status === 'OFFLINE' ? 'ERROR' : 'WARN',
                category: 'HARDWARE',
                message: `${peripheral.toUpperCase()} status changed to ${status}`
            });
        }
    }
}

export const hardwareMonitor = HardwareMonitor.getInstance();

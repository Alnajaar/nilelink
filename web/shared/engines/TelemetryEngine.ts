/**
 * TelemetryEngine - Cross-Node Error & Event Monitoring
 * 
 * Aggregates client-side life-cycle events and errors from all
 * NileLink nodes and relays them to the Control Tower.
 */

export interface TelemetryEvent {
    nodeId: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
    category: 'SYNC' | 'HARDWARE' | 'AUTH' | 'NETWORK';
    message: string;
    timestamp: number;
    metadata?: any;
}

export class TelemetryEngine {
    private static instance: TelemetryEngine;
    private buffer: TelemetryEvent[] = [];
    private MAX_BUFFER = 100;

    private constructor() { }

    public static getInstance(): TelemetryEngine {
        if (!TelemetryEngine.instance) {
            TelemetryEngine.instance = new TelemetryEngine();
        }
        return TelemetryEngine.instance;
    }

    public report(event: Omit<TelemetryEvent, 'timestamp'>): void {
        const fullEvent: TelemetryEvent = {
            ...event,
            timestamp: Date.now()
        };

        console.log(`[Telemetry] [${fullEvent.level}] [${fullEvent.category}] ${fullEvent.message}`);

        this.buffer.push(fullEvent);
        if (this.buffer.length > this.MAX_BUFFER) {
            this.buffer.shift();
        }

        // In production, this would POST to the Unified Telemetry API
    }

    public getRecent(): TelemetryEvent[] {
        return [...this.buffer].reverse();
    }
}

export const telemetry = TelemetryEngine.getInstance();

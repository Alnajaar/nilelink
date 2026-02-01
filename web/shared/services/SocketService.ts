'use client';

/**
 * SocketService - Standardized WebSocket management for NileLink Ecosystem.
 * Currently simulates real-time streams with event-driven fallbacks.
 */
export class SocketService {
    private static instance: SocketService;
    private listeners: Map<string, Function[]> = new Map();
    private connected: boolean = false;

    private constructor() {
        this.connect();
    }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    private connect() {
        // In production: this.socket = io(process.env.NEXT_PUBLIC_WS_URL);
        console.log('[SocketService] Initializing Imperial Stream Connection...');

        // Simulate connection
        setTimeout(() => {
            this.connected = true;
            this.emit('connection', { status: 'stable', latency: '14ms' });
        }, 1000);

        // Simulate random ecosystem events
        setInterval(() => {
            if (this.connected) {
                const events = [
                    { type: 'order_created', data: { id: Math.random().toString(36).substr(2, 9), amount: 154.20, entity: 'Cairo-North-1' } },
                    { type: 'fleet_update', data: { activeDrivers: 42, idle: 3, alert: false } },
                    { type: 'neural_insight', data: { title: 'Demand Surge Predicted', confidence: 0.94 } },
                    { type: 'security_audit', data: { status: 'verified', node: 'Alex-Dist-2' } }
                ];
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                this.emit(randomEvent.type, randomEvent.data);
            }
        }, 8000);
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(event, eventListeners.filter(l => l !== callback));
        }
    }

    private emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(callback => callback(data));
        // Global listener
        this.listeners.get('*')?.forEach(callback => callback(event, data));
    }

    send(event: string, data: any) {
        console.log(`[SocketService] Sending Imperial Packet [${event}]:`, data);
        // In production: this.socket.emit(event, data);
    }

    getStatus() {
        return this.connected ? 'CONNECTED' : 'CONNECTING';
    }
}

export const socketService = SocketService.getInstance();

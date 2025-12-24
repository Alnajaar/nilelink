/**
 * ProtocolEngine - Ecosystem Aggregator for NileLink Dashboard
 * Aggregates events from POS, Delivery, Customer, and Supplier nodes.
 */

export interface AggregatedStats {
    totalVolume: number;
    activeNodes: number;
    deliverySuccessRate: number;
    protocolSequence: number;
    yieldVelo: number; // Ecosystem velocity
    cashDigitalRatio: number; // 0 to 1
}

export interface NetworkEvent {
    id: string;
    type: 'TRANSACTION' | 'SUPPLY' | 'DELIVERY' | 'SETTLEMENT';
    timestamp: number;
    amount: number;
    hash: string;
    origin: 'Cairo_North' | 'Giza_South' | 'Delta_Main';
}

export class ProtocolEngine {
    private networkKey = 'nl_protocol_network';

    constructor() {
        if (typeof window !== 'undefined' && !localStorage.getItem(this.networkKey)) {
            this.init();
        }
    }

    private init() {
        const initialData = {
            stats: {
                totalVolume: 1240500.85,
                activeNodes: 482,
                deliverySuccessRate: 0.992,
                protocolSequence: 102452,
                yieldVelo: 2.42,
                cashDigitalRatio: 0.65
            },
            recentEvents: [
                { id: 'E-01', type: 'TRANSACTION', timestamp: Date.now() - 2000, amount: 45.50, hash: 'h_a82f', origin: 'Cairo_North' },
                { id: 'E-02', type: 'SUPPLY', timestamp: Date.now() - 15000, amount: 1200.00, hash: 'h_b91e', origin: 'Delta_Main' },
                { id: 'E-03', type: 'DELIVERY', timestamp: Date.now() - 42000, amount: 5.00, hash: 'h_c22a', origin: 'Giza_South' },
            ]
        };
        localStorage.setItem(this.networkKey, JSON.stringify(initialData));
    }

    async getStats(): Promise<AggregatedStats> {
        const data = this.getData();
        return data.stats;
    }

    async getRecentEvents(): Promise<NetworkEvent[]> {
        const data = this.getData();
        return data.recentEvents;
    }

    private getData() {
        if (typeof window === 'undefined') return { stats: {}, recentEvents: [] };
        const raw = localStorage.getItem(this.networkKey);
        return raw ? JSON.parse(raw) : { stats: {}, recentEvents: [] };
    }

    async verifyHash(hash: string): Promise<boolean> {
        // In a real protocol, this would check against the Merkle root
        // Here we simulate checking the local sequence
        const data = this.getData();
        return data.recentEvents.some((e: any) => e.hash === hash) || hash.startsWith('h_');
    }
}

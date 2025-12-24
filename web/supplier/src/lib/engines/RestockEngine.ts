/**
 * RestockEngine - Predictive Intelligence for Supplier Hub
 * Forecasts demand and triggers restock alerts.
 */

import { SupplierLedger } from './SupplierLedger';

export class RestockEngine {
    private ledger: SupplierLedger;

    constructor() {
        this.ledger = new SupplierLedger();
    }

    async getForecast(): Promise<{ productId: string; name: string; predictedOutDays: number; status: 'STABLE' | 'WARNING' | 'CRITICAL' }[]> {
        const data = this.ledger.getData();
        const events = data.events.filter((e: any) => e.type === 'ORDER_DELIVERED');

        return data.catalog.map((item: any) => {
            // Mock velocity calculation
            const itemEvents = events.filter((e: any) => e.payload.items?.some((i: any) => i.id === item.id));
            const velocity = itemEvents.length > 0 ? (item.stock / 50) : 0; // Simulated velocity

            const predictedOutDays = velocity > 0 ? Math.floor(item.stock / velocity) : 999;
            let status: 'STABLE' | 'WARNING' | 'CRITICAL' = 'STABLE';

            if (predictedOutDays < 3 || item.stock < 20) status = 'CRITICAL';
            else if (predictedOutDays < 10 || item.stock < 50) status = 'WARNING';

            return {
                productId: item.id,
                name: item.name,
                predictedOutDays,
                status
            };
        });
    }

    async getRestockTriggers(): Promise<string[]> {
        const forecast = await this.getForecast();
        return forecast.filter(f => f.status === 'CRITICAL').map(f => `CRITICAL: ${f.name} (Predicted exhaustion in ${f.predictedOutDays} days)`);
    }
}

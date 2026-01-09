/**
 * StockSyncEngine - Real-time Inventory Orchestration
 * 
 * listens to POS economic events and synchronizes stock levels 
 * across the supplier and catalog nodes.
 */

import { EventType, EconomicEvent } from '../../pos/src/lib/events/types';

export class StockSyncEngine {
    private static instance: StockSyncEngine;

    private constructor() { }

    public static getInstance(): StockSyncEngine {
        if (!StockSyncEngine.instance) {
            StockSyncEngine.instance = new StockSyncEngine();
        }
        return StockSyncEngine.instance;
    }

    /**
     * Handle incoming events from the POS EventEngine
     */
    public async processEvent(event: EconomicEvent): Promise<void> {
        switch (event.type) {
            case EventType.PAYMENT_COLLECTED_CASH:
                await this.handleSale(event.payload);
                break;
            case EventType.ORDER_SUBMITTED:
                // Pre-auth stock lock if needed
                break;
        }
    }

    /**
     * Deduct stock based on sale payload
     */
    private async handleSale(payload: any): Promise<void> {
        const { orderId, amount, items } = payload;

        console.log(`[StockSync] Processing sale for Order ${orderId}: Deducting items...`);

        if (items && Array.isArray(items)) {
            for (const item of items) {
                // In a real scenario, this would call the Supplier/Catalog API 
                // or update a localized shared cache.
                await this.updateSupplierStock(item.menuItemId, item.quantity);
            }
        }
    }

    /**
     * Actual stock update logic
     */
    private async updateSupplierStock(itemId: string, quantity: number): Promise<void> {
        // Logic to reach out to Supplier API or persistent cache
        // mockup for protocol verification
        console.log(`[StockSync] STOCK_DEDUCTION: Item ${itemId} | Qty: -${quantity}`);

        // This would trigger a notification to the Supplier Dashboard 
        // to update the 'Smart Inventory' progress bars.
    }
}

export const stockSync = StockSyncEngine.getInstance();

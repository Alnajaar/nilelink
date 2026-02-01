import { EventType, EconomicEvent, InventoryLockIntentEvent, InventoryLockRejectedEvent } from '../../pos/src/lib/events/types';
import { EventEngine } from '../../pos/src/lib/events/EventEngine';
import { v4 as uuidv4 } from 'uuid';

export interface PendingLock {
    intentId: string;
    productId: string;
    quantity: number;
    sessionId: string;
    timestamp: number;
}

export class StockSyncEngine {
    private static instance: StockSyncEngine;
    private eventEngine: EventEngine | null = null;
    private pendingLocks = new Map<string, PendingLock>(); // intentId -> PendingLock
    private stockLevels = new Map<string, number>(); // productId -> actual quantity

    private constructor() { }

    public static getInstance(): StockSyncEngine {
        if (!StockSyncEngine.instance) {
            StockSyncEngine.instance = new StockSyncEngine();
        }
        return StockSyncEngine.instance;
    }

    public setEventEngine(engine: EventEngine) {
        this.eventEngine = engine;
    }

    /**
     * Handle incoming events from the POS EventEngine
     */
    public async processEvent(event: EconomicEvent): Promise<void> {
        switch (event.type) {
            case EventType.PAYMENT_COLLECTED_CASH:
            case EventType.PAYMENT_COLLECTED_CARD:
            case EventType.PAYMENT_COLLECTED_DIGITAL:
                await this.handleSale(event.payload);
                break;

            case EventType.INVENTORY_LOCK_INTENT:
                await this.handleRemoteIntent(event as InventoryLockIntentEvent);
                break;

            case EventType.ORDER_CANCELLED:
            case EventType.ORDER_COMPLETED:
                this.clearLocksForSession(event.payload.sessionId);
                break;
        }
    }

    /**
     * Propose an inventory lock for a product being added to cart
     */
    public async proposeLock(productId: string, quantity: number, sessionId: string): Promise<boolean> {
        if (!this.eventEngine) return false;

        const effectiveStock = this.getEffectiveStock(productId);
        if (effectiveStock < quantity) {
            console.warn(`[StockSync] Lock rejected: Insufficient effective stock for ${productId} (${effectiveStock} available)`);
            return false;
        }

        const intentId = uuidv4();

        // Broadcast intent to all nodes via decentralized event engine
        await this.eventEngine.createEvent<InventoryLockIntentEvent>(
            EventType.INVENTORY_LOCK_INTENT,
            'system',
            {
                intentId,
                productId,
                quantity,
                sessionId,
                timestamp: Date.now()
            }
        );

        return true;
    }

    /**
     * Calculate stock accounting for pending locks
     */
    public getEffectiveStock(productId: string): number {
        const actualStock = this.stockLevels.get(productId) || 100; // Default to 100 for demo
        let lockedQuantity = 0;

        for (const lock of this.pendingLocks.values()) {
            if (lock.productId === productId) {
                lockedQuantity += lock.quantity;
            }
        }

        return Math.max(0, actualStock - lockedQuantity);
    }

    /**
     * Handle intent broadcasted by another node or local
     */
    private async handleRemoteIntent(event: InventoryLockIntentEvent): Promise<void> {
        const { intentId, productId, quantity, sessionId, timestamp } = event.payload;

        // Check for conflicts (simple version: first come first served by timestamp)
        // If we already have locks that exceed stock, and this one is "later", we might reject it
        // In a true decentralized sync, nodes would eventually agree on the order.

        this.pendingLocks.set(intentId, {
            intentId,
            productId,
            quantity,
            sessionId,
            timestamp
        });

        console.log(`[StockSync] Lock Registered: ${productId} x ${quantity} (Intent: ${intentId})`);
    }

    private clearLocksForSession(sessionId: string): void {
        for (const [id, lock] of this.pendingLocks) {
            if (lock.sessionId === sessionId) {
                this.pendingLocks.delete(id);
            }
        }
    }

    /**
     * Deduct stock based on sale payload (permanent commitment)
     */
    private async handleSale(payload: any): Promise<void> {
        const { orderId, items } = payload;
        if (!items) return;

        console.log(`[StockSync] Permanently deducting stock for Order ${orderId}`);

        for (const item of items) {
            const current = this.stockLevels.get(item.productId) || 100;
            this.stockLevels.set(item.productId, current - item.quantity);
            await this.updateSupplierStock(item.productId, item.quantity);
        }
    }

    private async updateSupplierStock(itemId: string, quantity: number): Promise<void> {
        console.log(`[StockSync] DECENTRALIZED_STOCK_UPDATE: ${itemId} | -${quantity}`);
    }
}

export const stockSync = StockSyncEngine.getInstance();

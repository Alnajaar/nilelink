/**
 * OrderManagementEngine - POS ↔ App Sync Bridge
 * Handles catalog resolution, real-time order tracking, and history management.
 */

import { eventBus, createEvent } from '@shared/lib/EventBus';
import { apiService } from '@shared/services/api';

export interface MerchantCatalog {
    merchantId: string;
    catalogCid: string;
    items: any[];
    lastUpdated: number;
}

export interface TrackedOrder {
    id: string;
    merchantId: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    estimatedArrival?: number;
    items: any[];
    total: number;
}

export class OrderManagementEngine {
    private catalogsKey = 'nl_merchant_catalogs';
    private activeOrdersKey = 'nl_active_orders';

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem(this.catalogsKey)) {
                localStorage.setItem(this.catalogsKey, JSON.stringify({}));
            }
            if (!localStorage.getItem(this.activeOrdersKey)) {
                localStorage.setItem(this.activeOrdersKey, JSON.stringify([]));
            }
        }
    }

    /**
     * Resolve merchant catalog from IPFS using CID
     */
    async resolveCatalog(merchantId: string, catalogCid: string): Promise<MerchantCatalog> {
        // Check cache first
        const catalogs = this.getCachedCatalogs();
        if (catalogs[merchantId] && catalogs[merchantId].catalogCid === catalogCid) {
            return catalogs[merchantId];
        }

        console.log(`[OrderManagement] Resolving Catalog for ${merchantId} via CID: ${catalogCid}`);

        try {
            // Fetch from IPFS Gateway
            const response = await fetch(`https://ipfs.io/ipfs/${catalogCid}`);
            if (!response.ok) throw new Error('Failed to fetch from IPFS');

            const data = await response.json();

            const catalog: MerchantCatalog = {
                merchantId,
                catalogCid,
                items: data.products || [],
                lastUpdated: Date.now()
            };

            this.cacheCatalog(catalog);
            return catalog;
        } catch (error) {
            console.error('[OrderManagement] Catalog resolution failed:', error);
            throw error;
        }
    }

    private getCachedCatalogs(): Record<string, MerchantCatalog> {
        if (typeof window === 'undefined') return {};
        return JSON.parse(localStorage.getItem(this.catalogsKey) || '{}');
    }

    private cacheCatalog(catalog: MerchantCatalog): void {
        const catalogs = this.getCachedCatalogs();
        catalogs[catalog.merchantId] = catalog;
        localStorage.setItem(this.catalogsKey, JSON.stringify(catalogs));
    }

    /**
     * Start tracking an active order
     */
    async trackOrder(order: TrackedOrder): Promise<void> {
        const activeOrders = this.getActiveOrders();
        activeOrders.push(order);
        localStorage.setItem(this.activeOrdersKey, JSON.stringify(activeOrders));

        await eventBus.publish(createEvent('ORDER_TRACKING_STARTED', {
            orderId: order.id,
            merchantId: order.merchantId
        }, { source: 'OrderManagementEngine' }));
    }

    /**
     * Update order status (via polling or event)
     */
    async updateOrderStatus(orderId: string, status: TrackedOrder['status']): Promise<void> {
        const activeOrders = this.getActiveOrders();
        const orderIndex = activeOrders.findIndex(o => o.id === orderId);

        if (orderIndex !== -1) {
            activeOrders[orderIndex].status = status;
            localStorage.setItem(this.activeOrdersKey, JSON.stringify(activeOrders));

            await eventBus.publish(createEvent('ORDER_STATUS_UPDATED', {
                orderId,
                status
            }, { source: 'OrderManagementEngine', priority: 'high' }));
        }
    }

    getActiveOrders(): TrackedOrder[] {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(this.activeOrdersKey) || '[]');
    }

    /**
     * Remove order from active tracking
     */
    async archiveOrder(orderId: string): Promise<void> {
        const activeOrders = this.getActiveOrders();
        const filtered = activeOrders.filter(o => o.id !== orderId);
        localStorage.setItem(this.activeOrdersKey, JSON.stringify(filtered));
    }
}

// Global order management engine instance
export const orderManagementEngine = new OrderManagementEngine();

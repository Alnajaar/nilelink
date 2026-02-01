/**
 * Offline Sync Engine for POS PWA
 * Manages IndexedDB storage and synchronization with backend
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface POSDatabase extends DBSchema {
    products: {
        key: string; // barcode
        value: {
            barcode: string;
            globalProductId?: string;
            name: string;
            brand?: string;
            category: string;
            size?: string;
            price: number;
            stock: number;
            lastSynced?: string;
        };
    };
    syncQueue: {
        key: string; // operation ID
        value: {
            id: string;
            queueId?: string;
            operation: string;
            entityType: string;
            payload: any;
            status: 'pending' | 'synced' | 'failed' | 'retrying';
            retryCount: number;
            createdAt: string;
            error?: string;
        };
    };
}

export class OfflineSyncEngine {
    private db: IDBPDatabase<POSDatabase> | null = null;
    private businessId: string;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor(businessId: string) {
        this.businessId = businessId;
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        this.db = await openDB<POSDatabase>('nilelink-pos', 1, {
            upgrade(db) {
                // Create products store
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'barcode' });
                }

                // Create sync queue store
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    queueStore.createIndex('status', 'status');
                }
            },
        });

        // Auto-sync every 30 seconds if online
        this.startAutoSync(30000);
    }

    /**
     * Queue an operation for sync
     */
    async queueOperation(operation: string, entityType: string, payload: any) {
        if (!this.db) throw new Error('DB not initialized');

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await this.db.add('syncQueue', {
            id,
            operation,
            entityType,
            payload,
            status: 'pending',
            retryCount: 0,
            createdAt: new Date().toISOString(),
        });

        // Trigger immediate sync if online
        if (navigator.onLine) {
            this.sync();
        }

        return id;
    }

    /**
     * Get local product from IndexedDB
     */
    async getProduct(barcode: string) {
        if (!this.db) throw new Error('DB not initialized');
        return this.db.get('products', barcode);
    }

    /**
     * Save product to local cache
     */
    async saveProduct(product: any) {
        if (!this.db) throw new Error('DB not initialized');
        await this.db.put('products', {
            barcode: product.barcode,
            globalProductId: product.globalProductId,
            name: product.name,
            brand: product.brand,
            category: product.category,
            size: product.size,
            price: product.price,
            stock: product.stock,
            lastSynced: new Date().toISOString(),
        });
    }

    /**
     * Sync pending operations with server
     */
    async sync(): Promise<{ success: boolean; summary?: any; error?: string }> {
        if (!this.db) return { success: false, error: 'DB not initialized' };
        if (!navigator.onLine) return { success: false, error: 'Offline' };

        try {
            // Get all pending operations
            const tx = this.db.transaction('syncQueue', 'readonly');
            const index = tx.store.index('status');
            const pendingOps = await index.getAll('pending');

            if (pendingOps.length === 0) {
                return { success: true, summary: { total: 0, synced: 0, failed: 0 } };
            }

            // Send to server
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operations: pendingOps,
                    businessId: this.businessId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.status}`);
            }

            const result = await response.json();

            // Update statuses
            for (const synced of result.results.synced) {
                await this.db.put('syncQueue', {
                    ...pendingOps.find((op: any) => op.id === synced.operationId)!,
                    status: 'synced',
                });
            }

            for (const failed of result.results.failed) {
                const op = pendingOps.find((op: any) => op.id === failed.operationId);
                if (op) {
                    await this.db.put('syncQueue', {
                        ...op,
                        status: op.retryCount >= 2 ? 'failed' : 'retrying',
                        retryCount: op.retryCount + 1,
                        error: failed.error,
                    });
                }
            }

            return { success: true, summary: result.summary };
        } catch (error: any) {
            console.error('[Sync Engine] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get sync queue status
     */
    async getSyncStatus() {
        if (!this.db) return { pending: 0, synced: 0, failed: 0 };

        const tx = this.db.transaction('syncQueue', 'readonly');
        const all = await tx.store.getAll();

        return {
            pending: all.filter(op => op.status === 'pending').length,
            synced: all.filter(op => op.status === 'synced').length,
            failed: all.filter(op => op.status === 'failed').length,
            retrying: all.filter(op => op.status === 'retrying').length,
        };
    }

    /**
     * Start auto-sync interval
     */
    private startAutoSync(intervalMs: number) {
        if (this.syncInterval) clearInterval(this.syncInterval);

        this.syncInterval = setInterval(() => {
            if (navigator.onLine) {
                this.sync();
            }
        }, intervalMs);

        // Sync when coming back online
        window.addEventListener('online', () => this.sync());
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
}

// Singleton instance (initialized with businessId from context)
let syncEngine: OfflineSyncEngine | null = null;

export function getSyncEngine(businessId: string): OfflineSyncEngine {
    if (!syncEngine || syncEngine['businessId'] !== businessId) {
        syncEngine = new OfflineSyncEngine(businessId);
        syncEngine.init();
    }
    return syncEngine;
}

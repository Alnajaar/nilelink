/**
 * IndexedDB Offline Cache for POS Terminal
 * Provides offline-first capabilities for products, transactions, and sync queue
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product } from '../core/ProductInventoryEngine';

interface POSCacheDB extends DBSchema {
    products: {
        key: string;
        value: {
            id: string;
            data: Product;
            lastUpdated: number;
            businessId: string;
        };
        indexes: { 'by-business': string; 'by-updated': number };
    };
    transactions: {
        key: string;
        value: {
            id: string;
            data: any;
            status: 'pending' | 'confirmed' | 'failed';
            createdAt: number;
            retryCount: number;
            lastError?: string;
        };
        indexes: { 'by-status': string; 'by-date': number };
    };
    syncQueue: {
        key: string;
        value: {
            id: string;
            type: 'transaction' | 'inventory' | 'order';
            payload: any;
            priority: 'high' | 'normal' | 'low';
            createdAt: number;
            attempts: number;
        };
        indexes: { 'by-priority': string; 'by-date': number };
    };
    metadata: {
        key: string;
        value: {
            key: string;
            value: any;
            updatedAt: number;
        };
    };
}

class OfflineCache {
    private db: IDBPDatabase<POSCacheDB> | null = null;
    private readonly DB_NAME = 'nilelink_pos_cache';
    private readonly DB_VERSION = 1;

    /**
     * Initialize the IndexedDB database
     */
    async initialize(): Promise<void> {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || !window.indexedDB) {
            console.warn('⚠️ OfflineCache: IndexedDB not available in this environment');
            return;
        }
        
        try {
            this.db = await openDB<POSCacheDB>(this.DB_NAME, this.DB_VERSION, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    // Create products store
                    if (!db.objectStoreNames.contains('products')) {
                        const productsStore = db.createObjectStore('products', { keyPath: 'id' });
                        productsStore.createIndex('by-business', 'businessId');
                        productsStore.createIndex('by-updated', 'lastUpdated');
                    }

                    // Create transactions store
                    if (!db.objectStoreNames.contains('transactions')) {
                        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
                        txStore.createIndex('by-status', 'status');
                        txStore.createIndex('by-date', 'createdAt');
                    }

                    // Create sync queue store
                    if (!db.objectStoreNames.contains('syncQueue')) {
                        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                        syncStore.createIndex('by-priority', 'priority');
                        syncStore.createIndex('by-date', 'createdAt');
                    }

                    // Create metadata store
                    if (!db.objectStoreNames.contains('metadata')) {
                        db.createObjectStore('metadata', { keyPath: 'key' });
                    }
                }
            });

            console.log('✅ OfflineCache: IndexedDB initialized');
        } catch (error) {
            console.error('❌ OfflineCache: Failed to initialize IndexedDB:', error);
            // Don't throw error in server environment, just warn
            if (typeof window !== 'undefined') {
                throw error;
            }
        }
    }

    /**
     * Ensure database is initialized
     */
    private async ensureDB(): Promise<IDBPDatabase<POSCacheDB> | null> {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return null; // Return null if not in browser environment
        }
        
        if (!this.db) {
            await this.initialize();
        }
        return this.db;
    }

    // ==================== PRODUCTS ====================

    /**
     * Cache products for offline access
     */
    async cacheProducts(products: Product[], businessId: string): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot cache products - IndexedDB not available');
            return;
        }
        
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');

        const timestamp = Date.now();
        await Promise.all(
            products.map(product =>
                store.put({
                    id: product.id,
                    data: product,
                    lastUpdated: timestamp,
                    businessId
                })
            )
        );

        await tx.done;
        console.log(`✅ Cached ${products.length} products for business ${businessId}`);
    }

    /**
     * Get cached products for a business
     */
    async getCachedProducts(businessId: string): Promise<Product[]> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get cached products - IndexedDB not available');
            return [];
        }
        
        const index = db.transaction('products').objectStore('products').index('by-business');
        const entries = await index.getAll(businessId);
        return entries.map(entry => entry.data);
    }

    /**
     * Get single cached product
     */
    async getCachedProduct(productId: string): Promise<Product | null> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get cached product - IndexedDB not available');
            return null;
        }
        
        const entry = await db.get('products', productId);
        return entry?.data || null;
    }

    /**
     * Clear cached products older than specified time (default: 24 hours)
     */
    async clearOldProducts(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot clear old products - IndexedDB not available');
            return;
        }
        
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');
        const index = store.index('by-updated');

        const cutoff = Date.now() - maxAgeMs;
        const cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));

        let deletedCount = 0;
        if (cursor) {
            for await (const cur of cursor) {
                await cur.delete();
                deletedCount++;
            }
        }

        await tx.done;
        console.log(`✅ Cleared ${deletedCount} old products from cache`);
    }

    // ==================== TRANSACTIONS ====================

    /**
     * Queue transaction for later sync
     */
    async queueTransaction(
        id: string,
        data: any,
        status: 'pending' | 'confirmed' | 'failed' = 'pending'
    ): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot queue transaction - IndexedDB not available');
            return;
        }
        
        await db.put('transactions', {
            id,
            data,
            status,
            createdAt: Date.now(),
            retryCount: 0
        });
        console.log(`✅ Queued transaction ${id} with status ${status}`);
    }

    /**
     * Get pending transactions
     */
    async getPendingTransactions(): Promise<Array<{ id: string; data: any }>> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get pending transactions - IndexedDB not available');
            return [];
        }
        
        const index = db.transaction('transactions').objectStore('transactions').index('by-status');
        const entries = await index.getAll('pending');
        return entries.map(entry => ({ id: entry.id, data: entry.data }));
    }

    /**
     * Update transaction status
     */
    async updateTransactionStatus(
        id: string,
        status: 'pending' | 'confirmed' | 'failed',
        error?: string
    ): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot update transaction status - IndexedDB not available');
            return;
        }
        
        const tx = await db.get('transactions', id);
        if (tx) {
            tx.status = status;
            if (error) tx.lastError = error;
            if (status === 'pending') tx.retryCount++;
            await db.put('transactions', tx);
        }
    }

    /**
     * Remove confirmed transactions older than specified time
     */
    async clearOldTransactions(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot clear old transactions - IndexedDB not available');
            return;
        }
        
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        const index = store.index('by-date');

        const cutoff = Date.now() - maxAgeMs;
        const cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));

        let deletedCount = 0;
        if (cursor) {
            for await (const cur of cursor) {
                if (cur.value.status === 'confirmed') {
                    await cur.delete();
                    deletedCount++;
                }
            }
        }

        await tx.done;
        console.log(`✅ Cleared ${deletedCount} old transactions from cache`);
    }

    // ==================== SYNC QUEUE ====================

    /**
     * Add item to sync queue
     */
    async addToSyncQueue(
        type: 'transaction' | 'inventory' | 'order',
        payload: any,
        priority: 'high' | 'normal' | 'low' = 'normal'
    ): Promise<string> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot add to sync queue - IndexedDB not available');
            return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Return a fake ID
        }
        
        const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.add('syncQueue', {
            id,
            type,
            payload,
            priority,
            createdAt: Date.now(),
            attempts: 0
        });

        console.log(`✅ Added ${type} to sync queue with priority ${priority}`);
        return id;
    }

    /**
     * Get next items from sync queue
     */
    async getNextSyncItems(limit: number = 10): Promise<Array<{ id: string; type: string; payload: any }>> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get next sync items - IndexedDB not available');
            return [];
        }
        
        const tx = db.transaction('syncQueue');
        const store = tx.objectStore('syncQueue');
        const index = store.index('by-priority');

        const items: Array<{ id: string; type: string; payload: any }> = [];

        // Get high priority first
        for await (const cursor of index.iterate('high')) {
            items.push({
                id: cursor.value.id,
                type: cursor.value.type,
                payload: cursor.value.payload
            });
            if (items.length >= limit) break;
        }

        // Then normal priority
        if (items.length < limit) {
            for await (const cursor of index.iterate('normal')) {
                items.push({
                    id: cursor.value.id,
                    type: cursor.value.type,
                    payload: cursor.value.payload
                });
                if (items.length >= limit) break;
            }
        }

        return items;
    }

    /**
     * Remove item from sync queue
     */
    async removeFromSyncQueue(id: string): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot remove from sync queue - IndexedDB not available');
            return;
        }
        
        await db.delete('syncQueue', id);
    }

    /**
     * Get sync queue count
     */
    async getSyncQueueCount(): Promise<number> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get sync queue count - IndexedDB not available');
            return 0;
        }
        
        return await db.count('syncQueue');
    }

    // ==================== METADATA ====================

    /**
     * Set metadata value
     */
    async setMetadata(key: string, value: any): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot set metadata - IndexedDB not available');
            return;
        }
        
        await db.put('metadata', {
            key,
            value,
            updatedAt: Date.now()
        });
    }

    /**
     * Get metadata value
     */
    async getMetadata(key: string): Promise<any | null> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get metadata - IndexedDB not available');
            return null;
        }
        
        const entry = await db.get('metadata', key);
        return entry?.value || null;
    }

    /**
     * Clear all cached data (use with caution)
     */
    async clearAll(): Promise<void> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot clear all data - IndexedDB not available');
            return;
        }
        
        const tx = db.transaction(['products', 'transactions', 'syncQueue', 'metadata'], 'readwrite');
        
        await Promise.all([
            tx.objectStore('products').clear(),
            tx.objectStore('transactions').clear(),
            tx.objectStore('syncQueue').clear(),
            tx.objectStore('metadata').clear()
        ]);

        await tx.done;
        console.log('✅ Cleared all offline cache data');
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        products: number;
        transactions: number;
        syncQueue: number;
        metadata: number;
    }> {
        const db = await this.ensureDB();
        if (!db) {
            console.warn('⚠️ OfflineCache: Cannot get stats - IndexedDB not available');
            return {
                products: 0,
                transactions: 0,
                syncQueue: 0,
                metadata: 0
            };
        }
        
        return {
            products: await db.count('products'),
            transactions: await db.count('transactions'),
            syncQueue: await db.count('syncQueue'),
            metadata: await db.count('metadata')
        };
    }
}

// Export singleton instance
export const offlineCache = new OfflineCache();

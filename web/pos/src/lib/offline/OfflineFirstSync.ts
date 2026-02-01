/**
 * Offline-First Sync Engine (NO BACKEND)
 * Syncs to IPFS + Smart Contracts only
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ethers } from 'ethers';

interface POSDatabase extends DBSchema {
    products: {
        key: string; // barcode
        value: {
            barcode: string;
            name: string;
            brand?: string;
            category: string;
            size?: string;
            unit: string;
            imageHash?: string; // IPFS CID
            verified: boolean;
            createdAt: string;
            updatedAt: string;
        };
    };
    storeProducts: {
        key: string; // id
        value: {
            id: string;
            barcode: string;
            businessId: string;
            price: number;
            cost?: number;
            stock: number;
            minStock: number;
            vat: number;
            branchId?: string;
            lastSynced?: string;
        };
    };
    orders: {
        key: string; // id
        value: {
            id: string;
            businessId: string;
            items: any[];
            subtotal: number;
            tax: number;
            total: number;
            commission: number;
            status: string;
            createdAt: string;
            syncedToChain: boolean;
            ipfsHash?: string;
        };
    };
    syncQueue: {
        key: string; // id
        value: {
            id: string;
            operation: string;
            payload: any;
            status: 'pending' | 'synced' | 'failed' | 'retrying';
            retryCount: number;
            createdAt: string;
            error?: string;
        };
    };
    settings: {
        key: string;
        value: any;
    };
}

export class OfflineFirstSync {
    private db: IDBPDatabase<POSDatabase> | null = null;
    private businessId: string;
    private provider?: ethers.BrowserProvider;
    private commissionContract?: ethers.Contract;

    constructor(businessId: string) {
        this.businessId = businessId;
    }

    /**
     * Initialize IndexedDB and smart contract connection
     */
    async init() {
        // Initialize IndexedDB
        this.db = await openDB<POSDatabase>('nilelink-pos-offline', 1, {
            upgrade(db) {
                // Products (Global Catalog)
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'barcode' });
                }

                // Store Products (Local Pricing)
                if (!db.objectStoreNames.contains('storeProducts')) {
                    const storeStore = db.createObjectStore('storeProducts', { keyPath: 'id' });
                    storeStore.createIndex('barcode', 'barcode');
                    storeStore.createIndex('businessId', 'businessId');
                }

                // Orders
                if (!db.objectStoreNames.contains('orders')) {
                    const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
                    orderStore.createIndex('syncedToChain', 'syncedToChain');
                }

                // Sync Queue
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    queueStore.createIndex('status', 'status');
                }

                // Settings
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            },
        });

        // Initialize Web3 (optional, works offline without it)
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                this.provider = new ethers.BrowserProvider(window.ethereum);

                // Load commission contract
                const commissionAddress = process.env.NEXT_PUBLIC_COMMISSION_CONTRACT;
                if (commissionAddress) {
                    const commissionABI = [
                        'function getCommission(address supplier, uint256 amount) view returns (uint256)',
                        'function supplierRules(address) view returns (uint8 percentage, uint256 fixedFee, bool isPercentage)',
                    ];
                    this.commissionContract = new ethers.Contract(
                        commissionAddress,
                        commissionABI,
                        this.provider
                    );
                }
            } catch (error) {
                console.warn('[Offline Sync] Web3 not available, using cached data');
            }
        }
    }

    /**
     * Search product by barcode (local only)
     */
    async searchProduct(barcode: string) {
        if (!this.db) throw new Error('DB not initialized');

        const global = await this.db.get('products', barcode);

        if (!global) return { found: false };

        // Find local pricing
        const tx = this.db.transaction('storeProducts', 'readonly');
        const index = tx.store.index('barcode');
        const localProducts = await index.getAll(barcode);
        const local = localProducts.find(p => p.businessId === this.businessId);

        return {
            found: true,
            global,
            local: local || null,
        };
    }

    /**
     * Add product (works offline)
     */
    async addProduct(data: {
        barcode: string;
        name: string;
        brand?: string;
        category: string;
        size?: string;
        price: number;
        stock: number;
        cost?: number;
        vat?: number;
    }) {
        if (!this.db) throw new Error('DB not initialized');

        const { barcode, name, brand, category, size, price, stock, cost, vat } = data;

        // Check if global product exists
        let globalProduct = await this.db.get('products', barcode);

        // If not, create it
        if (!globalProduct) {
            globalProduct = {
                barcode,
                name,
                brand,
                category,
                size,
                unit: 'unit',
                verified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await this.db.put('products', globalProduct);
        }

        // Create store product
        const storeProduct = {
            id: `${barcode}-${this.businessId}-${Date.now()}`,
            barcode,
            businessId: this.businessId,
            price,
            stock,
            cost,
            vat: vat || 0.15,
            minStock: 10,
            lastSynced: new Date().toISOString(),
        };

        await this.db.put('storeProducts', storeProduct);

        return {
            global: globalProduct,
            local: storeProduct,
        };
    }

    /**
     * Bulk scan (increment stock)
     */
    async bulkScan(barcode: string) {
        if (!this.db) throw new Error('DB not initialized');

        const result = await this.searchProduct(barcode);

        if (!result.found || !result.local) {
            // Create placeholder product
            return this.addProduct({
                barcode,
                name: `Product ${barcode}`,
                category: 'Uncategorized',
                price: 0,
                stock: 1,
            });
        }

        // Increment stock
        const updated = {
            ...result.local,
            stock: result.local.stock + 1,
            lastSynced: new Date().toISOString(),
        };

        await this.db.put('storeProducts', updated);

        return {
            global: result.global,
            local: updated,
        };
    }

    /**
     * Get commission from smart contract (cached fallback)
     */
    async getCommission(supplierAddress: string, orderAmount: number): Promise<number> {
        try {
            if (this.commissionContract && navigator.onLine) {
                const commission = await this.commissionContract.getCommission(supplierAddress, orderAmount);

                // Cache for offline use
                await this.setSetting(`commission_${supplierAddress}`, commission.toString());

                return Number(commission);
            }
        } catch (error) {
            console.warn('[Offline Sync] Failed to fetch commission from contract, using cache');
        }

        // Fallback to cached value
        const cached = await this.getSetting(`commission_${supplierAddress}`);
        return cached ? Number(cached) : 0;
    }

    /**
     * Save setting to IndexedDB
     */
    async setSetting(key: string, value: any) {
        if (!this.db) return;
        await this.db.put('settings', { key, value });
    }

    /**
     * Get setting from IndexedDB
     */
    async getSetting(key: string): Promise<any> {
        if (!this.db) return null;
        const result = await this.db.get('settings', key);
        return result?.value;
    }

    /**
     * Export orders to IPFS (when online)
     */
    async exportToIPFS(): Promise<string | null> {
        if (!this.db || !navigator.onLine) return null;

        try {
            // Get unsynced orders
            const tx = this.db.transaction('orders', 'readonly');
            const index = tx.store.index('syncedToChain');
            const unsyncedOrders = await index.getAll(false);

            if (unsyncedOrders.length === 0) return null;

            const json = JSON.stringify(unsyncedOrders);
            const blob = new Blob([json], { type: 'application/json' });

            // Upload to Pinata (or local IPFS node)
            const formData = new FormData();
            formData.append('file', blob, 'orders.json');

            const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
            if (!pinataJWT) {
                console.warn('[IPFS] Pinata JWT not configured');
                return null;
            }

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${pinataJWT}` },
                body: formData,
            });

            const { IpfsHash } = await response.json();

            // Mark orders as synced
            for (const order of unsyncedOrders) {
                await this.db.put('orders', {
                    ...order,
                    syncedToChain: true,
                    ipfsHash: IpfsHash,
                });
            }

            return IpfsHash;
        } catch (error) {
            console.error('[IPFS Export] Failed:', error);
            return null;
        }
    }

    /**
     * Get all products
     */
    async getAllProducts() {
        if (!this.db) return [];
        return this.db.getAll('products');
    }

    /**
     * Get store products
     */
    async getStoreProducts() {
        if (!this.db) return [];
        const tx = this.db.transaction('storeProducts', 'readonly');
        const index = tx.store.index('businessId');
        return index.getAll(this.businessId);
    }
}

// Singleton getter
let instance: OfflineFirstSync | null = null;

export function getSyncEngine(businessId: string): OfflineFirstSync {
    if (!instance || instance['businessId'] !== businessId) {
        instance = new OfflineFirstSync(businessId);
        instance.init();
    }
    return instance;
}

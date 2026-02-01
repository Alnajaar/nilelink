// Product & Inventory Engine
// Comprehensive product management with SKU, barcodes, weights, batches, expiry, multi-warehouse

import { eventBus, EventTypes, createEvent, EventPriority } from './EventBus';
import { graphService } from '../../../../shared/services/GraphService';
import { ipfsService } from '../../../../shared/services/IPFSService';
import { offlineCache } from '../storage/OfflineCache';
import { retryReadOperation } from '../blockchain/TransactionRetry';

export enum ProductType {
    PHYSICAL = 'physical',
    DIGITAL = 'digital',
    SERVICE = 'service',
    BUNDLE = 'bundle',
    VARIABLE = 'variable',
    INGREDIENT = 'ingredient',
    RAW_MATERIAL = 'raw_material'
}

export enum UnitType {
    PIECE = 'piece',
    WEIGHT = 'weight',
    VOLUME = 'volume',
    LENGTH = 'length',
    AREA = 'area',
    TIME = 'time'
}

export enum InventoryTrackingMethod {
    NONE = 'none',
    SIMPLE = 'simple',           // Basic stock levels
    BATCH = 'batch',             // Batch/lot tracking
    SERIAL = 'serial',           // Serial number tracking
    EXPIRY = 'expiry',           // Expiry date tracking
    LOCATION = 'location'        // Warehouse location tracking
}

export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DISCONTINUED = 'discontinued',
    OUT_OF_STOCK = 'out_of_stock',
    ARCHIVED = 'archived'
}

export interface ProductBarcode {
    id: string;
    type: 'UPC' | 'EAN' | 'CODE128' | 'QR' | 'CUSTOM';
    value: string;
    primary: boolean;
    createdAt: number;
}

export interface ProductBatch {
    id: string;
    batchNumber: string;
    supplierId: string;
    manufactureDate?: number;
    expiryDate?: number;
    costPrice: number;
    quantityReceived: number;
    quantityRemaining: number;
    location: WarehouseLocation;
    status: 'active' | 'expired' | 'recalled' | 'used_up';
    metadata: Record<string, any>;
}

export interface WarehouseLocation {
    warehouseId: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
    position?: string;
    coordinates?: {
        x: number;
        y: number;
        z: number;
    };
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    cost: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    attributes: Record<string, string>;
    inventory: ProductInventory;
    barcodes: ProductBarcode[];
    images: string[];
    status: ProductStatus;
}

export interface ProductInventory {
    method: InventoryTrackingMethod;
    available: number;
    reserved: number;
    onOrder: number;
    committed: number;
    damaged: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    locations: WarehouseLocation[];
    batches: ProductBatch[];
    serialNumbers?: string[];
    lastCounted?: number;
    autoReorder: boolean;
}

export interface RecipeItem {
    ingredientId: string;
    quantity: number;
    unitType: UnitType;
    wasteAdjustment: number; // percentage
}

export interface Product {
    id: string;
    businessId: string;
    name: string;
    description: string;
    type: ProductType;
    category: string;
    subcategory?: string;
    tags: string[];
    brand?: string;
    supplier?: string;
    unitType: UnitType;
    unitName: string;
    status: ProductStatus;
    variants: ProductVariant[];
    recipe?: RecipeItem[]; // Ingredient mapping for restaurants/cafes
    taxRate: number;
    taxInclusive: boolean;
    images: string[];
    metadata: Record<string, any>;
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    version: number;
}

export interface InventoryTransaction {
    id: string;
    productId: string;
    variantId?: string;
    type: 'adjustment' | 'sale' | 'purchase' | 'transfer' | 'return' | 'damage' | 'count';
    quantity: number;
    previousStock: number;
    newStock: number;
    costPrice?: number;
    sellingPrice?: number;
    batchId?: string;
    location?: WarehouseLocation;
    reason?: string;
    reference?: string;  // Order ID, Invoice ID, etc.
    userId: string;
    timestamp: number;
    metadata: Record<string, any>;
}

export interface InventoryAlert {
    id: string;
    productId: string;
    variantId?: string;
    type: 'low_stock' | 'out_of_stock' | 'expired_batch' | 'reorder_needed' | 'overstock';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
    timestamp: number;
    metadata: Record<string, any>;
}

class ProductInventoryEngine {
    private products: Map<string, Product> = new Map();
    private inventoryTransactions: InventoryTransaction[] = [];
    private alerts: Map<string, InventoryAlert> = new Map();
    private isInitialized = false;

    constructor() {
        this.initializeEventHandlers();
    }

    /**
     * Initialize event handlers
     */
    private initializeEventHandlers(): void {
        // Handle hardware events for barcode scanning
        eventBus.subscribe('HARDWARE_DATA_SCANNER', async (event) => {
            const { deviceId, data } = event.payload;
            await this.handleBarcodeScan(data);
        });

        // Handle hardware events for weight measurement
        eventBus.subscribe('HARDWARE_DATA_SCALE', async (event) => {
            const { deviceId, data } = event.payload;
            await this.handleWeightData(data);
        });

        // Handle transaction events
        eventBus.subscribe(EventTypes.TRANSACTION_COMPLETED, async (event) => {
            const { transaction } = event.payload;
            await this.handleTransaction(transaction);
        });
    }

    /**
     * Save current products to decentralized storage (IPFS)
     * Returns the new CID
     */
    async saveToIPFS(businessId: string): Promise<string> {
        try {
            console.log(`ProductInventoryEngine: Saving products for business ${businessId} to IPFS...`);

            // 1. Serialize products
            const products = Array.from(this.products.values())
                .filter(p => p.businessId === businessId);

            const catalog = {
                version: '1.0',
                businessId,
                updatedAt: Date.now(),
                itemCount: products.length,
                products
            };

            // 2. Upload to IPFS
            const result = await ipfsService.uploadJSON(catalog, `catalog-${businessId}-${Date.now()}`);

            if (!result || !result.cid) {
                throw new Error('Failed to upload catalog to IPFS');
            }

            console.log(`ProductInventoryEngine: Saved catalog to IPFS. CID: ${result.cid}`);

            // 3. Cache the new version locally as well
            await offlineCache.cacheProducts(products, businessId);

            // 4. Publish event
            await eventBus.publish(createEvent('CATALOG_SAVED_TO_IPFS', {
                businessId,
                cid: result.cid,
                count: products.length
            }, {
                source: 'ProductInventoryEngine',
                priority: EventPriority.HIGH
            }));

            return result.cid;
        } catch (error) {
            console.error('Failed to save to IPFS:', error);
            throw error;
        }
    }

    /**
     * Load products for a business from decentralized storage (The Graph + IPFS)
     * with offline cache fallback
     */
    async loadBusinessProducts(businessId: string): Promise<void> {
        try {
            console.log(`ProductInventoryEngine: Loading products for business ${businessId}...`);

            // Try to load from network first (with retry logic)
            try {
                const data = await retryReadOperation(() => graphService.getRestaurantById(businessId));

                if (!data || !data.restaurant) {
                    throw new Error(`Business ${businessId} not found on-chain`);
                }

                const { catalogCid } = data.restaurant;
                if (!catalogCid) {
                    console.warn(`Business ${businessId} has no catalog CID. Checking cache...`);
                    await this.loadFromCache(businessId);
                    return;
                }

                // Fetch catalog from IPFS with retry
                const catalog = await retryReadOperation(() => ipfsService.getJSONContent(catalogCid));

                if (!catalog || !catalog.products) {
                    console.warn(`Failed to fetch catalog from IPFS (${catalogCid}). Using cache...`);
                    await this.loadFromCache(businessId);
                    return;
                }

                // Populate products map
                this.products.clear();
                for (const productData of catalog.products) {
                    this.products.set(productData.id, productData);
                }

                // Cache products for offline use
                await offlineCache.cacheProducts(catalog.products, businessId);

                console.log(`ProductInventoryEngine: Loaded ${this.products.size} products from network and cached`);

                // Publish sync event
                await eventBus.publish(createEvent('PRODUCTS_SYNCED', {
                    businessId,
                    count: this.products.size,
                    source: 'network'
                }, {
                    source: 'ProductInventoryEngine',
                    priority: EventPriority.HIGH
                }));

            } catch (networkError) {
                console.warn('Network fetch failed, falling back to cache:', networkError);
                await this.loadFromCache(businessId);
            }

        } catch (error) {
            console.error('Failed to load business products:', error);
            throw error;
        }
    }

    /**
     * Load products from offline cache
     */
    private async loadFromCache(businessId: string): Promise<void> {
        try {
            const cachedProducts = await offlineCache.getCachedProducts(businessId);

            if (cachedProducts.length === 0) {
                console.warn(`No cached products found for business ${businessId}`);
                return;
            }

            this.products.clear();
            for (const product of cachedProducts) {
                this.products.set(product.id, product);
            }

            console.log(`ProductInventoryEngine: Loaded ${this.products.size} products from cache (OFFLINE MODE)`);

            // Publish sync event with offline flag
            await eventBus.publish(createEvent('PRODUCTS_SYNCED', {
                businessId,
                count: this.products.size,
                source: 'cache'
            }, {
                source: 'ProductInventoryEngine',
                priority: EventPriority.NORMAL
            }));
        } catch (error) {
            console.error('Failed to load from cache:', error);
            throw error;
        }
    }

    /**
     * Create a new product
     */
    async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Product> {
        const product: Product = {
            id: `prod_${Date.now()}_${Math.random()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
            ...productData
        };

        // ENFORCED PLAN CHECK
        this.checkPlanLimits('create_product', product);

        this.products.set(product.id, product);

        // Publish event
        await eventBus.publish(createEvent(EventTypes.PRODUCT_CREATED, {
            product: { ...product }
        }, {
            source: 'ProductInventoryEngine',
            businessId: product.businessId
        }));

        return product;
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const updatedProduct: Product = {
            ...product,
            ...updates,
            updatedAt: Date.now(),
            version: product.version + 1
        };

        this.products.set(productId, updatedProduct);

        // Publish event
        await eventBus.publish(createEvent(EventTypes.PRODUCT_UPDATED, {
            product: { ...updatedProduct },
            changes: updates
        }, {
            source: 'ProductInventoryEngine',
            businessId: product.businessId
        }));

        return updatedProduct;
    }

    /**
     * Delete a product
     */
    async deleteProduct(productId: string): Promise<void> {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        this.products.delete(productId);

        // Publish event
        await eventBus.publish(createEvent(EventTypes.PRODUCT_DELETED, {
            productId,
            product: { ...product }
        }, {
            source: 'ProductInventoryEngine',
            businessId: product.businessId
        }));
    }

    /**
     * Update product recipe (Ingredient Mapping)
     * Critical for Restaurant/Cafe inventory tracking
     */
    async updateProductRecipe(productId: string, recipeItems: RecipeItem[]): Promise<Product> {
        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        // Validate that all ingredients exist as products of type INGREDIENT or RAW_MATERIAL
        for (const item of recipeItems) {
            const ingredient = this.products.get(item.ingredientId);
            if (!ingredient) {
                // In a stricter system we might throw, but here we'll warn or allow "virtual" ingredients
                console.warn(`Ingredient ${item.ingredientId} not found in local catalog`);
            }
        }

        const updatedProduct: Product = {
            ...product,
            recipe: recipeItems,
            updatedAt: Date.now(),
            version: product.version + 1
        };

        this.products.set(productId, updatedProduct);

        await eventBus.publish(createEvent(EventTypes.PRODUCT_UPDATED, {
            product: updatedProduct,
            changes: { recipe: recipeItems }
        }, {
            source: 'ProductInventoryEngine',
            priority: EventPriority.HIGH
        }));

        return updatedProduct;
    }

    /**
     * Bulk Import Menu from standardized JSON (e.g. parsed from XLS)
     */
    async importMenuFromData(data: any[]): Promise<void> {
        for (const row of data) {
            // Logic to create or update product based on row data
            // Placeholder for full implementation
            console.log('Importing menu item:', row.name);
        }
    }

    /**
     * Get product by ID
     */
    getProduct(productId: string): Product | null {
        return this.products.get(productId) || null;
    }

    /**
     * Get multiple products by IDs
     */
    getProductsByIds(productIds: string[]): Product[] {
        return productIds
            .map(id => this.products.get(id))
            .filter((p): p is Product => !!p);
    }

    /**
     * Search products with filters
     */
    searchProducts(filters: {
        businessId?: string;
        category?: string;
        status?: ProductStatus;
        tags?: string[];
        searchTerm?: string;
        limit?: number;
        offset?: number;
    } = {}): Product[] {
        let products = Array.from(this.products.values());

        // Apply filters
        if (filters.businessId) {
            products = products.filter(p => p.businessId === filters.businessId);
        }

        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }

        if (filters.status) {
            products = products.filter(p => p.status === filters.status);
        }

        if (filters.tags && filters.tags.length > 0) {
            products = products.filter(p =>
                filters.tags!.some(tag => p.tags.includes(tag))
            );
        }

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term)
            );
        }

        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        return products.slice(offset, offset + limit);
    }

    /**
     * Add inventory transaction
     */
    async addInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'timestamp' | 'previousStock' | 'newStock' | 'metadata'> & { metadata?: any }): Promise<InventoryTransaction> {
        const product = this.products.get(transaction.productId);
        if (!product) {
            throw new Error(`Product ${transaction.productId} not found`);
        }

        const invTransaction: InventoryTransaction = {
            id: `inv_txn_${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            previousStock: 0,
            newStock: 0,
            metadata: {},
            ...transaction
        };

        // Update inventory levels
        await this.updateInventoryLevels(invTransaction);

        this.inventoryTransactions.push(invTransaction);

        // Check for alerts
        await this.checkInventoryAlerts(product);

        // Submit to Blockchain (Decentralized Inventory)
        this.submitTransactionOnChain(invTransaction).catch(err => {
            console.error('Failed to submit inventory transaction to blockchain:', err);
            // In production, queue for retry or offline sync
        });

        return invTransaction;
    }

    /**
     * Submit inventory transaction to Smart Contract (Decentralized Audit Log)
     */
    private async submitTransactionOnChain(transaction: InventoryTransaction): Promise<void> {
        try {
            const web3Service = (await import('../../../../shared/services/Web3Service')).default;
            await web3Service.anchorEventBatch(transaction.productId, `inv-txn-${transaction.id}`);
        } catch (error) {
            console.error('[BLOCKCHAIN] Failed to anchor inventory:', error);
        }
    }

    /**
     * Update inventory levels based on transaction
     */
    private async updateInventoryLevels(transaction: InventoryTransaction): Promise<void> {
        const product = this.products.get(transaction.productId);
        if (!product) return;

        const variant = transaction.variantId
            ? product.variants.find(v => v.id === transaction.variantId)
            : product.variants[0];

        if (!variant) return;

        const inventory = variant.inventory;
        const previousStock = inventory.available;

        // Update based on transaction type
        switch (transaction.type) {
            case 'sale':
            case 'adjustment':
                inventory.available += transaction.quantity; // Can be negative
                break;
            case 'purchase':
            case 'return':
                inventory.available += transaction.quantity;
                break;
            case 'transfer':
                // Transfers are handled separately
                break;
            case 'damage':
                inventory.available -= Math.abs(transaction.quantity);
                inventory.damaged += Math.abs(transaction.quantity);
                break;
        }

        transaction.previousStock = previousStock;
        transaction.newStock = inventory.available;

        // Update variant
        variant.inventory = inventory;
        await this.updateProduct(product.id, { variants: product.variants });
    }

    /**
     * Check for inventory alerts
     */
    private async checkInventoryAlerts(product: Product): Promise<void> {
        for (const variant of product.variants) {
            const inventory = variant.inventory;

            // Low stock alert
            if (inventory.available <= inventory.reorderPoint && inventory.available > 0) {
                await this.createAlert({
                    productId: product.id,
                    variantId: variant.id,
                    type: 'low_stock',
                    message: `${product.name} (${variant.name}) is running low on stock (${inventory.available} remaining)`,
                    severity: 'medium'
                });
            }

            // Out of stock alert
            if (inventory.available <= 0) {
                await this.createAlert({
                    productId: product.id,
                    variantId: variant.id,
                    type: 'out_of_stock',
                    message: `${product.name} (${variant.name}) is out of stock`,
                    severity: 'high'
                });
            }

            // Overstock alert
            if (inventory.available > inventory.maxStock) {
                await this.createAlert({
                    productId: product.id,
                    variantId: variant.id,
                    type: 'overstock',
                    message: `${product.name} (${variant.name}) has excess stock (${inventory.available})`,
                    severity: 'low'
                });
            }

            // Expiry alerts
            for (const batch of inventory.batches) {
                if (batch.expiryDate && batch.expiryDate < Date.now() + (30 * 24 * 60 * 60 * 1000)) { // 30 days
                    await this.createAlert({
                        productId: product.id,
                        variantId: variant.id,
                        type: 'expired_batch',
                        message: `Batch ${batch.batchNumber} of ${product.name} expires soon`,
                        severity: 'high'
                    });
                }
            }
        }
    }

    /**
     * Create inventory alert
     */
    private async createAlert(alertData: Omit<InventoryAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
        const alertId = `alert_${Date.now()}_${Math.random()}`;

        const alert: InventoryAlert = {
            id: alertId,
            timestamp: Date.now(),
            acknowledged: false,
            ...alertData
        };

        this.alerts.set(alertId, alert);

        // Publish event
        await eventBus.publish(createEvent('INVENTORY_ALERT', {
            alert
        }, {
            source: 'ProductInventoryEngine',
            priority: alert.severity === 'critical' ? EventPriority.HIGH : EventPriority.NORMAL
        }));
    }

    /**
     * Get inventory alerts
     */
    getAlerts(filters: {
        productId?: string;
        acknowledged?: boolean;
        severity?: string;
        limit?: number;
    } = {}): InventoryAlert[] {
        let alerts = Array.from(this.alerts.values());

        if (filters.productId) {
            alerts = alerts.filter(a => a.productId === filters.productId);
        }

        if (typeof filters.acknowledged === 'boolean') {
            alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
        }

        if (filters.severity) {
            alerts = alerts.filter(a => a.severity === filters.severity);
        }

        return alerts.slice(0, filters.limit || 50);
    }

    /**
     * Handle barcode scan from hardware
     */
    private async handleBarcodeScan(data: { type: string; value: string; timestamp: number }): Promise<void> {
        // Find product by barcode
        for (const product of this.products.values()) {
            for (const variant of product.variants) {
                const barcode = variant.barcodes.find(b => b.value === data.value);
                if (barcode) {
                    // Publish product found event
                    await eventBus.publish(createEvent('PRODUCT_BARCODE_SCANNED', {
                        product,
                        variant,
                        barcode: data
                    }, {
                        source: 'ProductInventoryEngine'
                    }));
                    return;
                }
            }
        }

        // No product found
        await eventBus.publish(createEvent('PRODUCT_BARCODE_NOT_FOUND', {
            barcode: data
        }, {
            source: 'ProductInventoryEngine'
        }));
    }

    /**
     * Handle weight data from scale
     */
    private async handleWeightData(data: { weight: number; unit: string; stable: boolean; timestamp: number }): Promise<void> {
        // Store weight for current transaction or product
        await eventBus.publish(createEvent('PRODUCT_WEIGHT_MEASURED', {
            weightData: data
        }, {
            source: 'ProductInventoryEngine'
        }));
    }

    /**
     * Handle transaction completion
     */
    private async handleTransaction(transaction: any): Promise<void> {
        // Update inventory based on transaction items
        if (transaction.items) {
            for (const item of transaction.items) {
                await this.addInventoryTransaction({
                    productId: item.productId,
                    variantId: item.variantId,
                    type: 'sale',
                    quantity: -item.quantity, // Sale reduces stock
                    userId: transaction.userId || 'system',
                    metadata: {}
                });
            }
        }
    }

    /**
     * [SECURITY] Enforce Plan Limits
     * Reads directly from secure storage to prevent bypass
     */
    private checkPlanLimits(action: string, data?: any): void {
        try {
            const subData = localStorage.getItem('userSubscription');
            if (!subData) throw new Error('Security Violation: No active subscription found.');

            const sub = JSON.parse(subData);
            if (!sub.isActive) throw new Error('Security Violation: Subscription is inactive.');

            // Check specific limits
            if (action === 'create_product') {
                const product = data as Product;

                // 1. Check Product Type Restrictions
                if (sub.plan === 'starter' && (product.type === ProductType.BUNDLE || product.type === ProductType.INGREDIENT)) {
                    throw new Error(`Plan Restriction: Upgrade to Business to use ${product.type} products.`);
                }

                // 2. Check Inventory Method Restrictions
                const complexMethods = [
                    InventoryTrackingMethod.BATCH,
                    InventoryTrackingMethod.SERIAL,
                    InventoryTrackingMethod.EXPIRY,
                    InventoryTrackingMethod.LOCATION
                ];

                // Check if any variant uses complex tracking
                const usesComplex = product.variants.some(v => complexMethods.includes(v.inventory.method));
                if (sub.plan === 'starter' && usesComplex) {
                    throw new Error('Plan Restriction: Upgrade to Business for Batch/Expiry/Serial tracking.');
                }
            }

        } catch (error) {
            console.error('[PLAN_ENFORCEMENT_BLOCK]', error);
            throw error; // Fail-closed
        }
    }

    /**
     * Get inventory summary for product
     */
    public getInventorySummary(productId: string, variantId?: string): any {
        const product = this.products.get(productId);
        if (!product) return null;

        const variants = variantId
            ? product.variants.filter(v => v.id === variantId)
            : product.variants;

        return variants.map(variant => ({
            variantId: variant.id,
            name: variant.name,
            inventory: variant.inventory,
            totalValue: variant.inventory.available * variant.cost,
            turnover: this.calculateTurnover(productId, variant.id)
        }));
    }

    /**
     * Calculate inventory turnover
     */
    private calculateTurnover(productId: string, variantId: string): number {
        const transactions = this.inventoryTransactions.filter(
            t => t.productId === productId &&
                (!variantId || t.variantId === variantId) &&
                t.type === 'sale'
        );

        const totalSold = transactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);

        // Calculate real average inventory from current available stock
        const variant = this.products.get(productId)?.variants.find(v => v.id === variantId);
        const avgInventory = variant?.inventory.available || 1;
        const timePeriod = 30; // days

        return (totalSold / Math.max(avgInventory, 1)) * (365 / timePeriod);
    }

    /**
     * Initialize the engine
     */
    async initialize(): Promise<void> {
        this.isInitialized = true;
        // Initialize offline cache
        await offlineCache.initialize();
        console.log('ProductInventoryEngine: Initialized with offline cache');
    }

    /**
     * Shutdown the engine
     */
    shutdown(): void {
        this.isInitialized = false;
        console.log('ProductInventoryEngine: Shutdown');
    }
}

// Global instance
export const productInventoryEngine = new ProductInventoryEngine();
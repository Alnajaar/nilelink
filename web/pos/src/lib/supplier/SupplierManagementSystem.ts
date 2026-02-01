/**
 * Supplier Management System
 * 
 * Handles supplier relationships, order placement, performance tracking,
 * and integration with AI inventory intelligence for optimized procurement
 */

import { EventEmitter } from 'events';
import { getAIInventoryIntelligence, SupplierRecommendation } from './AIInventoryIntelligence';

export interface Supplier {
    id: string;
    name: string;
    contact: {
        email: string;
        phone: string;
        website?: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    terms: {
        paymentTerms: string; // e.g., "Net 30"
        minimumOrder: number;
        shippingMethod: string;
        deliveryWindow: string;
    };
    reliabilityScore: number; // 0-100
    performanceMetrics: {
        onTimeDelivery: number; // percentage
        qualityRating: number; // 0-100
        responsiveness: number; // 0-100
        lastOrderDate?: number;
        averageLeadTime: number; // days
    };
    products: SupplierProduct[];
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface SupplierProduct {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    minOrderQuantity: number;
    leadTime: number; // days
    availability: 'in_stock' | 'limited' | 'out_of_stock';
    lastUpdated: number;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    totalAmount: number;
    status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdBy: string;
    approvedBy?: string;
    expectedDelivery: number;
    actualDelivery?: number;
    createdAt: number;
    updatedAt: number;
}

export interface PurchaseOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    expectedDeliveryDate: number;
}

export interface SupplierPerformanceReport {
    supplierId: string;
    supplierName: string;
    period: {
        startDate: number;
        endDate: number;
    };
    metrics: {
        totalOrders: number;
        onTimeDeliveries: number;
        lateDeliveries: number;
        earlyDeliveries: number;
        totalSpent: number;
        averageOrderValue: number;
        qualityIssues: number;
        communicationRating: number;
    };
    reliabilityScore: number;
    recommendations: string[];
}

export class SupplierManagementSystem extends EventEmitter {
    private suppliers: Map<string, Supplier> = new Map();
    private purchaseOrders: Map<string, PurchaseOrder> = new Map();
    private aiInventory = getAIInventoryIntelligence();

    constructor() {
        super();
        this.loadSuppliers();
        this.setupEventListeners();
    }

    /**
     * Add a new supplier
     */
    async addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'reliabilityScore' | 'performanceMetrics'>): Promise<Supplier> {
        const supplier: Supplier = {
            ...supplierData,
            id: `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            reliabilityScore: 50, // Starting score
            performanceMetrics: {
                onTimeDelivery: 0,
                qualityRating: 0,
                responsiveness: 0,
                averageLeadTime: supplierData.terms.deliveryWindow.includes('day') ? 
                    parseInt(supplierData.terms.deliveryWindow) : 7
            },
            isActive: true
        };

        this.suppliers.set(supplier.id, supplier);
        await this.saveSuppliers();
        
        this.emit('supplier.added', { supplierId: supplier.id, supplierName: supplier.name });
        return supplier;
    }

    /**
     * Update supplier information
     */
    async updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<boolean> {
        const supplier = this.suppliers.get(supplierId);
        if (!supplier) return false;

        const updatedSupplier = {
            ...supplier,
            ...updates,
            updatedAt: Date.now()
        };

        this.suppliers.set(supplierId, updatedSupplier as Supplier);
        await this.saveSuppliers();
        
        this.emit('supplier.updated', { supplierId, updates: Object.keys(updates) });
        return true;
    }

    /**
     * Get all active suppliers
     */
    getActiveSuppliers(): Supplier[] {
        return Array.from(this.suppliers.values())
            .filter(supplier => supplier.isActive)
            .sort((a, b) => b.reliabilityScore - a.reliabilityScore);
    }

    /**
     * Get supplier by ID
     */
    getSupplier(supplierId: string): Supplier | undefined {
        return this.suppliers.get(supplierId);
    }

    /**
     * Create purchase order from AI recommendations
     */
    async createPurchaseOrderFromAI(
        aiRecommendation: SupplierRecommendation,
        approverId: string
    ): Promise<PurchaseOrder> {
        const supplier = this.suppliers.get(aiRecommendation.supplierId);
        if (!supplier) {
            throw new Error(`Supplier ${aiRecommendation.supplierId} not found`);
        }

        const items: PurchaseOrderItem[] = aiRecommendation.products.map(product => ({
            productId: product.productId,
            productName: product.productName,
            quantity: 10, // This would come from AI recommendation
            unitPrice: product.price,
            totalPrice: product.price * 10,
            expectedDeliveryDate: Date.now() + (product.leadTime * 24 * 60 * 60 * 1000)
        }));

        const purchaseOrder: PurchaseOrder = {
            id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            items,
            totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
            status: 'draft',
            createdBy: approverId,
            expectedDelivery: Date.now() + (aiRecommendation.totalLeadTime * 24 * 60 * 60 * 1000),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.purchaseOrders.set(purchaseOrder.id, purchaseOrder);
        await this.savePurchaseOrders();
        
        this.emit('purchase.order.created', {
            orderId: purchaseOrder.id,
            supplierId: supplier.id,
            itemCount: items.length,
            totalAmount: purchaseOrder.totalAmount
        });

        return purchaseOrder;
    }

    /**
     * Submit purchase order for approval
     */
    async submitPurchaseOrder(orderId: string): Promise<boolean> {
        const order = this.purchaseOrders.get(orderId);
        if (!order || order.status !== 'draft') return false;

        const updatedOrder = {
            ...order,
            status: 'pending_approval',
            updatedAt: Date.now()
        };

        this.purchaseOrders.set(orderId, updatedOrder);
        await this.savePurchaseOrders();
        
        this.emit('purchase.order.submitted', { orderId, totalAmount: order.totalAmount });
        return true;
    }

    /**
     * Approve purchase order
     */
    async approvePurchaseOrder(orderId: string, approverId: string): Promise<boolean> {
        const order = this.purchaseOrders.get(orderId);
        if (!order || order.status !== 'pending_approval') return false;

        const updatedOrder = {
            ...order,
            status: 'approved',
            approvedBy: approverId,
            updatedAt: Date.now()
        };

        this.purchaseOrders.set(orderId, updatedOrder);
        await this.savePurchaseOrders();
        
        // Send order to supplier (would integrate with supplier APIs)
        this.sendOrderToSupplier(updatedOrder);
        
        this.emit('purchase.order.approved', {
            orderId,
            approverId,
            totalAmount: order.totalAmount
        });
        
        return true;
    }

    /**
     * Track delivery of purchase order
     */
    async trackDelivery(orderId: string, actualDeliveryDate?: number): Promise<boolean> {
        const order = this.purchaseOrders.get(orderId);
        if (!order || !['approved', 'sent', 'confirmed', 'shipped'].includes(order.status)) {
            return false;
        }

        const deliveryDate = actualDeliveryDate || Date.now();
        const isOnTime = deliveryDate <= order.expectedDelivery;
        
        const updatedOrder = {
            ...order,
            status: 'delivered',
            actualDelivery: deliveryDate,
            updatedAt: Date.now()
        };

        this.purchaseOrders.set(orderId, updatedOrder);
        await this.savePurchaseOrders();
        
        // Update supplier performance metrics
        await this.updateSupplierPerformance(order.supplierId, {
            deliveryOnTime: isOnTime,
            actualLeadTime: Math.floor((deliveryDate - order.createdAt) / (1000 * 60 * 60 * 24))
        });
        
        this.emit('purchase.order.delivered', {
            orderId,
            wasOnTime: isOnTime,
            daysLate: isOnTime ? 0 : Math.floor((deliveryDate - order.expectedDelivery) / (1000 * 60 * 60 * 24))
        });
        
        return true;
    }

    /**
     * Get pending purchase orders
     */
    getPendingOrders(): PurchaseOrder[] {
        return Array.from(this.purchaseOrders.values())
            .filter(order => ['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'shipped'].includes(order.status))
            .sort((a, b) => a.expectedDelivery - b.expectedDelivery);
    }

    /**
     * Get supplier performance report
     */
    async getSupplierPerformanceReport(
        supplierId: string,
        startDate: number,
        endDate: number
    ): Promise<SupplierPerformanceReport> {
        const supplier = this.suppliers.get(supplierId);
        if (!supplier) {
            throw new Error(`Supplier ${supplierId} not found`);
        }

        const supplierOrders = Array.from(this.purchaseOrders.values())
            .filter(order => 
                order.supplierId === supplierId &&
                order.createdAt >= startDate &&
                order.createdAt <= endDate &&
                order.status === 'delivered'
            );

        const metrics = {
            totalOrders: supplierOrders.length,
            onTimeDeliveries: supplierOrders.filter(o => 
                o.actualDelivery && o.actualDelivery <= o.expectedDelivery
            ).length,
            lateDeliveries: supplierOrders.filter(o => 
                o.actualDelivery && o.actualDelivery > o.expectedDelivery
            ).length,
            earlyDeliveries: supplierOrders.filter(o => 
                o.actualDelivery && o.actualDelivery < o.createdAt
            ).length,
            totalSpent: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            averageOrderValue: supplierOrders.length > 0 ? 
                supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0) / supplierOrders.length : 0,
            qualityIssues: 0, // Would track quality issues
            communicationRating: supplier.performanceMetrics.responsiveness
        };

        const onTimePercentage = metrics.totalOrders > 0 ? 
            (metrics.onTimeDeliveries / metrics.totalOrders) * 100 : 0;
        
        const reliabilityScore = Math.round(
            (onTimePercentage * 0.4) +
            (supplier.performanceMetrics.qualityRating * 0.3) +
            (supplier.performanceMetrics.responsiveness * 0.3)
        );

        const recommendations: string[] = [];
        if (onTimePercentage < 80) {
            recommendations.push('Improve delivery timing consistency');
        }
        if (supplier.performanceMetrics.qualityRating < 80) {
            recommendations.push('Address quality control issues');
        }
        if (supplier.performanceMetrics.responsiveness < 80) {
            recommendations.push('Enhance communication responsiveness');
        }

        return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            period: { startDate, endDate },
            metrics,
            reliabilityScore,
            recommendations
        };
    }

    /**
     * Compare suppliers for specific products
     */
    async compareSuppliers(productIds: string[]): Promise<{
        productId: string;
        productName: string;
        bestSupplier: SupplierRecommendation;
        alternatives: SupplierRecommendation[];
    }[]> {
        const comparisonResults = [];
        
        for (const productId of productIds) {
            // Get supplier recommendations for this product
            const recommendations = await this.aiInventory.getSupplierRecommendations([{ id: productId }]);
            
            if (recommendations.length > 0) {
                comparisonResults.push({
                    productId,
                    productName: `Product ${productId}`, // Would get real name
                    bestSupplier: recommendations[0],
                    alternatives: recommendations.slice(1)
                });
            }
        }
        
        return comparisonResults;
    }

    /**
     * Get low-stock alert suppliers
     */
    async getLowStockSuppliers(minimumStockLevel: number = 10): Promise<{
        supplier: Supplier;
        lowStockItems: SupplierProduct[];
    }[]> {
        const activeSuppliers = this.getActiveSuppliers();
        const results = [];

        for (const supplier of activeSuppliers) {
            const lowStockItems = supplier.products.filter(
                product => product.availability === 'limited' || 
                          parseInt(product.sku.split('-')[1] || '0') < minimumStockLevel
            );
            
            if (lowStockItems.length > 0) {
                results.push({ supplier, lowStockItems });
            }
        }

        return results;
    }

    // Private helper methods
    private async sendOrderToSupplier(order: PurchaseOrder): Promise<void> {
        const supplier = this.suppliers.get(order.supplierId);
        if (!supplier) return;

        // Simulate sending order to supplier
        setTimeout(() => {
            const updatedOrder = {
                ...order,
                status: 'sent',
                updatedAt: Date.now()
            };
            
            this.purchaseOrders.set(order.id, updatedOrder);
            this.emit('order.sent.to.supplier', {
                orderId: order.id,
                supplierId: supplier.id,
                supplierName: supplier.name
            });
        }, 2000); // Simulate network delay
    }

    private async updateSupplierPerformance(
        supplierId: string,
        metrics: {
            deliveryOnTime: boolean;
            actualLeadTime: number;
        }
    ): Promise<void> {
        const supplier = this.suppliers.get(supplierId);
        if (!supplier) return;

        const newOnTimeRate = metrics.deliveryOnTime ? 
            Math.min(100, supplier.performanceMetrics.onTimeDelivery + 2) :
            Math.max(0, supplier.performanceMetrics.onTimeDelivery - 5);

        const newLeadTime = metrics.actualLeadTime;

        const updatedSupplier = {
            ...supplier,
            performanceMetrics: {
                ...supplier.performanceMetrics,
                onTimeDelivery: newOnTimeRate,
                averageLeadTime: newLeadTime
            },
            reliabilityScore: this.calculateReliabilityScore({
                ...supplier.performanceMetrics,
                onTimeDelivery: newOnTimeRate,
                averageLeadTime: newLeadTime
            }),
            updatedAt: Date.now()
        };

        this.suppliers.set(supplierId, updatedSupplier);
        await this.saveSuppliers();
    }

    private calculateReliabilityScore(metrics: Supplier['performanceMetrics']): number {
        return Math.round(
            (metrics.onTimeDelivery * 0.4) +
            (metrics.qualityRating * 0.3) +
            (metrics.responsiveness * 0.3)
        );
    }

    private setupEventListeners(): void {
        // Listen to AI inventory events
        this.aiInventory.on('reorder.suggestions.generated', (data) => {
            this.emit('ai.reorder.suggestions', data);
        });

        this.aiInventory.on('dead.stock.detected', (data) => {
            this.emit('inventory.optimization.needed', data);
        });
    }

    private async loadSuppliers(): Promise<void> {
        try {
            const stored = localStorage.getItem('pos_suppliers');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.forEach((supplier: any) => {
                    this.suppliers.set(supplier.id, supplier);
                });
            } else {
                // Initialize with sample suppliers
                await this.initializeSampleSuppliers();
            }
        } catch (error) {
            console.error('Failed to load suppliers:', error);
            await this.initializeSampleSuppliers();
        }
    }

    private async saveSuppliers(): Promise<void> {
        try {
            localStorage.setItem('pos_suppliers', JSON.stringify(Array.from(this.suppliers.values())));
        } catch (error) {
            console.error('Failed to save suppliers:', error);
        }
    }

    private async loadPurchaseOrders(): Promise<void> {
        try {
            const stored = localStorage.getItem('pos_purchase_orders');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.forEach((order: any) => {
                    this.purchaseOrders.set(order.id, order);
                });
            }
        } catch (error) {
            console.error('Failed to load purchase orders:', error);
        }
    }

    private async savePurchaseOrders(): Promise<void> {
        try {
            localStorage.setItem('pos_purchase_orders', JSON.stringify(Array.from(this.purchaseOrders.values())));
        } catch (error) {
            console.error('Failed to save purchase orders:', error);
        }
    }

    private async initializeSampleSuppliers(): Promise<void> {
        const sampleSuppliers: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'reliabilityScore' | 'performanceMetrics'>[] = [
            {
                name: 'Fresh Produce Distributors',
                contact: {
                    email: 'orders@freshproduce.com',
                    phone: '+1-555-0101',
                    website: 'www.freshproduce.com'
                },
                address: {
                    street: '123 Market Street',
                    city: 'Foodville',
                    state: 'CA',
                    zipCode: '90210',
                    country: 'USA'
                },
                terms: {
                    paymentTerms: 'Net 30',
                    minimumOrder: 500,
                    shippingMethod: 'Refrigerated Truck',
                    deliveryWindow: '24 hours'
                },
                products: [
                    {
                        productId: 'prod_fruit_001',
                        productName: 'Organic Apples',
                        sku: 'APP-ORG-001',
                        unitPrice: 2.50,
                        minOrderQuantity: 50,
                        leadTime: 1,
                        availability: 'in_stock',
                        lastUpdated: Date.now()
                    }
                ],
                isActive: true
            },
            {
                name: 'General Food Supplies Co.',
                contact: {
                    email: 'supply@gfsco.com',
                    phone: '+1-555-0102'
                },
                address: {
                    street: '456 Industrial Blvd',
                    city: 'Supply City',
                    state: 'TX',
                    zipCode: '75001',
                    country: 'USA'
                },
                terms: {
                    paymentTerms: 'Net 15',
                    minimumOrder: 1000,
                    shippingMethod: 'Standard Truck',
                    deliveryWindow: '3-5 days'
                },
                products: [
                    {
                        productId: 'prod_grains_001',
                        productName: 'Whole Wheat Bread',
                        sku: 'BRD-WHW-001',
                        unitPrice: 3.25,
                        minOrderQuantity: 100,
                        leadTime: 3,
                        availability: 'in_stock',
                        lastUpdated: Date.now()
                    }
                ],
                isActive: true
            }
        ];

        for (const supplierData of sampleSuppliers) {
            await this.addSupplier(supplierData);
        }
    }
}

// Singleton instance
let supplierManagementSystem: SupplierManagementSystem | null = null;

export function getSupplierManagementSystem(): SupplierManagementSystem {
    if (!supplierManagementSystem) {
        supplierManagementSystem = new SupplierManagementSystem();
    }
    return supplierManagementSystem;
}
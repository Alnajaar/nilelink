// Procurement Engine
// AI-driven automatic reordering and supplier integration with POS inventory

import { eventBus, createEvent } from '../core/EventBus';
import { productInventoryEngine, InventoryAlert } from '../core/ProductInventoryEngine';
import { supplierOnboardingEngine, SupplierProduct } from './SupplierOnboardingEngine';

export enum ProcurementOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum ReorderStrategy {
  FIXED_QUANTITY = 'fixed_quantity',
  SALES_BASED = 'sales_based',
  TIME_BASED = 'time_based',
  PREDICTIVE = 'predictive',
  JUST_IN_TIME = 'just_in_time'
}

export interface ProcurementRule {
  id: string;
  businessId: string;
  productId: string;
  supplierId: string;
  strategy: ReorderStrategy;
  parameters: {
    reorderPoint?: number;
    reorderQuantity?: number;
    leadTime?: number; // days
    safetyStock?: number;
    maxStock?: number;
    reorderFrequency?: number; // days
  };
  autoReorder: boolean;
  approvalRequired: boolean;
  active: boolean;
  lastReorder?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProcurementOrder {
  id: string;
  businessId: string;
  supplierId: string;
  orderNumber: string;
  status: ProcurementOrderStatus;
  items: ProcurementOrderItem[];
  totalAmount: number;
  currency: string;
  requestedBy: string;
  approvedBy?: string;
  orderedAt?: number;
  expectedDelivery?: number;
  actualDelivery?: number;
  deliveryNotes?: string;
  specialInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProcurementOrderItem {
  id: string;
  productId: string;
  supplierProductId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  notes?: string;
}

export interface ReorderRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQuantity: number;
  supplierId: string;
  supplierName: string;
  unitCost: number;
  totalCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  expectedDelivery: number;
  lastOrdered?: number;
}

export interface ProcurementAnalytics {
  period: {
    start: number;
    end: number;
  };
  metrics: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    onTimeDeliveryRate: number;
    supplierPerformance: Record<string, {
      orders: number;
      onTimeDelivery: number;
      qualityRating: number;
    }>;
    stockoutIncidents: number;
    autoReorderSavings: number;
  };
}

class ProcurementEngine {
  private procurementRules: Map<string, ProcurementRule> = new Map();
  private procurementOrders: Map<string, ProcurementOrder> = new Map();
  private reorderRecommendations: Map<string, ReorderRecommendation[]> = new Map();
  private analyticsData: ProcurementAnalytics[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for inventory alerts
    eventBus.subscribe('INVENTORY_ALERT', (event) => {
      this.handleInventoryAlert(event.payload.alert);
    });

    // Listen for transaction completions to update analytics
    eventBus.subscribe('TRANSACTION_COMPLETED', (event) => {
      this.updateProcurementAnalytics(event.payload.transaction);
    });

    // Listen for supplier product updates
    eventBus.subscribe('SUPPLIER_PRODUCT_UPDATED', (event) => {
      this.updateProcurementRulesForProduct(event.payload.product);
    });

    // Schedule daily reorder check
    setInterval(() => {
      this.performDailyReorderCheck();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Create a procurement rule for automatic reordering
   */
  async createProcurementRule(ruleData: Omit<ProcurementRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementRule> {
    const ruleId = `proc_rule_${Date.now()}_${Math.random()}`;

    const rule: ProcurementRule = {
      id: ruleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...ruleData
    };

    this.procurementRules.set(ruleId, rule);

    await eventBus.publish(createEvent('PROCUREMENT_RULE_CREATED', {
      rule: { ...rule }
    }, {
      source: 'ProcurementEngine'
    }));

    return rule;
  }

  /**
   * Generate reorder recommendations based on current inventory
   */
  async generateReorderRecommendations(businessId: string): Promise<ReorderRecommendation[]> {
    const recommendations: ReorderRecommendation[] = [];
    const businessRules = Array.from(this.procurementRules.values())
      .filter(rule => rule.businessId === businessId && rule.active);

    for (const rule of businessRules) {
      const recommendation = await this.analyzeReorderNeed(rule);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.reorderRecommendations.set(businessId, recommendations);

    await eventBus.publish(createEvent('REORDER_RECOMMENDATIONS_GENERATED', {
      businessId,
      recommendations: recommendations.length
    }, {
      source: 'ProcurementEngine'
    }));

    return recommendations;
  }

  /**
   * Analyze if a product needs reordering
   */
  private async analyzeReorderNeed(rule: ProcurementRule): Promise<ReorderRecommendation | null> {
    const product = productInventoryEngine.getProduct(rule.productId);
    if (!product) return null;

    const primaryVariant = product.variants[0];
    if (!primaryVariant) return null;

    const currentStock = primaryVariant.inventory.available;
    const reorderPoint = rule.parameters.reorderPoint || primaryVariant.inventory.reorderPoint;

    // Check if reordering is needed
    let needsReorder = false;
    let recommendedQuantity = 0;
    let priority: ReorderRecommendation['priority'] = 'low';
    let reason = '';

    switch (rule.strategy) {
      case ReorderStrategy.FIXED_QUANTITY:
        if (currentStock <= reorderPoint) {
          needsReorder = true;
          recommendedQuantity = rule.parameters.reorderQuantity || reorderPoint * 2;
          reason = `Stock below reorder point (${currentStock} <= ${reorderPoint})`;
        }
        break;

      case ReorderStrategy.SALES_BASED:
        // Analyze sales velocity (simplified)
        const salesVelocity = await this.calculateSalesVelocity(rule.productId);
        const daysToStockout = currentStock / salesVelocity;

        if (daysToStockout <= 7) { // Less than a week of stock
          needsReorder = true;
          recommendedQuantity = Math.max(
            rule.parameters.reorderQuantity || salesVelocity * 14, // 2 weeks
            reorderPoint - currentStock + rule.parameters.safetyStock || 0
          );
          reason = `Sales velocity indicates ${daysToStockout.toFixed(1)} days until stockout`;
        }
        break;

      case ReorderStrategy.TIME_BASED:
        const lastReorder = rule.lastReorder || 0;
        const reorderFrequency = (rule.parameters.reorderFrequency || 7) * 24 * 60 * 60 * 1000;
        const nextReorder = lastReorder + reorderFrequency;

        if (Date.now() >= nextReorder) {
          needsReorder = true;
          recommendedQuantity = rule.parameters.reorderQuantity || reorderPoint;
          reason = `Time-based reorder schedule`;
        }
        break;

      case ReorderStrategy.PREDICTIVE:
        // AI-based prediction (simplified)
        const prediction = await this.predictDemand(rule.productId);
        if (prediction.confidence > 0.8) {
          needsReorder = true;
          recommendedQuantity = prediction.recommendedQuantity;
          reason = `AI prediction: ${prediction.reason}`;
        }
        break;
    }

    // Determine priority
    if (currentStock <= reorderPoint * 0.5) {
      priority = 'urgent';
    } else if (currentStock <= reorderPoint) {
      priority = 'high';
    } else if (currentStock <= reorderPoint * 1.5) {
      priority = 'medium';
    }

    if (!needsReorder) return null;

    // Find best supplier
    const supplierProduct = await this.findBestSupplierProduct(rule.productId, rule.supplierId);
    if (!supplierProduct) return null;

    const supplier = supplierOnboardingEngine.getSupplier(supplierProduct.supplierId);
    if (!supplier) return null;

    const recommendation: ReorderRecommendation = {
      productId: rule.productId,
      productName: product.name,
      currentStock,
      reorderPoint,
      recommendedQuantity,
      supplierId: supplierProduct.supplierId,
      supplierName: supplier.businessName,
      unitCost: supplierProduct.unitPrice,
      totalCost: recommendedQuantity * supplierProduct.unitPrice,
      priority,
      reason,
      expectedDelivery: Date.now() + (supplierProduct.leadTime * 60 * 60 * 1000),
      lastOrdered: rule.lastReorder
    };

    return recommendation;
  }

  /**
   * Create procurement order from recommendations
   */
  async createProcurementOrder(
    businessId: string,
    supplierId: string,
    items: Array<{
      productId: string;
      quantity: number;
    }>,
    requestedBy: string
  ): Promise<ProcurementOrder> {
    const orderId = `proc_order_${Date.now()}_${Math.random()}`;
    const orderNumber = `PO-${Date.now()}`;

    // Calculate totals and validate items
    let totalAmount = 0;
    const orderItems: ProcurementOrderItem[] = [];

    for (const item of items) {
      const supplierProduct = await this.findBestSupplierProduct(item.productId, supplierId);
      if (!supplierProduct) {
        throw new Error(`No supplier product found for ${item.productId}`);
      }

      const totalPrice = item.quantity * supplierProduct.unitPrice;
      totalAmount += totalPrice;

      orderItems.push({
        id: `item_${Date.now()}_${Math.random()}`,
        productId: item.productId,
        supplierProductId: supplierProduct.id,
        productName: supplierProduct.name,
        quantity: item.quantity,
        unitPrice: supplierProduct.unitPrice,
        totalPrice,
        receivedQuantity: 0,
        status: 'pending'
      });
    }

    const supplier = supplierOnboardingEngine.getSupplier(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    const order: ProcurementOrder = {
      id: orderId,
      businessId,
      supplierId,
      orderNumber,
      status: ProcurementOrderStatus.DRAFT,
      items: orderItems,
      totalAmount,
      currency: supplier.location.country === 'US' ? 'USD' : 'EUR', // Simplified
      requestedBy,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.procurementOrders.set(orderId, order);

    await eventBus.publish(createEvent('PROCUREMENT_ORDER_CREATED', {
      order: { ...order }
    }, {
      source: 'ProcurementEngine'
    }));

    return order;
  }

  /**
   * Submit order for approval
   */
  async submitOrderForApproval(orderId: string): Promise<void> {
    const order = this.procurementOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== ProcurementOrderStatus.DRAFT) {
      throw new Error(`Order ${orderId} is not in draft status`);
    }

    order.status = ProcurementOrderStatus.PENDING_APPROVAL;
    order.updatedAt = Date.now();

    await eventBus.publish(createEvent('PROCUREMENT_ORDER_SUBMITTED', {
      orderId,
      totalAmount: order.totalAmount
    }, {
      source: 'ProcurementEngine',
      priority: 'high'
    }));
  }

  /**
   * Approve procurement order
   */
  async approveOrder(orderId: string, approvedBy: string): Promise<void> {
    const order = this.procurementOrders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = ProcurementOrderStatus.APPROVED;
    order.approvedBy = approvedBy;
    order.orderedAt = Date.now();
    order.updatedAt = Date.now();

    // Send order to supplier
    await this.sendOrderToSupplier(order);

    await eventBus.publish(createEvent('PROCUREMENT_ORDER_APPROVED', {
      orderId,
      approvedBy,
      supplierId: order.supplierId
    }, {
      source: 'ProcurementEngine'
    }));
  }

  /**
   * Find best supplier product for a given product
   */
  private async findBestSupplierProduct(productId: string, preferredSupplierId?: string): Promise<SupplierProduct | null> {
    // If preferred supplier specified, check them first
    if (preferredSupplierId) {
      const products = await supplierOnboardingEngine.searchSupplierProducts({
        supplierId: preferredSupplierId
      });

      const product = products.find(p => p.sku === productId || p.name.includes(productId));
      if (product) return product;
    }

    // Search across all verified suppliers
    const products = await supplierOnboardingEngine.searchSupplierProducts({
      query: productId,
      verifiedOnly: true,
      limit: 10
    });

    // Return best match (could be based on price, rating, delivery time)
    return products[0] || null;
  }

  /**
   * Calculate sales velocity for a product
   */
  private async calculateSalesVelocity(productId: string): Promise<number> {
    // Simplified - in real implementation, analyze transaction history
    return 5; // 5 units per day
  }

  /**
   * Predict demand using AI (simplified)
   */
  private async predictDemand(productId: string): Promise<{
    recommendedQuantity: number;
    confidence: number;
    reason: string;
  }> {
    // Mock AI prediction
    return {
      recommendedQuantity: 50,
      confidence: 0.85,
      reason: 'Seasonal demand increase predicted'
    };
  }

  /**
   * Handle inventory alerts
   */
  private async handleInventoryAlert(alert: InventoryAlert): Promise<void> {
    if (alert.type === 'low_stock') {
      // Trigger reorder check for this product
      const rules = Array.from(this.procurementRules.values())
        .filter(rule => rule.productId === alert.productId && rule.active);

      for (const rule of rules) {
        if (rule.autoReorder) {
          await this.createAutoReorder(rule);
        } else {
          // Generate recommendation
          await this.generateReorderRecommendations(rule.businessId);
        }
      }
    }
  }

  /**
   * Create automatic reorder
   */
  private async createAutoReorder(rule: ProcurementRule): Promise<void> {
    const recommendation = await this.analyzeReorderNeed(rule);
    if (!recommendation) return;

    try {
      const order = await this.createProcurementOrder(
        rule.businessId,
        rule.supplierId,
        [{
          productId: rule.productId,
          quantity: recommendation.recommendedQuantity
        }],
        'auto_reorder_system'
      );

      if (!rule.approvalRequired) {
        await this.approveOrder(order.id, 'auto_approval');
      } else {
        await this.submitOrderForApproval(order.id);
      }

      rule.lastReorder = Date.now();
      this.procurementRules.set(rule.id, rule);

    } catch (error) {
      console.error('Auto reorder failed:', error);
      await eventBus.publish(createEvent('AUTO_REORDER_FAILED', {
        ruleId: rule.id,
        productId: rule.productId,
        error: error.message
      }, {
        source: 'ProcurementEngine',
        priority: 'high'
      }));
    }
  }

  /**
   * Send order to supplier (integration point)
   */
  private async sendOrderToSupplier(order: ProcurementOrder): Promise<void> {
    // Integration with supplier systems (email, API, EDI, etc.)
    console.log('ProcurementEngine: Sending order to supplier', order.supplierId, order.orderNumber);

    // Mock supplier notification
    await eventBus.publish(createEvent('SUPPLIER_ORDER_SENT', {
      orderId: order.id,
      supplierId: order.supplierId,
      orderNumber: order.orderNumber
    }, {
      source: 'ProcurementEngine'
    }));
  }

  /**
   * Update procurement rules when supplier products change
   */
  private updateProcurementRulesForProduct(product: SupplierProduct): void {
    // Update pricing in rules if supplier changes
    console.log('ProcurementEngine: Supplier product updated', product.id);
  }

  /**
   * Perform daily reorder check
   */
  private async performDailyReorderCheck(): Promise<void> {
    const businessIds = new Set(
      Array.from(this.procurementRules.values()).map(rule => rule.businessId)
    );

    for (const businessId of businessIds) {
      await this.generateReorderRecommendations(businessId);
    }
  }

  /**
   * Update procurement analytics
   */
  private updateProcurementAnalytics(transaction: any): Promise<void> {
    // Update analytics based on transaction data
    console.log('ProcurementEngine: Analytics updated from transaction', transaction.id);
    return Promise.resolve();
  }

  /**
   * Get procurement order by ID
   */
  getProcurementOrder(orderId: string): ProcurementOrder | null {
    return this.procurementOrders.get(orderId) || null;
  }

  /**
   * Get reorder recommendations for business
   */
  getReorderRecommendations(businessId: string): ReorderRecommendation[] {
    return this.reorderRecommendations.get(businessId) || [];
  }

  /**
   * Get procurement analytics
   */
  getProcurementAnalytics(businessId: string, days: number = 30): ProcurementAnalytics | null {
    // Return analytics for the specified period
    return null; // Implementation needed
  }

  /**
   * Initialize the engine
   */
  initialize(): void {
    this.isInitialized = true;
    console.log('ProcurementEngine: Initialized');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    this.isInitialized = false;
    console.log('ProcurementEngine: Shutdown');
  }
}

// Global procurement engine instance
export const procurementEngine = new ProcurementEngine();
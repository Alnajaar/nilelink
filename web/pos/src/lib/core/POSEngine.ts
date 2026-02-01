// POS Engine - Main Orchestrator
// Ties together all core systems for a unified POS experience

import { eventBus, EventTypes, createEvent, EventPriority } from './EventBus';
import { hal } from './HAL';
import { productInventoryEngine } from './ProductInventoryEngine';
import { businessTypeResolver } from './BusinessTypeResolver';
import { securityAgentManager } from '../../../../shared/lib/ai/SecurityAgentManager';
import { OrderSyncService } from '../../../../shared/services/OrderSyncService';

export enum EngineState {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  ERROR = 'error',
  SHUTDOWN = 'shutdown'
}

export interface EngineConfig {
  businessId: string;
  branchId?: string;
  userId?: string;
  sessionId?: string;
  features: {
    hardwareEnabled: boolean;
    inventoryEnabled: boolean;
    multiLocation: boolean;
    onlineOrdering: boolean;
    loyaltyProgram: boolean;
  };
  performance: {
    maxConcurrentTransactions: number;
    cacheEnabled: boolean;
    offlineMode: boolean;
  };
}

export interface TransactionContext {
  id: string;
  type: 'sale' | 'refund' | 'exchange' | 'void';
  items: TransactionItem[];
  customer?: CustomerInfo;
  payments: PaymentInfo[];
  discounts: DiscountInfo[];
  taxes: TaxInfo[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  timestamp: number;
  metadata: Record<string, any>;
}

export interface TransactionItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discounts: number;
  taxes: number;
  total: number;
  metadata: Record<string, any>;
}

export interface CustomerInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
  metadata: Record<string, any>;
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'digital_wallet' | 'store_credit' | 'check';
  amount: number;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, any>;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed' | 'loyalty_points';
  value: number;
  reason?: string;
  appliedBy?: string;
  metadata: Record<string, any>;
}

export interface TaxInfo {
  rate: number;
  amount: number;
  jurisdiction: string;
  category: string;
  metadata: Record<string, any>;
}

export class POSEngine {
  private state: EngineState = EngineState.INITIALIZING;
  private config: EngineConfig;
  private currentTransaction: TransactionContext | null = null;
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private performanceMetrics = {
    transactionsProcessed: 0,
    averageTransactionTime: 0,
    hardwareErrors: 0,
    systemUptime: 0
  };

  constructor(config: EngineConfig) {
    this.config = config;
    this.initializeEngine();
  }

  /**
   * Initialize the POS Engine
   */
  private async initializeEngine(): Promise<void> {
    try {
      console.log('POSEngine: Initializing...');

      // Initialize core systems
      await this.initializeCoreSystems();

      // Setup event handlers
      this.setupEventHandlers();

      // Load business configuration
      await this.loadBusinessConfiguration();

      // Initialize hardware if enabled
      if (this.config.features.hardwareEnabled) {
        await this.initializeHardware();
      }

      // Set ready state
      this.state = EngineState.READY;
      this.performanceMetrics.systemUptime = Date.now();

      await eventBus.publish(createEvent(EventTypes.SYSTEM_STARTUP, {
        component: 'POSEngine',
        config: this.config,
        state: this.state
      }, {
        source: 'POSEngine',
        priority: EventPriority.HIGH
      }));

      console.log('POSEngine: Ready');

    } catch (error: any) {
      this.state = EngineState.ERROR;
      console.error('POSEngine: Initialization failed:', error);

      await eventBus.publish(createEvent('SYSTEM_ERROR', {
        component: 'POSEngine',
        error: error.message,
        phase: 'initialization'
      }, {
        source: 'POSEngine',
        priority: 'critical'
      }));
    }
  }

  /**
   * Initialize core systems
   */
  private async initializeCoreSystems(): Promise<void> {
    // Initialize Event Bus
    eventBus.initialize();

    // Initialize Product & Inventory Engine
    if (this.config.features.inventoryEnabled) {
      await productInventoryEngine.initialize();
    }

    // Initialize Business Type Resolver
    businessTypeResolver.initialize();

    // Initialize External Order Sync (Customer App -> POS)
    try {
      const orderSync = OrderSyncService.getInstance({
        pollingInterval: 5000
      });

      // This makes sure we fetch contract interactions or init
      // For now assuming OrderSyncService handles its own lazy init or shares state

      orderSync.subscribeToNewOrders(async (syncedOrder) => {
        console.log('POSEngine: External order received:', syncedOrder.id);

        await eventBus.publish(createEvent('EXTERNAL_ORDER_RECEIVED', {
          order: syncedOrder
        }, {
          source: 'OrderSyncService',
          priority: EventPriority.HIGH
        }));

        // If order is already paid/confirmed via app, send to kitchen immediately
        if (syncedOrder.status === 'confirmed' || syncedOrder.status === 'created') {
          // We need to convert SyncedOrder to TransactionContext or similar for Kitchen
          // For now, mapping essentially
          const { getKitchenCoordinationSystem } = await import('../restaurant/KitchenCoordinationSystem');
          const kitchenSystem = getKitchenCoordinationSystem(syncedOrder.restaurantId || this.config.branchId || 'default');

          const kitchenItems = syncedOrder.items.map((item: any) => ({
            id: item.id || `k_item_${Math.random().toString(36).substr(2, 9)}`,
            menuItemId: item.productId || item.id,
            name: item.name || 'External Item',
            quantity: item.quantity || 1,
            status: 'pending' as const,
            preparationTimeEstimate: 10
          }));

          kitchenSystem.createOrder({
            customerName: syncedOrder.deliveryAddress ? 'Delivery Customer' : 'Customer', // Extract name if available
            items: kitchenItems,
            priority: 'normal',
            serverId: 'online_system',
            branchId: syncedOrder.restaurantId,
            metadata: {
              createdAt: syncedOrder.createdAt,
              lastUpdated: Date.now(),
              externalOrderId: syncedOrder.id,
              source: 'customer_app'
            }
          });

          console.log(`POSEngine: Auto-forwarded external order ${syncedOrder.id} to kitchen`);
        }
      });
    } catch (err) {
      console.warn('POSEngine: Failed to initialize OrderSync:', err);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle hardware events
    eventBus.subscribe('HARDWARE_DATA_SCANNER', async (event) => {
      await this.handleHardwareData('scanner', event.payload);
    });

    eventBus.subscribe('HARDWARE_DATA_SCALE', async (event) => {
      await this.handleHardwareData('scale', event.payload);
    });

    eventBus.subscribe('HARDWARE_ERROR', async (event) => {
      this.performanceMetrics.hardwareErrors++;
      await this.handleHardwareError(event.payload);
    });

    // Handle transaction events
    eventBus.subscribe(EventTypes.TRANSACTION_COMPLETED, async (event) => {
      this.performanceMetrics.transactionsProcessed++;
      await this.handleTransactionCompleted(event.payload);
    });

    // Handle product events
    eventBus.subscribe(EventTypes.PRODUCT_CREATED, async (event) => {
      await this.handleProductEvent('created', event.payload);
    });

    eventBus.subscribe(EventTypes.PRODUCT_UPDATED, async (event) => {
      await this.handleProductEvent('updated', event.payload);
    });

    // Handle inventory alerts
    eventBus.subscribe('INVENTORY_ALERT', async (event) => {
      await this.handleInventoryAlert(event.payload);
    });
  }

  /**
   * Load business configuration
   */
  private async loadBusinessConfiguration(): Promise<void> {
    const profile = businessTypeResolver.getBusinessProfile(this.config.businessId);
    if (profile) {
      // Load business-specific modules and features
      await businessTypeResolver.loadModulesForBusiness(this.config.businessId);
    }
  }

  /**
   * Initialize hardware
   */
  private async initializeHardware(): Promise<void> {
    hal.initialize();
    console.log('POSEngine: Hardware initialized');
  }

  /**
   * Start a new transaction
   */
  async startTransaction(type: TransactionContext['type'] = 'sale'): Promise<TransactionContext> {
    if (this.state !== EngineState.READY) {
      throw new Error('POS Engine is not ready');
    }

    const transaction: TransactionContext = {
      id: `txn_${Date.now()}_${Math.random()}`,
      type,
      items: [],
      payments: [],
      discounts: [],
      taxes: [],
      total: 0,
      status: 'pending',
      timestamp: Date.now(),
      metadata: {
        businessId: this.config.businessId,
        branchId: this.config.branchId,
        userId: this.config.userId,
        sessionId: this.config.sessionId
      }
    };

    this.currentTransaction = transaction;
    this.activeTransactions.set(transaction.id, transaction);

    await eventBus.publish(createEvent(EventTypes.TRANSACTION_STARTED, {
      transaction: { ...transaction }
    }, {
      source: 'POSEngine',
      correlationId: transaction.id
    }));

    return transaction;
  }

  /**
   * Add item to current transaction
   */
  async addItem(productId: string, quantity: number, variantId?: string): Promise<TransactionItem> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    const product = productInventoryEngine.getProduct(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const variant = variantId
      ? product.variants.find(v => v.id === variantId)
      : product.variants[0];

    if (!variant) {
      throw new Error(`Product variant not found`);
    }

    // Check inventory if enabled (Phase 2.4 - Decentralized Sync)
    if (this.config.features.inventoryEnabled) {
      const { stockSync } = await import('@shared/engines/StockSyncEngine');
      const effectiveStock = stockSync.getEffectiveStock(productId);

      if (effectiveStock < quantity) {
        throw new Error(`Insufficient inventory: ${effectiveStock} available (effective), ${quantity} requested`);
      }

      // Propose decentralized lock
      const lockAcquired = await stockSync.proposeLock(productId, quantity, this.config.sessionId || '');
      if (!lockAcquired) {
        throw new Error(`Failed to acquire decentralized inventory lock for ${productId}`);
      }
    }

    const item: TransactionItem = {
      productId,
      variantId,
      quantity,
      unitPrice: variant.price,
      discounts: 0,
      taxes: variant.price * quantity * (product.taxRate / 100),
      total: variant.price * quantity,
      metadata: {
        productName: product.name,
        variantName: variant.name
      }
    };

    this.currentTransaction.items.push(item);
    this.recalculateTransaction();

    await eventBus.publish(createEvent('TRANSACTION_ITEM_ADDED', {
      transactionId: this.currentTransaction.id,
      item: { ...item }
    }, {
      source: 'POSEngine',
      correlationId: this.currentTransaction.id
    }));

    return item;
  }

  /**
   * Remove item from current transaction
   */
  async removeItem(productId: string, variantId?: string): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    const index = this.currentTransaction.items.findIndex(
      item => item.productId === productId && (variantId ? item.variantId === variantId : true)
    );

    if (index === -1) {
      throw new Error(`Item ${productId} not found in transaction`);
    }

    const removedItem = this.currentTransaction.items[index];
    this.currentTransaction.items.splice(index, 1);
    this.recalculateTransaction();

    await eventBus.publish(createEvent('TRANSACTION_ITEM_REMOVED', {
      transactionId: this.currentTransaction.id,
      productId,
      variantId,
      item: { ...removedItem }
    }, {
      source: 'POSEngine',
      correlationId: this.currentTransaction.id
    }));
  }

  /**
   * Update item quantity in current transaction
   */
  async updateItemQuantity(productId: string, quantity: number, variantId?: string): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    const item = this.currentTransaction.items.find(
      i => i.productId === productId && (variantId ? i.variantId === variantId : true)
    );

    if (!item) {
      throw new Error(`Item ${productId} not found in transaction`);
    }

    if (quantity <= 0) {
      return this.removeItem(productId, variantId);
    }

    // Check inventory if quantity increased
    if (quantity > item.quantity && this.config.features.inventoryEnabled) {
      const diff = quantity - item.quantity;
      const { stockSync } = await import('@shared/engines/StockSyncEngine');
      const effectiveStock = stockSync.getEffectiveStock(productId);

      if (effectiveStock < diff) {
        throw new Error(`Insufficient inventory: ${effectiveStock} available, ${diff} more requested`);
      }

      const lockAcquired = await stockSync.proposeLock(productId, diff, this.config.sessionId || '');
      if (!lockAcquired) {
        throw new Error(`Failed to acquire decentralized inventory lock for ${productId}`);
      }
    }

    const oldQuantity = item.quantity;
    item.quantity = quantity;

    // Recalculate item totals
    const product = productInventoryEngine.getProduct(productId);
    if (product) {
      item.taxes = item.unitPrice * quantity * (product.taxRate / 100);
    }
    item.total = item.unitPrice * quantity;

    this.recalculateTransaction();

    await eventBus.publish(createEvent('TRANSACTION_ITEM_UPDATED', {
      transactionId: this.currentTransaction.id,
      productId,
      variantId,
      oldQuantity,
      newQuantity: quantity,
      item: { ...item }
    }, {
      source: 'POSEngine',
      correlationId: this.currentTransaction.id
    }));
  }

  /**
   * Apply discount to transaction
   */
  async applyDiscount(discount: DiscountInfo): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    this.currentTransaction.discounts.push(discount);
    this.recalculateTransaction();

    await eventBus.publish(createEvent('TRANSACTION_DISCOUNT_APPLIED', {
      transactionId: this.currentTransaction.id,
      discount: { ...discount }
    }, {
      source: 'POSEngine',
      correlationId: this.currentTransaction.id
    }));
  }

  /**
   * Process payment
   */
  async processPayment(payment: PaymentInfo): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    // AI Security Check
    const securityAnalysis = await securityAgentManager.analyzeTransaction({
      amount: payment.amount,
      currency: 'USDC', // Default for now
      userId: this.currentTransaction.customer?.id || 'anonymous',
      userAgeDays: 0,
      txnHistoryCount: 0,
      ipCountry: 'Unknown',
      billingCountry: 'Unknown'
    }, {
      user_role: 'POS_OPERATOR',
      environment: 'stable',
      system_state: 'POS_CHECKOUT',
      emotional_signals: [],
      urgency_level: 5
    });

    if (securityAnalysis.is_blocked) {
      throw new Error(`Transaction Blocked by AI Security: ${securityAnalysis.concerns.join(', ')}`);
    }

    this.currentTransaction.payments.push(payment);

    // Check if payment covers the total
    const totalPaid = this.currentTransaction.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= this.currentTransaction.total) {
      await this.completeTransaction();
    }

    await eventBus.publish(createEvent('PAYMENT_PROCESSED', {
      transactionId: this.currentTransaction.id,
      payment: { ...payment }
    }, {
      source: 'POSEngine',
      correlationId: this.currentTransaction.id
    }));
  }

  /**
   * Complete current transaction
   */
  async completeTransaction(): Promise<TransactionContext> {
    if (!this.currentTransaction) {
      throw new Error('No active transaction');
    }

    const transaction = this.currentTransaction;
    transaction.status = 'completed';

    // Update inventory
    if (this.config.features.inventoryEnabled) {
      for (const item of transaction.items) {
        await productInventoryEngine.addInventoryTransaction({
          productId: item.productId,
          variantId: item.variantId,
          type: 'sale',
          quantity: -item.quantity,
          sellingPrice: item.unitPrice,
          userId: this.config.userId || 'system',
          reference: transaction.id,
          reason: 'Sale transaction'
        });
      }
    }

    // Print receipt if hardware available
    if (this.config.features.hardwareEnabled) {
      await this.printReceipt(transaction);
    }

    this.activeTransactions.delete(transaction.id);
    this.currentTransaction = null;

    await eventBus.publish(createEvent(EventTypes.TRANSACTION_COMPLETED, {
      transaction: { ...transaction }
    }, {
      source: 'POSEngine',
      correlationId: transaction.id
    }));

    return transaction;
  }

  /**
   * Cancel current transaction
   */
  async cancelTransaction(): Promise<void> {
    if (!this.currentTransaction) {
      return;
    }

    const transaction = this.currentTransaction;
    transaction.status = 'cancelled';

    this.activeTransactions.delete(transaction.id);
    this.currentTransaction = null;

    await eventBus.publish(createEvent(EventTypes.TRANSACTION_CANCELLED, {
      transactionId: transaction.id
    }, {
      source: 'POSEngine',
      correlationId: transaction.id
    }));
  }

  /**
   * Recalculate transaction totals
   */
  private recalculateTransaction(): void {
    if (!this.currentTransaction) return;

    let subtotal = 0;
    let totalDiscounts = 0;
    let totalTaxes = 0;

    // Calculate item totals
    for (const item of this.currentTransaction.items) {
      subtotal += item.total;
      totalTaxes += item.taxes;
    }

    // Apply discounts
    for (const discount of this.currentTransaction.discounts) {
      if (discount.type === 'percentage') {
        totalDiscounts += (subtotal * discount.value) / 100;
      } else if (discount.type === 'fixed') {
        totalDiscounts += discount.value;
      }
    }

    // Recalculate taxes after discounts
    // Real implementation should calculate based on items and jurisdiction
    totalTaxes = this.currentTransaction.items.reduce((sum, item) => sum + item.taxes, 0);

    this.currentTransaction.total = subtotal - totalDiscounts + totalTaxes;
  }

  /**
   * Print receipt
   */
  private async printReceipt(transaction: TransactionContext): Promise<void> {
    try {
      const receiptData = this.formatReceipt(transaction);
      await hal.executeOnDevice('printer', 'print_receipt', receiptData);
    } catch (error) {
      console.warn('POSEngine: Receipt printing failed:', error);
    }
  }

  /**
   * Format receipt data
   */
  private formatReceipt(transaction: TransactionContext): any {
    return {
      transactionId: transaction.id,
      timestamp: new Date(transaction.timestamp).toLocaleString(),
      items: transaction.items.map(item => ({
        name: item.metadata.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total
      })),
      subtotal: transaction.items.reduce((sum, item) => sum + item.total, 0),
      discounts: transaction.discounts.reduce((sum, d) => sum + d.value, 0),
      taxes: transaction.taxes.reduce((sum, t) => sum + t.amount, 0),
      total: transaction.total,
      payments: transaction.payments
    };
  }

  /**
   * Handle hardware data
   */
  private async handleHardwareData(deviceType: string, data: any): Promise<void> {
    switch (deviceType) {
      case 'scanner':
        // Handle barcode scan
        if (this.currentTransaction && data.type === 'barcode') {
          try {
            await this.addItem(data.productId, 1);
          } catch (error) {
            console.warn('POSEngine: Failed to add scanned item:', error);
          }
        }
        break;

      case 'scale':
        // Handle weight data
        if (this.currentTransaction && data.stable) {
          // Update current item weight if applicable
        }
        break;
    }
  }

  /**
   * Handle hardware errors
   */
  private async handleHardwareError(error: any): Promise<void> {
    console.error('POSEngine: Hardware error:', error);

    // Could implement fallback behavior here
    // e.g., switch to manual input mode
  }

  /**
   * Handle transaction completed
   */
  private async handleTransactionCompleted(payload: any): Promise<void> {
    // Update performance metrics
    const transactionTime = Date.now() - payload.transaction.timestamp;
    this.updateAverageTransactionTime(transactionTime);

    // Send to kitchen if applicable (Phase 2 Integration)
    await this.sendToKitchen(payload.transaction);
  }

  /**
   * Send completed transaction to Kitchen System
   */
  private async sendToKitchen(transaction: TransactionContext): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency issues if any, and only load if needed
      const { getKitchenCoordinationSystem } = await import('../restaurant/KitchenCoordinationSystem');
      const kitchenSystem = getKitchenCoordinationSystem(transaction.metadata.branchId || this.config.branchId || 'default');

      // Map POS items to Kitchen items
      const kitchenItems = transaction.items.map(item => ({
        id: `k_item_${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: item.productId,
        name: item.metadata.productName || 'Unknown Item',
        quantity: item.quantity,
        status: 'pending' as const, // explicitly cast literal
        preparationTimeEstimate: 10 // Default 10 mins
      }));

      kitchenSystem.createOrder({
        customerName: transaction.customer?.name || 'Walk-in',
        tableNumber: transaction.metadata.tableNumber ? parseInt(transaction.metadata.tableNumber) : undefined,
        items: kitchenItems,
        priority: 'normal',
        serverId: transaction.metadata.userId || 'system',
        specialInstructions: transaction.metadata.note || ''
      });

    } catch (error) {
      console.warn('POSEngine: Failed to send to kitchen:', error);
    }
  }

  /**
   * Handle product events
   */
  private async handleProductEvent(eventType: string, payload: any): Promise<void> {
    // Could update local caches, refresh displays, etc.
    console.log(`POSEngine: Product ${eventType}:`, payload.product.name);
  }

  /**
   * Handle inventory alerts
   */
  private async handleInventoryAlert(alert: any): Promise<void> {
    // Could show notifications, trigger reorder workflows, etc.
    console.warn('POSEngine: Inventory alert:', alert.message);
  }

  /**
   * Update average transaction time
   */
  private updateAverageTransactionTime(transactionTime: number): void {
    const current = this.performanceMetrics.averageTransactionTime;
    const total = this.performanceMetrics.transactionsProcessed;
    this.performanceMetrics.averageTransactionTime = (current * (total - 1) + transactionTime) / total;
  }

  /**
   * Get current engine state
   */
  getState(): EngineState {
    return this.state;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      activeTransactions: this.activeTransactions.size,
      uptime: Date.now() - this.performanceMetrics.systemUptime
    };
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction(): TransactionContext | null {
    return this.currentTransaction ? { ...this.currentTransaction } : null;
  }

  /**
   * Get active transactions
   */
  getActiveTransactions(): TransactionContext[] {
    return Array.from(this.activeTransactions.values()).map(t => ({ ...t }));
  }

  /**
   * Shutdown the engine
   */
  async shutdown(): Promise<void> {
    this.state = EngineState.SHUTDOWN;

    // Cancel active transactions
    for (const transaction of this.activeTransactions.values()) {
      await this.cancelTransaction();
    }

    // Shutdown subsystems
    hal.shutdown();
    productInventoryEngine.shutdown();
    businessTypeResolver.shutdown();

    await eventBus.publish(createEvent('SYSTEM_SHUTDOWN', {
      component: 'POSEngine'
    }, {
      source: 'POSEngine',
      priority: EventPriority.HIGH
    }));
  }
}

// Export singleton factory
let posEngineInstance: POSEngine | null = null;

export function createPOSEngine(config: EngineConfig): POSEngine {
  if (posEngineInstance) {
    throw new Error('POS Engine already initialized');
  }

  posEngineInstance = new POSEngine(config);
  return posEngineInstance;
}

export function getPOSEngine(): POSEngine | null {
  return posEngineInstance;
}
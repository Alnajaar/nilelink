/**
 * SupplierService.ts
 * 
 * Core service for managing supplier operations in the NileLink ecosystem.
 * Handles B2B operations, order processing, inventory sync, and commission management.
 */

import { DatabaseService } from './DatabaseService';
import { NotificationService } from './NotificationService';
import { CommissionService } from './CommissionService';

export interface Supplier {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxId?: string;
  businessType: 'wholesaler' | 'distributor' | 'manufacturer' | 'retailer';
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commissionRate: number;
  payoutMethod: 'bank_transfer' | 'crypto' | 'check';
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  cryptoAddress?: string;
  minOrderAmount?: number;
  shippingOptions: ShippingOption[];
  inventorySyncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalSales: number;
  totalOrders: number;
  rating: number;
  active: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDays: number;
  serviceType: 'standard' | 'express' | 'overnight';
  zones: string[]; // Geographic zones where this shipping option applies
}

export interface SupplierInventory {
  id: string;
  supplierId: string;
  productId: string;
  sku: string;
  productName: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  reservedQuantity: number; // Quantity reserved for pending orders
  minStockThreshold: number;
  maxOrderQuantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[]; // URLs to product images
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  buyerId: string; // Could be POS merchant or another business
  items: SupplierOrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  totalCost: number; // Cost to supplier
  commissionAmount: number; // Commission to platform
  netAmount: number; // Amount to supplier after commission
  shippingAddress: string;
  billingAddress: string;
  shippingOptionId: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierOrderItem {
  id: string;
  orderId: string;
  inventoryId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface SupplierPayout {
  id: string;
  supplierId: string;
  orderId: string;
  amount: number;
  commissionAmount: number;
  payoutMethod: 'bank_transfer' | 'crypto' | 'check';
  status: 'pending' | 'processed' | 'failed' | 'cancelled';
  processedAt?: Date;
  referenceId?: string; // Transaction ID from payment processor
  notes?: string;
}

export class SupplierService {
  private db: DatabaseService;
  private notificationService: NotificationService;
  private commissionService: CommissionService;

  constructor(
    databaseService: DatabaseService,
    notificationService: NotificationService,
    commissionService: CommissionService
  ) {
    this.db = databaseService;
    this.notificationService = notificationService;
    this.commissionService = commissionService;
  }

  /**
   * Register a new supplier in the system
   */
  async registerSupplier(supplierData: Omit<Supplier, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'totalSales' | 'totalOrders' | 'rating' | 'active'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: this.generateId(),
      ...supplierData,
      status: 'pending', // Requires admin approval
      totalSales: 0,
      totalOrders: 0,
      rating: 0,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    await this.db.create('suppliers', newSupplier);

    // Notify admins about new supplier registration
    await this.notificationService.sendToAdmins({
      title: 'New Supplier Registration',
      message: `A new supplier "${newSupplier.businessName}" has registered and is pending approval`,
      type: 'info',
      priority: 'high',
      data: {
        supplierId: newSupplier.id,
        businessName: newSupplier.businessName,
        contactEmail: newSupplier.contactEmail
      }
    });

    return newSupplier;
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    return await this.db.findById('suppliers', id);
  }

  /**
   * Get supplier by user ID
   */
  async getSupplierByUserId(userId: string): Promise<Supplier | null> {
    const suppliers = await this.db.findByField('suppliers', 'userId', userId);
    return suppliers.length > 0 ? suppliers[0] : null;
  }

  /**
   * Update supplier information
   */
  async updateSupplier(id: string, updateData: Partial<Omit<Supplier, 'id' | 'userId' | 'createdAt'>>): Promise<boolean> {
    const existingSupplier = await this.db.findById('suppliers', id);
    if (!existingSupplier) {
      throw new Error(`Supplier with ID ${id} not found`);
    }

    const updateObj = {
      ...updateData,
      updatedAt: new Date()
    };

    await this.db.update('suppliers', id, updateObj);

    // Notify admins if critical fields changed
    if (updateData.status && existingSupplier.status !== updateData.status) {
      await this.notificationService.sendToAdmins({
        title: 'Supplier Status Changed',
        message: `Supplier "${existingSupplier.businessName}" status changed from ${existingSupplier.status} to ${updateData.status}`,
        type: 'info',
        priority: 'medium',
        data: {
          supplierId: id,
          previousStatus: existingSupplier.status,
          newStatus: updateData.status
        }
      });
    }

    return true;
  }

  /**
   * Approve supplier registration
   */
  async approveSupplier(supplierId: string, adminId: string): Promise<boolean> {
    const supplier = await this.db.findById('suppliers', supplierId);
    if (!supplier) {
      throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    if (supplier.status === 'approved') {
      return true; // Already approved
    }

    await this.updateSupplier(supplierId, {
      status: 'approved',
      active: true
    });

    // Notify supplier about approval
    await this.notificationService.sendToUser(supplier.userId, {
      title: 'Supplier Registration Approved',
      message: `Your supplier registration for "${supplier.businessName}" has been approved. You can now start receiving orders.`,
      type: 'success',
      priority: 'high',
      data: {
        supplierId: supplier.id,
        businessName: supplier.businessName
      }
    });

    return true;
  }

  /**
   * Suspend supplier
   */
  async suspendSupplier(supplierId: string, reason?: string): Promise<boolean> {
    const supplier = await this.db.findById('suppliers', supplierId);
    if (!supplier) {
      throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    await this.updateSupplier(supplierId, {
      status: 'suspended',
      active: false
    });

    // Notify supplier about suspension
    await this.notificationService.sendToUser(supplier.userId, {
      title: 'Supplier Account Suspended',
      message: `Your supplier account "${supplier.businessName}" has been suspended${reason ? `. Reason: ${reason}` : ''}. Please contact support for more information.`,
      type: 'warning',
      priority: 'high',
      data: {
        supplierId: supplier.id,
        businessName: supplier.businessName,
        reason
      }
    });

    return true;
  }

  /**
   * Get all suppliers with optional filters
   */
  async getAllSuppliers(filters?: {
    status?: ('pending' | 'approved' | 'suspended' | 'rejected')[];
    businessType?: string;
    searchQuery?: string;
  }): Promise<Supplier[]> {
    let suppliers = await this.db.findAll('suppliers');

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        suppliers = suppliers.filter(supplier => filters.status!.includes(supplier.status));
      }

      if (filters.businessType) {
        suppliers = suppliers.filter(supplier => supplier.businessType === filters.businessType);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        suppliers = suppliers.filter(supplier => 
          supplier.businessName.toLowerCase().includes(query) ||
          supplier.description?.toLowerCase().includes(query) ||
          supplier.contactEmail.toLowerCase().includes(query)
        );
      }
    }

    return suppliers;
  }

  /**
   * Manage supplier inventory
   */
  async updateInventory(supplierId: string, inventoryUpdates: Array<{
    inventoryId: string;
    stockQuantity?: number;
    price?: number;
    isActive?: boolean;
  }>): Promise<boolean> {
    const supplier = await this.db.findById('suppliers', supplierId);
    if (!supplier) {
      throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    for (const update of inventoryUpdates) {
      const inventoryItem = await this.db.findById('supplier_inventory', update.inventoryId);
      
      if (!inventoryItem || inventoryItem.supplierId !== supplierId) {
        throw new Error(`Inventory item with ID ${update.inventoryId} not found or doesn't belong to supplier`);
      }

      const updateObj: any = { updatedAt: new Date() };
      if (update.stockQuantity !== undefined) updateObj.stockQuantity = update.stockQuantity;
      if (update.price !== undefined) updateObj.price = update.price;
      if (update.isActive !== undefined) updateObj.isActive = update.isActive;

      await this.db.update('supplier_inventory', update.inventoryId, updateObj);
    }

    // Check for low stock notifications
    await this.checkLowStockNotifications(supplierId);

    return true;
  }

  /**
   * Add new inventory item for supplier
   */
  async addInventoryItem(supplierId: string, inventoryItem: Omit<SupplierInventory, 'id' | 'supplierId' | 'createdAt' | 'updatedAt' | 'reservedQuantity'>): Promise<SupplierInventory> {
    const supplier = await this.db.findById('suppliers', supplierId);
    if (!supplier) {
      throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    const newInventory: SupplierInventory = {
      id: this.generateId(),
      supplierId,
      ...inventoryItem,
      reservedQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.create('supplier_inventory', newInventory);

    return newInventory;
  }

  /**
   * Get supplier inventory
   */
  async getSupplierInventory(supplierId: string, filters?: {
    category?: string;
    inStockOnly?: boolean;
    searchQuery?: string;
  }): Promise<SupplierInventory[]> {
    let inventoryItems = await this.db.findByField('supplier_inventory', 'supplierId', supplierId);

    if (filters) {
      if (filters.category) {
        inventoryItems = inventoryItems.filter(item => item.category === filters.category);
      }

      if (filters.inStockOnly) {
        inventoryItems = inventoryItems.filter(item => item.stockQuantity > 0);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        inventoryItems = inventoryItems.filter(item => 
          item.productName.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }
    }

    return inventoryItems;
  }

  /**
   * Process a new order from a buyer to a supplier
   */
  async processOrder(orderData: Omit<SupplierOrder, 'id' | 'status' | 'totalAmount' | 'totalCost' | 'commissionAmount' | 'netAmount' | 'createdAt' | 'updatedAt'>): Promise<SupplierOrder> {
    // Validate inventory availability
    for (const item of orderData.items) {
      const inventoryItem = await this.db.findById('supplier_inventory', item.inventoryId);
      
      if (!inventoryItem || inventoryItem.supplierId !== orderData.supplierId) {
        throw new Error(`Inventory item with ID ${item.inventoryId} not found or doesn't belong to supplier`);
      }

      if (inventoryItem.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for item: ${inventoryItem.productName}. Available: ${inventoryItem.stockQuantity}, Requested: ${item.quantity}`);
      }
    }

    // Calculate totals
    let totalAmount = 0;
    let totalCost = 0;

    for (const item of orderData.items) {
      totalAmount += item.unitPrice * item.quantity;
      const inventoryItem = await this.db.findById('supplier_inventory', item.inventoryId);
      if (inventoryItem && inventoryItem.costPrice) {
        totalCost += inventoryItem.costPrice * item.quantity;
      } else {
        totalCost += item.unitPrice * item.quantity; // Use selling price if cost not available
      }
    }

    // Get supplier to calculate commission
    const supplier = await this.db.findById('suppliers', orderData.supplierId);
    if (!supplier) {
      throw new Error(`Supplier with ID ${orderData.supplierId} not found`);
    }

    // Calculate commission
    const commissionRate = supplier.commissionRate;
    const commissionAmount = totalAmount * (commissionRate / 100);
    const netAmount = totalAmount - commissionAmount;

    const newOrder: SupplierOrder = {
      id: this.generateId(),
      ...orderData,
      status: 'pending',
      totalAmount,
      totalCost,
      commissionAmount,
      netAmount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save order
    await this.db.create('supplier_orders', newOrder);

    // Reserve inventory
    for (const item of orderData.items) {
      const inventoryItem = await this.db.findById('supplier_inventory', item.inventoryId);
      if (inventoryItem) {
        await this.db.update('supplier_inventory', item.inventoryId, {
          reservedQuantity: inventoryItem.reservedQuantity + item.quantity,
          updatedAt: new Date()
        });
      }
    }

    // Notify supplier about new order
    await this.notificationService.sendToUser(supplier.userId, {
      title: 'New Order Received',
      message: `You have received a new order from ${orderData.buyerId} with total amount $${totalAmount.toFixed(2)}. Order ID: ${newOrder.id}`,
      type: 'info',
      priority: 'high',
      data: {
        orderId: newOrder.id,
        supplierId: newOrder.supplierId,
        buyerId: newOrder.buyerId,
        totalAmount: newOrder.totalAmount
      }
    });

    return newOrder;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, newStatus: SupplierOrder['status'], adminId?: string): Promise<boolean> {
    const order = await this.db.findById('supplier_orders', orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const oldStatus = order.status;
    
    // Validate status transition
    if (!this.isValidStatusTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid status transition: ${oldStatus} -> ${newStatus}`);
    }

    // Handle inventory release if order is cancelled or returned
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      for (const item of order.items) {
        const inventoryItem = await this.db.findById('supplier_inventory', item.inventoryId);
        if (inventoryItem) {
          await this.db.update('supplier_inventory', item.inventoryId, {
            reservedQuantity: Math.max(0, inventoryItem.reservedQuantity - item.quantity),
            updatedAt: new Date()
          });
        }
      }
    }

    await this.db.update('supplier_orders', orderId, {
      status: newStatus,
      updatedAt: new Date()
    });

    // Notify relevant parties about status change
    const supplier = await this.db.findById('suppliers', order.supplierId);
    if (supplier) {
      await this.notificationService.sendToUser(supplier.userId, {
        title: 'Order Status Updated',
        message: `Order ${order.id} status changed from ${oldStatus} to ${newStatus}`,
        type: 'info',
        priority: newStatus === 'delivered' ? 'low' : 'medium',
        data: {
          orderId: order.id,
          oldStatus,
          newStatus
        }
      });
    }

    // If order is delivered, trigger payout processing
    if (newStatus === 'delivered') {
      await this.processPayout(orderId);
    }

    return true;
  }

  /**
   * Validate if a status transition is valid
   */
  private isValidStatusTransition(from: SupplierOrder['status'], to: SupplierOrder['status']): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'processing', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': []
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Process payout for a delivered order
   */
  async processPayout(orderId: string): Promise<boolean> {
    const order = await this.db.findById('supplier_orders', orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status !== 'delivered') {
      throw new Error(`Order ${orderId} must be delivered to process payout`);
    }

    const supplier = await this.db.findById('suppliers', order.supplierId);
    if (!supplier) {
      throw new Error(`Supplier for order ${orderId} not found`);
    }

    const payout: SupplierPayout = {
      id: this.generateId(),
      supplierId: order.supplierId,
      orderId,
      amount: order.netAmount,
      commissionAmount: order.commissionAmount,
      payoutMethod: supplier.payoutMethod,
      status: 'pending',
      referenceId: `NL_${orderId}_${Date.now()}`, // Generate reference ID
      notes: `Payout for order ${orderId}`
    };

    await this.db.create('supplier_payouts', payout);

    // Update supplier stats
    await this.db.update('suppliers', order.supplierId, {
      totalSales: supplier.totalSales + order.totalAmount,
      totalOrders: supplier.totalOrders + 1,
      updatedAt: new Date()
    });

    // Notify supplier about pending payout
    await this.notificationService.sendToUser(supplier.userId, {
      title: 'Payout Pending',
      message: `A payout of $${order.netAmount.toFixed(2)} is pending for order ${orderId}`,
      type: 'info',
      priority: 'medium',
      data: {
        payoutId: payout.id,
        orderId: order.id,
        amount: payout.amount
      }
    });

    return true;
  }

  /**
   * Process all pending payouts for a supplier
   */
  async processPayouts(supplierId: string): Promise<boolean> {
    const pendingPayouts = await this.db.findByField('supplier_payouts', 'supplierId', supplierId);
    const pendingPayoutsList = pendingPayouts.filter(p => p.status === 'pending');

    for (const payout of pendingPayoutsList) {
      // In a real system, this would integrate with payment processors
      // For now, we'll mark as processed
      await this.db.update('supplier_payouts', payout.id, {
        status: 'processed',
        processedAt: new Date(),
        updatedAt: new Date()
      });
    }

    return true;
  }

  /**
   * Check for low stock notifications
   */
  private async checkLowStockNotifications(supplierId: string): Promise<void> {
    const inventoryItems = await this.getSupplierInventory(supplierId);
    
    for (const item of inventoryItems) {
      if (item.stockQuantity <= item.minStockThreshold && item.isActive) {
        const supplier = await this.db.findById('suppliers', supplierId);
        
        if (supplier) {
          await this.notificationService.sendToUser(supplier.userId, {
            title: 'Low Stock Alert',
            message: `Item "${item.productName}" is low on stock. Current: ${item.stockQuantity}, Threshold: ${item.minStockThreshold}`,
            type: 'warning',
            priority: 'high',
            data: {
              inventoryId: item.id,
              productName: item.productName,
              currentStock: item.stockQuantity,
              threshold: item.minStockThreshold
            }
          });
        }
      }
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
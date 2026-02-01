/**
 * Order Synchronization Service
 * Manages real-time order synchronization between POS, Customer, and Driver apps
 * Uses blockchain events and polling for synchronization
 */

import { useEffect, useState, useCallback } from 'react';
import { useContractInteractions } from '../hooks/useContractInteractions';
import { ethers } from 'ethers';
import web3Service from './Web3Service';
import { graphService } from './GraphService';

export interface OrderStatusUpdate {
  orderId: string;
  status: 'created' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  timestamp: number;
  location?: { lat: number; lng: number }; // For delivery tracking
  driverId?: string;
  estimatedDeliveryTime?: number;
}

export interface SyncedOrder {
  id: string;
  restaurantId: string;
  items: any[];
  totalAmount: string;
  deliveryAddress?: string;
  status: OrderStatusUpdate['status'];
  createdAt: number;
  updatedAt: number;
  assignedDriver?: string;
  currentLocation?: { lat: number; lng: number };
  estimatedDeliveryTime?: number;
}

export interface OrderSyncConfig {
  pollingInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class OrderSyncService {
  private static instance: OrderSyncService;
  private contractInteractions: any;
  private pollingInterval: number = 5000; // 5 seconds
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map();
  private orderCallbacks: Map<string, ((update: OrderStatusUpdate) => void)[]> = new Map();
  private userCallbacks: Map<string, ((orders: SyncedOrder[]) => void)[]> = new Map();
  private newOrderCallbacks: ((order: SyncedOrder) => void)[] = [];
  private isInitialized: boolean = false;

  private constructor(config?: OrderSyncConfig) {
    if (config) {
      this.pollingInterval = config.pollingInterval ?? this.pollingInterval;
      this.maxRetries = config.maxRetries ?? this.maxRetries;
      this.retryDelay = config.retryDelay ?? this.retryDelay;
    }
  }

  public static getInstance(config?: OrderSyncConfig): OrderSyncService {
    if (!OrderSyncService.instance) {
      OrderSyncService.instance = new OrderSyncService(config);
    }
    return OrderSyncService.instance;
  }

  public async initialize(contractInteractions: any): Promise<void> {
    this.contractInteractions = contractInteractions;
    this.isInitialized = true;
  }

  public subscribeToOrderUpdates(orderId: string, callback: (update: OrderStatusUpdate) => void): void {
    if (!this.orderCallbacks.has(orderId)) {
      this.orderCallbacks.set(orderId, []);
    }
    this.orderCallbacks.get(orderId)?.push(callback);

    // Start polling for this order if not already started
    if (!this.pollingTimers.has(orderId)) {
      this.startPollingOrder(orderId);
    }
  }

  public unsubscribeFromOrderUpdates(orderId: string, callback?: (update: OrderStatusUpdate) => void): void {
    if (this.orderCallbacks.has(orderId)) {
      if (callback) {
        const callbacks = this.orderCallbacks.get(orderId)!;
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.orderCallbacks.delete(orderId);
      }
    }

    // Stop polling if no more callbacks for this order
    if (!this.orderCallbacks.has(orderId) || this.orderCallbacks.get(orderId)?.length === 0) {
      this.stopPollingOrder(orderId);
    }
  }

  public subscribeToUserOrders(userId: string, callback: (orders: SyncedOrder[]) => void): void {
    if (!this.userCallbacks.has(userId)) {
      this.userCallbacks.set(userId, []);
    }
    this.userCallbacks.get(userId)?.push(callback);

    // Start polling for user's orders if not already started
    if (!this.pollingTimers.has(`user_${userId}`)) {
      this.startPollingUserOrders(userId);
    }
  }

  public unsubscribeFromUserOrders(userId: string, callback?: (orders: SyncedOrder[]) => void): void {
    if (this.userCallbacks.has(userId)) {
      if (callback) {
        const callbacks = this.userCallbacks.get(userId)!;
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.userCallbacks.delete(userId);
      }
    }

    // Stop polling if no more callbacks for this user
    if (!this.userCallbacks.has(userId) || this.userCallbacks.get(userId)?.length === 0) {
      this.stopPollingUserOrders(userId);
    }
  }

  public subscribeToNewOrders(callback: (order: SyncedOrder) => void): void {
    this.newOrderCallbacks.push(callback);
  }

  public unsubscribeFromNewOrders(callback: (order: SyncedOrder) => void): void {
    const index = this.newOrderCallbacks.indexOf(callback);
    if (index !== -1) {
      this.newOrderCallbacks.splice(index, 1);
    }
  }

  private async pollOrder(orderId: string): Promise<void> {
    if (!this.contractInteractions) {
      console.error('Contract interactions not initialized');
      return;
    }

    try {
      // In a real implementation, this would fetch order status from the blockchain
      // For now, we'll simulate by checking if the order exists and its status
      const orderDetails = await this.fetchOrderDetails(orderId);

      if (orderDetails) {
        const update: OrderStatusUpdate = {
          orderId: orderDetails.id,
          status: orderDetails.status,
          timestamp: Date.now(),
          location: orderDetails.currentLocation,
          driverId: orderDetails.assignedDriver,
          estimatedDeliveryTime: orderDetails.estimatedDeliveryTime
        };

        // Notify all subscribers
        const callbacks = this.orderCallbacks.get(orderId);
        if (callbacks) {
          callbacks.forEach(cb => {
            try {
              cb(update);
            } catch (error) {
              console.error('Error in order update callback:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error polling order ${orderId}:`, error);
    }
  }

  private async pollUserOrders(userId: string): Promise<void> {
    if (!this.contractInteractions) {
      console.error('Contract interactions not initialized');
      return;
    }

    try {
      // Fetch user's orders from the blockchain
      const userOrders = await this.fetchUserOrders(userId);

      // Notify all subscribers
      const callbacks = this.userCallbacks.get(userId);
      if (callbacks) {
        callbacks.forEach(cb => {
          try {
            cb(userOrders);
          } catch (error) {
            console.error('Error in user orders callback:', error);
          }
        });
      }
    } catch (error) {
      console.error(`Error polling user orders for ${userId}:`, error);
    }
  }

  private startPollingOrder(orderId: string): void {
    if (this.pollingTimers.has(orderId)) {
      this.stopPollingOrder(orderId);
    }

    const timer = setInterval(() => {
      this.pollOrder(orderId);
    }, this.pollingInterval);

    this.pollingTimers.set(orderId, timer);
  }

  private startPollingUserOrders(userId: string): void {
    const key = `user_${userId}`;
    if (this.pollingTimers.has(key)) {
      this.stopPollingUserOrders(userId);
    }

    const timer = setInterval(() => {
      this.pollUserOrders(userId);
    }, this.pollingInterval);

    this.pollingTimers.set(key, timer);
  }

  private stopPollingOrder(orderId: string): void {
    const timer = this.pollingTimers.get(orderId);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(orderId);
    }
  }

  private stopPollingUserOrders(userId: string): void {
    const key = `user_${userId}`;
    const timer = this.pollingTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(key);
    }
  }

  private async fetchOrderDetails(orderId: string): Promise<SyncedOrder | null> {
    try {
      // 1. Check The Graph first for historical/static data
      const graphData = await graphService.getOrders({ orderId } as any);
      const graphOrder = graphData && (graphData as any).orders && (graphData as any).orders[0];

      // 2. Fallback/Override with direct blockchain status (source of truth for state)
      // This part assumes we have a way to get status from contract interactions
      // If contractInteractions isn't available, we use web3Service

      return {
        id: orderId,
        restaurantId: graphOrder?.restaurant?.id || '0x0000000000000000000000000000000000000000',
        items: graphOrder?.items || [],
        totalAmount: graphOrder?.totalAmount || '0',
        status: (graphOrder?.status as any) || 'created',
        createdAt: graphOrder?.createdAt ? parseInt(graphOrder.createdAt) * 1000 : Date.now(),
        updatedAt: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching order details for ${orderId}:`, error);
      return null;
    }
  }

  /**
   * Get all orders from the blockchain via GraphService
   * This is used by the POS /orders page
   */
  public async getAllOrders(filters?: {
    restaurantId?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<SyncedOrder[]> {
    try {
      // Fetch orders from The Graph
      const graphData = await graphService.getOrders(filters as any);

      if (!graphData || !(graphData as any).orders) {
        console.warn('No orders found in graph');
        return [];
      }

      const orders = (graphData as any).orders;

      // Transform graph data to SyncedOrder format
      return orders.map((order: any) => ({
        id: order.id,
        restaurantId: order.restaurant?.id || '0x0000000000000000000000000000000000000000',
        items: order.items || [],
        totalAmount: order.totalAmount || '0',
        deliveryAddress: order.deliveryAddress,
        status: order.status || 'created',
        createdAt: order.createdAt ? parseInt(order.createdAt) * 1000 : Date.now(),
        updatedAt: order.updatedAt ? parseInt(order.updatedAt) * 1000 : Date.now(),
        assignedDriver: order.driver?.id,
        currentLocation: order.currentLocation,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  /**
   * Get a single order by ID
   */
  public async getOrderById(orderId: string): Promise<SyncedOrder | null> {
    return this.fetchOrderDetails(orderId);
  }

  /**
   * Create a new order
   */
  public async createOrder(orderData: {
    restaurantId: string;
    items: any[];
    totalAmount: string;
    deliveryAddress?: string;
    customerName?: string;
    customerPhone?: string;
  }): Promise<SyncedOrder | null> {
    try {
      if (!this.contractInteractions) {
        console.error('Contract interactions not initialized');
        return null;
      }

      // Create order on blockchain
      // Note: This assumes contractInteractions has a createOrder method
      // You may need to adjust based on your actual contract interface
      const tx = await this.contractInteractions.createOrder?.(orderData);

      if (!tx) {
        throw new Error('Failed to create order transaction');
      }

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Extract order ID from event (adjust based on your contract's event structure)
      const orderId = receipt?.events?.[0]?.args?.orderId || `order-${Date.now()}`;

      const newOrder: SyncedOrder = {
        id: orderId,
        restaurantId: orderData.restaurantId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        status: 'created',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Publish to subscribers
      await this.publishNewOrder(newOrder);

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatusUpdate['status']
  ): Promise<boolean> {
    try {
      if (!this.contractInteractions) {
        console.error('Contract interactions not initialized');
        return false;
      }

      // Update status on blockchain
      const update: OrderStatusUpdate = {
        orderId,
        status: newStatus,
        timestamp: Date.now(),
      };

      // Anchor update on-chain
      await this.publishOrderUpdate(update);

      // Notify subscribers
      const callbacks = this.orderCallbacks.get(orderId);
      if (callbacks) {
        callbacks.forEach(cb => {
          try {
            cb(update);
          } catch (error) {
            console.error('Error in order update callback:', error);
          }
        });
      }

      return true;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      return false;
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      // Update status to cancelled
      const success = await this.updateOrderStatus(orderId, 'cancelled');

      if (success && reason) {
        // Optionally log cancellation reason
        console.log(`Order ${orderId} cancelled: ${reason}`);
      }

      return success;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      return false;
    }
  }

  private async fetchUserOrders(userId: string): Promise<SyncedOrder[]> {
    // In a real implementation, this would fetch user's orders from the blockchain
    try {
      // This would call the actual smart contract to get user's orders
      // const contractResult = await this.contractInteractions.getUserOrders(userId);

      // For now, return an empty array
      return [];
    } catch (error) {
      console.error(`Error fetching user orders for ${userId}:`, error);
      return [];
    }
  }

  public async publishOrderUpdate(update: OrderStatusUpdate): Promise<void> {
    console.log('OrderSyncService: Publishing status anchor to blockchain...', update);

    try {
      // Anchor the status update on-chain as a decentralized audit log
      const cid = `order-status-${update.orderId}-${update.status}-${Date.now()}`;
      await web3Service.anchorEventBatch(update.orderId, cid);
    } catch (error) {
      console.error('Failed to anchor order update on-chain:', error);
    }
  }

  public async publishNewOrder(order: SyncedOrder): Promise<void> {
    // In a real implementation, this would create a new order on the blockchain
    // For now, we'll just log it and notify subscribers
    console.log('Publishing new order:', order);

    // Notify all new order subscribers
    this.newOrderCallbacks.forEach(callback => {
      try {
        callback(order);
      } catch (error) {
        console.error('Error in new order callback:', error);
      }
    });
  }

  public destroy(): void {
    // Clear all polling timers
    this.pollingTimers.forEach(timer => clearInterval(timer));
    this.pollingTimers.clear();

    // Clear all callbacks
    this.orderCallbacks.clear();
    this.userCallbacks.clear();
    this.newOrderCallbacks = [];
  }
}

// React hook for using order synchronization
export function useOrderSync(contractInteractions: any) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const orderSyncService = OrderSyncService.getInstance();

  useEffect(() => {
    let isSubscribed = true;

    const initialize = async () => {
      try {
        await orderSyncService.initialize(contractInteractions);
        if (isSubscribed) {
          setIsInitialized(true);
          setInitError(null);
        }
      } catch (error) {
        if (isSubscribed) {
          setIsInitialized(false);
          setInitError(error instanceof Error ? error.message : 'Initialization failed');
        }
      }
    };

    if (contractInteractions && !isInitialized) {
      initialize();
    }

    return () => {
      isSubscribed = false;
    };
  }, [contractInteractions, isInitialized]);

  return {
    isInitialized,
    initError,
    orderSyncService,
    isReady: isInitialized
  };
}

// React hook for subscribing to order updates
export function useOrderUpdates(orderId: string, callback: (update: OrderStatusUpdate) => void) {
  const [orderSyncService] = useState(OrderSyncService.getInstance());

  useEffect(() => {
    if (orderId && callback) {
      orderSyncService.subscribeToOrderUpdates(orderId, callback);

      return () => {
        orderSyncService.unsubscribeFromOrderUpdates(orderId, callback);
      };
    }
  }, [orderId, callback]);

  return orderSyncService;
}

// React hook for subscribing to new orders
export function useNewOrders(callback: (order: SyncedOrder) => void) {
  const [orderSyncService] = useState(OrderSyncService.getInstance());

  useEffect(() => {
    if (callback) {
      orderSyncService.subscribeToNewOrders(callback);

      return () => {
        orderSyncService.unsubscribeFromNewOrders(callback);
      };
    }
  }, [callback]);

  return orderSyncService;
}

// React hook for user's orders
export function useUserOrders(userId: string, callback: (orders: SyncedOrder[]) => void) {
  const [orderSyncService] = useState(OrderSyncService.getInstance());

  useEffect(() => {
    if (userId && callback) {
      orderSyncService.subscribeToUserOrders(userId, callback);

      return () => {
        orderSyncService.unsubscribeFromUserOrders(userId, callback);
      };
    }
  }, [userId, callback]);

  return orderSyncService;
}

// Utility function to convert blockchain order status to our status
export function mapBlockchainStatus(blockchainStatus: string): OrderStatusUpdate['status'] {
  switch (blockchainStatus.toLowerCase()) {
    case 'created':
    case 'pending':
      return 'created';
    case 'confirmed':
    case 'accepted':
      return 'confirmed';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'picked_up':
    case 'in_transit':
      return 'picked_up';
    case 'on_the_way':
    case 'out_for_delivery':
      return 'on_the_way';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
    case 'rejected':
      return 'cancelled';
    default:
      return 'created';
  }
}
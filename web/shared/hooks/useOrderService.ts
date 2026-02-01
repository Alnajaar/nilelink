/**
 * useOrderService Hook
 * Smart contract integration for order management
 * 
 * Provides methods to:
 * - Fetch orders from OrderSettlement contract
 * - Create new orders
 * - Update order status
 * - Get order history
 */

import { useState, useCallback, useEffect } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { useAuth } from '../providers/FirebaseAuthProvider';

// ABI imports
import OrderSettlementABI from '../abis/OrderSettlement.json';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  phoneNumber: string;
  specialInstructions?: string;
  driverId?: string;
  estimatedDelivery?: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  paymentMethod: 'blockchain' | 'card' | 'cash';
  paymentStatus: 'pending' | 'confirmed' | 'failed' | 'refunded';
  txHash?: string; // blockchain transaction hash
}

export interface OrderService {
  loading: boolean;
  error: Error | null;
  orders: Order[];
  createOrder: (
    items: OrderItem[],
    restaurantId: string,
    deliveryAddress: string,
    phoneNumber: string,
    total: number,
    specialInstructions?: string
  ) => Promise<string>; // Returns order ID
  getOrders: (restaurantId?: string) => Promise<Order[]>;
  getOrder: (orderId: string) => Promise<Order | null>;
  getCustomerOrders: (customerId: string) => Promise<Order[]>;
  getRestaurantOrders: (restaurantId: string) => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const ORDER_SETTLEMENT_ADDRESS = process.env.NEXT_PUBLIC_ORDER_SETTLEMENT_ADDRESS || '';

export function useOrderService(): OrderService {
  const { user } = useAuth();
  const address = user?.walletAddress || user?.uid;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize contract instance
  const getOrderContract = useCallback(async (): Promise<Contract | null> => {
    try {
      if (!window.ethereum || !ORDER_SETTLEMENT_ADDRESS) {
        console.warn('Ethereum provider or contract address not available');
        return null;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(ORDER_SETTLEMENT_ADDRESS, OrderSettlementABI, signer);
      return contract;
    } catch (err) {
      console.error('Error initializing order contract:', err);
      return null;
    }
  }, []);

  /**
   * Create a new order on blockchain
   */
  const createOrder = useCallback(
    async (
      items: OrderItem[],
      restaurantId: string,
      deliveryAddress: string,
      phoneNumber: string,
      total: number,
      specialInstructions?: string
    ): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const contract = await getOrderContract();
        if (!contract) {
          throw new Error('Order contract not available');
        }

        // Prepare order data
        const itemsData = items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price.toString(),
          total: item.total.toString(),
        }));

        // Call smart contract
        const tx = await contract.createOrder({
          customerId: address,
          restaurantId,
          items: itemsData,
          totalAmount: total.toString(),
          deliveryAddress,
          phoneNumber,
          notes: specialInstructions || '',
          paymentMethod: 'blockchain',
        });

        // Wait for confirmation
        const receipt = await tx.wait();
        
        if (!receipt || !receipt.transactionHash) {
          throw new Error('Transaction failed');
        }

        // Extract order ID from event or use tx hash
        const orderId = receipt.transactionHash.slice(-16).toUpperCase();

        // Create local order object
        const newOrder: Order = {
          id: orderId,
          customerId: address || '',
          restaurantId,
          items,
          subtotal: items.reduce((sum, item) => sum + item.total, 0),
          tax: items.reduce((sum, item) => sum + item.total, 0) * 0.05,
          deliveryFee: 2.0,
          total,
          status: 'pending',
          deliveryAddress,
          phoneNumber,
          specialInstructions,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          paymentMethod: 'blockchain',
          paymentStatus: 'pending',
          txHash: receipt.transactionHash,
        };

        // Add to local state
        setOrders((prev) => [newOrder, ...prev]);

        return orderId;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create order');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [address, getOrderContract]
  );

  /**
   * Get all orders (mock implementation, will fetch from contract)
   */
  const getOrders = useCallback(
    async (restaurantId?: string): Promise<Order[]> => {
      setLoading(true);
      setError(null);

      try {
        // Mock implementation - returns cached orders for now
        // In production, this would fetch from smart contract events
        
        const mockOrders: Order[] = [
          {
            id: 'ORD001',
            customerId: address || 'customer1',
            restaurantId: restaurantId || 'rest1',
            items: [
              {
                id: '1',
                name: 'Biryani (Chicken)',
                quantity: 2,
                price: 12.99,
                total: 25.98,
              },
              {
                id: '2',
                name: 'Garlic Naan',
                quantity: 1,
                price: 2.99,
                total: 2.99,
              },
            ],
            subtotal: 28.97,
            tax: 1.45,
            deliveryFee: 2.0,
            total: 32.42,
            status: 'pending',
            deliveryAddress: '123 Main St, Dubai',
            phoneNumber: '+971501234567',
            createdAt: Date.now() - 3600000,
            updatedAt: Date.now() - 3600000,
            paymentMethod: 'blockchain',
            paymentStatus: 'pending',
          },
          {
            id: 'ORD002',
            customerId: address || 'customer1',
            restaurantId: restaurantId || 'rest1',
            items: [
              {
                id: '3',
                name: 'Shawarma (Beef)',
                quantity: 1,
                price: 8.99,
                total: 8.99,
              },
            ],
            subtotal: 8.99,
            tax: 0.45,
            deliveryFee: 2.0,
            total: 11.44,
            status: 'confirmed',
            deliveryAddress: '123 Main St, Dubai',
            phoneNumber: '+971501234567',
            createdAt: Date.now() - 7200000,
            updatedAt: Date.now() - 7200000,
            paymentMethod: 'blockchain',
            paymentStatus: 'confirmed',
            driverId: 'driver1',
          },
        ];

        setOrders(mockOrders);
        return mockOrders;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch orders');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [address]
  );

  /**
   * Get single order by ID
   */
  const getOrder = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        const allOrders = await getOrders();
        return allOrders.find((order) => order.id === orderId) || null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch order');
        setError(error);
        return null;
      }
    },
    [getOrders]
  );

  /**
   * Get all orders for a specific customer
   */
  const getCustomerOrders = useCallback(
    async (customerId: string): Promise<Order[]> => {
      try {
        const allOrders = await getOrders();
        return allOrders.filter((order) => order.customerId === customerId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch customer orders');
        setError(error);
        return [];
      }
    },
    [getOrders]
  );

  /**
   * Get all orders for a specific restaurant
   */
  const getRestaurantOrders = useCallback(
    async (restaurantId: string): Promise<Order[]> => {
      try {
        const allOrders = await getOrders(restaurantId);
        return allOrders.filter((order) => order.restaurantId === restaurantId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch restaurant orders');
        setError(error);
        return [];
      }
    },
    [getOrders]
  );

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order['status']): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const contract = await getOrderContract();
        if (!contract) {
          throw new Error('Order contract not available');
        }

        // Map status to contract value
        const statusMap: { [key: string]: number } = {
          pending: 0,
          confirmed: 1,
          preparing: 2,
          ready: 3,
          out_for_delivery: 4,
          delivered: 5,
          cancelled: 6,
        };

        const statusValue = statusMap[status] || 0;

        // Call smart contract
        const tx = await contract.updateOrderStatus(orderId, statusValue);
        await tx.wait();

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: Date.now() }
              : order
          )
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update order status');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getOrderContract]
  );

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(
    async (orderId: string): Promise<void> => {
      await updateOrderStatus(orderId, 'cancelled');
    },
    [updateOrderStatus]
  );

  // Load initial orders on mount
  useEffect(() => {
    if (address) {
      getOrders().catch((err) => console.error('Failed to load initial orders:', err));
    }
  }, [address, getOrders]);

  return {
    loading,
    error,
    orders,
    createOrder,
    getOrders,
    getOrder,
    getCustomerOrders,
    getRestaurantOrders,
    updateOrderStatus,
    cancelOrder,
  };
}

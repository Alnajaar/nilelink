/**
 * Orders API Service
 * Handles all order-related API calls
 */

import apiService, { ApiResponse } from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OrderItem {
  id: string;
  name: string; // Used as productName fallback
  productName?: string; // Explicitly added
  quantity: number;
  price: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  cashierName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount?: number; // Alias for total
  discount?: number;
  deliveryAddress?: string;
  specialInstructions?: string;
  paymentMethod: 'CASH' | 'CARD' | 'CRYPTO' | 'WALLET' | 'BANK_TRANSFER';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddress?: string;
  specialInstructions?: string;
  paymentMethod: string;
}

export interface OrderFiltersRequest {
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// ORDERS API SERVICE
// ============================================================================

class OrdersService {
  private baseEndpoint = '/orders';

  /**
   * Get all orders for the current user
   */
  async getOrders(filters?: OrderFiltersRequest): Promise<ApiResponse<Order[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return apiService.get<Order[]>(url);
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return apiService.get<Order>(`${this.baseEndpoint}/${orderId}`);
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(this.baseEndpoint, orderData);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    return apiService.patch<Order>(`${this.baseEndpoint}/${orderId}/cancel`, { reason });
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.baseEndpoint}/${orderId}/tracking`);
  }

  /**
   * Reorder - create new order from previous order
   */
  async reorderFromPrevious(orderId: string): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(`${this.baseEndpoint}/${orderId}/reorder`, {});
  }

  /**
   * Request receipt/invoice
   */
  async getReceipt(orderId: string): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.baseEndpoint}/${orderId}/receipt`);
  }

  /**
   * Get order history with pagination
   */
  async getOrderHistory(page: number = 1, pageSize: number = 10): Promise<ApiResponse<{
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return apiService.get(`${this.baseEndpoint}/history`, {
      params: { page, pageSize },
    });
  }
}

// Create singleton instance
export const ordersService = new OrdersService();

export default ordersService;

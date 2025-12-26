// Shared type definitions for NileLink ecosystem

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'RESTAURANT_STAFF' | 'RESTAURANT_OWNER' | 'DELIVERY_DRIVER' | 'INVESTOR' | 'ADMIN';
}

export interface Restaurant {
    id: string;
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    isActive: boolean;
}

export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    preparationTime?: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId?: string;
    restaurantId: string;
    status: OrderStatus;
    totalAmount: number;
    taxAmount: number;
    tipAmount: number;
    deliveryFee: number;
    paymentMethod?: PaymentMethod;
    deliveryAddress?: string;
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialInstructions?: string;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    IN_DELIVERY = 'IN_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    CRYPTO = 'CRYPTO',
    WALLET = 'WALLET',
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Socket event types
export interface SocketEventMap {
    'order:new': Order;
    'order:updated': Order;
    'driver:assigned': { orderId: string; driverId: string };
    'driver:location': { orderId: string; location: { lat: number; lng: number } };
    'payment:received': { amount: number; orderId: string };
    'ledger:update': { id: string; amount: number; type: string };
}

/**
 * OrderList.tsx
 * Reusable order list component for POS and Customer dashboards
 */

'use client';

import React from 'react';

export interface OrderItemType {
  id: string | number;
  orderNumber?: string;
  customer?: string;
  restaurant?: string;
  amount: number | string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  timestamp: number | string;
  items?: number;
  driver?: string;
}

interface OrderListProps {
  orders: OrderItemType[];
  onOrderClick?: (order: OrderItemType) => void;
  onStatusChange?: (orderId: string | number, newStatus: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderList({
  orders,
  onOrderClick,
  onStatusChange,
  isLoading,
}: OrderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 h-20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  const formatTime = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onOrderClick?.(order)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                  Order #{order.orderNumber || order.id}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[order.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {order.customer || order.restaurant}
                {order.items && ` • ${order.items} item${order.items !== 1 ? 's' : ''}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">{formatTime(order.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${order.amount}</p>
              {order.driver && (
                <p className="text-xs text-gray-600 mt-1">Driver: {order.driver}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderList;

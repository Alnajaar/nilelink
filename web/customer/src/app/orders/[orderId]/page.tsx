/**
 * Order Tracking Page
 * Real-time order status, delivery tracking, and ETA
 */

'use client';

// Enable dynamic parameters to handle unknown order IDs
export const dynamicParams = true;

// Force dynamic rendering to handle unknown order IDs during static export
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/AuthContext';
import { useOrderService } from '@shared/hooks/useOrderService';
import {
  Map,
  Navigation,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  User,
  Truck,
  Home,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DeliveryMilestone {
  status: string;
  timestamp: number | null;
  icon: React.ReactNode;
  completed: boolean;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAuth();
  const { getOrder, updateOrderStatus, loading, error } = useOrderService();

  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to load order:', err);
      }
    };

    if (orderId) {
      loadOrder();
      // Poll for updates every 10 seconds
      const interval = setInterval(loadOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId, getOrder]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  const milestones: DeliveryMilestone[] = [
    {
      status: 'Order Placed',
      timestamp: order.createdAt,
      icon: <CheckCircle className="w-6 h-6" />,
      completed: true,
    },
    {
      status: 'Confirmed by Restaurant',
      timestamp:
        order.status === 'confirmed' || ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status)
          ? order.createdAt + 300000
          : null,
      icon: <Home className="w-6 h-6" />,
      completed:
        order.status === 'confirmed' || ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status),
    },
    {
      status: 'Being Prepared',
      timestamp:
        order.status === 'preparing' || ['ready', 'out_for_delivery', 'delivered'].includes(order.status)
          ? order.createdAt + 600000
          : null,
      icon: <AlertCircle className="w-6 h-6" />,
      completed: ['ready', 'out_for_delivery', 'delivered'].includes(order.status),
    },
    {
      status: 'Ready for Pickup',
      timestamp:
        order.status === 'ready' || ['out_for_delivery', 'delivered'].includes(order.status)
          ? order.createdAt + 900000
          : null,
      icon: <Truck className="w-6 h-6" />,
      completed: ['out_for_delivery', 'delivered'].includes(order.status),
    },
    {
      status: 'Out for Delivery',
      timestamp:
        order.status === 'out_for_delivery' || order.status === 'delivered' ? order.createdAt + 1200000 : null,
      icon: <Navigation className="w-6 h-6" />,
      completed: order.status === 'delivered',
    },
    {
      status: 'Delivered',
      timestamp: order.status === 'delivered' ? order.updatedAt : null,
      icon: <CheckCircle className="w-6 h-6" />,
      completed: order.status === 'delivered',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      preparing: 'text-orange-600',
      ready: 'text-green-600',
      out_for_delivery: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
          >
            ← Back
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600 text-sm">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className={`text-right`}>
                <p className={`text-2xl font-bold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </p>
                <p className="text-gray-600 text-sm">
                  {order.paymentStatus === 'confirmed' ? '✓ Paid' : 'Awaiting Payment'}
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-gray-600 text-xs font-medium uppercase">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium uppercase">Items</p>
                <p className="text-xl font-bold text-gray-900">{order.items.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium uppercase">Delivery Fee</p>
                <p className="text-xl font-bold text-gray-900">${order.deliveryFee.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs font-medium uppercase">ETA</p>
                <p className="text-xl font-bold text-gray-900">
                  {order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Delivery Progress</h2>

          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {milestone.icon}
                  </motion.div>
                  {idx < milestones.length - 1 && (
                    <div
                      className={`w-1 h-12 my-2 ${
                        milestone.completed ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{milestone.status}</h3>
                  {milestone.timestamp ? (
                    <p className="text-gray-600 text-sm">
                      {new Date(milestone.timestamp).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">Waiting...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Driver Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="pt-3 border-t-2 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                    <p className="text-gray-600 text-sm">Delivery location</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.phoneNumber}</p>
                    <p className="text-gray-600 text-sm">Contact number</p>
                  </div>
                </div>
                {order.specialInstructions && (
                  <div className="flex gap-3 pt-3 border-t">
                    <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-sm">{order.specialInstructions}</p>
                      <p className="text-gray-500 text-xs">Special instructions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Info */}
            {order.driverId && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Driver Information</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Driver {order.driverId}</p>
                    <p className="text-gray-600 text-sm">Assigned to your delivery</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Contact Driver
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Map (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-96 bg-gray-100 flex items-center justify-center relative">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Live delivery map coming soon</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow-md p-6 flex gap-4">
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel this order?')) {
                  // Cancel order logic here
                  alert('Order cancellation requested');
                }
              }}
              className="flex-1 py-3 px-4 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

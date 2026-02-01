'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Clock, DollarSign, CheckCircle, XCircle,
  AlertTriangle, Truck, Edit, Search, Filter,
  MapPin, User, ChevronRight, Bell, TrendingUp,
  Fingerprint, Globe, RefreshCw, ShieldCheck
} from 'lucide-react';

import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { useNotifications } from '@shared/contexts/NotificationContext';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';
import { useApiQuery } from '@shared/hooks/useApi';
import ordersService from '@shared/services/ordersService';
import { ApiErrorDisplay, LoadingSkeleton, EmptyState } from '@shared/components/ApiErrorDisplay';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface PurchaseOrder {
  id: string;
  restaurant: string;
  restaurantId: string;
  items: Array<{ sku: string; name: string; quantity: number; unit: string; price: number; }>;
  total: number;
  status: OrderStatus;
  paymentType: 'cash' | 'credit';
  deliveryDeadline: string;
  createdAt: string;
}

export default function AdvancedOrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addNotification: notify } = useNotifications();

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: apiOrders = [], loading, error, refetch } = useApiQuery(
    () => ordersService.getOrders()
  );

  const mappedOrders: PurchaseOrder[] = (apiOrders || []).map((order: any) => ({
    id: order.id,
    restaurant: order.customerName || 'Customer',
    restaurantId: order.customerId || order.id,
    items: (order.items || []).map((item: any) => ({
      sku: item.sku || item.productId,
      name: item.productName || item.name,
      quantity: item.quantity,
      unit: item.unit || 'unit',
      price: item.price || 0
    })),
    total: order.totalAmount || 0,
    status: (order.status || 'pending') as OrderStatus,
    paymentType: (order.paymentType || 'credit') as 'cash' | 'credit',
    deliveryDeadline: order.deliveryDeadline || new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    createdAt: order.createdAt || new Date().toISOString()
  }));

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    if (mappedOrders.length > 0) {
      setOrders(mappedOrders);
    }
  }, [apiOrders]);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev => prev.map((o: PurchaseOrder) =>
      o.id === orderId ? { ...o, status: 'confirmed' as OrderStatus } : o
    ));
    notify({ type: 'success', title: 'Order Confirmed', message: `${orderId} has been accepted` });
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.map((o: PurchaseOrder) =>
      o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
    ));
    notify({ type: 'info', title: 'Order Rejected', message: `${orderId} has been cancelled` });
  };

  const handleMarkShipped = (orderId: string) => {
    setOrders(prev => prev.map((o: PurchaseOrder) =>
      o.id === orderId ? { ...o, status: 'shipped' as OrderStatus } : o
    ));
    notify({ type: 'success', title: 'Order Shipped', message: `${orderId} is en route` });
  };

  const handleMarkDelivered = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'delivered' as OrderStatus } : o
    ));
    notify({ type: 'success', title: 'Order Delivered', message: `${orderId} successfully delivered` });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status];
  };

  const SynchronizationHUD = ({ order }: { order: PurchaseOrder }) => {
    if (order.status === 'pending' || order.status === 'cancelled') return null;

    return (
      <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-900">Global Ledger Sync</span>
          </div>
          <Badge variant="info" className="bg-blue-600 text-white border-none text-[10px]">
            {order.status === 'delivered' ? 'Finalized' : 'In Progress'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Fingerprint size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Identity Anchor</p>
              <p className="text-xs font-black text-gray-900">Secured</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {order.status === 'delivered' ? <ShieldCheck size={16} /> : <RefreshCw size={16} className="animate-spin" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Settlement Sync</p>
              <p className="text-xs font-black text-gray-900">
                {order.status === 'delivered' ? 'Consolidated' : 'Synchronizing...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredOrders = orders
    .filter((order: PurchaseOrder) => filter === 'all' || order.status === filter)
    .filter((order: PurchaseOrder) =>
      order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: Package,
      color: 'blue' as const,
      change: `${orders.filter(o => o.status === 'pending').length} Pending`
    },
    {
      label: 'Confirmed',
      value: orders.filter(o => o.status === 'confirmed').length,
      icon: CheckCircle,
      color: 'emerald' as const,
      change: 'Ready to ship'
    },
    {
      label: 'Revenue',
      value: `$${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple' as const,
      change: 'Total Value'
    },
    {
      label: 'Delivered',
      value: orders.filter(o => o.status === 'delivered').length,
      icon: TrendingUp,
      color: 'cyan' as const,
      change: 'Completed'
    }
  ];

  if (loading) {
    return (
      <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
        <SupplierPageTemplate title="Purchase Orders" icon={Package}>
          <LoadingSkeleton lines={5} />
        </SupplierPageTemplate>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
        <SupplierPageTemplate title="Purchase Orders" icon={Package}>
          <ApiErrorDisplay error={error} onRetry={refetch} />
        </SupplierPageTemplate>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <SupplierPageTemplate
        title="Purchase Orders"
        icon={Package}
        subtitle="Manage restaurant requests and fulfillment"
      >
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filter */}
        <PageSection title="Browse Orders">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID or restaurant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {status} ({orders.filter(o => status === 'all' || o.status === status).length})
                </motion.button>
              ))}
            </div>
          </div>
        </PageSection>

        {/* Orders List */}
        <PageSection title="Orders">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.length > 0 ? filteredOrders.map((order: PurchaseOrder, idx: number) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-gray-200 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-gray-900">{order.id}</h3>
                        <Badge variant={getStatusColor(order.status) as any}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className="font-bold">{order.restaurant}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right md:ml-auto">
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                        {order.paymentType} Payment
                      </p>
                    </div>
                  </div>

                  {/* Synchronization HUD */}
                  <SynchronizationHUD order={order} />

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                      Items ({order.items.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{item.sku}</p>
                          <p className="text-xs font-bold text-blue-600">{item.quantity} {item.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleRejectOrder(order.id)}
                          variant="outline"
                          className="flex-1 h-10 rounded-lg text-sm"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="flex-[2] bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white h-10 rounded-lg text-sm font-black uppercase"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Accept Order
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        onClick={() => handleMarkShipped(order.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-10 rounded-lg text-sm font-black uppercase"
                      >
                        <Truck size={16} className="mr-2" />
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        onClick={() => handleMarkDelivered(order.id)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white h-10 rounded-lg text-sm font-black uppercase"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Confirm Delivery
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <div className="w-full flex items-center justify-center gap-2 text-emerald-600 font-black">
                        <CheckCircle size={20} />
                        Completed
                      </div>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="h-96 flex flex-col items-center justify-center text-center">
                  <Package size={64} className="text-gray-300 mb-4" />
                  <p className="text-lg font-bold text-gray-600">No orders found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </PageSection>
      </SupplierPageTemplate>
    </AuthGuard>
  );
}

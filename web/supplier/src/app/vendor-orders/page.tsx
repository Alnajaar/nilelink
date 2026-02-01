'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Truck, CheckCircle, Clock, AlertCircle, MapPin, Calendar, Package, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Badge } from '@shared/components/Badge';

interface VendorOrder {
  id: string;
  orderId: string;
  sku: { id: string; name: string; sku: string; };
  vendorName: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  dueDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
  shipment?: {
    id: string;
    departureLocation: string;
    deliveryLocation: string;
    estimatedArrivalDate: string;
    currentLocation: string;
    trackingNumber: string;
  };
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function VendorOrders() {
  const { data: ordersData, isLoading } = useSWR('/api/supplier/orders/vendor', fetcher);
  const [selectedStatus, setSelectedStatus] = useState<VendorOrder['status'] | 'ALL'>('ALL');

  const orders = ordersData || [];
  const statuses: VendorOrder['status'][] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const filteredOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((o: VendorOrder) => o.status === selectedStatus);

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o: VendorOrder) => o.status === 'PENDING').length,
    CONFIRMED: orders.filter((o: VendorOrder) => o.status === 'CONFIRMED').length,
    SHIPPED: orders.filter((o: VendorOrder) => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter((o: VendorOrder) => o.status === 'DELIVERED').length,
  };

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: Package,
      color: 'blue' as const,
      change: `${statusCounts.PENDING} Pending`
    },
    {
      label: 'Confirmed',
      value: statusCounts.CONFIRMED,
      icon: CheckCircle,
      color: 'emerald' as const,
      change: 'Ready to ship'
    },
    {
      label: 'In Transit',
      value: statusCounts.SHIPPED,
      icon: Truck,
      color: 'amber' as const,
      change: 'En route'
    },
    {
      label: 'Delivered',
      value: statusCounts.DELIVERED,
      icon: TrendingUp,
      color: 'cyan' as const,
      change: 'Completed'
    }
  ];

  const getStatusColor = (status: VendorOrder['status']) => {
    const colors: Record<VendorOrder['status'], 'warning' | 'info' | 'success' | 'neutral'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      SHIPPED: 'warning',
      DELIVERED: 'success',
    };
    return colors[status] || 'neutral';
  };

  const getStatusIcon = (status: VendorOrder['status']) => {
    const icons: Record<VendorOrder['status'], React.ReactNode> = {
      PENDING: <Clock className="w-4 h-4" />,
      CONFIRMED: <CheckCircle className="w-4 h-4" />,
      SHIPPED: <Truck className="w-4 h-4" />,
      DELIVERED: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  return (
    <SupplierPageTemplate
      title="Vendor Orders"
      icon={Truck}
      subtitle="Manage incoming orders from vendors"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Status Filter */}
      <PageSection title="Filter by Status">
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...statuses].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedStatus(status as VendorOrder['status'] | 'ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedStatus === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              {status} ({statusCounts[status as keyof typeof statusCounts]})
            </motion.button>
          ))}
        </div>
      </PageSection>

      {/* Orders Grid */}
      <PageSection title="Orders">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.length > 0 ? filteredOrders.map((order: VendorOrder, idx: number) => {
              const isOverdue = new Date(order.dueDate) < new Date();
              const isDueSoon = new Date(order.dueDate).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl border-l-4 p-6 border border-gray-200 hover:shadow-lg transition-all ${isOverdue ? 'border-l-red-500' : isDueSoon ? 'border-l-amber-500' : 'border-l-blue-500'
                    }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Vendor & Product */}
                    <div className="md:col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Vendor</p>
                      <h3 className="text-lg font-black text-gray-900 mb-3">{order.vendorName}</h3>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{order.sku.name}</p>
                        <p className="text-xs text-gray-600">SKU: {order.sku.sku}</p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Quantity</p>
                      <p className="text-2xl font-black text-gray-900">{order.orderedQuantity}</p>
                      {order.status === 'DELIVERED' && (
                        <p className="text-xs text-emerald-600 mt-1 font-bold">✓ {order.deliveredQuantity} delivered</p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Due Date</p>
                      <p className="text-lg font-bold text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</p>
                      {isOverdue && (
                        <span className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1">
                          <AlertCircle size={12} /> Overdue
                        </span>
                      )}
                      {isDueSoon && !isOverdue && (
                        <span className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-1">
                          <AlertCircle size={12} /> Due soon
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Status</p>
                      <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2"
                      >
                        <Truck size={16} />
                        Ship
                      </motion.button>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  {order.shipment && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-1">
                          <MapPin size={12} /> From
                        </p>
                        <p className="font-bold text-gray-900">{order.shipment.departureLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-1">
                          <MapPin size={12} /> To
                        </p>
                        <p className="font-bold text-gray-900">{order.shipment.deliveryLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-1">
                          <Calendar size={12} /> ETA
                        </p>
                        <p className="font-bold text-gray-900">{new Date(order.shipment.estimatedArrivalDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Tracking</p>
                        <p className="font-mono font-bold text-gray-900 text-xs">{order.shipment.trackingNumber}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            }) : (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <Package size={64} className="text-gray-300 mb-4" />
                <p className="text-lg font-bold text-gray-600">No orders found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PageSection>
    </SupplierPageTemplate>
  );
}

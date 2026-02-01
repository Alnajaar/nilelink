'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Clock, CheckCircle, XCircle, MapPin, User, Phone, Calendar, Filter, Search } from 'lucide-react';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress: string;
  deliveryTime: string;
  orderDate: string;
  estimatedDelivery: string;
}

export default function SupplierFulfillmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data - would connect to real order management system
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      customerName: 'Ahmed Hassan',
      customerPhone: '+20 123 456 7890',
      items: ['Organic Milk (1L)', 'Free-range Eggs (12pcs)', 'Artisan Bread'],
      totalAmount: 24.50,
      status: 'PROCESSING',
      deliveryAddress: '123 Main Street, Downtown Cairo',
      deliveryTime: '09:00-11:00 AM',
      orderDate: '2024-01-20',
      estimatedDelivery: '2024-01-20 10:30 AM'
    },
    {
      id: 'ORD-2024-002',
      customerName: 'Fatima Mahmoud',
      customerPhone: '+20 111 222 3333',
      items: ['Fresh Vegetables Bundle', 'Organic Milk (1L)'],
      totalAmount: 18.75,
      status: 'PENDING',
      deliveryAddress: '456 Oak Avenue, Alexandria',
      deliveryTime: '02:00-04:00 PM',
      orderDate: '2024-01-20',
      estimatedDelivery: '2024-01-20 03:15 PM'
    },
    {
      id: 'ORD-2024-003',
      customerName: 'Mohamed Ali',
      customerPhone: '+20 444 555 6666',
      items: ['Weekly Essentials Box', 'Specialty Cheese'],
      totalAmount: 32.25,
      status: 'PACKED',
      deliveryAddress: '789 Palm Street, Giza',
      deliveryTime: '10:00-12:00 AM',
      orderDate: '2024-01-19',
      estimatedDelivery: '2024-01-20 11:00 AM'
    },
    {
      id: 'ORD-2024-004',
      customerName: 'Sarah Johnson',
      customerPhone: '+20 777 888 9999',
      items: ['Daily Essentials Subscription'],
      totalAmount: 15.99,
      status: 'OUT_FOR_DELIVERY',
      deliveryAddress: '321 River Road, Cairo',
      deliveryTime: '08:00-10:00 AM',
      orderDate: '2024-01-19',
      estimatedDelivery: '2024-01-20 09:15 AM'
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: Order['status']) => {
    const configs = {
      PENDING: { color: 'yellow', text: 'Pending', icon: Clock },
      PROCESSING: { color: 'blue', text: 'Processing', icon: Package },
      PACKED: { color: 'purple', text: 'Packed', icon: CheckCircle },
      OUT_FOR_DELIVERY: { color: 'indigo', text: 'Out for Delivery', icon: Truck },
      DELIVERED: { color: 'green', text: 'Delivered', icon: CheckCircle },
      CANCELLED: { color: 'red', text: 'Cancelled', icon: XCircle }
    };
    return configs[status];
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const stats = [
    {
      label: 'Pending Orders',
      value: orders.filter(o => o.status === 'PENDING').length,
      icon: Clock,
      color: 'yellow' as const,
      change: 'Requires immediate attention'
    },
    {
      label: 'In Progress',
      value: orders.filter(o => ['PROCESSING', 'PACKED'].includes(o.status)).length,
      icon: Package,
      color: 'blue' as const,
      change: 'Currently being prepared'
    },
    {
      label: 'Out for Delivery',
      value: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
      icon: Truck,
      color: 'indigo' as const,
      change: 'En route to customers'
    },
    {
      label: 'Completed Today',
      value: orders.filter(o => o.status === 'DELIVERED').length,
      icon: CheckCircle,
      color: 'green' as const,
      change: 'Successful deliveries'
    }
  ];

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <SupplierPageTemplate
        title="Order Fulfillment"
        icon={Truck}
        subtitle="Manage order processing, packing, and delivery coordination"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filters */}
        <PageSection title="Order Management" subtitle="Process and track customer orders">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'PENDING', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')} ({orders.filter(o => status === 'all' || o.status === status).length})
                </motion.button>
              ))}
            </div>
          </div>
        </PageSection>

        {/* Orders List */}
        <PageSection title={`Orders (${filteredOrders.length})`} subtitle="Current order processing queue">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, idx) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">Order #{order.id}</h3>
                            <Badge variant={statusConfig.color as any}>
                              <StatusIcon size={14} className="mr-1" />
                              {statusConfig.text}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">${order.totalAmount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{order.orderDate}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <User size={16} />
                              <span className="font-bold">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Phone size={16} />
                              <span>{order.customerPhone}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="mt-0.5" />
                              <span>{order.deliveryAddress}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock size={16} />
                              <span>Preferred: {order.deliveryTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Calendar size={16} />
                              <span>Est. Delivery: {order.estimatedDelivery}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, i) => (
                              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[200px]">
                        {order.status === 'PENDING' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                          >
                            Start Processing
                          </Button>
                        )}
                        
                        {order.status === 'PROCESSING' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'PACKED')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
                          >
                            Mark as Packed
                          </Button>
                        )}
                        
                        {order.status === 'PACKED' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl"
                          >
                            Dispatch for Delivery
                          </Button>
                        )}
                        
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
                          >
                            Mark as Delivered
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="w-full font-bold py-3 rounded-xl"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredOrders.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Package size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-bold text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </PageSection>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Information</p>
                      <div className="space-y-2">
                        <p><span className="font-bold">Name:</span> {selectedOrder.customerName}</p>
                        <p><span className="font-bold">Phone:</span> {selectedOrder.customerPhone}</p>
                        <p><span className="font-bold">Address:</span> {selectedOrder.deliveryAddress}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Order Information</p>
                      <div className="space-y-2">
                        <p><span className="font-bold">Order ID:</span> {selectedOrder.id}</p>
                        <p><span className="font-bold">Date:</span> {selectedOrder.orderDate}</p>
                        <p><span className="font-bold">Status:</span> {getStatusConfig(selectedOrder.status).text}</p>
                        <p><span className="font-bold">Total:</span> ${selectedOrder.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                    <ul className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Package size={16} className="text-gray-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </SupplierPageTemplate>
    </AuthGuard>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, Coffee, Utensils, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { OrderWithDetails } from '@/types/order';

interface KitchenOrder {
  id: string;
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
  }>;
  tableNumber?: string;
  customerName?: string;
  orderTime: number;
  priority: 'normal' | 'urgent' | 'vip';
  station?: string; // Kitchen station assignment
}

const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus } = usePOS();
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [activeStation, setActiveStation] = useState<string>('all');

  // Convert POS orders to kitchen orders
  useEffect(() => {
    const convertedOrders: KitchenOrder[] = orders
      .filter(order => order.status === 'confirmed' || order.status === 'preparing')
      .map(order => ({
        id: `kitchen_${order.id}`,
        orderId: order.id,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          status: order.status === 'preparing' ? 'preparing' : 'pending'
        })),
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        orderTime: order.createdAt,
        priority: order.priority || 'normal',
        station: order.kitchenStation
      }))
      .filter(kitchenOrder => 
        activeStation === 'all' || kitchenOrder.station === activeStation
      );

    setKitchenOrders(convertedOrders);
  }, [orders, activeStation]);

  const handleItemReady = (orderId: string, itemId: string) => {
    setKitchenOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const updatedItems = order.items.map(item => 
          item.id === itemId ? { ...item, status: 'ready' } : item
        );
        
        // If all items are ready, update the order status
        const allReady = updatedItems.every(item => item.status === 'ready');
        if (allReady) {
          updateOrderStatus(orderId, 'ready_for_pickup');
        }
        
        return { ...order, items: updatedItems };
      }
      return order;
    }));
  };

  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50/50';
      case 'vip': return 'border-l-yellow-500 bg-yellow-50/50';
      default: return 'border-l-blue-500 bg-blue-50/30';
    }
  };

  const getStatusColor = (status: KitchenOrder['items'][0]['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 text-gray-800';
      case 'preparing': return 'bg-blue-200 text-blue-800';
      case 'ready': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const stations = ['all', 'main', 'dessert', 'drinks', 'appetizers'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ChefHat className="text-orange-400" />
            Kitchen Display System
          </h1>
          
          <div className="flex gap-2">
            {stations.map(station => (
              <button
                key={station}
                onClick={() => setActiveStation(station)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  activeStation === station
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {kitchenOrders.map((kitchenOrder) => (
              <motion.div
                key={kitchenOrder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white/10 backdrop-blur-sm rounded-xl border-l-4 p-6 ${getPriorityColor(kitchenOrder.priority)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Order #{kitchenOrder.orderId.slice(0, 8)}
                    </h3>
                    {kitchenOrder.tableNumber && (
                      <p className="text-gray-300">Table: {kitchenOrder.tableNumber}</p>
                    )}
                    {kitchenOrder.customerName && (
                      <p className="text-gray-300">Customer: {kitchenOrder.customerName}</p>
                    )}
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={16} />
                      {new Date(kitchenOrder.orderTime).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    kitchenOrder.priority === 'urgent' 
                      ? 'bg-red-500 text-white' 
                      : kitchenOrder.priority === 'vip'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {kitchenOrder.priority}
                  </div>
                </div>

                <div className="space-y-3">
                  {kitchenOrder.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 bg-black/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-sm text-yellow-300 mt-1">
                            💬 {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        
                        {item.status !== 'ready' && (
                          <button
                            onClick={() => handleItemReady(kitchenOrder.orderId, item.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                            title="Mark as ready"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {kitchenOrder.station && (
                  <div className="mt-4 pt-3 border-t border-white/20">
                    <span className="text-sm text-gray-400">Station: </span>
                    <span className="text-sm font-medium text-orange-400 capitalize">
                      {kitchenOrder.station}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {kitchenOrders.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No orders in kitchen</h3>
            <p className="text-gray-500">Orders will appear here when they're sent to the kitchen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
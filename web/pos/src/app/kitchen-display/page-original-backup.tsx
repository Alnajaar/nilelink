'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChefHat, Clock, CheckCircle, AlertCircle, Flame,
    Bell, Printer, RefreshCw, Settings, Loader
} from 'lucide-react';
import { orderApi } from '@/shared/utils/api';
import { useSocket } from '@shared/contexts/SocketContext';
// import { useAuth } from '@/shared/contexts/AuthContext'; // If needed for restaurantId

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    notes: string;
    modifiers: string[];
}

interface KitchenOrder {
    id: string;
    orderNumber: string;
    table: string; // or delivery type
    server: string;
    timeReceived: Date;
    items: OrderItem[];
    status: 'new' | 'preparing' | 'ready'; // UI status mapped from API
    priority: 'normal' | 'urgent';
    originalStatus: string; // API status
}

export default function KitchenDisplayPage() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Initial Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Fetch active kitchen orders: APPROVED, PREPARING, READY
                // We might need to make multiple calls or a single call with multiple statuses if API supports it (comma separated?)
                // Assuming our API supports list filtering. If not, we fetch active/pending and filter client side.
                // Let's assume we can fetch all non-completed/non-rejected.
                const response: any = await orderApi.list();
                if (response.success && Array.isArray(response.data)) {
                    // Filter and Map
                    const kitchenOrders = response.data
                        .filter((o: any) => ['APPROVED', 'PREPARING', 'READY'].includes(o.status))
                        .map((o: any) => mapToKitchenOrder(o));

                    setOrders(kitchenOrders);
                }
            } catch (err) {
                console.error("Failed to fetch kitchen orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdated = (updatedOrder: any) => {
            console.log("KDS Order Update:", updatedOrder);
            // If status is one we care about, update or add
            if (['APPROVED', 'PREPARING', 'READY'].includes(updatedOrder.status)) {
                setOrders(prev => {
                    // Check if exists
                    const exists = prev.find(o => o.id === updatedOrder.id);
                    if (exists) {
                        return prev.map(o => o.id === updatedOrder.id ? mapToKitchenOrder(updatedOrder) : o);
                    } else {
                        return [...prev, mapToKitchenOrder(updatedOrder)];
                    }
                });
            } else if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
                // Remove
                setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            }
        };

        // If auto-approve is on, we might listen to 'order:new' but typically POS approves first.
        // If POS approves, we receive 'order:updated' with status='APPROVED'.

        socket.on('order:updated', handleOrderUpdated);

        return () => {
            socket.off('order:updated', handleOrderUpdated);
        };
    }, [socket]);

    const mapToKitchenOrder = (apiOrder: any): KitchenOrder => {
        // Map API status to UI status
        let uiStatus: KitchenOrder['status'] = 'new';
        if (apiOrder.status === 'PREPARING') uiStatus = 'preparing';
        if (apiOrder.status === 'READY') uiStatus = 'ready';
        // APPROVED maps to 'new' (waiting to start)

        return {
            id: apiOrder.id,
            orderNumber: `ORD-${apiOrder.id.slice(-4)}`,
            table: apiOrder.delivery ? 'Delivery' : `Table ${Math.floor(Math.random() * 10) + 1}`, // Placeholder for table
            server: 'Server', // Placeholder
            timeReceived: new Date(apiOrder.createdAt),
            status: uiStatus,
            originalStatus: apiOrder.status,
            priority: 'normal', // Logic for priority not impl yet
            items: apiOrder.items.map((i: any) => ({
                id: i.id || Math.random().toString(),
                name: i.menuItem?.name || 'Item',
                quantity: i.quantity,
                notes: i.specialInstructions || '',
                modifiers: [] // Not in current schema
            }))
        };
    };

    const getElapsedTime = (receivedTime: Date) => {
        const diff = Math.floor((currentTime.getTime() - receivedTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTimeColor = (receivedTime: Date) => {
        const minutes = Math.floor((currentTime.getTime() - receivedTime.getTime()) / 60000);
        if (minutes > 15) return 'text-red-400';
        if (minutes > 10) return 'text-yellow-400';
        return 'text-green-400';
    };

    const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready') => {
        // Optimistic update
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status } : order
        ));

        // API Call
        const apiStatus = status === 'preparing' ? 'PREPARING' : 'READY';
        try {
            await orderApi.updateStatus(orderId, apiStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert?
        }
    };

    const completeOrder = async (orderId: string) => {
        // Optimistic remove
        setOrders(orders.filter(order => order.id !== orderId));
        try {
            await orderApi.updateStatus(orderId, 'COMPLETED');
        } catch (err) {
            console.error("Failed to complete order", err);
        }
    };

    const newOrders = orders.filter(o => o.status === 'new');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4">
            {/* Header */}
            <div className="bg-slate-900 rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
                        <p className="text-sm text-slate-400">Live Order Queue</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-white">
                            {currentTime.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-slate-400">Current Time</div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                        <RefreshCw className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                        <Settings className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-red-400 mb-1">{newOrders.length}</div>
                    <div className="text-sm text-slate-400">New Orders</div>
                </div>
                <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{preparingOrders.length}</div>
                    <div className="text-sm text-slate-400">Preparing</div>
                </div>
                <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-400 mb-1">{readyOrders.length}</div>
                    <div className="text-sm text-slate-400">Ready</div>
                </div>
                <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{orders.length}</div>
                    <div className="text-sm text-slate-400">Total Active</div>
                </div>
            </div>

            {/* Order Columns */}
            <div className="grid grid-cols-3 gap-4">
                {/* New Orders */}
                <div className="space-y-4">
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
                        <h2 className="font-bold text-white text-lg flex items-center gap-2">
                            <Bell className="w-5 h-5 text-red-400" />
                            NEW ({newOrders.length})
                        </h2>
                    </div>
                    <AnimatePresence>
                        {newOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-slate-900 rounded-2xl p-4 border-2 ${order.priority === 'urgent'
                                    ? 'border-red-500 shadow-lg shadow-red-500/20'
                                    : 'border-slate-700'
                                    }`}
                            >
                                {order.priority === 'urgent' && (
                                    <div className="flex items-center gap-2 mb-3 text-red-400">
                                        <Flame className="w-5 h-5 animate-pulse" />
                                        <span className="font-bold text-sm">URGENT</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xl font-bold text-white mb-1">{order.orderNumber}</div>
                                        <div className="text-sm text-slate-400">{order.table} • {order.server}</div>
                                    </div>
                                    <div className={`text-2xl font-mono font-bold ${getTimeColor(order.timeReceived)}`}>
                                        {getElapsedTime(order.timeReceived)}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={`${order.id}-${idx}`} className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <span className="text-lg font-bold text-white">x{item.quantity}</span>
                                            </div>
                                            {item.modifiers.length > 0 && (
                                                <div className="text-xs text-yellow-400 mb-1">
                                                    {item.modifiers.join(', ')}
                                                </div>
                                            )}
                                            {item.notes && (
                                                <div className="text-xs text-orange-400">Note: {item.notes}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Start Preparing
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Preparing Orders */}
                <div className="space-y-4">
                    <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-3">
                        <h2 className="font-bold text-white text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            PREPARING ({preparingOrders.length})
                        </h2>
                    </div>
                    <AnimatePresence>
                        {preparingOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-4"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xl font-bold text-white mb-1">{order.orderNumber}</div>
                                        <div className="text-sm text-slate-400">{order.table} • {order.server}</div>
                                    </div>
                                    <div className={`text-2xl font-mono font-bold ${getTimeColor(order.timeReceived)}`}>
                                        {getElapsedTime(order.timeReceived)}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={`${order.id}-${idx}`} className="bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <span className="text-lg font-bold text-white">x{item.quantity}</span>
                                            </div>
                                            {item.modifiers.length > 0 && (
                                                <div className="text-xs text-yellow-400">{item.modifiers.join(', ')}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                >
                                    Mark Ready
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Ready Orders */}
                <div className="space-y-4">
                    <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-3">
                        <h2 className="font-bold text-white text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            READY ({readyOrders.length})
                        </h2>
                    </div>
                    <AnimatePresence>
                        {readyOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-slate-900 border-2 border-green-500 rounded-2xl p-4"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xl font-bold text-white mb-1">{order.orderNumber}</div>
                                        <div className="text-sm text-slate-400">{order.table} • {order.server}</div>
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-green-400">
                                        {getElapsedTime(order.timeReceived)}
                                    </div>
                                </div>

                                <div className="text-center py-4 bg-green-500/20 rounded-lg mb-4">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                                    <div className="text-green-400 font-bold">Ready for Pickup!</div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => completeOrder(order.id)}
                                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                                    >
                                        Complete
                                    </button>
                                    <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2">
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
}

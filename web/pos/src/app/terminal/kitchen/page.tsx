"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { orderApi } from '@/shared/utils/api';
import { joinRoom, SocketEvents } from '@/shared/utils/socket';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Flame, Bell } from 'lucide-react';

export default function KitchenDisplayPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);

    // Fetch initial orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Assuming user has a restaurant context
                const { orders: fetchedOrders } = (await orderApi.list({
                    status: 'CONFIRMED,PREPARING'
                }) as any);
                setOrders(fetchedOrders || []);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };
        fetchOrders();
    }, []);

    // Join restaurant room for real-time updates
    useEffect(() => {
        if (user) {
            // In a real app, get restaurant ID from user context
            joinRoom('restaurant_default-restaurant-id');
        }
    }, [user]);

    // Listen for new orders
    useSocketEvent(SocketEvents.ORDER_CREATED, (newOrder: any) => {
        console.log('New order received:', newOrder);
        setOrders(prev => [newOrder, ...prev]);
        setNewOrderNotification(newOrder.id);

        // Play notification sound (optional)
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) { }

        // Clear notification after 5s
        setTimeout(() => setNewOrderNotification(null), 5000);
    }, []);

    // Listen for order updates
    useSocketEvent(SocketEvents.ORDER_UPDATED, (updatedOrder: any) => {
        setOrders(prev =>
            prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        );
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            // Socket event will update the UI
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-500';
            case 'PREPARING': return 'bg-amber-500';
            case 'READY': return 'bg-emerald-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-background-light p-8">
            {/* Notification Banner */}
            <AnimatePresence>
                {newOrderNotification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-success text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                        <Bell className="animate-bounce" size={24} />
                        <span className="font-bold text-lg">New Order Received!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8">
                <h1 className="text-4xl font-black text-primary-dark mb-2">Kitchen Display</h1>
                <p className="text-text-secondary">Real-time order queue</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white rounded-2xl p-6 shadow-md border-l-4 ${getStatusColor(order.status)}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-primary-dark">#{order.orderNumber}</h3>
                                <p className="text-sm text-text-secondary">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)} text-white`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                                    <span className="text-text-secondary">${Number(item.totalPrice).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-4">
                            {order.status === 'CONFIRMED' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                    className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-bold hover:bg-amber-600 transition"
                                >
                                    Start Preparing
                                </button>
                            )}
                            {order.status === 'PREPARING' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'READY')}
                                    className="flex-1 bg-emerald-500 text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Mark Ready
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full text-center py-20 text-text-secondary">
                        <Clock size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No active orders</p>
                    </div>
                )}
            </div>
        </div>
    );
}

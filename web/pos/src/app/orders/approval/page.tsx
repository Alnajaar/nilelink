'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCircle, XCircle, Clock, Truck, User,
    Phone, MapPin, Receipt, AlertCircle, ChefHat, Loader
} from 'lucide-react';
import { orderApi } from '@/shared/utils/api';
import { useSocket } from '@shared/contexts/SocketContext';
import { useAuth } from '@/shared/contexts/AuthContext';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    menuItemId: string; // Added ID
}

interface IncomingOrder {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: 'card' | 'cash' | 'online'; // Updated types
    timestamp: Date;
    status: string;
    type: 'delivery' | 'pickup';
    restaurantId: string;
}

export default function OrderApprovalPage() {
    const [orders, setOrders] = useState<IncomingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuth();

    // Fetch initial orders
    useEffect(() => {
        const fetchOrders = async () => {
            // In a real scenario, we'd filter by restaurantId from the logged-in user or context
            // For demo, we might fetch all PENDING orders if the API supports it
            try {
                setLoading(true);
                // Assuming orderApi.list supports filtering
                const response: any = await orderApi.list({ status: 'PENDING' });
                if (response.success && Array.isArray(response.data)) {
                    const formattedOrders = response.data.map((o: any) => mapOrderData(o));
                    setOrders(formattedOrders);
                }
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (newOrder: any) => {
            console.log("New order received via socket:", newOrder);
            // Only add if it matches our restaurant (if strict filtering needed)
            // For now, assume server only sends relevant events to our room
            setOrders(prev => [mapOrderData(newOrder), ...prev]);

            // Play notification sound?
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        };

        const handleOrderUpdated = (updatedOrder: any) => {
            // If status changed to something else than PENDING/APPROVED(if we show those), remove or update
            setOrders(prev => {
                return prev.map(o => o.id === updatedOrder.id ? mapOrderData(updatedOrder) : o)
                    .filter(o => o.status === 'PENDING'); // Only keep pending in this view?
            });
        };

        socket.on('order:new', handleNewOrder);
        socket.on('order:updated', handleOrderUpdated);

        return () => {
            socket.off('order:new', handleNewOrder);
            socket.off('order:updated', handleOrderUpdated);
        };
    }, [socket]);

    const mapOrderData = (apiOrder: any): IncomingOrder => {
        // Helper to transform API shape to UI shape
        const items = apiOrder.items?.map((i: any) => ({
            name: i.menuItem?.name || 'Unknown Item', // API might need to include menuItem details or we fetch them
            quantity: i.quantity,
            price: i.unitPrice,
            notes: i.specialInstructions,
            menuItemId: i.menuItemId
        })) || [];

        // Calculate totals if not present
        const calculatedTotal = items.reduce((sum: number, i: OrderItem) => sum + (i.price * i.quantity), 0);

        return {
            id: apiOrder.id,
            customerName: apiOrder.customer?.firstName ? `${apiOrder.customer.firstName} ${apiOrder.customer.lastName}` : 'Guest',
            customerPhone: apiOrder.customer?.phone || 'N/A',
            customerAddress: apiOrder.delivery?.dropoffAddress || 'Pickup',
            items,
            subtotal: calculatedTotal,
            deliveryFee: 0, // Need to get this from API
            total: apiOrder.totalAmount || calculatedTotal,
            paymentMethod: apiOrder.paymentMethod.toLowerCase(),
            timestamp: new Date(apiOrder.createdAt),
            status: apiOrder.status,
            type: apiOrder.delivery ? 'delivery' : 'pickup',
            restaurantId: apiOrder.restaurantId
        };
    };

    const handleApprove = async (id: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.filter(o => o.id !== id));

            await orderApi.updateStatus(id, 'APPROVED');
            console.log(`Order ${id} approved`);
        } catch (err) {
            console.error("Failed to approve order", err);
            // Revert on failure involves complex state management, skip for demo or re-fetch
            alert("Failed to approve order. Please try again.");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this order?')) return;
        try {
            setOrders(prev => prev.filter(o => o.id !== id));
            await orderApi.updateStatus(id, 'REJECTED');
        } catch (err) {
            console.error("Failed to reject order", err);
            alert("Failed to reject order.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Incoming Orders</h1>
                    <p className="text-slate-400">Review and approve customer orders</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Bell className="w-8 h-8 text-white" />
                        {orders.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center animate-pulse">
                                {orders.length}
                            </span>
                        )}
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${orders.length > 0
                        ? 'bg-red-500/20 border-red-500/50 text-red-500'
                        : 'bg-green-500/20 border-green-500/50 text-green-500'
                        }`}>
                        <span className="font-bold">{orders.length} New Orders</span>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {orders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border-2 border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all"
                        >
                            {/* Order Header */}
                            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl font-bold text-white">#{order.id.slice(-4)}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.type === 'delivery' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {order.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{Math.floor((Date.now() - order.timestamp.getTime()) / 60000)} mins ago</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">${order.total.toFixed(2)}</div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">{order.paymentMethod}</div>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="font-medium">{order.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <span>{order.customerPhone}</span>
                                    </div>
                                    {order.type === 'delivery' && (
                                        <div className="flex items-start gap-2 text-slate-400 text-sm">
                                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                                            <span className="line-clamp-2">{order.customerAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Details</h3>
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-sm font-bold text-white">
                                                {item.quantity}
                                            </div>
                                            <div>
                                                <div className="text-slate-200 font-medium">{item.name}</div>
                                                {item.notes && (
                                                    <div className="text-sm text-yellow-500/80 italic">Note: {item.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-slate-400 font-mono">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}

                                <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Subtotal</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Delivery Fee</span>
                                        <span>${order.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-white pt-2">
                                        <span>Total</span>
                                        <span>${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 grid grid-cols-2 gap-4 bg-slate-900 border-t border-slate-800">
                                <button
                                    onClick={() => handleReject(order.id)}
                                    className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-red-500 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(order.id)}
                                    className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    <ChefHat className="w-5 h-5" />
                                    Approve Order
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {orders.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
                        <p className="text-slate-400">No new orders waiting for approval.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChefHat, Clock, CheckCircle, AlertCircle, Flame,
    Bell, Printer, RefreshCw, Settings, Loader, Zap, Utensils,
    Layers, Timer, Menu, ArrowRight
} from 'lucide-react';
import { orderApi } from '@/shared/utils/api';
import { useSocket } from '@shared/contexts/SocketContext';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';

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
    table: string;
    server: string;
    timeReceived: Date;
    items: OrderItem[];
    status: 'new' | 'preparing' | 'ready';
    priority: 'normal' | 'urgent';
    originalStatus: string;
}

export default function KitchenDisplaySystem() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Track socket connection status
    useEffect(() => {
        if (!socket) {
            setSyncStatus('disconnected');
            return;
        }

        const handleConnect = () => setSyncStatus('connected');
        const handleDisconnect = () => setSyncStatus('disconnected');
        const handleError = () => setSyncStatus('disconnected');

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleError);

        setSyncStatus(socket.connected ? 'connected' : 'connecting');

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleError);
        };
    }, [socket]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response: any = await orderApi.list();
                if (response.success && Array.isArray(response.data)) {
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

    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdated = (updatedOrder: any) => {
            console.log("KDS Order Update:", updatedOrder);
            if (['APPROVED', 'PREPARING', 'READY'].includes(updatedOrder.status)) {
                setOrders(prev => {
                    const exists = prev.find(o => o.id === updatedOrder.id);
                    if (exists) {
                        return prev.map(o => o.id === updatedOrder.id ? mapToKitchenOrder(updatedOrder) : o);
                    } else {
                        return [...prev, mapToKitchenOrder(updatedOrder)];
                    }
                });
            } else if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
                setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            }
        };

        socket.on('order:updated', handleOrderUpdated);

        return () => {
            socket.off('order:updated', handleOrderUpdated);
        };
    }, [socket]);

    const mapToKitchenOrder = (apiOrder: any): KitchenOrder => {
        let uiStatus: KitchenOrder['status'] = 'new';
        if (apiOrder.status === 'PREPARING') uiStatus = 'preparing';
        if (apiOrder.status === 'READY') uiStatus = 'ready';

        return {
            id: apiOrder.id,
            orderNumber: `#${apiOrder.id.slice(-4)}`,
            table: apiOrder.delivery ? 'Delivery' : apiOrder.tableNumber ? `Table ${apiOrder.tableNumber}` : `Table ${Math.floor(Math.random() * 10) + 1}`,
            server: apiOrder.createdBy?.username || 'Terminal',
            timeReceived: new Date(apiOrder.createdAt),
            status: uiStatus,
            originalStatus: apiOrder.status,
            priority: apiOrder.priority === 'HIGH' ? 'urgent' : 'normal',
            items: apiOrder.items?.map((i: any) => ({
                id: i.id || Math.random().toString(),
                name: i.menuItem?.name || i.name || 'Unknown Item',
                quantity: i.quantity,
                notes: i.specialInstructions || i.notes || '',
                modifiers: i.modifiers || []
            })) || []
        };
    };

    const getElapsedTime = (receivedTime: Date) => {
        const diff = Math.floor((currentTime.getTime() - receivedTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTimePriority = (receivedTime: Date) => {
        const minutes = Math.floor((currentTime.getTime() - receivedTime.getTime()) / 60000);
        if (minutes > 15) return 'high';
        if (minutes > 10) return 'medium';
        return 'low';
    };

    const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready') => {
        try {
            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status } : order
            ));
            
            const apiStatus = status === 'preparing' ? 'PREPARING' : 'READY';
            await orderApi.updateStatus(orderId, apiStatus);
            
            // Show notification
            console.log(`Order ${orderId} marked as ${status}`);
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert optimistic update on error
            setOrders(orders);
        }
    };

    const completeOrder = async (orderId: string) => {
        try {
            // Optimistic removal
            setOrders(orders.filter(order => order.id !== orderId));
            
            await orderApi.updateStatus(orderId, 'COMPLETED');
            
            // Show notification
            console.log(`Order ${orderId} completed`);
        } catch (err) {
            console.error("Failed to complete order", err);
            // Restore order on error
            const order = orders.find(o => o.id === orderId);
            if (order) {
                setOrders([...orders.filter(o => o.id !== orderId), { ...order, status: 'ready' }]);
            }
        }
    };

    const refreshOrders = async () => {
        try {
            setLoading(true);
            const response: any = await orderApi.list();
            if (response.success && Array.isArray(response.data)) {
                const kitchenOrders = response.data
                    .filter((o: any) => ['APPROVED', 'PREPARING', 'READY'].includes(o.status))
                    .map((o: any) => mapToKitchenOrder(o));
                setOrders(kitchenOrders);
            }
        } catch (err) {
            console.error("Failed to refresh orders", err);
        } finally {
            setLoading(false);
        }
    };

    const newOrders = orders.filter(o => o.status === 'new');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Professional Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
                            <p className="text-sm text-gray-600">Real-time order management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Time Display */}
                        <div className="text-right hidden md:block">
                            <div className="text-xl font-bold text-gray-900">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                            <div className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</div>
                        </div>
                        
                        {/* Sync Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                                syncStatus === 'connected' ? 'bg-green-500' :
                                syncStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600 capitalize">{syncStatus}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={refreshOrders}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Settings size={16} />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { 
                            title: 'New Orders', 
                            value: newOrders.length, 
                            icon: Bell, 
                            color: 'text-red-600', 
                            bg: 'bg-red-50', 
                            border: 'border-red-200' 
                        },
                        { 
                            title: 'Preparing', 
                            value: preparingOrders.length, 
                            icon: Utensils, 
                            color: 'text-yellow-600', 
                            bg: 'bg-yellow-50', 
                            border: 'border-yellow-200' 
                        },
                        { 
                            title: 'Ready', 
                            value: readyOrders.length, 
                            icon: CheckCircle, 
                            color: 'text-green-600', 
                            bg: 'bg-green-50', 
                            border: 'border-green-200' 
                        },
                        { 
                            title: 'Total Active', 
                            value: orders.length, 
                            icon: Zap, 
                            color: 'text-blue-600', 
                            bg: 'bg-blue-50', 
                            border: 'border-blue-200' 
                        }
                    ].map((stat, idx) => (
                        <Card key={idx} className={`p-6 border-2 ${stat.border} ${stat.bg}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`w-10 h-10 ${stat.bg} ${stat.border} border rounded-lg flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Order Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* New Orders Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Timer size={20} className="text-red-600" />
                                New Orders
                            </h2>
                            <Badge variant="error" className="text-xs">
                                {newOrders.length} pending
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {newOrders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative"
                                    >
                                        <Card className={`p-6 border-2 ${
                                            order.priority === 'urgent' 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-200 bg-white'
                                        }`}>
                                            {order.priority === 'urgent' && (
                                                <div className="absolute -top-2 -right-2">
                                                    <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm text-blue-600 font-medium">{order.table}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600">{order.server}</span>
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-bold ${
                                                    getTimePriority(order.timeReceived) === 'high' ? 'text-red-600' :
                                                    getTimePriority(order.timeReceived) === 'medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {getElapsedTime(order.timeReceived)}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-blue-600 font-bold">x{item.quantity}</span>
                                                        </div>
                                                        {item.notes && (
                                                            <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                                {item.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                            >
                                                Start Preparing
                                            </Button>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {newOrders.length === 0 && (
                                <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-gray-50">
                                    <Layers size={32} className="text-gray-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-600 font-medium">No new orders</p>
                                    <p className="text-sm text-gray-500 mt-1">Waiting for incoming orders</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Utensils size={20} className="text-yellow-600" />
                                Preparing
                            </h2>
                            <Badge variant="warning" className="text-xs">
                                {preparingOrders.length} cooking
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {preparingOrders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                    >
                                        <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                                                    <p className="text-sm text-yellow-700 font-medium">{order.table}</p>
                                                </div>
                                                <div className="text-lg font-bold text-yellow-700">
                                                    {getElapsedTime(order.timeReceived)}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-yellow-100 last:border-0">
                                                        <span className="font-medium text-gray-900">{item.name}</span>
                                                        <span className="text-yellow-700 font-bold">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                                            >
                                                Mark as Ready
                                            </Button>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {preparingOrders.length === 0 && (
                                <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-gray-50">
                                    <Utensils size={32} className="text-gray-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-600 font-medium">No orders cooking</p>
                                    <p className="text-sm text-gray-500 mt-1">All clear in the kitchen</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-600" />
                                Ready
                            </h2>
                            <Badge variant="success" className="text-xs">
                                {readyOrders.length} ready
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {readyOrders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Card className="p-6 border-2 border-green-200 bg-green-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle size={16} className="text-white" />
                                                </div>
                                            </div>

                                            <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center mb-4">
                                                <p className="text-sm font-bold text-green-800">Ready for pickup</p>
                                                <p className="text-xs text-green-700 mt-1">Pick up at {order.table}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => completeOrder(order.id)}
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                >
                                                    Complete
                                                </Button>
                                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                                    <Printer size={16} className="mr-2" />
                                                    Print
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {readyOrders.length === 0 && (
                                <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-gray-50">
                                    <CheckCircle size={32} className="text-gray-400 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-600 font-medium">No ready orders</p>
                                    <p className="text-sm text-gray-500 mt-1">All orders delivered</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

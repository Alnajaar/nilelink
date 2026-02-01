"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle2, Flame, Bell, ChefHat, AlertCircle, Timer,
    Package, Users, TrendingUp, Zap, PlayCircle,
    XCircle, Search, Filter, RefreshCw, Menu, Eye, Grid3x3, LayoutList
} from 'lucide-react';

import { useAuth } from '@shared/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { PERMISSION } from '@/utils/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { orderApi } from '@/shared/utils/api';
import { joinRoom, SocketEvents } from '@/shared/utils/socket';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { useRouter } from 'next/navigation';
import { POSSideMenu } from '@/components/POSSideMenu';
import { DriverCard } from '@/components/DriverCard';
import { useCurrency } from '@shared/contexts/CurrencyContext';
import KitchenDisplaySystem from '@/components/KitchenDisplaySystem';
import StationSelector from '@/components/StationSelector';
import KitchenMetricsHUD from '@/components/KitchenMetricsHUD';
import StationLoadIndicator from '@/components/StationLoadIndicator';
import OrderNotificationCenter from '@/components/OrderNotificationCenter';
import OrderTimeline from '@/components/OrderTimeline';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';
type StationType = 'grill' | 'prep' | 'dessert' | 'drinks' | 'plating';
type PriorityType = 'normal' | 'high' | 'urgent';

interface KDSOrder {
    id: string;
    orderNumber: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        specialInstructions?: string;
        station: StationType;
        status: OrderStatus;
        timeStarted?: Date;
        estimatedTime: number;
    }>;
    type: 'dine-in' | 'takeaway' | 'delivery';
    table?: string;
    createdAt: Date;
    priority: PriorityType;
}

interface StationLoad {
    station: StationType;
    utilization: number;
    ordersCount: number;
    avgTime: number;
    status: 'optimal' | 'busy' | 'critical';
}

interface TimelineEvent {
    timestamp: Date;
    status: OrderStatus;
    station: string;
    duration?: number;
}

type NotificationType = 'order' | 'alert' | 'info' | 'success';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    duration?: number;
}

export default function AdvancedKitchenDisplay() {
    const router = useRouter();
    const { user } = useAuth();
    const { currentRole, hasPermission } = usePOS();
    const [mounted, setMounted] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'dashboard' | 'analytics'>('dashboard');
    const [selectedStation, setSelectedStation] = useState<StationType | undefined>();
    const [isRushMode, setIsRushMode] = useState(false);
    const hardwareStatusRef = useRef({ paperLevel: 'OK' });
    const [orders, setOrders] = useState<KDSOrder[]>([
        {
            id: 'ord-1',
            orderNumber: '001',
            priority: 'high',
            type: 'dine-in',
            table: '5',
            createdAt: new Date(Date.now() - 1000 * 60 * 15),
            items: [
                {
                    id: 'item-1',
                    name: 'Margherita Pizza',
                    quantity: 1,
                    specialInstructions: 'Extra basil, no cheese',
                    station: 'grill',
                    status: 'preparing',
                    timeStarted: new Date(Date.now() - 1000 * 60 * 10),
                    estimatedTime: 20
                }
            ]
        },
        {
            id: 'ord-2',
            orderNumber: '002',
            priority: 'normal',
            type: 'takeaway',
            createdAt: new Date(Date.now() - 1000 * 60 * 8),
            items: [
                {
                    id: 'item-2',
                    name: 'Caesar Salad',
                    quantity: 2,
                    station: 'prep',
                    status: 'pending',
                    estimatedTime: 8
                }
            ]
        },
        {
            id: 'ord-3',
            orderNumber: '003',
            priority: 'urgent',
            type: 'delivery',
            createdAt: new Date(Date.now() - 1000 * 60 * 25),
            items: [
                {
                    id: 'item-3',
                    name: 'Grilled Salmon',
                    quantity: 1,
                    specialInstructions: 'Medium rare',
                    station: 'grill',
                    status: 'ready',
                    timeStarted: new Date(Date.now() - 1000 * 60 * 22),
                    estimatedTime: 25
                }
            ]
        }
    ]);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [metrics, setMetrics] = useState({
        activeOrders: 3,
        pendingOrders: 1,
        preparingOrders: 1,
        readyOrders: 1,
        averagePrepTime: 18,
        slacompliance: 92,
        kitchenUtilization: 65,
        completedToday: 42,
        estimatedWaitTime: 12
    });

    const [stationLoads, setStationLoads] = useState<StationLoad[]>([
        { station: 'grill', utilization: 75, ordersCount: 2, avgTime: 20, status: 'busy' },
        { station: 'prep', utilization: 45, ordersCount: 1, avgTime: 10, status: 'optimal' },
        { station: 'dessert', utilization: 20, ordersCount: 0, avgTime: 15, status: 'optimal' },
        { station: 'drinks', utilization: 55, ordersCount: 1, avgTime: 5, status: 'optimal' },
        { station: 'plating', utilization: 30, ordersCount: 0, avgTime: 3, status: 'optimal' },
    ]);

    // Rush Mode Logic
    useEffect(() => {
        if (metrics.kitchenUtilization > 80 || metrics.pendingOrders > 5) {
            setIsRushMode(true);
        } else {
            setIsRushMode(false);
        }
    }, [metrics]);

    const hardwareStatus = hardwareStatusRef.current;

    useEffect(() => {
        setMounted(true);
        const fetchOrders = async () => {
            try {
                // Fetch orders - using mock data for demo
                // const response = await orderApi.list({ status: 'pending,preparing,ready' }) as any;
                setOrders(prev => prev); // Use demo data
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (user && mounted) {
            joinRoom('restaurant_kitchen_display');
        }
    }, [user, mounted]);

    // Handle Socket.io real-time updates
    useSocketEvent(SocketEvents.ORDER_CREATED, (newOrder: any) => {
        const notification: Notification = {
            id: `notif-${Date.now()}`,
            type: 'order',
            title: 'New Order',
            message: `Order #${newOrder.orderNumber} arrived for ${newOrder.type}`,
            timestamp: new Date(),
            duration: 5000
        };
        setNotifications(prev => [notification, ...prev].slice(0, 5));

        // Play notification sound
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) { }
    });

    const updateOrderItemStatus = async (orderId: string, itemId: string, newStatus: OrderStatus) => {
        try {
            // await orderApi.updateItemStatus(orderId, itemId, newStatus);
            setOrders(prev => prev.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        items: order.items.map(item =>
                            item.id === itemId ? { ...item, status: newStatus, timeStarted: new Date() } : item
                        )
                    };
                }
                return order;
            }));

            // Add success notification
            const notification: Notification = {
                id: `notif-${Date.now()}`,
                type: 'success',
                title: 'Status Updated',
                message: `Item updated to ${newStatus}`,
                timestamp: new Date(),
                duration: 3000
            };
            setNotifications(prev => [notification, ...prev].slice(0, 5));
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const getStationStats = (): Record<StationType, { pending: number; preparing: number; total: number }> => {
        const stats: Record<StationType, { pending: number; preparing: number; total: number }> = {
            grill: { pending: 0, preparing: 0, total: 0 },
            prep: { pending: 0, preparing: 0, total: 0 },
            dessert: { pending: 0, preparing: 0, total: 0 },
            drinks: { pending: 0, preparing: 0, total: 0 },
            plating: { pending: 0, preparing: 0, total: 0 },
        };

        orders.forEach(order => {
            order.items.forEach(item => {
                stats[item.station].total += item.quantity;
                if (item.status === 'pending') stats[item.station].pending += item.quantity;
                if (item.status === 'preparing') stats[item.station].preparing += item.quantity;
            });
        });

        return stats;
    };

    const getOrderTimeline = (order: KDSOrder): TimelineEvent[] => {
        return order.items.map(item => ({
            timestamp: item.timeStarted || order.createdAt,
            status: item.status,
            station: item.station,
            duration: item.estimatedTime
        }));
    };

    if (!mounted || !currentRole) return null;

    const stationStats = getStationStats();
    const firstOrderTimeline = orders.length > 0 ? getOrderTimeline(orders[0]) : [];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral via-background to-neutral/50 text-text-primary">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/3 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-30 px-8 py-6 backdrop-blur-xl border-b transition-all duration-500 ${isRushMode ? 'bg-red-600/10 border-red-500/30' : 'bg-white/60 border-border-subtle'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setIsSideMenuOpen(true)}
                            className="w-12 h-12 rounded-2xl bg-white border border-border-subtle hover:bg-primary hover:text-background text-text-primary p-0 shadow-md transition-all flex items-center justify-center"
                        >
                            <Menu size={20} />
                        </motion.button>

                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-background shadow-lg transition-all ${isRushMode ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}>
                                <ChefHat size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                                    {isRushMode ? 'Rush Protocol Active' : 'Kitchen Display System'}
                                </h1>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">
                                    {isRushMode ? 'SLA Compromise Imminent - Optimize Fulfillment' : 'Advanced Real-time Production Management'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Suggestions HUD */}
                        <div className="hidden xl:flex items-center gap-4 bg-slate-900/5 px-6 py-3 rounded-2xl border border-border-subtle italic">
                            <Zap className="text-primary" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Neural Suggestion:</span>
                            <span className="text-xs font-bold">Batch 3x Margherita Pizzas for Grill Station</span>
                        </div>

                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="px-6 py-3 bg-success text-background rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-success/20"
                            >
                                <CheckCircle2 size={14} className="inline mr-2" />
                                BUMP ALL READY
                            </motion.button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setViewMode('dashboard')}
                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-[0.1em] transition-all border ${viewMode === 'dashboard'
                                    ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white text-text-secondary border-border-subtle hover:border-primary/50'
                                    }`}
                            >
                                <Grid3x3 size={14} className="inline mr-2" />
                                Dashboard
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setViewMode('analytics')}
                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-[0.1em] transition-all border ${viewMode === 'analytics'
                                    ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white text-text-secondary border-border-subtle hover:border-primary/50'
                                    }`}
                            >
                                <TrendingUp size={14} className="inline mr-2" />
                                Analytics
                            </motion.button>
                        </div>

                        {/* Refresh & Status */}
                        <div className="h-8 w-[1px] bg-border-subtle" />
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    // Refresh orders
                                }}
                                className="w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
                            >
                                <RefreshCw size={16} />
                            </motion.button>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs font-black uppercase px-3 py-1">
                                ● Online
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {viewMode === 'dashboard' ? (
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10">
                    {/* Metrics Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <KitchenMetricsHUD metrics={metrics} />
                    </motion.div>

                    {/* Station Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-8 bg-white/60 backdrop-blur-xl border-2 border-border-subtle">
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-6">
                                Select Station
                            </h3>
                            <StationSelector
                                selectedStation={selectedStation}
                                onSelect={setSelectedStation}
                                stationStats={stationStats}
                            />
                        </Card>
                    </motion.div>

                    {/* KitchenDisplaySystem */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-[600px]"
                    >
                        <KitchenDisplaySystem
                            orders={orders}
                            currentStation={selectedStation}
                            onStatusChange={updateOrderItemStatus}
                            isLoading={false}
                        />
                    </motion.div>

                    {/* Station Load Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <StationLoadIndicator stations={stationLoads} />
                    </motion.div>
                </main>
            ) : (
                <main className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10">
                    {/* Analytics Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Timeline */}
                        <div className="lg:col-span-2">
                            <OrderTimeline
                                events={firstOrderTimeline}
                                estimatedCompletionTime={new Date(Date.now() + 10 * 60000)}
                                slaTargetMinutes={30}
                            />
                        </div>

                        {/* KDS Metrics Summary */}
                        <Card className="p-8 bg-white/60 backdrop-blur-xl border-2 border-border-subtle h-fit">
                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-6">
                                Performance Summary
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Active Orders', value: metrics.activeOrders, icon: '🔥' },
                                    { label: 'Pending', value: metrics.pendingOrders, icon: '⏳' },
                                    { label: 'Avg Prep Time', value: `${metrics.averagePrepTime}m`, icon: '⏱️' },
                                    { label: 'SLA Compliance', value: `${metrics.slacompliance}%`, icon: '✓' },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-neutral/30 rounded-2xl"
                                    >
                                        <span className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
                                            {item.label}
                                        </span>
                                        <span className="text-2xl font-black text-primary">{item.value}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Station Load Analysis in Analytics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <StationLoadIndicator stations={stationLoads} />
                    </motion.div>
                </main>
            )}

            {/* Notification Center */}
            <OrderNotificationCenter
                notifications={notifications}
                onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                position="bottom-right"
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 195, 137, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 195, 137, 0.4);
                }
            `}</style>

            <POSSideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
            />
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle, Flame, Bell, ChevronRight,
    UtensilsCrossed, ChefHat, AlertCircle, Timer,
    Package, Users, TrendingUp, Zap, PlayCircle,
    PauseCircle, XCircle, MoreVertical, Search,
    Filter, ArrowLeft, RefreshCw
} from 'lucide-react';

import { useAuth } from '@shared/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { PERMISSION } from '@/utils/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { orderApi } from '@/shared/utils/api';
import { joinRoom, SocketEvents } from '@/shared/utils/socket';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';
import { POSSideMenu } from '@/components/POSSideMenu';
import { DriverCard } from '@/components/DriverCard';
import { useCurrency } from '@shared/contexts/CurrencyContext';

type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED';

interface KitchenOrder {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    createdAt: string;
    prepTime?: number;
    priority?: 'low' | 'medium' | 'high';
    items: {
        quantity: number;
        menuItem: { name: string; notes?: string };
    }[];
}

export default function AdvancedKitchenDisplay() {
    const router = useRouter();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const { currentRole, hasPermission } = usePOS();
    const [mounted, setMounted] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [orders, setOrders] = useState<KitchenOrder[]>([
        {
            id: 'ord-1',
            orderNumber: '699',
            status: 'READY',
            priority: 'medium',
            prepTime: -4,
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            items: [
                { quantity: 1, menuItem: { name: 'Iced Spanish Latte', notes: 'half shot of coffee' } }
            ],
            // @ts-ignore
            isDelivery: true,
            driver: {
                name: "Hadi Jihad Metlej",
                phone: "+961 79 198 059"
            },
            totalLBP: 627000
        },
        {
            id: 'ord-2',
            orderNumber: 'A13',
            status: 'CONFIRMED',
            priority: 'medium',
            prepTime: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            items: [
                { quantity: 1, menuItem: { name: 'Margherita Pizza' } },
                { quantity: 3, menuItem: { name: 'Coke Zero' } }
            ]
        },
        {
            id: 'ord-3',
            orderNumber: 'A14',
            status: 'READY',
            priority: 'low',
            prepTime: 20,
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            items: [
                { quantity: 1, menuItem: { name: 'Grilled Salmon' } }
            ]
        }
    ]);

    const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
    const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);
    const [stats, setStats] = useState({
        activeOrders: 2,
        avgPrepTime: 15,
        completedToday: 42
    });

    useEffect(() => {
        setMounted(true);
        const fetchOrders = async () => {
            try {
                const response = await orderApi.list({ status: 'CONFIRMED,PREPARING,READY' }) as any;
                if (response.orders && response.orders.length > 0) {
                    setOrders(response.orders);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (user && mounted) {
            joinRoom('restaurant_default-restaurant-id');
        }
    }, [user, mounted]);

    useSocketEvent(SocketEvents.ORDER_CREATED, (newOrder: any) => {
        setOrders(prev => [newOrder, ...prev]);
        setNewOrderNotification(newOrder.id);
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) { }
        setTimeout(() => setNewOrderNotification(null), 5000);
    });

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Failed to update order:', error);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const getElapsedTime = (createdAt: string): number => {
        return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    };

    const getPriorityStyle = (priority?: string, elapsed?: number) => {
        if (elapsed && elapsed > 20) return 'bg-red-500 border-red-500 text-background';
        if (priority === 'high') return 'bg-primary border-primary text-background shadow-lg shadow-primary/20';
        return 'bg-neutral border-border-subtle text-text-primary';
    };

    if (!mounted) return null;

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div className="h-screen flex flex-col bg-neutral selection:bg-primary/20 overflow-hidden relative text-text-primary">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="px-10 py-6 bg-white/40 backdrop-blur-2xl border-b border-border-subtle flex items-center justify-between relative z-30">
                <div className="flex items-center gap-8">
                    <Button
                        onClick={() => setIsSideMenuOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary p-0 shadow-sm"
                    >
                        <Menu size={18} />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-xl shadow-primary/20">
                            <ChefHat size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic leading-none mb-1">Kitchen Matrix</h1>
                            <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[8px] opacity-60 italic">Real-time production & sequence tracking</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex gap-8">
                        {[
                            { icon: Flame, value: stats.activeOrders, label: 'Active', color: 'text-primary' },
                            { icon: Timer, value: `${stats.avgPrepTime}m`, label: 'Avg Time', color: 'text-secondary' },
                            { icon: CheckCircle, value: stats.completedToday, label: 'Completed', color: 'text-success' },
                        ].map((s, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center ${s.color} shadow-sm`}>
                                    <s.icon size={18} className={s.label === 'Active' ? 'animate-pulse' : ''} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-text-primary tracking-tighter leading-none">{s.value}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-10 w-[1px] bg-border-subtle opacity-50" />

                    <div className="flex items-center gap-3">
                        <Badge className="bg-success text-background text-[8px] font-black uppercase tracking-widest px-3 py-1">Node Online</Badge>
                        <div className="w-10 h-10 rounded-2xl bg-white border border-border-subtle shadow-sm flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer">
                            <RefreshCw size={18} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Hub */}
            <div className="px-10 py-6 bg-white/20 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between relative z-20">
                <div className="flex items-center gap-6 w-full">
                    {(['CONFIRMED', 'PREPARING', 'READY'] as const).map((status) => {
                        const count = orders.filter(o => o.status === status).length;
                        const isActive = filter === status || (filter === 'ALL' && status === 'CONFIRMED');

                        const iconMap = {
                            'CONFIRMED': { icon: ChevronRight, label: 'NEW', color: 'text-red-500', bg: 'bg-red-50' },
                            'PREPARING': { icon: MoreVertical, label: 'PREPARING', color: 'text-slate-400', bg: 'bg-slate-50' },
                            'READY': { icon: CheckCircle, label: 'READY', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        };
                        const config = iconMap[status];

                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`flex-1 group relative flex flex-col items-center justify-center h-28 rounded-3xl transition-all duration-500 overflow-hidden ${isActive
                                        ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-100 z-10'
                                        : 'bg-slate-100/50 scale-95 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                {isActive && <div className="absolute top-0 inset-x-0 h-1 bg-primary" />}

                                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                    <config.icon size={20} className={config.color} />
                                </div>

                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {config.label}
                                </span>

                                {count > 0 && (
                                    <div className="absolute top-4 right-6 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        {count}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-opacity opacity-40 group-focus-within:opacity-100" size={16} />
                        <input
                            type="text"
                            placeholder="Find Order Hash..."
                            className="h-12 pl-12 pr-6 bg-white border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/10 w-64 transition-all"
                        />
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border-subtle hover:bg-white text-[9px] font-black uppercase tracking-widest">
                        <Filter size={16} className="mr-3" /> PREFERENCES
                    </Button>
                </div>
            </div>

            {/* Grid Operations */}
            <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => {
                            const elapsed = getElapsedTime(order.createdAt);
                            const style = getPriorityStyle(order.priority, elapsed);
                            return (
                                <motion.div
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className={`bg-white rounded-[2.5rem] p-8 border border-border-subtle shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all ${newOrderNotification === order.id ? 'ring-4 ring-primary ring-offset-4' : ''
                                        }`}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${order.priority === 'high' ? 'bg-primary/5' : 'bg-neutral/5'} blur-3xl rounded-full -mr-16 -mt-16`} />

                                    {/* Order ID & Meta */}
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-4xl font-black text-text-primary tracking-tighter italic leading-none">
                                                    #{order.orderNumber}
                                                </h3>
                                                {order.priority === 'high' && <Badge className="bg-red-500 text-background px-2 py-0.5 rounded text-[7px] font-black animate-pulse">URGENT</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-text-secondary opacity-40" />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${elapsed > 15 ? 'text-red-500' : 'text-text-secondary opacity-40'}`}>
                                                    {elapsed}m elapsed
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={`${style} border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full`}>
                                            {order.status}
                                        </Badge>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-4 mb-10 relative z-10">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-neutral/30 rounded-2xl group/item hover:bg-neutral transition-colors">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary font-black text-sm shadow-sm group-hover/item:scale-110 transition-transform">
                                                    {item.quantity}x
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <p className="text-[11px] font-black text-text-primary uppercase tracking-wider leading-tight">{item.menuItem.name}</p>
                                                    {item.menuItem.notes && (
                                                        <div className="flex items-center gap-1.5 mt-2 text-red-500">
                                                            <AlertCircle size={10} />
                                                            <p className="text-[8px] font-black uppercase tracking-widest italic">{item.menuItem.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tactical Actions */}
                                    <PermissionGuard require={PERMISSION.KITCHEN_UPDATE_STATUS}>
                                        <div className="relative z-10">
                                            {/* Delivery Driver Info */}
                                            {(order as any).isDelivery && (
                                                <div className="mb-6 pt-6 border-t border-slate-100">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">En route to customers</span>
                                                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            {order.prepTime && order.prepTime < 0 ? `${Math.abs(order.prepTime)} min early` : 'On time'}
                                                        </span>
                                                    </div>
                                                    <DriverCard
                                                        name={(order as any).driver?.name}
                                                        phone={(order as any).driver?.phone}
                                                    />
                                                </div>
                                            )}

                                            {/* Currency Footer for Receipt View */}
                                            {(order as any).totalLBP && (
                                                <div className="flex items-center justify-between py-4 px-6 bg-slate-50 rounded-2xl mb-6">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement</span>
                                                    <span className="text-sm font-black text-slate-900">LBP {(order as any).totalLBP.toLocaleString()}</span>
                                                </div>
                                            )}

                                            {order.status === 'CONFIRMED' && (
                                                <Button
                                                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                                    className="w-full h-16 bg-primary text-background hover:scale-[1.02] active:scale-[0.98] font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all"
                                                >
                                                    <PlayCircle size={18} className="mr-3" />
                                                    INITIATE PREP
                                                </Button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <Button
                                                    onClick={() => updateOrderStatus(order.id, 'READY')}
                                                    className="w-full h-16 bg-success text-background hover:scale-[1.02] active:scale-[0.98] font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl shadow-xl shadow-success/20 transition-all"
                                                >
                                                    <CheckCircle size={18} className="mr-3" />
                                                    MARK AS READY
                                                </Button>
                                            )}
                                            {order.status === 'READY' && (
                                                <Button
                                                    onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                                    className="w-full h-16 bg-neutral text-text-primary hover:bg-neutral-dark font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all"
                                                >
                                                    <Zap size={18} className="mr-3 text-primary" />
                                                    FINALIZE ORDER
                                                </Button>
                                            )}
                                        </div>
                                    </PermissionGuard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-neutral rounded-full flex items-center justify-center text-text-secondary opacity-10 mb-6">
                            <UtensilsCrossed size={48} />
                        </div>
                        <h4 className="text-xl font-black text-text-secondary uppercase tracking-[0.4em] opacity-40">Static Production</h4>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-20 mt-2">Awaiting new order anchors from terminal node</p>
                    </div>
                )}
            </main>

            {/* Notification Hud */}
            <AnimatePresence>
                {newOrderNotification && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 right-10 bg-primary text-background p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center gap-6 z-50 border border-white/10"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Bell size={32} className="animate-bounce" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Inbound Event</h4>
                            <p className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">New Order Anchored</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 10px;
                }
            `}</style>
            <POSSideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
            />
        </div>
    );
}

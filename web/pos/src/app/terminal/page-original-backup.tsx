"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Filter, CheckCircle2, Utensils, ShoppingBag,
    Truck, Star, ChefHat, Flame, Clock, DollarSign, Users,
    TrendingUp, AlertCircle, Zap, BarChart3, Package, Menu
} from 'lucide-react';

import { POSSideMenu } from '@/components/POSSideMenu';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@shared/contexts/AuthContext';
import { POS_ROLE, PERMISSION, getRoleLabel, getRoleColor } from '@/utils/permissions';
import { PermissionGuard, RoleGuard } from '@/components/PermissionGuard';
import { restaurantApi } from '@/shared/utils/api';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { OrderSummary } from '@/components/OrderSummary';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useIntelligence } from '@shared/hooks/useIntelligence';
import { NeuralUpsellHUD } from '@shared/components/NeuralUpsellHUD';
import { IncomingOrderHUD } from '@/components/IncomingOrderHUD';

export default function AdvancedTerminal() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { branchId, isOnline, currentRole, hasPermission } = usePOS();
    const [mounted, setMounted] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if no role set
    useEffect(() => {
        if (!authLoading && !currentRole) {
            router.push('/auth/terminal-pin');
        }
    }, [currentRole, authLoading, router]);

    // Sales State
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [menu, setMenu] = useState<any[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');

    // Intelligence Integration
    const { data: intelligence, isAnalyzing: isAIAnalyzing, analyze: runIntelligence, reportOutcome } = useIntelligence();
    const lastAnalysisRef = useRef<number>(0);

    // Role-specific dashboard stats
    const [stats, setStats] = useState({
        todaySales: 4250.50,
        ordersToday: 42,
        avgOrderValue: 101.20,
        pendingOrders: 8,
        activeKitchen: 5,
        cashOnHand: 1250.00
    });

    const hardwareStatus = {
        paperLevel: 'HIGH',
        connection: 'ONLINE'
    };

    // Fetch menu
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchMenu = async () => {
            try {
                const { restaurants } = (await restaurantApi.list() as any);
                if (restaurants && restaurants.length > 0) {
                    const firstRestaurant = restaurants[0];
                    setMenu(firstRestaurant.menuItems || []);
                }
            } catch (error) {
                console.error('Failed to fetch menu:', error);
                // Fallback mock menu
                setMenu([
                    { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 12.99, image: '🍕' },
                    { id: 2, name: 'Caesar Salad', category: 'Salads', price: 8.99, image: '🥗' },
                    { id: 3, name: 'Beef Burger', category: 'Burgers', price: 14.99, image: '🍔' },
                    { id: 4, name: 'Grilled Salmon', category: 'Seafood', price: 22.99, image: '🐟' },
                    { id: 5, name: 'Pasta Carbonara', category: 'Pasta', price: 16.99, image: '🍝' },
                ]);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        fetchMenu();
    }, [user, authLoading, router]);

    const categories = ['All', ...Array.from(new Set(menu.map((m: any) => m.category)))];

    const filteredMenu = menu.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // Trigger AI Intelligence on cart changes (debounced)
    useEffect(() => {
        if (cart.length === 0) return;

        const timer = setTimeout(() => {
            const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
            runIntelligence({
                amount: total,
                currency: 'USD',
                userId: user?.id || 'anonymous',
                userAgeDays: 0,
                txnHistoryCount: 0,
                ipCountry: 'Local',
                billingCountry: 'Local',
                items: cart
            }, {
                role: 'vendor',
                system_state: 'pos',
                urgency_level: 8,
                emotional_signals: hardwareStatus.paperLevel === 'LOW' ? ['operational_stress'] : [],
            } as any);
        }, 1000);

        return () => clearTimeout(timer);
    }, [cart, user, runIntelligence, hardwareStatus]);

    // Handle high-risk transaction guard
    const executeSecurePayment = async (method: string) => {
        if (intelligence?.data?.decision === 'REJECT') {
            alert(`🚨 SECURITY PROTOCOL: This transaction has been REJECTED by the Risk Agent. Reason: ${intelligence.data.concerns[0]}`);
            return;
        }

        if (intelligence?.data?.risk_level === 'HIGH') {
            const confirmed = window.confirm(`⚠️ HIGH RISK DETECTED: ${intelligence.data.concerns[0]}. Proceed with Manager Override?`);
            if (!confirmed) return;
        }

        handleCheckout(method);
        if (intelligence?.request_id) {
            reportOutcome(intelligence.request_id, 'SUCCESS');
        }
    };
    const updateCartQty = (itemId: number | string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const clearCart = () => setCart([]);

    const handleCheckout = (method: string) => {
        router.push('/terminal/payment');
    };

    if (!mounted || !currentRole) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-neutral text-text-primary overflow-hidden relative selection:bg-primary/20">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Ultra-Premium Header */}
            <div className="h-20 bg-white/40 backdrop-blur-2xl border-b border-border-subtle flex items-center justify-between px-8 shrink-0 relative z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            onClick={() => setIsSideMenuOpen(true)}
                            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-2xl shadow-primary/20 cursor-pointer"
                        >
                            <Menu size={24} />
                        </motion.button>
                        <div>
                            <h1 className="text-xl font-black text-text-primary leading-none tracking-tighter uppercase italic">Institutional Terminal</h1>
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em] mt-1.5 opacity-60">
                                Operator: {sessionStorage.getItem('pos_current_user') || 'Authorized User'}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${getRoleColor(currentRole)} px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border-none shadow-lg shadow-current/10`}>
                        {getRoleLabel(currentRole)}
                    </Badge>
                </div>

                {/* Quick Stats Bar */}
                <div className="flex items-center gap-8">
                    <PermissionGuard require={PERMISSION.ANALYTICS_VIEW}>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Session Volume</span>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-success" />
                                <span className="font-black text-text-primary text-sm tracking-tight">${stats.todaySales.toLocaleString()}</span>
                            </div>
                        </div>
                    </PermissionGuard>

                    <PermissionGuard require={PERMISSION.KITCHEN_VIEW_ORDERS}>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Kitchen Load</span>
                            <div className="flex items-center gap-2">
                                <Flame size={14} className="text-secondary" />
                                <span className="font-black text-text-primary text-sm tracking-tight">{stats.activeKitchen} Ops</span>
                            </div>
                        </div>
                    </PermissionGuard>

                    <div className="h-10 w-[1px] bg-border-subtle" />
                    <OfflineIndicator />
                </div>
            </div>

            {/* Main Content Area - Role-Adaptive Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* Product Grid - Only for roles with sales permission */}
                <PermissionGuard
                    require={PERMISSION.SALES_CREATE}
                    fallback={
                        <div className="flex-1 flex items-center justify-center bg-background-subtle">
                            <Card className="p-8 text-center max-w-md bg-background-card border border-border-subtle">
                                <AlertCircle size={48} className="text-text-muted mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-black text-text-main mb-2">Sales Access Required</h3>
                                <p className="text-sm text-text-muted">
                                    Your role ({getRoleLabel(currentRole)}) does not have permission to create sales.
                                </p>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <PermissionGuard require={PERMISSION.KITCHEN_VIEW_ORDERS}>
                                        <Button onClick={() => router.push('/terminal/kitchen')} variant="outline">
                                            Kitchen Orders
                                        </Button>
                                    </PermissionGuard>
                                    <PermissionGuard require={PERMISSION.LEDGER_VIEW}>
                                        <Button onClick={() => router.push('/terminal/ledger')} variant="outline">
                                            View Ledger
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            </Card>
                        </div>
                    }
                >
                    <div className="flex-1 flex flex-col overflow-hidden bg-neutral/10 relative z-10">
                        {/* Search & Filter Bar */}
                        <div className="px-4 md:px-8 py-4 md:py-6 bg-white/40 backdrop-blur-xl border-b border-border-subtle shrink-0">
                            <div className="flex gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Identify resource..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 md:h-14 pl-12 pr-6 bg-white border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs md:text-sm font-black uppercase tracking-widest placeholder:text-text-muted/50 shadow-sm"
                                    />
                                </div>
                                <Button className="w-12 md:w-14 h-12 md:h-14 p-0 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary shadow-sm lg:hidden" onClick={() => {/* Focus Cart on Mobile */ }}>
                                    <ShoppingBag size={20} />
                                </Button>
                            </div>

                            {/* Category Pills */}
                            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat
                                            ? 'bg-primary text-background shadow-primary/20'
                                            : 'bg-white text-text-secondary hover:bg-neutral border border-border-subtle'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                                {filteredMenu.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-white border border-border-subtle rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 text-left hover:shadow-2xl hover:shadow-primary/5 transition-all group min-h-[140px] md:min-h-[160px] flex flex-col justify-between hover:border-primary/50 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-20 md:w-24 h-20 md:h-24 bg-primary/5 blur-3xl rounded-full -mr-10 md:-mr-12 -mt-10 md:-mt-12 group-hover:bg-primary/10 transition-colors" />
                                        <div className="text-3xl md:text-4xl mb-3 md:mb-4 flex-shrink-0 relative z-10">{item.image || '🍽️'}</div>
                                        <div className="relative z-10">
                                            <h4 className="font-black text-text-primary mb-1 md:mb-2 text-[9px] md:text-[10px] uppercase tracking-widest leading-tight line-clamp-2">{item.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-primary text-xs md:text-sm italic tracking-tighter">${item.price}</span>
                                                <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg md:rounded-xl bg-neutral group-hover:bg-primary group-hover:text-background transition-colors flex items-center justify-center">
                                                    <Plus size={14} className="md:size-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </PermissionGuard>

                {/* Cart Panel */}
                <PermissionGuard require={PERMISSION.SALES_CREATE}>
                    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[450px] lg:relative bg-white border-l border-border-subtle flex flex-col shadow-2xl transition-transform lg:translate-x-0 translate-x-full lg:z-20 z-50">
                        <div className="p-8 border-b border-border-subtle bg-white/50 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Active Manifest</h3>
                                <Badge className="bg-neutral text-text-secondary text-[8px] font-black uppercase tracking-widest px-3 py-1">Order #8492</Badge>
                            </div>
                            <div className="flex gap-2">
                                {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setOrderType(type)}
                                        className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${orderType === type
                                            ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white text-text-secondary border-border-subtle hover:bg-neutral'
                                            }`}
                                    >
                                        {type.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neutral/10">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-neutral rounded-full flex items-center justify-center mb-6 opacity-40">
                                        <ShoppingBag size={32} className="text-text-secondary" />
                                    </div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] opacity-40">Manifest Empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {cart.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] border border-border-subtle shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{item.image || '🍽️'}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-black text-text-primary text-[10px] uppercase tracking-widest truncate mb-1">{item.name}</h5>
                                                    <p className="font-black text-primary text-xs italic tracking-tighter">${item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-3 bg-neutral p-1 rounded-xl">
                                                    <button
                                                        onClick={() => updateCartQty(item.id, -1)}
                                                        className="w-8 h-8 rounded-lg bg-white border border-border-subtle flex items-center justify-center text-text-primary hover:bg-neutral-dark hover:text-white transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-6 text-center text-[10px] font-black text-text-primary">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateCartQty(item.id, 1)}
                                                        className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary & Checkout */}
                        {cart.length > 0 && (
                            <div className="p-8 border-t border-border-subtle space-y-6 bg-white shrink-0">
                                {/* Neural Intelligence HUD */}
                                <NeuralUpsellHUD data={intelligence} isAnalyzing={isAIAnalyzing} />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Protocol Fee</span>
                                        <span className="font-black text-text-primary text-xs italic">$0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-neutral/30 p-6 rounded-3xl">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] mb-1">Settlement Asset</span>
                                            <span className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Total Value</span>
                                        </div>
                                        <span className="font-black text-primary text-4xl italic tracking-tighter">
                                            ${cart.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={clearCart}
                                        variant="outline"
                                        className="h-16 rounded-2xl border-border-subtle hover:bg-neutral text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100"
                                    >
                                        Void Manifest
                                    </Button>
                                    <Button
                                        onClick={() => executeSecurePayment('cash')}
                                        className="h-16 bg-primary hover:scale-[1.02] active:scale-[0.98] text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20"
                                    >
                                        Execute Payment
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </PermissionGuard>
            </div>
            <IncomingOrderHUD />
            <POSSideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
            />
        </div>
    );
}

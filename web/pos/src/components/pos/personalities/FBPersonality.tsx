"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Search, Layers, Trash2, ArrowRight, Menu, Activity, Globe, Shield } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { getTableManager } from '@/lib/restaurant/TableManager';
import { getKitchenCoordinationSystem } from '@/lib/restaurant/KitchenCoordinationSystem';
import { useAuth } from '@shared/contexts/AuthContext';
import { PERMISSION } from '@/utils/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { POSSideMenu } from '@/components/POSSideMenu';
import { IncomingOrderHUD } from '@/components/IncomingOrderHUD';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { eventBus } from '@/lib/core/EventBus';
import { productInventoryEngine, Product } from '@/lib/core/ProductInventoryEngine';
import { POSButton } from '../POSButton';
import { POSCard } from '../POSCard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export function FBPersonality() {
    const { user } = useAuth();
    const { branchId, currentRole, personality, engines } = usePOS();
    const router = useRouter();
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [menu, setMenu] = useState<Product[]>([]);
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');

    useEffect(() => {
        // Synchronize local cart with POSEngine transaction
        const syncCart = () => {
            const txn = engines.posEngine?.getCurrentTransaction();
            if (txn) {
                const mappedItems = txn.items.map(item => ({
                    id: item.productId,
                    name: item.metadata.productName,
                    price: item.unitPrice,
                    image: '🍽️', // Fallback for now
                    qty: item.quantity
                }));
                setCart(mappedItems);
            } else {
                setCart([]);
            }
        };

        syncCart();
        const subId = eventBus.subscribe('TRANSACTION_ITEM_ADDED', syncCart);
        return () => {
            eventBus.unsubscribe(subId);
        };
    }, [engines.posEngine]);

    useEffect(() => {
        const loadProducts = () => {
            const products = productInventoryEngine.searchProducts();
            setMenu(products);
        };

        loadProducts();

        // Subscribe to product sync events
        const subId = eventBus.subscribe('PRODUCTS_SYNCED', () => {
            loadProducts();
        });

        return () => {
            eventBus.unsubscribe(subId);
        };
    }, []);

    const categories = ['All', ...Array.from(new Set(menu.map((m) => m.category)))];
    const filteredMenu = menu.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = async (item: Product) => {
        if (!engines.posEngine) return;

        try {
            // Start transaction if not exists
            if (!engines.posEngine.getCurrentTransaction()) {
                await engines.posEngine.startTransaction('sale');
            }

            // Add item to engine
            await engines.posEngine.addItem(item.id, 1, item.variants[0]?.id);

            eventBus.publish({
                type: 'PRODUCT_ADDED',
                payload: { item },
                metadata: {
                    source: 'FB_UI'
                }
            });
        } catch (error) {
            console.error('Failed to add item to POS Engine:', error);
        }
    };

    const updateCartQty = async (itemId: string, delta: number) => {
        if (!engines.posEngine) return;
        
        const txn = engines.posEngine.getCurrentTransaction();
        if (!txn) return;

        const item = txn.items.find((i: any) => i.productId === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        
        try {
            if (newQty <= 0) {
                await engines.posEngine.removeItem(itemId);
            } else {
                await engines.posEngine.updateItemQuantity(itemId, newQty);
            }
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <ErrorBoundary context="F&B Personality">
            <div className="min-h-screen bg-[var(--pos-bg-primary)] text-[var(--pos-text-primary)] flex flex-col overflow-hidden combat-bg">
            {/* HUD Header */}
            <header className="sticky top-0 z-40 bg-[var(--pos-bg-secondary)] border-b border-[var(--pos-border-subtle)] h-24 shadow-[var(--pos-shadow-lg)]">
                <div className="h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <POSButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsSideMenuOpen(true)}
                            className="w-14 h-14"
                        >
                            <Menu size={24} />
                        </POSButton>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black uppercase tracking-tighter">NileLink POS</h1>
                                <Badge className="pos-badge pos-badge-success">F&B MODE</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Activity size={10} className="text-[var(--pos-success)] animate-pulse" />
                                <p className="text-[10px] font-bold text-[var(--pos-text-muted)] uppercase tracking-widest">
                                    Branch: {branchId}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <OfflineIndicator />
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-[var(--pos-accent)] tracking-tighter italic leading-none">$4,250.50</span>
                            <span className="text-[8px] text-[var(--pos-text-muted)] font-black uppercase tracking-widest mt-1">Shift Volume</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Menu Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Category Nav - Large Targets */}
                    <div className="px-8 py-6 border-b border-[var(--pos-border-subtle)]">
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <POSButton
                                    key={cat}
                                    variant={selectedCategory === cat ? "primary" : "secondary"}
                                    size="md"
                                    onClick={() => setSelectedCategory(cat)}
                                    className="whitespace-nowrap px-10"
                                >
                                    {cat}
                                </POSButton>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            <AnimatePresence>
                                {filteredMenu.map((item) => (
                                    <POSCard
                                        key={item.id}
                                        variant="interactive"
                                        padding="lg"
                                        onClick={() => addToCart(item)}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div className="text-5xl mb-6">{item.images[0] || '🍽️'}</div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-tight line-clamp-2 mb-4">{item.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-[var(--pos-accent)] text-xl italic">${item.variants[0]?.price || 0}</span>
                                                <div className="w-10 h-10 rounded-lg bg-[var(--pos-bg-surface)] border border-[var(--pos-border-strong)] flex items-center justify-center">
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </POSCard>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Secure Engagement Panel (Cart) */}
                <aside className="w-full md:w-[450px] lg:w-[500px] flex flex-col bg-[var(--pos-bg-secondary)] border-l border-[var(--pos-border-subtle)] shadow-[var(--pos-shadow-lg)] z-30">
                    <div className="p-8 border-b border-[var(--pos-border-subtle)]">
                        <h3 className="text-xl font-black uppercase tracking-tight">Active Ledger</h3>
                        <div className="flex gap-3 mt-6 p-1 bg-[var(--pos-bg-primary)] rounded-xl border border-[var(--pos-border-subtle)]">
                            {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                                <POSButton
                                    key={type}
                                    variant={orderType === type ? "primary" : "ghost"}
                                    size="sm"
                                    onClick={() => setOrderType(type)}
                                    className="flex-1 h-12"
                                >
                                    {type}
                                </POSButton>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                        <AnimatePresence initial={false}>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-4 p-4 combat-glass rounded-xl border border-[var(--pos-border-subtle)]"
                                >
                                    <div className="text-3xl">{item.image}</div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-xs uppercase tracking-tight">{item.name}</h5>
                                        <p className="font-black text-[var(--pos-accent)] text-lg italic mt-1">${(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <POSButton variant="secondary" size="sm" onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 px-0 text-xl">−</POSButton>
                                        <span className="font-black w-4 text-center">{item.qty}</span>
                                        <POSButton variant="secondary" size="sm" onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 px-0 text-xl">+</POSButton>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 border-t border-[var(--pos-border-subtle)] bg-[var(--pos-bg-tertiary)] space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Grand Total</span>
                            <span className="text-4xl font-black text-[var(--pos-text-primary)] italic">${cartTotal.toFixed(2)}</span>
                        </div>
                        <POSButton 
                            variant="primary" 
                            size="xl" 
                            fullWidth 
                            className="shadow-2xl h-20 text-lg font-black uppercase tracking-widest"
                            disabled={cart.length === 0}
                            onClick={() => router.push('/terminal/payment')}
                        >
                            INITIATE CHECKOUT
                            <ArrowRight size={24} className="ml-4" />
                        </POSButton>
                    </div>
                </aside>
            </div>

            <IncomingOrderHUD />
            <POSSideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
            </div>
        </ErrorBoundary>
    );
}

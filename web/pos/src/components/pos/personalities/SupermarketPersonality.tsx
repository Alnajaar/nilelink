"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    BarChart3,
    ShieldAlert,
    Activity,
    Settings,
    LayoutGrid,
    Package,
    Camera,
    Scale,
    AlertTriangle,
    Lock,
    Trash2
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { getConcurrentTransactionManager } from '@/lib/core/ConcurrentTransactionManager';
import { getBarcodeScannerService, BarcodeScanResult } from '@/lib/hardware/BarcodeScannerService';
import { eventBus } from '@/lib/core/EventBus';
import { productInventoryEngine } from '@/lib/core/ProductInventoryEngine';
import { POSButton } from '../POSButton';
import { POSCard } from '../POSCard';
import { InventoryGrid } from '../inventory/InventoryGrid';
import { ManagerHUD } from '../analytics/ManagerHUD';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export function SupermarketPersonality() {
    const { branchId, engines } = usePOS();
    const router = useRouter();
    const [view, setView] = useState<'checkout' | 'manager'>('checkout');
    const [cart, setCart] = useState<any[]>([]);
    const [scanBuffer, setScanBuffer] = useState('');
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Synchronize local cart with POSEngine transaction
    useEffect(() => {
        const syncCart = () => {
            const txn = engines.posEngine?.getCurrentTransaction();
            if (txn) {
                const mappedItems = txn.items.map(item => ({
                    id: item.productId,
                    sku: item.metadata.variantName || item.productId,
                    name: item.metadata.productName,
                    price: item.unitPrice,
                    weight: item.metadata.weight || '0.000',
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

    // Auto-focus on scan field
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.activeElement?.tagName !== 'INPUT' && view === 'checkout') {
                scanInputRef.current?.focus();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [view]);

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

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanBuffer || !engines.posEngine) return;

        const products = productInventoryEngine.searchProducts({ searchTerm: scanBuffer, limit: 1 });
        const product = products[0];

        if (product) {
            try {
                if (!engines.posEngine.getCurrentTransaction()) {
                    await engines.posEngine.startTransaction('sale');
                }

                await engines.posEngine.addItem(product.id, 1, product.variants[0]?.id);

                eventBus.publish({
                    type: 'PRODUCT_SCANNED',
                    payload: { product, sku: scanBuffer },
                    metadata: {
                        source: 'SUPERMARKET_UI'
                    }
                });
            } catch (error) {
                console.error('Supermarket scan failed:', error);
            }
        } else {
            console.warn(`Product ${scanBuffer} not found in Supermarket database`);
        }

        setScanBuffer('');
    };

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.qty, 0);

    if (view === 'manager') {
        return (
            <ErrorBoundary context="Manager HUD">
                <div className="min-h-screen bg-[var(--pos-bg-primary)] flex flex-col">
                    <header className="h-16 border-b border-[var(--pos-border-subtle)] bg-[var(--pos-bg-secondary)] flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="text-[var(--pos-accent)]" />
                        <h1 className="font-black uppercase tracking-tighter">Manager Mode</h1>
                    </div>
                    <POSButton variant="secondary" size="sm" onClick={() => setView('checkout')}>
                        RETURN TO CHECKOUT
                    </POSButton>
                    </header>
                    <div className="flex-1 overflow-auto">
                        <ManagerHUD />
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary context="Supermarket Personality">
            <div className="min-h-screen bg-[var(--pos-bg-primary)] text-[var(--pos-text-primary)] flex flex-col overflow-hidden combat-bg font-mono">
            {/* Ultra-High Contrast Supermarket Header */}
            <header className="h-24 bg-black border-b border-[var(--pos-accent)]/30 flex items-center justify-between px-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-white italic tracking-tighter leading-none">SUPER-NODE</h1>
                        <span className="text-[8px] font-black text-[var(--pos-accent)] uppercase tracking-[0.5em] mt-1">{`S7 // ${branchId} // v5.2`}</span>
                    </div>

                    <form onSubmit={handleScan} className="relative w-[500px]">
                        <input
                            ref={scanInputRef}
                            type="text"
                            placeholder="SCAN ITEM OR ENTER CODE..."
                            value={scanBuffer}
                            onChange={(e) => setScanBuffer(e.target.value)}
                            className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-xl px-12 text-white font-black tracking-widest uppercase focus:border-[var(--pos-accent)] transition-all placeholder:text-white/10"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <Camera className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pos-accent)] animate-pulse" size={20} />
                    </form>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--pos-success)] animate-pulse"></span>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest italic">Live Ledger</span>
                        </div>
                        <div className="text-4xl font-black text-[var(--pos-accent)] italic">${cartTotal.toFixed(2)}</div>
                    </div>
                    <POSButton 
                        variant="accent" 
                        size="lg" 
                        className="h-16 px-12 text-xl italic font-black uppercase" 
                        disabled={cart.length === 0}
                        onClick={() => router.push('/terminal/payment')}
                    >
                        CHARGE [F12]
                    </POSButton>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Scan Area */}
                <main className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        {cart.map((item) => (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                key={item.id}
                            >
                                <POSCard variant="interactive" padding="sm" className="grid grid-cols-12 items-center gap-4 bg-white/5 border-white/10 hover:border-[var(--pos-accent)]/50 transition-all">
                                    <div className="col-span-1 flex justify-center">
                                        <div className="w-10 h-10 bg-black rounded flex items-center justify-center border border-white/5">
                                            <Package className="text-white/20" size={16} />
                                        </div>
                                    </div>
                                    <div className="col-span-5">
                                        <div className="text-sm font-black text-white uppercase truncate">{item.name}</div>
                                        <div className="text-[9px] text-white/40 font-mono mt-1">{item.sku}</div>
                                    </div>
                                    <div className="col-span-2 flex flex-col items-center">
                                        <span className="text-[8px] font-black text-white/20 mb-1">QUANTITY</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">-</button>
                                            <span className="text-sm font-black text-white">{item.qty}</span>
                                            <button onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">+</button>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center text-sm font-black text-white italic">${item.price}</div>
                                    <div className="col-span-1 flex justify-end pr-4 gap-4">
                                        <div className="text-xl font-black text-[var(--pos-accent)]">${(item.price * item.qty).toFixed(2)}</div>
                                        <button 
                                            onClick={() => engines.posEngine?.removeItem(item.id)}
                                            className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </POSCard>
                            </motion.div>
                        ))}
                    </div>

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <ShoppingCart size={120} />
                            <h2 className="text-2xl font-black uppercase tracking-[0.5em] mt-8 italic">Ready for Input</h2>
                        </div>
                    )}
                </main>

                {/* Industrial Sidebar */}
                <aside className="w-[380px] border-l border-white/10 bg-black flex flex-col">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex gap-4">
                            <POSButton variant="secondary" size="md" fullWidth className="h-20 flex-col gap-2" onClick={() => setView('manager')}>
                                <ShieldAlert size={18} />
                                <span className="text-[9px] font-black">MANAGER</span>
                            </POSButton>
                            <POSButton variant="destructive" size="md" fullWidth className="h-20 flex-col gap-2">
                                <Lock size={18} />
                                <span className="text-[9px] font-black">VOID ALL</span>
                            </POSButton>
                        </div>
                    </div>

                    <div className="flex-1">
                        <InventoryGrid />
                    </div>

                    <div className="p-6 bg-[var(--pos-bg-tertiary)] grid grid-cols-2 gap-4 border-t border-white/10">
                        <div className="p-3 bg-black/20 rounded border border-white/5">
                            <span className="text-[8px] font-black text-white/30 block mb-2 uppercase">Transactions</span>
                            <div className="text-lg font-black text-white italic">432</div>
                        </div>
                        <div className="p-3 bg-black/20 rounded border border-white/5">
                            <span className="text-[8px] font-black text-white/30 block mb-2 uppercase">Daily Goal</span>
                            <div className="text-lg font-black text-[var(--pos-success)] italic">84%</div>
                        </div>
                    </div>
                </aside>
            </div>
            </div>
        </ErrorBoundary>
    );
}

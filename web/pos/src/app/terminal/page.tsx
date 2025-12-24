"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Zap,
    Package,
    History,
    Grid,
    Wifi,
    WifiOff,
    Database,
    ArrowLeft
} from 'lucide-react';

import { usePOS } from '@/contexts/POSContext';
import { EventType, EconomicEvent } from '@/lib/events/types';

export default function SalesTerminal() {
    const {
        eventEngine,
        localLedger,
        recipeEngine,
        journalEngine,
        reputationEngine,
        isOnline,
        unsyncedCount,
        deviceId,
        branchId
    } = usePOS();

    const [cart, setCart] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const menu = [
        { id: 1, name: 'Burger Classic', price: 12.0, category: 'Main', icon: '🍔' },
        { id: 2, name: 'Truffle Fries', price: 6.5, category: 'Sides', icon: '🍟' },
        { id: 3, name: 'Cairo Special Pizza', price: 18.0, category: 'Main', icon: '🍕' },
        { id: 4, name: 'Iced Latte', price: 4.5, category: 'Drinks', icon: '☕' },
        { id: 5, name: 'Lava Cake', price: 9.0, category: 'Dessert', icon: '🍰' },
        { id: 6, name: 'Falafel Wrap', price: 7.5, category: 'Main', icon: '🌯' },
    ];

    const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];

    const addToCart = (item: any) => {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (itemId: number) => {
        const existing = cart.find(i => i.id === itemId);
        if (existing && existing.qty > 1) {
            setCart(cart.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i));
        } else {
            setCart(cart.filter(i => i.id !== itemId));
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
        if (cart.length === 0 || !eventEngine || !localLedger) return;

        try {
            const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const actorId = 'staff-default';

            // 1. Anchor Order Created
            const orderCreated = await eventEngine.createEvent(
                EventType.ORDER_CREATED,
                actorId,
                { orderId, orderType: 'dine-in' }
            );
            await localLedger.insertEvent(orderCreated);
            if (journalEngine) await journalEngine.processEvent(orderCreated);

            // 2. Process Items (Add + Inventory Deduction)
            for (const item of cart) {
                const itemAdded = await eventEngine.createEvent(
                    EventType.ORDER_ITEM_ADDED,
                    actorId,
                    {
                        orderId,
                        menuItemId: item.id.toString(),
                        menuItemName: item.name,
                        quantity: item.qty,
                        unitPrice: item.price,
                    }
                );
                await localLedger.insertEvent(itemAdded);

                if (recipeEngine) {
                    try {
                        const deductions = recipeEngine.deductForSale(item.id.toString(), item.qty, branchId);
                        for (const d of deductions) {
                            const invEvent = await eventEngine.createEvent(
                                EventType.INVENTORY_DEDUCTED,
                                actorId,
                                {
                                    ingredientId: d.ingredientId,
                                    ingredientName: d.ingredientName,
                                    quantity: d.deducted,
                                    unit: d.unit as any,
                                    reason: 'sale',
                                    relatedOrderId: orderId
                                }
                            );
                            await localLedger.insertEvent(invEvent);
                            if (journalEngine) await journalEngine.processEvent(invEvent);
                        }
                    } catch (e) {
                        console.warn(`No recipe found for ${item.name}, skipping inventory anchor.`);
                    }
                }
            }

            // 3. Anchor Payment
            const finalEventType = paymentMethod === 'cash' ? EventType.PAYMENT_COLLECTED_CASH : EventType.PAYMENT_COLLECTED_CARD;
            const paymentPayload: any = {
                orderId,
                amount: total,
                currency: 'USD',
            };

            if (paymentMethod === 'cash') {
                paymentPayload.amountTendered = total;
                paymentPayload.changeGiven = 0;
                paymentPayload.cashierId = actorId;
            } else {
                paymentPayload.cardType = 'visa';
                paymentPayload.last4Digits = '4242';
                paymentPayload.transactionId = `tx-${Date.now()}`;
                paymentPayload.providerFee = total * 0.02;
            }

            const paymentEvent = await eventEngine.createEvent(
                finalEventType,
                actorId,
                paymentPayload
            );
            await localLedger.insertEvent(paymentEvent);
            if (journalEngine) await journalEngine.processEvent(paymentEvent);

            setCart([]);
            alert('Protocol Anchored: Order Settlement Complete');
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Protocol Error: Could not anchor event.');
        }
    };

    return (
        <div className="h-screen flex flex-col relative text-white selection:bg-emerald-500/30 overflow-hidden font-sans">
            <div className="mesh-bg" />

            {/* Premium Status Bar */}
            <header className="h-20 glass-v2 border-b border-white/5 flex items-center justify-between px-10 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black italic tracking-tighter nile-text-gradient uppercase leading-none">Nile Terminal</h1>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">Node: {deviceId || 'Cairo-ST-01'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-6 px-6 py-2 rounded-full glass-v2 border-white/5">
                        <div className="flex items-center gap-2">
                            {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-red-400" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                                {isOnline ? 'Network Live' : 'Offline Mode'}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2 text-white/30">
                            <Database size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{unsyncedCount} Queued Events</span>
                        </div>
                    </div>
                    <button className="w-12 h-12 rounded-2xl glass-v2 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <History size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl glass-v2 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Grid size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative z-10">
                {/* Product Area */}
                <div className="flex-1 flex flex-col p-10 overflow-hidden">
                    {/* Categories */}
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'glass-v2 text-white/40 hover:bg-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {menu.filter(m => selectedCategory === 'All' || m.category === selectedCategory).map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => addToCart(item)}
                                    className="p-8 rounded-[2.5rem] glass-v2 flex flex-col gap-6 active:scale-95 transition-all cursor-pointer group hover:border-emerald-500/30"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-black border border-white/5 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">{item.name}</h3>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{item.category}</p>
                                    </div>
                                    <div className="mt-auto flex justify-between items-center">
                                        <span className="text-2xl font-black italic text-white/80">${item.price.toFixed(2)}</span>
                                        <div className="w-10 h-10 rounded-xl glass-v2 flex items-center justify-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <Plus size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Cart Area */}
                <div className="w-[450px] glass-v2 border-l border-white/5 flex flex-col relative overflow-hidden">
                    <div className="p-10 flex flex-col h-full bg-black/20">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter nile-text-gradient">Active Cart</h2>
                            <button onClick={() => setCart([])} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-red-400 transition-colors">Clear</button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20">
                                    <Package size={64} className="mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Payload Empty</p>
                                </div>
                            ) : (
                                cart.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-6 p-6 rounded-3xl glass-v2 border-white/5 group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-2xl">{item.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white uppercase italic tracking-tighter truncate">{item.name}</h4>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-xl glass-v2 flex items-center justify-center hover:bg-white/5"><Minus size={14} /></button>
                                            <span className="w-6 text-center text-lg font-black italic">{item.qty}</span>
                                            <button onClick={() => addToCart(item)} className="w-10 h-10 rounded-xl glass-v2 flex items-center justify-center hover:bg-white/5"><Plus size={14} /></button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="mt-10 space-y-8">
                            <div className="space-y-4 pt-8 border-t border-white/10">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                                    <span>Sub-Payload</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                                    <span>Protocol Fee</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between text-5xl font-black italic text-white tracking-tighter uppercase leading-none pt-4">
                                    <span className="nile-text-gradient">Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleCheckout('cash')}
                                    className="h-20 rounded-2xl glass-v2 flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/40 transition-all"
                                >
                                    <Banknote size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Cash Settle</span>
                                </button>
                                <button
                                    onClick={() => handleCheckout('card')}
                                    className="h-20 rounded-2xl glass-v2 flex flex-col items-center justify-center gap-2 group hover:border-indigo-500/40 transition-all"
                                >
                                    <CreditCard size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/60">Card Anchor</span>
                                </button>
                            </div>

                            <button
                                onClick={() => handleCheckout('card')}
                                disabled={cart.length === 0}
                                className={`w-full h-24 rounded-3xl btn-premium text-sm ${cart.length === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                <Zap size={24} fill="currentColor" />
                                COMMIT SESSION
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

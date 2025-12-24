"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Plus,
    Minus,
    ShoppingBag,
    Star,
    Clock,
    Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
    { id: '101', name: 'Cairo Charcoal Chicken', price: 12.50, desc: 'Half chicken, grilled with local spices.', popular: true },
    { id: '102', name: 'Mezza Platter', price: 8.00, desc: 'Hummus, Tahini, and fresh bread.', popular: false },
    { id: '103', name: 'Egyptian Kofta', price: 15.00, desc: '3 pieces with rice and salad.', popular: true },
];

export default function ShopClient({ id }: { id: string }) {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header / Banner */}
            <div className="h-64 bg-indigo-600 relative overflow-hidden flex items-end p-8">
                <Link href="/" className="absolute top-8 left-8 p-3 rounded-2xl bg-black/20 text-white backdrop-blur-md active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> Nile-Verified
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Grand Cairo Grill</h1>
                    <div className="flex items-center gap-6 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        <span className="flex items-center gap-2 text-white"><Star size={12} fill="white" /> 4.9</span>
                        <span className="flex items-center gap-2"><Clock size={12} /> 15-20 min</span>
                    </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-10 rotate-[-15deg]">
                    <ShieldCheck size={280} />
                </div>
            </div>

            {/* Menu Section */}
            <main className="flex-1 p-6 pb-40 space-y-10">

                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-nile-silver/30 mb-6 px-2">Most Ordered</h2>
                    <div className="space-y-4">
                        {MENU_ITEMS.map((item) => {
                            const inCart = cart.find(i => i.id === item.id);
                            return (
                                <div key={item.id} className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 active:bg-white/[0.08] transition-all flex flex-col gap-6 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-6">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">{item.name}</h3>
                                                {item.popular && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                            </div>
                                            <p className="text-xs font-medium text-nile-silver/40 leading-relaxed mb-4">{item.desc}</p>
                                        </div>
                                        <div className="text-2xl font-black italic text-white">${item.price.toFixed(2)}</div>
                                    </div>

                                    <div className="mt-auto">
                                        {inCart ? (
                                            <div className="flex items-center justify-between bg-black/40 rounded-2xl p-2 border border-white/5">
                                                <button onClick={() => removeFromCart(item.id)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white active:scale-95"><Minus size={18} /></button>
                                                <span className="text-xl font-black italic">{inCart.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-95"><Plus size={18} /></button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
                                            >
                                                <Plus size={16} /> Add To Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </main>

            {/* Sticky Cart Action (Mother-test UI) */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full p-6 z-50 animate-in slide-in-from-bottom">
                    <button
                        onClick={() => router.push('/checkout')}
                        className="max-w-md mx-auto h-24 rounded-[2.5rem] bg-emerald-500 shadow-2xl shadow-emerald-500/20 flex items-center justify-between px-10 active:scale-95 transition-all text-black border-4 border-black/20"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{cart.reduce((a, b) => a + b.quantity, 0)} Items Added</span>
                            <span className="text-2xl font-black italic tracking-tighter uppercase">Review Order</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black italic tracking-tighter">${total.toFixed(2)}</span>
                            <ArrowRight size={24} strokeWidth={3} />
                        </div>
                    </button>
                </div>
            )}

        </div>
    );
}

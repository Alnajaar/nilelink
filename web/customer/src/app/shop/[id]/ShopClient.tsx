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
    Info,
    MapPin,
    Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button';
import { LocationGuard } from '@/components/LocationGuard';
import { useCustomer } from '@/contexts/CustomerContext';
import { Badge } from '@/shared/components/Badge';

export const dynamic = 'force-dynamic';

const MENU_ITEMS = [
    { id: '101', name: 'Cairo Charcoal Chicken', price: 12.50, desc: 'Half chicken, grilled with local spices.', popular: true, image: '🍗' },
    { id: '102', name: 'Mezza Platter', price: 8.00, desc: 'Hummus, Tahini, and fresh bread.', popular: false, image: '🥗' },
    { id: '103', name: 'Egyptian Kofta', price: 15.00, desc: '3 pieces with rice and salad.', popular: true, image: '🥩' },
    { id: '104', name: 'Mint Lemonade', price: 4.50, desc: 'Freshly squeezed with mint leaves.', popular: false, image: '🍋' },
];

export default function ShopClient({ id }: { id: string }) {
    return (
        <LocationGuard>
            <ShopContent id={id} />
        </LocationGuard>
    );
}

function ShopContent({ id }: { id: string }) {
    const router = useRouter();
    const { addToCart, removeFromCart, cart } = useCustomer();

    // Derived state
    const currentShopCartInfo = cart.filter(i => i.restaurantId === id); // In real app, filter by shop
    // For demo simplicity, we assume generic cart for now or mapped by ID

    const getItemQuantity = (itemId: string) => {
        return cart.find(i => i.id === itemId)?.quantity || 0;
    };

    const handleAdd = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            restaurantId: id,
            restaurantName: 'Grand Cairo Grill'
        });
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Hero Header */}
            <div className="relative h-72 bg-[#0e372b] flex items-end overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e372b] to-transparent"></div>

                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
                    <Link href="/">
                        <Button variant="ghost" className="bg-black/20 backdrop-blur text-white hover:bg-black/30 w-10 h-10 p-0 rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <div className="p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 cursor-pointer transition-colors">
                            <Info size={20} />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 p-6 w-full">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="success" className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20">
                            <ShieldCheck size={12} className="mr-1" /> Verified Node
                        </Badge>
                        <Badge variant="neutral" className="text-[10px] text-emerald-200 border-white/10 bg-white/5">
                            <MapPin size={10} className="mr-1" /> 1.2 km
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Grand Cairo Grill</h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-emerald-100/80 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Star size={12} className="fill-warning text-warning" /> 4.9 (1.2k)</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> 20-30 min</span>
                        <span>•</span>
                        <span>$$ • Grill</span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="p-6 space-y-8">
                <div>
                    <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Flame size={18} className="text-danger" />
                        Signature Dishes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MENU_ITEMS.map((item) => {
                            const quantity = getItemQuantity(item.id);
                            return (
                                <motion.div
                                    key={item.id}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-4 rounded-[24px] border transition-all flex justify-between gap-4 ${quantity > 0 ? 'bg-primary/5 border-primary/20' : 'bg-white border-border-subtle shadow-sm'}`}
                                >
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-bold text-text-main text-lg">{item.name}</h4>
                                        </div>
                                        <p className="text-sm text-text-muted leading-snug mb-4 line-clamp-2">{item.desc}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="font-mono font-bold text-text-main">${item.price.toFixed(2)}</span>

                                            {quantity > 0 ? (
                                                <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-border-subtle p-1">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-background-subtle text-text-main hover:bg-danger/10 hover:text-danger transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-black text-sm w-4 text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => handleAdd(item)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleAdd(item)}
                                                    className="rounded-xl h-10 px-4 font-bold text-xs"
                                                >
                                                    Add <Plus size={14} className="ml-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-24 h-24 bg-background-subtle rounded-2xl shrink-0 flex items-center justify-center text-4xl shadow-inner">
                                        {item.image}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Float Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full p-4 lg:p-8 z-50 pointer-events-none">
                    <div className="max-w-2xl mx-auto pointer-events-auto">
                        <motion.button
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            onClick={() => router.push('/checkout')}
                            className="w-full h-16 bg-[#0e372b] text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between px-6 hover:translate-y-[-2px] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wider">View Order</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-lg">${total.toFixed(2)}</span>
                                <ArrowRight size={18} />
                            </div>
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    );
}

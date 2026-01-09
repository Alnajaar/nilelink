'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Minus, Plus, Banknote, CreditCard, Zap, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { LedgerBadge } from '@/shared/components/LedgerBadge';

interface OrderItem {
    id: number | string;
    name: string;
    price: number;
    qty: number;
    icon?: string;
}

interface OrderSummaryProps {
    items: OrderItem[];
    onUpdateQty: (itemId: number | string, delta: number) => void;
    onRemove: (itemId: number | string) => void;
    onClear: () => void;
    onCheckout: (method: 'cash' | 'card' | 'deferred') => void;
    isLoading?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    items,
    onUpdateQty,
    onRemove,
    onClear,
    onCheckout,
    isLoading = false
}) => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.14; // Default 14% tax
    const total = subtotal + tax;

    return (
        <div className="w-full h-full flex flex-col bg-white border-l border-border-subtle shadow-2xl relative">
            <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <ShoppingCart size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-main uppercase tracking-tight leading-none">Order Tab</h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Pending Sync</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button onClick={onClear} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-error transition-colors">
                        VOID ALL
                    </button>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20 grayscale">
                        <Package size={64} className="mb-6" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Cart is Empty</h3>
                        <p className="text-xs font-bold uppercase tracking-widest">Select items to anchor</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-background-subtle rounded-[24px] p-5 border border-transparent hover:border-border-subtle transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {item.icon || '🍽️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-text-main text-sm uppercase truncate leading-tight">{item.name}</h4>
                                        <p className="text-xs font-bold text-primary font-mono mt-1">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
                                            <button
                                                onClick={() => onUpdateQty(item.id, -1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-background-subtle transition-colors text-text-muted hover:text-primary"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-black font-mono">{item.qty}</span>
                                            <button
                                                onClick={() => onUpdateQty(item.id, 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-background-subtle transition-colors text-text-muted hover:text-primary"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Totals & Actions */}
            <div className="p-8 bg-white border-t-2 border-dashed border-border-subtle space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <span>Terminal Subtotal</span>
                        <span className="font-mono text-sm">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <span>Economic Tax (14%)</span>
                        <span className="font-mono text-sm">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-border-subtle mt-2">
                        <span className="text-2xl font-black text-text-main uppercase tracking-tighter italic">Total Due</span>
                        <div className="text-4xl font-black text-primary font-mono tracking-tighter">
                            ${total.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => onCheckout('cash')}
                        disabled={items.length === 0 || isLoading}
                        className="h-16 flex-col gap-1 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest"
                        variant="outline"
                    >
                        <Banknote size={20} />
                        CASH
                    </Button>
                    <Button
                        onClick={() => onCheckout('card')}
                        disabled={items.length === 0 || isLoading}
                        className="h-16 flex-col gap-1 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest"
                        variant="outline"
                    >
                        <CreditCard size={20} />
                        METHOD
                    </Button>
                </div>

                <Button
                    onClick={() => onCheckout('card')}
                    disabled={items.length === 0 || isLoading}
                    className="w-full h-20 rounded-[28px] bg-secondary hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 flex-col gap-1 border-0"
                    size="lg"
                >
                    <div className="flex items-center gap-3">
                        <Zap size={20} className="text-white fill-white" />
                        <span className="text-xl font-black uppercase tracking-widest text-white">SETTLE ORDER</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                        <ShieldCheck size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Anchor to Protocol Ledger</span>
                    </div>
                </Button>
            </div>
        </div>
    );
};

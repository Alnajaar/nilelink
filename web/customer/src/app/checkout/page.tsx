"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ShieldCheck,
    CreditCard,
    Wallet,
    CheckCircle2,
    Truck,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomerEngine } from '@/lib/engines/CustomerEngine';

export default function CheckoutPage() {
    const router = useRouter();
    const [engine] = useState(() => new CustomerEngine());
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DIGITAL'>('CASH');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock cart
    const cart = [
        { id: '101', name: 'Cairo Charcoal Chicken', price: 12.50, quantity: 1 }
    ];
    const subtotal = 12.50;
    const deliveryFee = 2.00;
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        // Protocol Handshake
        const orderId = await engine.placeOrder({ id: '1', name: 'Grand Cairo Grill' }, cart);

        // Simulating protocol propagation delay
        setTimeout(() => {
            router.push(`/track?id=${orderId}`);
        }, 1500);
    };

    return (
        <div className="min-h-screen relative text-white flex flex-col font-sans selection:bg-emerald-500/30">
            <div className="mesh-bg" />

            {/* Header */}
            <header className="p-10 flex items-center gap-8 relative z-10">
                <Link href="/shop?id=1" className="w-14 h-14 rounded-2xl glass-v2 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-xl">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-5xl font-black italic tracking-tighter uppercase nile-text-gradient leading-none">Checkout</h1>
            </header>

            <main className="flex-1 px-8 pb-48 space-y-12 relative z-10 max-w-2xl mx-auto w-full">

                {/* Delivery Address */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4">Logistics Target</h2>
                    <div className="p-8 rounded-[3rem] glass-v2 flex items-center gap-6 border-white/5 group hover:border-indigo-500/20 transition-all">
                        <div className="w-16 h-16 rounded-3xl glass-v2 bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <MapPin size={28} />
                        </div>
                        <div>
                            <div className="text-lg font-black italic text-white uppercase tracking-tight">Home Hub</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">Zamalek, Cairo • Block 4 Sector 9</div>
                        </div>
                    </div>
                </motion.section>

                {/* Price Summary */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4">Financial Payload</h2>
                    <div className="p-10 rounded-[3.5rem] glass-v2 border-white/5 space-y-6 relative overflow-hidden">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                            <span>Base Value</span>
                            <span className="text-white/60">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                            <span>Network Fee</span>
                            <span className="text-white/60">${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/5 my-4" />
                        <div className="flex justify-between text-4xl font-black italic text-white tracking-tighter uppercase leading-none">
                            <span className="nile-text-gradient">Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 w-full h-1 shimmer opacity-50" />
                    </div>
                </motion.section>

                {/* Payment Method Selector */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4">Settle Protocol</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { id: 'CASH', label: 'Cash on Edge', icon: Wallet },
                            { id: 'DIGITAL', label: 'Nile Digital', icon: CreditCard }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`p-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 group ${paymentMethod === method.id ? 'glass-v2 bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'glass-v2 border-white/5 text-white/20 hover:border-white/20'}`}
                            >
                                <method.icon size={32} className={paymentMethod === method.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Trust Shield */}
                <div className="p-8 rounded-[2.5rem] glass-v2 border-emerald-500/10 flex gap-6 mt-12 bg-emerald-500/[0.02]">
                    <ShieldCheck size={28} className="text-emerald-500 shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 leading-relaxed italic">
                        Every order generates a cryptographically-secured receipt on the NileLink Protocol. Verified by distributed consensus.
                    </p>
                </div>

            </main>

            {/* Sticky Action */}
            <div className="fixed bottom-0 left-0 w-full p-8 z-50">
                <motion.button
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className={`max-w-md mx-auto h-24 rounded-[3rem] shadow-2xl transition-all flex items-center justify-between px-12 group ${isSubmitting ? 'glass-v2 border-white/10 opacity-50 cursor-wait' : 'btn-premium'}`}
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                            {isSubmitting ? 'Broadsharding...' : 'Anchoring Event...'}
                        </span>
                        <span className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                            {isSubmitting ? 'Processing' : 'Commit Order'}
                        </span>
                    </div>
                    {isSubmitting ? (
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                    )}
                </motion.button>
            </div>

        </div>
    );
}

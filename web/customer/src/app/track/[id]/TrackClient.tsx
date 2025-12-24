"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Zap,
    Package,
    Star,
    MapPin,
    ShieldCheck,
    Clock,
    Clipboard,
    CheckCircle2
} from 'lucide-react';

const STEPS = [
    { label: 'Received', icon: CheckCircle2, desc: 'Merchant confirmed' },
    { label: 'Cooking', icon: Zap, desc: 'Preparing your items' },
    { label: 'Heading Out', icon: MapPin, desc: 'Order at your door soon' },
    { label: 'Delivered', icon: Star, desc: 'Enjoy your meal!' }
];

export default function TrackClient({ id }: { id: string }) {
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        // Mock progress
        const timer = setTimeout(() => setActiveStep(2), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header / ETA */}
            <div className="p-8 bg-indigo-600 rounded-b-[4rem] mb-10 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                    <Link href="/" className="p-3 rounded-2xl bg-black/20 text-white backdrop-blur-md">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="text-right">
                        <div className="text-4xl font-black italic tracking-tighter">15 MIN</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimated Arrival</div>
                    </div>
                </div>

                <div className="mt-12 relative z-10">
                    <h1 className="text-2xl font-black italic uppercase tracking-tight mb-2">Grand Cairo Grill</h1>
                    <p className="text-sm font-bold opacity-60">Order #{id}</p>
                </div>

                <div className="absolute -right-16 -bottom-16 opacity-10 rotate-[-15deg]">
                    <Clock size={240} />
                </div>
            </div>

            <main className="flex-1 px-8 space-y-12 pb-32">

                {/* Status Chain */}
                <section className="space-y-10 relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/5 -z-10" />

                    {STEPS.map((step, i) => {
                        const isDone = i <= activeStep;
                        const isCurrent = i === activeStep;

                        return (
                            <div key={i} className="flex gap-8 items-start group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-[#050505] transition-all duration-700 ${isDone ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-[#111] text-nile-silver/20'}`}>
                                    <step.icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                                </div>
                                <div>
                                    <h3 className={`font-black italic uppercase tracking-tight text-lg ${isDone ? 'text-white' : 'text-nile-silver/20'}`}>{step.label}</h3>
                                    <p className={`text-xs font-medium ${isDone ? 'text-nile-silver/60' : 'text-nile-silver/10'}`}>{step.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </section>

                {/* Trust Verification (Immutable Link) */}
                <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                    <div className="flex items-center gap-4 text-emerald-500">
                        <ShieldCheck size={24} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Protocol Receipt</h4>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-nile-silver/40">
                            <span>Order Hash</span>
                            <span className="font-mono text-[9px]">A82...F92</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-nile-silver/40">
                            <span>Sequence</span>
                            <span>#12,204</span>
                        </div>
                        <div className="h-px bg-white/5 my-4" />
                        <button className="w-full h-14 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all">
                            View Detailed Receipt <Clipboard size={14} />
                        </button>
                    </div>
                </section>

                {/* Support/Issue Button */}
                <button className="w-full py-6 text-xs font-black uppercase tracking-widest text-nile-silver/20 hover:text-red-500 transition-colors">
                    Report Issue With Order
                </button>

            </main>

        </div>
    );
}

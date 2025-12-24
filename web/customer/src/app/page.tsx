"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    Zap,
    Star,
    MapPin,
    Clock,
    ArrowRight,
    History,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { ChoiceEngine } from '@/lib/engines/ChoiceEngine';

const MERCHANTS = [
    { id: '1', name: 'Grand Cairo Grill', category: 'Oriental', rating: 4.9, time: '15-20m', logo: '🔥' },
    { id: '2', name: 'Sultan Bakery', category: 'Bakery', rating: 4.8, time: '10-15m', logo: '🥐' },
    { id: '3', name: 'Giza Sushi', category: 'Asian', rating: 4.7, time: '30-40m', logo: '🍣' },
    { id: '4', name: 'Al-Madina Pharmacy', category: 'Health', rating: 5.0, time: '5-10m', logo: '💊' }
];

export default function DiscoveryPage() {
    const [choices, setChoices] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [engine] = useState(() => new ChoiceEngine());

    useEffect(() => {
        const load = async () => {
            setChoices(await engine.getPersonalizedChoices());
            setPrediction(await engine.predictNextOrder());
        };
        load();
    }, [engine]);

    return (
        <div className="min-h-screen relative text-white p-6 pb-32 font-sans overflow-x-hidden selection:bg-emerald-500/30">
            <div className="mesh-bg" />

            {/* Minimal Header */}
            <header className="flex justify-between items-center mb-12 pt-8">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase nile-text-gradient leading-none">Discovery</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Zamalek, Cairo</span>
                    </div>
                </div>
                <Link href="/history" className="w-14 h-14 rounded-2xl glass-v2 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <History size={24} />
                </Link>
            </header>

            {/* Smart Prediction (Phase 4 Intelligence) */}
            {prediction && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 group"
                >
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Intelligence Suggestion</span>
                    </div>
                    <Link href={`/shop?id=1`} className="block">
                        <div className="p-10 rounded-[3.5rem] glass-v2 relative overflow-hidden active:scale-[0.98] transition-all border-emerald-500/10 group-hover:border-emerald-500/30">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">Feeling {prediction}?</h3>
                                <p className="text-sm font-medium text-emerald-500/60 mb-8 italic">Verified preference match.</p>
                                <div className="btn-premium w-48 h-16">
                                    Quick Order <ArrowRight size={16} />
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-1000">
                                <Sparkles size={200} className="text-emerald-500" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}

            {/* Verification Focus (Phase 3 Trust) */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocol Verified</h2>
                    <ShieldCheck size={16} className="text-emerald-500/40" />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {MERCHANTS.map((shop, i) => (
                        <motion.div
                            key={shop.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <Link href={`/shop?id=${shop.id}`}>
                                <div className="p-8 rounded-[2.5rem] glass-v2 active:bg-white/5 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                                            {shop.logo}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors leading-tight mb-2 uppercase italic tracking-tighter">{shop.name}</h3>
                                            <div className="flex items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                <span className="flex items-center gap-1 text-emerald-500/60"><Star size={10} fill="currentColor" /> {shop.rating}</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> {shop.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl glass-v2 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all group-hover:border-emerald-500">
                                        <ArrowRight size={24} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Navigation Overlay (Persistent Search) */}
            <div className="fixed bottom-0 left-0 w-full p-8 z-50">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="max-w-md mx-auto h-20 rounded-full btn-premium shadow-2xl shadow-emerald-500/20 px-8 gap-4 cursor-pointer"
                >
                    <Search size={24} className="text-white" />
                    <span className="text-sm font-black text-white italic tracking-tight uppercase">Search Protocol Grid</span>
                </motion.div>
            </div>

        </div>
    );
}

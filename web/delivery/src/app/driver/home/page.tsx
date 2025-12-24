"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Wallet,
    Bike,
    ArrowRight,
    CheckCircle2,
    Clock,
    MapPin,
    Power,
    ShieldCheck,
    Navigation,
    Zap
} from 'lucide-react';
import { DeliveryProtocol } from '@/lib/protocol/DeliveryProtocol';

export default function DriverHome() {
    const [cash, setCash] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const [protocol] = useState(() => new DeliveryProtocol());

    useEffect(() => {
        const load = async () => {
            setCash(await protocol.getCashInHand());
        };
        load();
    }, [protocol]);

    const activeOrders = 2;

    return (
        <div className="space-y-10 pb-12">
            {/* Header / Avatar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none nile-text-gradient">Agent Omar</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                            Verified Fleet Node
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isOnline ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'glass-v2 text-white/20'}`}
                >
                    <Power size={22} strokeWidth={3} />
                </button>
            </motion.div>

            {/* Cash Custody Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-10 rounded-[3.5rem] glass-v2 border-white/5 relative overflow-hidden group"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white/30 mb-6">
                        <Wallet size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Custody</span>
                    </div>
                    <div className="text-6xl font-black text-white italic tracking-tighter leading-none mb-4">
                        {cash.toFixed(2)} <span className="text-xl not-italic text-white/20 uppercase tracking-widest">EGP</span>
                    </div>
                    <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest leading-relaxed">
                        Settlement Required at Node-X
                    </p>
                </div>

                {/* Visual Decoration */}
                <div className="absolute -right-12 -bottom-12 opacity-[0.03] rotate-[-15deg] group-hover:scale-110 transition-transform duration-[10s]">
                    <ShieldCheck size={280} />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-[2.5rem] glass-v2 border-white/5"
                >
                    <div className="text-3xl font-black text-white italic mb-1 nile-text-gradient">{activeOrders}</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Live Missions</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-[2.5rem] glass-v2 border-white/5"
                >
                    <div className="text-3xl font-black text-white italic mb-1 nile-text-gradient">14</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Sync Success</div>
                </motion.div>
            </div>

            {/* Current Mission Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Priority Uplink</h2>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <Link href="/driver/transit/1" className="block group">
                    <div className="p-10 rounded-[3.5rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                                    <Navigation size={28} />
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-black/20 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/5">
                                    Pickup Inbound
                                </span>
                            </div>

                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Grand Cairo Grill</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-10 italic">Zamalek • Block 4 Sector 9</p>

                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] bg-black/30 self-start inline-flex px-8 py-5 rounded-3xl backdrop-blur-md border border-white/5 group-hover:bg-black/50 transition-colors">
                                Engage Shift <Zap size={16} fill="white" />
                            </div>
                        </div>

                        <div className="absolute -right-12 -bottom-12 opacity-10 rotate-[-15deg] transition-transform duration-[10s] group-hover:rotate-0">
                            <Bike size={240} />
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Micro-Interaction / Support */}
            <div className="pt-10 text-center">
                <button className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white/40 transition-colors italic">
                    Emergency Protocol Trigger
                </button>
            </div>
        </div>
    );
}

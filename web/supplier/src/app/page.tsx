"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Package,
    Truck,
    Database,
    BarChart3,
    Zap,
    ArrowRight,
    Boxes,
    ShieldCheck,
    Globe,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    Wallet,
    Power,
    Cpu
} from 'lucide-react';
import { SupplierEngine } from '@/lib/engines/SupplierEngine';
import { RestockEngine } from '@/lib/engines/RestockEngine';

const MetricCard = ({ label, value, sub, icon: Icon, color = "text-white/40", delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="p-8 rounded-[3rem] glass-v2 border-white/5 group relative overflow-hidden"
    >
        <div className={`w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
            <Icon size={24} />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">{label}</div>
        <div className="text-4xl font-black text-white italic tracking-tighter mb-1 nile-text-gradient">{value}</div>
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{sub}</div>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
);

export default function SupplierDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [triggers, setTriggers] = useState<string[]>([]);
    const [engine] = useState(() => new SupplierEngine());
    const [restock] = useState(() => new RestockEngine());

    useEffect(() => {
        const load = async () => {
            setStats(await engine.getDashboardStats());
            setTriggers(await restock.getRestockTriggers());
        };
        load();
    }, [engine, restock]);

    return (
        <div className="min-h-screen relative text-white flex flex-col font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            <div className="mesh-bg" />

            {/* Header */}
            <header className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none nile-text-gradient">Supply Hub</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="px-3 py-1 rounded-md glass-v2 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Protocol Node: Cairo_X_01
                        </div>
                    </div>
                </motion.div>

                <div className="flex gap-6">
                    <Link href="/catalog" className="h-16 px-10 rounded-2xl glass-v2 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-all shadow-xl">
                        Catalog Node
                    </Link>
                    <Link href="/orders" className="h-16 px-10 rounded-2xl btn-premium flex items-center justify-center shadow-2xl shadow-emerald-500/20 active:scale-95">
                        Fulfillment Stream <ArrowRight size={16} />
                    </Link>
                </div>
            </header>

            <main className="flex-1 px-10 pb-40 space-y-12 relative z-10">

                {/* Critical Intelligence Block */}
                {triggers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-10 rounded-[3.5rem] glass-v2 bg-emerald-500/[0.03] border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8 group"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-[2rem] glass-v2 bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Cpu size={36} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight uppercase text-emerald-400">Restock Intelligence Matrix</h3>
                                <p className="text-sm font-medium text-white/40 italic mt-1">{triggers[0]}</p>
                            </div>
                        </div>
                        <button className="h-16 px-12 rounded-2xl glass-v2 border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-black transition-all active:scale-95 shadow-xl">
                            Authorize Batch Cycle
                        </button>
                    </motion.div>
                )}

                {/* Financial KPIs */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <MetricCard
                        label="Protocol Credits"
                        value={`$${stats?.totalReceivables.toLocaleString() || '12,402'}`}
                        sub="Settlement Ingress"
                        icon={TrendingUp}
                        color="text-emerald-400"
                        delay={0.1}
                    />
                    <MetricCard
                        label="Risk Entropy"
                        value={stats?.overdueCount || 0}
                        sub="Overdue Anchors"
                        icon={AlertCircle}
                        color="text-red-400"
                        delay={0.2}
                    />
                    <MetricCard
                        label="Fleet Payload"
                        value={stats?.activeOrders || 0}
                        sub="Live Deliveries"
                        icon={Truck}
                        color="text-indigo-400"
                        delay={0.3}
                    />
                    <MetricCard
                        label="Node Capacity"
                        value="92%"
                        sub="Storage Efficiency"
                        icon={Boxes}
                        color="text-white/40"
                        delay={0.4}
                    />
                </section>

                {/* Sub-navigation Tiles */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <Link href="/ledger" className="p-12 rounded-[4rem] glass-v2 border-white/5 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                        <div className="w-16 h-16 rounded-3xl glass-v2 bg-white/5 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 transition-colors">
                            <Wallet size={32} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-3">Credit Ledger</h4>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20 leading-relaxed italic">Immutable audit of client aging and verified settlement history.</p>

                        <div className="absolute -right-12 -bottom-12 opacity-[0.02] group-hover:opacity-[0.04] transition-all duration-[20s] group-hover:rotate-12">
                            <ShieldCheck size={280} />
                        </div>
                    </Link>

                    <Link href="/reports" className="p-12 rounded-[4rem] glass-v2 border-white/5 hover:border-indigo-500/20 transition-all group relative overflow-hidden">
                        <div className="w-16 h-16 rounded-3xl glass-v2 bg-white/5 flex items-center justify-center mb-8 group-hover:bg-indigo-500/10 transition-colors">
                            <BarChart3 size={32} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-3">Node Intelligence</h4>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20 leading-relaxed italic">Volumetric analysis, velocity forecasting, and cross-node parity.</p>

                        <div className="absolute -right-12 -bottom-12 opacity-[0.02] group-hover:opacity-[0.04] transition-all duration-[20s] group-hover:rotate-[-12deg]">
                            <Globe size={280} />
                        </div>
                    </Link>

                    <motion.div
                        whileHover={{ scale: 0.98 }}
                        className="p-12 rounded-[4rem] bg-indigo-600 flex flex-col justify-center items-center text-center shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                            <Zap size={40} className="text-white fill-white" />
                        </div>
                        <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Deploy Batch</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">ANCHOR SEASONAL CYCLE</p>

                        {/* Shimmer line */}
                        <div className="absolute inset-0 shimmer opacity-20" />
                    </motion.div>
                </section>

            </main>

            {/* Bottom Footer / Info */}
            <div className="p-10 text-center opacity-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Protocol Version 4.2.0 • Decentralized Supply Infrastructure</span>
            </div>

        </div>
    );
}

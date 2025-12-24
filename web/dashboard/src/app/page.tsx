"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Globe,
    Zap,
    ArrowUpRight,
    Activity,
    Layers,
    ShieldCheck,
    Lock,
    Cpu,
    Target
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtocolEngine, AggregatedStats } from '@/lib/engines/ProtocolEngine';

const PulseCard = ({ label, value, sub, icon: Icon, color = "text-white/40", delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="p-10 rounded-[3.5rem] glass-v2 border-white/5 group relative overflow-hidden"
    >
        <div className="flex justify-between items-start mb-8">
            <div className={`w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-inner`}>
                <Icon size={24} />
            </div>
            <div className="px-3 py-1 rounded-full glass-v2 bg-emerald-500/5 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1.5 italic">
                <ShieldCheck size={12} /> Verified
            </div>
        </div>
        <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">{label}</h4>
            <div className="text-5xl font-black text-white italic tracking-tighter mb-1 nile-text-gradient">{value}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{sub}</div>
        </div>

        <div className="absolute inset-x-0 top-0 h-px bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
);

export default function NetworkPulse() {
    const [stats, setStats] = useState<AggregatedStats | null>(null);
    const [engine] = useState(() => new ProtocolEngine());

    useEffect(() => {
        const load = async () => {
            setStats(await engine.getStats());
        };
        load();
    }, [engine]);

    if (!stats) return null;

    return (
        <DashboardLayout>
            <div className="space-y-20 relative">
                <div className="mesh-bg opacity-30" />

                {/* Protocol Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-v2 border-indigo-500/20 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Ecosystem Mainnet Pulse • Sequence #102,452</span>
                        </div>
                        <h1 className="text-[7rem] font-black text-white italic tracking-[calc(-0.05em)] leading-[0.8] mb-8 uppercase">
                            Network <br />
                            <span className="nile-text-gradient opacity-60">Intelligence.</span>
                        </h1>
                        <p className="text-white/40 text-xl font-bold italic leading-relaxed max-w-lg">
                            Financial and operational forensics sourced directly from immutable decentralized protocol events.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col md:flex-row gap-8"
                    >
                        <div className="p-10 rounded-[3rem] glass-v2 border-white/5 text-center min-w-[200px]">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">Sync Consistency</div>
                            <div className="text-3xl font-black italic text-emerald-400 uppercase tracking-tighter">99.9% Parity</div>
                        </div>
                        <button className="p-10 rounded-[3rem] btn-premium min-w-[240px] group transition-all">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Network Yield</div>
                            <div className="text-3xl font-black italic text-white flex items-center justify-center gap-4">
                                {stats.yieldVelo}x <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        </button>
                    </motion.div>
                </header>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    <PulseCard
                        label="Protocol Velocity"
                        value={`$${(stats.totalVolume / 1000000).toFixed(2)}M`}
                        sub="Aggregate Value Flow"
                        icon={Layers}
                        delay={0.1}
                    />
                    <PulseCard
                        label="Node Architecture"
                        value={stats.activeNodes}
                        sub="Verified Edge Hubs"
                        icon={Globe}
                        color="text-indigo-400"
                        delay={0.2}
                    />
                    <PulseCard
                        label="Chain Integrity"
                        value={`${(stats.deliverySuccessRate * 100).toFixed(1)}%`}
                        sub="Operational Entropy"
                        icon={Activity}
                        color="text-emerald-400"
                        delay={0.3}
                    />
                    <PulseCard
                        label="Protocol Depth"
                        value={stats.protocolSequence.toLocaleString()}
                        sub="Event Anchors Recorded"
                        icon={Lock}
                        delay={0.4}
                    />
                </div>

                {/* Growth & Distribution Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">

                    {/* Distribution Map Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8 p-16 rounded-[4.5rem] glass-v2 border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] group"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:80px_80px] opacity-[0.02]" />
                        <div className="relative text-center max-w-lg">
                            <div className="relative mb-14">
                                <Globe size={160} className="text-white/5 mx-auto animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Target size={48} className="text-indigo-500/20 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-6 nile-text-gradient">Protocol Topography</h3>
                            <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] leading-loose italic underline decoration-white/5 underline-offset-8">
                                Real-time sequencing across Cairo, Giza, and the Delta. Cross-node synchronisation validated.
                            </p>
                        </div>

                        <div className="absolute -bottom-1 -left-1 w-32 h-32 glass-v2 bg-indigo-500/5 border-indigo-500/10 rounded-tr-[3rem] p-8 flex items-end justify-start">
                            <Cpu size={24} className="text-indigo-500/40" />
                        </div>
                    </motion.div>

                    {/* Settlement Profile */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 p-16 rounded-[4.5rem] glass-v2 bg-indigo-500/[0.02] border-indigo-500/10 flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-16">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                                    Settlement <br />
                                    Matrix
                                </h3>
                                <div className="w-16 h-16 rounded-3xl glass-v2 bg-indigo-500/10 border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Zap size={28} fill="currentColor" />
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">
                                        <span>Digital Ledger</span>
                                        <span className="text-white italic">65%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '65%' }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">
                                        <span>Node Custody (Cash)</span>
                                        <span className="text-white italic">35%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '35%' }}
                                            transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
                                            className="h-full bg-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 p-10 rounded-[3rem] glass-v2 border-white/5 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-3 flex items-center gap-2">
                                    <TrendingUp size={12} /> Forecast Velocity
                                </div>
                                <div className="text-4xl font-black italic text-white mb-3">+12.4%</div>
                                <p className="text-[10px] font-black text-white/20 leading-relaxed italic uppercase tracking-widest">Expansion predicted on current Delta momentum.</p>
                            </div>
                            <div className="absolute inset-0 shimmer opacity-[0.03]" />
                        </div>
                    </motion.div>

                </div>

            </div>
        </DashboardLayout>
    );
}

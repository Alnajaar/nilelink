"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    BarChart3,
    Globe,
    TrendingUp,
    Zap,
    ArrowUpRight,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { analyticsApi } from '@/shared/utils/api';

export default function Dashboard() {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '$1.24M', trend: '+12.5%', icon: TrendingUp, color: 'text-blue-400', glow: 'bg-blue-500/10' },
        { label: 'Active Orders', value: '4,892', trend: '+5.2%', icon: Activity, color: 'text-purple-400', glow: 'bg-purple-500/10' },
        { label: 'Edge Latency', value: '14ms', trend: '-2.1%', icon: Zap, color: 'text-cyan-400', glow: 'bg-cyan-500/10' },
        { label: 'Nodes Sync', value: '100%', trend: 'Verified', icon: ShieldCheck, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    ]);

    const [liveNodes, setLiveNodes] = useState([
        { node: 'Cairo-North-1', load: '42%', status: 'active' },
        { node: 'Alex-Dist-2', load: '18%', status: 'idle' },
        { node: 'Dubai-Main-Gateway', load: '76%', status: 'high' },
        { node: 'Casablanca-Edge', load: '31%', status: 'active' },
    ]);

    useEffect(() => {
        if (!isDemoMode) {
            // Fetch real data
            analyticsApi.getDashboard()
                .then((data: any) => {
                    setStats([
                        { label: 'Total Revenue', value: `${data.totalRevenue?.toLocaleString() || '0'}`, trend: '+12.5%', icon: TrendingUp, color: 'text-blue-400', glow: 'bg-blue-500/10' },
                        { label: 'Active Orders', value: data.totalOrders?.toString() || '0', trend: '+5.2%', icon: Activity, color: 'text-purple-400', glow: 'bg-purple-500/10' },
                        { label: 'Edge Latency', value: '14ms', trend: '-2.1%', icon: Zap, color: 'text-cyan-400', glow: 'bg-cyan-500/10' },
                        { label: 'Nodes Sync', value: '100%', trend: 'Verified', icon: ShieldCheck, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
                    ]);
                })
                .catch(err => console.error('Failed to fetch analytics:', err));

            // Fetch live nodes - assuming there's an API for that
            // For now, keep demo data or add mock
        }
    }, [isDemoMode]);

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                {/* Background Orbs */}
                <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

                <section className="p-10">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                        {stats.map((stat, i) => (
                            <GlassCard key={i} delay={i * 0.1}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl ${stat.glow} border border-white/5`}>
                                        <stat.icon size={22} className={stat.color} />
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 45 }}
                                        className="p-1.5 rounded-full bg-white/5 text-zinc-500 hover:text-white cursor-pointer transition-colors"
                                    >
                                        <ArrowUpRight size={16} />
                                    </motion.div>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm font-semibold mb-2">{stat.label}</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                </div>
                                {/* Micro-chart simulation */}
                                <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: i % 2 === 0 ? '70%' : '45%' }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`h-full bg-gradient-to-r ${stat.color.replace('text', 'from')} to-white/20`}
                                    />
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Real-time Growth Chart */}
                        <GlassCard className="lg:col-span-8 p-10" delay={0.4}>
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Ecosystem Growth</h2>
                                    <p className="text-zinc-500 text-sm mt-1 font-medium italic">Consolidated revenue across global edge nodes.</p>
                                </div>
                                <div className="flex p-1 rounded-2xl bg-zinc-900 border border-white/5">
                                    {['7D', '30D', '1Y'].map(d => (
                                        <button key={d} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${d === '30D' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-80 flex items-end gap-2 w-full group/chart">
                                {[45, 65, 55, 85, 75, 95, 110, 80, 70, 100, 120, 115, 130, 150, 140, 160, 170, 155, 180, 200, 190, 210, 230].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(h / 230) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.03) }}
                                        className="flex-1 bg-gradient-to-t from-blue-600/40 via-blue-500/20 to-blue-400 rounded-t-lg transition-all duration-300 hover:scale-x-110 hover:from-blue-400 hover:to-white relative group"
                                    >
                                        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none">
                                            ${h}k
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 px-2">
                                {['Oct 23', 'Nov 04', 'Nov 16', 'Nov 28', 'Dec 10', 'Dec 22'].map(date => (
                                    <span key={date} className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{date}</span>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Health & Verification Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <GlassCard className="bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent border-indigo-500/10" delay={0.5}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                                            <Globe size={18} />
                                        </div>
                                        <h3 className="font-bold text-lg">Live Nodes</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-500">SYNCED</span>
                                </div>
                                <div className="space-y-4">
                                    {liveNodes.map((node, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'high' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                                <span className="text-sm font-semibold text-zinc-200">{node.node}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-indigo-400 font-bold">{node.load}</span>
                                                <ChevronRight size={14} className="text-zinc-600" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="border-dashed border-zinc-700 bg-transparent flex flex-col items-center justify-center py-12" delay={0.6}>
                                <div className="relative mb-6">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-20 h-20 rounded-full border border-zinc-800 border-t-blue-500 border-r-purple-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck size={32} className="text-blue-400" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Immutable Ledger</h4>
                                <p className="text-xs text-zinc-500 text-center leading-relaxed px-10">
                                    NileLink Protocol ensures every event is hashed, salted, and anchored for 100% financial transparency.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-8 px-6 py-3 rounded-2xl bg-white text-black text-xs font-bold shadow-xl shadow-white/5"
                                >
                                    Verify Contract
                                </motion.button>
                            </GlassCard>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Activity,
    Zap,
    ShieldCheck,
    ArrowUpRight,
    Database,
    Globe,
    Plus
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function DashboardOverview() {
    const stats = [
        { label: 'Total Volume', value: '$1.24M', trend: '+12.5%', icon: TrendingUp, color: 'text-blue-400', glow: 'bg-blue-500/10' },
        { label: 'Network Orders', value: '4,892', trend: '+5.2%', icon: Activity, color: 'text-purple-400', glow: 'bg-purple-500/10' },
        { label: 'Edge Latency', value: '14ms', trend: '-2.1%', icon: Zap, color: 'text-cyan-400', glow: 'bg-cyan-500/10' },
        { label: 'Protocol Nodes', value: '84 Active', trend: 'Healthy', icon: Globe, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Protocol Overview</h1>
                        <p className="text-zinc-500 font-medium">Real-time state monitoring for the NileLink Economic Engine.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                            <Plus size={14} />
                            Deploy Node
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                    {stats.map((stat, i) => (
                        <GlassCard key={i} delay={i * 0.1}>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${stat.glow} border border-white/5`}>
                                    <stat.icon size={22} className={stat.color} />
                                </div>
                                <div className="p-1.5 rounded-full bg-white/5 text-zinc-500 hover:text-white cursor-pointer transition-colors">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-sm font-semibold mb-2 uppercase tracking-widest leading-none">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-black tracking-tighter text-white">{stat.value}</h3>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
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
                    {/* Ledger Feed */}
                    <GlassCard className="lg:col-span-8 p-10" delay={0.4}>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">Recent Ledger Events</h3>
                                <p className="text-zinc-500 text-sm font-medium mt-1">Immutable protocol audit log.</p>
                            </div>
                            <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">View Full Ledger</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'TX-4521', type: 'SALE_AUTH', status: 'Anchored', time: '12s ago', node: 'Cairo-North-1' },
                                { id: 'TX-4520', type: 'SETTLEMENT', status: 'Pending', time: '45s ago', node: 'Dubai-Main-2' },
                                { id: 'TX-4519', type: 'INVENTORY_DEDUCT', status: 'Anchored', time: '3m ago', node: 'Alex-Dist-2' },
                                { id: 'TX-4518', type: 'SALE_AUTH', status: 'Anchored', time: '14m ago', node: 'Cairo-North-1' },
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500">
                                            <Database size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1">{tx.type}</div>
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{tx.id} • {tx.node}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${tx.status === 'Anchored' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {tx.status}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{tx.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Edge Health Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <GlassCard className="bg-indigo-600/5 border-indigo-500/10">
                            <div className="flex items-center gap-3 mb-8">
                                <ShieldCheck size={20} className="text-indigo-400" />
                                <h3 className="font-bold text-lg">Protocol Health</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Network Consensus</span>
                                    <span className="text-emerald-400 text-xs font-bold">OPTIMAL</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Anchor Latency</span>
                                    <span className="text-white text-xs font-bold">14.2ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sync Coverage</span>
                                    <span className="text-white text-xs font-bold">100%</span>
                                </div>
                            </div>
                        </GlassCard>

                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group cursor-pointer">
                            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="font-bold text-xl mb-2 relative z-10">Scale Protocol</h4>
                            <p className="text-white/60 text-xs font-medium relative z-10 mb-8 leading-relaxed">Boost network security by deploying more NileLink Edge nodes to your region.</p>
                            <button className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest relative z-10 shadow-xl shadow-blue-900/40">
                                Get Node Kit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

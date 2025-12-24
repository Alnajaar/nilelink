"use client";

import React from 'react';
import {
    Globe,
    Cpu,
    Zap,
    Map as MapIcon,
    ShieldCheck,
    ArrowRight,
    Activity,
    Server,
    Database
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function NodesView() {
    const regions = [
        { name: 'Cairo-East', load: '12%', status: 'Stable', nodes: 14 },
        { name: 'Dubai-Marina', load: '84%', status: 'Peak', nodes: 42 },
        { name: 'Riyadh-Central', load: '24%', status: 'Stable', nodes: 28 },
        { name: 'Maadi-Edge', load: '5%', status: 'Idle', nodes: 6 },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-16">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-6 text-nile-silver/20">
                            <Globe size={24} />
                            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">Global Nodes.</h1>
                        </div>
                        <p className="text-nile-silver/40 text-lg font-bold italic leading-relaxed">
                            Real-time propagation health across the distributed NileLink Edge network.
                        </p>
                    </div>
                    <button className="h-20 px-12 btn-primary flex items-center justify-center gap-4 text-xs font-black">
                        Scale Regional Capacity
                        <ArrowRight size={20} />
                    </button>
                </header>

                <div className="h-[600px] rounded-[5rem] bg-nile-dark/30 border border-white/5 relative overflow-hidden flex items-center justify-center group mb-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:60px_60px] opacity-[0.03]" />

                    {/* Abstract Map Nodes */}
                    <div className="relative w-full h-full">
                        {[
                            { t: '15%', l: '20%' }, { t: '45%', l: '50%' }, { t: '70%', l: '30%' }, { t: '40%', l: '80%' }
                        ].map((pos, i) => (
                            <div key={i} className="absolute w-4 h-4 rounded-full bg-nile-silver shadow-[0_0_20px_rgba(219,219,219,0.5)] cursor-pointer group/node" style={{ top: pos.t, left: pos.l }}>
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl glass-panel text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap">
                                    Active Node #{i + 1024}
                                </div>
                            </div>
                        ))}

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[800px] h-[800px] border-2 border-dashed border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
                            <div className="absolute w-[600px] h-[600px] border-2 border-dashed border-white/[0.02] rounded-full animate-[spin_40s_linear_reverse_infinite]" />
                            <Globe size={180} className="text-white/[0.03]" />
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/20">
                            <div className="flex items-center gap-10">
                                {[
                                    { l: 'Consensus', v: 'Byzantine Fault Tolerant', i: ShieldCheck },
                                    { l: 'Sync Engine', v: 'LSM-Tree Optimized', i: Database },
                                ].map((info, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 italic">{info.l}</div>
                                        <div className="text-sm font-bold text-white flex items-center gap-3 italic">
                                            <info.i size={16} className="text-emerald-500" />
                                            {info.v}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-4 rounded-3xl glass-panel text-nile-silver text-xs font-black uppercase tracking-widest flex items-center gap-3">
                                <Activity size={18} className="text-emerald-500" />
                                Global Latency: 42ms
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {regions.map((reg, i) => (
                        <GlassCard key={i}>
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-xl font-black text-white italic uppercase tracking-tighter">{reg.name}</div>
                                <div className={`text-[10px] font-black uppercase tracking-widest ${reg.status === 'Peak' ? 'text-amber-500' : 'text-emerald-500'}`}>{reg.status}</div>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-nile-silver/20">
                                    <span>CPU Load</span>
                                    <span>{reg.load}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${reg.status === 'Peak' ? 'bg-amber-500' : 'bg-nile-silver'}`} style={{ width: reg.load }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-nile-silver/40">
                                <Server size={14} />
                                {reg.nodes} Cluster Nodes Active
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

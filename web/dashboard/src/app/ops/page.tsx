"use client";

import React, { useEffect, useState } from 'react';
import {
    Activity,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Truck,
    ShieldAlert,
    BarChart3
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtocolEngine, AggregatedStats } from '@/lib/engines/ProtocolEngine';

export default function NetworkOps() {
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
            <div className="space-y-16">

                <header className="max-w-xl">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-6">Network Ops.</h1>
                    <p className="text-nile-silver/40 text-lg font-bold italic leading-relaxed">
                        Operational integrity and risk profiling. Real-time sequence monitoring across the distributed network.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Fulfillment Performance */}
                    <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Fulfillment Rate</h3>
                            <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="text-6xl font-black italic text-white tracking-tighter">{(stats.deliverySuccessRate * 100).toFixed(1)}%</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-3 italic">Verified Scale</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.deliverySuccessRate * 100}%` }} />
                        </div>
                    </div>

                    {/* Latency / Sync */}
                    <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Sync Latency</h3>
                            <Zap size={24} className="text-amber-500" />
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="text-6xl font-black italic text-white tracking-tighter">14ms</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-3 italic">Sequence Delta</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: '15%' }} />
                        </div>
                    </div>

                    {/* Risk Index */}
                    <div className="p-10 rounded-[3.5rem] bg-red-500/5 border border-red-500/10 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-red-500">Risk Matrix</h3>
                            <ShieldAlert size={24} className="text-red-500" />
                        </div>
                        <div className="flex items-end gap-4">
                            <div className="text-6xl font-black italic text-white tracking-tighter">0.02%</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-red-500/40 mb-3 italic">Anomalous Flow</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: '5%' }} />
                        </div>
                    </div>
                </div>

                {/* Efficiency Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="p-12 rounded-[4rem] bg-white/[0.01] border border-white/5 space-y-12">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                            <Truck size={28} className="text-nile-silver/20" />
                            Regional Performance
                        </h3>
                        <div className="space-y-8">
                            {[
                                { region: 'Cairo North Cluster', rate: 98.4, status: 'STABLE' },
                                { region: 'Giza Hub Network', rate: 99.1, status: 'STABLE' },
                                { region: 'Delta Logistics Grid', rate: 95.2, status: 'AUDIT_WARN' },
                            ].map((region, i) => (
                                <div key={i} className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black italic text-white uppercase tracking-tight">{region.region}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${region.status === 'STABLE' ? 'text-emerald-500' : 'text-amber-500'}`}>{region.status}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${region.status === 'STABLE' ? 'bg-white' : 'bg-amber-500'}`} style={{ width: `${region.rate}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-nile-silver/60">{region.rate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-12 rounded-[4rem] bg-gradient-to-br from-indigo-900/20 to-black border border-white/5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-10">Operational Insights</h3>
                            <p className="text-lg font-medium text-nile-silver/40 leading-relaxed italic mb-12">
                                Network throughput has stabilized following the V3 sequence deployment. Delivery ETA accuracy is currently 94% across the NileLink grid.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-8 rounded-[2rem] bg-black border border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Avg. Delivery</div>
                                <div className="text-2xl font-black italic text-white">18.2m</div>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-black border border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Node Uptime</div>
                                <div className="text-2xl font-black italic text-emerald-500">99.98%</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Risk Log */}
                <section className="space-y-10">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Audit Alerts</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">System Monitoring Active</span>
                    </div>
                    <div className="glass-panel rounded-[3.5rem] p-10 space-y-6 border-red-500/10">
                        <div className="flex items-start gap-6 p-6 rounded-3xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="text-red-500 shrink-0" size={24} />
                            <div>
                                <h4 className="text-lg font-black italic text-white uppercase tracking-tight">Sequence Mismatch Detected (Node-14)</h4>
                                <p className="text-xs font-bold text-red-500/60 leading-relaxed">A potential double-spend sequence was neutralized in the Cairo cluster. Protocol integrity maintained via peer validation.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-6 p-6 rounded-3xl bg-amber-500/5 border border-white/5">
                            <Clock className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <h4 className="text-lg font-black italic text-white uppercase tracking-tight">Delta Hub Latency Spike</h4>
                                <p className="text-xs font-bold text-nile-silver/40 leading-relaxed">Regional sync latency increased to 45ms. Traffic re-routed to Giza mainnet backup cluster.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}

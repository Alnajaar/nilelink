"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Zap,
    PieChart,
    Activity,
    ChevronDown,
    Download,
    Globe
} from 'lucide-react';
import { RestockEngine } from '@/lib/engines/RestockEngine';

export default function SupplierReports() {
    const [forecast, setForecast] = useState<any[]>([]);
    const [restock] = useState(() => new RestockEngine());

    useEffect(() => {
        const load = async () => {
            setForecast(await restock.getForecast());
        };
        load();
    }, [restock]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header */}
            <header className="p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-3 rounded-2xl bg-white/5 text-nile-silver hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Insights</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20 mt-1">Intelligence Terminal</p>
                    </div>
                </div>
                <button className="h-12 px-6 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                    <Download size={14} /> Export Protocol Data
                </button>
            </header>

            <main className="flex-1 p-6 md:p-10 space-y-12">

                {/* Demand Forecast (Intelligence Section) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Demand Intelligence</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Predicted Exhaustion Levels</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Model</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {forecast.map((f) => (
                            <div key={f.productId} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-xl font-black italic tracking-tight uppercase group-hover:text-white transition-colors">{f.name}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">ID: {f.productId}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${f.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : f.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        <Activity size={18} />
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="text-5xl font-black italic tracking-tighter">{f.predictedOutDays}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40 mb-2">Days Remaining</div>
                                </div>
                                <div className="mt-8 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${f.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : f.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.max(10, 100 - (f.predictedOutDays * 5))}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Performance Stats */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 rounded-[3.5rem] bg-white/5 border border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Credit Health Ratio</h3>
                            <PieChart size={24} className="text-nile-silver/20" />
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="w-32 h-32 rounded-full border-[10px] border-emerald-500 border-t-white/10 flex items-center justify-center relative">
                                <span className="text-2xl font-black italic">84%</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40">Healthy Accounts</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40">Watch List</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40">In Dispute</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[3.5rem] bg-white/5 border border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Volume Flux</h3>
                            <TrendingUp size={24} className="text-emerald-500/40" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: 'Grand Cairo Grill', value: '+14% Week-over-Week', icon: TrendingUp, color: 'text-emerald-500' },
                                { label: 'Sultan Bakery', value: '-2% Week-over-Week', icon: TrendingDown, color: 'text-red-500' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-white">{row.label}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${row.color}`}>{row.value}</div>
                                    </div>
                                    <row.icon size={18} className={row.color} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Network Map Placeholder */}
                <section className="p-20 rounded-[4rem] bg-gradient-to-br from-indigo-600/20 to-black border border-white/5 flex flex-col items-center justify-center text-center">
                    <Globe size={80} className="text-indigo-500/20 mb-10 animate-[spin_20s_linear_infinite]" />
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Distribution Network Map</h3>
                    <p className="text-sm font-medium text-nile-silver/30 max-w-md italic mb-10">Real-time visualization of supply events across the NileLink protocol. Active nodes: 124.</p>
                    <button className="h-14 px-10 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/30">
                        Initialize Node Grid
                    </button>
                </section>

            </main>

        </div>
    );
}

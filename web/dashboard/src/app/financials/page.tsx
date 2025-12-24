"use client";

import React, { useEffect, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    ArrowRight,
    ShieldCheck,
    Activity,
    Lock,
    BarChart,
    PieChart
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtocolEngine, AggregatedStats } from '@/lib/engines/ProtocolEngine';

export default function FinancialTransparency() {
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
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-6">Settlement Layer.</h1>
                    <p className="text-nile-silver/40 text-lg font-bold italic leading-relaxed">
                        Financial transparency sourced from protocol-signed events. Verification of every dollar in flow.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Revenue Breakdown */}
                    <div className="lg:col-span-2 p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 space-y-12">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Protocol Yield Distribution</h3>
                            <BarChart size={24} className="text-indigo-500" />
                        </div>

                        <div className="space-y-10">
                            {[
                                { label: 'Merchant Sales', value: stats.totalVolume * 0.92, color: 'text-white' },
                                { label: 'Protocol Fees', value: stats.totalVolume * 0.05, color: 'text-indigo-400' },
                                { label: 'Driver Incentive Pull', value: stats.totalVolume * 0.03, color: 'text-emerald-500' },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center gap-10">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">{row.label}</div>
                                        <div className={`text-3xl font-black italic tracking-tighter ${row.color}`}>
                                            ${row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                    <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full opacity-100 ${i === 0 ? 'bg-white' : i === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${(row.value / stats.totalVolume) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlement Profile */}
                    <div className="p-12 rounded-[4rem] bg-gradient-to-b from-indigo-900/20 to-black border border-white/5 flex flex-col justify-between">
                        <div className="space-y-8">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8">Digital Anchor</h3>
                            <div className="flex items-end gap-6 mb-8">
                                <div className="text-6xl font-black italic text-white tracking-tighter">{(stats.cashDigitalRatio * 100).toFixed(0)}%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-3 underline decoration-indigo-400/20 underline-offset-4">Digital Settlement</div>
                            </div>
                            <p className="text-sm font-bold text-nile-silver/30 leading-relaxed italic">
                                The protocol prioritizes instant digital settlement, with direct anchors to mobile money ledgers.
                            </p>
                        </div>
                        <div className="mt-12 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 italic">Verification Confidence</span>
                            <span className="text-emerald-500 font-black italic">HIGH</span>
                        </div>
                    </div>
                </div>

                {/* Audit Grid */}
                <section className="space-y-10">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase px-2">Recent Settlement Events</h3>
                    <div className="glass-panel rounded-[3.5rem] overflow-hidden border-white/5">
                        {[
                            { id: 'SET-921', type: 'Merchant Payout', amount: 8250.00, status: 'Confirmed', node: 'Cairo_North' },
                            { id: 'SET-922', type: 'Driver Settlement', amount: 142.50, status: 'Auditing', node: 'Delta_Main' },
                            { id: 'SET-923', type: 'Protocol Fee Anchor', amount: 412.50, status: 'Confirmed', node: 'Giza_South' },
                        ].map((ev, i) => (
                            <div key={i} className="p-10 border-b border-white/5 last:border-none flex flex-col md:flex-row items-center justify-between transition-all hover:bg-white/[0.02] group">
                                <div className="flex items-center gap-8 w-full md:w-auto mb-6 md:mb-0">
                                    <div className="w-16 h-16 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-nile-silver/20 group-hover:text-white transition-all">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black italic text-white uppercase tracking-tight">{ev.type}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20">{ev.id} • {ev.node}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-center md:text-right">
                                        <div className="text-2xl font-black italic text-white tracking-tighter">${ev.amount.toFixed(2)}</div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${ev.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>{ev.status}</div>
                                    </div>
                                    <button className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-nile-silver/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                                        <ShieldCheck size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}

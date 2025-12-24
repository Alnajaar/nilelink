"use client";

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, MousePointer2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Network Analytics</h1>
                    <p className="text-zinc-500 font-medium">Deep insights into protocol volume and edge node performance.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <GlassCard className="h-[400px] flex items-center justify-center border-white/5 opacity-40">
                            <div className="text-center">
                                <BarChart3 size={48} className="mx-auto mb-4 text-zinc-700" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Historical Volume Graph (Aggregating...)</p>
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <GlassCard className="p-8">
                                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Top Growth Regions</h4>
                                <div className="space-y-4">
                                    {['Middle East', 'East Africa', 'Central Asia'].map((reg, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-white">{reg}</span>
                                            <span className="text-emerald-500">+{(15 - i * 4.2).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                            <GlassCard className="p-8">
                                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Protocol Fees (24h)</h4>
                                <div className="text-2xl font-black text-white">$4,821.12</div>
                                <p className="text-[10px] text-zinc-500 mt-2 font-bold flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500" /> 2.1% higher than avg</p>
                            </GlassCard>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="font-bold text-lg mb-8">Live Feed</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Avg Order Value', value: '$12.42', icon: MousePointer2 },
                                { label: 'Settlement Time', value: '142ms', icon: Clock },
                                { label: 'Network Latency', value: '12ms', icon: TrendingDown },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-white/5 text-zinc-500">
                                        <item.icon size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">{item.label}</div>
                                        <div className="text-sm font-bold text-white uppercase">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

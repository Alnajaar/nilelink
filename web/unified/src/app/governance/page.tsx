"use client";

import React from 'react';
import { ShieldCheck, Vote, Scale, Info } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function GovernancePage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Protocol Governance</h1>
                    <p className="text-zinc-500 font-medium">Community proposals and parameter tuning for the NileLink network.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-10 border-blue-500/10 bg-blue-500/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-blue-500 text-white">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Active Proposal: [NLP-01]</h3>
                                    <p className="text-zinc-500 text-sm font-medium">Lowering anchor fees for emerging markets.</p>
                                </div>
                            </div>
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                    <span>Voting Progress</span>
                                    <span>72% FOR</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[72%] bg-blue-500" />
                                </div>
                            </div>
                            <button className="px-8 py-3 rounded-2xl bg-white text-black font-extrabold text-sm hover:scale-105 transition-all">VOTE NOW</button>
                        </GlassCard>

                        <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] px-2 mb-6">Past Proposals</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'NLP-00', title: 'Genesis State Initialization', status: 'Passed' },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-600 font-bold font-mono text-sm">{p.id}</span>
                                        <span className="font-bold text-white text-sm">{p.title}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">{p.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <GlassCard className="p-8">
                            <h4 className="font-bold flex items-center gap-2 mb-6 text-zinc-400">
                                <Scale size={20} className="text-blue-500" />
                                Voting Power
                            </h4>
                            <div className="text-3xl font-black text-white mb-2">0.00 NLP</div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-8">Stake NL tokens to participate in governance.</p>
                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">Buy NLP Tokens</button>
                        </GlassCard>

                        <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5">
                            <div className="flex items-start gap-4">
                                <Info size={20} className="text-zinc-600 mt-1" />
                                <p className="text-zinc-500 text-xs leading-relaxed font-medium">NileLink Protocol uses a quadratic voting system to ensure fair distribution of influence across all node operators.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

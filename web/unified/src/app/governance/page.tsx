"use client";

import React from 'react';
import { ShieldCheck, Vote, Scale, Info, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/shared/components/Badge';

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
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-blue-500 text-white">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Active Proposal: [NLP-01]</h3>
                                        <p className="text-zinc-500 text-sm font-medium">Lowering anchor fees for emerging markets.</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="text-zinc-500">Proposed by: <span className="text-blue-400">0x742d...c1d3</span></span>
                                            <span className="text-zinc-500">Ends: <span className="text-white">2024-01-20 23:59 UTC</span></span>
                                        </div>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-emerald-400 mb-1">72%</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">FOR</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-red-400 mb-1">28%</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AGAINST</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-zinc-400 mb-1">1,247</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">VOTES</div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                    <span>Voting Progress</span>
                                    <span>72% FOR • 28% AGAINST</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                                    <div className="h-full w-[72%] bg-emerald-500" />
                                    <div className="h-full w-[28%] bg-red-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={18} />
                                    VOTE FOR
                                </button>
                                <button className="px-8 py-4 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                                    <XCircle size={18} />
                                    VOTE AGAINST
                                </button>
                            </div>
                        </GlassCard>

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em]">Recent Proposals</h3>
                            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all">
                                Create Proposal
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'NLP-00', title: 'Genesis State Initialization', status: 'Passed', votes: 1247, result: '95% For' },
                                { id: 'NLP-02', title: 'Validator Node Expansion', status: 'Passed', votes: 892, result: '87% For' },
                                { id: 'NLP-03', title: 'Protocol Fee Adjustment', status: 'Rejected', votes: 654, result: '43% For' },
                                { id: 'NLP-04', title: 'Cross-Chain Bridge Implementation', status: 'Passed', votes: 1023, result: '78% For' },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-600 font-bold font-mono text-sm">{p.id}</span>
                                        <div>
                                            <span className="font-bold text-white text-sm block">{p.title}</span>
                                            <span className="text-xs text-zinc-500">{p.votes} votes • {p.result}</span>
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] font-bold uppercase ${p.status === 'Passed'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {p.status}
                                    </Badge>
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
                            <div className="text-3xl font-black text-white mb-2">1,247.89 NLP</div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Your Governance Stake</p>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Voting Weight</span>
                                    <span className="font-bold text-white">0.12%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Active Proposals</span>
                                    <span className="font-bold text-blue-400">3</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Participation Rate</span>
                                    <span className="font-bold text-emerald-400">87%</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all uppercase tracking-widest">
                                    Stake More Tokens
                                </button>
                                <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
                                    View Voting History
                                </button>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h4 className="font-bold flex items-center gap-2 mb-6 text-zinc-400">
                                <Vote size={20} className="text-purple-500" />
                                Proposal Stats
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Total Proposals</span>
                                    <span className="text-sm font-bold text-white">47</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Pass Rate</span>
                                    <span className="text-sm font-bold text-emerald-400">78%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Avg. Voting Period</span>
                                    <span className="text-sm font-bold text-white">7 days</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Quorum Required</span>
                                    <span className="text-sm font-bold text-blue-400">25%</span>
                                </div>
                            </div>
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

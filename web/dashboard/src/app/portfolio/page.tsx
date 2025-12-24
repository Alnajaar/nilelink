"use client";

import React from 'react';
import { PieChart, Wallet, ArrowUpRight, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function PortfolioPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">My Portfolio</h1>
                        <p className="text-zinc-500 font-medium">Manage your restaurant investments and node ownership.</p>
                    </div>
                    <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 shadow-xl shadow-blue-600/20 flex items-center gap-2">
                        <Plus size={18} />
                        New Investment
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <GlassCard className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Investment Distribution</h3>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Allocation</div>
                        </div>
                        <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-30">
                            <div className="text-center">
                                <PieChart size={48} className="mx-auto mb-4 text-zinc-600" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Connect Wallet to view assets</p>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="space-y-8">
                        <GlassCard className="bg-emerald-500/5 border-emerald-500/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Wallet size={20} className="text-emerald-500" />
                                <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Total Dividends</span>
                            </div>
                            <div className="text-4xl font-black text-white mb-2">$0.00</div>
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                <ArrowUpRight size={14} /> Ready to Claim
                            </div>
                            <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">Withdraw Assets</button>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

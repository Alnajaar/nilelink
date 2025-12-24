"use client";

import React from 'react';
import { Database, Search, Filter, ArrowDownToLine } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function LedgerPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Protocol Ledger</h1>
                        <p className="text-zinc-500 font-medium">Verify every transaction anchored to the global NileLink state.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                            <ArrowDownToLine size={14} />
                            Export CSV
                        </button>
                    </div>
                </header>

                <GlassCard className="p-0 border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-4 flex-1 max-w-md">
                            <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 focus-within:border-blue-500/30 transition-all text-sm">
                                <Search size={16} className="text-zinc-600" />
                                <input type="text" placeholder="Search Hash or ID..." className="bg-transparent border-none focus:outline-none w-full" />
                            </div>
                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500">
                                <Filter size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 8,492 Blocks</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 124ms Settlement Avg</span>
                        </div>
                    </div>

                    <div className="p-12 text-center flex flex-col items-center gap-4 opacity-50">
                        <Database size={64} strokeWidth={1} className="text-zinc-700" />
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Data Loading...</h3>
                            <p className="text-sm text-zinc-500 max-w-xs mx-auto">Connecting to the D1 Edge Ledger to fetch the latest state anchors.</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}

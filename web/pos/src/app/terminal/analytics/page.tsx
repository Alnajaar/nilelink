"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    RefreshCw
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';

export default function AnalyticsPage() {
    const { journalEngine } = usePOS();
    const [report, setReport] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (journalEngine) {
            const pl = journalEngine.getReport('PL');
            setReport(pl);
        }
    }, [journalEngine, refreshTrigger]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(amount);
    };

    if (!report) return <div className="p-8 text-white">Loading Financials...</div>;

    return (
        <div className="h-full flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Real-Time P&L</h1>
                    <p className="text-nile-silver/50 font-bold uppercase tracking-widest text-xs">Live Double-Entry Ledger</p>
                </div>
                <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-black uppercase text-xs"
                >
                    <RefreshCw size={14} />
                    Refresh Ledger
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-500">
                            <TrendingUp size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">+ Real-Time</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 mb-2">Total Revenue</div>
                    <div className="text-4xl font-black text-white tracking-tighter">{formatCurrency(report.totalRevenue)}</div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-rose-500/20 text-rose-500">
                            <Wallet size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase">- Expenses</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/50 mb-2">Total Expenses (COGS)</div>
                    <div className="text-4xl font-black text-white tracking-tighter">{formatCurrency(report.totalExpenses)}</div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-blue-500/10 border border-blue-500/20">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-500">
                            <PieChart size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-black uppercase">Net Margin</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500/50 mb-2">Net Profit</div>
                    <div className="text-4xl font-black text-white tracking-tighter">{formatCurrency(report.netProfit)}</div>
                </div>
            </div>

            {/* Detailed Ledger */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col overflow-hidden">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                        <DollarSign size={20} className="text-emerald-500" />
                        Revenue Breakdown
                    </h3>
                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        {report.revenue.map((acc: any) => (
                            <div key={acc.code} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div>
                                    <div className="font-bold text-white">{acc.name}</div>
                                    <div className="text-[10px] text-nile-silver/40 font-black uppercase tracking-widest">Code: {acc.code}</div>
                                </div>
                                <div className="text-emerald-500 font-black tracking-tight text-lg">{formatCurrency(acc.balance)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col overflow-hidden">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                        <CreditCard size={20} className="text-rose-500" />
                        Expense Breakdown
                    </h3>
                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        {report.expenses.map((acc: any) => (
                            <div key={acc.code} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div>
                                    <div className="font-bold text-white">{acc.name}</div>
                                    <div className="text-[10px] text-nile-silver/40 font-black uppercase tracking-widest">Code: {acc.code}</div>
                                </div>
                                <div className="text-rose-500 font-black tracking-tight text-lg">{formatCurrency(acc.balance)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

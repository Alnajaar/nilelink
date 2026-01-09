"use client";

import React, { useState } from 'react';
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
    Calendar, ChevronRight, PieChart, Activity,
    ShieldCheck, DollarSign, Download, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function EarningsHub() {
    const stats = {
        balance: 1242.80,
        pending: 142.50,
        thisWeek: 850.20,
        target: 1000.00
    };

    const history = [
        { id: 'TX-8921', date: 'Today, 14:30', type: 'Payout', amount: 12.50, status: 'Settled' },
        { id: 'TX-8920', date: 'Today, 12:15', type: 'Payout', amount: 42.00, status: 'Settled' },
        { id: 'TX-8919', date: 'Yesterday', type: 'Weekly Settlement', amount: -650.00, status: 'Transfer' },
        { id: 'TX-8918', date: 'Oct 23', type: 'Referral Bonus', amount: 50.00, status: 'Settled' }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black text-text tracking-tighter uppercase leading-tight">Earnings Hub</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Financial Nexus • NileLink Treasury</p>
            </header>

            {/* main Balance Card */}
            <Card className="p-10 border-2 border-text bg-white relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-[2000ms]">
                    <Wallet size={320} />
                </div>
                <div className="relative">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Available for Instant Payout</p>
                            <h2 className="text-6xl font-black font-mono tracking-tighter text-text">${stats.balance.toFixed(2)}</h2>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[10px] uppercase tracking-widest px-3 py-1">
                            Verified Node
                        </Badge>
                    </div>

                    <div className="flex gap-4">
                        <Button className="flex-1 h-16 bg-text text-background font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary transition-all shadow-xl shadow-text/10">
                            Cash Out Now
                        </Button>
                        <Button variant="outline" className="w-16 h-16 border-2 border-surface flex items-center justify-center text-text hover:border-text rounded-2xl transition-all">
                            <Download size={24} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Performance Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 border-2 border-surface bg-background">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Weekly Target</p>
                            <p className="text-xl font-black font-mono tracking-tight">${stats.thisWeek.toFixed(2)} / ${stats.target}</p>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.thisWeek / stats.target) * 100}%` }}
                            className="h-full bg-primary"
                        />
                    </div>
                </Card>

                <Card className="p-8 border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                    <Zap className="absolute -right-4 -bottom-4 text-primary opacity-10 group-hover:scale-125 transition-transform" size={100} />
                    <div className="relative">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Next Mission Forecast</p>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-text">+$15-25 Est.</h3>
                        <p className="text-[10px] font-bold text-text opacity-40 uppercase tracking-widest mt-2">Demand surge in Zamalek</p>
                    </div>
                </Card>
            </div>

            {/* Transaction Ledger */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Transaction Ledger</h3>
                    <div className="flex items-center gap-1.5 opacity-30">
                        <Calendar size={12} />
                        <span className="text-[10px] font-black uppercase">Filter by Date</span>
                    </div>
                </div>
                <div className="space-y-4">
                    {history.map((tx, i) => (
                        <Card key={tx.id} className="p-6 border-2 border-surface bg-white hover:border-text transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-text tracking-tighter uppercase leading-none mb-1">{tx.type}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-text opacity-20 uppercase tracking-widest">
                                            {tx.date} • {tx.id}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black font-mono tracking-tighter ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-500'
                                        }`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </div>
                                    <Badge className="bg-surface text-text/30 font-black text-[8px] uppercase tracking-tighter border-0">{tx.status}</Badge>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Protocol Security Disclaimer */}
            <div className="p-8 rounded-[3rem] bg-text/5 border border-text/10 flex items-start gap-4">
                <ShieldCheck size={20} className="text-primary shrink-0 mt-1" />
                <p className="text-[11px] text-text opacity-40 leading-relaxed font-bold uppercase tracking-wider italic">
                    "All earnings are settled via the NileLink Economic Protocol. Funds are cryptographically secured and verified by 12 regional validator nodes."
                </p>
            </div>
        </div>
    );
}

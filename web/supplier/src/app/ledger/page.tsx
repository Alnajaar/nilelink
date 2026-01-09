"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Wallet,
    AlertCircle,
    ShieldCheck,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { CreditEngine } from '@/lib/engines/CreditEngine';

import AuthGuard from '@shared/components/AuthGuard';

export default function CreditLedger() {
    const [clients, setClients] = useState<any[]>([]);
    const [creditEngine] = useState(() => new CreditEngine());

    useEffect(() => {
        const load = async () => {
            const data = creditEngine['ledger'].getData();
            const enhanced = await Promise.all(data.credits.map(async (c: any) => {
                const status = await creditEngine.getCreditStatus(c.clientId);
                return { ...c, ...status };
            }));
            setClients(enhanced);
        };
        load();
    }, [creditEngine]);

    return (
        <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
                {/* Header */}
                <header className="p-8 flex items-center gap-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                    <Link href="/" className="p-3 rounded-2xl bg-white/5 text-nile-silver hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Credit Ledger</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20 mt-1">Accounts Receivable</p>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-10 space-y-10">
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 gap-4">
                            <Search size={20} className="text-nile-silver/20" />
                            <input type="text" placeholder="Search accounts..." className="bg-transparent border-none focus:outline-none flex-1 font-bold text-sm" />
                        </div>
                        <button className="h-16 px-8 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-nile-silver/60">
                            <Filter size={18} /> Filters
                        </button>
                    </div>

                    {/* Ledger Table (Mother-test style cards) */}
                    <div className="space-y-6">
                        {clients.map((client) => (
                            <div key={client.clientId} className="p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                                <div className="flex flex-col xl:flex-row justify-between gap-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">{client.clientName}</h3>
                                            {client.riskLevel === 'CRITICAL' && <AlertCircle size={24} className="text-red-500 animate-pulse" />}
                                        </div>
                                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20">
                                            <span className="flex items-center gap-2"><Calendar size={12} /> Last Payment: {client.lastPaymentDate ? new Date(client.lastPaymentDate).toLocaleDateString() : 'Never'}</span>
                                            <span className="flex items-center gap-2"><ShieldCheck size={12} /> ID: {client.clientId}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30 mb-2">Current Balance</div>
                                            <div className={`text-3xl font-black italic tracking-tighter ${client.balance > 0 ? 'text-white' : 'text-emerald-500'}`}>
                                                ${client.balance.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30 mb-2">Credit Limit</div>
                                            <div className="text-3xl font-black italic tracking-tighter text-nile-silver/60">
                                                ${client.limit.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30 mb-2">Risk Factor</div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                                                    <div
                                                        className="h-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (client.balance / client.limit) * 100)}%`, backgroundColor: client.color }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black uppercase italic" style={{ color: client.color }}>{client.riskLevel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button className="h-20 w-full xl:w-20 rounded-3xl bg-white/5 border border-white/5 text-nile-silver hover:bg-white hover:text-black transition-all flex items-center justify-center group-hover:scale-105">
                                            <ArrowUpRight size={32} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Filter,
    DollarSign,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { DeliveryProtocol } from '@/lib/protocol/DeliveryProtocol';
import { LedgerEvent } from '@/lib/ledger/MobileLedger';

export default function WalletPage() {
    const [cash, setCash] = useState(0);
    const [history, setHistory] = useState<LedgerEvent[]>([]);
    const [protocol] = useState(() => new DeliveryProtocol());

    useEffect(() => {
        const load = async () => {
            const currentCash = await protocol.getCashInHand();
            const events = await (protocol as any).ledger.getEvents(); // Accessing ledger directly for history
            setCash(currentCash);
            setHistory(events.filter((e: LedgerEvent) => e.type === 'CASH_COLLECTED' || e.type === 'CASH_DEPOSITED').reverse());
        };
        load();
    }, [protocol]);

    return (
        <div className="flex flex-col gap-8 px-6">

            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Vault</h1>
                    <p className="text-xs font-black text-nile-silver/30 uppercase tracking-[0.2em]">Cash Custody Ledger</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                    Audited
                </div>
            </header>

            {/* Total Balance Card */}
            <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40 mb-2">Total Cash In Hand</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white italic tracking-tighter">{cash.toFixed(2)}</span>
                        <span className="text-lg font-bold text-nile-silver/20 uppercase tracking-widest">EGP</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Wallet size={140} />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="text-xs font-black text-nile-silver/20 uppercase tracking-widest mb-1">Today's Take</div>
                    <div className="text-xl font-black text-emerald-400">+{cash.toFixed(2)}</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="text-xs font-black text-nile-silver/20 uppercase tracking-widest mb-1">Discrepancy</div>
                    <div className="text-xl font-black text-white">0.00</div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black text-nile-silver/40 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Activity Log
                    </h2>
                    <button className="p-2 rounded-lg bg-white/5 text-nile-silver">
                        <Filter size={14} />
                    </button>
                </div>

                <div className="space-y-3">
                    {history.length > 0 ? history.map((event) => (
                        <div key={event.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.type === 'CASH_COLLECTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-50'}`}>
                                    {event.type === 'CASH_COLLECTED' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white uppercase tracking-tight">
                                        {event.type === 'CASH_COLLECTED' ? `Order #${event.payload.orderId.split('-')[1]}` : 'Deposit to Store'}
                                    </div>
                                    <div className="text-[10px] font-black text-nile-silver/20 uppercase tracking-widest">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.id.substring(0, 8)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-black italic ${event.type === 'CASH_COLLECTED' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                    {event.type === 'CASH_COLLECTED' ? '+' : '-'}{event.payload.amount.toFixed(2)}
                                </div>
                                <div className="text-[10px] font-bold text-nile-silver/20 uppercase tracking-widest">EGP</div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
                            <AlertCircle size={40} />
                            <p className="text-xs font-black uppercase tracking-widest italic">No financial events recorded</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <p className="text-[11px] font-medium text-amber-500/70 leading-relaxed italic">
                    Any mismatch between the physical cash and this digital ledger must be reported during shift closure.
                </p>
            </div>

        </div>
    );
}

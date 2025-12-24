"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ShieldCheck,
    History,
    ChevronRight,
    Star,
    ExternalLink
} from 'lucide-react';
import { OrderLedger, ImmutableReceipt } from '@/lib/engines/OrderLedger';

export default function HistoryPage() {
    const [history, setHistory] = useState<ImmutableReceipt[]>([]);
    const [ledger] = useState(() => new OrderLedger());

    useEffect(() => {
        setHistory(ledger.getHistory().reverse());
    }, [ledger]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header */}
            <header className="p-8 flex items-center gap-6">
                <Link href="/" className="p-3 rounded-2xl bg-white/5 text-nile-silver hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Trust Archive</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/30 mt-1">Verified Order Ledger</p>
                </div>
            </header>

            <main className="flex-1 px-6 pb-40 space-y-6">

                {history.length > 0 ? history.map((order) => (
                    <div key={order.id} className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6 group active:bg-white/[0.08] transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#111] flex items-center justify-center text-2xl">
                                    📜
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white italic tracking-tight">{order.merchantName}</h3>
                                    <p className="text-[10px] font-bold text-nile-silver/20 uppercase tracking-widest">
                                        {new Date(order.timestamp).toLocaleDateString()} • {order.id}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-black italic text-white">${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {order.status === 'COMPLETED' ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={12} /> Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={12} /> In Pulse
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-medium text-nile-silver/20 italic max-w-[200px] truncate">
                                Reference Hash: {order.orderHash}
                            </p>
                            <Link href={`/track/${order.id}`} className="p-3 rounded-xl bg-white/5 text-nile-silver group-hover:bg-white group-hover:text-black transition-all">
                                <ExternalLink size={18} />
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                        <History size={64} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] italic">No trusted records found</p>
                    </div>
                )}

            </main>

        </div>
    );
}

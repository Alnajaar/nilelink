"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { SupplierEngine } from '@/lib/engines/SupplierEngine';

const INITIAL_ORDERS = [
    { id: 'ORD-901', client: 'Grand Cairo Grill', items: 'Ground Beef (250kg)', total: 3000, status: 'INCOMING', time: '10m ago' },
    { id: 'ORD-902', client: 'Sultan Bakery', items: 'White Flour (50 bags)', total: 2250, status: 'INCOMING', time: '25m ago' },
    { id: 'ORD-903', client: 'Giza Sushi House', items: 'Rice (100kg), Nori (500)', total: 850, status: 'ACCEPTED', time: '1h ago' },
];

export default function FulfillmentQueue() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [engine] = useState(() => new SupplierEngine());

    const handleAccept = async (order: any) => {
        const success = await engine.acceptOrder(order.id, order.id, order.total);
        if (success) {
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ACCEPTED' } : o));
        }
    };

    const handleReject = (id: string) => {
        setOrders(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header */}
            <header className="p-8 flex items-center gap-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/" className="p-3 rounded-2xl bg-white/5 text-nile-silver hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Fulfillment</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20 mt-1">Live Order Stream</p>
                </div>
                <div className="hidden md:flex items-center gap-4 bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Ledger Sync: Active</span>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 space-y-6">

                {/* Status Tabs */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {['Incoming', 'Accepted', 'In Transit', 'Completed'].map((tab, i) => (
                        <button key={tab} className={`px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-nile-silver/40 hover:bg-white/10'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                            <div className="flex flex-col lg:flex-row gap-8 justify-between">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-nile-silver/10 group-hover:text-emerald-500 transition-colors">
                                        <Package size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{order.client}</h3>
                                            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{order.id}</span>
                                        </div>
                                        <p className="text-lg font-bold text-nile-silver/60 italic mb-4">{order.items}</p>
                                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20">
                                            <span className="flex items-center gap-2"><Clock size={12} /> {order.time}</span>
                                            <span className="flex items-center gap-2 text-white"><ShieldCheck size={12} fill="white" /> Protocol Secured</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 lg:text-right">
                                    <div className="mb-4 sm:mb-0 sm:mr-8 text-center sm:text-right">
                                        <div className="text-3xl font-black text-white italic tracking-tighter">${order.total.toLocaleString()}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">Credit Transaction</div>
                                    </div>

                                    {order.status === 'INCOMING' ? (
                                        <div className="flex gap-4 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleReject(order.id)}
                                                className="h-16 flex-1 sm:w-16 sm:px-0 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <XCircle size={24} className="sm:inline" />
                                                <span className="sm:hidden ml-2 font-black italic uppercase">Reject</span>
                                            </button>
                                            <button
                                                onClick={() => handleAccept(order)}
                                                className="h-16 flex-1 sm:px-12 rounded-2xl bg-emerald-500 text-black font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                                            >
                                                Accept Order
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="h-16 px-12 rounded-2xl bg-white/10 border border-white/10 text-white font-black italic uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all">
                                            <Truck size={20} /> Mark Shipped
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main>

        </div>
    );
}

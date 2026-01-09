"use client";

import React, { useState } from 'react';
import {
    History,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Receipt,
    Download
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const orders = [
        { id: 'ORD-7291', customer: 'Walk-in', time: '12:45 PM', total: 42.50, status: 'Completed', type: 'Dine-in' },
        { id: 'ORD-7290', customer: 'Sarah J.', time: '12:30 PM', total: 18.20, status: 'Completed', type: 'Takeaway' },
        { id: 'ORD-7289', customer: 'Walk-in', time: '12:15 PM', total: 65.00, status: 'Voided', type: 'Dine-in' },
        { id: 'ORD-7288', customer: 'Mike R.', time: '11:55 AM', total: 32.25, status: 'Completed', type: 'Delivery' },
        { id: 'ORD-7287', customer: 'Walk-in', time: '11:30 AM', total: 12.00, status: 'Completed', type: 'Takeaway' },
    ];

    return (
        <div className="p-8 flex flex-col h-full gap-8 bg-background">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <History size={22} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main uppercase tracking-tight">Order Ledger</h1>
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs ml-1">Historical Transaction Anchors</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="font-black uppercase tracking-widest">
                        <ArrowLeft size={16} />
                    </Button>
                    <Button size="sm" className="font-black uppercase tracking-widest px-6 shadow-xl shadow-primary/20">
                        EXPORT REPORT
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                {[
                    { label: 'Today Total', value: '$1,240.50', icon: Receipt, color: 'text-primary' },
                    { label: 'Completed', value: '42 Orders', icon: CheckCircle2, color: 'text-success' },
                    { label: 'Avg Time', value: '18 min', icon: Clock, color: 'text-info' },
                    { label: 'Refunds', value: '$0.00', icon: History, color: 'text-danger' },
                ].map((stat, idx) => (
                    <Card key={idx} className="p-6 rounded-[32px] border-border-subtle bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg bg-background-subtle ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</span>
                        </div>
                        <h4 className="text-2xl font-black text-text-main">{stat.value}</h4>
                    </Card>
                ))}
            </div>

            <Card className="flex-1 rounded-[40px] bg-white border-border-subtle p-8 overflow-hidden flex flex-col shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-8 shrink-0">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find orders by ID, customer or amount..."
                            className="w-full h-14 pl-12 pr-4 bg-background-subtle border border-border-subtle rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-text-subtle opacity-60">
                                <th className="px-6 pb-2">Order ID</th>
                                <th className="px-6 pb-2">Customer</th>
                                <th className="px-6 pb-2">Type</th>
                                <th className="px-6 pb-2 text-right">Total</th>
                                <th className="px-6 pb-2 text-center">Status</th>
                                <th className="px-6 pb-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-background-subtle transition-colors">
                                    <td className="px-6 py-5 bg-background-subtle rounded-l-[24px] group-hover:bg-white border-y border-l border-transparent group-hover:border-border-subtle transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-black text-text-main uppercase text-sm">{order.id}</span>
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{order.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                        <span className="text-sm font-bold text-text-main">{order.customer}</span>
                                    </td>
                                    <td className="px-6 py-5 group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                        <Badge variant="info" className="text-[8px] font-black uppercase">{order.type}</Badge>
                                    </td>
                                    <td className="px-6 py-5 text-right group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                        <span className="text-sm font-black text-primary font-mono">${order.total.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                        <Badge
                                            variant={order.status === 'Completed' ? 'success' : 'error'}
                                            className="text-[8px] font-black uppercase"
                                        >
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 bg-background-subtle rounded-r-[24px] group-hover:bg-white text-right border-y border-r border-transparent group-hover:border-border-subtle transition-all">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-background-subtle rounded-xl">
                                                <Download size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-background-subtle rounded-xl">
                                                <ArrowUpRight size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

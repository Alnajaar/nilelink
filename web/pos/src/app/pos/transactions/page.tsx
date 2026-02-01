"use client";

import { useState } from 'react';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';

const mockTransactions = [
    {
        id: 'TXN001',
        type: 'SALE',
        amount: 45.99,
        status: 'COMPLETED',
        timestamp: '2026-01-11T10:00:00Z',
        customer: 'John Doe'
    },
    {
        id: 'TXN002',
        type: 'REFUND',
        amount: -12.50,
        status: 'COMPLETED',
        timestamp: '2026-01-11T09:30:00Z',
        customer: 'Jane Smith'
    }
];

export default function Transactions() {
    const [filter, setFilter] = useState('ALL');

    return (
        <div className="space-y-12 p-10 min-h-screen bg-background-primary/20 backdrop-blur-3xl rounded-[3rem] border-2 border-border-default/50 shadow-2xl relative overflow-hidden bg-mesh-primary antialiased">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic lg:text-5xl">Protocol Ledger</h1>
                    <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.4em] opacity-40 mt-3 italic">Analytical stream of historical anchors</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    {['ALL', 'SALE', 'REFUND'].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? 'primary' : 'glass'}
                            className={`h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic transition-all ${filter === f ? 'shadow-glow-primary/20 scale-105' : 'border-border-default/50 hover:border-primary/30'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <Card variant="glass" className="p-10 lg:p-12 rounded-[3.5rem] border-2 border-border-default/50 shadow-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                <div className="space-y-6 relative z-10">
                    {mockTransactions
                        .filter(t => filter === 'ALL' || t.type === filter)
                        .map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-8 bg-background-tertiary/20 hover:bg-background-tertiary/40 border-2 border-border-default/30 hover:border-primary/30 rounded-[2.5rem] transition-all duration-500 group/item shadow-lg hover:translate-x-3">
                                <div className="flex items-center gap-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-inner transition-all duration-500 ${transaction.type === 'SALE' ? 'bg-success/10 border-success/30 text-success group-hover/item:shadow-glow-success/20' : 'bg-error/10 border-error/30 text-error group-hover/item:shadow-glow-error/20'}`}>
                                        <span className="text-[10px] font-black">{transaction.type[0]}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[13px] font-black text-text-primary uppercase tracking-widest italic group-hover/item:text-primary transition-colors">{transaction.id}</p>
                                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-border-default/40" />
                                            {transaction.customer}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="flex items-center justify-end gap-3 px-6 py-2.5 rounded-2xl bg-background-card/60 border border-border-subtle/30 shadow-inner">
                                        <CurrencyDisplay amount={transaction.amount} className={`text-sm font-black italic tabular-nums tracking-tight ${transaction.amount < 0 ? 'text-error' : 'text-success'}`} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Badge variant={transaction.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-full italic shadow-sm">
                                            {transaction.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {mockTransactions.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.5em] opacity-30 italic">No historical nodes detected in filter range</p>
                    </div>
                )}
            </Card>

            <style jsx global>{`
                .bg-mesh-primary {
                    background-image: radial-gradient(at 0% 0%, rgba(var(--primary-rgb), 0.03) 0, transparent 50%),
                                      radial-gradient(at 100% 0%, rgba(var(--primary-rgb), 0.03) 0, transparent 50%);
                }
            `}</style>
        </div>
    );
}

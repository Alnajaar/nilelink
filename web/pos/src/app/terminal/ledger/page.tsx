"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Clock, AlertTriangle, Search, Filter,
    Download, ChevronRight, FileText, TrendingUp,
    TrendingDown, DollarSign, Calendar, Eye, BarChart3
} from 'lucide-react';

import { usePOS } from '@/contexts/POSContext';
import { PERMISSION } from '@/utils/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';

type TransactionType = 'SALE' | 'REFUND' | 'CASH_IN' | 'CASH_OUT' | 'VOID';

interface Transaction {
    id: string;
    hash: string;
    timestamp: string;
    type: TransactionType;
    amount: number;
    actor: string;
    verified: boolean;
    details?: string;
}

export default function AdvancedLedger() {
    const { localLedger, currentRole } = usePOS();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock transactions
    const [transactions] = useState<Transaction[]>([
        {
            id: 'tx-001',
            hash: '0x7d5a8f2b...4e9c',
            timestamp: new Date().toISOString(),
            type: 'SALE',
            amount: 45.50,
            actor: 'Sara Mohamed',
            verified: true,
            details: 'Table 5 - Order #A142'
        },
        {
            id: 'tx-002',
            hash: '0x3f1c9d4a...7b2e',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            type: 'CASH_IN',
            amount: 200.00,
            actor: 'Ahmed Hassan',
            verified: true,
            details: 'Manager deposit'
        },
        {
            id: 'tx-003',
            hash: '0x9e6b2c1f...3a5d',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: 'SALE',
            amount: 32.00,
            actor: 'Hassan Ahmed',
            verified: true,
            details: 'Takeaway - Order #A141'
        },
        {
            id: 'tx-004',
            hash: '0x2a8f5d9c...6e4b',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            type: 'REFUND',
            amount: -18.50,
            actor: 'Sara Mohamed',
            verified: true,
            details: 'Item unavailable'
        },
        {
            id: 'tx-005',
            hash: '0x8c4e7b3a...9f1d',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            type: 'CASH_OUT',
            amount: -50.00,
            actor: 'Ahmed Hassan',
            verified: true,
            details: 'Petty cash withdrawal'
        },
    ]);

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.details?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'ALL' || tx.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalIn = filteredTransactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalOut = Math.abs(filteredTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0));

    const netFlow = totalIn - totalOut;

    const getTypeColor = (type: TransactionType) => {
        const colors: Record<TransactionType, string> = {
            SALE: 'bg-primary/10 text-primary',
            REFUND: 'bg-secondary/10 text-secondary',
            CASH_IN: 'bg-primary/10 text-primary',
            CASH_OUT: 'bg-secondary/10 text-secondary',
            VOID: 'bg-text-primary/10 text-text-primary'
        };
        return colors[type] || 'bg-neutral text-text-primary';
    };

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-border-subtle">
                <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Chain Protocol V4.2</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                            Transaction <span className="text-primary">Ledger</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <PermissionGuard require={PERMISSION.LEDGER_VIEW}>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => alert('Initiating Zero-Knowledge Proof for Escrow Settlement...')}
                                    className="h-14 px-8 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 group"
                                >
                                    <ShieldCheck size={18} className="mr-3 text-primary animate-pulse" />
                                    Commit to On-Chain Escrow
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-border-subtle font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all bg-white shadow-xl"
                                >
                                    <Download size={18} className="mr-3" />
                                    Export Protocol
                                </Button>
                            </div>
                        </PermissionGuard>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 relative z-10">
                {/* Stats Matrix */}
                <PermissionGuard require={PERMISSION.REPORTS_VIEW_FINANCIAL}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <Card className="rounded-[3rem] p-10 bg-white border-border-subtle shadow-2xl group hover:scale-[1.01] transition-transform">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-primary/5 rounded-3xl">
                                    <TrendingUp size={24} className="text-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40">Inflow</span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-text-primary/60">Total Revenue</h3>
                            <p className="text-4xl font-black tracking-tighter italic">
                                <CurrencyDisplay amount={totalIn} currency="USD" />
                            </p>
                        </Card>

                        <Card className="rounded-[3rem] p-10 bg-white border-border-subtle shadow-2xl group hover:scale-[1.01] transition-transform text-secondary">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-secondary/5 rounded-3xl">
                                    <TrendingDown size={24} className="text-secondary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Outflow</span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-secondary/60 italic">Total Refunds</h3>
                            <p className="text-4xl font-black tracking-tighter italic">
                                <CurrencyDisplay amount={totalOut} currency="USD" />
                            </p>
                        </Card>

                        <Card className="rounded-[3rem] p-10 bg-primary border-none shadow-2xl group hover:scale-[1.01] transition-transform text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-white/10 rounded-3xl">
                                    <BarChart3 size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Success</span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-80 italic">Net Position</h3>
                            <p className="text-4xl font-black tracking-tighter italic">
                                <CurrencyDisplay amount={netFlow} currency="USD" />
                            </p>
                        </Card>
                    </div>
                </PermissionGuard>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-primary/30 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="QUERY CRYPTOGRAPHIC HASH OR ACTOR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white rounded-3xl border border-border-subtle focus:outline-none focus:ring-4 focus:ring-primary/5 text-text-primary font-black uppercase tracking-widest text-xs placeholder:text-text-primary/20 shadow-xl transition-all"
                        />
                    </div>

                    <div className="flex gap-2 p-1.5 bg-white rounded-[2rem] border border-border-subtle shadow-xl items-center h-16">
                        {(['ALL', 'SALE', 'REFUND', 'CASH_IN', 'CASH_OUT'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`h-full px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-text-primary/40 hover:text-text-primary hover:bg-neutral'
                                    }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ledger Table */}
                <Card className="rounded-[3rem] bg-white border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Signature</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Timestamp</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Protocol Actor</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Event</th>
                                    <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Value</th>
                                    <th className="px-10 py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40 italic">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                <AnimatePresence mode="popLayout">
                                    {filteredTransactions.map((tx, idx) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-neutral transition-colors"
                                        >
                                            <td className="px-10 py-8 font-mono text-[11px] font-bold text-primary group-hover:scale-[1.02] origin-left transition-transform">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-primary/40" />
                                                    {tx.hash}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-text-primary/60">
                                                    <Clock size={12} className="text-primary" />
                                                    {formatTime(tx.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-neutral rounded-xl flex items-center justify-center border border-border-subtle group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                                        <span className="text-xs font-black text-primary">
                                                            {tx.actor.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">{tx.actor}</p>
                                                        {tx.details && (
                                                            <p className="text-[10px] font-bold text-text-primary/40 uppercase tracking-widest">{tx.details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <Badge className={`${getTypeColor(tx.type)} px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-none`}>
                                                    {tx.type.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-10 py-8 text-right font-black italic tracking-tighter text-lg">
                                                <span className={tx.amount > 0 ? 'text-primary' : 'text-secondary'}>
                                                    {tx.amount > 0 ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <center>
                                                    {tx.verified ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                            <ShieldCheck size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Confirmed</span>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full">
                                                            <AlertTriangle size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing</span>
                                                        </div>
                                                    )}
                                                </center>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filteredTransactions.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-neutral rounded-[2.5rem] flex items-center justify-center mb-8 border border-border-subtle">
                                    <FileText size={40} className="text-text-primary/20" />
                                </div>
                                <p className="text-2xl font-black uppercase tracking-tighter italic text-text-primary/20">Protocol Zero</p>
                                <p className="text-xs font-bold text-text-primary/30 uppercase tracking-[0.3em] mt-2">NO CRYPTOGRAPHIC EVENTS FOUND IN CURRENT FRAME</p>
                            </div>
                        )}
                    </div>
                </Card>
            </main>

            {/* Custom Scrollbar Styling */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
}


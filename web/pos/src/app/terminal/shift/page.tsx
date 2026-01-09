"use client";

import React, { useState } from 'react';
import {
    DollarSign,
    Clock,
    ArrowUpRight,
    TrendingUp,
    Users,
    Wallet,
    Calendar,
    ArrowLeft,
    ChevronRight,
    Lock,
    Unlock,
    Receipt
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function ShiftPage() {
    const router = useRouter();
    const [isShiftActive, setIsShiftActive] = useState(true);

    const shiftData = {
        startTime: '08:30 AM',
        staffName: 'Ahmed Hassan',
        openingCash: 500.00,
        expectedCash: 3240.50,
        actualCash: 0,
        sales: {
            cash: 2140.00,
            card: 1100.50,
            total: 3240.50
        }
    };

    return (
        <div className="p-8 flex flex-col h-full gap-8 bg-background">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Clock size={22} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main uppercase tracking-tight">Shift Control</h1>
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs ml-1">Terminal Activity & Cash Accountability</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="font-black uppercase tracking-widest px-4">
                        <ArrowLeft size={16} />
                    </Button>
                    <Badge variant={isShiftActive ? "success" : "error"} className="px-6 py-2 font-black uppercase tracking-widest border-2">
                        {isShiftActive ? "CURRENT SHIFT ACTIVE" : "SHIFT CLOSED"}
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                {/* Left Column: Shift Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-8 rounded-[40px] border-border-subtle bg-white shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Sales</span>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-text-main tracking-tight">${shiftData.sales.total.toFixed(2)}</h4>
                                <p className="text-xs font-bold text-text-muted uppercase mt-2">Earned this session</p>
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[40px] border-border-subtle bg-white shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-info/5 rounded-2xl text-info">
                                    <Receipt size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Transaction Count</span>
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-text-main tracking-tight">142</h4>
                                <p className="text-xs font-bold text-text-muted uppercase mt-2">Valid anchors</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-10 rounded-[48px] border-border-subtle bg-white shadow-sm">
                        <h3 className="text-xl font-black text-text-main uppercase tracking-widest mb-8">Cash Reconciliation</h3>

                        <div className="space-y-6">
                            {[
                                { label: 'Opening Float', value: shiftData.openingCash, icon: Wallet, color: 'text-text-muted' },
                                { label: 'Cash Collected', value: shiftData.sales.cash, icon: DollarSign, color: 'text-success' },
                                { label: 'Register Expected', value: shiftData.expectedCash, icon: Lock, color: 'text-primary' },
                            ].map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-background-subtle rounded-[24px] border border-transparent hover:border-border-subtle transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-white shadow-sm ${row.color}`}>
                                            <row.icon size={20} />
                                        </div>
                                        <span className="text-sm font-black text-text-main uppercase tracking-tight">{row.label}</span>
                                    </div>
                                    <span className="text-xl font-black font-mono text-text-main">${row.value.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Shift Actions & History */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-[40px] bg-secondary text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Session Control</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 font-medium">Started At</span>
                                <span className="font-black">{shiftData.startTime}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 font-medium">Main Cashier</span>
                                <span className="font-black">Ahmed Hassan</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 font-medium">Terminal ID</span>
                                <span className="font-black">POS-72X1</span>
                            </div>
                        </div>

                        {isShiftActive ? (
                            <Button
                                onClick={() => setIsShiftActive(false)}
                                className="w-full py-8 rounded-2xl bg-danger hover:bg-danger/90 text-white font-black uppercase tracking-widest border-0 shadow-lg shadow-danger/20"
                            >
                                CLOSE SHIFT & SYNC
                                <Lock size={20} className="ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setIsShiftActive(true)}
                                className="w-full py-8 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest border-0"
                            >
                                START NEW SHIFT
                                <Unlock size={20} className="ml-2" />
                            </Button>
                        )}

                        <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest mt-6">
                            Verified by NileLink Ledger
                        </p>
                    </Card>

                    <Card className="p-8 rounded-[40px] border-border-subtle bg-white shadow-sm">
                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-6">Recent History</h3>
                        <div className="space-y-4">
                            {[
                                { date: 'Dec 25', total: '$4,280.00', status: 'Balanced' },
                                { date: 'Dec 24', total: '$3,150.25', status: 'Overage' },
                                { date: 'Dec 23', total: '$5,900.10', status: 'Balanced' },
                            ].map((h, i) => (
                                <div key={i} className="flex justify-between items-center text-xs group cursor-pointer">
                                    <div>
                                        <p className="font-black text-text-main uppercase">{h.date}</p>
                                        <p className="text-text-muted font-bold text-[10px] uppercase">{h.status}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-text-main font-mono">{h.total}</span>
                                        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';

import {
    DollarSign, Lock, Unlock, RefreshCw, History,
    TrendingUp, AlertTriangle, CheckCircle, Calculator,
    Shield, Zap, ArrowRight, ChevronDown, Activity, Trash2
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';

export default function CashManagementPage() {
    const [shiftStatus, setShiftStatus] = useState<'open' | 'closed'>('open');
    const [activeTab, setActiveTab] = useState<'overview' | 'reconcile' | 'history'>('overview');

    const floatAmount = 250.00;
    const currentSalesCash = 1450.50;
    const expectedDrawer = floatAmount + currentSalesCash;

    const transactions = [
        { id: 1, type: 'Sale', amount: 45.50, time: '09:30 AM', user: 'Staff 1' },
        { id: 2, type: 'Sale', amount: 12.00, time: '10:15 AM', user: 'Staff 1' },
        { id: 3, type: 'Drop', amount: -200.00, time: '01:00 PM', user: 'Manager', note: 'Mid-day drop' },
        { id: 4, type: 'Sale', amount: 89.00, time: '02:30 PM', user: 'Staff 2' },
    ];

    return (
        <div className="min-h-screen bg-background-primary text-text-primary flex flex-col antialiased selection:bg-primary/20 bg-mesh-primary relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-8 lg:p-16 space-y-12 max-w-5xl mx-auto w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full flex items-center gap-2">
                                <Shield size={12} className="text-primary" />
                                <span className="text-primary text-[9px] font-black tracking-[0.3em] uppercase italic">Fiscal Continuity Node Active</span>
                            </Badge>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
                            Cash <span className="text-primary italic">Management</span>
                        </h1>
                        <p className="text-text-secondary font-bold uppercase text-[11px] tracking-[0.4em] italic opacity-70">
                            Terminal Node #01 • Status: <span className={shiftStatus === 'open' ? 'text-success' : 'text-error'}>{shiftStatus === 'open' ? 'Active Protocol' : 'Protocol Suspended'}</span>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {shiftStatus === 'open' ? (
                            <Button
                                onClick={() => setShiftStatus('closed')}
                                className="px-8 py-7 bg-error/10 border-2 border-error/30 text-error hover:bg-error/20 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center gap-3 transition-all italic text-xs shadow-glow-error/10"
                            >
                                <Lock size={20} /> Suspend Shift
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setShiftStatus('open')}
                                className="px-8 py-7 bg-success/10 border-2 border-success/30 text-success hover:bg-success/20 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center gap-3 transition-all italic text-xs shadow-glow-success/10"
                            >
                                <Unlock size={20} /> Initialize Shift
                            </Button>
                        )}
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex bg-background-card/40 p-2 rounded-[2rem] border-2 border-border-default/50 backdrop-blur-3xl inline-flex shadow-xl">
                    {['overview', 'reconcile', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-300 ${activeTab === tab
                                ? 'bg-primary text-white shadow-glow-primary'
                                : 'text-text-muted hover:text-text-primary hover:bg-background-tertiary/40'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Card variant="glass" className="p-10 border-2 border-border-default/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                                <DollarSign size={180} className="text-primary" />
                            </div>
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-10 flex items-center gap-4 italic relative z-10">
                                <Activity size={18} />
                                Drawer Manifest Status
                            </h2>
                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center p-5 bg-background-tertiary/20 backdrop-blur-3xl rounded-2xl border border-border-subtle/30">
                                    <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] italic">Opening Float</span>
                                    <span className="text-2xl font-black italic tabular-nums tracking-tighter">${floatAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-5 bg-success/5 backdrop-blur-3xl rounded-2xl border border-success/20">
                                    <span className="text-[11px] font-black text-success uppercase tracking-[0.2em] italic">Accumulated Cash Sales</span>
                                    <span className="text-2xl font-black text-success italic tabular-nums tracking-tighter">+${currentSalesCash.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-border-default/30 my-6" />
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-2 italic">Expected Ledger Total</p>
                                        <p className="text-5xl font-black text-text-primary italic tabular-nums tracking-tighter">${expectedDrawer.toFixed(2)}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-glow-primary/20">
                                        <Zap size={24} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            {[
                                { label: 'Add Float / Pay In', sub: 'Inject liquidity into protocol', icon: TrendingUp, color: 'info' },
                                { label: 'Cash Drop / Pay Out', sub: 'Extract liquidity from drawer', icon: RefreshCw, color: 'warning' },
                                { label: 'No Sale Engagement', sub: 'Bypass logic / Open drawer', icon: Calculator, color: 'accent' }
                            ].map((item, i) => (
                                <button key={i} className="w-full p-8 bg-background-card/40 backdrop-blur-3xl border-2 border-border-default/50 hover:border-primary/40 rounded-[2.5rem] flex items-center justify-between group transition-all duration-500 shadow-xl overflow-hidden relative">
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-14 h-14 bg-background-tertiary/60 rounded-2xl flex items-center justify-center border border-border-subtle/30 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                                            <item.icon size={24} className="text-text-muted transition-colors group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{item.label}</div>
                                            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic opacity-60">{item.sub}</div>
                                        </div>
                                    </div>
                                    <ArrowRight size={24} className="text-text-tertiary group-hover:text-primary transition-all duration-500 group-hover:translate-x-2 relative z-10" />
                                    <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out z-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <Card variant="glass" className="border-2 border-border-default/50 rounded-[3rem] overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background-tertiary/20">
                                <tr>
                                    <th className="px-10 py-8 text-[10px] font-black text-text-muted uppercase tracking-[0.4em] italic">Execution Time</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-text-muted uppercase tracking-[0.4em] italic">Engagement Type</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-text-muted uppercase tracking-[0.4em] italic">Operator Node</th>
                                    <th className="px-10 py-8 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.4em] italic">Fiat manifest</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-border-default/30">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-primary/5 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <History size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                                <p className="text-sm font-black text-text-primary italic tabular-nums tracking-wider">{tx.time}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <Badge variant={tx.amount < 0 ? 'warning' : 'success'} className="rounded-xl py-2 px-4 text-[9px] font-black uppercase tracking-widest italic">
                                                {tx.type} Manifest
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-xs font-black text-text-muted uppercase tracking-widest italic">{tx.user} Auth Node</p>
                                        </td>
                                        <td className={`px-10 py-8 text-right font-black italic tabular-nums tracking-tighter text-2xl ${tx.amount < 0 ? 'text-error' : 'text-success'}`}>
                                            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}

                {activeTab === 'reconcile' && (
                    <Card variant="glass" className="p-16 border-2 border-border-default/50 rounded-[4rem] text-center shadow-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="w-24 h-24 bg-background-tertiary/40 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border-2 border-border-subtle/30 shadow-2xl relative z-10">
                            <Calculator size={48} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4 relative z-10">Fiscal <span className="text-primary">Reconciliation</span></h2>
                        <p className="text-text-secondary font-bold uppercase text-[11px] tracking-[0.4em] italic mb-12 opacity-70 relative z-10">Audit the physical assets and reconcile with protocol ledger manifests.</p>

                        <div className="max-w-md mx-auto mb-12 relative z-10">
                            <div className="relative group/input">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-2xl group-focus-within/input:scale-125 transition-transform">$</div>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-background-card/60 backdrop-blur-3xl border-2 border-border-default/50 focus:border-primary/50 focus:shadow-glow-primary/20 rounded-[2rem] py-10 pl-14 pr-10 text-5xl font-black text-center text-text-primary focus:outline-none transition-all italic tracking-tighter"
                                />
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-4 px-10 py-3 bg-primary/5 rounded-2xl border border-primary/20">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Protocol Expected:</span>
                                <span className="text-2xl font-black italic tabular-nums tracking-tighter text-text-primary">${expectedDrawer.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button className="px-16 py-8 bg-primary text-white shadow-glow-primary rounded-[2rem] font-black uppercase tracking-[0.3em] italic text-xs hover:scale-105 transition-all relative z-10">
                            Submit Manifest Audit
                        </Button>
                    </Card>
                )}
            </main>
        </div>
    );
}

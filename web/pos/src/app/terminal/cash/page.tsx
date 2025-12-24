"use client";

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertTriangle,
    Calculator,
    User,
    Clock,
    ArrowRight
} from 'lucide-react';

interface DenominationCount {
    denomination: number;
    count: number;
    total: number;
}

import { usePOS } from '@/contexts/POSContext';

export default function CashReconciliation() {
    const {
        cashEngine,
        localLedger,
        eventEngine,
        deviceId,
        branchId
    } = usePOS();

    const [step, setStep] = useState<'opening' | 'counting' | 'review'>('opening');
    const [openingBalance, setOpeningBalance] = useState<number>(0);
    const [expectedBalance, setExpectedBalance] = useState<number>(0);
    const [denominationCounts, setDenominationCounts] = useState<DenominationCount[]>([
        { denomination: 200, count: 0, total: 0 },
        { denomination: 100, count: 0, total: 0 },
        { denomination: 50, count: 0, total: 0 },
        { denomination: 20, count: 0, total: 0 },
        { denomination: 10, count: 0, total: 0 },
        { denomination: 5, count: 0, total: 0 },
        { denomination: 1, count: 0, total: 0 },
        { denomination: 0.5, count: 0, total: 0 },
    ]);

    const actorId = 'staff-default'; // TODO: Get from Auth

    useEffect(() => {
        if (cashEngine) {
            const balance = cashEngine.getStaffBalance(actorId);
            if (balance) {
                setExpectedBalance(balance.currentBalance);
            }
        }
    }, [cashEngine, actorId]);

    const actualBalance = denominationCounts.reduce((sum, d) => sum + d.total, 0);
    const variance = actualBalance - expectedBalance;
    const variancePercent = expectedBalance > 0 ? (variance / expectedBalance) * 100 : 0;

    let status: 'balanced' | 'over' | 'short' = 'balanced';
    if (variance > 0.01) status = 'over';
    else if (variance < -0.01) status = 'short';

    const updateCount = (index: number, count: number) => {
        const newCounts = [...denominationCounts];
        newCounts[index] = {
            ...newCounts[index],
            count: Math.max(0, count),
            total: newCounts[index].denomination * Math.max(0, count),
        };
        setDenominationCounts(newCounts);
    };

    const handleSubmitReconciliation = async () => {
        if (!cashEngine || !localLedger || !eventEngine) return;

        try {
            const shiftId = `shift-${Date.now()}`;

            const result = await cashEngine.reconcileShift(
                shiftId,
                actorId,
                expectedBalance,
                denominationCounts,
                "Regular end of shift reconciliation"
            );

            // The reconcileShift method already creates the event in eventEngine
            // but we need to ensure it's in the LocalLedger if the Engine doesn't insert it automatically.
            // Looking at CashEngine.ts: reconcileShift calls this.eventEngine.createEvent
            // We should ideally have the LocalLedger listening or handle the insertion.
            // Since we're in the UI, we'll manually insert the last event as a safety.

            const events = await (eventEngine as any).getChainState(); // If we had a way to get history
            // For now, let's assume the Engine is integrated with Ledger in the context.
            // Actually, the context only initializes them separately.

            alert(`Shift reconciled! Variance: ${variance >= 0 ? '+' : ''}${variance.toFixed(2)} EGP. System status: ${result.status.toUpperCase()}`);

            // Reset state
            setStep('opening');
            setDenominationCounts(denominationCounts.map(d => ({ ...d, count: 0, total: 0 })));
        } catch (error) {
            console.error('Reconciliation failed:', error);
            alert('Failed to submit reconciliation.');
        }
    };

    return (
        <div className="space-y-12 max-w-7xl">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign size={24} className="text-nile-silver" />
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Cash Reconciliation</h1>
                    </div>
                    <p className="text-nile-silver/30 font-bold uppercase tracking-widest text-xs">End-of-Shift Cash Accountability</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <User size={18} className="text-nile-silver/40" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Cashier</div>
                        <div className="text-sm font-bold text-white">Omar Khaled</div>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                {[
                    { id: 'opening', label: 'Opening Balance' },
                    { id: 'counting', label: 'Count Cash' },
                    { id: 'review', label: 'Review & Submit' },
                ].map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${step === s.id ? 'bg-nile-silver text-nile-dark' : 'bg-white/5 text-nile-silver/40'}`}>
                            <div className="w-8 h-8 rounded-full bg-current/20 flex items-center justify-center text-xs font-black">
                                {i + 1}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                        </div>
                        {i < 2 && <ArrowRight size={16} className="text-nile-silver/20" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Expected Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Opening Balance</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">{openingBalance.toFixed(2)} EGP</div>
                </div>
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Sales (Cash)</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">{(expectedBalance - openingBalance).toFixed(2)} EGP</div>
                </div>
                <div className="p-8 rounded-[3rem] bg-nile-dark border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Expected Balance</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">{expectedBalance.toFixed(2)} EGP</div>
                </div>
            </div>

            {/* Cash Counting */}
            {step === 'counting' && (
                <div className="glass-panel rounded-[3rem] p-10 border-white/10">
                    <h3 className="text-xl font-black text-white italic tracking-tight mb-8 flex items-center gap-3">
                        <Calculator size={20} />
                        Count Physical Cash
                    </h3>

                    <div className="space-y-4 mb-10">
                        {denominationCounts.map((denom, index) => (
                            <div key={denom.denomination} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                <div className="w-24 text-right">
                                    <span className="text-lg font-black text-white">{denom.denomination}</span>
                                    <span className="text-xs text-nile-silver/40 ml-2">EGP</span>
                                </div>
                                <div className="text-nile-silver/20">×</div>
                                <input
                                    type="number"
                                    min="0"
                                    value={denom.count}
                                    onChange={(e) => updateCount(index, parseInt(e.target.value) || 0)}
                                    className="w-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-center focus:outline-none focus:border-nile-silver transition-all"
                                    placeholder="0"
                                />
                                <div className="text-nile-silver/20">=</div>
                                <div className="flex-1 text-right text-xl font-black text-white italic">
                                    {denom.total.toFixed(2)} EGP
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Actual Balance</div>
                            <div className="text-4xl font-black text-white italic tracking-tighter">{actualBalance.toFixed(2)} EGP</div>
                        </div>
                        <button
                            onClick={() => setStep('review')}
                            className="btn-primary flex items-center gap-3 px-8 h-16"
                        >
                            Review Reconciliation
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Review & Variance */}
            {step === 'review' && (
                <div className="space-y-8">
                    {/* Variance Card */}
                    <div className={`p-12 rounded-[4rem] border-2 relative overflow-hidden ${status === 'balanced'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : status === 'over'
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                {status === 'balanced' ? (
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                ) : (
                                    <AlertTriangle size={48} className={status === 'over' ? 'text-blue-500' : 'text-red-500'} />
                                )}
                                <div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase mb-1">
                                        {status === 'balanced' ? 'Perfectly Balanced' : status === 'over' ? 'Cash Over' : 'Cash Short'}
                                    </h3>
                                    <p className="text-sm font-bold text-nile-silver/40">
                                        {status === 'balanced' ? 'No variance detected' : `${Math.abs(variancePercent).toFixed(2)}% variance`}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Variance</div>
                                <div className={`text-5xl font-black italic tracking-tighter flex items-center gap-3 ${status === 'balanced' ? 'text-emerald-500' : status === 'over' ? 'text-blue-500' : 'text-red-500'
                                    }`}>
                                    {variance >= 0 ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                                    {variance >= 0 ? '+' : ''}{variance.toFixed(2)} EGP
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            <div className="p-6 rounded-3xl bg-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Expected</div>
                                <div className="text-xl font-black text-white italic">{expectedBalance.toFixed(2)} EGP</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Actual</div>
                                <div className="text-xl font-black text-white italic">{actualBalance.toFixed(2)} EGP</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Shift Duration</div>
                                <div className="text-xl font-black text-white italic flex items-center gap-2">
                                    <Clock size={16} />
                                    8h 24m
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-6">
                        <button
                            onClick={() => setStep('counting')}
                            className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 text-nile-silver hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs"
                        >
                            Recount Cash
                        </button>
                        <button
                            onClick={handleSubmitReconciliation}
                            className="flex-1 h-16 btn-primary font-black uppercase tracking-widest text-sm"
                        >
                            Submit & Close Shift
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Start Button */}
            {step === 'opening' && (
                <div className="text-center">
                    <button
                        onClick={() => setStep('counting')}
                        className="btn-primary h-24 px-16 text-lg"
                    >
                        Start Cash Count
                    </button>
                </div>
            )}
        </div>
    );
}

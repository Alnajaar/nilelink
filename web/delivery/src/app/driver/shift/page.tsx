"use client";

import React, { useEffect, useState } from 'react';
import {
    Power,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    X,
    Lock,
    Calculator,
    ArrowRight
} from 'lucide-react';
import { DeliveryProtocol } from '@/lib/protocol/DeliveryProtocol';
import { useRouter } from 'next/navigation';

export default function ShiftPage() {
    const router = useRouter();
    const [protocol] = useState(() => new DeliveryProtocol());
    const [status, setStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
    const [showReconcile, setShowReconcile] = useState(false);

    const [sysBalance, setSysBalance] = useState(0);
    const [physicalCash, setPhysicalCash] = useState('');
    const [discrepancyReason, setDiscrepancyReason] = useState('');

    useEffect(() => {
        const load = async () => {
            setSysBalance(await protocol.getCashInHand());
            setStatus(await protocol.getShiftState());
        };
        load();
    }, [protocol]);

    const handleCloseShift = async () => {
        const physical = parseFloat(physicalCash) || 0;
        await protocol.endShift(physical);
        router.push('/driver/login');
    };

    const difference = (parseFloat(physicalCash) || 0) - sysBalance;

    return (
        <div className="flex flex-col gap-8 px-6">

            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Shift Control</h1>
                    <p className="text-xs font-black text-nile-silver/30 uppercase tracking-[0.2em]">Operational Handshake</p>
                </div>
            </header>

            {/* Shift Status UI */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${status === 'OPEN' ? 'bg-emerald-500 text-nile-dark' : 'bg-red-500/20 text-red-500'}`}>
                        <Power size={32} />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white italic uppercase tracking-tight">Shift is {status}</div>
                        <div className="text-[10px] font-bold text-nile-silver/20 uppercase tracking-[0.2em]">Started: Dec 24, 09:00 AM</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {status === 'OPEN' ? (
                <div className="space-y-4">
                    <button
                        onClick={() => setShowReconcile(true)}
                        className="w-full h-24 rounded-[2rem] bg-red-500 active:bg-red-600 text-nile-dark active:scale-[0.98] transition-all flex items-center justify-between px-8"
                    >
                        <div className="flex flex-col items-start translate-z-0">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">End Duty</span>
                            <span className="text-2xl font-black italic tracking-tight uppercase">Close Shift</span>
                        </div>
                        <X size={32} />
                    </button>

                    <p className="text-center text-[10px] font-bold text-nile-silver/20 uppercase tracking-widest">
                        Closing the shift requires final cash reconciliation.
                    </p>
                </div>
            ) : (
                <button
                    onClick={() => router.push('/driver/login')}
                    className="w-full h-24 rounded-[2rem] bg-emerald-500 text-nile-dark font-black text-2xl italic flex items-center justify-center gap-4"
                >
                    Open New Shift <ChevronRight size={32} />
                </button>
            )}

            {/* Reconciliation Modal */}
            {showReconcile && (
                <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex-1 flex flex-col pt-12">
                        <header className="mb-12 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white mx-auto mb-6">
                                <Calculator size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white italic uppercase mb-2">Reconciliation</h2>
                            <p className="text-xs font-black text-nile-silver/30 uppercase tracking-[0.2em]">Verify Physical Cash Balance</p>
                        </header>

                        <div className="space-y-8">
                            {/* System Expected */}
                            <div className="p-8 rounded-4xl bg-white/5 border border-white/5 flex justify-between items-center">
                                <span className="text-sm font-bold text-nile-silver">Digital Balance</span>
                                <span className="text-xl font-black text-white italic">{sysBalance.toFixed(2)} EGP</span>
                            </div>

                            {/* Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40 px-4">Physical Count</label>
                                <input
                                    type="number"
                                    value={physicalCash}
                                    onChange={(e) => setPhysicalCash(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-24 rounded-[2rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500/50 outline-none text-center text-4xl font-black italic text-white transition-all"
                                />
                            </div>

                            {/* Discrepancy UI */}
                            {physicalCash !== '' && Math.abs(difference) > 0.01 && (
                                <div className="p-8 rounded-[2rem] bg-red-500/10 border border-red-500/20 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3 text-red-500">
                                            <AlertTriangle size={20} />
                                            <span className="text-sm font-black uppercase tracking-widest">Mismatch Detected</span>
                                        </div>
                                        <span className="text-2xl font-black text-red-500 italic">
                                            {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                                        </span>
                                    </div>
                                    <textarea
                                        value={discrepancyReason}
                                        onChange={(e) => setDiscrepancyReason(e.target.value)}
                                        placeholder="Reason for discrepancy..."
                                        className="w-full h-24 rounded-2xl bg-black/40 border border-white/5 p-4 text-xs font-medium text-white placeholder:text-nile-silver/20 outline-none focus:border-red-500/40"
                                    />
                                </div>
                            )}

                            {/* Handshake UI */}
                            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                                <Lock size={20} className="text-blue-500 shrink-0" />
                                <p className="text-[10px] font-medium text-blue-500/70 leading-relaxed italic">
                                    By submitting, you are cryptographically signing this end-of-shift report to the NileLink Ledger.
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto flex gap-4 pt-12">
                            <button
                                onClick={() => setShowReconcile(false)}
                                className="flex-1 h-20 rounded-3xl bg-white/5 text-white font-bold uppercase text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloseShift}
                                disabled={!physicalCash}
                                className="flex-[2] h-20 rounded-3xl bg-red-500 text-nile-dark font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                Submit & Close <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

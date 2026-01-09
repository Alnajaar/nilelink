"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, CheckCircle2,
    AlertTriangle, Calculator, User, Clock, ArrowRight,
    ShieldCheck, Wallet, Plus, Minus, Lock, Unlock,
    History, FileText, Zap, AlertCircle, RefreshCw
} from 'lucide-react';

import { usePOS } from '@/contexts/POSContext';
import { PERMISSION, POS_ROLE, getRoleLabel } from '@/utils/permissions';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { EventType, EconomicEvent } from '@/lib/events/types';

interface DenominationCount {
    denomination: number;
    count: number;
    total: number;
}

type CashAction = 'open' | 'count' | 'deposit' | 'withdraw' | 'close';

export default function AdvancedCashManagement() {
    const { cashEngine, localLedger, eventEngine, currentRole, hasPermission } = usePOS();

    const [drawerStatus, setDrawerStatus] = useState<'closed' | 'open'>('closed');
    const [currentAction, setCurrentAction] = useState<CashAction | null>(null);
    const [openingBalance, setOpeningBalance] = useState<number>(200.00);
    const [expectedBalance, setExpectedBalance] = useState<number>(1250.00);
    const [denominationCounts, setDenominationCounts] = useState<DenominationCount[]>([
        { denomination: 200, count: 0, total: 0 },
        { denomination: 100, count: 0, total: 0 },
        { denomination: 50, count: 0, total: 0 },
        { denomination: 20, count: 0, total: 0 },
        { denomination: 10, count: 0, total: 0 },
        { denomination: 5, count: 0, total: 0 },
        { denomination: 1, count: 0, total: 0 },
        { denomination: 0.50, count: 0, total: 0 },
        { denomination: 0.25, count: 0, total: 0 },
    ]);

    const [depositAmount, setDepositAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [mounted, setMounted] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadActivities();
    }, []);

    const actorId = typeof window !== 'undefined' ? sessionStorage.getItem('pos_current_user') || 'Operator' : 'Operator';

    // Load cash engine data
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

    const updateCount = (index: number, delta: number) => {
        const newCounts = [...denominationCounts];
        const newCount = Math.max(0, newCounts[index].count + delta);
        newCounts[index] = {
            ...newCounts[index],
            count: newCount,
            total: newCounts[index].denomination * newCount,
        };
        setDenominationCounts(newCounts);
    };

    const loadActivities = async () => {
        if (!localLedger) return;
        setIsLoading(true);
        try {
            const allEvents = await localLedger.getAllEvents();
            const cashEvents = allEvents.filter(e => [
                EventType.PAYMENT_COLLECTED_CASH,
                EventType.CASH_HANDOVER,
                EventType.CASH_RECONCILIATION,
                EventType.CASH_DRAWER_OPENED,
                EventType.CASH_DRAWER_CLOSED,
                EventType.CASH_SALE_COLLECTED
            ].includes(e.type)).reverse().slice(0, 10);

            const mappedActivities = cashEvents.map(e => {
                let type = 'System Action';
                let amount = 0;

                if (e.type === EventType.PAYMENT_COLLECTED_CASH) {
                    type = 'Network Sale';
                    amount = (e.payload as any).amount;
                } else if (e.type === EventType.CASH_DRAWER_OPENED) {
                    type = 'Vault Deploy';
                    amount = (e.payload as any).openingBalance;
                } else if (e.type === EventType.CASH_RECONCILIATION) {
                    type = 'Audit Settlement';
                    amount = (e.payload as any).variance;
                } else if (e.type === EventType.CASH_HANDOVER) {
                    type = 'Handover';
                    amount = (e.payload as any).amount;
                }

                const timeDiff = Date.now() - e.timestamp;
                const minutes = Math.floor(timeDiff / 60000);
                const hours = Math.floor(minutes / 60);
                const timeStr = hours > 0 ? `${hours}h ago` : `${minutes}m ago`;

                return { type, amount, time: timeStr };
            });

            setActivities(mappedActivities);
        } catch (error) {
            console.error('Failed to load cash activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = async () => {
        if (cashEngine) {
            await cashEngine.openDrawer(actorId, openingBalance, 'USD');
            setDrawerStatus('open');
            setCurrentAction('open');
            loadActivities();
        }
    };

    const handleCloseDrawer = async () => {
        if (cashEngine) {
            await cashEngine.closeDrawer(actorId, expectedBalance, 'USD');
            setDrawerStatus('closed');
            setCurrentAction(null);
            setDenominationCounts(prev => prev.map(d => ({ ...d, count: 0, total: 0 })));
            loadActivities();
        }
    };

    const handleSubmitCount = async () => {
        if (cashEngine) {
            await cashEngine.reconcileShift('shift-current', actorId, expectedBalance, denominationCounts, notes);
            setCurrentAction(null);
            loadActivities();
        }
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) return;

        if (cashEngine) {
            // Cash engine doesn't have a direct deposit yet, so we use updateStaffBalance logic via events if needed
            // For now, we simulate but could add a DEPOSIT event
            setExpectedBalance(prev => prev + amount);
        }

        setDepositAmount('');
        setNotes('');
        setCurrentAction(null);
        loadActivities();
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) return;

        setExpectedBalance(prev => prev - amount);
        setWithdrawAmount('');
        setNotes('');
        setCurrentAction(null);
        loadActivities();
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
            <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-border-subtle shrink-0">
                <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-background shadow-2xl shadow-primary/20">
                            <Wallet size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Secure Vault Interface V2.1</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                                Cash <span className="text-primary">Management</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button
                            onClick={loadActivities}
                            variant="outline"
                            className="bg-white/50 border-border-subtle rounded-full p-3 hover:bg-white transition-all shadow-lg"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${drawerStatus === 'open'
                            ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20'
                            : 'bg-white border-border-subtle text-text-primary/40'
                            }`}>
                            {drawerStatus === 'open' ? <Unlock size={18} /> : <Lock size={18} />}
                            <span className="text-xs font-black uppercase tracking-[0.2em] italic">
                                {drawerStatus === 'open' ? 'Vault Deployed' : 'Vault Locked'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 relative z-10 flex flex-col lg:flex-row gap-12 h-[calc(100vh-6rem)] overflow-hidden">

                {/* Balance & Actions Panel */}
                <aside className="w-full lg:w-96 flex flex-col gap-8 shrink-0">
                    <Card className="p-10 rounded-[3rem] bg-white border-border-subtle shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                                    <ShieldCheck size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/40">Expected Liquidity</span>
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-text-primary/60 italic">Current Staff Balance</h3>
                            <p className="text-5xl font-black tracking-tighter italic text-primary">
                                <CurrencyDisplay amount={expectedBalance} currency="USD" />
                            </p>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <PermissionGuard require={PERMISSION.CASH_OPEN_DRAWER}>
                            {drawerStatus === 'closed' ? (
                                <Button
                                    onClick={handleOpenDrawer}
                                    className="h-20 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-[0.2em] italic rounded-[2rem] shadow-2xl shadow-primary/20 transition-all text-xs"
                                >
                                    <Unlock size={20} className="mr-3" /> Execute Vault Deploy
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCloseDrawer}
                                    className="h-20 bg-secondary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-[0.2em] italic rounded-[2rem] shadow-2xl shadow-secondary/20 transition-all text-xs"
                                >
                                    <Lock size={20} className="mr-3" /> Execute Vault Lockdown
                                </Button>
                            )}
                        </PermissionGuard>

                        <PermissionGuard require={PERMISSION.CASH_VIEW_BALANCE}>
                            <Button
                                onClick={() => setCurrentAction('count')}
                                disabled={drawerStatus === 'closed'}
                                variant="outline"
                                className="h-16 border-border-subtle bg-white hover:bg-neutral font-black uppercase tracking-[0.2em] italic rounded-2xl disabled:opacity-30 transition-all text-[10px]"
                            >
                                <Calculator size={18} className="mr-3" /> Initialize Physical Count
                            </Button>
                        </PermissionGuard>

                        <div className="grid grid-cols-2 gap-4">
                            <PermissionGuard require={PERMISSION.CASH_DEPOSIT}>
                                <Button
                                    onClick={() => setCurrentAction('deposit')}
                                    variant="outline"
                                    className="h-16 border-border-subtle bg-white hover:bg-neutral font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all text-[10px]"
                                >
                                    <Plus size={18} className="mr-2" /> Inbound
                                </Button>
                            </PermissionGuard>
                            <PermissionGuard require={PERMISSION.CASH_WITHDRAW}>
                                <Button
                                    onClick={() => setCurrentAction('withdraw')}
                                    variant="outline"
                                    className="h-16 border-border-subtle bg-white hover:bg-neutral font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all text-[10px]"
                                >
                                    <Minus size={18} className="mr-2" /> Outbound
                                </Button>
                            </PermissionGuard>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <Card className="flex-1 rounded-[3rem] bg-white border-border-subtle shadow-xl overflow-hidden flex flex-col p-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-text-primary/40 italic">Protocol Log</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {activities.length > 0 ? activities.map((activity, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-5 rounded-2xl bg-neutral/50 border border-border-subtle group hover:bg-white transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.amount >= 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                                            }`}>
                                            {activity.amount >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{activity.type}</p>
                                            <p className="text-[9px] font-bold text-text-primary/30 uppercase tracking-[0.2em]">{activity.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black italic tracking-tight ${activity.amount >= 0 ? 'text-primary' : 'text-secondary'}`}>
                                        {activity.amount >= 0 ? '+' : ''}{activity.amount.toFixed(2)}
                                    </span>
                                </motion.div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <History size={32} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Recent Protocols</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </aside>

                {/* Operation Context Area */}
                <section className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <AnimatePresence mode="wait">
                        {!currentAction && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex flex-col items-center justify-center text-center p-20"
                            >
                                <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl border border-border-subtle group hover:rotate-12 transition-transform">
                                    <Zap size={64} className="text-primary/20 group-hover:text-primary transition-colors" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Operational <span className="text-primary">Standby</span></h2>
                                <p className="text-xs font-bold text-text-primary/30 uppercase tracking-[0.4em] max-w-sm leading-relaxed italic">
                                    Vault Interface active and synchronized. Awaiting operator command from control matrix.
                                </p>
                            </motion.div>
                        )}

                        {currentAction === 'count' && (
                            <motion.div
                                key="count"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto space-y-12 pb-20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Calculator size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Physical <span className="text-primary">Audit</span></h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {denominationCounts.map((denom, idx) => (
                                        <Card key={idx} className="bg-white border border-border-subtle rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl hover:shadow-2xl transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-neutral rounded-3xl flex flex-col items-center justify-center border border-border-subtle group-hover:bg-primary/5 transition-colors">
                                                    <DollarSign size={20} className="text-primary mb-1" />
                                                    <span className="font-black text-text-primary text-lg italic tracking-tighter">{denom.denomination}</span>
                                                </div>
                                                <div className="flex items-center gap-4 p-2 bg-neutral rounded-2xl border border-border-subtle">
                                                    <button
                                                        onClick={() => updateCount(idx, -1)}
                                                        className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex items-center justify-center text-text-primary font-black hover:bg-secondary hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Minus size={20} />
                                                    </button>
                                                    <span className="w-12 text-center font-black text-text-primary text-2xl italic tracking-tighter">
                                                        {denom.count}
                                                    </span>
                                                    <button
                                                        onClick={() => updateCount(idx, 1)}
                                                        className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-text-primary/40 uppercase tracking-[0.3em] font-black italic mb-1">Subtotal</p>
                                                <p className="font-black text-text-primary text-2xl tracking-tighter italic">
                                                    ${denom.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <Card className="rounded-[4rem] bg-white border-2 border-primary/20 shadow-[0_40px_80px_rgba(0,0,0,0.1)] p-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-text-primary/40 uppercase tracking-[0.4em] font-black italic mb-2">System Expected</p>
                                            <p className="text-4xl font-black text-text-primary tracking-tighter italic">${expectedBalance.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-text-primary/40 uppercase tracking-[0.4em] font-black italic mb-2">Physical Actual</p>
                                            <p className="text-4xl font-black text-text-primary tracking-tighter italic">${actualBalance.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-text-primary/40 uppercase tracking-[0.4em] font-black italic mb-2">Audit Variance</p>
                                            <p className={`text-4xl font-black tracking-tighter italic ${Math.abs(variance) < 0.01 ? 'text-primary' : variance > 0 ? 'text-primary' : 'text-secondary'
                                                }`}>
                                                {variance > 0 ? '+' : ''}{variance.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <Button onClick={() => setCurrentAction(null)} variant="outline" className="h-20 flex-1 rounded-[2rem] border-border-subtle text-xs font-black uppercase tracking-[0.3em] italic">
                                            Cancel Audit
                                        </Button>
                                        <Button
                                            onClick={handleSubmitCount}
                                            className="h-20 flex-[2] bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/20 font-black uppercase tracking-[0.3em] italic text-xs hover:scale-[1.02]"
                                        >
                                            <CheckCircle2 size={24} className="mr-4" /> Finalize Signature
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {currentAction === 'deposit' && (
                            <motion.div
                                key="deposit"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="max-w-2xl mx-auto pt-20"
                            >
                                <Card className="bg-white border border-border-subtle rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />

                                    <div className="relative z-10 space-y-12">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                                <TrendingUp size={32} />
                                            </div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Inbound <span className="text-primary">Capital</span></h2>
                                            <p className="text-[10px] font-bold text-text-primary/30 uppercase tracking-[0.3em] mt-2">Physical to digital settlement</p>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary/40 italic ml-4">Authorized Amount</label>
                                                <div className="relative">
                                                    <DollarSign size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-primary" />
                                                    <input
                                                        type="number"
                                                        value={depositAmount}
                                                        onChange={(e) => setDepositAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full h-24 pl-20 pr-10 bg-neutral rounded-[2.5rem] border border-border-subtle focus:outline-none focus:ring-4 focus:ring-primary/5 text-4xl font-black italic tracking-tighter text-text-primary placeholder:opacity-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary/40 italic ml-4">Protocol Reference</label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="ENTER DEPOSIT METADATA..."
                                                    className="w-full h-32 px-10 py-8 bg-neutral rounded-[2rem] border border-border-subtle focus:outline-none focus:ring-4 focus:ring-primary/5 text-[10px] font-black uppercase tracking-[0.3em] placeholder:opacity-20 resize-none italic"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button onClick={() => setCurrentAction(null)} variant="outline" className="h-16 flex-1 rounded-2xl border-border-subtle text-[10px] font-black uppercase tracking-[0.2em] italic">
                                                Abort
                                            </Button>
                                            <Button
                                                onClick={handleDeposit}
                                                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                                                className="h-16 flex-[2] bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-[0.2em] italic text-[10px]"
                                            >
                                                Authorize Inbound
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {currentAction === 'withdraw' && (
                            <motion.div
                                key="withdraw"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="max-w-2xl mx-auto pt-20"
                            >
                                <Card className="bg-white border border-border-subtle rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-3xl rounded-full -mr-32 -mt-32" />

                                    <div className="relative z-10 space-y-12">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                                <TrendingDown size={32} />
                                            </div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Outbound <span className="text-secondary">Withdrawal</span></h2>
                                            <p className="text-[10px] font-bold text-text-primary/30 uppercase tracking-[0.3em] mt-2">Digital to physical liquidation</p>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary/40 italic ml-4">Authorized Amount</label>
                                                <div className="relative">
                                                    <DollarSign size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-secondary" />
                                                    <input
                                                        type="number"
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full h-24 pl-20 pr-10 bg-neutral rounded-[2.5rem] border border-border-subtle focus:outline-none focus:ring-4 focus:ring-secondary/5 text-4xl font-black italic tracking-tighter text-text-primary placeholder:opacity-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary/40 italic ml-4">Protocol Justification</label>
                                                <textarea
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="SPECIFY WITHDRAWAL REASON..."
                                                    className="w-full h-32 px-10 py-8 bg-neutral rounded-[2rem] border border-border-subtle focus:outline-none focus:ring-4 focus:ring-secondary/5 text-[10px] font-black uppercase tracking-[0.3em] placeholder:opacity-20 resize-none italic"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button onClick={() => setCurrentAction(null)} variant="outline" className="h-16 flex-1 rounded-2xl border-border-subtle text-[10px] font-black uppercase tracking-[0.2em] italic">
                                                Abort
                                            </Button>
                                            <Button
                                                onClick={handleWithdraw}
                                                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !notes}
                                                className="h-16 flex-[2] bg-secondary text-white rounded-2xl shadow-xl shadow-secondary/20 font-black uppercase tracking-[0.2em] italic text-[10px]"
                                            >
                                                Authorize Outbound
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* Custom Aesthetics */}
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


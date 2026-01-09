"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Server, Database, Zap, ShieldCheck,
    Cpu, Globe, Lock, Search, Terminal, AlertCircle
} from 'lucide-react';

import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

interface Transaction {
    id: string;
    node: string;
    amount: number;
    timestamp: string;
    type: 'Revenue' | 'Dividend' | 'Trade';
    status: 'Confirmed' | 'Validating';
}

export default function LedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 'tx-8921', node: 'Cairo Grill Prime', amount: 125.50, timestamp: '2s ago', type: 'Revenue', status: 'Confirmed' },
        { id: 'tx-8920', node: 'Delta Kitchen', amount: 84.00, timestamp: '5s ago', type: 'Revenue', status: 'Confirmed' },
        { id: 'tx-8919', node: 'Nile Bistro', amount: 312.00, timestamp: '12s ago', type: 'Trade', status: 'Confirmed' },
        { id: 'tx-8918', node: 'Spice Route', amount: 45.25, timestamp: '18s ago', type: 'Revenue', status: 'Confirmed' },
        { id: 'tx-8917', node: 'Cairo Grill Prime', amount: 62.00, timestamp: '24s ago', type: 'Revenue', status: 'Confirmed' }
    ]);

    // Simulate real-time transactions
    useEffect(() => {
        const interval = setInterval(() => {
            const nodes = ['Cairo Grill Prime', 'Delta Kitchen', 'Nile Bistro', 'Spice Route', 'Desert Oasis'];
            const newTx: Transaction = {
                id: `tx-${Math.floor(Math.random() * 10000)}`,
                node: nodes[Math.floor(Math.random() * nodes.length)],
                amount: parseFloat((Math.random() * 500).toFixed(2)),
                timestamp: 'Just now',
                type: Math.random() > 0.8 ? 'Trade' : 'Revenue',
                status: 'Validating'
            };

            setTransactions(prev => {
                const updated = [newTx, ...prev.slice(0, 4)];
                setTimeout(() => {
                    setTransactions(curr => curr.map(t => t.id === newTx.id ? { ...t, status: 'Confirmed', timestamp: '1s ago' } : t));
                }, 2000);
                return updated;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background text-text">
            {/* Infrastructure Header */}
            <div className="bg-text text-background px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="text-primary animate-pulse" size={24} />
                                <h1 className="text-4xl font-black uppercase tracking-tighter">Economic Ledger</h1>
                            </div>
                            <p className="opacity-70 font-mono text-xs uppercase tracking-widest">
                                Protocol v4.0.2 • Real-time Economic Validation Layer
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-[10px] opacity-50 font-black uppercase mb-1">Total Nodes</p>
                                <p className="text-xl font-mono font-black">128</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-[10px] opacity-50 font-black uppercase mb-1">TPS (Avg)</p>
                                <p className="text-xl font-mono font-black">42.8</p>
                            </div>
                            <div className="p-3 bg-primary text-background rounded-lg">
                                <p className="text-[10px] font-black uppercase mb-1">Uptime</p>
                                <p className="text-xl font-mono font-black">99.99%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Validator Stream */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 bg-white border border-surface shadow-none overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Terminal size={18} className="text-primary" />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Consensus Stream</h2>
                                </div>
                                <Badge className="bg-primary/10 text-primary px-3 py-1 font-mono text-[10px] font-bold">
                                    LIVE MONITORING
                                </Badge>
                            </div>

                            <div className="space-y-4 font-mono">
                                <AnimatePresence initial={false}>
                                    {transactions.map((tx) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20, height: 0 }}
                                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                                            className="flex items-center justify-between p-4 bg-surface/30 rounded-lg group hover:bg-surface/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Confirmed' ? 'bg-primary' : 'bg-text opacity-30 animate-pulse'}`} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-text/40">{tx.id}</span>
                                                        <span className="text-sm font-black text-text">{tx.node}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={`text-[9px] px-1 py-0 h-4 ${tx.type === 'Revenue' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                                            {tx.type}
                                                        </Badge>
                                                        <span className="text-[10px] text-text/50">{tx.timestamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-text">${tx.amount.toFixed(2)}</p>
                                                <p className={`text-[9px] font-black uppercase ${tx.status === 'Confirmed' ? 'text-primary' : 'text-text/30'}`}>
                                                    {tx.status}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="mt-6 pt-6 border-t border-surface">
                                <button className="w-full py-3 bg-surface hover:bg-surface/70 rounded-lg font-black uppercase text-[10px] tracking-widest text-text/50 transition-all">
                                    Load Explorer History
                                </button>
                            </div>
                        </Card>

                        {/* Network Map Placeholder */}
                        <Card className="p-0 border border-surface bg-text text-background overflow-hidden relative group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <Globe className="w-full h-full scale-150 -translate-y-1/4" />
                            </div>
                            <div className="p-8 relative">
                                <h2 className="text-2xl font-black uppercase mb-2 tracking-tighter">Global Node Network</h2>
                                <p className="opacity-50 text-sm font-mono uppercase tracking-widest mb-8">Decentralized Revenue Infrastructure</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { city: 'Cairo', region: 'MENA-1', nodes: 42, status: 'Active' },
                                        { city: 'Maadi', region: 'MENA-2', nodes: 18, status: 'Active' },
                                        { city: 'Zamalek', region: 'MENA-3', nodes: 12, status: 'Active' },
                                        { city: 'Giza', region: 'MENA-4', nodes: 31, status: 'Syncing' }
                                    ].map((loc, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[10px] opacity-40 font-black mb-1">{loc.region}</p>
                                            <p className="font-black text-lg mb-1">{loc.city}</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Active' ? 'bg-primary' : 'bg-amber-500 animate-pulse'}`} />
                                                <span className="text-[10px] font-mono opacity-60">{loc.nodes} Nodes</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Infrastructure Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6 border border-surface bg-white">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-text/40">Security Protocols</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: ShieldCheck, title: 'POS-Validation', status: 'Active', desc: 'Real-time sales consensus' },
                                    { icon: Lock, title: 'AES-256 Encryption', status: 'Secured', desc: 'Financial data tunneling' },
                                    { icon: Server, title: 'Node Redundancy', status: '3x-Failover', desc: 'Distributed database sync' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">
                                            <item.icon size={20} className="text-text" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-black text-sm">{item.title}</h4>
                                                <span className="text-[9px] font-black p-0.5 px-1 bg-primary/10 text-primary rounded leading-none">{item.status}</span>
                                            </div>
                                            <p className="text-[11px] text-text/50">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 border border-surface bg-primary text-background">
                            <Cpu className="mb-4" size={32} />
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Smart Revenue Contracts</h3>
                            <p className="text-xs opacity-70 leading-relaxed mb-6 font-medium">
                                Dividends are auto-distributed via automated smart contracts directly connected to POS revenue streams. No manual intervention possible.
                            </p>
                            <div className="p-4 bg-background/10 rounded-xl border border-background/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase opacity-60">Contract Status</span>
                                    <span className="text-[10px] font-black uppercase px-1 bg-background text-primary rounded">AUDITED</span>
                                </div>
                                <p className="font-mono text-[10px] break-all opacity-80">
                                    0x72a...61b8f...9c4e2...3310
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 border border-surface bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle size={16} className="text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Protocol Alerts</h3>
                            </div>
                            <div className="p-4 border-2 border-dashed border-surface rounded-xl flex flex-col items-center justify-center py-8 opacity-40">
                                <Database size={24} className="mb-2" />
                                <p className="text-xs font-black uppercase">No active anomalies</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

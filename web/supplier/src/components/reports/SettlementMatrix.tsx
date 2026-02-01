"use client";

import React from 'react';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { CurrencyDisplay } from '@shared/components/CurrencyDisplay';
import { FileDown, Calendar, ShieldCheck, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Settlement {
    id: string;
    date: string;
    grossAmount: number;
    fees: number;
    netAmount: number;
    status: 'completed' | 'pending' | 'processing';
}

const mockSettlements: Settlement[] = [
    { id: 'SET-9921', date: '2026-01-08', grossAmount: 12500.50, fees: 125.01, netAmount: 12375.49, status: 'completed' },
    { id: 'SET-9920', date: '2026-01-07', grossAmount: 8900.00, fees: 89.00, netAmount: 8811.00, status: 'completed' },
    { id: 'SET-9919', date: '2026-01-06', grossAmount: 15750.75, fees: 157.51, netAmount: 15593.24, status: 'processing' },
];

export const SettlementMatrix: React.FC = () => {
    return (
        <Card className="p-8 bg-zinc-900/50 backdrop-blur-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={200} className="text-blue-500" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter text-white mb-2">Settlement Matrix</h3>
                    <p className="text-zinc-500 font-medium max-w-md">
                        Mission-critical financial audit data synchronized from POS Edge Nodes.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-400">
                        <Calendar size={18} className="mr-2" />
                        Custom Range
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20">
                        <FileDown size={18} className="mr-2" />
                        Export Ledger (CSV)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">YTD Net Settlement</p>
                    <p className="text-4xl font-black text-white">$452,190.20</p>
                    <div className="flex items-center gap-2 mt-3 text-emerald-400">
                        <ArrowUpRight size={16} />
                        <span className="text-xs font-bold">+12.4% vs last mo</span>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Pending Reserve</p>
                    <p className="text-4xl font-black text-blue-400">$15,593.24</p>
                    <div className="flex items-center gap-2 mt-3 text-zinc-500">
                        <Clock size={16} />
                        <span className="text-xs font-bold">Estimated 24h release</span>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Network Health</p>
                    <p className="text-4xl font-black text-white">S-TIER</p>
                    <div className="flex items-center gap-2 mt-3 text-emerald-400">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-bold">Hardened Logic Active</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500">ID</th>
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Execution Date</th>
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Gross</th>
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Fees</th>
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Net Value</th>
                            <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mockSettlements.map((s, i) => (
                            <motion.tr
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group/row hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="py-6 font-mono text-sm text-zinc-400">{s.id}</td>
                                <td className="py-6 font-bold text-white">{s.date}</td>
                                <td className="py-6 font-bold text-zinc-300">
                                    <CurrencyDisplay amount={s.grossAmount} hideSymbol />
                                </td>
                                <td className="py-6 font-medium text-red-400/80">
                                    -<CurrencyDisplay amount={s.fees} hideSymbol />
                                </td>
                                <td className="py-6">
                                    <div className="inline-flex flex-col">
                                        <span className="text-lg font-black text-white">
                                            <CurrencyDisplay amount={s.netAmount} />
                                        </span>
                                    </div>
                                </td>
                                <td className="py-6 text-right">
                                    <Badge className={`
                                        font-black uppercase tracking-widest text-[10px] py-1 px-3
                                        ${s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            s.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                    `}>
                                        {s.status}
                                    </Badge>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

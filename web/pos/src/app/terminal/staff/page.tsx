"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    ShieldCheck,
    Star,
    AlertTriangle,
    Award,
    TrendingUp
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';

export default function StaffPage() {
    const { localLedger } = usePOS();
    const [staffList, setStaffList] = useState<any[]>([]);

    useEffect(() => {
        const fetchReputation = async () => {
            if (localLedger) {
                const list = await localLedger.getAllStaffReputation();
                if (list.length === 0) {
                    // Seed mock data if empty
                    await localLedger.updateStaffReputation('staff-default', 'General Staff', { salesCount: 42, voidCount: 1, cashVariance: 0 });
                    await localLedger.updateStaffReputation('staff-alice', 'Alice M.', { salesCount: 128, voidCount: 0, cashVariance: 0 });
                    await localLedger.updateStaffReputation('staff-bob', 'Bob K.', { salesCount: 56, voidCount: 4, cashVariance: -50 });
                    const seeded = await localLedger.getAllStaffReputation();
                    setStaffList(seeded);
                } else {
                    setStaffList(list);
                }
            }
        };

        fetchReputation();
    }, [localLedger]);

    const getScoreColor = (score: number) => {
        if (score >= 95) return 'text-emerald-500';
        if (score >= 80) return 'text-blue-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="h-full flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Staff Network</h1>
                    <p className="text-nile-silver/50 font-bold uppercase tracking-widest text-xs">Reputation Protocol & Vetting</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Trust Engine Active
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffList.map((staff, i) => (
                    <motion.div
                        key={staff.staffId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] glass-panel group hover:bg-white/5 transition-all"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-nile-dark border border-white/5 flex items-center justify-center text-nile-silver/20 group-hover:scale-110 transition-transform">
                                <Users size={32} />
                            </div>
                            <div className={`text-4xl font-black italic tracking-tighter ${getScoreColor(staff.reliabilityScore)}`}>
                                {staff.reliabilityScore.toFixed(0)}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1">{staff.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30 mb-8">{staff.staffId}</p>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Award size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-nile-silver">Sales Volume</span>
                                </div>
                                <span className="font-black text-white">{staff.salesCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                    <span className="text-xs font-bold text-nile-silver">Void Events</span>
                                </div>
                                <span className="font-black text-white">{staff.voidCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={14} className="text-blue-500" />
                                    <span className="text-xs font-bold text-nile-silver">Cash Var.</span>
                                </div>
                                <span className="font-black text-white">{staff.cashVarianceTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${getScoreColor(staff.reliabilityScore).replace('text', 'bg')}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${staff.reliabilityScore}%` }}
                                />
                            </div>
                            <div className="mt-2 text-right text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Trust Index</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

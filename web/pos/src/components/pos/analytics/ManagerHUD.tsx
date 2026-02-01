"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Users } from 'lucide-react';
import { POSCard } from '../POSCard';
import { POSButton } from '../POSButton';

export function ManagerHUD() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">Manager Oversight</h2>
                    <p className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.4em] mt-2">Station-7 // Real-time Operational Intelligence</p>
                </div>
                <POSButton variant="accent" size="md">EXPORT AUDIT LEDGER</POSButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <POSCard variant="elevated" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <DollarSign size={64} />
                    </div>
                    <span className="text-[9px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Total Volume (24h)</span>
                    <div className="text-4xl font-black italic mt-4">$12,450.20</div>
                    <div className="flex items-center gap-2 mt-4 text-[var(--pos-success)]">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-bold">+12.4% vs Average</span>
                    </div>
                </POSCard>

                <POSCard variant="elevated" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Users size={64} />
                    </div>
                    <span className="text-[9px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Operator Velocity</span>
                    <div className="text-4xl font-black italic mt-4">12 txn/hr</div>
                    <div className="flex items-center gap-2 mt-4 text-[var(--pos-accent)]">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold">Optimized Alignment</span>
                    </div>
                </POSCard>

                <POSCard variant="elevated" className="relative overflow-hidden group border-l-4 border-l-[var(--pos-warning)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <AlertTriangle size={64} />
                    </div>
                    <span className="text-[9px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Fraud/Void Ratio</span>
                    <div className="text-4xl font-black italic mt-4 text-[var(--pos-warning)]">1.2%</div>
                    <p className="text-[8px] font-bold text-[var(--pos-text-muted)] mt-4">Within Security Threshold</p>
                </POSCard>

                <POSCard variant="elevated" className="relative overflow-hidden group border-l-4 border-l-[var(--pos-accent)]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <BarChart3 size={64} />
                    </div>
                    <span className="text-[9px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">AI Upsell Revenue</span>
                    <div className="text-4xl font-black italic mt-4 text-[var(--pos-accent)]">$840.50</div>
                    <p className="text-[8px] font-bold text-[var(--pos-text-muted)] mt-4">Conversion: 18%</p>
                </POSCard>
            </div>

            {/* Sales Heatmaps / Detailed View */}
            <POSCard padding="lg" variant="default" className="bg-black/50 border-dashed border-[var(--pos-border-strong)]">
                <div className="h-64 flex flex-col items-center justify-center text-center">
                    <BarChart3 size={48} className="text-white/10 mb-6" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Aggregating Local Event Ledger Data...</h3>
                    <p className="text-[10px] font-bold text-white/20 mt-4 max-w-sm">
                        Z-Report synchronization in progress. Real-time heatmaps will initialize once 128 unique transactions are recorded.
                    </p>
                </div>
            </POSCard>
        </div>
    );
}

"use client";

import React from 'react';
import {
    Settings,
    Database,
    Shield,
    Globe,
    Zap,
    ArrowRight,
    MousePointer2,
    Lock,
    Network
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ConfigurationPage() {
    const configs = [
        { title: 'Industry Logic', value: 'Food & Beverage', icon: MousePointer2, desc: 'Optimized for table management and recipe-based inventory sharding.' },
        { title: 'Ledger Anchoring', value: 'Enabled (Giza-1)', icon: Lock, desc: 'Real-time state anchoring to the NileLink Mainnet cluster.' },
        { title: 'Branch Hierarchy', value: 'Multi-Unit (18)', icon: Network, desc: 'Aggregating revenue and staff metrics across regional clusters.' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-16">
                <header>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">System Core</h1>
                    <p className="text-nile-silver/30 font-bold uppercase tracking-widest text-xs">Protocol Configuration & Security</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {configs.map((cfg, i) => (
                        <GlassCard key={i}>
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-nile-silver mb-8">
                                <cfg.icon size={24} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-nile-silver/30 mb-2">{cfg.title}</h3>
                            <div className="text-2xl font-black text-white italic mb-6 tracking-tight">{cfg.value}</div>
                            <p className="text-xs font-bold text-nile-silver/30 leading-relaxed mb-10">{cfg.desc}</p>
                            <button className="flex items-center gap-3 text-[10px] font-black uppercase text-nile-silver/60 hover:text-white transition-colors">
                                Modify Config <ArrowRight size={14} />
                            </button>
                        </GlassCard>
                    ))}
                </div>

                <div className="glass-panel p-12 rounded-[4rem] border-white/10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Advanced Security Tunnels</h2>
                            <p className="text-xs font-bold text-nile-silver/20 uppercase tracking-widest">TLS 1.3 + Ledger Encrypted Streams</p>
                        </div>
                        <div className="px-6 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">Active Tunnel</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-xs font-bold text-white">Encryption Layer</span>
                                <span className="text-[10px] font-black text-nile-silver/20 uppercase">ChaCha20-Poly1305</span>
                            </div>
                            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-xs font-bold text-white">Identity Proof</span>
                                <span className="text-[10px] font-black text-nile-silver/20 uppercase">ECDSA secp256k1</span>
                            </div>
                        </div>
                        <div className="p-8 rounded-[3rem] bg-nile-dark/40 border border-white/5 relative overflow-hidden">
                            <Shield size={32} className="text-nile-silver/10 mb-6" />
                            <p className="text-xs font-medium text-nile-silver/30 leading-relaxed italic">
                                Every node connection is verified against the genesis consensus block.
                                Unauthorized terminal attempts are automatically sharded and rejected.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

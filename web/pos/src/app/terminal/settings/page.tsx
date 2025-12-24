"use client";

import React from 'react';
import {
    Settings,
    Printer,
    Wifi,
    Database,
    Shield,
    Zap,
    MousePointer2,
    Lock,
    Layers,
    ArrowRight
} from 'lucide-react';

export default function TerminalSettings() {
    const sections = [
        { title: 'Terminal Identity', icon: Zap, desc: 'Hardware ID: NL-EDG-402 • Firmware v0.1.0' },
        { title: 'Printing & Receipts', icon: Printer, desc: 'Thermal 80mm • Auto-Cut Enabled' },
        { title: 'Network Tunnel', icon: Wifi, desc: 'Primary: Cairo-North-1 (14ms)' },
        { title: 'Local Storage', icon: Database, desc: 'SQLite Edge Buffer: 4GB / 32GB' },
        { title: 'Security Protocol', icon: Shield, desc: 'Admin Fingerprint Verified' },
    ];

    return (
        <div className="space-y-12 max-w-5xl">
            <header>
                <div className="flex items-center gap-3 mb-4">
                    <Settings size={24} className="text-nile-silver" />
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Terminal Engine</h1>
                </div>
                <p className="text-nile-silver/30 font-bold uppercase tracking-widest text-xs">Low-Level System Configuration</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {sections.map((s, i) => (
                        <div key={i} className="group p-8 rounded-4xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-white/5 text-nile-silver/20 group-hover:bg-nile-silver group-hover:text-nile-dark transition-all">
                                    <s.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{s.title}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mt-1">{s.desc}</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-nile-silver/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="p-10 rounded-[3rem] glass-panel bg-gradient-to-br from-nile-dark to-black">
                        <h3 className="text-lg font-black text-white italic tracking-tight mb-8">Protocol Anchoring</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-nile-silver/40">Anchor Delay</span>
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">Instant</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-emerald-500 opacity-20" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-nile-silver/40">Ledger Shard</span>
                                <span className="text-xs font-black text-nile-silver uppercase tracking-widest italic">CAI-04</span>
                            </div>
                        </div>
                        <button className="w-full mt-12 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-nile-silver/40 hover:bg-white/5 transition-all">
                            Force State Resync
                        </button>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <Lock size={18} className="text-nile-silver/20" />
                            <h3 className="text-sm font-bold text-white">Advanced Locks</h3>
                        </div>
                        <p className="text-xs font-medium text-nile-silver/20 leading-relaxed italic">
                            System functions are limited to assigned operator roles.
                            Contact network admin for privilege escalation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

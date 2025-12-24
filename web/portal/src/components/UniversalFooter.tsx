"use client";

import React from 'react';
import { Zap, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function UniversalFooter() {
    return (
        <footer className="relative z-10 border-t border-white/5 py-32 px-10 bg-black overflow-hidden">
            <div className="mesh-bg opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <Zap size={24} className="text-white" fill="currentColor" />
                            <span className="text-3xl font-black tracking-tighter text-white uppercase italic nile-text-gradient">NileLink</span>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/20 leading-relaxed italic">
                            The high-performance protocol for local commerce.
                            Anchoring the daily economy to the decentralized ledger with high-fidelity transparency.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <div key={i} className="w-12 h-12 rounded-2xl glass-v2 flex items-center justify-center text-white/20 hover:text-emerald-400 hover:border-emerald-500/20 transition-all cursor-pointer">
                                    <Icon size={20} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div key="System">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-10 italic">System Nodes</h4>
                        <ul className="space-y-6">
                            <li><Link href="https://pos.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Terminal Protocol <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                            <li><Link href="https://delivery.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Logistics HUD <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                            <li><Link href="https://customer.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Discovery Node <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                            <li><Link href="https://supplier.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Supply Hub <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                        </ul>
                    </div>

                    <div key="Protocol">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10 italic">Core Protocol</h4>
                        <ul className="space-y-6">
                            <li><Link href="https://invest.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Network Intelligence <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                            <li><Link href="#" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Developer SDK <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                            <li><Link href="https://api.nilelink.app" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-3 group italic">Edge Gateway <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-white/5 gap-8">
                    <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] italic">
                        © 2025 NILELINK PROTOCOL FOUNDATION. THE DAILY ECONOMY, DECENTRALIZED.
                    </div>
                    <div className="flex items-center gap-6 px-6 py-2 rounded-full glass-v2 border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest italic font-sans">Edge Cluster Node: Giza_Main_01 Alpha Live</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

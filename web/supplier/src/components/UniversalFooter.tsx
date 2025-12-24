"use client";

import React from 'react';
import { Zap, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function UniversalFooter() {
    return (
        <footer className="relative z-10 border-t border-white/5 py-20 px-8 bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap size={22} className="text-nile-silver" fill="currentColor" />
                            <span className="text-2xl font-black tracking-tighter text-nile-silver">NileLink</span>
                        </div>
                        <p className="text-sm font-medium text-nile-silver/40 leading-relaxed">
                            The high-performance protocol for local commerce.
                            Anchoring the daily economy to the decentralized ledger.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-nile-silver/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                                    <Icon size={18} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: 'System', links: ['POS Terminal', 'Delivery View', 'Consumer App', 'Supplier Hub'] },
                        { title: 'Protocol', links: ['Documentation', 'Whitepaper', 'Nodes', 'Governance'] },
                        { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] }
                    ].map((column) => (
                        <div key={column.title}>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-8 italic">{column.title}</h4>
                            <ul className="space-y-4">
                                {column.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm font-bold text-nile-silver/40 hover:text-nile-silver transition-colors flex items-center gap-2 group">
                                            {link}
                                            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
                    <div className="text-[10px] font-bold text-nile-silver/30 uppercase tracking-[0.3em]">
                        © 2025 NileLink Protocol Foundation. Built for the future.
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Mainnet Node Cluster Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

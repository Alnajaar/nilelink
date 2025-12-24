"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function UniversalNavbar() {
    return (
        <nav className="relative z-50 border-b border-white/5 bg-nile-deep/80 backdrop-blur-xl px-6 lg:px-12 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl glass-v2 bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Zap size={22} className="text-black" fill="currentColor" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white uppercase italic nile-text-gradient">NileLink</span>
            </Link>

            <div className="hidden lg:flex items-center gap-12">
                {['Ecosystem', 'Protocol', 'Developers', 'Network'].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-emerald-400 transition-colors italic"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full glass-v2 border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <Globe size={14} className="text-emerald-400/60" />
                    EN
                    <ChevronDown size={12} />
                </div>
                <Link
                    href="https://invest.nilelink.app"
                    className="btn-premium h-14 px-8 text-[9px]"
                >
                    Launch Console
                </Link>
                <button className="lg:hidden p-2 text-white/60">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
}

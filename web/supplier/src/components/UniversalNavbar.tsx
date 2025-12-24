"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function UniversalNavbar() {
    return (
        <nav className="relative z-50 border-b border-white/5 bg-nile-deep/80 backdrop-blur-xl px-6 lg:px-12 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-nile-silver flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Zap size={22} className="text-nile-dark" fill="currentColor" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-nile-silver">NileLink</span>
            </Link>

            <div className="hidden lg:flex items-center gap-10">
                {['Ecosystem', 'Protocol', 'Developers', 'Network'].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-xs font-bold uppercase tracking-widest text-nile-silver/50 hover:text-white transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 text-xs font-bold text-nile-silver/60">
                    <Globe size={14} />
                    EN
                    <ChevronDown size={12} />
                </div>
                <Link
                    href="https://dashboard.nilelink.app"
                    className="btn-primary py-2.5 text-[10px]"
                >
                    Launch Console
                </Link>
                <button className="lg:hidden p-2 text-nile-silver">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
}

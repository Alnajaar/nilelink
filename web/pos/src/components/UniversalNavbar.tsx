"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function UniversalNavbar() {
    return (
        <nav className="relative z-50 border-b-2 border-border-default/50 bg-background-primary/80 backdrop-blur-3xl px-6 lg:px-12 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-primary/20">
                    <Zap size={22} className="text-white" fill="currentColor" />
                </div>
            </Link>

            <div className="hidden lg:flex items-center gap-10">
                {['Ecosystem', 'Protocol', 'Developers', 'Network'].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-xs font-bold uppercase tracking-widest text-nav-text hover:text-surface transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-surface text-xs font-bold text-text">
                    <Globe size={14} />
                    EN
                    <ChevronDown size={12} />
                </div>
                <Link
                    href="https://dashboard.nilelink.app"
                    className="bg-surface text-text hover:bg-background px-4 py-2.5 text-[10px] font-bold rounded-lg border border-primary transition-colors"
                >
                    Launch Console
                </Link>
                <button className="lg:hidden p-2 text-nav-text">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
}

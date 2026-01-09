"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown, Activity } from 'lucide-react';
import Link from 'next/link';

export function UniversalNavbar() {
    const navItems = [
        { href: "/docs", label: "Protocol" },
        { href: "/status", label: "Network Status" },
        { href: "/governance", label: "Governance Documentation" },
        { href: "#pricing", label: "Pricing Ecosystem" },
        { href: "#how-it-works", label: "How It Works" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center shadow-2xl overflow-hidden rounded-xl">
                            <img src="/shared/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:opacity-100 transition-opacity"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface rounded-full border-2 border-primary/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mainnet Live</span>
                    </div>
                    <Link
                        href="/auth/login"
                        className="bg-primary text-background px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all shadow-lg"
                    >
                        Admin Access
                    </Link>
                </div>
            </div>
        </nav>
    );
}

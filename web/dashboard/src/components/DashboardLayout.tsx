"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    PieChart,
    Globe,
    Database,
    Settings,
    Zap,
    Menu,
    X,
    Search,
    Store,
    ChevronDown,
    LayoutDashboard,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/' },
        { id: 'analytics', label: 'Network Pulse', icon: BarChart3, href: '/analytics' },
        { id: 'portfolio', label: 'Asset Management', icon: PieChart, href: '/portfolio' },
        { id: 'nodes', label: 'Global Nodes', icon: Globe, href: '/nodes' },
        { id: 'ledger', label: 'Ledger Audit', icon: Database, href: '/ledger' },
        { id: 'settings', label: 'Configuration', icon: Settings, href: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#020a08] text-nile-silver overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-nile-dark/40 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-10">
                    <Link href="/" className="flex items-center gap-4 mb-20 group">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-nile-silver flex items-center justify-center text-nile-dark shadow-2xl group-hover:rotate-12 transition-transform">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-nile-silver uppercase italic">NileLink</span>
                    </Link>

                    <nav className="flex-1 space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-5 px-8 py-5 rounded-[2rem] font-bold text-sm transition-all relative overflow-hidden group ${pathname === item.href ? 'bg-nile-silver text-nile-dark' : 'text-nile-silver/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} />
                                {item.label}
                                {pathname === item.href && (
                                    <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/5 opacity-20 -z-10" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-10 border-t border-white/5">
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-nile-silver/20 italic">Network Integrity</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="text-xs font-black text-nile-silver/50 flex items-center gap-3">
                                <Database size={14} />
                                Verified Sequence #1024
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-28 border-b border-white/10 flex items-center justify-between px-12 bg-black/20 backdrop-blur-2xl shrink-0">
                    <div className="flex items-center gap-8 flex-1 max-w-4xl">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-3 text-nile-silver glass-panel rounded-2xl">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="hidden sm:flex items-center gap-4 px-6 py-4 rounded-[2rem] bg-white/5 border border-white/10 text-nile-silver/30 flex-1 focus-within:border-nile-silver/30 transition-all">
                            <Search size={22} />
                            <input type="text" placeholder="Audit Protocol Transaction..." className="bg-transparent border-none focus:outline-none text-md font-bold w-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8 ml-8">
                        <div className="hidden lg:flex items-center gap-4 px-6 py-3 rounded-2xl bg-nile-silver/5 border border-nile-silver/10 text-nile-silver/60 cursor-pointer hover:bg-nile-silver/10 transition-all">
                            <Store size={18} />
                            <span className="text-xs font-black uppercase tracking-[0.2em] italic">Cairo Hub - 18 Nodes</span>
                            <ChevronDown size={14} />
                        </div>
                        <div className="w-14 h-14 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center text-nile-silver hover:bg-nile-silver hover:text-nile-dark transition-all cursor-pointer">
                            <Users size={24} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-nile-deep/50 relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-nile-dark/10 blur-[150px] pointer-events-none rounded-full" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="h-full relative z-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

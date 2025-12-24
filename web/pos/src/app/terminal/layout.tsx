"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Package,
    Users,
    BarChart3,
    Settings,
    Zap,
    Menu,
    X,
    Search,
    Wifi,
    Database,
    LayoutGrid,
    DollarSign,
    ChefHat
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { id: 'terminal', label: 'Sales Terminal', icon: LayoutGrid, href: '/terminal' },
        { id: 'inventory', label: 'Inventory Hub', icon: Package, href: '/terminal/inventory' },
        { id: 'recipes', label: 'Recipes', icon: ChefHat, href: '/terminal/recipes' },
        { id: 'staff', label: 'Staff & Roles', icon: Users, href: '/terminal/staff' },
        { id: 'cash', label: 'Cash & Shifts', icon: DollarSign, href: '/terminal/cash' },
        { id: 'analytics', label: 'Branch Analytics', icon: BarChart3, href: '/terminal/analytics' },
        { id: 'settings', label: 'System Settings', icon: Settings, href: '/terminal/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#020a08] text-nile-silver overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-nile-dark/40 backdrop-blur-2xl border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-8">
                    <Link href="/" className="flex items-center gap-4 mb-16 group">
                        <div className="w-10 h-10 rounded-xl bg-nile-silver flex items-center justify-center text-nile-dark shadow-xl">
                            <Zap size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-nile-silver">Terminal</span>
                    </Link>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${pathname === item.href ? 'bg-nile-silver text-nile-dark shadow-xl shadow-nile-silver/10' : 'text-nile-silver/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={20} strokeWidth={pathname === item.href ? 2.5 : 2} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-white/5">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Sync Status</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <div className="text-xs font-bold text-nile-silver/50 flex items-center gap-2">
                                <Database size={12} />
                                Local Ledger Active
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-nile-silver">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-nile-silver/30">
                            <Search size={18} />
                            <input type="text" placeholder="Global Search..." className="bg-transparent border-none focus:outline-none text-sm w-48" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Branch</span>
                            <span className="text-sm font-bold text-white uppercase italic">The Grand Cairo Grill</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-nile-silver">
                            <Store size={22} />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

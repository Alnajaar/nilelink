"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    BarChart3,
    Globe,
    LayoutDashboard,
    PieChart,
    Settings,
    ShieldCheck,
    Zap,
    Database,
    Search,
    Menu,
    X,
    Bell,
    MessageSquare,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoModeBanner, LiveModeBanner } from '@shared/components/ModeBanner';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [pathname]);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
        { id: 'billing', label: 'Billing & Fees', icon: CreditCard, href: '/billing' },
        { id: 'portfolio', label: 'Portfolio', icon: PieChart, href: '/portfolio' },
        { id: 'nodes', label: 'Edge Nodes', icon: Globe, href: '/nodes' },
        { id: 'ledger', label: 'Protocol Ledger', icon: Database, href: '/ledger' },
        { id: 'governance', label: 'Governance', icon: ShieldCheck, href: '/governance' },
    ];

    return (
        <div className="flex h-screen bg-background-dark text-text-primary selection:bg-primary/30 overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background-card/80 backdrop-blur-2xl transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex flex-col h-full">
                    <Link href="/" className="flex items-center gap-4 mb-12 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                            <Zap size={22} fill="white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">NileLink</span>
                    </Link>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-3 rounded-2xl transition-all group ${pathname === item.href || (item.id === 'overview' && pathname === '/')
                                    ? 'bg-primary/10 text-primary border border-primary/10'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-background-light/5'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-bold text-sm">{item.label}</span>
                                {pathname === item.href && (
                                    <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-border">
                        <Link href="/settings" className="flex items-center gap-4 px-5 py-3 text-text-secondary hover:text-text-primary transition-all group">
                            <Settings size={20} />
                            <span className="font-bold text-sm">Settings</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="px-8 py-6 border-b border-border flex items-center justify-between bg-background-card/50 backdrop-blur-md">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-text-secondary">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex-1 flex justify-center max-w-xl mx-auto px-4">
                        <div className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl bg-background-card/10 border border-border focus-within:border-primary/30 transition-all">
                            <Search size={18} className="text-text-secondary" />
                            <input type="text" placeholder="Search protocol..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            EDGE SYNCED
                        </div>
                        <button className="p-2 text-text-secondary hover:text-text-primary transition-colors relative">
                            <Bell size={20} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></div>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-background-card border border-border" />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                    {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? <DemoModeBanner /> : <LiveModeBanner />}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-background-dark"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Fetching Node State</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {children}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

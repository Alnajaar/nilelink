"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, TrendingUp, Activity, Box, Search,
    Menu, X, Bell, LayoutDashboard, ShoppingBag,
    Users, Settings, LogOut, Globe, ShieldCheck,
    ChevronRight, ArrowUpRight, ArrowDownRight,
    Database, Cpu, Network
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const stats = [
        { label: 'Total Revenue', value: '$1.24M', trend: '+12.5%', icon: TrendingUp, color: 'text-primary', glow: 'bg-primary/10' },
        { label: 'Active Orders', value: '4,892', trend: '+5.2%', icon: Activity, color: 'text-secondary', glow: 'bg-secondary/10' },
        { label: 'Node Status', value: 'Healthy', trend: '100%', icon: Network, color: 'text-success', glow: 'bg-success/10' },
        { label: 'Branch Flow', value: '18 Units', trend: '+2.1%', icon: Box, color: 'text-accent', glow: 'bg-accent/10' },
    ];

    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'sales', icon: ShoppingBag, label: 'Sales Engine' },
        { id: 'inventory', icon: Box, label: 'Resources' },
        { id: 'staff', icon: Users, label: 'Human Assets' },
        { id: 'network', icon: Globe, label: 'Node Network' },
        { id: 'security', icon: ShieldCheck, label: 'SecOps' },
    ];

    return (
        <div className="flex h-screen bg-neutral text-text-primary selection:bg-primary/20 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Sidebar */}
            <aside className="w-80 border-r border-border-subtle p-8 hidden lg:flex flex-col relative z-20 bg-white/40 backdrop-blur-2xl">
                <div className="flex items-center gap-4 mb-12">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20"
                    >
                        <Zap size={24} className="text-background" />
                    </motion.div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic text-text-primary">
                        NileLink
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-primary text-background shadow-lg shadow-primary/20'
                                    : 'text-text-secondary hover:bg-neutral hover:text-text-primary'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-background' : 'group-hover:text-primary transition-colors'} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="bg-neutral/50 rounded-2xl p-6 border border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-60">Node Load</span>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">42%</span>
                        </div>
                        <div className="h-1 bg-neutral-dark rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '42%' }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-error hover:bg-error/5 transition-all group">
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deauthorize</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-neutral/30">
                <header className="px-10 py-8 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-white/40 backdrop-blur-2xl z-30">
                    <div className="flex items-center gap-8">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-black tracking-tight text-text-primary uppercase italic"
                            >
                                Executive Console
                            </motion.h1>
                            <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Real-time Protocol Monitoring</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-border-subtle focus-within:border-primary/50 transition-all shadow-sm">
                            <Search size={18} className="text-text-muted opacity-50" />
                            <input type="text" placeholder="Search parameters..." className="bg-transparent border-none focus:outline-none text-xs font-bold uppercase tracking-widest w-48 placeholder:text-text-muted/40" />
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-success/5 border border-success/20">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-success text-[10px] font-black tracking-[0.2em] uppercase">Protocol Online</span>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-12 h-12 rounded-2xl bg-white border border-border-subtle p-1 flex items-center justify-center cursor-pointer shadow-lg"
                        >
                            <div className="w-full h-full rounded-xl bg-neutral flex items-center justify-center font-black text-[10px] text-primary">NL</div>
                        </motion.div>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="bg-white rounded-[2rem] p-8 border border-border-subtle shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.glow} blur-[60px] rounded-full -mr-16 -mt-16 group-hover:blur-[80px] transition-all`} />

                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl ${stat.glow} flex items-center justify-center`}>
                                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-success uppercase tracking-widest leading-none mb-1">{stat.trend}</span>
                                            <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">vs last cycle</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-2">{stat.label}</h3>
                                        <p className="text-4xl font-black text-text-primary tracking-tighter italic">{stat.value}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-border-subtle p-10 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-text-primary uppercase italic tracking-tight">Revenue Trajectory</h3>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60 mt-1">Institutional volume analysis</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['24H', '7D', '30D', 'ALL'].map((p) => (
                                            <button key={p} className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase transition-all ${p === '7D' ? 'bg-primary text-background' : 'bg-neutral text-text-secondary hover:bg-neutral-dark'}`}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[400px] flex items-end gap-3 relative z-10">
                                    {[65, 45, 75, 55, 85, 95, 70, 60, 80, 50, 90, 100].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                                            className="flex-1 bg-neutral rounded-t-xl relative group"
                                        >
                                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-all rounded-t-xl shadow-[0_-10px_30px_rgba(var(--primary-rgb),0.3)]" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-border-subtle p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 blur-[80px] rounded-full -mr-24 -mt-24" />
                                <h3 className="text-xl font-black text-text-primary uppercase italic tracking-tight mb-8 relative z-10">Recent Operations</h3>
                                <div className="space-y-6 relative z-10">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-neutral transition-all">
                                            <div className="w-12 h-12 rounded-xl bg-neutral flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                                                <Activity size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-text-primary uppercase tracking-tight">External Sync #{4820 + i}</p>
                                                <p className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mt-1">04:{10 + i} AM · Verified</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-success">+$240.00</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-10 py-4 bg-neutral hover:bg-neutral-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary transition-all">View All Logs</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

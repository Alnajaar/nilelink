"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Settings, Package, Users, BarChart,
    CreditCard, ArrowUpRight, Search, Bell, Plus, Clock,
    Shield, CheckCircle2, AlertCircle, Gem, Store, Menu, X,
    Zap, TrendingUp, Activity, Box, Globe, LogOut, Flame,
    DollarSign, Laptop, RefreshCw, Printer, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function AdminDashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Mock subscription data
    const subscription = { planName: 'Enterprise', isTrialActive: true, plan: 'enterprise' };
    const getRemainingTrialDays = () => 25;
    const [businessName, setBusinessName] = useState('NileLink Global');
    const [userLocation, setUserLocation] = useState<string>('');
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedBusiness = localStorage.getItem('businessName');
        if (storedBusiness) setBusinessName(storedBusiness);

        // Mock notifications
        setNotifications([
            { id: 1, title: 'Network Congestion', message: 'Mainnet latency detected in Alex-Dist-2', time: '2m ago', type: 'warning' },
            { id: 2, title: 'Settlement Synchronized', message: '342.12 ETH anchored to protocol', time: '15m ago', type: 'success' },
            { id: 3, title: 'Node Verification', message: 'New terminal POS-72X1 authorized', time: '1h ago', type: 'info' }
        ]);

        // Mock location
        setUserLocation('Alexandria, Egypt');
    }, []);

    if (!mounted) return null;

    const stats = [
        { label: 'Network Revenue', value: '$12.8M', change: '+12%', icon: TrendingUp, color: 'text-primary', glow: 'bg-primary/10' },
        { label: 'Active Channels', value: '4,820', change: '+5%', icon: Activity, color: 'text-secondary', glow: 'bg-secondary/10' },
        { label: 'Protocol Nodes', value: '12', change: '0%', icon: Globe, color: 'text-success', glow: 'bg-success/10' },
        { label: 'Quantum Flow', value: '$26.5K', change: '-2%', icon: Box, color: 'text-accent', glow: 'bg-accent/10' },
    ];

    const menuItems = [
        { icon: LayoutDashboard, label: 'Control Plane', path: '/admin', active: true },
        { icon: Menu, label: 'Resource Map', path: '/admin/menus' },
        { icon: Package, label: 'Inventory Assets', path: '/admin/items' },
        { icon: Users, label: 'Human Capitals', path: '/admin/staff' },
        { icon: BarChart, label: 'Analytics Engine', path: '/admin/analytics' },
        { icon: CreditCard, label: 'Settlement Gateways', path: '/admin/payments' },
        { icon: Gem, label: 'Protocol Plan', path: '/admin/plans' },
        { icon: Settings, label: 'System Config', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-neutral text-text-primary selection:bg-primary/20 overflow-hidden relative">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/40 backdrop-blur-2xl border-r border-border-subtle flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-12">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20"
                        >
                            <Shield size={24} className="text-background" />
                        </motion.div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic text-primary">ADMIN OS</span>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${item.active
                                        ? 'bg-primary text-background shadow-lg shadow-primary/20'
                                        : 'text-text-secondary hover:bg-neutral hover:text-text-primary'
                                    }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-background' : 'group-hover:text-primary transition-colors'} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-10">
                    <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Gem size={18} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">ENTERPRISE CLOUD</span>
                        </div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-6 leading-relaxed relative z-10 opacity-60">
                            Multi-branch AI prediction active.
                        </p>
                        <Button className="w-full h-12 bg-primary text-background font-black text-[9px] tracking-[0.3em] uppercase rounded-2xl relative z-10">LICENSE SETTINGS</Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-neutral/30">
                <header className="px-10 py-8 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-white/40 backdrop-blur-2xl z-30">
                    <div className="flex items-center gap-8">
                        {/* Mobile Toggle */}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-3 bg-white rounded-2xl border border-border-subtle shadow-sm">
                            <Menu size={20} />
                        </button>
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-black tracking-tight text-text-primary uppercase italic leading-none"
                            >
                                {businessName}
                            </motion.h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge className="bg-success text-background text-[8px] font-black uppercase tracking-widest px-3 py-1">Protocol Active</Badge>
                                <span className="text-text-secondary text-[8px] font-black uppercase tracking-widest opacity-40 italic">{userLocation}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-border-subtle focus-within:border-primary/50 transition-all shadow-sm">
                            <Search size={18} className="text-text-muted opacity-50" />
                            <input type="text" placeholder="Global resource search..." className="bg-transparent border-none focus:outline-none text-xs font-bold uppercase tracking-widest w-48 placeholder:text-text-muted/40" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="w-12 h-12 rounded-2xl bg-white border border-border-subtle flex items-center justify-center text-text-secondary shadow-sm hover:shadow-md transition-all relative"
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                                </motion.button>
                                {/* Notifications Dropdown Mock */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 top-full mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-border-subtle p-8 z-50"
                                        >
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-6 opacity-60">System Logs</h4>
                                            <div className="space-y-6">
                                                {notifications.map(n => (
                                                    <div key={n.id} className="flex gap-4 group cursor-pointer">
                                                        <div className={`w-10 h-10 rounded-xl ${n.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} flex items-center justify-center shrink-0`}>
                                                            {n.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-primary mb-1">{n.title}</p>
                                                            <p className="text-[9px] font-medium text-text-secondary opacity-60 line-clamp-2 leading-relaxed">{n.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-4 pl-4 border-l border-border-subtle cursor-pointer"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Master Administrator</p>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 italic">ID: X72-841-K90</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-background font-black text-xs shadow-xl shadow-primary/20">
                                    MA
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    {/* Trial Banner */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary rounded-[3rem] p-12 text-background relative overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent flex items-center justify-center">
                            <Shield size={180} className="text-background/5 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <Badge className="bg-background text-primary text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">QUANTUM TRIAL LIVE</Badge>
                                <span className="text-[9px] font-black uppercase tracking-widest text-background/60 italic">25 Cycles Remaining</span>
                            </div>
                            <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter italic leading-none">The Protocol is Yours.</h2>
                            <p className="text-background/70 max-w-2xl text-sm font-medium leading-relaxed mb-10">
                                You are operating one of the first 10 hyper-merchants. Full protocol access authorized.
                                Secure your institutional legacy with NileLink Pro.
                            </p>
                            <div className="flex gap-4">
                                <Button className="h-14 px-10 bg-background text-primary hover:bg-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all shadow-xl shadow-black/10">SETTLE HARDWARE</Button>
                                <Button variant="outline" className="h-14 px-10 border-background/20 text-background hover:bg-background/10 font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl transition-all">RESEARCH DOCS</Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="bg-white rounded-[2.5rem] p-10 border border-border-subtle shadow-xl hover:shadow-22l transition-all group relative overflow-hidden cursor-pointer">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.glow} blur-[60px] rounded-full -mr-16 -mt-16 group-hover:blur-[80px] transition-all`} />
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl ${stat.glow} flex items-center justify-center ${stat.color} shadow-lg shadow-current/5`}>
                                            <stat.icon size={26} />
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.change.startsWith('+') ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'}`}>
                                            {stat.change} DELTA
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-2 opacity-60">{stat.label}</p>
                                        <p className="text-4xl font-black text-text-primary tracking-tighter italic">{stat.value}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Launch Panel */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary opacity-60">Sequence Initiators</h3>
                            <button className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline italic">Edit Console</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {[
                                { icon: Plus, label: 'Add Manifest', path: '/admin/products', color: 'bg-primary/5 text-primary' },
                                { icon: Store, label: 'Add Domain', path: '/admin/settings', color: 'bg-secondary/5 text-secondary' },
                                { icon: Users, label: 'Add Agent', path: '/admin/staff', color: 'bg-success/5 text-success' },
                                { icon: Package, label: 'Inventory Sync', path: '/terminal/inventory', color: 'bg-accent/5 text-accent' },
                                { icon: CreditCard, label: 'Payment Hub', path: '/admin/payments', color: 'bg-primary/5 text-primary' },
                                { icon: ArrowUpRight, label: 'Launch OS', path: '/terminal', color: 'bg-secondary/5 text-secondary' }
                            ].map((action, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    onClick={() => router.push(action.path)}
                                    className="bg-white rounded-[2rem] p-8 border border-border-subtle shadow-xl hover:shadow-2xl transition-all text-center group"
                                >
                                    <div className={`w-16 h-16 ${action.color} rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-current/5`}>
                                        <action.icon size={28} />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-primary mb-2 whitespace-nowrap">{action.label}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40 italic">Launch</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Hardware & Terminal Monitor */}
                        <div className="lg:col-span-12 xl:col-span-8">
                            <div className="bg-white rounded-[3rem] p-12 border border-border-subtle shadow-2xl relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Hardware Network</h3>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60 mt-1">Live terminal synchronization</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button className="bg-neutral text-text-primary hover:bg-neutral-dark font-black text-[9px] tracking-[0.2em] uppercase px-8 rounded-2xl h-12">SCAN PROTOCOL</Button>
                                        <Button className="bg-primary text-background font-black text-[9px] tracking-[0.2em] uppercase px-8 rounded-2xl h-12 shadow-xl shadow-primary/20">ADD NODE</Button>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {[
                                        { name: 'Front Desk 1', id: 'POS-72X1', status: 'Active', users: 3, type: 'Stationary', color: 'text-success' },
                                        { name: 'Kitchen Relay', id: 'KDS-99W2', status: 'Active', users: 1, type: 'Display', color: 'text-success' },
                                        { name: 'Mobile Bar Unit', id: 'MPOS-33K9', status: 'Error', users: 2, type: 'Handheld', color: 'text-red-500' }
                                    ].map((t, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-neutral/30 rounded-[2rem] border border-border-subtle hover:bg-neutral/50 transition-all group cursor-pointer gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-primary shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                                                    {t.type === 'Stationary' ? <Laptop size={32} /> : t.type === 'Display' ? <RefreshCw size={32} /> : <Smartphone size={32} />}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-text-primary uppercase tracking-tight italic mb-1">{t.name}</p>
                                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">Serial: {t.id} · {t.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-12">
                                                <div className="text-center">
                                                    <p className="text-xl font-black text-text-primary italic">{t.users}</p>
                                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">Operators</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <Badge className={`${t.status === 'Active' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'} text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-none mb-2`}>{t.status}</Badge>
                                                    <div className="flex gap-4">
                                                        <Printer size={16} className="text-text-secondary opacity-20 hover:opacity-100 transition-opacity" />
                                                        <Activity size={16} className="text-text-secondary opacity-20 hover:opacity-100 transition-opacity" />
                                                        <ArrowUpRight size={16} className="text-primary opacity-40 hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Protocol Events */}
                        <div className="lg:col-span-12 xl:col-span-4">
                            <div className="bg-white rounded-[3rem] p-12 border border-border-subtle shadow-2xl relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 blur-3xl rounded-full -mr-24 -mt-24" />
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic mb-10 relative z-10">Protocol Feed</h3>
                                <div className="space-y-10 relative z-10">
                                    {[
                                        { icon: Shield, title: 'Security Auth', time: '2m ago', desc: 'Terminal POS-72X1 authorized by user X72.', color: 'text-primary' },
                                        { icon: CheckCircle2, title: 'Ledger Anchored', time: '15m ago', desc: 'Batch sync complete. 482 tx verified on-chain.', color: 'text-success' },
                                        { icon: AlertCircle, title: 'Resource Alert', time: '1h ago', desc: 'Critical low level: Premium Arabica Beans.', color: 'text-warning' },
                                        { icon: RefreshCw, title: 'System Sync', time: '3h ago', desc: 'Regional databaseAlexandria re-indexed.', color: 'text-secondary' },
                                        { icon: Users, title: 'Agent Session', time: '4h ago', desc: 'Sarah J. initialized shift at Front Desk 1.', color: 'text-accent' }
                                    ].map((event, idx) => (
                                        <div key={idx} className="flex gap-6 group hover:translate-x-2 transition-transform">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-[1.2rem] bg-neutral/50 flex items-center justify-center ${event.color} shadow-lg shadow-current/5 group-hover:bg-neutral group-hover:scale-110 transition-all`}>
                                                    <event.icon size={22} />
                                                </div>
                                                {idx < 4 && <div className="w-0.5 flex-1 bg-border-subtle/30 my-3" />}
                                            </div>
                                            <div className="pt-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">{event.title}</p>
                                                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40">{event.time}</p>
                                                </div>
                                                <p className="text-[10px] font-medium text-text-secondary opacity-60 leading-relaxed">{event.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-12 py-4 bg-neutral hover:bg-neutral-dark rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary transition-all">DECRYPT FULL LEDGER</button>
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

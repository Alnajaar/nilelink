"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    BarChart3,
    Globe,
    LayoutDashboard,
    PieChart,
    Settings,
    ShieldCheck,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Database,
    Search,
    ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Revenue', value: '$1.24M', trend: '+12.5%', icon: TrendingUp, color: 'text-blue-400', glow: 'bg-blue-500/10' },
        { label: 'Active Orders', value: '4,892', trend: '+5.2%', icon: Activity, color: 'text-purple-400', glow: 'bg-purple-500/10' },
        { label: 'Edge Latency', value: '14ms', trend: '-2.1%', icon: Zap, color: 'text-cyan-400', glow: 'bg-cyan-500/10' },
        { label: 'Nodes Sync', value: '100%', trend: 'Verified', icon: ShieldCheck, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-8 hidden lg:flex flex-col relative z-20 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-12">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Zap size={22} fill="white" />
                    </motion.div>
                    <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        NileLink
                    </span>
                </div>

                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'investments', label: 'Portfolio', icon: PieChart },
                        { id: 'nodes', label: 'Edge Nodes', icon: Globe },
                        { id: 'ledger', label: 'Protocol Ledger', icon: Database },
                        { id: 'governance', label: 'Governance', icon: ShieldCheck },
                    ].map((item, i) => (
                        <motion.button
                            key={item.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? 'text-blue-400' : 'group-hover:text-white transition-colors'} />
                            <span className="font-semibold text-sm">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            )}
                        </motion.button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <button className="flex items-center gap-4 px-5 py-3 text-zinc-500 hover:text-zinc-200 w-full transition-all group">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800">
                            <Settings size={18} />
                        </div>
                        <span className="font-medium text-sm">Protocol Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                <header className="px-10 py-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#050505]/60 backdrop-blur-2xl z-30">
                    <div className="flex items-center gap-8">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent"
                            >
                                Welcome, NileLink Partner
                            </motion.h1>
                            <p className="text-zinc-500 text-sm mt-1 font-medium">Monitoring the decentralized economic engine.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/50 border border-white/5 focus-within:border-blue-500/50 transition-all">
                            <Search size={18} className="text-zinc-500" />
                            <input type="text" placeholder="Search events..." className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-zinc-600" />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">Protocol Live</span>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-11 h-11 rounded-2xl bg-zinc-800 border border-white/10 p-0.5 overflow-hidden cursor-pointer"
                        >
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-zinc-700 to-zinc-900" />
                        </motion.div>
                    </div>
                </header>

                <section className="p-10 max-w-[1600px] mx-auto">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                        {stats.map((stat, i) => (
                            <GlassCard key={i} delay={i * 0.1}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl ${stat.glow} border border-white/5`}>
                                        <stat.icon size={22} className={stat.color} />
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 45 }}
                                        className="p-1.5 rounded-full bg-white/5 text-zinc-500 hover:text-white cursor-pointer transition-colors"
                                    >
                                        <ArrowUpRight size={16} />
                                    </motion.div>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm font-semibold mb-2">{stat.label}</p>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-3xl font-bold tracking-tighter">{stat.value}</h3>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                </div>
                                {/* Micro-chart simulation */}
                                <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: i % 2 === 0 ? '70%' : '45%' }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`h-full bg-gradient-to-r ${stat.color.replace('text', 'from')} to-white/20`}
                                    />
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Real-time Growth Chart */}
                        <GlassCard className="lg:col-span-8 p-10" delay={0.4}>
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Ecosystem Growth</h2>
                                    <p className="text-zinc-500 text-sm mt-1 font-medium italic">Consolidated revenue across global edge nodes.</p>
                                </div>
                                <div className="flex p-1 rounded-2xl bg-zinc-900 border border-white/5">
                                    {['7D', '30D', '1Y'].map(d => (
                                        <button key={d} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${d === '30D' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-80 flex items-end gap-2 w-full group/chart">
                                {[45, 65, 55, 85, 75, 95, 110, 80, 70, 100, 120, 115, 130, 150, 140, 160, 170, 155, 180, 200, 190, 210, 230].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(h / 230) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.8 + (i * 0.03) }}
                                        className="flex-1 bg-gradient-to-t from-blue-600/40 via-blue-500/20 to-blue-400 rounded-t-lg transition-all duration-300 hover:scale-x-110 hover:from-blue-400 hover:to-white relative group"
                                    >
                                        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none">
                                            ${h}k
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 px-2">
                                {['Oct 23', 'Nov 04', 'Nov 16', 'Nov 28', 'Dec 10', 'Dec 22'].map(date => (
                                    <span key={date} className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{date}</span>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Health & Verification Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <GlassCard className="bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent border-indigo-500/10" delay={0.5}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                                            <Globe size={18} />
                                        </div>
                                        <h3 className="font-bold text-lg">Live Nodes</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-500">SYNCED</span>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { node: 'Cairo-North-1', load: '42%', status: 'active' },
                                        { node: 'Alex-Dist-2', load: '18%', status: 'idle' },
                                        { node: 'Dubai-Main-Gateway', load: '76%', status: 'high' },
                                        { node: 'Casablanca-Edge', load: '31%', status: 'active' },
                                    ].map((node, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'high' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                                <span className="text-sm font-semibold text-zinc-200">{node.node}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-indigo-400 font-bold">{node.load}</span>
                                                <ChevronRight size={14} className="text-zinc-600" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="border-dashed border-zinc-700 bg-transparent flex flex-col items-center justify-center py-12" delay={0.6}>
                                <div className="relative mb-6">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-20 h-20 rounded-full border border-zinc-800 border-t-blue-500 border-r-purple-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck size={32} className="text-blue-400" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-xl mb-2">Immutable Ledger</h4>
                                <p className="text-xs text-zinc-500 text-center leading-relaxed px-10">
                                    NileLink Protocol ensures every event is hashed, salted, and anchored for 100% financial transparency.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-8 px-6 py-3 rounded-2xl bg-white text-black text-xs font-bold shadow-xl shadow-white/5"
                                >
                                    Verify Contract
                                </motion.button>
                            </GlassCard>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}

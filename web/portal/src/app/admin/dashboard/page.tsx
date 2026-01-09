"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Globe, Shield, Zap,
    TrendingUp, Users, DollarSign, BarChart3,
    ArrowUpRight, ArrowDownRight, Search, Filter,
    LayoutGrid, List, Map, MoreVertical,
    AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';

export default function AdminDashboard() {
    const [view, setView] = useState<'Overview' | 'Financials' | 'Security'>('Overview');

    return (
        <div className="space-y-10">
            {/* Header / Global Metrics Bar */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-text rounded-lg text-primary shadow-2xl">
                            <Activity size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-text uppercase tracking-tighter italic">Global Command</h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-12">NileLink Ecosystem Oversight • v4.2S</p>
                </div>
                <div className="flex gap-4">
                    <div className="p-1 bg-surface rounded-2xl flex border-2 border-transparent focus-within:border-text transition-all">
                        {['Overview', 'Financials', 'Security'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v as any)}
                                className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${view === v ? 'bg-text text-background shadow-lg' : 'text-text opacity-30 hover:opacity-100'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Top Level Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Card className="p-8 border-2 border-text bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,0.05)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Daily Volume</p>
                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-4xl font-black font-mono tracking-tighter text-text">$4.2M</h2>
                        <span className="text-emerald-500 font-black text-xs mb-1">+12.4%</span>
                    </div>
                    <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-primary" />
                    </div>
                </Card>

                <Card className="p-8 border-2 border-surface bg-background">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Active Users</p>
                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-4xl font-black font-mono tracking-tighter text-text">84.2K</h2>
                        <span className="text-emerald-500 font-black text-xs mb-1">+5.1%</span>
                    </div>
                    <p className="text-[9px] font-bold text-text opacity-40 uppercase tracking-widest italic">Regional growth surge in Cairo</p>
                </Card>

                <Card className="p-8 border-2 border-surface bg-background">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Server Health</p>
                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-4xl font-black font-mono tracking-tighter text-text">99.98%</h2>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-3" />
                    </div>
                    <p className="text-[9px] font-bold text-text opacity-40 uppercase tracking-widest italic">All 1,242 nodes operational</p>
                </Card>

                <Card className="p-8 border-2 border-primary bg-text text-background relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform">
                        <TrendingUp size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Protocol Yield</p>
                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-4xl font-black font-mono tracking-tighter">4.21%</h2>
                        <span className="text-primary font-black text-xs mb-1">STABLE</span>
                    </div>
                    <Button className="w-full h-10 mt-4 bg-primary text-background font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-background hover:text-text transition-all">
                        Optimize Treasury
                    </Button>
                </Card>
            </div>

            {/* Central Intelligence Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Demand Heatmap Simulation */}
                <div className="xl:col-span-8">
                    <Card className="h-[600px] border-2 border-text bg-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-surface opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="p-8 border-b border-surface flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Regional Demand HUD</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Live Spatial Intelligence Dashboard</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="h-10 w-10 p-0 border-2 border-surface rounded-xl hover:border-text transition-all">
                                    <Map size={18} />
                                </Button>
                                <Button variant="outline" className="h-10 w-10 p-0 border-2 border-surface rounded-xl hover:border-text transition-all">
                                    <List size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Simulated Heatmap Content */}
                        <div className="relative h-full w-full flex items-center justify-center p-20 opacity-20 pointer-events-none">
                            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse" />
                            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-text/40 rounded-full blur-[120px]" />
                            <Globe size={400} className="text-text opacity-10" />
                        </div>

                        {/* Top Performers Floating HUD */}
                        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { city: 'Cairo', vol: '$1.2M', surge: '+24%' },
                                { city: 'Dubai', vol: '$0.8M', surge: '+18%' },
                                { city: 'Riyadh', vol: '$0.6M', surge: '+12%' }
                            ].map((region) => (
                                <div key={region.city} className="p-6 bg-text text-background rounded-3xl border border-primary/20 shadow-2xl">
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">{region.city}</p>
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xl font-black font-mono tracking-tighter">{region.vol}</h4>
                                        <Badge className="bg-primary text-background border-0 text-[8px] font-black">{region.surge}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Real-time Event Feed */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-30">Live Protocol Ledger</h3>
                        <Badge className="bg-surface text-text/40 border-0 font-black text-[8px] uppercase">v4.2S Feed</Badge>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pb-10">
                        {[
                            { type: 'PAYMENT', desc: 'Merchant Settlement', amt: '$12,402', status: 'SUCCESS', time: '12s ago' },
                            { type: 'DRIVER', desc: 'Protocol Payout', amt: '$842', status: 'SUCCESS', time: '45s ago' },
                            { type: 'SECURITY', desc: 'Node Verification', amt: '---', status: 'VERIFIED', time: '1m ago' },
                            { type: 'ORDER', desc: 'Bulk Supply Restock', amt: '$4,500', status: 'PENDING', time: '3m ago' },
                            { type: 'FRAUD', desc: 'Anomalous Activity', amt: '---', status: 'FLAGGED', time: '12m ago' }
                        ].map((event, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-5 border-2 border-surface bg-white hover:border-text transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.type === 'FRAUD' ? 'bg-rose-500 text-white' : 'bg-surface text-text opacity-40 group-hover:bg-primary group-hover:text-background'} transition-all`}>
                                            <Zap size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="text-sm font-black uppercase tracking-tighter truncate">{event.desc}</h4>
                                                <span className="text-[8px] font-black font-mono tracking-tighter text-text/20">{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black font-mono tracking-tighter">{event.amt}</span>
                                                <Badge className={`text-[7px] font-black border-0 uppercase ${event.status === 'FLAGGED' ? 'bg-rose-500 text-white' : 'bg-surface text-text opacity-40'}`}>{event.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <Button className="w-full h-14 bg-surface text-text font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-text hover:text-background transition-all border-2 border-text/5">
                        Initialize Full Audit
                        <Shield size={14} className="ml-2 opacity-30" />
                    </Button>
                </div>
            </div>

            {/* Strategic Intelligence Footer Section */}
            <div className="p-10 rounded-[4rem] bg-text text-background relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Globe size={300} />
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">AI Optimization</Badge>
                        <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Global Supply Chain<br />Load Balancing</h3>
                        <p className="text-sm text-background/40 leading-relaxed max-w-md">
                            NileLink AI has identified a 12% inefficiency in the Northern Cairo cluster.
                            Deploying additional courier nodes could increase regional revenue by $140k/weekly.
                        </p>
                    </div>
                    <div className="flex justify-start md:justify-end gap-4">
                        <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-background hover:text-text transition-all shadow-2xl">
                            Deploy Optimization
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

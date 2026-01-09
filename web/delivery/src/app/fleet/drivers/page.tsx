"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, Star, Award, TrendingDown,
    TrendingUp, ShieldCheck, Mail, MapPin,
    Search, Filter, MoreVertical, LayoutGrid,
    Target, Zap, Activity
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function DriverAnalytics() {
    const drivers = [
        { name: 'Ahmed Nile', rating: 4.98, trips: 1242, status: 'Elite', performance: '+12%', color: 'bg-primary' },
        { name: 'Sara Cairo', rating: 4.85, trips: 850, status: 'Pro', performance: '+5%', color: 'bg-emerald-500' },
        { name: 'Layla Dubai', rating: 4.92, trips: 2100, status: 'Master', performance: '+18%', color: 'bg-indigo-500' },
        { name: 'Karim Giza', rating: 4.50, trips: 120, status: 'Standard', performance: '-2%', color: 'bg-amber-500' }
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-text rounded-lg text-primary shadow-lg shadow-text/10">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-text uppercase tracking-tighter leading-none">Driver Intelligence</h1>
                            <p className="text-[10px] font-black uppercase text-text/40 tracking-[0.3em] mt-1">Performance Metrics • NileLink Fleet Logistics</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <h2 className="text-2xl font-black text-text/10 tracking-tighter uppercase leading-none">استخبارات السائقين</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-20" size={18} />
                            <input type="text" placeholder="Search ID or Name..." className="h-14 pl-12 pr-6 bg-surface border-2 border-transparent focus:border-text focus:bg-white rounded-2xl w-80 font-bold transition-all outline-none" />
                        </div>
                        <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-background rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 text-xs text-nowrap">
                            Recruit Driver
                        </Button>
                    </div>
                </div>
            </header>

            {/* Market High-Levels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 border-2 border-text bg-white">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-text opacity-30">Fleet Sentiment</h3>
                    <div className="flex items-end gap-5 mb-6">
                        <h2 className="text-5xl font-black font-mono tracking-tighter text-text">4.92</h2>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs mb-2">
                            <Star size={16} fill="currentColor" />
                            <span>Global Avg</span>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-primary" />
                    </div>
                </Card>

                <Card className="p-8 border-2 border-surface bg-background">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-text opacity-30">Churn Probability</h3>
                    <div className="flex items-end gap-5 mb-6">
                        <h2 className="text-5xl font-black font-mono tracking-tighter text-text">1.2%</h2>
                        <span className="text-emerald-500 font-black text-xs mb-2">Ultra Low</span>
                    </div>
                    <p className="text-[10px] font-bold text-text opacity-30 uppercase tracking-[0.2em]">Based on weekly payout satisfaction</p>
                </Card>

                <Card className="p-8 border-2 border-primary bg-text text-background relative overflow-hidden group">
                    <Award className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform" size={120} />
                    <div className="relative">
                        <Badge className="bg-primary text-background border-0 font-black text-[8px] px-2 py-1 mb-6 uppercase tracking-widest">Protocol Rewards</Badge>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">Distribute Elite<br />Bonuses</h3>
                        <p className="text-xs text-background/60 leading-relaxed mb-8">Allocate the monthly $25,000 protocol pool to the top 10% of regional drivers.</p>
                        <Button className="w-full h-12 bg-background text-text font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary hover:text-background transition-all">
                            Initialize Distribution
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {drivers.map((driver, i) => (
                    <motion.div
                        key={driver.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="p-0 border-2 border-surface bg-white hover:border-text transition-all group overflow-hidden">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`w-16 h-16 rounded-[2rem] ${driver.color} flex items-center justify-center text-background text-2xl font-black shadow-xl group-hover:scale-110 transition-transform`}>
                                        {driver.name[0]}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end text-amber-500 font-black mb-1">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-sm font-mono">{driver.rating}</span>
                                        </div>
                                        <Badge className="bg-surface text-text/30 text-[8px] font-black border-0 uppercase">{driver.status}</Badge>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-text uppercase tracking-tighter leading-none mb-2">{driver.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-black text-text opacity-30 uppercase tracking-widest mb-10">
                                    <MapPin size={12} /> Cairo North Sector
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface rounded-2xl">
                                        <p className="text-[8px] font-black uppercase opacity-30 mb-1">Total Trips</p>
                                        <p className="text-lg font-black font-mono leading-none">{driver.trips}</p>
                                    </div>
                                    <div className="p-4 bg-surface rounded-2xl">
                                        <p className="text-[8px] font-black uppercase opacity-30 mb-1">Perf Delta</p>
                                        <p className={`text-lg font-black font-mono leading-none ${driver.performance.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {driver.performance}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-5 bg-surface/30 border-t border-surface flex gap-2">
                                <Button className="flex-1 h-10 bg-text text-background font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary transition-all shadow-sm">
                                    Analytics
                                </Button>
                                <Button variant="outline" className="w-10 h-10 p-0 border-2 border-surface rounded-xl text-text/20 hover:text-text hover:border-text transition-all">
                                    <Mail size={16} />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Advanced Filters Drawer Placeholder */}
            <div className="p-8 rounded-[3rem] bg-surface/50 border-2 border-dashed border-text/5 flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-text opacity-20 shadow-sm">
                        <Target size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-text uppercase tracking-tighter">Predictive Performance Audits</h4>
                        <p className="text-sm font-medium text-text opacity-30">Identify drivers needing intervention before performance degradation occurs.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-14 px-8 border-2 border-text text-text font-black uppercase tracking-widest rounded-[2rem] hover:bg-text hover:text-background transition-all text-xs">
                    Run AI Audit
                </Button>
            </div>
        </div>
    );
}

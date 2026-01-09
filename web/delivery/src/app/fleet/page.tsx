"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
    Truck, Users, Activity, TrendingUp,
    Map as MapIcon, Clock, CheckCircle2, AlertTriangle,
    Zap, Globe, ChevronRight, Search,
    Filter, Database
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });
import { mockDrivers, driversToLocations } from '@/lib/mockData';

export default function FleetDashboard() {
    const kpis = [
        { label: 'Active Fleet', value: '42', detail: '85% Utilization', icon: Truck, trend: '+4%' },
        { label: 'On-Time delivery', value: '98.2%', detail: 'Last 24h', icon: CheckCircle2, trend: '+0.5%' },
        { label: 'Avg Transit Time', value: '14m', detail: 'Within Target', icon: Clock, trend: '-2m' },
        { label: 'Ecosystem Revenue', value: '$12,450', detail: 'Daily Manifest', icon: Activity, trend: '+12%' }
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-text rounded-lg text-primary shadow-lg shadow-text/10">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-text uppercase tracking-tighter leading-none">Fleet Control</h1>
                            <p className="text-[10px] font-black uppercase text-text/40 tracking-[0.3em] mt-1">Universal Logistics Protocol • Cairo Cluster</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <h2 className="text-2xl font-black text-text/10 tracking-tighter uppercase leading-none">مراقبة الأسطول</h2>
                    <div className="flex gap-4">
                        <Link href="/fleet/dispatch">
                            <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-background rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 group">
                                Dispatch Console
                                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-8 border-2 border-surface bg-white hover:border-text transition-all group overflow-hidden relative">
                            <kpi.icon className="absolute -right-4 -bottom-4 text-text opacity-5 group-hover:scale-110 transition-transform duration-700" size={100} />
                            <div className="relative">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">{kpi.label}</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <h3 className="text-4xl font-black font-mono tracking-tighter text-text">{kpi.value}</h3>
                                    <span className="text-xs font-black text-emerald-500 mb-1">{kpi.trend}</span>
                                </div>
                                <p className="text-xs font-bold text-text opacity-30 uppercase">{kpi.detail}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Map with Driver Tracking */}
                <Card className="lg:col-span-2 p-10 border-2 border-text bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Live Fleet Tracking</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black uppercase text-emerald-700">Real-Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Map Component */}
                    <div className="mb-6">
                        <Map
                            locations={driversToLocations(mockDrivers)}
                            center={[30.0444, 31.2357]}
                            zoom={13}
                            height="450px"
                            className="rounded-2xl"
                        />
                    </div>

                    {/* Driver Legend */}
                    <div className="flex items-center justify-between border-t-2 border-surface pt-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                                <span className="text-xs font-bold uppercase">Active ({mockDrivers.filter(d => d.status === 'active').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs font-bold uppercase">Idle ({mockDrivers.filter(d => d.status === 'idle').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                                <span className="text-xs font-bold uppercase">Offline ({mockDrivers.filter(d => d.status === 'offline').length})</span>
                            </div>
                        </div>
                        <Button variant="outline" className="h-10 px-6 border-2 border-surface rounded-xl text-xs font-black uppercase">
                            <Filter size={14} className="mr-2" />
                            Filter
                        </Button>
                    </div>
                </Card>

                {/* Logistics Intelligence */}
                <div className="space-y-8">
                    <Card className="p-8 border-2 border-text bg-white">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-text opacity-30">Network Efficiency</h4>
                        <div className="space-y-8">
                            <div className="p-6 bg-text text-background rounded-3xl relative overflow-hidden group">
                                <Activity className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform" size={80} />
                                <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">Global Link Health</p>
                                <p className="text-4xl font-black font-mono tracking-tighter">99.8%</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 border-2 border-surface rounded-2xl">
                                    <p className="text-[8px] font-black uppercase text-text opacity-30 mb-1">Avg Lead Time</p>
                                    <p className="text-xl font-black font-mono">1.2m</p>
                                </div>
                                <div className="p-5 border-2 border-surface rounded-2xl">
                                    <p className="text-[8px] font-black uppercase text-text opacity-30 mb-1">Peak Idle</p>
                                    <p className="text-xl font-black font-mono">4</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-2 border-primary bg-primary/5 relative overflow-hidden group">
                        <Zap className="absolute -right-4 -bottom-4 text-primary opacity-5 group-hover:scale-110 transition-transform" size={120} />
                        <div className="relative">
                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-tight text-text">AI Dispatch<br />Optimization</h4>
                            <p className="text-xs font-medium text-text opacity-60 leading-relaxed mb-10">Automatically redistribute 12 idle drivers to Zamalek Sector 4 to capture upcoming demand surge.</p>
                            <Button className="w-full h-12 bg-text text-background font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary transition-all">
                                Execute Optimization
                            </Button>
                        </div>
                    </Card>

                    <div className="p-8 rounded-[2.5rem] bg-surface border-2 border-dashed border-text/10 flex items-start gap-4">
                        <Globe size={20} className="text-primary mt-1" />
                        <p className="text-[11px] text-text opacity-40 leading-relaxed font-bold uppercase tracking-wider italic">
                            "NileLink Fleet Protocol v4.2 enforces strict regional load-balancing and driver-first payout finality."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

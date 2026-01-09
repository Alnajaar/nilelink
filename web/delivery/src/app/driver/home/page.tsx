"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Package, Map, Zap, Clock, ChevronRight,
    Navigation, TrendingUp, Shell, Activity,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function DriverHome() {
    const stats = {
        earnings: 142.50,
        trips: 12,
        onlineTime: '4h 20m',
        efficiency: 98
    };

    return (
        <div className="space-y-8">
            {/* Mission Briefing Header */}
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 px-3 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        Top Rated Courier
                    </div>
                    <div className="p-1 px-3 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        سائق معتمد
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-text tracking-tighter uppercase leading-tight">Tactical Hub</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Protocol Session Sync: Active</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-text/20 tracking-tighter uppercase leading-tight">لوحة التحكم</h2>
                    </div>
                </div>
            </header>

            {/* Live Earnings Card */}
            <Card className="p-8 border-2 border-border-subtle bg-background-card relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <TrendingUp size={240} />
                </div>
                <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1 text-text-main">Current Session Earnings</p>
                            <h2 className="text-5xl font-black font-mono tracking-tighter text-text-main">${stats.earnings.toFixed(2)}</h2>
                        </div>
                        <div className="w-14 h-14 bg-background-subtle rounded-2xl flex items-center justify-center text-text-main shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-background-subtle rounded-[2rem] border border-transparent hover:border-text-main/10 transition-all">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1 text-text-main">Completed</p>
                            <p className="text-xl font-black font-mono leading-none text-text-main">{stats.trips} Missions</p>
                        </div>
                        <div className="flex-1 p-4 bg-primary text-background rounded-[2rem] shadow-xl shadow-primary/20">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Active Time</p>
                            <p className="text-xl font-black font-mono leading-none">{stats.onlineTime}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tactical Demand Map */}
            <div className="relative h-64 w-full rounded-[3rem] overflow-hidden bg-background-card border-2 border-border-subtle group">
                <Map
                    locations={[
                        { id: 'h-1', name: 'High Demand: Sector 4', latitude: 30.0500, longitude: 31.2400, type: 'active', color: '#ff4444' },
                        { id: 'h-2', name: 'Surge: Maadi Sector', latitude: 30.0330, longitude: 31.2336, type: 'active', color: '#ff8800' }
                    ]}
                    center={[30.0444, 31.2357]}
                    zoom={12}
                    height="256px"
                />

                <div className="absolute bottom-4 left-4 right-4 z-[400] p-4 backdrop-blur-md bg-white/80 rounded-2xl border border-white/20 shadow-xl pointer-events-none">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={14} className="text-primary fill-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Regional Demand Surge</span>
                            </div>
                            <h4 className="text-sm font-black text-text uppercase tracking-tight">Zamalek Sector 4 • 2.4x Multiplier</h4>
                        </div>
                        <Badge className="bg-primary text-background border-0 text-[8px] font-black uppercase animate-pulse">Live</Badge>
                    </div>
                </div>
            </div>

            {/* Action Center - Active Mission Pill */}
            <Link href="/driver/transit/M-1250">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-primary/5 rounded-[2.5rem] p-1 pr-8 flex items-center justify-between border-2 border-primary/20 group hover:border-primary transition-all cursor-pointer shadow-lg shadow-primary/5"
                >
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 bg-background-card rounded-[2.2rem] flex items-center justify-center text-text-main relative shadow-2xl overflow-hidden border border-border-subtle">
                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Navigation size={32} className="relative z-10 group-hover:scale-110 transition-transform group-hover:text-background" />
                            <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full border-4 border-background-card animate-pulse group-hover:bg-white group-hover:border-primary" />
                        </div>
                        <div>
                            <h3 className="text-text-main font-black text-xl uppercase tracking-tighter leading-tight">Priority Mission</h3>
                            <p className="text-text-muted text-xs font-bold font-mono tracking-tight">Grand Cairo Grill • 2.4km</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-primary font-mono leading-none">+$18.50</span>
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-widest underline decoration-2 underline-offset-4">Accepting</span>
                    </div>
                </motion.div>
            </Link>

            {/* Efficiency Manifest */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 text-text-main">Protocol Manifest</h3>
                    <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase">Secured by NileShield™</span>
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { time: '14:30', name: 'Zamalek Bakery', amt: '$12.50', status: 'COMPLETED', type: 'SALE' },
                        { time: '13:15', name: 'Maadi Bistro', amt: '$9.20', status: 'COMPLETED', type: 'DELIVERY' },
                    ].map((entry, i) => (
                        <Card key={i} className="p-6 border-2 border-border-subtle bg-background-card flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-xs font-mono font-black text-text-muted group-hover:text-text-main transition-colors">{entry.time}</div>
                                <div>
                                    <div className="font-black text-base text-text-main tracking-tighter uppercase leading-none mb-1">{entry.name}</div>
                                    <Badge className="bg-background-subtle text-text-muted font-black text-[8px] uppercase tracking-tighter border-0">
                                        {entry.type} • {entry.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-mono font-black text-lg text-text-main leading-none">{entry.amt}</span>
                            </div>
                        </Card>
                    ))}
                </div>
                <Link href="/driver/queue" className="block">
                    <Button variant="outline" className="w-full h-14 border-2 border-border-subtle text-text-main font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-background-subtle transition-all">
                        View Full Manifest
                        <ChevronRight size={14} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

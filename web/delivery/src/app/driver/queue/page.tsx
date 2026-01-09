"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MapPin, Clock, Zap, Timer, ChevronRight,
    Navigation, Filter, Shell, AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function MissionQueue() {
    const router = useRouter();
    const [filter, setFilter] = useState('All');

    const missions = [
        {
            id: 'M-1250',
            restaurant: 'Pizza Palace',
            pickup: 'Zamalek, Plot 42',
            dropoff: 'Downtown, Nile View',
            distance: '2.4km',
            payout: 25.50,
            urgency: 'ASAP',
            difficulty: 'Low',
            items: 4,
            category: 'Standard'
        },
        {
            id: 'M-1251',
            restaurant: 'Burger Joint',
            pickup: 'Giza Square',
            dropoff: 'Mohandessin Res',
            distance: '5.8km',
            payout: 42.00,
            urgency: '15m',
            difficulty: 'High',
            items: 12,
            category: 'Bulk'
        },
        {
            id: 'M-1252',
            restaurant: 'Sushi Express',
            pickup: 'Maadi Ring Road',
            dropoff: 'New Cairo Sector 1',
            distance: '12.2km',
            payout: 65.20,
            urgency: '25m',
            difficulty: 'Epic',
            items: 2,
            category: 'Express'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black text-text tracking-tighter uppercase leading-tight">Mission Queue</h1>
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Active Protocol Feed</p>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">{missions.length} Available</Badge>
                </div>
            </header>

            {/* Filter Hub */}
            <div className="flex gap-2 p-1 bg-surface rounded-[2rem] border border-text/5">
                {['All', 'High Payout', 'Nearby', 'Express'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] transition-all ${filter === f ? 'bg-text text-background shadow-lg' : 'text-text opacity-30 hover:opacity-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Missions List */}
            <div className="space-y-6">
                <AnimatePresence>
                    {missions.map((m, i) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-0 border-2 border-surface bg-white hover:border-text transition-all group overflow-hidden">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-text rounded-2xl flex items-center justify-center text-background shadow-lg group-hover:bg-primary transition-colors">
                                                <Zap size={24} className={m.urgency === 'ASAP' ? 'animate-pulse' : ''} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-2xl font-black text-text tracking-tighter uppercase leading-none">{m.restaurant}</h3>
                                                    <Badge className="bg-surface text-text/40 text-[8px] font-black uppercase border-0">{m.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-30">
                                                    <div className="flex items-center gap-1"><Timer size={12} /> {m.urgency}</div>
                                                    <div className="flex items-center gap-1"><MapPin size={12} /> {m.distance}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black font-mono tracking-tighter text-primary">${m.payout.toFixed(2)}</div>
                                            <div className="text-[8px] font-black uppercase text-text opacity-20 tracking-widest">Base Payout</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-surface rounded-2xl border border-transparent">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">Pickup</p>
                                            <p className="text-[11px] font-bold text-text truncate">{m.pickup}</p>
                                        </div>
                                        <div className="p-4 bg-surface rounded-2xl border border-transparent">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">Dropoff</p>
                                            <p className="text-[11px] font-bold text-text truncate">{m.dropoff}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase text-text opacity-20 tracking-widest">Difficulty</span>
                                                <span className={`text-[10px] font-black uppercase ${m.difficulty === 'Epic' ? 'text-amber-500' :
                                                        m.difficulty === 'High' ? 'text-rose-500' : 'text-emerald-500'
                                                    }`}>{m.difficulty}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase text-text opacity-20 tracking-widest">Cargo Size</span>
                                                <span className="text-[10px] font-black uppercase text-text">{m.items} Items</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="w-12 h-12 border-2 border-surface text-text/20 hover:border-rose-500 hover:text-rose-500 rounded-2xl transition-all p-0">
                                                <Shell size={18} />
                                            </Button>
                                            <Button
                                                onClick={() => router.push(`/driver/transit/${m.id}`)}
                                                className="h-12 px-8 bg-text text-background font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-text/10"
                                            >
                                                Accept Mission
                                                <ChevronRight size={14} className="ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-surface">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                        className="h-full bg-primary/20"
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Offline Shield Indicator */}
            <div className="p-8 rounded-[3rem] bg-text/5 border-2 border-dashed border-text/10 flex flex-col items-center justify-center text-center gap-4">
                <AlertCircle size={32} className="text-text opacity-20" />
                <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter opacity-40">Scanning for Missions...</h4>
                    <p className="text-[10px] font-bold text-text opacity-20 uppercase tracking-widest mt-1">NileLink Protocol Synchronization v4.2</p>
                </div>
            </div>
        </div>
    );
}

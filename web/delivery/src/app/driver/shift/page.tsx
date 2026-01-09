"use client";

import React, { useState } from 'react';
import {
    User, Star, Shield, Award, Settings,
    LogOut, ChevronRight, Activity, Clock,
    Camera, Map, Power, BellRing, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function DriverShift() {
    const [isOnline, setIsOnline] = useState(true);

    const profile = {
        name: 'Ahmed Nile',
        rating: 4.98,
        level: 'Protocol Elite',
        joinDate: 'Oct 2025',
        missions: 1242,
        onTimeRate: '99.2%'
    };

    return (
        <div className="space-y-8">
            {/* Profile Header / Protocol Card */}
            <header className="flex flex-col items-center text-center gap-6">
                <div className="relative pt-12 pb-8 px-10 bg-text rounded-[3.5rem] text-background w-full max-w-sm shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -ml-16 -mb-16" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-[2rem] bg-background p-1 shadow-2xl overflow-hidden border-4 border-primary/20">
                                <div className="w-full h-full bg-surface rounded-[1.8rem] flex items-center justify-center text-text opacity-20">
                                    <User size={48} />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-background rounded-2xl flex items-center justify-center border-4 border-text shadow-xl hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>

                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">{profile.name}</h1>
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-primary text-background font-black text-[8px] uppercase tracking-tighter border-0 h-5">Verified Driver</Badge>
                                <Badge className="bg-white/10 text-white font-black text-[8px] uppercase tracking-tighter border-0 h-5">سائق موثق</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                                <Star size={12} fill="currentColor" /> {profile.rating} Rating
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/10 mb-6" />

                        <div className="grid grid-cols-2 gap-8 w-full">
                            <div className="text-left">
                                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary' : 'bg-rose-500'} animate-pulse`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Tier</p>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{profile.level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Protocol Node ID: NL-DRV-88219</p>
            </header>

            {/* Tactical Shift Toggle */}
            <Card className={`p-8 border-2 transition-all ${isOnline ? 'border-primary bg-primary/5' : 'border-surface bg-background'
                }`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Shift Status</h3>
                        <p className="text-[10px] font-bold text-text opacity-40 uppercase tracking-widest">Toggle protocol presence</p>
                    </div>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`w-16 h-8 rounded-full relative transition-colors duration-500 ${isOnline ? 'bg-primary' : 'bg-text/10'
                            }`}
                    >
                        <motion.div
                            animate={{ x: isOnline ? 32 : 4 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                            <Power size={12} className={isOnline ? 'text-primary' : 'text-text/20'} />
                        </motion.div>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-text/5">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">Total Missions</p>
                        <p className="text-xl font-black font-mono leading-none">{profile.missions}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-text/5">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">On-Time Rate</p>
                        <p className="text-xl font-black font-mono leading-none text-emerald-600">{profile.onTimeRate}</p>
                    </div>
                </div>
            </Card>

            {/* Skill & Performance Badges */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 px-2">Performance Badges</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                    {[
                        { icon: Award, label: 'Speedster', color: 'bg-emerald-500' },
                        { icon: Shield, label: 'Secured', color: 'bg-indigo-500' },
                        { icon: Activity, label: 'Efficiency', color: 'bg-primary' },
                        { icon: Map, label: 'Explorer', color: 'bg-amber-500' }
                    ].map((badge, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                            <div className={`w-20 h-20 rounded-3xl ${badge.color} flex items-center justify-center text-background shadow-xl hover:scale-105 transition-transform cursor-pointer`}>
                                <badge.icon size={32} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text opacity-40">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-3 pt-4">
                {[
                    { icon: BellRing, label: 'Notification Settings', detail: 'On' },
                    { icon: Shield, label: 'Privacy & Permissions', detail: 'Managed' },
                    { icon: Smartphone, label: 'Device Telemetry', detail: 'Optimal' },
                    { icon: Settings, label: 'Global Preferences', detail: '' }
                ].map((action, i) => (
                    <button key={i} className="w-full p-6 bg-white border-2 border-surface rounded-[2rem] flex items-center justify-between hover:border-text transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-text opacity-20 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <action.icon size={18} />
                            </div>
                            <span className="font-black text-sm uppercase tracking-tighter text-text">{action.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-text opacity-20 tracking-widest">{action.detail}</span>
                            <ChevronRight size={16} className="text-text opacity-10 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Logout Button */}
            <div className="pt-8">
                <Button variant="outline" className="w-full h-16 border-2 border-rose-500/20 text-rose-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                    <LogOut size={18} className="mr-2" />
                    Terminate Session
                </Button>
                <p className="text-center text-[8px] font-black uppercase tracking-[0.4em] opacity-10 mt-6">Protocol Ver v4.2.0 • Local Hash 0x8f2...ae1b</p>
            </div>
        </div>
    );
}

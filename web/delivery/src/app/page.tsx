"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Zap, Truck, ShieldCheck,
    Navigation, Activity, Globe,
    ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function DeliveryGateway() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20 flex flex-col items-center justify-center p-6 mesh-bg overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[160px]" />
            </div>

            {/* Content Hub */}
            <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
                <header className="space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-text rounded-[2.5rem] flex items-center justify-center text-primary mx-auto shadow-2xl relative overflow-hidden group"
                    >
                        <Zap size={48} fill="currentColor" />
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-none italic">
                            NileLink<br />Fleet Protocol
                        </h1>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text/30">Next-Generation Logistics Infrastructure</p>
                            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-primary/40">نظام توصيل NileLink</p>
                        </div>
                    </div>
                </header>

                {/* Business Owner Intro Section */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
                    <Badge className="bg-primary/5 text-primary border-primary/10 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">
                        Logistics Infrastructure
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-black text-text leading-tight">
                        Real-Time Delivery Management & Fleet Coordination
                    </h2>
                    <p className="text-base md:text-lg text-text/60 font-medium leading-relaxed max-w-2xl mx-auto">
                        Connect drivers, optimize routes, and manage deliveries in real-time.<br />
                        <span className="text-text/30 italic">قم بربط السائقين وتحسين المسارات وإدارة عمليات التسليم في الوقت الفعلي.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Driver Portal */}
                    <Link href="/driver/login">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="p-10 bg-white border-2 border-text rounded-[4rem] text-left group hover:bg-text hover:text-background transition-all shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)] h-full flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center text-text mb-8 group-hover:bg-primary group-hover:text-background transition-colors">
                                    <Truck size={32} />
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors">Courier Command</h3>
                                <p className="text-sm font-medium opacity-40 leading-relaxed mb-12">Access your tactical missions, real-time demand charts, and instant protocol payouts.</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                <span>Initialize Mission</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Fleet Terminal */}
                    <Link href="/fleet">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="p-10 bg-white border-2 border-text rounded-[4rem] text-left group hover:bg-text hover:text-background transition-all shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)] h-full flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center text-text mb-8 group-hover:bg-primary group-hover:text-background transition-colors">
                                    <Globe size={32} />
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors">Fleet Oversight</h3>
                                <p className="text-sm font-medium opacity-40 leading-relaxed mb-12">Global terminal for regional load-balancing, driver intelligence, and dispatch optimization.</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                <span>Access Terminal</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Network Status Footer */}
                <div className="pt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8 opacity-20">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Link</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ecosystem Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Node v4.2S</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

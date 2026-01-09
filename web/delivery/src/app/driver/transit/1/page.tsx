"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin, Navigation, Phone, MessageSquare,
    AlertTriangle, CheckCircle2, ChevronRight,
    ArrowLeft, Box, X, Clock, Zap, CornerUpRight,
    Activity, ShieldCheck, Timer
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';

export default function DeliveryTransitPage() {
    const router = useRouter();
    const [step, setStep] = useState<'pickup' | 'transit' | 'handover'>('pickup');
    const [telemetry, setTelemetry] = useState({ speed: 0, battery: 98, latency: 12 });

    // Simulate telemetry
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(t => ({
                speed: Math.floor(Math.random() * 5) + 35,
                battery: t.battery > 0 ? t.battery - 0.01 : 100,
                latency: Math.floor(Math.random() * 5) + 8
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = () => {
        if (step === 'pickup') setStep('transit');
        else if (step === 'transit') setStep('handover');
        else router.push('/driver/home');
    };

    return (
        <div className="fixed inset-0 bg-text flex flex-col overflow-hidden antialiased">
            {/* Tactical Map Layer (Simulated) */}
            <div className="absolute inset-0 z-0 opacity-40 grayscale">
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

                {/* Route Vector */}
                <svg className="absolute inset-0 w-full h-full stroke-primary/30 stroke-[2] fill-none">
                    <path d="M100,800 L300,500 L800,200" className="animate-[pulse_4s_infinite]" />
                </svg>

                {/* Active Segment */}
                <svg className="absolute inset-0 w-full h-full stroke-primary stroke-[4] fill-none">
                    <path d="M100,800 L200,650" className="animate-[pulse_2s_infinite]" />
                </svg>
            </div>

            {/* Top HUD - Navigation Briefing */}
            <div className="relative z-10 p-6 pt-12 flex justify-between items-start">
                <button
                    onClick={() => router.back()}
                    className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-text shadow-2xl hover:bg-primary hover:text-white transition-all"
                >
                    <ArrowLeft size={24} />
                </button>

                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex-1 max-w-xs ml-4"
                >
                    <div className="bg-white p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-primary text-background rounded-2xl flex items-center justify-center shrink-0">
                                <CornerUpRight size={32} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-text tracking-tighter leading-none mb-1">450m</div>
                                <p className="text-[10px] font-black uppercase text-text/40 tracking-widest leading-tight">Turn Right onto Nile Road</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Side HUD - Telemetry Rail */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 space-y-4">
                {[
                    { icon: Activity, value: `${telemetry.speed}km/h`, label: 'Velocity' },
                    { icon: Timer, value: `${telemetry.latency}ms`, label: 'Link' },
                    { icon: Zap, value: `${Math.floor(telemetry.battery)}%`, label: 'Power' }
                ].map((t, i) => (
                    <div key={i} className="w-14 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col items-center justify-center text-background">
                        <t.icon size={18} className="mb-2 opacity-40" />
                        <span className="text-[11px] font-black font-mono">{t.value}</span>
                        <span className="text-[6px] font-black uppercase tracking-widest opacity-20">{t.label}</span>
                    </div>
                ))}
            </div>

            {/* Bottom Command Sheet */}
            <motion.div
                layout
                className="mt-auto relative z-20 bg-white rounded-t-[3.5rem] p-8 pb-12 shadow-[0_-20px_80px_rgba(0,0,0,0.4)]"
            >
                <div className="w-12 h-1.5 bg-surface rounded-full mx-auto mb-10" />

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/10 text-primary border-0 font-black text-[8px] uppercase tracking-widest">
                                {step === 'pickup' ? 'Incoming Pickup' : step === 'transit' ? 'In Transit' : 'Arrival Point'}
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter leading-none mb-3">
                            {step === 'pickup' ? 'Cairo Grill House' : 'Sector 4 Apt. 12B'}
                        </h2>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text opacity-30">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> 4m Remaining</span>
                            <span className="flex items-center gap-1.5"><MapPin size={12} /> 1.2km Distance</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-text hover:bg-primary hover:text-white transition-all shadow-sm">
                            <MessageSquare size={20} />
                        </button>
                        <button className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Phone size={20} />
                        </button>
                    </div>
                </div>

                {/* Cargo manifest snippet */}
                <div className="bg-surface rounded-3xl p-6 mb-8 flex items-center justify-between border border-transparent hover:border-text/5 transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-text shadow-sm font-black text-lg">
                            4x
                        </div>
                        <div>
                            <p className="font-black text-text text-sm uppercase tracking-tight">Ecosystem Cargo Manifest</p>
                            <p className="text-[10px] font-bold text-text opacity-30 uppercase tracking-widest">Secured & Verified Batch</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase text-text opacity-20 tracking-widest mb-1">Base Reward</p>
                        <p className="text-xl font-black font-mono text-primary">$18.50</p>
                    </div>
                </div>

                <Button
                    onClick={handleAction}
                    className="w-full h-20 bg-text text-background font-black text-lg uppercase tracking-widest rounded-3xl hover:bg-primary transition-all shadow-2xl shadow-text/20 group"
                >
                    {step === 'pickup' ? 'Initialize Pickup' : step === 'transit' ? 'Confirm Delivery Arrival' : 'Secure Handover & Close'}
                    <ChevronRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Sync Encrypted</span>
                </div>
            </motion.div>
        </div>
    );
}

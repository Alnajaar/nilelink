"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin, Navigation, Phone, MessageSquare,
    AlertTriangle, CheckCircle2, ChevronRight,
    ArrowLeft, Box, X, Clock, Zap, CornerUpRight,
    Activity, ShieldCheck, Timer
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function DeliveryTransitPage() {
    const router = useRouter();
    const params = useParams();
    const missionId = params?.id || 'M-PENDING';
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
            {/* Tactical Map Layer */}
            <div className="absolute inset-0 z-0 opacity-60">
                <Map
                    locations={[
                        { id: 'p', name: 'Pickup: Cairo Grill House', latitude: 30.0444, longitude: 31.2357, type: 'active', color: '#10b981' },
                        { id: 'd', name: 'Dropoff: Sector 4', latitude: 30.0500, longitude: 31.2400, type: 'in_transit', color: '#3b82f6' }
                    ]}
                    center={[30.0470, 31.2380]}
                    zoom={15}
                    height="100%"
                    showRoutes={true}
                    routes={[[[30.0444, 31.2357], [30.0470, 31.2380], [30.0500, 31.2400]]]}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-text/40 via-transparent to-text/40 pointer-events-none" />
            </div>

            {/* Top HUD - Navigation Briefing */}
            <div className="relative z-[401] p-6 pt-12 flex justify-between items-start">
                <button
                    onClick={() => router.back()}
                    className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-text shadow-2xl hover:bg-primary hover:text-white transition-all border border-white/20"
                >
                    <ArrowLeft size={24} />
                </button>

                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex-1 max-w-xs ml-4"
                >
                    <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-1 bg-primary/20" />
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-primary text-background rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
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
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[401] space-y-4">
                {[
                    { icon: Activity, value: `${telemetry.speed}km/h`, label: 'Velocity' },
                    { icon: Timer, value: `${telemetry.latency}ms`, label: 'Link' },
                    { icon: Zap, value: `${Math.floor(telemetry.battery)}%`, label: 'Power' },
                    { icon: ShieldCheck, value: 'ENC', label: 'Protocol' }
                ].map((t, i) => (
                    <div key={i} className="w-14 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center justify-center text-white shadow-2xl">
                        <t.icon size={18} className="mb-2 opacity-60" />
                        <span className="text-[11px] font-black font-mono">{t.value}</span>
                        <span className="text-[6px] font-black uppercase tracking-widest opacity-40">{t.label}</span>
                    </div>
                ))}
            </div>

            {/* Bottom Command Sheet */}
            <motion.div
                layout
                className="mt-auto relative z-[401] bg-white rounded-t-[3.5rem] p-8 pb-12 shadow-[0_-20px_80px_rgba(0,0,0,0.4)] border-t border-white/20"
            >
                <div className="w-12 h-1.5 bg-surface rounded-full mx-auto mb-10" />

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/10 text-primary border-0 font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                {step === 'pickup' ? 'Incoming Pickup' : step === 'transit' ? 'In Transit' : 'Arrival Point'}
                            </Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[8px] uppercase tracking-widest px-3 py-1">
                                {step === 'pickup' ? 'استلام الطلب' : step === 'transit' ? 'في الطريق' : 'نقطة الوصول'}
                            </Badge>
                        </div>
                        <h2 className="text-2xl font-black text-text uppercase tracking-tighter leading-none mb-3">
                            {step === 'pickup' ? 'Cairo Grill House' : `Sector 4 Apt. 12B (${missionId})`}
                        </h2>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text opacity-30">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> 4m Remaining</span>
                            <span className="flex items-center gap-1.5"><MapPin size={12} /> 1.2km Distance</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-text hover:bg-primary hover:text-white transition-all shadow-sm border border-transparent hover:border-white/20 group">
                            <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-transparent hover:border-white/20 group">
                            <Phone size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Cargo manifest snippet */}
                <div className="bg-surface/50 rounded-3xl p-6 mb-8 flex items-center justify-between border border-white/10 group hover:bg-surface transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-text shadow-sm font-black text-lg group-hover:bg-primary group-hover:text-background transition-colors">
                            4x
                        </div>
                        <div>
                            <p className="font-black text-text text-sm uppercase tracking-tight">Ecosystem Cargo Manifest</p>
                            <p className="text-[10px] font-bold text-text opacity-30 uppercase tracking-widest">بيان حمولة النظام</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase text-text opacity-20 tracking-widest mb-1">Base Reward</p>
                        <p className="text-xl font-black font-mono text-primary">$18.50</p>
                    </div>
                </div>

                <Button
                    onClick={handleAction}
                    className="w-full h-16 bg-text text-background font-black text-base uppercase tracking-widest rounded-3xl hover:bg-primary transition-all shadow-2xl shadow-text/20 group relative overflow-hidden"
                >
                    <span className="relative z-10">
                        {step === 'pickup' ? 'Initialize Pickup' : step === 'transit' ? 'Confirm Delivery Arrival' : 'Secure Handover & Close'}
                    </span>
                    <ChevronRight size={20} className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="mt-8 flex items-center justify-center gap-3 opacity-20">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Sync Encrypted • نظام م NileLink</span>
                </div>
            </motion.div>
        </div>
    );
}

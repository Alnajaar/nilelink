"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap, Fingerprint, Lock, Shield,
    Smartphone, ChevronRight, Globe,
    Activity, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function DriverLogin() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<'Phone' | 'Biometric'>('Phone');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/driver/home');
        }, 1500);
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center gap-12 pt-10">
            {/* Branding Section */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-text rounded-[2.5rem] flex items-center justify-center text-primary mx-auto shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-20 transition-opacity" />
                    <Zap size={48} fill="currentColor" className="relative z-10" />
                </motion.div>
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tighter uppercase leading-none">NileLink<br />Fleet</h1>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[8px] px-3 py-1 mt-3 tracking-[0.2em] uppercase">Auth Node v2.1</Badge>
                </div>
            </div>

            {/* Login Interface */}
            <Card className="p-8 border-2 border-text bg-white shadow-[16px_16px_0px_0px_rgba(15,23,42,0.05)] overflow-hidden">
                <div className="flex p-1 bg-surface rounded-2xl mb-10">
                    {['Phone', 'Biometric'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setAuthMethod(m as any)}
                            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${authMethod === m ? 'bg-text text-background shadow-lg' : 'text-text opacity-30 hover:opacity-50'
                                }`}
                        >
                            {m === 'Phone' ? <Smartphone size={14} className="inline mr-2" /> : <Fingerprint size={14} className="inline mr-2" />}
                            {m} Access
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {authMethod === 'Phone' ? (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-text opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Protocol ID / Mobile</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text opacity-30 font-black text-xs">+20</div>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full h-16 pl-16 pr-6 bg-surface border-2 border-transparent focus:border-text focus:bg-white rounded-2xl font-black text-lg transition-all outline-none"
                                        placeholder="123 456 7890"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text opacity-30 uppercase tracking-[0.3em] mb-3 ml-1">Access Passcode</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text opacity-30" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full h-16 pl-16 pr-6 bg-surface border-2 border-transparent focus:border-text focus:bg-white rounded-2xl font-black text-lg tracking-widest transition-all outline-none"
                                        placeholder="••••"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto relative group cursor-pointer hover:bg-primary/20 transition-all">
                                <Fingerprint size={48} className="text-primary animate-pulse" />
                                <div className="absolute inset-0 border-4 border-primary rounded-[2.5rem] animate-ping opacity-10" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-text uppercase tracking-tighter">Ready for Biometric Sync</p>
                                <p className="text-[10px] font-bold text-text opacity-30 uppercase tracking-widest mt-1">Place finger on device sensor</p>
                            </div>
                        </motion.div>
                    )}

                    <Button
                        className="w-full h-20 bg-text text-background font-black uppercase tracking-widest text-sm rounded-3xl hover:bg-primary transition-all shadow-2xl shadow-text/10"
                        isLoading={isLoading}
                    >
                        Initialize Mission
                        <ChevronRight className="ml-2" size={20} />
                    </Button>
                </form>
            </Card>

            {/* Security Indicators */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[9px] font-black uppercase text-text opacity-30 tracking-widest">NileShield™ Verified</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-text opacity-10" />
                    <span className="text-[9px] font-black uppercase text-text opacity-30 tracking-widest">Region: MEA-NORTH-1</span>
                </div>
            </div>
        </div>
    );
}

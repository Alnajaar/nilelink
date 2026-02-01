"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Key, Camera } from 'lucide-react';
import { eventBus } from '@/lib/core/EventBus';
import { POSButton } from '../POSButton';

export function TheftAlertOverlay() {
    const [isActive, setIsActive] = useState(false);
    const [alertData, setAlertData] = useState<any>(null);
    const [pin, setPin] = useState('');

    useEffect(() => {
        const unsubscribe = eventBus.subscribe('SECURITY_ALERT', (event) => {
            setAlertData(event.payload);
            setIsActive(true);
        });
        return unsubscribe;
    }, []);

    const handleOverride = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock manager PIN check
        if (pin === '9999') {
            setIsActive(false);
            setPin('');
            eventBus.publish({
                type: 'SECURITY_OVERRIDE_SUCCESS',
                source: 'THEFT_OVERLAY',
                payload: { managerId: 'ADMIN_01' }
            });
        } else {
            // Shake effect or feedback
            setPin('');
        }
    };

    if (!isActive) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-red-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 overflow-hidden"
            >
                {/* Pulsing Red Glow */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-red-600/20"
                />

                <div className="relative z-10 max-w-2xl w-full text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/40 border border-red-500/50 rounded-3xl p-12 shadow-[0_0_50px_rgba(255,0,0,0.3)]"
                    >
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                                <Shield size={48} className="text-white" />
                            </div>
                        </div>

                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Station Locked</h1>
                        <p className="text-red-400 font-bold uppercase tracking-widest text-sm mb-8">
                            {alertData?.reason || 'SECURITY PROTOCOL ENGAGED // FRAUD POSITIVE'}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                                <div className="flex items-center gap-2 mb-2 text-white/50">
                                    <Camera size={14} />
                                    <span className="text-[10px] font-black uppercase">Sensor Snapshot</span>
                                </div>
                                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                    <span className="text-[10px] text-white/20 font-mono">EYE-LINK ACTIVE</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                                <div className="flex items-center gap-2 mb-2 text-white/50">
                                    <AlertTriangle size={14} />
                                    <span className="text-[10px] font-black uppercase">Risk Metrics</span>
                                </div>
                                <ul className="text-[10px] space-y-2 font-mono text-red-300">
                                    <li>- Rapid scan pattern detected</li>
                                    <li>- Item weight mismatch</li>
                                    <li>- High-risk zone activity</li>
                                </ul>
                            </div>
                        </div>

                        <form onSubmit={handleOverride} className="space-y-6">
                            <div className="relative">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="password"
                                    placeholder="MANAGER AUTHORIZATION PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full h-16 pl-16 pr-8 bg-black border-2 border-red-900/50 rounded-2xl focus:outline-none focus:border-red-500 text-white text-center text-2xl font-black tracking-[1em] placeholder:text-[10px] placeholder:tracking-widest"
                                    autoFocus
                                />
                            </div>
                            <POSButton variant="destructive" size="lg" fullWidth type="submit">
                                <Lock size={20} className="mr-4" />
                                DE-ESCALATE & UNLOCK
                            </POSButton>
                        </form>
                    </motion.div>
                </div>

                <div className="mt-12 text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">
                    NILELINK SECURITY PROTOCOL // NODE-7 // {new Date().toLocaleTimeString()}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

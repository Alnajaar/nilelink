"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ShieldCheck, BarChart3, Loader2 } from 'lucide-react';
import { Card } from '@shared/components/Card';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const NeuralMesh = dynamic(() => import('@shared/components/NeuralMesh').then(mod => mod.NeuralMesh), {
    ssr: false
});

export default function RootPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Initializing Protocol...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const steps = [
            'Connecting to consensus layer...',
            'Syncing economic indicators...',
            'Authenticating encrypted tunnel...',
            'Entering Dashboard...'
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setStatus(steps[currentStep]);
                setProgress((currentStep + 1) * 25);
                currentStep++;
            } else {
                clearInterval(interval);
                router.push('/dashboard');
            }
        }, 1200);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen bg-neutral text-text-primary flex flex-col items-center justify-center p-6 select-none overflow-hidden mesh-bg">
            <NeuralMesh />
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full relative z-10"
            >
                <Card className="p-10 flex flex-col items-center glass-v2 border-white/5 shadow-2xl rounded-[3rem] relative z-20 overflow-hidden">
                    <div className="h-24 w-24 flex items-center justify-center overflow-hidden rounded-[2rem] mb-8 shadow-2xl relative">
                        <img src="/shared/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                        <div className="absolute -inset-2 border-2 border-primary/20 rounded-[2rem] animate-pulse" />
                    </div>

                    <h1 className="text-4xl font-black text-text uppercase tracking-tighter mb-2 text-center">NileLink</h1>
                    <p className="text-text/40 font-black uppercase text-[10px] tracking-[0.3em] mb-10">Wealth OS Terminal</p>

                    <div className="w-full space-y-6">
                        <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase text-text/60 px-1">
                            <span>Status: {status}</span>
                            <span>{progress}%</span>
                        </div>

                        <div className="h-3 w-full bg-surface rounded-full overflow-hidden border-2 border-text p-0.5">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-3 bg-surface/50 rounded-xl flex items-center gap-3">
                                <ShieldCheck size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase">Secured</span>
                            </div>
                            <div className="p-3 bg-surface/50 rounded-xl flex items-center gap-3">
                                <BarChart3 size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase">Live Data</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <p className="mt-12 text-center text-primary/40 text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
                    Consensus Layer Active • Secured via NileShield™
                </p>
            </motion.div>
        </div>
    );
}

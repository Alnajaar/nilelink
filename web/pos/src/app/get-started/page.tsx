"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap, Store, Smartphone, CheckCircle2,
    ArrowRight, ArrowLeft, Shield, Globe,
    Cpu, Laptop, Printer, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function GetStartedPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const steps = [
        {
            title: 'Protocol Activation',
            tagline: 'System Initialization',
            description: 'The NileLink Protocol is ready to anchor your business. Let\'s initialize your terminal node.',
            content: (
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-primary/5"
                    >
                        <Zap size={40} className="text-primary" />
                    </motion.div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Quantum Leap</h2>
                        <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 leading-relaxed max-w-[280px] mx-auto">
                            Deploy high-frequency sales processing and real-time ledger synchronization.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'Domain Definition',
            tagline: 'Identity Mapping',
            description: 'Define your merchant identity within the NileLink cluster.',
            content: (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">Merchant Name</label>
                        <input
                            type="text"
                            className="w-full h-16 px-6 bg-neutral rounded-2xl border-0 focus:ring-2 focus:ring-primary/20 text-sm font-black uppercase tracking-widest transition-all"
                            placeholder="Enter your business name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">Economic Sector</label>
                        <select className="w-full h-16 px-6 bg-neutral rounded-2xl border-0 focus:ring-2 focus:ring-primary/20 text-sm font-black uppercase tracking-widest transition-all appearance-none cursor-pointer">
                            <option>Gastronomy / Restaurant</option>
                            <option>Hyper-Retail</option>
                            <option>Luxury Cafe</option>
                            <option>Social Bar</option>
                            <option>Institutional Hub</option>
                        </select>
                    </div>
                </div>
            )
        },
        {
            title: 'Bridge Calibration',
            tagline: 'Hardware Sync',
            description: 'Synchronize your physical peripheral nodes.',
            content: (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Printer size={22} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-1">Thermal Nodes</h3>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">3 peripherals discovered</p>
                            </div>
                        </div>
                        <Badge className="bg-success/10 text-success border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">Synced</Badge>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral rounded-xl flex items-center justify-center text-text-secondary opacity-40 group-hover:scale-110 transition-transform">
                                <Terminal size={22} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-1">Terminal Link</h3>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40">Internal card bridge</p>
                            </div>
                        </div>
                        <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">Ready</Badge>
                    </div>
                </div>
            )
        },
        {
            title: 'Final Synchronization',
            tagline: 'Launch Sequence',
            description: 'Your terminal is authorized and ready for live operations.',
            content: (
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-success/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-success/5"
                    >
                        <CheckCircle2 size={40} className="text-success" />
                    </motion.div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Authorized</h2>
                        <p className="text-text-secondary text-xs font-black uppercase tracking-widest opacity-60 leading-relaxed max-w-[280px] mx-auto">
                            System integrity verified. Protocol anchoring sequence complete.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/terminal');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-8 relative selection:bg-primary/20 overflow-hidden text-text-primary">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-4"
                    >
                        <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">NILELINK NODE INITIALIZATION</Badge>
                    </motion.div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 border border-border-subtle shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24" />

                    {/* Progress Matrix */}
                    <div className="flex gap-3 mb-12">
                        {steps.map((_, index) => (
                            <div key={index} className="flex-1 h-1.5 rounded-full bg-neutral overflow-hidden">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        width: index < currentStep ? '100%' : index === currentStep ? '100%' : '0%',
                                        backgroundColor: index <= currentStep ? 'var(--primary)' : 'transparent'
                                    }}
                                    className="h-full"
                                />
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[350px] flex flex-col"
                        >
                            <div className="mb-10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3 block">{currentStepData.tagline}</span>
                                <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-4 leading-none">{currentStepData.title}</h1>
                                <p className="text-[11px] font-medium text-text-secondary opacity-60 leading-relaxed uppercase tracking-wider">{currentStepData.description}</p>
                            </div>

                            <div className="flex-1">
                                {currentStepData.content}
                            </div>

                            <div className="flex gap-4 pt-10 mt-auto border-t border-border-subtle/50">
                                <Button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="flex-1 h-16 rounded-2xl bg-neutral text-text-primary hover:bg-neutral-dark font-black tracking-[0.3em] uppercase text-[9px] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ArrowLeft size={16} className="mr-3" /> PREVIOUS
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="flex-[2] h-16 rounded-2xl bg-primary text-background hover:scale-[1.02] active:scale-[0.98] font-black tracking-[0.3em] uppercase text-[9px] shadow-2xl shadow-primary/20 transition-all"
                                >
                                    {currentStep === steps.length - 1 ? 'LAUNCH TERMINAL' : 'CONTINUE SEQUENCE'}
                                    <ArrowRight size={16} className="ml-3" />
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <p className="text-center mt-10 text-[9px] font-black text-text-secondary uppercase tracking-[0.4em] opacity-40">
                    Secure Node Auth: 0x72...K90
                </p>
            </div>

            <style jsx global>{`
                :root {
                    --primary: #000000;
                }
                body {
                    background: #F8F8F8;
                }
            `}</style>
        </div>
    );
}
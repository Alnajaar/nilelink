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
                <div className="text-center space-y-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-glow-primary/20 border-2 border-primary/20"
                    >
                        <Zap size={48} className="text-primary animate-pulse" />
                    </motion.div>
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic lg:text-5xl">Quantum Leap</h2>
                        <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.3em] opacity-60 leading-relaxed max-w-[320px] mx-auto italic">
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
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-text-tertiary uppercase tracking-[0.4em] opacity-40 italic">Merchant Name</label>
                        <input
                            type="text"
                            className="w-full h-18 px-8 bg-background-tertiary/40 rounded-[1.5rem] border-2 border-border-default/50 focus:border-primary/50 focus:shadow-glow-primary/20 text-xs font-black uppercase tracking-widest transition-all outline-none placeholder:text-text-tertiary/20 italic"
                            placeholder="Register Entity Name..."
                        />
                    </div>
                    <div className="space-y-3 relative group">
                        <label className="block text-[11px] font-black text-text-tertiary uppercase tracking-[0.4em] opacity-40 italic">Economic Sector</label>
                        <div className="relative">
                            <select className="w-full h-18 px-8 bg-background-tertiary/40 rounded-[1.5rem] border-2 border-border-default/50 focus:border-primary/50 focus:shadow-glow-primary/20 text-xs font-black uppercase tracking-widest transition-all appearance-none cursor-pointer outline-none italic pr-12">
                                <option>Gastronomy / Restaurant</option>
                                <option>Hyper-Retail</option>
                                <option>Luxury Cafe</option>
                                <option>Social Bar</option>
                                <option>Institutional Hub</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary/40 group-hover:text-primary transition-colors">
                                <ArrowRight size={18} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Bridge Calibration',
            tagline: 'Hardware Sync',
            description: 'Synchronize your physical peripheral nodes.',
            content: (
                <div className="space-y-6">
                    <div className="bg-background-tertiary/20 backdrop-blur-3xl rounded-[2rem] p-8 border-2 border-border-default/50 shadow-xl flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-background-card rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-border-subtle/30 shadow-lg group-hover:shadow-glow-primary/20">
                                <Printer size={28} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 italic">Thermal Nodes</h3>
                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic">3 peripherals discovered</p>
                            </div>
                        </div>
                        <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic shadow-glow-success/20">Protocol Linked</Badge>
                    </div>
                    <div className="bg-background-tertiary/20 backdrop-blur-3xl rounded-[2rem] p-8 border-2 border-border-default/50 shadow-xl flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-background-card rounded-[1.5rem] flex items-center justify-center text-text-tertiary/40 group-hover:text-primary group-hover:scale-110 transition-transform border border-border-subtle/30 shadow-lg group-hover:shadow-glow-primary/20">
                                <Terminal size={28} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-2 italic">Terminal Link</h3>
                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic">Internal card bridge</p>
                            </div>
                        </div>
                        <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic shadow-glow-success/20">Node Ready</Badge>
                    </div>
                </div>
            )
        },
        {
            title: 'Final Synchronization',
            tagline: 'Launch Sequence',
            description: 'Your terminal is authorized and ready for live operations.',
            content: (
                <div className="text-center space-y-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-28 h-28 bg-success/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-glow-success/20 border-2 border-success/20"
                    >
                        <CheckCircle2 size={48} className="text-success animate-bounce" />
                    </motion.div>
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic lg:text-5xl">Authorized</h2>
                        <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.3em] opacity-60 leading-relaxed max-w-[320px] mx-auto italic">
                            System integrity verified. Protocol anchoring sequence complete. Node live on mainnet.
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
            router.push('/auth/register');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-10 relative selection:bg-primary/20 overflow-hidden text-text-primary antialiased bg-mesh-primary">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 mb-6"
                    >
                        <Badge variant="success" className="text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic shadow-glow-success/20">Node Initialization Protocol</Badge>
                    </motion.div>
                </div>

                <Card className="rounded-[4rem] p-12 lg:p-16 border-2 border-border-default/50 shadow-3xl relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                    {/* Progress Matrix */}
                    <div className="flex gap-4 mb-16 px-2">
                        {steps.map((_, index) => (
                            <div key={index} className="flex-1 h-2 rounded-full bg-background-tertiary/40 overflow-hidden border border-border-default/30 shadow-inner">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        width: index < currentStep ? '100%' : index === currentStep ? '100%' : '0%',
                                        backgroundColor: index <= currentStep ? 'var(--primary)' : 'transparent'
                                    }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="h-full shadow-glow-primary"
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
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="min-h-[420px] flex flex-col"
                        >
                            <div className="mb-12">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em] mb-4 block animate-pulse italic">{currentStepData.tagline}</span>
                                <h1 className="text-5xl lg:text-6xl font-black text-text-primary uppercase tracking-tighter italic mb-5 leading-none">{currentStepData.title}</h1>
                                <p className="text-[11px] font-black text-text-tertiary opacity-60 leading-relaxed uppercase tracking-[0.3em] italic">{currentStepData.description}</p>
                            </div>

                            <div className="flex-1">
                                {currentStepData.content}
                            </div>

                            <div className="flex gap-6 pt-12 mt-auto border-t-2 border-border-default/30">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className="flex-1 h-20 rounded-[1.5rem] border-2 border-border-default/50 text-text-primary hover:border-primary/50 font-black tracking-[0.4em] uppercase text-[10px] disabled:opacity-20 disabled:cursor-not-allowed transition-all italic shadow-lg"
                                >
                                    <ArrowLeft size={18} className="mr-3" /> BACK
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="flex-[2] h-20 rounded-[1.5rem] bg-primary text-white hover:scale-105 active:scale-95 font-black tracking-[0.4em] uppercase text-[11px] shadow-glow-primary transition-all italic group"
                                >
                                    {currentStep === steps.length - 1 ? 'CREATE ACCOUNT' : 'NEXT SEQUENCE'}
                                    <ArrowRight size={18} className="ml-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Card>

                <div className="flex flex-col items-center gap-4 mt-12">
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.6em] opacity-40 italic">
                        Secure Authentication Protocol · Node ID: 0x72...K90
                    </p>
                    <div className="flex gap-6">
                        <Shield size={16} className="text-primary/20" />
                        <Globe size={16} className="text-primary/20" />
                        <Cpu size={16} className="text-primary/20" />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                :root {
                    --primary-rgb: 0, 0, 0;
                }
            `}</style>
        </div>
    );
}
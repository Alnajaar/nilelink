"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    X,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    Store,
    Truck,
    Zap,
    MapPin,
    BookOpen,
    Layers,
    TrendingUp,
    Shield,
    Navigation,
    QrCode
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import Link from 'next/link';
import { useDemo } from '@/shared/contexts/DemoContext';

export default function DeliveryDemoPage() {
    const { simulatedState, isDemoMode } = useDemo() as any;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const demoSteps = [
        {
            title: "Driver Onboarding",
            description: "Driver initializes tactical identity and synchronizes Web3 wallet.",
            icon: Shield,
            action: "KYC Verified • Wallet Connected: 0x71...f3a9"
        },
        {
            title: "Incoming Dispatch",
            description: "AI Dispatch Engine identifies the driver as the optimal node for a new order.",
            icon: Zap,
            action: "New Request: Nile Bistro → 4.2km away • Est. Earning: $8.50"
        },
        {
            title: "Route Optimization",
            description: "System calculates the fastest route using real-time protocol traffic data.",
            icon: Navigation,
            action: "Route Optimized: 12m estimated delivery time."
        },
        {
            title: "Tactical Pickup",
            description: "Driver arrives at restaurant and verifies pickup via encrypted QR scan.",
            icon: QrCode,
            action: "Order ORD-882 Picked Up • POS Verification Successful"
        },
        {
            title: "Proof of Delivery",
            description: "Recipient signs on-chain or GPS fence triggers proof of delivery.",
            icon: CheckCircle,
            action: "Delivery Successful • Proof-of-Location stored on-chain"
        },
        {
            title: "Instant Settlement",
            description: "Earnings and incentives are instantly distributed via the Economic Protocol.",
            icon: DollarSign,
            action: "Payout Completed: +$8.50 distributed to Driver Treasury"
        }
    ];

    useEffect(() => {
        if (isPlaying && currentStep < demoSteps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 4000);
            return () => clearTimeout(timer);
        } else if (currentStep >= demoSteps.length - 1) {
            setIsPlaying(false);
        }
    }, [isPlaying, currentStep, demoSteps.length]);

    const handlePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (currentStep < demoSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Truck className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tighter text-primary italic">NileFleet</h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Tactical Logistics Demo</p>
                            </div>
                        </div>
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                                <X className="mr-2" size={18} />
                                EXIT DEMO
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left Column: Visuals & Step Detail */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                            <div className="aspect-video relative bg-slate-100 flex items-center justify-center">
                                {/* Simulated App Interface */}
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-full p-12 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-xl">
                                        {React.createElement(demoSteps[currentStep].icon, { size: 64, className: "text-primary" })}
                                    </div>
                                    <h2 className="text-4xl font-black text-primary uppercase tracking-tighter mb-4 italic">
                                        {demoSteps[currentStep].title}
                                    </h2>
                                    <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
                                        {demoSteps[currentStep].description}
                                    </p>
                                </motion.div>

                                {/* Progress Indicator */}
                                <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-100">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-gray-50/50">
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-2">Protocol Status</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                                            <span className="text-sm font-bold text-primary">{demoSteps[currentStep].action}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={handlePrevious} disabled={currentStep === 0} variant="ghost" className="w-12 h-12 rounded-full p-0 border border-gray-200">
                                            <SkipBack size={20} />
                                        </Button>
                                        <Button onClick={handlePlay} className="w-16 h-16 rounded-full bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform p-0 flex items-center justify-center">
                                            {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                                        </Button>
                                        <Button onClick={handleNext} disabled={currentStep >= demoSteps.length - 1} variant="ghost" className="w-12 h-12 rounded-full p-0 border border-gray-200">
                                            <SkipForward size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Technical Stats & Console */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Fleet Efficiency", value: "98.4%", icon: TrendingUp },
                                { label: "Active Nodes", value: (12402 + (simulatedState.blockHeight % 100)).toLocaleString(), icon: Layers },
                                { label: "Settlement TPS", value: Math.round(simulatedState.tps), icon: Zap },
                                { label: "Protocol Load", value: simulatedState.tps > 850 ? "High" : "Optimal", icon: Activity }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="text-primary/20 mb-4">{stat.icon && <stat.icon size={20} />}</div>
                                    <div className="text-2xl font-black text-primary italic">{stat.value}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-primary/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tactical Console */}
                        <div className="bg-primary rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Tactical Console</span>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-6 font-mono text-sm leading-relaxed">
                                <div className="text-secondary opacity-80">$ nilefleet locate --optimal</div>
                                <div className="text-white/60">Searching available nodes in Cairo Central...</div>
                                <div className="text-white">Optimal Driver Found: <span className="text-secondary">DRV-901</span></div>
                                <div className="border-l-2 border-white/10 pl-4 space-y-2">
                                    <div className="text-white/40 text-[10px] uppercase">Transaction Hash</div>
                                    <div className="text-[11px] text-white/80 break-all">0x4a92c10b91e9f3a920430192043...</div>
                                </div>
                                <motion.div
                                    className="pt-4 border-t border-white/5"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className="text-secondary">●</span> Protocol Synchronized
                                </motion.div>
                            </div>
                        </div>

                        {/* Documentation Link */}
                        <div className="bg-secondary/10 border border-secondary/20 p-8 rounded-[2rem] flex items-center justify-between">
                            <div>
                                <h4 className="text-primary font-black uppercase text-xs tracking-widest">Fleet API Reference</h4>
                                <p className="text-[10px] text-primary/60 mt-1">Explore the hooks for NileFleet integration.</p>
                            </div>
                            <Button variant="ghost" className="bg-white/50 text-primary">
                                <BookOpen size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Activity({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    )
}

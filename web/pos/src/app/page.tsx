'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    WifiOff,
    Shield,
    BarChart3,
    ArrowRight,
    Globe,
    CheckCircle,
    Zap,
    CreditCard,
    Clock,
    Users,
    ShoppingBag,
    Monitor,
    Truck,
    Layers,
    Database,
    Lock
} from 'lucide-react';
import GlobalNavbar from '@shared/components/GlobalNavbar';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/AuthProvider';
import { DeepSpaceBackground } from '@shared/components/DeepSpaceBackground';
import { Web3Integration } from '@/components/Web3Integration';

export default function PosLandingPage() {
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();
    const { user } = useAuth();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleStartTrial = () => {
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/onboarding');
        }
    };

    const handleExploreGuest = () => {
        router.push('/terminal');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#02050a] text-white flex flex-col selection:bg-pos-accent/30 overflow-x-hidden relative">
            {/* ADVANCED LINKING BACKGROUND */}
            {/* UI Component Extraction */}
            <DeepSpaceBackground />

            {/* Nav */}
            <GlobalNavbar context="pos" variant="transparent" />

            <main className="flex-1 relative z-10">
                {/* HERO SECTION - The Anchor of Trust */}
                <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden px-6 pt-20">
                    <div className="max-w-7xl mx-auto w-full relative">
                        <div className="flex flex-col items-center text-center space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                            >
                                <span className="flex h-1.5 w-1.5 rounded-full bg-pos-accent shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/70">
                                    Economic OS for Modern Merchants
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tightest leading-[0.9] max-w-5xl"
                            >
                                High-Performance <br />
                                <span className="block italic drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">Commerce Control.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto"
                            >
                                The first decentralized POS system built for institutional reliability,
                                multi-branch scaling, and instantaneous global settlement. Run your
                                business on the protocol that never sleeps.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex flex-col sm:flex-row items-center gap-6 pt-8 w-full sm:w-auto"
                            >
                                <button
                                    onClick={handleStartTrial}
                                    className="w-full sm:w-auto px-10 h-16 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                                >
                                    Start Your Business
                                    <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={handleExploreGuest}
                                    className="w-full sm:w-auto px-10 h-16 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
                                >
                                    Explore as Guest
                                </button>
                                <Link 
                                    href="/test-web3"
                                    className="w-full sm:w-auto px-6 h-16 bg-pos-accent/10 border border-pos-accent/30 text-pos-accent font-black uppercase tracking-[0.2em] rounded-xl hover:bg-pos-accent/20 transition-all flex items-center justify-center text-sm"
                                >
                                    Test Web3
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* TRUST & PROOF SECTION - Why NileLink? */}
                <section className="py-24 bg-[#0a0a0a] border-y border-white/5 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-pos-accent/10 border border-pos-accent/20">
                                    <WifiOff className="text-pos-accent" />
                                </div>
                                <h3 className="text-xl font-bold">99.99% Offline Uptime</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Built with an edge-first architecture. Your terminal continues processing
                                    sales even when the internet goes dark. Data syncs automatically.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Lock className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold">Cryptographically Verified</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Every transaction is signed and immutable. No central point of failure,
                                    no data tampering, and full military-grade encryption.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 w-fit rounded-xl bg-green-500/10 border border-green-500/20">
                                    <Zap className="text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold">Instant Settlement</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Remove the 3-day bank delay. Settlement happens directly via the
                                    NileLink Protocol, giving you immediate access to your liquidity.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS - The Frictionless Onboarding */}
                <section className="py-32 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-pos-accent mb-4">The Workflow</h2>
                            <p className="text-4xl md:text-6xl font-black tracking-tightest">From Setup to Sale in Minutes.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
                            {/* Connector Line for Desktop */}
                            <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                            {[
                                { step: '01', title: 'Register', desc: 'Secure your brand with a simple email or phone verification.' },
                                { step: '02', title: 'Onboard', desc: 'Define your business profile, location, and operating hours.' },
                                { step: '03', title: 'Configure', desc: 'Launch your terminal and connect thermal printers & scanners.' },
                                { step: '04', title: 'Scale', desc: 'Manage unlimited branches and inventory from one dashboard.' }
                            ].map((item, i) => (
                                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black italic text-pos-accent/50">
                                        {item.step}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold">{item.title}</h4>
                                        <p className="text-gray-400 text-sm max-w-[200px] mx-auto">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WEB3 INTEGRATION SECTION - Decentralized Commerce */}
                <section className="py-32 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#02050a]">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div>
                            <Badge variant="primary" className="text-pos-accent border-pos-accent/30 tracking-widest uppercase text-[10px] font-black mb-6">
                                Decentralized Protocol
                            </Badge>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tightest mb-6">
                                Blockchain-Powered <br />
                                <span className="text-pos-accent italic">Commerce Engine</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Connect your wallet to access the NileLink Protocol. Create immutable orders,
                                manage decentralized inventory, and settle payments instantly on Polygon.
                            </p>
                        </div>
                        
                        <div className="max-w-2xl mx-auto">
                            <Web3Integration />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-pos-accent/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <Lock className="text-pos-accent w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">Immutable Orders</h4>
                                <p className="text-gray-400 text-sm">Every transaction recorded permanently on blockchain</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <Zap className="text-blue-400 w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">Instant Settlement</h4>
                                <p className="text-gray-400 text-sm">Remove 3-day bank delays with protocol-level settlement</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <Shield className="text-green-400 w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">Trustless Security</h4>
                                <p className="text-gray-400 text-sm">Military-grade encryption with zero central points of failure</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE BLOCKS - The Core Systems */}
                <section className="py-32 px-6 bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto space-y-32">
                        {/* POS & Terminal */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <Badge variant="primary" className="text-pos-accent border-pos-accent/30 tracking-widest uppercase text-[10px] font-black">
                                    Mission Critical
                                </Badge>
                                <h3 className="text-4xl md:text-5xl font-black italic tracking-tightest uppercase">Elite Terminal <br /> Interface</h3>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    Optimized for maximum throughput. A low-latency, lightning-fast UI designed for high-volume
                                    retail and hospitality environments. Multi-branch compatible by design.
                                </p>
                                <ul className="space-y-4">
                                    {['Lightning-fast barcode scanning', 'Split-bill & tax management', 'Universal hardware support'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                            <CheckCircle size={18} className="text-pos-accent" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-pos-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img src="/assets/landing/hero.png" alt="Terminal UI" className="relative rounded-3xl border border-white/10 shadow-2xl" />
                            </div>
                        </div>

                        {/* Inventory & Supply Chain */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1 relative group">
                                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img src="/assets/landing/feature_telemetry.png" alt="Inventory Monitoring" className="relative rounded-3xl border border-white/10 shadow-2xl" />
                            </div>
                            <div className="order-1 lg:order-2 space-y-8">
                                <Badge variant="primary" className="text-blue-400 border-blue-400/30 tracking-widest uppercase text-[10px] font-black">
                                    Deep Visibility
                                </Badge>
                                <h3 className="text-4xl md:text-5xl font-black italic tracking-tightest uppercase">Supplier & <br /> Inventory Control</h3>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    Track inventory velocity across all branches. Automate reordering from your verified
                                    supplier network and eliminate waste with real-time stock telemetry.
                                </p>
                                <ul className="space-y-4">
                                    {['Real-time stock depletion', 'Automated supplier reordering', 'Wastage & audit tracking'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                            <CheckCircle size={18} className="text-blue-400" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHO IT'S FOR - The Targets */}
                <section className="py-32 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="mb-20">
                            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-pos-accent mb-4">Industries</h2>
                            <p className="text-4xl md:text-6xl font-black tracking-tightest italic uppercase">Engineered for Scale.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { title: 'Restaurants', icon: Users },
                                { title: 'Coffee Shops', icon: Clock },
                                { title: 'Supermarkets', icon: ShoppingBag },
                                { title: 'Multi-Branch', icon: Globe }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-pos-accent/50 transition-all group flex flex-col items-center gap-6">
                                    <item.icon size={32} className="text-white/50 group-hover:text-pos-accent transition-colors" />
                                    <span className="font-bold tracking-widest text-sm uppercase">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-48 px-6 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pos-accent/5 blur-[120px] rounded-full" />
                    <div className="max-w-4xl mx-auto relative z-10 space-y-16">
                        <h2 className="text-5xl md:text-9xl font-black italic tracking-tightest uppercase leading-none">
                            Ready for the <br />
                            <span className="text-pos-accent">Next Level?</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <button
                                onClick={handleStartTrial}
                                className="w-full sm:w-auto px-16 h-20 bg-white text-black text-xl font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
                            >
                                Start Business
                            </button>
                            <button
                                onClick={() => router.push('https://docs.nilelink.app')}
                                className="w-full sm:w-auto px-16 h-20 bg-white/5 border border-white/10 text-xl font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all"
                            >
                                View Docs
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <UniversalFooter />
        </div>
    );
}

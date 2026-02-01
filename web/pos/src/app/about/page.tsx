'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Users, Heart, Target, TrendingUp } from 'lucide-react';
import GlobalNavbar from '@shared/components/GlobalNavbar';
import { UniversalFooter } from '@shared/components/UniversalFooter';

const coreValues = [
    {
        icon: Shield,
        title: 'Sovereignty',
        desc: 'We believe every merchant should own their data, their customer relationships, and their economic future without middleman interference.'
    },
    {
        icon: Zap,
        title: 'Velocity',
        desc: 'By removing legacy banking delays, we enable businesses to operate at the speed of the internet, with instant global settlement.'
    },
    {
        icon: Globe,
        title: 'Connectivity',
        desc: 'Linking local commerce to a global protocol layer, creating a unified ecosystem of suppliers, customers, and entrepreneurs.'
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col selection:bg-pos-accent/30 overflow-x-hidden">
            <GlobalNavbar context="pos" variant="transparent" />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-pos-accent/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/shared/assets/images/dots.svg')] opacity-5" />
            </div>

            <main className="flex-1 relative z-10">
                {/* Hero Section */}
                <section className="pt-48 pb-32 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-pos-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 text-wrap">The NileLink Ethos</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black italic tracking-tightest leading-none uppercase"
                        >
                            We build for the <br /><span className="text-pos-accent">Independent Empire.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg md:text-xl font-medium max-w-3xl border-l-[3px] border-pos-accent/30 pl-8"
                        >
                            NileLink wasn't built as another SaaS company. It was engineered as a protocol
                            to liberate commerce from the constraints of legacy infrastructure.
                            We are the operating system for the next generation of global merchants.
                        </motion.p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black italic tracking-tightest uppercase text-pos-accent">Our Mission</h2>
                                <p className="text-gray-300 text-lg leading-relaxed font-medium">
                                    To provide institutional-grade infrastructure to every business owner on Earth, regardless of their scale.
                                    We bridge the gap between physical retail and decentralized finance, making high-performance
                                    commerce accessible to everyone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="text-4xl font-black italic text-white">99.9%</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Network Uptime</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-black italic text-white">0</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Middleman Fees</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-pos-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative p-12 rounded-[4rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center aspect-square">
                                <Globe size={160} className="text-pos-accent/20 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border border-pos-accent/30 flex items-center justify-center animate-spin-slow">
                                        <Zap size={40} className="text-pos-accent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="py-48 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-pos-accent mb-4">Core Principles</h2>
                            <p className="text-4xl font-black italic tracking-tightest uppercase">How we operate.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {coreValues.map((value, i) => (
                                <div key={i} className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/5 space-y-6 hover:border-pos-accent/30 transition-all group">
                                    <div className="w-16 h-16 rounded-2xl bg-pos-accent/10 border border-pos-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <value.icon className="text-pos-accent" size={28} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">{value.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-48 px-6 text-center">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-tightest uppercase leading-none">Join Us <br /><span className="text-pos-accent">Now</span></h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => window.location.href = '/onboarding'}
                                className="px-12 h-20 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                Start Business
                            </button>
                            <button
                                onClick={() => window.open('https://docs.nilelink.app', '_blank')}
                                className="px-12 h-20 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all w-full sm:w-auto"
                            >
                                View Documentation
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <UniversalFooter />
        </div>
    );
}

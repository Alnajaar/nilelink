"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    ShoppingBag,
    Truck,
    Store,
    ArrowRight,
    ChevronRight,
    ShieldCheck,
    Globe,
    Database,
    Layers,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { UniversalNavbar } from '@/components/UniversalNavbar';
import { UniversalFooter } from '@/components/UniversalFooter';

const FeatureCard = ({ title, sub, desc, icon: Icon, color, url }: any) => (
    <motion.a
        href={url}
        whileHover={{ y: -10 }}
        className="group relative h-full flex flex-col p-10 rounded-5xl glass-card overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />

        <div className={`w-16 h-16 rounded-3xl bg-nile-dark border border-white/5 flex items-center justify-center text-nile-silver mb-8 group-hover:scale-110 group-hover:bg-nile-silver group-hover:text-nile-dark transition-all duration-500`}>
            <Icon size={32} />
        </div>

        <span className="text-[10px] font-black tracking-[0.4em] text-nile-silver/30 uppercase mb-4">{sub}</span>
        <h3 className="text-3xl font-black text-white mb-6 tracking-tighter">{title}</h3>
        <p className="text-nile-silver/50 font-bold leading-relaxed mb-12 flex-grow">
            {desc}
        </p>

        <div className="flex items-center gap-3 text-nile-silver font-black text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
            <span>Enter System</span>
            <ArrowRight size={18} />
        </div>
    </motion.a>
);

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col selection:bg-emerald-500/30">
            <div className="mesh-bg" />
            <UniversalNavbar />

            <main className="flex-1 relative">
                {/* Hero Section */}
                <section className="relative z-10 pt-48 pb-32 px-8 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-v2 mb-12 border-white/10 mx-auto">
                            <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 italic">NileLink Protocol • v1.0 Production</span>
                        </div>

                        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter nile-text-gradient leading-[0.8] mb-12 uppercase italic">
                            Operating the <br />
                            <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Daily Economy.</span>
                        </h1>

                        <p className="max-w-xl mx-auto text-lg font-medium text-white/40 leading-relaxed mb-20 italic">
                            The decentralized operating system for local commerce.
                            <span className="block mt-2 text-emerald-500/50 sub-glow uppercase tracking-tighter">Offline-first • Edge-sharded • Auditable</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link href="#network" className="btn-premium w-64 h-20 text-[11px]">
                                Launch Network
                                <Zap size={20} fill="currentColor" />
                            </Link>
                            <Link href="https://invest.nilelink.app" className="glass-v2 hover:bg-white/5 w-64 h-20 rounded-full flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-white/50 border-white/10 group transition-all">
                                Protocol Health
                                <Globe size={20} className="group-hover:rotate-12 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Ecosystem Grid */}
                <section id="network" className="relative z-10 px-8 py-32 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            title="POS Terminal"
                            sub="Node: Merchant"
                            desc="High-performance sales terminal with cryptographically-secure local ledgers. Works 100% offline."
                            icon={Store}
                            color="from-emerald-500 to-transparent"
                            url="https://pos.nilelink.app"
                        />
                        <FeatureCard
                            title="Logistics HUD"
                            sub="Node: Delivery"
                            desc="Real-time route sharding and cash-in-hand accounting with immutable proof of delivery."
                            icon={Truck}
                            color="from-blue-500 to-transparent"
                            url="https://delivery.nilelink.app"
                        />
                        <FeatureCard
                            title="Customer App"
                            sub="Node: Discovery"
                            desc="Zero-clutter interface for decentralized commerce. Real-time tracking and verified receipts."
                            icon={ShoppingBag}
                            color="from-purple-500 to-transparent"
                            url="https://customer.nilelink.app"
                        />
                        <FeatureCard
                            title="Supplier Hub"
                            sub="Node: Supply Chain"
                            desc="Automated restock intelligence and debt-aging protocols anchored to POS inventory cycles."
                            icon={Layers}
                            color="from-amber-500 to-transparent"
                            url="https://supplier.nilelink.app"
                        />
                        <FeatureCard
                            title="Investor Core"
                            sub="Node: Transparency"
                            desc="Verifiable revenue streams and network-wide yield audits for protocol stakeholders."
                            icon={ShieldCheck}
                            color="from-white to-transparent"
                            url="https://invest.nilelink.app"
                        />
                        <FeatureCard
                            title="Edge Gateway"
                            sub="Node: API"
                            desc="Global consensus layer using sharded D1 collections for ecosystem anchoring."
                            icon={Zap}
                            color="from-indigo-500 to-transparent"
                            url="https://api.nilelink.app"
                        />
                    </motion.div>
                </section>

                {/* Performance Stats */}
                <section className="relative z-10 px-8 py-40 border-t border-white/5">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: 'Edge Latency', value: '<14ms', icon: Zap },
                                { label: 'Protocol State', value: 'Live', icon: Globe },
                                { label: 'Audit Trail', value: '100%', icon: ShieldCheck },
                                { label: 'Throughput', value: 'High', icon: Database }
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-12 h-12 rounded-2xl glass-v2 flex items-center justify-center text-white/20 mx-auto mb-6 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500">
                                        <stat.icon size={24} />
                                    </div>
                                    <div className="text-3xl font-black nile-text-gradient italic tracking-tighter mb-2">{stat.value}</div>
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <UniversalFooter />
        </div>
    );
}

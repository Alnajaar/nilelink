"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Shield,
    Globe,
    ArrowRight,
    Store,
    Truck,
    TrendingUp,
    Layers,
    CheckCircle2,
    Server,
    Clock
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { UniversalFooter } from '@/shared/components/UniversalFooter';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <UniversalHeader appName="Portal" />

            <main className="flex-1 w-full relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#0e372b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                {/* Hero Section */}
                <section className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="max-w-4xl"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            Waitlist Active (v1.0)
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-primary-dark tracking-tight leading-[1.1] mb-8">
                            The Economic <br />
                            <span className="text-primary-light">Operating System.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-text-muted max-w-2xl leading-relaxed mb-10">
                            NileLink provides the digital infrastructure for real-world commerce.
                            From point-of-sale to last-mile delivery, unified by a decentralized ledger.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                            <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                                Start Dashboard
                            </Button>
                            <Button variant="outline" size="lg">
                                Documentation
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Status Bar */}
                <div className="w-full border-y border-border-subtle bg-background-subtle/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-8 items-center justify-start text-xs font-mono text-text-subtle uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                            <Globe size={14} className="text-primary" />
                            <span>Global Status: <span className="text-success font-bold">Online</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-primary" />
                            <span>Latency: <span className="text-text-main font-bold">14ms</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-primary" />
                            <span>Security: <span className="text-text-main font-bold">Audited</span></span>
                        </div>
                    </div>
                </div>

                {/* Ecosystem Grid */}
                <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-primary-dark mb-4">Core Infrastructure</h2>
                        <p className="text-text-muted max-w-xl">
                            A suite of interconnected applications designed for trustless, automated commerce.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* POS System */}
                        <a href="https://pos.nilelink.app" className="group">
                            <Card variant="default" className="h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Store size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">Point of Sale</h3>
                                <p className="text-text-muted text-sm leading-relaxed mb-6">
                                    Offline-first retail terminals for high-volume transactions.
                                    Syncs automatically when connectivity restores.
                                </p>
                                <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                                    Launch Interface <ArrowRight size={16} className="ml-2" />
                                </div>
                            </Card>
                        </a>

                        {/* Delivery Network */}
                        <a href="https://delivery.nilelink.app" className="group">
                            <Card variant="default" className="h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Truck size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">Logistics Fleet</h3>
                                <p className="text-text-muted text-sm leading-relaxed mb-6">
                                    Decentralized driver dispatch with cryptographic proof of delivery
                                    and real-time route optimization.
                                </p>
                                <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                                    View Fleet <ArrowRight size={16} className="ml-2" />
                                </div>
                            </Card>
                        </a>

                        {/* Investor Dashboard */}
                        <a href="https://invest.nilelink.app" className="group">
                            <Card variant="default" className="h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">Treasury Check</h3>
                                <p className="text-text-muted text-sm leading-relaxed mb-6">
                                    Real-time access to protocol revenue, smart contract auditing,
                                    and governance voting.
                                </p>
                                <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                                    View Analytics <ArrowRight size={16} className="ml-2" />
                                </div>
                            </Card>
                        </a>

                        {/* Supplier Hub */}
                        <a href="https://supplier.nilelink.app" className="group">
                            <Card variant="default" className="h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Layers size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-2">Supply Chain</h3>
                                <p className="text-text-muted text-sm leading-relaxed mb-6">
                                    Automated inventory restocking and supplier relationship management
                                    powered by smart contracts.
                                </p>
                                <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                                    Manage Inventory <ArrowRight size={16} className="ml-2" />
                                </div>
                            </Card>
                        </a>
                    </div>
                </section>

                {/* Features Split */}
                <section className="py-24 bg-primary-dark text-white">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-6">Built for Stability.<br />Designed for Speed.</h2>
                                <p className="text-primary-surface/80 text-lg leading-relaxed mb-8">
                                    NileLink replaces fragile legacy systems with a robust, decentralized backbone.
                                    Every transaction is verified, every update is immutable, and uptime is guaranteed by the network.
                                </p>

                                <ul className="space-y-4">
                                    {[
                                        'Zero downtime architecture',
                                        'Cryptographic data integrity',
                                        'Instant global settlement',
                                        'Permissionless innovation'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-secondary" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative">
                                {/* Abstract UI Representation */}
                                <div className="absolute inset-0 bg-primary-light blur-3xl opacity-20 rounded-full"></div>
                                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs font-mono text-white/50">api.nilelink.app/v1/ledger</div>
                                    </div>

                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="flex justify-between items-center text-secondary">
                                            <span>Block #19,204,382</span>
                                            <span className="text-success">Confirmed</span>
                                        </div>
                                        <div className="p-3 bg-black/20 rounded border border-white/5 text-xs text-white/80">
                                            {`{ "tx": "0x8f...2a", "amount": 450.00, "merchant": "Cairo_Bistro" }`}
                                        </div>
                                        <div className="p-3 bg-black/20 rounded border border-white/5 text-xs text-white/80">
                                            {`{ "tx": "0x7a...9b", "amount": 12.50, "merchant": "Nile_Coffee" }`}
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-white/40 text-xs">Processing...</span>
                                            <Server size={14} className="text-white/40 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

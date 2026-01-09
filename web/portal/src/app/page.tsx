"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
    Zap, TrendingUp, Cpu, Network, ArrowRight, ArrowUpRight,
    DollarSign, Globe, Shield, CheckCircle, CreditCard, Star,
    ChevronRight, Layers, Settings, Lock
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Card } from '../../../shared/components/Card';
import { systemApi, ApiError } from '../../../shared/utils/api';

// Placeholder for network map - to be implemented
const NetworkMap = ({ nodes }: { nodes?: any[] }) => (
    <div className="w-full h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/10">
        <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-black uppercase tracking-widest opacity-60">Global Network Visualization</span>
            <p className="text-xs text-text-primary/40 mt-2">Network map will be displayed here</p>
        </div>
    </div>
);

// Placeholder for neural mesh background effect
const NeuralMesh = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
);

import { globalSmartNodes } from '@/lib/mockData';

export default function GlobalGateway() {
    const [stats, setStats] = useState({
        revenue: 4210582,
        tps: 842.5,
        nodes: 1242,
        merchants: 894
    });
    const [statsLoading, setStatsLoading] = useState(true);

    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        '» nilelink-cli --monitor --global',
        '» Initializing secured cluster handshake...',
        '» Connection established with Dubai Central Hub'
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const data = await systemApi.getStats();
                setStats({
                    revenue: data.revenue,
                    tps: data.tps,
                    nodes: data.nodes,
                    merchants: data.merchants
                });
            } catch (err) {
                console.error('Failed to fetch stats, using fallback data', err);
                // Keep default stats on error - they will show meaningful fallback values
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Simulated terminal events - deterministic for hydration
    useEffect(() => {
        const events = [
            '» Transaction processed: Order #NL-2024-001',
            '» Payment settlement completed in 45ms',
            '» Supply chain sync: 98% efficiency',
            '» Customer authentication verified',
            '» Inventory levels updated across network',
            '» Multi-node consensus achieved',
            '» System health: All services operational'
        ];

        let eventIndex = 0;
        const interval = setInterval(() => {
            setTerminalLogs(prev => {
                const newLog = events[eventIndex % events.length];
                eventIndex++;
                return [...prev.slice(-4), newLog];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const apps = [
        { name: 'NilePOS', desc: 'High-frequency retail infrastructure', url: 'https://pos.nilelink.app', icon: Zap },
        { name: 'NileFleet', desc: 'Tactical logistics coordination', url: 'https://delivery.nilelink.app', icon: TrendingUp },
        { name: 'NileSupply', desc: 'Automated inventory protocol', url: 'https://supplier.nilelink.app', icon: Cpu },
        { name: 'NileUnified', desc: 'B2B ecosystem management', url: 'https://unified.nilelink.app', icon: Network }
    ];

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 overflow-x-hidden relative mesh-bg">
            <NeuralMesh />
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-primary/40 rounded-full blur-[180px]" />
            </div>

            {/* Main Command Center */}
            <main className="relative pt-20 pb-20 px-6 max-w-7xl mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Intelligence Panel */}
                    <div className="lg:col-span-12 xl:col-span-8 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">Economic OS 4.2S</Badge>
                                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-text-primary tracking-tighter uppercase leading-[0.85] italic">
                                    Why Choose<br />NileLink?
                                </h1>
                            </div>
                            <div className="space-y-6 max-w-3xl">
                                <p className="text-lg md:text-xl font-bold text-primary leading-tight">
                                    Deploy in 5 minutes • Process 1000+ TPS • Enterprise-grade security
                                </p>
                                <p className="text-sm md:text-base font-medium text-text-primary opacity-60 leading-relaxed">
                                    Join 500+ businesses reducing operational costs by 40% while scaling globally. No hardware required. Just results.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                                <Link href="/get-started">
                                    <Button
                                        className="h-12 sm:h-14 px-8 sm:px-10 bg-secondary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-secondary/90 transition-all shadow-2xl"
                                    >
                                        Deploy Smart Node
                                        <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </Link>
                                <Link href="/demo">
                                    <Button
                                        variant="outline"
                                        className="h-12 sm:h-14 px-8 sm:px-10 border-2 border-primary text-text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        Try Demo Mode
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Global KPI HUD */}
                    <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="p-6 sm:p-8 border-2 border-primary bg-neutral shadow-[12px_12px_0px_0px_rgba(15,23,42,0.05)] sm:shadow-[24px_24px_0px_0px_rgba(15,23,42,0.05)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <DollarSign size={160} className="text-text-primary" />
                                </div>
                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Ecosystem Transaction Volume</p>
                                    <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-text-primary">
                                        {statsLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-12 w-32 rounded"></div>
                                        ) : (
                                            `${stats.revenue.toLocaleString()}`
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-4 text-success font-black text-[10px] uppercase tracking-widest">
                                        <ArrowUpRight size={14} />
                                        <span>+14.2% Regional Surge</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <Card className="p-6 border-2 border-border-subtle bg-neutral">
                                <p className="text-[8px] font-black uppercase opacity-30 mb-2 tracking-widest leading-none">Global TPS</p>
                                <p className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-text-primary">{stats.tps.toFixed(1)}</p>
                            </Card>
                            <Card className="p-6 border-2 border-border-subtle bg-neutral">
                                <p className="text-[8px] font-black uppercase opacity-30 mb-2 tracking-widest leading-none">Active Nodes</p>
                                <p className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-text-primary">{stats.nodes}</p>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Network Visualization HUD */}
                <div className="mt-40">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-4 italic">Global Reach</h3>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-text-primary italic">Real-Time Protocol Mesh</h2>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-40">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-success rounded-full" />
                                <span>Optimal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-warning rounded-full" />
                                <span>Syncing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                <span>Edge Cluster</span>
                            </div>
                        </div>
                    </div>
                    <NetworkMap nodes={globalSmartNodes} />
                </div>

                {/* Ecosystem Nodes Grid */}
                <div className="mt-32 space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary/5 pb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-4 italic">Protocol Deployment</h3>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-text-primary italic">Active Application Nodes</h2>
                        </div>
                        <Link href="/docs/ecosystem">
                            <Button variant="outline" className="h-14 px-8 border-2 border-border-subtle text-text-primary font-black uppercase tracking-widest text-[10px] rounded-xl hover:border-primary transition-all">
                                View Architecture
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {apps.map((app, i) => {
                            // Unique button text for each app
                            const buttonText = {
                                'NilePOS': 'Launch Terminal',
                                'NileFleet': 'Manage Fleet',
                                'NileSupply': 'Deploy Node',
                                'NileUnified': 'Access Hub'
                            }[app.name] || 'Launch App';

                            return (
                                <motion.a
                                    key={app.name}
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -10 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="p-6 sm:p-10 bg-white border-2 border-border-subtle rounded-[2rem] sm:rounded-[3rem] group hover:border-primary transition-all shadow-sm hover:shadow-2xl h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                                            <app.icon size={32} />
                                        </div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors">{app.name}</h4>
                                        <p className="text-sm font-medium opacity-40 leading-relaxed mb-12">{app.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        <span>{buttonText}</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </motion.a>
                            );
                        })}
                    </div>
                </div>

                {/* Technology Briefing Section */}
                <div className="mt-48 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <Badge className="bg-white text-text-primary/40 border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">Protocol Specs</Badge>
                            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-text-primary leading-none italic">Trustless by<br />Architecture</h2>
                        </div>
                        <div className="space-y-8">
                            {[
                                { title: 'High-Frequency Sync', desc: 'Global multi-device state synchronization with sub-second latency.', icon: Zap },
                                { title: 'Military Grade Sec', desc: 'Secure protocol nodes with 256-bit cryptographic verification.', icon: Shield },
                                { title: 'Infinite Scalability', desc: 'Region-based load balancing and node auto-clustering.', icon: Globe }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-text-primary opacity-30 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                        <feature.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-black uppercase tracking-widest text-sm">{feature.title}</h5>
                                        <p className="text-base text-text-primary opacity-40 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="relative">
                        <Card className="p-6 sm:p-10 border-2 border-primary bg-white shadow-2xl rounded-[2rem] sm:rounded-[3rem] relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <div className="w-3 h-3 rounded-full bg-white" />
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Live Protocol Terminal</span>
                            </div>
                            <div className="space-y-6 font-mono text-xs">
                                {terminalLogs.map((log, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className={log.startsWith('»') ? 'text-primary font-black' : 'text-text-primary'}>
                                            {log.startsWith('»') ? '»' : '$'}
                                        </span>
                                        <span className={i === terminalLogs.length - 1 ? 'text-primary font-bold' : 'text-text-primary/60'}>
                                            {log.startsWith('»') ? log.slice(2) : log}
                                        </span>
                                    </div>
                                ))}
                                <motion.p
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-primary text-[10px] uppercase font-black tracking-widest mt-4"
                                >» MONITORING CLUSTER HEALTH...</motion.p>
                            </div>
                        </Card>
                        {/* Decorative floating elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
                    </div>
                </div>

                {/* Pricing Ecosystem Section */}
                <div id="pricing" className="mt-40 grid lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="lg:col-span-1"
                    >
                        <div className="space-y-6">
                            <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">Pricing Ecosystem</Badge>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-text-primary leading-none italic">
                                Transparent<br />Cost Structure
                            </h2>
                            <p className="text-lg font-medium text-text-primary opacity-60 leading-relaxed">
                                Fair pricing designed for businesses of all sizes. No hidden fees, no surprises.
                            </p>
                        </div>
                    </motion.div>

                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                        <Card className="p-8 border-2 border-primary bg-primary text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} className="text-white" />
                            </div>
                            <div className="relative">
                                <Badge className="bg-neutral text-primary border-0 mb-4">Most Popular</Badge>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Ultimate Single</h3>
                                <div className="text-5xl font-black font-mono text-white mb-2">$200<span className="text-lg font-medium">/year</span></div>
                                <p className="text-sm text-white opacity-80 mb-6">90-Day Free Trial • Full Ecosystem Access</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-white" />
                                        <span className="text-sm">POS Core + Supplier Hub</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-white" />
                                        <span className="text-sm">Delivery Fleet + Customer Portal</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-white" />
                                        <span className="text-sm">Invest Hub Access</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-white/60 mb-6">Software-only protocol access. Hardware not included.</p>
                                <Link href="/get-started">
                                    <Button className="w-full h-14 bg-neutral text-primary hover:scale-105 font-black uppercase tracking-widest rounded-xl transition-all">
                                        Deploy Node
                                        <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        <Card className="p-8 border-2 border-border-subtle bg-neutral relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe size={80} className="text-primary" />
                            </div>
                            <div className="relative">
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Global Network</h3>
                                <div className="text-5xl font-black font-mono text-primary mb-2">$500<span className="text-lg font-medium">/year</span></div>
                                <p className="text-sm text-text-primary opacity-60 mb-6">90-Day Free Trial • 3+ Node Scaling</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span className="text-sm">All Features + Multi-Location</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span className="text-sm">Enterprise Analytics</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span className="text-sm">Unlimited Scaling</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-text-primary/60 mb-6">Software-only protocol access. Hardware not included.</p>
                                <Link href="/get-started">
                                    <Button className="w-full h-14 bg-primary text-white hover:bg-primary hover:text-white font-black uppercase tracking-widest rounded-xl transition-all">
                                        Scale Globally
                                        <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* How It Works Section */}
                <div id="how-it-works" className="mt-40 space-y-16">
                    <div className="text-center">
                        <Badge className="bg-white text-text-primary/40 border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">How It Works</Badge>
                        <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-text-primary leading-none italic mt-6">
                            From Concept to<br />Commerce in Minutes
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Deploy Node",
                                desc: "Launch your NileLink node with one-click deployment. Our infrastructure handles the complexity.",
                                icon: Zap
                            },
                            {
                                step: "02",
                                title: "Connect Devices",
                                desc: "Link your POS terminals, printers, and payment devices seamlessly to the network.",
                                icon: Network
                            },
                            {
                                step: "03",
                                title: "Configure Business",
                                desc: "Set up your menu, pricing, staff roles, and operational parameters through our admin interface.",
                                icon: Settings
                            },
                            {
                                step: "04",
                                title: "Start Transacting",
                                desc: "Begin processing payments, managing inventory, and generating insights instantly.",
                                icon: TrendingUp
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-text-primary mb-6 mx-auto group-hover:bg-primary group-hover:text-white transition-all">
                                    <step.icon size={32} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4">{step.step}</div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{step.title}</h3>
                                <p className="text-sm text-text-primary opacity-60 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Enter Ecosystem CTA */}
                <div id="ecosystem" className="mt-40">
                    <Card className="p-8 sm:p-16 border-2 border-primary bg-gradient-to-br from-neutral to-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-5">
                            <Layers size={200} className="text-text-primary" />
                        </div>
                        <div className="relative text-center max-w-4xl mx-auto">
                            <Badge className="bg-primary text-white border-0 font-black px-6 py-2 text-sm uppercase tracking-widest mb-8">Enter Ecosystem</Badge>
                            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-text-primary leading-none italic mb-8">
                                Join the Global<br />Commerce Revolution
                            </h2>
                            <p className="text-xl font-medium text-text-primary opacity-60 leading-relaxed mb-12 max-w-2xl mx-auto">
                                Be part of the decentralized economy. Deploy your node today and start building the future of commerce.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                                <Link href="/get-started" className="w-full sm:w-auto">
                                    <Button className="w-full h-16 px-12 bg-secondary text-white font-black uppercase tracking-widest text-base rounded-2xl hover:bg-secondary/90 transition-all shadow-2xl">
                                        Deploy Smart Node
                                        <ArrowRight className="ml-3" size={20} />
                                    </Button>
                                </Link>
                                <Link href="/demo" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full h-16 px-12 border-2 border-primary text-text-primary font-black uppercase tracking-widest text-base rounded-2xl hover:bg-primary hover:text-white transition-all">
                                        Try Free Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Social Proof Section */}
                <div className="mt-40">
                    <div className="text-center mb-16">
                        <Badge className="bg-white text-text-primary/40 border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em]">Institutional Trust</Badge>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-text-primary leading-none italic mt-6">
                            Trusted by Global<br />Market Leaders
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: "Apex Logistics", quote: "NileLink reduced our cross-border settlement time by 94%.", role: "CTO, Apex" },
                            { name: "Sahara Retail", quote: "The most reliable POS infrastructure we've ever deployed.", role: "CEO, Sahara" },
                            { name: "Delta Supply", quote: "Real-time inventory sync that actually works at scale.", role: "COO, Delta" },
                            { name: "Atlas Finance", quote: "Bank-grade security meets lightning-fast performance.", role: "VP Eng, Atlas" }
                        ].map((testi, i) => (
                            <Card key={i} className="p-8 border-2 border-border-subtle bg-white relative group">
                                <div className="mb-6 flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-primary text-primary" />)}
                                </div>
                                <p className="text-sm font-medium text-text-primary opacity-60 mb-8 italic">"{testi.quote}"</p>
                                <div>
                                    <p className="font-black uppercase tracking-widest text-xs">{testi.name}</p>
                                    <p className="text-[10px] font-bold opacity-30 mt-1">{testi.role}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 py-10 border-t border-b border-primary/5 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                        <Shield size={20} className="text-primary" />
                        <span>PCI Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                        <Shield size={20} className="text-primary" />
                        <span>SOC2 Type II</span>
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                        <CheckCircle size={20} className="text-primary" />
                        <span>SSL Secure</span>
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                        <Lock size={20} className="text-primary" />
                        <span>AES-256 Encrypted</span>
                    </div>
                </div>

            </main >
        </div >
    );
}


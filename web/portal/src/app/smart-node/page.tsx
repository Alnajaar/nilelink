"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Zap, ArrowRight, CheckCircle, Server,
    Shield, Globe, Cpu, Network, Code,
    Building2, Play, Sparkles
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function SmartNodePage() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20 mesh-bg">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/get-started">
                            <Button className="h-12 px-8 bg-primary text-background font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary/90 transition-all">
                                Deploy Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Core Technology
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        What Is A<br />Smart Node?
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        Think of it as your business's own private server in the NileLink network.
                        It's where your data lives, your transactions process, and your operations run.
                    </p>
                </div>

                {/* Simple Explanation */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-primary bg-white">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                                    For Business Owners
                                </h2>
                                <p className="text-lg mb-6 leading-relaxed">
                                    A Smart Node is your business's digital headquarters. No technical knowledge required.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Your data stays private and secure",
                                        "Works offline when internet is down",
                                        "Automatically backs up to the cloud",
                                        "Scales as your business grows"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-primary shrink-0 mt-1" />
                                            <span className="text-base font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-48 h-48 bg-primary rounded-full text-white mb-6">
                                    <Server size={80} />
                                </div>
                                <p className="text-sm text-text opacity-60">
                                    Your Smart Node handles everything behind the scenes
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Demo vs Real */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Badge className="bg-surface text-text/40 border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-4">Deployment Modes</Badge>
                        <h2 className="text-5xl font-black text-center italic">Choose Your Path</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Demo Mode */}
                        <Card className="p-12 border-2 border-surface bg-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <Sparkles size={160} />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center">
                                        <Sparkles size={32} className="text-primary" />
                                    </div>
                                    <div>
                                        <Badge className="bg-primary/10 text-primary border-0 mb-1 uppercase tracking-widest text-[8px]">Simulation</Badge>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter">Demo Sandbox</h3>
                                    </div>
                                </div>
                                <p className="text-lg text-text opacity-60 mb-8 leading-relaxed">
                                    Explore the full capabilities of the protocol in a risk-free environment. Perfect for onboarding staff and testing workflows.
                                </p>
                                <ul className="space-y-4 mb-12">
                                    {[
                                        "Instant Access (No Login)",
                                        "Simulated Real-time Transactions",
                                        "Pre-populated Sample Catalog",
                                        "Mobile & Desktop UI Testing",
                                        "Reset anytime with one click"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle size={18} className="text-primary" />
                                            <span className="text-sm font-bold opacity-40">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/demo">
                                    <Button size="lg" className="w-full h-16 bg-text text-background font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all">
                                        <Play className="mr-3" size={20} />
                                        Launch Sandbox
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        {/* Real Mode */}
                        <Card className="p-12 border-2 border-primary bg-primary text-background relative overflow-hidden group shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap size={160} />
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center">
                                        <Zap size={32} className="text-primary" />
                                    </div>
                                    <div>
                                        <Badge className="bg-background text-primary border-0 mb-1 uppercase tracking-widest text-[8px]">Production</Badge>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter">Live Protocol</h3>
                                    </div>
                                </div>
                                <p className="text-lg text-background opacity-60 mb-8 leading-relaxed">
                                    Deploy your official business node to the NileLink mainnet. Connect to real payments, real customers, and real revenue.
                                </p>
                                <ul className="space-y-4 mb-12">
                                    {[
                                        "Encrypted Business Persistence",
                                        "Mainnet Payment Settlement",
                                        "Active Customer Delivery Sync",
                                        "Priority Node Replication",
                                        "Bank-grade Operational Security"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle size={18} className="text-background" />
                                            <span className="text-sm font-bold opacity-60">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/get-started">
                                    <Button size="lg" className="w-full h-16 bg-background text-primary font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all">
                                        Deploy Production Node
                                        <ArrowRight className="ml-3" size={20} />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Node Types */}
                <div className="mt-40 mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-text/5 pb-8 mb-16">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-4 italic">Protocol Classification</h3>
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text italic">Active Application Nodes</h2>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { name: "NilePOS", desc: "Retail & Restaurant Terminal", icon: "🏪" },
                            { name: "NileSupply", desc: "Wholesale & Inventory Node", icon: "📦" },
                            { name: "NileFleet", desc: "Last-mile Delivery Command", icon: "🚚" },
                            { name: "NileUnified", desc: "Multi-location Ecosystem Hub", icon: "🌐" }
                        ].map((node, i) => (
                            <Link key={i} href="/get-started">
                                <Card className="p-10 border-2 border-surface bg-white hover:border-black transition-all group text-center cursor-pointer h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-6xl mb-8 group-hover:scale-110 transition-transform">{node.icon}</div>
                                        <h4 className="text-xl font-black uppercase mb-3 tracking-tighter">
                                            {node.name}
                                        </h4>
                                        <p className="text-sm font-medium text-text opacity-40 leading-relaxed mb-8">{node.desc}</p>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Deploy Node ↗</div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <Card className="p-20 border-2 border-text bg-text text-background text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[140px]" />
                    </div>
                    <div className="relative">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
                            Your infrastructure,<br />reimagined.
                        </h2>
                        <p className="text-xl text-background opacity-60 mb-12 max-w-2xl mx-auto">
                            Start in the sandbox to learn the ropes, then switch to production when you're ready to grow.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/demo">
                                <Button variant="outline" className="h-16 px-12 border-2 border-background text-background font-black uppercase tracking-widest rounded-2xl hover:bg-background hover:text-text transition-all">
                                    Try Demo Sandbox
                                </Button>
                            </Link>
                            <Link href="/get-started">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                                    Deploy Smart Node
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Zap, Shield,
    Cpu, TrendingUp, Users, Globe
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 mesh-bg">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-neutral/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <Link href="/auth/login">
                        <Button className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary hover:text-white transition-all">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Getting Started
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Choose Your<br />Smart Node
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text-primary opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        Every NileLink node is a complete business operating system.
                        Select the one that fits your operation.
                    </p>
                </div>

                {/* Node Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* POS Terminal */}
                    <Card className="p-10 border-2 border-border-subtle bg-white hover:border-primary transition-all group">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <Zap size={32} />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black">Most Popular</Badge>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">POS Terminal</h3>
                        <p className="text-text-primary opacity-60 mb-6 leading-relaxed">
                            For restaurants, cafes, retail stores, and any business that needs point-of-sale capabilities.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "Offline-first sales processing",
                                "Inventory management",
                                "Real-time analytics",
                                "Multi-location support"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-primary shrink-0" />
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="https://pos.nilelink.app/auth/register" target="_blank">
                            <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl group-hover:scale-105 transition-all">
                                Deploy POS Node
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                    </Card>

                    {/* Supply Node */}
                    <Card className="p-10 border-2 border-border-subtle bg-white hover:border-primary transition-all group">
                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                            <Cpu size={32} />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Supply Node</h3>
                        <p className="text-text-primary opacity-60 mb-6 leading-relaxed">
                            For wholesalers, distributors, and manufacturers selling to businesses.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "B2B marketplace integration",
                                "Automated order fulfillment",
                                "Inventory synchronization",
                                "Demand forecasting"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-primary shrink-0" />
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="https://supplier.nilelink.app/auth/register" target="_blank">
                            <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl group-hover:scale-105 transition-all">
                                Deploy Supply Node
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                    </Card>

                    {/* Fleet Command */}
                    <Card className="p-10 border-2 border-border-subtle bg-white hover:border-primary transition-all group">
                        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Fleet Command</h3>
                        <p className="text-text-primary opacity-60 mb-6 leading-relaxed">
                            For delivery companies and logistics operations managing drivers and routes.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "Real-time GPS tracking",
                                "Route optimization",
                                "Driver management",
                                "Delivery analytics"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-primary shrink-0" />
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="https://delivery.nilelink.app" target="_blank">
                            <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl group-hover:scale-105 transition-all">
                                Deploy Fleet Node
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                    </Card>

                    {/* Unified Hub */}
                    <Card className="p-10 border-2 border-primary bg-primary text-white hover:scale-105 transition-all group">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-primary">
                                <Globe size={32} />
                            </div>
                            <Badge className="bg-white text-primary border-0 font-black">Enterprise</Badge>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Unified Hub</h3>
                        <p className="text-white/80 mb-6 leading-relaxed">
                            For enterprises managing multiple locations and business types from one dashboard.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "Multi-business management",
                                "Cross-location analytics",
                                "Unified governance",
                                "Protocol-level access"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-white shrink-0" />
                                    <span className="text-sm font-medium text-white">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="https://unified.nilelink.app" target="_blank">
                            <Button className="w-full h-14 bg-white text-primary font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                                Deploy Unified Hub
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                    </Card>
                </div>

                {/* CTA Section */}
                <Card className="p-16 border-2 border-text bg-white text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                        Not Sure Which to Choose?
                    </h2>
                    <p className="text-text-primary opacity-60 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Try our demo mode to explore each node type with simulated data. No signup required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/demo">
                            <Button className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest rounded-xl">
                                Try Demo Mode
                            </Button>
                        </Link>
                        <Link href="/support">
                            <Button variant="outline" className="h-14 px-10 border-2 border-text text-text-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white">
                                Talk to Sales
                            </Button>
                        </Link>
                    </div>
                </Card>
            </main>
        </div>
    );
}

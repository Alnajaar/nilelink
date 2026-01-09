"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Store, TrendingUp, Shield, ArrowRight,
    CheckCircle, DollarSign, Users, BarChart3,
    Zap, Clock, Package, Truck
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function ForBusinessPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 mesh-bg">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <Link href="/get-started">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase tracking-widest text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        For Business Owners
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Run Your Business<br />Like A Pro
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        Everything you need to manage your restaurant, retail store, or service business.
                        No technical skills required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/get-started">
                            <Button size="lg" className="px-12 py-7 text-lg font-black rounded-2xl shadow-xl">
                                Start Free Trial
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button variant="outline" size="lg" className="px-12 py-7 text-lg font-black rounded-2xl">
                                Try Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Common Problems */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-4 italic">Running a business is hard...</h2>
                    <p className="text-center text-text opacity-40 mb-12">We've spent thousands of hours listening to owners. We know the pain.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            "Too many different apps that don't talk to each other",
                            "Expensive monthly subscriptions that eat your profit",
                            "Losing sales whenever the internet goes down",
                            "Never knowing exactly what's in stock or who's selling what"
                        ].map((problem, i) => (
                            <Card key={i} className="p-8 bg-background border-2 border-surface flex items-center gap-6">
                                <div className="text-3xl">😞</div>
                                <p className="text-lg font-bold opacity-60 leading-tight">{problem}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Solutions */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-4">The NileLink Way</Badge>
                        <h2 className="text-5xl font-black text-center italic">One Platform. Zero Stress.</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Store,
                                title: "Everything Integrated",
                                desc: "Your POS, inventory, staff, and delivery are all in one beautiful dashboard. No manual syncing."
                            },
                            {
                                icon: DollarSign,
                                title: "One Simple Price",
                                desc: "$99/month for everything. No per-user fees, no hidden costs, no surprises on your bill."
                            },
                            {
                                icon: Shield,
                                title: "Reliable, Even Offline",
                                desc: "Your business shouldn't stop because the web does. Our systems work 24/7, with or without internet."
                            }
                        ].map((item, i) => (
                            <Card key={i} className="p-10 border-2 border-primary bg-white relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <item.icon size={120} />
                                </div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8">
                                        <item.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{item.title}</h3>
                                    <p className="text-lg text-text opacity-60 leading-relaxed">{item.desc}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Use Cases */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12 italic">Built For Your Industry</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { type: "Restaurants", features: ["Floor Plans", "Kitchen Display", "QR Ordering"] },
                            { type: "Retailers", features: ["Inventory Tracking", "Barcodes", "Loyalty"] },
                            { type: "Service Pros", features: ["Bookings", "Invoicing", "Deposits"] },
                            { type: "Enterprise", features: ["Multi-Location", "Global Analytics", "SSO"] }
                        ].map((useCase, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white h-full flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-black uppercase mb-6 tracking-tighter">{useCase.type}</h4>
                                    <ul className="space-y-3">
                                        {useCase.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3">
                                                <CheckCircle size={16} className="text-primary" />
                                                <span className="text-sm font-bold opacity-60">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <Card className="p-20 border-2 border-text bg-text text-background text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-[140px]" />
                    </div>
                    <div className="relative">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
                            Experience the future<br />of your business.
                        </h2>
                        <p className="text-xl text-background opacity-60 mb-12 max-w-2xl mx-auto">
                            Join over 800+ forward-thinking business owners who have switched to NileLink this year.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/get-started">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                                    Start 90-Day Free Trial
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="h-16 px-12 border-2 border-background text-background font-black uppercase tracking-widest rounded-2xl hover:bg-background hover:text-text transition-all">
                                    Talk to Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}

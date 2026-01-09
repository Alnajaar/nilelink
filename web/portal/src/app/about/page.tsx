"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users, Target, Heart, Globe,
    ArrowRight, Zap, Shield, TrendingUp
} from 'lucide-react';
import Button from '../../../../shared/components/Button';
import Card from '../../../../shared/components/Card';
import Badge from '../../../../shared/components/Badge';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20 mesh-bg">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <Link href="/get-started">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        About NileLink
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Building The<br />Future Of Commerce
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        We're making enterprise-grade commerce infrastructure accessible to businesses of all sizes.
                    </p>
                </div>

                {/* Mission */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-primary bg-surface">
                        <div className="flex items-center gap-4 mb-6">
                            <Target size={40} className="text-primary" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Our Mission</h2>
                        </div>
                        <p className="text-xl leading-relaxed mb-6">
                            Every business deserves access to the same tools that power the world's largest companies.
                        </p>
                        <p className="text-lg text-text opacity-60 leading-relaxed">
                            NileLink was built to democratize commerce infrastructure. We believe small businesses
                            shouldn't have to choose between affordability and capability. Our platform gives you
                            enterprise features at a price that makes sense for your business.
                        </p>
                    </Card>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Trust First",
                                desc: "Your data is yours. We never sell it, share it, or use it for anything except serving you better."
                            },
                            {
                                icon: Heart,
                                title: "Human Support",
                                desc: "Real people, real help. When you need us, we're here - not a chatbot, not a FAQ, but actual humans."
                            },
                            {
                                icon: Globe,
                                title: "Open Protocol",
                                desc: "Built on open standards. Your data isn't locked in - you can export everything, anytime."
                            }
                        ].map((value, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-surface text-center">
                                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                                    <value.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-3">{value.title}</h3>
                                <p className="text-text opacity-60 leading-relaxed">{value.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-white to-surface">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: "10K+", label: "Businesses" },
                                { value: "$1.2B+", label: "Processed" },
                                { value: "99.98%", label: "Uptime" },
                                { value: "24/7", label: "Support" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-5xl font-black text-primary mb-2">{stat.value}</div>
                                    <div className="text-sm font-bold uppercase tracking-widest text-text opacity-40">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Team */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-6">Built By Experts</h2>
                    <p className="text-center text-lg text-text opacity-60 mb-12 max-w-2xl mx-auto">
                        Our team has built systems for some of the world's largest companies.
                        Now we're bringing that expertise to businesses like yours.
                    </p>
                    <Card className="p-10 border-2 border-surface bg-surface text-center">
                        <Users size={60} className="text-primary mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-4">We're Hiring!</h3>
                        <p className="text-text opacity-60 mb-6">
                            Want to help us build the future of commerce? We're looking for talented engineers,
                            designers, and support specialists.
                        </p>
                        <Link href="/support">
                            <Button className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                                View Open Positions
                            </Button>
                        </Link>
                    </Card>
                </div>

                {/* CTA */}
                <Card className="p-16 border-2 border-text bg-surface text-center">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-6">
                        Join Us
                    </h2>
                    <p className="text-xl text-text opacity-60 mb-10">
                        Thousands of businesses trust NileLink to power their operations.
                    </p>
                    <Link href="/get-started">
                        <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                            Start Your Free Trial
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </Card>
            </main>
        </div>
    );
}

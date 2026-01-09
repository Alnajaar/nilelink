"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Globe, Building2, TrendingUp, Users,
    BarChart3, Shield, Zap, ArrowRight,
    CheckCircle, Layers, Network
} from 'lucide-react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { UniversalFooter } from '@/shared/components/UniversalFooter';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function UnifiedHubLanding() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col antialiased mesh-bg relative overflow-hidden">
            <UniversalHeader
                appName="Unified Hub"
                onLogin={() => router.push('/auth/login')}
            />

            <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="info" className="mb-6 px-4 py-1.5 font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                            Multi-Business Management Platform
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-text-main leading-tight mb-8">
                            Manage Everything <br />
                            <span className="text-primary italic">From One Place</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                            The Unified Hub is your master control panel for managing multiple locations,
                            business types, and operations across the entire NileLink ecosystem.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register">
                                <Button size="lg" className="px-10 py-7 text-lg font-black rounded-2xl group shadow-xl">
                                    START FREE TRIAL
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="outline" size="lg" className="px-10 py-7 text-lg font-black rounded-2xl">
                                    VIEW DEMO DASHBOARD
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-text-subtle font-black uppercase tracking-widest mt-6 px-4 py-2 bg-secondary-soft rounded-full inline-block">
                            PERFECT FOR FRANCHISES & MULTI-LOCATION BUSINESSES
                        </p>
                    </motion.div>
                </div>

                {/* Who Is This For? */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-text-main text-center mb-12">
                        Who Is Unified Hub For?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Building2,
                                title: "Franchise Owners",
                                desc: "Manage all your franchise locations from a single dashboard. See real-time performance across every store."
                            },
                            {
                                icon: Users,
                                title: "Multi-Business Operators",
                                desc: "Run a restaurant, delivery service, and supply store? Unified Hub connects them all seamlessly."
                            },
                            {
                                icon: Network,
                                title: "Enterprise Organizations",
                                desc: "Corporate-level oversight with location-by-location drill-down. Perfect for regional managers."
                            }
                        ].map((item, idx) => (
                            <Card key={idx} className="p-8 rounded-[32px] border-border-subtle bg-white/50 backdrop-blur-sm hover:border-primary/20 transition-all hover:shadow-2xl group" padding="lg">
                                <div className="w-14 h-14 bg-background-subtle rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black text-text-main mb-3">{item.title}</h3>
                                <p className="text-text-muted text-sm leading-relaxed font-medium">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Key Features - Business Language */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-text-main text-center mb-12">
                        Everything You Need, One Dashboard
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: BarChart3,
                                title: "Unified Analytics",
                                desc: "See total revenue, best-performing locations, and trends at a glance. No more jumping between systems."
                            },
                            {
                                icon: Users,
                                title: "Team Management",
                                desc: "Manage staff across all locations. Assign roles, track performance, and control access centrally."
                            },
                            {
                                icon: Layers,
                                title: "Cross-Location Operations",
                                desc: "Transfer inventory between locations, share resources, and coordinate deliveries seamlessly."
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                desc: "Role-based access control, audit logs, and compliance reporting built-in for peace of mind."
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white hover:border-primary transition-all group">
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-text shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                        <feature.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{feature.title}</h3>
                                        <p className="text-text-muted leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Simple Pricing */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-primary bg-gradient-to-br from-white to-surface">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge className="bg-primary/10 text-primary border-0 mb-4">Enterprise Pricing</Badge>
                                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">
                                    $499<span className="text-xl font-medium">/month</span>
                                </h3>
                                <p className="text-text-muted mb-6">
                                    Unlimited locations, unlimited users, unlimited possibilities.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {[
                                        "Manage unlimited business locations",
                                        "Unlimited staff accounts",
                                        "Advanced analytics & reporting",
                                        "Priority 24/7 support",
                                        "Custom integrations available"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/auth/register">
                                    <Button className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                                        Get Started
                                        <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                </Link>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-48 h-48 bg-primary rounded-full text-white mb-6">
                                    <Globe size={80} />
                                </div>
                                <h4 className="text-2xl font-black mb-2">Enterprise-Grade Platform</h4>
                                <p className="text-text-muted">
                                    Built for businesses managing $1M+ in annual revenue
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Final CTA */}
                <Card className="p-16 border-2 border-text bg-gradient-to-br from-background to-surface relative overflow-hidden rounded-[3rem]">
                    <div className="relative text-center max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-text leading-none italic mb-6">
                            Ready to Unify <br />Your Operations?
                        </h2>
                        <p className="text-xl font-medium text-text opacity-60 leading-relaxed mb-10">
                            Join enterprise businesses running their entire operations through NileLink's Unified Hub.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/auth/register">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest text-base rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30">
                                    Start 30-Day Trial
                                    <ArrowRight className="ml-3" size={20} />
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="outline" className="h-16 px-12 border-2 border-text text-text font-black uppercase tracking-widest text-base rounded-2xl hover:bg-text hover:text-background transition-all">
                                    View Dashboard Demo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>

            <UniversalFooter />
        </div>
    );
}

"use client";

import React from 'react';
import Link from 'next/link';
import {
    Building2, Shield, Users, TrendingUp,
    ArrowRight, CheckCircle, Zap, Globe,
    BarChart3, Lock, Headphones
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function ForEnterprisePage() {
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
                    <Link href="/support">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Contact Sales
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Enterprise Solutions
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Scale Without<br />Limits
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        Enterprise-grade infrastructure for organizations managing hundreds of locations
                        and processing millions in monthly revenue.
                    </p>
                    <Link href="/support">
                        <Button size="lg" className="px-12 py-7 text-lg font-black rounded-2xl shadow-xl">
                            Schedule Demo
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Enterprise Features */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Badge className="bg-surface text-text/40 border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-4">Architecture</Badge>
                        <h2 className="text-5xl font-black text-center italic">Institutional Infrastructure</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Multi-Region Mesh",
                                desc: "Global edge-replica distribution with sub-30ms latency. Intelligent request routing and automatic failover come standard."
                            },
                            {
                                icon: Shield,
                                title: "Bank-Grade Security",
                                desc: "SOC 2 Type II compliant environment. Full SAML/SSO integration, granular RBAC, and immutable audit logs for every event."
                            },
                            {
                                icon: BarChart3,
                                title: "Global Intelligence",
                                desc: "Unified business intelligence across thousands of nodes. Real-time data aggregation with custom AI-driven forecasting engines."
                            },
                            {
                                icon: Lock,
                                title: "Data Sovereignty",
                                desc: "Full control over data residency. GDPR, HIPAA, and PCI-DSS ready with country-specific storage protocols."
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="p-12 border-2 border-primary bg-white relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <feature.icon size={120} />
                                </div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8">
                                        <feature.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{feature.title}</h3>
                                    <p className="text-lg text-text opacity-60 leading-relaxed">{feature.desc}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-white to-surface">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge className="bg-primary/10 text-primary border-0 mb-4">Custom Pricing</Badge>
                                <h3 className="text-5xl font-black uppercase tracking-tighter mb-6">
                                    Enterprise Plan
                                </h3>
                                <p className="text-lg mb-8 text-text opacity-60">
                                    Tailored to your organization's specific needs. Volume discounts available.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Unlimited locations and users",
                                        "Dedicated account manager",
                                        "24/7 priority support (SLA 99.99%)",
                                        "Custom integrations & white-labeling",
                                        "On-premise deployment options",
                                        "Advanced security & compliance"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-primary shrink-0 mt-1" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/support">
                                    <Button className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                                        Contact Sales
                                        <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                </Link>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-48 h-48 bg-primary rounded-full text-white mb-6">
                                    <Building2 size={80} />
                                </div>
                                <h4 className="text-2xl font-black mb-2">Built for Scale</h4>
                                <p className="text-text opacity-60">
                                    Trusted by enterprises processing $100M+ annually
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Support */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Enterprise Support</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Headphones,
                                title: "Dedicated Support",
                                desc: "Direct line to senior engineers, not tier-1 support"
                            },
                            {
                                icon: Users,
                                title: "Account Manager",
                                desc: "Your dedicated success partner for strategic planning"
                            },
                            {
                                icon: TrendingUp,
                                title: "Onboarding",
                                desc: "White-glove migration and training for your entire team"
                            }
                        ].map((item, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white text-center">
                                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                                    <item.icon size={28} />
                                </div>
                                <h4 className="text-lg font-black uppercase mb-3">{item.title}</h4>
                                <p className="text-sm text-text opacity-60">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <Card className="p-20 border-2 border-text bg-text text-background text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[180px]" />
                    </div>
                    <div className="relative">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
                            Redefine your<br />efficiency at scale.
                        </h2>
                        <p className="text-xl text-background opacity-60 mb-12 max-w-2xl mx-auto">
                            Join the world's most innovative organizations building on the NileLink protocol.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/support">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                                    Schedule Executive Demo
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="h-16 px-12 border-2 border-background text-background font-black uppercase tracking-widest rounded-2xl hover:bg-background hover:text-text transition-all">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}

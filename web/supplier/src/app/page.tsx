"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Package, TrendingUp, Zap, BarChart3,
    ShoppingCart, Users, Globe, ArrowRight,
    CheckCircle, Shield, Clock, Truck
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function SupplierLandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background antialiased mesh-bg relative overflow-hidden">
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="info" className="mb-6 px-4 py-1.5 font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                            B2B Supply Chain Protocol
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-text-main leading-tight mb-8">
                            Your Products, <br />
                            <span className="text-primary italic">Everywhere.</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                            Connect your inventory to the NileLink marketplace. Automate orders, manage fulfillment,
                            and scale your B2B operations with real-time supply chain intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register">
                                <Button size="lg" className="px-10 py-7 text-lg font-black rounded-2xl group shadow-xl">
                                    START FREE TRIAL
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button variant="outline" size="lg" className="px-10 py-7 text-lg font-black rounded-2xl">
                                    TRY DEMO MODE
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-text-subtle font-black uppercase tracking-widest mt-6 px-4 py-2 bg-secondary-soft rounded-full inline-block">
                            NO CREDIT CARD • 30-DAY FREE TRIAL
                        </p>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            icon: Package,
                            title: "Unified Catalog",
                            desc: "Centralize your product catalog with real-time inventory sync across all sales channels."
                        },
                        {
                            icon: ShoppingCart,
                            title: "Auto Fulfillment",
                            desc: "Orders flow directly from marketplace to your dashboard. Process, pack, and ship in minutes."
                        },
                        {
                            icon: TrendingUp,
                            title: "Smart Analytics",
                            desc: "Track demand patterns, optimize pricing, and forecast inventory needs with AI-powered insights."
                        }
                    ].map((feature, idx) => (
                        <Card key={idx} className="p-8 rounded-[32px] border-border-subtle bg-white/50 backdrop-blur-sm hover:border-primary/20 transition-all hover:shadow-2xl group" padding="lg">
                            <div className="w-14 h-14 bg-background-subtle rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black text-text-main mb-3">{feature.title}</h3>
                            <p className="text-text-muted text-sm leading-relaxed font-medium">{feature.desc}</p>
                        </Card>
                    ))}
                </div>

                {/* How It Works */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-text-main text-center mb-12">
                        How Supply Node Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Connect Inventory", desc: "Upload your product catalog or sync from existing systems", icon: Package },
                            { step: "02", title: "Set Terms", desc: "Configure pricing, minimum orders, and delivery zones", icon: Globe },
                            { step: "03", title: "Go Live", desc: "Your products appear in the NileLink marketplace instantly", icon: Zap },
                            { step: "04", title: "Fulfill Orders", desc: "Receive orders, process, and track delivery in real-time", icon: Truck }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-text mb-4 mx-auto hover:bg-primary hover:text-white transition-all">
                                    <step.icon size={28} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">{step.step}</div>
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{step.title}</h3>
                                <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <Card className="p-10 border-2 border-text bg-white shadow-2xl rounded-[3rem]">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">
                            For Wholesalers & Distributors
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Reach thousands of businesses instantly",
                                "Automate order processing and invoicing",
                                "Real-time inventory synchronization",
                                "Integrate with existing ERP systems"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                                    <span className="text-base font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-10 border-2 border-primary bg-primary text-white shadow-2xl rounded-[3rem]">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">
                            For Manufacturers
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Direct-to-business sales channel",
                                "Minimum order quantity controls",
                                "Automated production forecasting",
                                "Multi-location inventory management"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-white shrink-0 mt-0.5" />
                                    <span className="text-base font-medium">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Trust Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-8 py-6 px-10 bg-white border border-border-subtle rounded-full shadow-sm">
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-text-subtle">Secure Payments</span>
                        </div>
                        <div className="w-[1px] h-5 bg-border-subtle"></div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-text-subtle">24/7 Support</span>
                        </div>
                        <div className="w-[1px] h-5 bg-border-subtle"></div>
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-text-subtle">Real-Time Analytics</span>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <Card className="p-16 border-2 border-text bg-gradient-to-br from-background to-surface relative overflow-hidden rounded-[3rem]">
                    <div className="relative text-center max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-text leading-none italic mb-6">
                            Ready to Scale <br />Your B2B Sales?
                        </h2>
                        <p className="text-xl font-medium text-text opacity-60 leading-relaxed mb-10">
                            Join suppliers earning more with less overhead. Deploy your Supply Node today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/auth/register">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest text-base rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30">
                                    Start Free Trial
                                    <ArrowRight className="ml-3" size={20} />
                                </Button>
                            </Link>
                            <Link href="/onboarding">
                                <Button variant="outline" className="h-16 px-12 border-2 border-text text-text font-black uppercase tracking-widest text-base rounded-2xl hover:bg-text hover:text-background transition-all">
                                    Schedule Onboarding
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}

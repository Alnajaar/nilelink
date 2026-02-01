"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Package, TrendingUp, Zap, BarChart3,
    ShoppingCart, Users, Globe, ArrowRight,
    CheckCircle, Shield, Clock, Truck, Home, Building, Menu, User
} from 'lucide-react';

import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

export default function SupplierLandingPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    
    // If user is authenticated, redirect to dashboard
    useEffect(() => {
        if (!isLoading && user) {
            // Check if user has completed onboarding
            const checkOnboardingStatus = async () => {
                try {
                    const response = await fetch(`/api/onboarding/status?userId=${user.uid}`);
                    const data = await response.json();
                    
                    if (!data.completed) {
                        // If user hasn't completed onboarding, redirect to onboarding
                        router.push('/onboarding/supplier-info');
                    } else {
                        // If onboarding is complete, go to dashboard
                        router.push('/dashboard');
                    }
                } catch (error) {
                    // If there's an error checking onboarding status, go to dashboard by default
                    router.push('/dashboard');
                }
            };
            
            checkOnboardingStatus();
        }
    }, [user, isLoading, router]);
    
    // Show loading state while checking auth
    if (!isLoading && user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Redirecting...</h2>
                    <p className="text-emerald-500/60 text-xs font-bold mt-2 uppercase tracking-tighter">Welcome to your dashboard</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background antialiased bg-mesh-primary relative overflow-hidden">
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="info" className="mb-6 px-4 py-1.5 font-black uppercase tracking-widest bg-gradient-to-r from-primary/10 to-green-500/10 text-primary border border-primary/20 shadow-md">
                            B2B Supply Chain Protocol
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-main to-primary leading-tight mb-8">
                            Your Products, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-500 italic">Everywhere.</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                            Connect your inventory to the NileLink marketplace. Automate orders, manage fulfillment,
                            and scale your B2B operations with real-time supply chain intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register">
                                <Button size="lg" className="px-10 py-7 text-lg font-black rounded-2xl group shadow-xl bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 transition-all duration-300 transform hover:scale-105">
                                    START FREE TRIAL
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/onboarding/supplier-info">
                                <Button size="lg" variant="outline" className="px-10 py-7 text-lg font-black rounded-2xl border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105">
                                    COMPLETE ONBOARDING
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button variant="outline" size="lg" className="px-10 py-7 text-lg font-black rounded-2xl border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105">
                                    TRY DEMO MODE
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-text-subtle font-black uppercase tracking-widest mt-6 px-4 py-2 bg-gradient-to-r from-primary/5 to-green-500/5 rounded-full inline-block border border-primary/10">
                            NO CREDIT CARD • 30-DAY FREE TRIAL
                        </p>
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[{
                            icon: Package,
                            title: "Unified Catalog",
                            desc: "Centralize your product catalog with real-time inventory sync across all sales channels.",
                            link: "/catalog"
                        },
                        {
                            icon: ShoppingCart,
                            title: "Auto Fulfillment",
                            desc: "Orders flow directly from marketplace to your dashboard. Process, pack, and ship in minutes.",
                            link: "/orders"
                        },
                        {
                            icon: TrendingUp,
                            title: "Smart Analytics",
                            desc: "Track demand patterns, optimize pricing, and forecast inventory needs with AI-powered insights.",
                            link: "/analytics"
                        }
                    ].map((feature, idx) => (
                        <Link href={feature.link} key={idx}>
                            <Card key={`card-${idx}`} className="p-8 rounded-[32px] border-border-subtle bg-white/50 backdrop-blur-sm hover:border-primary/20 transition-all hover:shadow-2xl group cursor-pointer hover:transform hover:scale-105 duration-300">
                                <div className="w-14 h-14 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-green-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black text-text-main mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-text-muted text-sm leading-relaxed font-medium group-hover:text-text-main transition-colors">{feature.desc}</p>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* How It Works */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-main to-primary text-center mb-12">
                        How Supply Node Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[{
                            step: "01", title: "Connect Inventory", desc: "Upload your product catalog or sync from existing systems", icon: Package, link: "/inventory"
                        },
                        { step: "02", title: "Set Terms", desc: "Configure pricing, minimum orders, and delivery zones", icon: Globe, link: "/settings" },
                        { step: "03", title: "Go Live", desc: "Your products appear in the NileLink marketplace instantly", icon: Zap, link: "/catalog" },
                        { step: "04", title: "Fulfill Orders", desc: "Receive orders, process, and track delivery in real-time", icon: Truck, link: "/orders" }
                        ].map((step, i) => (
                            <Link href={step.link} key={i}>
                                <div key={`step-${i}`} className="text-center p-4 rounded-2xl hover:bg-gradient-to-br hover:from-primary/5 hover:to-green-500/5 transition-all duration-300 cursor-pointer">
                                    <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto hover:bg-gradient-to-r hover:from-primary hover:to-green-500 hover:text-white transition-all duration-300">
                                        <step.icon size={28} />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">{step.step}</div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter mb-2 text-text-main hover:text-primary transition-colors">{step.title}</h3>
                                    <p className="text-sm text-text-muted leading-relaxed hover:text-text-main transition-colors">{step.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <Card className="p-10 border-2 border-primary/30 bg-white/80 backdrop-blur-sm shadow-xl rounded-[3rem] hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 text-text-main">
                            For Wholesalers & Distributors
                        </h3>
                        <ul className="space-y-4">
                            {["Reach thousands of businesses instantly",
                                "Automate order processing and invoicing",
                                "Real-time inventory synchronization",
                                "Integrate with existing ERP systems"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5 flex-shrink-0" />
                                    <span className="text-base font-medium text-text-main">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-10 border-2 border-primary bg-gradient-to-br from-primary to-green-500 text-white shadow-xl rounded-[3rem] hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 text-white">
                            For Manufacturers
                        </h3>
                        <ul className="space-y-4">
                            {["Direct-to-business sales channel",
                                "Minimum order quantity controls",
                                "Automated production forecasting",
                                "Multi-location inventory management"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-white shrink-0 mt-0.5 flex-shrink-0" />
                                    <span className="text-base font-medium text-white">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Trust Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-8 py-6 px-10 bg-gradient-to-r from-primary/5 to-green-500/5 border border-primary/20 rounded-full shadow-lg backdrop-blur-sm">
                        <Link href="/security">
                            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                                <Shield size={18} className="text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-text-subtle hover:text-primary">Secure Payments</span>
                            </div>
                        </Link>
                        <div className="w-[1px] h-5 bg-primary/20"></div>
                        <Link href="/support">
                            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                                <Clock size={18} className="text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-text-subtle hover:text-primary">24/7 Support</span>
                            </div>
                        </Link>
                        <div className="w-[1px] h-5 bg-primary/20"></div>
                        <Link href="/analytics">
                            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                                <BarChart3 size={18} className="text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-text-subtle hover:text-primary">Real-Time Analytics</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Final CTA */}
                <Card className="p-16 border-2 border-primary/30 bg-gradient-to-br from-background to-surface relative overflow-hidden rounded-[3rem] shadow-2xl">
                    <div className="relative text-center max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-text-main to-primary leading-none italic mb-6">
                            Ready to Scale <br />Your B2B Sales?
                        </h2>
                        <p className="text-xl font-medium text-text-main opacity-80 leading-relaxed mb-10">
                            Join suppliers earning more with less overhead. Deploy your Supply Node today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/auth/register">
                                <Button className="h-16 px-12 bg-gradient-to-r from-primary to-green-500 text-background font-black uppercase tracking-widest text-base rounded-2xl hover:from-primary/90 hover:to-green-500/90 transition-all shadow-2xl shadow-primary/30 transform hover:scale-105 duration-300">
                                    Start Free Trial
                                    <ArrowRight className="ml-3" size={20} />
                                </Button>
                            </Link>
                            <Link href="/onboarding">
                                <Button variant="outline" className="h-16 px-12 border-2 border-primary text-primary font-black uppercase tracking-widest text-base rounded-2xl hover:bg-primary hover:text-background transition-all transform hover:scale-105 duration-300">
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

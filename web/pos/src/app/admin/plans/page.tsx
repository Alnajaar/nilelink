"use client";

import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Shield,
    Zap,
    Globe,
    CreditCard,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PlansPage() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState('pro_trial'); // 'basic', 'pro', 'enterprise'
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const plans = [
        {
            id: 'basic',
            name: 'Starter',
            description: 'For solo entrepreneurs and small pop-ups.',
            price: { monthly: 29, yearly: 24 },
            features: [
                '1 POS Terminal Limit',
                'Basic Reporting',
                'Email Support',
                '1,000 Transactions/mo'
            ],
            missing: [
                'Inventory Sync',
                'Staff Management',
                'API Access',
                'Delivery Integration'
            ],
            color: 'border-border-subtle',
            buttonColor: 'bg-white text-text-main border-border-subtle hover:bg-background-subtle'
        },
        {
            id: 'pro',
            name: 'Growth',
            description: 'For growing businesses with staff and inventory.',
            price: { monthly: 79, yearly: 65 },
            features: [
                'Unlimited Terminals',
                'Advanced Analytics',
                'Staff Roles & Shifts',
                'Inventory Management',
                'Kitchen Display System',
                '24/7 Priority Support'
            ],
            missing: [
                'Custom Smart Contracts',
                'Dedicated Account Manager'
            ],
            color: 'border-primary shadow-2xl shadow-primary/10 scale-105 z-10',
            buttonColor: 'bg-secondary text-white hover:bg-primary/90',
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Protocol',
            description: 'For franchises and high-volume networks.',
            price: { monthly: 199, yearly: 165 },
            features: [
                'Everything in Growth',
                'Multi-Branch Sync',
                'Custom API & Webhooks',
                'White-label Options',
                'On-chain Governance',
                'Dedicated Success Manager'
            ],
            missing: [],
            color: 'border-purple-500/30 bg-purple-50/50',
            buttonColor: 'bg-purple-600 text-white hover:bg-purple-700'
        }
    ];

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="max-w-7xl mx-auto mb-12 flex flex-col items-center text-center">
                <Button variant="ghost" className="self-start mb-8" onClick={() => router.back()}>
                    <ArrowLeft size={20} className="mr-2" /> Back to Admin
                </Button>

                <Badge variant="info" className="mb-6 px-4 py-2 text-primary bg-primary/5 border-primary/20 font-black tracking-widest uppercase">
                    Upgrade Your Power
                </Badge>
                <h1 className="text-5xl font-black text-text-main mb-6 tracking-tight">
                    Scale with the <span className="text-primary">Economic OS</span>
                </h1>
                <p className="text-xl text-text-muted max-w-2xl leading-relaxed">
                    Choose a plan that fits your transaction volume. All plans are secured by the NileLink Protocol with cryptographic immutability.
                </p>

                <div className="mt-12 flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-border-subtle shadow-sm">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        Yearly <span className="text-[10px] opacity-70 ml-1">(SAVE 20%)</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        whileHover={{ y: -10 }}
                        className={`bg-white rounded-[40px] p-8 border-2 transition-all flex flex-col relative ${plan.color}`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs shadow-xl">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-text-main uppercase tracking-tight mb-2">{plan.name}</h3>
                            <p className="text-sm font-medium text-text-muted leading-relaxed h-[40px]">{plan.description}</p>
                        </div>

                        <div className="mb-8 flex items-end gap-2">
                            <span className="text-5xl font-black text-text-main tracking-tighter">
                                ${plan.price[billingCycle]}
                            </span>
                            <span className="text-text-muted font-bold mb-1.5">/ mo</span>
                        </div>

                        <Button
                            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-sm mb-8 border-2 border-transparent transition-all shadow-lg ${plan.buttonColor}`}
                        >
                            {currentPlan.includes(plan.id) ? 'Current Plan' : 'Select Plan'}
                        </Button>

                        <div className="space-y-4 flex-1">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-success shrink-0" />
                                    <span className="text-sm font-bold text-text-main">{feature}</span>
                                </div>
                            ))}
                            {plan.missing.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 opacity-40">
                                    <XCircle size={18} className="text-text-muted shrink-0" />
                                    <span className="text-sm font-bold text-text-muted">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-20 p-12 bg-secondary rounded-[48px] relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield size={24} className="text-emerald-400" />
                        <span className="font-black uppercase tracking-widest text-emerald-400">Enterprise Security</span>
                    </div>
                    <h2 className="text-4xl font-black mb-6">Need Custom Infrastructure?</h2>
                    <p className="text-emerald-100/70 text-lg leading-relaxed mb-8">
                        For national chains and government deployments, we offer dedicated nodes, custom smart contract auditing, and on-site hardware installation.
                    </p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-primary font-black px-8">
                        CONTACT SALES
                    </Button>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/10 w-full md:w-auto min-w-[300px]">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <Zap size={24} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-black uppercase text-sm">Priority Status</p>
                            <p className="text-xs text-emerald-200 uppercase tracking-widest">24/7 Access</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-emerald-400"></div>
                        </div>
                        <p className="text-xs font-mono text-emerald-200">
                            Node Capacity: Optimized
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import GlobalNavbar from '@shared/components/GlobalNavbar';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import { DeepSpaceBackground } from '@shared/components/DeepSpaceBackground';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: '9',
        yearlyPrice: '90',
        desc: 'Perfect for small shops, kiosks, and single-node operations.',
        features: [
            '1 POS Terminal',
            '3 Staff Accounts',
            'Basic Inventory',
            'Sales Reports',
            'Email Support'
        ],
        color: 'from-blue-500/20 to-blue-600/5',
        border: 'border-blue-500/30',
        accent: 'text-blue-400'
    },
    {
        id: 'business',
        name: 'Business',
        price: '19',
        yearlyPrice: '190',
        desc: 'The best value for cafés, restaurants, and growing teams.',
        features: [
            '5 POS Terminals',
            '10 Staff Accounts',
            'Full Inventory System',
            'Basic AI Assistant',
            'Role Management',
            'Priority Support'
        ],
        popular: true,
        color: 'from-pos-accent/20 to-pos-accent/5',
        border: 'border-pos-accent/40',
        accent: 'text-pos-accent'
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '39',
        yearlyPrice: '390',
        desc: 'Powerhouse features for large venues and supermarkets.',
        features: [
            'Unlimited Terminals',
            'Unlimited Staff',
            'Advanced AI & Payroll',
            'Supplier Management',
            'Security Module',
            'Profit Optimization'
        ],
        color: 'from-purple-500/20 to-purple-600/5',
        border: 'border-purple-500/30',
        accent: 'text-purple-400'
    }
];

export default function PricingPage() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly');

    return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col selection:bg-pos-accent/30 overflow-x-hidden">
            <GlobalNavbar context="pos" variant="transparent" />

            {/* Deep Space Background */}
            <DeepSpaceBackground />

            <main className="flex-1 relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-24 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-pos-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Transparent Economics</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black italic tracking-tightest uppercase leading-none"
                        >
                            Scale your <span className="text-pos-accent">Sovereignty.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
                        >
                            Choose the protocol tier that aligns with your business velocity.
                            No hidden fees, no settlement delays, just pure performance.
                        </motion.p>

                        {/* Toggle */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-center mt-8"
                        >
                            <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-pos-accent text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Yearly <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded text-black font-bold border border-black/10">-17%</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i + 0.3 }}
                                className={`relative p-8 md:p-12 rounded-[3rem] border ${plan.border} bg-gradient-to-b ${plan.color} backdrop-blur-3xl group hover:scale-[1.02] transition-all flex flex-col`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-pos-accent rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                        <span className="text-black text-[9px] font-black uppercase tracking-[0.2em]">Institutional Choice</span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight italic text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm font-medium">{plan.desc}</p>
                                </div>

                                <div className="mb-12 flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-black italic tracking-tightest leading-none">$</span>
                                    <span className="text-6xl md:text-7xl font-black italic tracking-tightest leading-none">
                                        {billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                                    </span>
                                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>

                                <div className="flex-1 space-y-5 mb-12">
                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <Check size={16} className={plan.accent} />
                                            </div>
                                            <span className="text-gray-300 text-sm font-medium leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => router.push('/auth/register')}
                                    className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${plan.popular
                                        ? 'bg-white text-black hover:bg-pos-accent hover:scale-105'
                                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                        }`}
                                >
                                    Initialize {plan.id === 'starter' ? 'Node' : 'Empire'}
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQ Mini */}
                    <div className="mt-32 pt-24 border-t border-white/5 space-y-12">
                        <h2 className="text-2xl font-black uppercase italic tracking-widest text-center">Frequently Asked</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                            <div className="space-y-4">
                                <h4 className="font-bold text-pos-accent uppercase tracking-widest text-xs">Is there a setup fee?</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">No. NileLink is an open protocol. You only pay for the service tier you utilize. Terminal setup and onboarding are completely covered.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-pos-accent uppercase tracking-widest text-xs">Can I upgrade later?</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">Absolutely. Your business node can scale up to the Growth or Protocol tiers instantly from your control panel without data loss.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <UniversalFooter />
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Check,
    X,
    ArrowRight,
    Star,
    CreditCard,
    Shield,
    Zap,
    Globe,
    Users,
    TrendingUp
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';

export default function PricingPage() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'standard' | 'enterprise'>('free');

    const plans = [
        {
            id: 'starter-supplier' as const,
            name: 'Starter (Vendor Tier)',
            price: 50,
            period: 'yearly',
            description: '1 Location. Supplier Network Mandatory.',
            features: [
                'Full POS Core Protocol',
                'Supplier Network Sync',
                'Inventory Management',
                '3 Months Free Trial'
            ],
            limitations: [
                'No Delivery Services',
                'No Customer App',
                'No Investor Platform'
            ],
            popular: false,
            cta: 'Join Supplier Tier',
            note: 'Software Only - No Hardware Included'
        },
        {
            id: 'starter-pos' as const,
            name: 'Starter (Independent)',
            price: 150,
            period: 'yearly',
            description: '1 Location. Independent Operation.',
            features: [
                'Full POS Core Protocol',
                'Standard Reporting',
                'Standard Compliance',
                '3 Months Free Trial'
            ],
            limitations: [
                'No Supplier Network',
                'No Delivery Services',
                'No Customer App'
            ],
            popular: false,
            cta: 'Initialize POS',
            note: 'Software Only - No Hardware Included'
        },
        {
            id: 'ultimate-single' as const,
            name: 'Ultimate Single',
            price: 200,
            period: 'yearly',
            description: '1 Location. Complete System Access.',
            features: [
                'All Feature Tokens Unlocked',
                'Delivery Fleet Protocol',
                'Customer Relationship App',
                'Investor Dashboard',
                'Supplier Hub Access'
            ],
            limitations: [
                'Single Branch Only'
            ],
            popular: true,
            cta: 'Deploy Ultimate',
            note: 'Software Only - No Hardware Included'
        },
        {
            id: 'enterprise-duo' as const,
            name: 'Enterprise Duo',
            price: 300,
            period: 'yearly',
            description: '2 Locations. Full Ecosystem Sync.',
            features: [
                'Multi-Node Consensus (2)',
                'Full Systems Access',
                'Centralized Management',
                'Advanced Neural Analytics'
            ],
            limitations: [],
            popular: false,
            cta: 'Enable Dual Node',
            note: 'Software Only - No Hardware Included'
        },
        {
            id: 'global-network' as const,
            name: 'Global Network',
            price: 500,
            period: 'yearly',
            description: '3+ Locations. Unlimited Scale.',
            features: [
                'Unlimited Node Deployment',
                'Enterprise Scale Protocol',
                'Infinite Growth Buffer',
                'White-glove Neural Support'
            ],
            limitations: [],
            popular: false,
            cta: 'Scale Globe',
            note: 'Software Only - No Hardware Included'
        }
    ];

    const handlePlanSelect = (planId: string) => {
        // Map custom plan IDs to standard plan types
        const planMapping: Record<string, 'free' | 'standard' | 'enterprise'> = {
            'starter-supplier': 'free',
            'starter-pos': 'standard',
            'ultimate-single': 'enterprise',
            'enterprise-duo': 'enterprise',
            'global-network': 'enterprise'
        };

        const standardPlanId = planMapping[planId] || 'free';
        setSelectedPlan(standardPlanId);
        // In a real implementation, this would navigate to onboarding
        router.push(`/auth/register?plan=${standardPlanId}`);
    };

    return (
        <div className="min-h-screen bg-neutral">
            {/* Header */}
            <header className="border-b border-text/5 bg-neutral/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
                        <Link href="/docs" className="hover:opacity-100 transition-opacity">Protocol</Link>
                        <Link href="/status" className="hover:opacity-100 transition-opacity">Network Status</Link>
                        <Link href="/governance" className="hover:opacity-100 transition-opacity">Governance</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-6 max-w-7xl mx-auto text-center">
                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-sm uppercase tracking-widest mb-8">
                    Choose Your Plan
                </Badge>
                <h1 className="text-6xl font-black text-text-primary mb-6 leading-tight">
                    Start Your NileLink
                    <span className="block text-primary">Business Journey</span>
                </h1>
                <p className="text-xl text-text-primary opacity-60 max-w-2xl mx-auto">
                    Transparent pricing designed for businesses of all sizes. No hidden fees, no surprises.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative p-8 rounded-3xl border-2 transition-all ${plan.popular
                                ? 'border-primary bg-primary/5 shadow-2xl'
                                : 'border-border-subtle bg-white hover:border-primary/40'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-primary text-white border-0 font-black px-4 py-1">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-text-primary mb-2">{plan.name}</h3>
                                <p className="text-text-primary opacity-60 mb-4">{plan.description}</p>

                                <div className="mb-4">
                                    {plan.price === 0 ? (
                                        <div className="text-4xl font-black text-primary">Free</div>
                                    ) : (
                                        <div className="text-4xl font-black text-primary">
                                            ${plan.price}
                                            <span className="text-lg font-medium text-text-primary opacity-60">/{plan.period}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check size={16} className="text-primary flex-shrink-0" />
                                        <span className="text-sm text-text-primary">{feature}</span>
                                    </div>
                                ))}

                                {plan.limitations.map((limitation, i) => (
                                    <div key={i} className="flex items-center gap-3 opacity-60">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <span className="text-sm text-text-primary">{limitation}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 text-center">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{plan.note}</p>
                                <p className="text-[11px] font-bold text-zinc-400 mt-1 italic">برنامج فقط - لا يشمل الأجهزة</p>
                            </div>

                            <Button
                                onClick={() => handlePlanSelect(plan.id)}
                                className={`w-full h-12 font-black uppercase tracking-widest text-sm ${plan.popular
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-primary text-white hover:bg-primary'
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    ))}
                </div>
            </section >

            {/* Features Comparison */}
            < section className="py-20 px-6 max-w-7xl mx-auto" >
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-text-primary mb-4">Why Choose NileLink?</h2>
                    <p className="text-xl text-text-primary opacity-60">Built for the future of commerce</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: Shield,
                            title: 'Bank-Grade Security',
                            description: 'Military-grade encryption and compliance standards'
                        },
                        {
                            icon: Globe,
                            title: 'Global Infrastructure',
                            description: 'Distributed network spanning 50+ countries'
                        },
                        {
                            icon: Zap,
                            title: 'Lightning Fast',
                            description: 'Sub-second transaction processing worldwide'
                        },
                        {
                            icon: TrendingUp,
                            title: 'Scalable Growth',
                            description: 'From startup to enterprise, we grow with you'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="text-center p-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <feature.icon size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-text-primary mb-2">{feature.title}</h3>
                            <p className="text-text-primary opacity-60">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section >

            {/* FAQ Section */}
            < section className="py-20 px-6 max-w-4xl mx-auto" >
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-text-primary mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-8">
                    {[
                        {
                            q: 'Can I change plans later?',
                            a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                        },
                        {
                            q: 'What payment methods do you accept?',
                            a: 'We accept all major credit cards, bank transfers, and cryptocurrency payments.'
                        },
                        {
                            q: 'Is there a setup fee?',
                            a: 'No setup fees for any of our plans. You only pay the monthly subscription.'
                        },
                        {
                            q: 'Can I cancel anytime?',
                            a: 'Yes, you can cancel your subscription at any time. No long-term contracts.'
                        }
                    ].map((faq, i) => (
                        <div key={i} className="border-b border-border-subtle pb-8">
                            <h3 className="text-xl font-bold text-text-primary mb-4">{faq.q}</h3>
                            <p className="text-text-primary opacity-80">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-20 px-6 max-w-4xl mx-auto text-center" >
                <div className="bg-gradient-to-br from-neutral to-white p-12 rounded-3xl border-2 border-text">
                    <h2 className="text-4xl font-black text-text-primary mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-text-primary opacity-60 mb-8">
                        Join thousands of businesses already using NileLink
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handlePlanSelect('free')}
                            className="h-14 px-8 bg-primary text-white font-black uppercase tracking-widest"
                        >
                            Start Free Trial
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/contact')}
                            className="h-14 px-8 border-2 border-text text-text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-white"
                        >
                            Contact Sales
                        </Button>
                    </div>
                </div>
            </section >
        </div >
    );
}

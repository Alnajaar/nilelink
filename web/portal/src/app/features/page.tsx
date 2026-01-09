'use client';

import React from 'react';
import Link from 'next/link';
import {
    Zap, Shield, Globe, Smartphone,
    CreditCard, BarChart3, Users, Lock,
    ArrowRight, CheckCircle, Star,
    TrendingUp, Clock, Target, X
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';

const featureCategories = [
    {
        title: 'Core Protocol',
        icon: Zap,
        description: 'High-frequency commerce infrastructure',
        features: [
            {
                icon: TrendingUp,
                title: 'Sub-Second Transactions',
                description: 'Lightning-fast settlement with guaranteed finality',
                details: 'Process thousands of transactions per second with cryptographic proof'
            },
            {
                icon: Globe,
                title: 'Global Network',
                description: 'Distributed infrastructure spanning 50+ countries',
                details: 'Redundant nodes ensure 99.98% uptime with automatic failover'
            },
            {
                icon: Shield,
                title: 'Military-Grade Security',
                description: 'Bank-level encryption and security standards',
                details: 'AES-256 encryption, multi-signature validation, and zero-trust architecture'
            }
        ]
    },
    {
        title: 'Business Tools',
        icon: CreditCard,
        description: 'Complete commerce management suite',
        features: [
            {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Advanced reporting and business intelligence',
                details: 'AI-powered insights, custom dashboards, and predictive analytics'
            },
            {
                icon: Users,
                title: 'Staff Management',
                description: 'Comprehensive employee and role management',
                details: 'Permission-based access, time tracking, and payroll integration'
            },
            {
                icon: Target,
                title: 'Inventory Control',
                description: 'Smart inventory management and optimization',
                details: 'Automated reordering, waste reduction, and demand forecasting'
            }
        ]
    },
    {
        title: 'Developer Platform',
        icon: Smartphone,
        description: 'Extensible platform for custom solutions',
        features: [
            {
                icon: Lock,
                title: 'REST & GraphQL APIs',
                description: 'Comprehensive APIs for full platform integration',
                details: 'Webhook support, real-time subscriptions, and SDK libraries'
            },
            {
                icon: Globe,
                title: 'White-Label Solutions',
                description: 'Fully customizable commerce solutions',
                details: 'Branded interfaces, custom workflows, and API-first architecture'
            },
            {
                icon: Star,
                title: 'Open Protocol',
                description: 'Transparent, open-source protocol standards',
                details: 'Community governance, open specifications, and interoperability'
            }
        ]
    }
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'CEO, Downtown Bistro',
        company: 'Downtown Bistro',
        content: 'NileLink transformed our operations. We went from manual processes to a fully automated system in weeks.',
        metrics: ['40% faster service', '25% cost reduction', '99.9% system uptime']
    },
    {
        name: 'Marcus Chen',
        role: 'CTO, Urban Eats Chain',
        company: 'Urban Eats',
        content: 'The analytics and reporting capabilities are incredible. We can now make data-driven decisions in real-time.',
        metrics: ['50+ locations managed', '10K+ daily transactions', 'Real-time insights']
    },
    {
        name: 'Elena Rodriguez',
        role: 'Operations Manager, Fresh Market',
        company: 'Fresh Market',
        content: 'Inventory management was our biggest challenge. NileLink solved it completely with predictive ordering.',
        metrics: ['30% less waste', '20% better margins', 'Zero stockouts']
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-neutral/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary shadow-2xl">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                        </Link>
                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
                            <Link href="/docs" className="hover:opacity-100 transition-opacity">Protocol</Link>
                            <Link href="/status" className="hover:opacity-100 transition-opacity">Network Status</Link>
                            <Link href="/governance" className="hover:opacity-100 transition-opacity">Governance</Link>
                        </div>
                    </div>
                    <Link href="/get-started">
                        <Button className="h-12 px-8 bg-primary text-white font-black uppercase text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Platform Features
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Everything You Need<br />to Scale Commerce
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text-primary opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Enterprise-grade features in a developer-friendly platform. Built for businesses that demand the best.
                    </p>
                </div>

                {/* Feature Categories */}
                <div className="space-y-20 mb-20">
                    {featureCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                            <div className="text-center mb-12">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <category.icon size={40} className="text-primary" />
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-text-primary mb-4">
                                    {category.title}
                                </h2>
                                <p className="text-xl text-text-primary opacity-60 max-w-2xl mx-auto">
                                    {category.description}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {category.features.map((feature, featureIndex) => (
                                    <Card key={featureIndex} className="p-8 border-2 border-border-subtle bg-white hover:border-primary transition-all group h-full">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                            <feature.icon size={28} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-lg text-text-primary opacity-80 mb-6 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <p className="text-sm text-text-primary opacity-60 leading-relaxed">
                                            {feature.details}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Integration Showcase */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-neutral to-white">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text-primary mb-4">
                                Seamless Integrations
                            </h2>
                            <p className="text-xl text-text-primary opacity-60 max-w-2xl mx-auto">
                                Connect with your favorite tools and services. NileLink integrates everywhere you do business.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {[
                                'Stripe', 'Square', 'QuickBooks', 'Xero', 'Slack', 'Zapier',
                                'Shopify', 'WooCommerce', 'Square', 'Toast', 'Lightspeed', 'Clover'
                            ].map((integration, i) => (
                                <div key={i} className="text-center p-6 bg-white border-2 border-border-subtle rounded-2xl hover:border-primary transition-all">
                                    <div className="text-lg font-black uppercase tracking-widest opacity-60">
                                        {integration}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link href="/docs/integrations">
                                <Button className="h-14 px-10 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all">
                                    View All Integrations
                                    <ArrowRight className="ml-2" size={18} />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Testimonials */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Trusted by Businesses Worldwide</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <Card key={i} className="p-8 border-2 border-border-subtle bg-white">
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={16} className="text-primary fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-lg text-text-primary opacity-80 mb-6 italic leading-relaxed">
                                    "{testimonial.content}"
                                </blockquote>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {testimonial.metrics.map((metric, j) => (
                                        <Badge key={j} className="bg-primary/10 text-primary border-0 font-black px-2 py-1 text-[8px] uppercase tracking-widest">
                                            {metric}
                                        </Badge>
                                    ))}
                                </div>
                                <div>
                                    <div className="font-black uppercase tracking-widest text-sm">{testimonial.name}</div>
                                    <div className="text-sm text-text-primary opacity-60">{testimonial.role}</div>
                                    <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Feature Comparison */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Complete Feature Comparison</h2>
                    <Card className="p-8 border-2 border-border-subtle bg-white overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-text/10">
                                        <th className="text-left p-4 font-black uppercase tracking-widest text-sm">Feature</th>
                                        <th className="text-center p-4 font-black uppercase tracking-widest text-sm">Free</th>
                                        <th className="text-center p-4 font-black uppercase tracking-widest text-sm">Standard</th>
                                        <th className="text-center p-4 font-black uppercase tracking-widest text-sm">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feature: 'POS Terminals', free: '3', standard: '5', enterprise: 'Unlimited' },
                                        { feature: 'Transaction Processing', free: '100/month', standard: 'Unlimited', enterprise: 'Unlimited' },
                                        { feature: 'Analytics Dashboard', free: 'Basic', standard: 'Advanced', enterprise: 'AI-Powered' },
                                        { feature: 'API Access', free: 'No', standard: 'Limited', enterprise: 'Full' },
                                        { feature: 'White-label Options', free: 'No', standard: 'No', enterprise: 'Yes' },
                                        { feature: '24/7 Support', free: 'No', standard: 'No', enterprise: 'Yes' }
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-text/5">
                                            <td className="p-4 font-medium">{row.feature}</td>
                                            <td className="p-4 text-center">
                                                {row.free === 'No' ? (
                                                    <X size={16} className="text-red-500 mx-auto" />
                                                ) : (
                                                    <span className="font-mono text-sm">{row.free}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-mono text-sm">{row.standard}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <CheckCircle size={16} className="text-primary mx-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Card className="p-16 border-2 border-primary bg-primary text-white">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                            Ready to Experience<br />All Features?
                        </h2>
                        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                            Start your free trial today and see how NileLink can transform your business operations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/get-started">
                                <Button className="h-16 px-12 bg-neutral text-primary hover:scale-105 font-black uppercase tracking-widest text-lg rounded-2xl transition-all">
                                    Start Free Trial
                                    <ArrowRight className="ml-3" size={20} />
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button className="h-16 px-12 bg-neutral/20 text-white hover:bg-neutral/30 border-2 border-background/30 font-black uppercase tracking-widest text-lg rounded-2xl transition-all">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

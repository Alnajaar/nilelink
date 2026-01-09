'use client';

import React from 'react';
import Link from 'next/link';
import {
    Shield, Lock, Eye, CheckCircle,
    AlertTriangle, FileText, Users,
    Zap, Globe, ArrowRight
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';

const securityFeatures = [
    {
        icon: Lock,
        title: 'Military-Grade Encryption',
        description: 'All data encrypted with AES-256-GCM. Private keys never leave your device.',
        details: 'Zero-knowledge architecture ensures NileLink never sees your transaction data.'
    },
    {
        icon: Shield,
        title: 'Smart Contract Audits',
        description: 'Comprehensive security audits by leading blockchain security firms.',
        details: 'Regular audits, bug bounties, and formal verification of critical components.'
    },
    {
        icon: Eye,
        title: 'Transparency by Design',
        description: 'Open-source protocol with public transaction ledger and governance.',
        details: 'All transactions verifiable on-chain. Community oversight of protocol upgrades.'
    },
    {
        icon: Globe,
        title: 'Decentralized Infrastructure',
        description: 'No single point of failure. Distributed network across global nodes.',
        details: 'Multi-region deployment with automatic failover and load balancing.'
    }
];

const complianceStandards = [
    { name: 'SOC 2 Type II', status: 'Certified', icon: CheckCircle },
    { name: 'ISO 27001', status: 'Compliant', icon: CheckCircle },
    { name: 'PCI DSS', status: 'Level 1', icon: CheckCircle },
    { name: 'GDPR', status: 'Compliant', icon: CheckCircle },
    { name: 'CCPA', status: 'Compliant', icon: CheckCircle }
];

const recentAudits = [
    {
        firm: 'Trail of Bits',
        date: 'December 2025',
        scope: 'Core Protocol Contracts',
        status: 'Passed',
        findings: '0 Critical, 0 High, 2 Medium'
    },
    {
        firm: 'OpenZeppelin',
        date: 'November 2025',
        scope: 'Settlement Engine',
        status: 'Passed',
        findings: '0 Critical, 0 High, 1 Medium'
    },
    {
        firm: 'Certik',
        date: 'October 2025',
        scope: 'Mobile Applications',
        status: 'Passed',
        findings: '0 Critical, 0 High, 0 Medium'
    }
];

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                                <Shield size={24} fill="currentColor" />
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
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Bank-Grade Security
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Security First<br />Architecture
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Enterprise-grade security built into every layer of the NileLink Protocol. Your data, your control.
                    </p>
                </div>

                {/* Security Features */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Security by Design</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {securityFeatures.map((feature, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white hover:border-primary transition-all group">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                                        <feature.icon size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-lg text-text opacity-80 mb-4 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <p className="text-sm text-text opacity-60 leading-relaxed">
                                            {feature.details}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Compliance Standards */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-background to-surface">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-4">
                                Compliance & Certifications
                            </h2>
                            <p className="text-xl text-text opacity-60 max-w-2xl mx-auto">
                                Meeting and exceeding industry standards for security and data protection.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {complianceStandards.map((standard, i) => (
                                <div key={i} className="text-center p-6 bg-white border-2 border-surface rounded-2xl">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <standard.icon size={24} className="text-emerald-500" />
                                    </div>
                                    <h3 className="font-black uppercase tracking-widest text-sm mb-2">{standard.name}</h3>
                                    <Badge className="bg-emerald-500 text-white border-0 font-black px-2 py-1 text-[8px] uppercase tracking-widest">
                                        {standard.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Security Audits */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Independent Security Audits</h2>
                    <div className="space-y-6">
                        {recentAudits.map((audit, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">{audit.firm}</h3>
                                            <Badge className="bg-emerald-500 text-white border-0 font-black px-3 py-1 text-[8px] uppercase tracking-widest">
                                                {audit.status}
                                            </Badge>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-6 text-sm opacity-70">
                                            <div>
                                                <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Date</span>
                                                <span>{audit.date}</span>
                                            </div>
                                            <div>
                                                <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Scope</span>
                                                <span>{audit.scope}</span>
                                            </div>
                                            <div>
                                                <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Findings</span>
                                                <span>{audit.findings}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:flex-shrink-0">
                                        <Link href={`/security/audits/${audit.firm.toLowerCase().replace(' ', '-')}`}>
                                            <Button variant="outline" className="h-12 px-6 border-2 border-surface text-text font-black uppercase tracking-widest text-sm rounded-xl hover:border-primary transition-all">
                                                View Report
                                                <ArrowRight className="ml-2" size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Bug Bounty Program */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-primary bg-primary text-background">
                        <div className="text-center mb-8">
                            <AlertTriangle size={48} className="text-background mx-auto mb-6" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                                Bug Bounty Program
                            </h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                Help us keep NileLink secure. Earn up to $100,000 for critical vulnerabilities.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            {[
                                { label: 'Critical Bugs', amount: '$50K - $100K' },
                                { label: 'High Severity', amount: '$10K - $25K' },
                                { label: 'Medium Severity', amount: '$1K - $5K' }
                            ].map((tier, i) => (
                                <div key={i} className="text-center p-6 bg-background/10 rounded-2xl">
                                    <div className="text-2xl font-black font-mono mb-2">{tier.amount}</div>
                                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">{tier.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link href="https://immunefi.com/bug-bounty/nilelink" target="_blank" rel="noopener noreferrer">
                                <Button className="h-16 px-12 bg-background text-primary hover:scale-105 font-black uppercase tracking-widest text-lg rounded-2xl transition-all">
                                    View Bug Bounty Details
                                    <ArrowRight className="ml-3" size={20} />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Security Best Practices */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12">Security Best Practices</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="p-8 border-2 border-surface bg-white">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">For Businesses</h3>
                            <ul className="space-y-4">
                                {[
                                    'Enable two-factor authentication on all accounts',
                                    'Use hardware security keys when available',
                                    'Regularly rotate API keys and credentials',
                                    'Monitor transaction logs for suspicious activity',
                                    'Keep software and systems updated',
                                    'Train staff on security awareness'
                                ].map((practice, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">{practice}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="p-8 border-2 border-surface bg-white">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">For Developers</h3>
                            <ul className="space-y-4">
                                {[
                                    'Never commit private keys or secrets to code',
                                    'Use environment variables for configuration',
                                    'Implement proper input validation',
                                    'Regular security code reviews',
                                    'Monitor for dependency vulnerabilities',
                                    'Use secure coding practices and frameworks'
                                ].map((practice, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">{practice}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Contact Security Team */}
                <div className="text-center">
                    <Card className="p-12 border-2 border-text bg-white">
                        <Shield size={48} className="text-primary mx-auto mb-6" />
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-4">
                            Security Concerns?
                        </h2>
                        <p className="text-xl text-text opacity-60 mb-8 max-w-2xl mx-auto">
                            Our security team is available 24/7 to address any concerns or report potential vulnerabilities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="mailto:security@nilelink.app">
                                <Button className="h-14 px-8 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                                    Contact Security Team
                                </Button>
                            </Link>
                            <Link href="/docs/security">
                                <Button variant="outline" className="h-14 px-8 border-2 border-text text-text font-black uppercase tracking-widest rounded-xl hover:bg-text hover:text-background transition-all">
                                    Security Documentation
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

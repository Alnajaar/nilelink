'use client';

import React from 'react';
import Link from 'next/link';
import {
    Newspaper, Download, ExternalLink,
    Calendar, ArrowRight, Mic, Camera,
    FileText, Globe
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';

const pressReleases = [
    {
        id: 'mainnet-launch',
        title: 'NileLink Protocol Launches on Polygon Mainnet',
        date: 'December 30, 2025',
        summary: 'NileLink announces the successful launch of its decentralized commerce protocol on Polygon mainnet, enabling high-frequency transactions for businesses worldwide.',
        category: 'Product Launch'
    },
    {
        id: 'series-a-funding',
        title: 'NileLink Secures $25M in Series A Funding',
        date: 'December 15, 2025',
        summary: 'Leading blockchain infrastructure company NileLink raises $25 million in Series A funding led by top-tier VCs to accelerate global expansion.',
        category: 'Funding'
    },
    {
        id: 'enterprise-partnerships',
        title: 'NileLink Announces Major Enterprise Partnerships',
        date: 'December 10, 2025',
        summary: 'NileLink partners with leading restaurant chains and retail networks for pilot deployments of its commerce protocol.',
        category: 'Partnerships'
    },
    {
        id: 'security-audit-complete',
        title: 'NileLink Completes Comprehensive Security Audit',
        date: 'November 28, 2025',
        summary: 'Independent security audit by Trail of Bits confirms NileLink\'s bank-grade security standards with zero critical vulnerabilities.',
        category: 'Security'
    }
];

const mediaAssets = [
    {
        type: 'logo',
        title: 'NileLink Logo Pack',
        description: 'High-resolution logos in various formats (PNG, SVG, EPS)',
        formats: ['PNG', 'SVG', 'EPS'],
        size: '2.3 MB'
    },
    {
        type: 'brand',
        title: 'Brand Guidelines',
        description: 'Complete brand style guide and usage guidelines',
        formats: ['PDF'],
        size: '5.1 MB'
    },
    {
        type: 'product',
        title: 'Product Screenshots',
        description: 'High-resolution screenshots of NileLink platform',
        formats: ['PNG', 'JPG'],
        size: '12.4 MB'
    },
    {
        type: 'video',
        title: 'Product Demo Video',
        description: '2-minute overview of NileLink platform features',
        formats: ['MP4'],
        size: '45.8 MB'
    }
];

const inTheNews = [
    {
        publication: 'TechCrunch',
        title: 'How NileLink is Democratizing Enterprise Commerce Infrastructure',
        date: 'December 28, 2025',
        url: '#'
    },
    {
        publication: 'CoinDesk',
        title: 'Polygon Mainnet Sees Major Commerce Protocol Launch',
        date: 'December 27, 2025',
        url: '#'
    },
    {
        publication: 'Forbes',
        title: 'The Future of Commerce: NileLink\'s Decentralized Approach',
        date: 'December 25, 2025',
        url: '#'
    },
    {
        publication: 'Bloomberg',
        title: 'NileLink Raises $25M to Scale Global Commerce Network',
        date: 'December 20, 2025',
        url: '#'
    }
];

export default function PressPage() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                                <Newspaper size={24} fill="currentColor" />
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
                        Press & Media
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        NileLink in the<br />News
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Latest announcements, media coverage, and resources for journalists and analysts.
                    </p>
                </div>

                {/* Press Releases */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black mb-12">Press Releases</h2>
                    <div className="space-y-6">
                        {pressReleases.map((release) => (
                            <Card key={release.id} className="p-8 border-2 border-surface bg-white hover:border-primary transition-all group">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Badge className="bg-primary text-background border-0 font-black px-3 py-1 text-[8px] uppercase tracking-widest">
                                                {release.category}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                                <Calendar size={12} />
                                                <span>{release.date}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                            {release.title}
                                        </h3>
                                        <p className="text-lg text-text opacity-80 leading-relaxed">
                                            {release.summary}
                                        </p>
                                    </div>
                                    <div className="md:flex-shrink-0">
                                        <Link href={`/press/releases/${release.id}`}>
                                            <Button className="h-12 px-6 bg-text text-background hover:bg-primary hover:text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all group-hover:scale-105">
                                                Read Full Release
                                                <ArrowRight className="ml-2" size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* In The News */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black mb-12">NileLink in the News</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {inTheNews.map((article, i) => (
                            <Card key={i} className="p-6 border-2 border-surface bg-white hover:border-primary transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                                            {article.publication}
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h3>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                            {article.date}
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Media Assets */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black mb-12">Media Assets</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {mediaAssets.map((asset, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        {asset.type === 'logo' && <Globe size={32} className="text-primary" />}
                                        {asset.type === 'brand' && <FileText size={32} className="text-primary" />}
                                        {asset.type === 'product' && <Camera size={32} className="text-primary" />}
                                        {asset.type === 'video' && <Mic size={32} className="text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
                                            {asset.title}
                                        </h3>
                                        <p className="text-text opacity-60 mb-4 leading-relaxed">
                                            {asset.description}
                                        </p>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="text-sm opacity-60">
                                                <span className="font-black uppercase tracking-widest">Formats:</span> {asset.formats.join(', ')}
                                            </div>
                                            <div className="text-sm opacity-60">
                                                <span className="font-black uppercase tracking-widest">Size:</span> {asset.size}
                                            </div>
                                        </div>
                                        <Button className="h-12 px-6 bg-primary text-background hover:bg-primary/90 font-black uppercase tracking-widest text-sm rounded-xl">
                                            <Download size={16} className="mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Press Contact */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-background to-surface">
                        <div className="text-center">
                            <Newspaper size={48} className="text-primary mx-auto mb-6" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-4">
                                Press Inquiries
                            </h2>
                            <p className="text-xl text-text opacity-60 mb-8 max-w-2xl mx-auto">
                                For press inquiries, interviews, or media requests, please contact our communications team.
                            </p>
                            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                <div className="text-center">
                                    <h3 className="font-black uppercase tracking-widest text-sm mb-2">Media Contact</h3>
                                    <p className="text-lg font-medium">Sarah Chen</p>
                                    <p className="text-sm text-text opacity-60">Head of Communications</p>
                                    <a href="mailto:press@nilelink.app" className="text-primary hover:underline">
                                        press@nilelink.app
                                    </a>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black uppercase tracking-widest text-sm mb-2">Technical Press</h3>
                                    <p className="text-lg font-medium">Dr. Alex Kumar</p>
                                    <p className="text-sm text-text opacity-60">Chief Technology Officer</p>
                                    <a href="mailto:alex@nilelink.app" className="text-primary hover:underline">
                                        alex@nilelink.app
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Newsletter Signup */}
                <div className="text-center">
                    <Card className="p-12 border-2 border-surface bg-white">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-text mb-4">
                            Press Newsletter
                        </h2>
                        <p className="text-lg text-text opacity-60 mb-8 max-w-xl mx-auto">
                            Subscribe to receive NileLink press releases and announcements directly in your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-12 px-4 bg-background border-2 border-surface rounded-xl focus:border-primary outline-none"
                            />
                            <Button className="h-12 px-8 bg-primary text-background font-black uppercase tracking-widest rounded-xl whitespace-nowrap">
                                Subscribe
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

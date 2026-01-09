'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Calendar,
    User,
    ArrowRight,
    Clock,
    TrendingUp,
    Shield,
    Zap
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';

const blogPosts = [
    {
        id: 'mainnet-launch',
        title: 'NileLink Protocol Goes Live on Mainnet',
        excerpt: 'After extensive testing and community feedback, NileLink Protocol is now live on Polygon mainnet with full decentralized commerce infrastructure.',
        author: 'NileLink Team',
        date: '2025-12-30',
        readTime: '5 min read',
        category: 'Announcements',
        featured: true,
        image: '/api/placeholder/600/300'
    },
    {
        id: 'security-audit-complete',
        title: 'Comprehensive Security Audit Completed',
        excerpt: 'Leading blockchain security firm completes thorough audit of NileLink smart contracts, confirming bank-grade security standards.',
        author: 'Security Team',
        date: '2025-12-28',
        readTime: '8 min read',
        category: 'Security',
        featured: false,
        image: '/api/placeholder/400/200'
    },
    {
        id: 'enterprise-partnerships',
        title: 'Major Enterprise Partnerships Announced',
        excerpt: 'NileLink announces partnerships with leading restaurant chains and retail networks for pilot deployments.',
        author: 'Business Development',
        date: '2025-12-25',
        readTime: '6 min read',
        category: 'Business',
        featured: false,
        image: '/api/placeholder/400/200'
    },
    {
        id: 'developer-ecosystem',
        title: 'Developer Ecosystem Grows to 500+ Contributors',
        excerpt: 'Open-source contributions surge as developers worldwide build on NileLink Protocol infrastructure.',
        author: 'Community Team',
        date: '2025-12-20',
        readTime: '4 min read',
        category: 'Community',
        featured: false,
        image: '/api/placeholder/400/200'
    }
];

export default function BlogPage() {
    const featuredPost = blogPosts.find(post => post.featured);
    const regularPosts = blogPosts.filter(post => !post.featured);

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
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
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Latest Updates
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        NileLink<br />Protocol Blog
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Stay updated with the latest developments, announcements, and insights from the NileLink ecosystem.
                    </p>
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <Card className="p-8 border-2 border-primary bg-white shadow-2xl overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Badge className="bg-primary text-background border-0 font-black px-3 py-1 text-[8px] uppercase tracking-widest">
                                            {featuredPost.category}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                            <Calendar size={12} />
                                            <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-text leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-lg text-text opacity-60 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm opacity-60">
                                        <div className="flex items-center gap-2">
                                            <User size={14} />
                                            <span>{featuredPost.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{featuredPost.readTime}</span>
                                        </div>
                                    </div>
                                    <Link href={`/blog/${featuredPost.id}`}>
                                        <Button className="h-14 px-8 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all">
                                            Read Full Article
                                            <ArrowRight className="ml-2" size={18} />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="aspect-video bg-surface rounded-2xl flex items-center justify-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Featured Image</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/blog/${post.id}`}>
                                <Card className="p-6 border-2 border-surface bg-white hover:border-primary transition-all group h-full flex flex-col">
                                    <div className="aspect-video bg-surface rounded-xl mb-6 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Post Image</span>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-surface text-text border-0 font-black px-2 py-1 text-[7px] uppercase tracking-widest">
                                                {post.category}
                                            </Badge>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                                                {new Date(post.date).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm text-text opacity-60 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-surface">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
                                            <User size={10} />
                                            <span>{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
                                            <Clock size={10} />
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Signup */}
                <div className="mt-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-background to-surface text-center">
                        <div className="max-w-2xl mx-auto">
                            <TrendingUp size={48} className="text-primary mx-auto mb-6" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-4">
                                Stay in the Loop
                            </h2>
                            <p className="text-lg text-text opacity-60 mb-8">
                                Get the latest NileLink updates, protocol developments, and ecosystem news delivered to your inbox.
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
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

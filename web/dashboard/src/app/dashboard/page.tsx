"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Zap, TrendingUp, DollarSign, PieChart, Activity,
    LayoutDashboard, ShoppingBag, Vote, Users,
    ArrowUpRight, ArrowDownRight, ChevronRight, Bell, Search, Clock
} from 'lucide-react';

import { UniversalHeader } from '@shared/components/UniversalHeader';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';
import dynamic from 'next/dynamic';

const NeuralMesh = dynamic(() => import('@shared/components/NeuralMesh').then(mod => mod.NeuralMesh), { ssr: false });
const PredictiveAnalytics = dynamic(() => import('@/components/PredictiveAnalytics'), { ssr: false });
const YieldEngine = dynamic(() => import('@/components/YieldEngine'), { ssr: false });

export default function DashboardPage() {
    return (
        <AuthGuard appName="NileLink Dashboard" useWeb3Auth={false}>
            <DashboardContent />
        </AuthGuard>
    );
}

function DashboardContent() {
    const router = useRouter();

    const [stats] = useState([
        { label: 'Total Portfolio', value: '$14,245.50', trend: '+12.4%', up: true, icon: PieChart },
        { label: 'Unclaimed Dividends', value: '$285.20', trend: 'Ready', up: true, icon: DollarSign },
        { label: 'Open Trades', value: '3', trend: 'Active', up: true, icon: Activity },
        { label: 'Yield Rate', value: '11.8%', trend: '+0.5%', up: true, icon: TrendingUp }
    ]);

    const [recentActivity] = useState([
        { type: 'Dividend', venue: 'Cairo Grill Prime', amount: '+$12.40', time: '2h ago', status: 'Confirmed' },
        { type: 'Trade', venue: 'Delta Kitchen', amount: '-$500.00', time: '5h ago', status: 'Buy Order' },
        { type: 'Governance', venue: 'Nile Bistro', amount: 'Vote', time: '1d ago', status: 'Participation' }
    ]);

    return (
        <div className="min-h-screen bg-neutral text-text-primary flex flex-col antialiased relative overflow-hidden mesh-bg selection:bg-primary/20">
            <NeuralMesh />
            <UniversalHeader
                appName="Investor Dash"
                user={{ name: "Investor #892", role: "Venture Partner" }}
            />
            <main className="flex-1 max-w-[1600px] mx-auto p-8">
                {/* Hero / Pulse */}
                <header className="mb-12">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-6xl font-black text-white tracking-tighter mb-2 uppercase">Systems Control</h1>
                            <p className="text-white/40 font-black uppercase tracking-widest text-xs">Investor Node #892 • High-Frequency Portfolio Monitoring</p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => router.push('/list-restaurant')}
                                variant="outline"
                                className="h-14 px-8 border-2 border-text hover:bg-text hover:text-background rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                List Asset
                            </Button>
                            <Button
                                onClick={() => router.push('/trade')}
                                className="h-14 px-10 bg-primary hover:scale-105 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                            >
                                Instant Trade
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        {stats.map((stat, i) => (
                            <Card key={i} className="p-8 glass-v2 border-white/5 hover:border-primary/20 transition-all group cursor-pointer rounded-[2rem] shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center shadow-inner">
                                        <stat.icon size={24} />
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black px-3 py-1 text-[10px] tracking-widest uppercase">
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">{stat.label}</p>
                                <p className="text-3xl font-black font-mono tracking-tighter text-white">{stat.value}</p>
                            </Card>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Market Trends */}
                    <div className="lg:col-span-2 space-y-8">
                        <PredictiveAnalytics />
                        <YieldEngine />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 border border-surface bg-white">
                            <h3 className="text-lg font-black uppercase mb-6 flex items-center justify-between">
                                Top Yielders
                                <ArrowUpRight className="text-primary" size={20} />
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { venue: 'Cairo Grill', yield: '15.2%', price: '$125.50' },
                                    { venue: 'Nile Bistro', yield: '13.8%', price: '$89.00' },
                                    { venue: 'Delta Kitchen', yield: '11.5%', price: '$52.25' }
                                ].map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-surface/50 rounded-xl">
                                        <div>
                                            <p className="font-black text-sm">{v.venue}</p>
                                            <p className="text-[10px] font-bold text-text/40 font-mono">{v.price}</p>
                                        </div>
                                        <p className="font-black text-primary">{v.yield}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 border border-surface bg-white">
                            <h3 className="text-lg font-black uppercase mb-6 flex items-center justify-between">
                                Hot Deals
                                <Zap className="text-primary" size={20} />
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { venue: 'Spice Route', cap: '$1.4M', status: '85% Fulfilled' },
                                    { venue: 'Urban Brew', cap: '$850k', status: 'New Listing' },
                                    { venue: 'Suez Seafood', cap: '$2.1M', status: 'Trending' }
                                ].map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-surface/50 rounded-xl">
                                        <div>
                                            <p className="font-black text-sm">{v.venue}</p>
                                            <p className="text-[10px] font-bold text-text/40 font-mono">{v.cap}</p>
                                        </div>
                                        <Badge className="bg-text text-background font-black text-[9px] px-2 py-0.5">{v.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar / Terminal Activity */}
                <div className="space-y-8">
                    <Card className="p-6 border border-surface bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-text">Live Ledger</h2>
                            <button className="text-[10px] font-black uppercase text-primary">View All</button>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="border-l-2 border-surface pl-4 relative">
                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-surface" />
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-black uppercase text-text/40">{act.type}</p>
                                        <p className="text-[10px] font-bold text-text/30 font-mono">{act.time}</p>
                                    </div>
                                    <p className="font-black text-xs text-text mb-1 truncate">{act.venue}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono font-bold text-[11px] text-primary">{act.amount}</p>
                                        <p className="text-[9px] font-black uppercase px-1 bg-surface rounded text-text/50">{act.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 border border-surface bg-text text-background relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-all duration-700">
                            <Vote size={120} />
                        </div>
                        <div className="relative">
                            <Badge className="bg-primary text-background border-0 font-black text-[10px] px-2 py-1 mb-4">GOVERNANCE ALERT</Badge>
                            <h3 className="text-xl font-black uppercase mb-2">North Coast Extension</h3>
                            <p className="text-xs text-background/60 leading-relaxed mb-6">Cairo Grill is proposing a summer expansion. Your vote counts for 1,250 weight.</p>
                            <Button
                                onClick={() => window.open('http://localhost:3000/governance', '_blank')}
                                className="w-full bg-background text-text hover:bg-primary hover:text-background h-10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Review Proposal
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-0 border border-surface bg-surface/30 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Portfolio Diversity</h3>
                            <div className="h-4 w-full bg-surface rounded-full flex overflow-hidden">
                                <div className="h-full bg-primary w-[45%]" />
                                <div className="h-full bg-text w-[25%]" />
                                <div className="h-full bg-text/20 w-[30%]" />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black uppercase text-text/60">Med (45%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-text" />
                                    <span className="text-[10px] font-black uppercase text-text/60">Asian (25%)</span>
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-surface hover:bg-text hover:text-background transition-all text-[10px] font-black uppercase tracking-widest">
                            Optimize Assets
                        </button>
                    </Card>
                </div>
        </div>
            </main >
        <UniversalFooter />
        </div >
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Shield, AlertCircle, TrendingDown,
    ArrowUpRight, Settings, Pause, Play,
    Search, Filter, Globe, RefreshCw,
    Wallet, DollarSign, Users, List,
    ShieldCheck, CloudLightning, BadgeAlert
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Progress } from '@shared/components/ui/progress'; // Assuming this exists or using a custom one
import { Input } from '@shared/components/ui/input';

interface GasStats {
    totalSpentUsd6: number;
    activeWallets: number;
    totalTransactions: number;
    platformDailyLimitUsd6: number;
    topSpenders: {
        userId: string;
        merchantName: string;
        spentUsd6: number;
        quotaUsd6: number;
    }[];
}

export default function GasControlDashboard() {
    const [stats, setStats] = useState<GasStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/web3/gas');
                if (!res.ok) throw new Error('Failed to fetch gas stats');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const formatUsd6 = (usd6: number) => `$${(usd6 / 1000000).toFixed(2)}`;

    const handleToggleSponsorship = async (userId: string, isActive: boolean) => {
        try {
            const res = await fetch('/api/admin/web3/gas', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isActive })
            });
            if (res.ok) {
                // Refresh local state or stats
                console.log(`Sponsorship for ${userId} set to ${isActive}`);
            }
        } catch (err) {
            console.error('Failed to toggle sponsorship:', err);
        }
    };

    if (loading && !stats) return <div className="p-8 text-blue-400 animate-pulse">Initializing Control Center...</div>;

    const platformUsagePercent = stats ? (stats.totalSpentUsd6 / stats.platformDailyLimitUsd6) * 100 : 0;

    return (
        <div className="p-8 space-y-8 bg-[#0a0a10] min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Shield className="text-blue-500" />
                        Admin Gas Control Center
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium tracking-tight uppercase text-xs">
                        Invisible Web3 Infrastructure — Operational Protocol
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-red-900/50 bg-red-950/20 text-red-400 font-black uppercase text-xs tracking-widest hover:bg-red-900/40">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Emergency Stop (Global)
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-lg shadow-blue-500/20">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Manual Sync
                    </Button>
                </div>
            </header>

            {/* Platform Health Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={DollarSign}
                    title="Net Gas Spend (Today)"
                    value={formatUsd6(stats?.totalSpentUsd6 || 0)}
                    subvalue={`${platformUsagePercent.toFixed(1)}% of Platform Cap`}
                    color="blue"
                />
                <StatCard
                    icon={Users}
                    title="Active Merchants"
                    value={stats?.activeWallets || 0}
                    subvalue="Transacting Locally"
                    color="purple"
                />
                <StatCard
                    icon={Activity}
                    title="Relayed UserOps"
                    value={stats?.totalTransactions || 0}
                    subvalue="Sponsored Fulfillment"
                    color="emerald"
                />
                <StatCard
                    icon={ShieldCheck}
                    title="Treasury Buffer"
                    value={formatUsd6((stats?.platformDailyLimitUsd6 || 0) - (stats?.totalSpentUsd6 || 0))}
                    subvalue="Remaining Allowance"
                    color="cyan"
                />
            </section>

            {/* Safety Alerts */}
            {platformUsagePercent > 80 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key="safety-alert"
                >
                    <Alert className="bg-orange-500/10 border-orange-500/50 border-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <AlertTitle className="text-orange-500 font-black uppercase tracking-widest text-xs">Platform Gas Threshold Reached</AlertTitle>
                        <AlertDescription className="text-orange-200">
                            The collective gas spend has reached 80% of the daily treasury cap ($200.00). New sponsorships may require manual approval if cap is breached.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Merchant Control Center */}
                <Card className="lg:col-span-2 bg-gray-900/40 border-gray-800 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white">Merchant Sovereignty Control</CardTitle>
                            <CardDescription className="text-gray-400">Manage individual sponsorship quotas and status</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                                placeholder="Search Merchant ID..."
                                className="pl-10 h-10 w-64 bg-black/40 border-gray-800 text-xs text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <th className="pb-4">Merchant Node</th>
                                    <th className="pb-4">Sponsorship Status</th>
                                    <th className="pb-4">Usage (Today)</th>
                                    <th className="pb-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.topSpenders.map((spender) => (
                                    <tr key={spender.userId} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                        <td className="py-4">
                                            <p className="text-sm font-bold text-white">{spender.merchantName}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{spender.userId}</p>
                                        </td>
                                        <td className="py-4">
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none rounded-sm uppercase text-[9px] font-black tracking-widest">
                                                Active
                                            </Badge>
                                        </td>
                                        <td className="py-4 w-48">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-1">
                                                    <span className="text-blue-400">{formatUsd6(spender.spentUsd6)}</span>
                                                    <span className="text-gray-500">Limit: {formatUsd6(spender.quotaUsd6)}</span>
                                                </div>
                                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-blue-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(spender.spentUsd6 / spender.quotaUsd6) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right space-x-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                <Settings size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                                onClick={() => handleToggleSponsorship(spender.userId, false)}
                                            >
                                                <Pause size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Platform Rules & Caps */}
                <div className="space-y-8">
                    <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-black text-white">Rule Orchestration</CardTitle>
                            <CardDescription>Whitelist actions for sponsorship</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RuleItem icon={RefreshCw} label="Inventory Sync" status="SPONSORED" />
                            <RuleItem icon={ShieldCheck} label="Order Fulfillment" status="SPONSORED" />
                            <RuleItem icon={Users} label="Auth Handshake" status="SPONSORED" />
                            <RuleItem icon={List} label="Bulk Data Export" status="RESTRICTED" isWarning />
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600/10 border-blue-500/30 backdrop-blur-xl relative overflow-hidden">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mb-2">
                                <CloudLightning />
                            </div>
                            <CardTitle className="text-white font-black">Treasury Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-200/60 leading-relaxed mb-4">
                                Economic guardrails are active. Global daily sponsorship limit is currently locked at $200.00.
                            </p>
                            <div className="p-3 bg-black/40 rounded-lg border border-blue-500/20">
                                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Safety Cap</p>
                                <p className="text-xl font-black text-white">$200.00 / day</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, value, subvalue, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        cyan: 'text-cyan-500 bg-cyan-500/10'
    };

    return (
        <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-xl p-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
                    <p className="text-xs text-gray-400 font-medium">{subvalue}</p>
                </div>
            </div>
        </Card>
    );
}

function RuleItem({ icon: Icon, label, status, isWarning }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-800 group hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-gray-500 group-hover:text-blue-400" />
                <span className="text-sm font-bold text-white">{label}</span>
            </div>
            <Badge className={`${isWarning ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'} border-none text-[8px] font-black tracking-widest`}>
                {status}
            </Badge>
        </div>
    );
}

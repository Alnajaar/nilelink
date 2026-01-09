'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Lock,
    Unlock,
    Coins,
    ArrowUpRight,
    Layers,
    BarChart3,
    Calendar,
    Wallet,
    CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';

interface Stake {
    id: string;
    poolName: string;
    amount: string;
    rewards: string;
    roi: number;
}

export default function YieldEngine() {
    const [stakes, setStakes] = useState<Stake[]>([]);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/investors/portfolio', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const json = await res.json();
            if (json.success) {
                setPortfolio(json.data);
                setStakes(json.data.stakes || []);
            }
        } catch (err) {
            console.error('Failed to fetch portfolio', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Yield Optimization Engine
                </h2>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                    Compound Rate: 16.4% APY
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/5 border-white/10 glass-v2 col-span-1 lg:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Staked Balance</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">
                            {portfolio?.totalInvested ? (portfolio.totalInvested / 1000).toFixed(1) + 'k' : '0.0'}
                        </p>
                        <span className="text-xs text-blue-400 mb-1">NLINK</span>
                    </div>
                </Card>

                <Card className="p-4 bg-white/5 border-white/10 glass-v2 col-span-1 lg:col-span-1">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Accrued Yield</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-emerald-400">
                            {portfolio?.totalDividends ? '$' + portfolio.totalDividends.toLocaleString() : '$0'}
                        </p>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mb-1" />
                    </div>
                </Card>

                <Card className="p-4 bg-white/5 border-white/10 glass-v2 col-span-1 lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Projected Annual Return</p>
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-2xl font-bold text-white">+$24,500</p>
                            <p className="text-[10px] text-gray-400">Based on current node velocity</p>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="w-1.5 h-10 bg-blue-500/20 rounded-full flex flex-col justify-end overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${20 + (i * 10)}%` }}
                                        className="w-full bg-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Active Staking Positions
                    </h3>

                    {stakes.length === 0 ? (
                        <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-gray-500 text-sm">
                            No active staking positions found. Initializing node required.
                        </div>
                    ) : (
                        stakes.map((stake) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={stake.id}
                                className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Coins className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white">{stake.poolName}</h4>
                                        <p className="text-[10px] text-gray-500">{stake.amount} NLINK Staked</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-emerald-400">+{stake.roi}% APY</p>
                                    <p className="text-[10px] text-gray-500">Compounding Daily</p>
                                </div>
                            </motion.div>
                        ))
                    )}

                    <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        Open New Staking Position
                    </Button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Security & Duration
                    </h3>
                    <Card className="p-6 bg-black/40 border-white/5 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white mb-1">Lock-up Period</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Assets are locked for 365 days to ensure protocol stability and maximum yield generation across the restaurant network.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Hardware Encrypted
                                </span>
                                <span className="text-gray-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Audit Verified
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Multi-Sig Auth
                                </span>
                                <span className="text-gray-400 flex items-center gap-2">
                                    <Unlock className="w-3 h-3 text-blue-500" />
                                    Auto-Unlock: Dec 2026
                                </span>
                            </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold tracking-wider py-6 h-auto">
                            ACCELERATE PORTFOLIO
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

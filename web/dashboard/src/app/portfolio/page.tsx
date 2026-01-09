"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
    ArrowUpRight, ArrowDownRight, Calendar, Download, Eye
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

interface Holding {
    id: string;
    restaurantName: string;
    cuisine: string;
    shares: number;
    avgBuyPrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    dividendsEarned: number;
}

export default function PortfolioPage() {
    const router = useRouter();

    const [holdings] = useState<Holding[]>([
        {
            id: 'rest-001',
            restaurantName: 'Cairo Grill Prime',
            cuisine: 'Mediterranean',
            shares: 50,
            avgBuyPrice: 118.25,
            currentPrice: 125.50,
            totalValue: 6275.00,
            profitLoss: 362.50,
            profitLossPercent: 6.13,
            dividendsEarned: 147.80
        },
        {
            id: 'rest-003',
            restaurantName: 'Delta Kitchen',
            cuisine: 'Egyptian',
            shares: 100,
            avgBuyPrice: 48.00,
            currentPrice: 52.25,
            totalValue: 5225.00,
            profitLoss: 425.00,
            profitLossPercent: 8.85,
            dividendsEarned: 289.50
        },
        {
            id: 'rest-002',
            restaurantName: 'Nile Bistro',
            cuisine: 'French',
            shares: 25,
            avgBuyPrice: 92.00,
            currentPrice: 89.00,
            totalValue: 2225.00,
            profitLoss: -75.00,
            profitLossPercent: -3.26,
            dividendsEarned: 68.25
        }
    ]);

    const totalInvested = holdings.reduce((sum, h) => sum + (h.shares * h.avgBuyPrice), 0);
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalPL = totalValue - totalInvested;
    const totalPLPercent = (totalPL / totalInvested) * 100;
    const totalDividends = holdings.reduce((sum, h) => sum + h.dividendsEarned, 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">My Portfolio</h1>
                            <p className="text-text opacity-70">Track your restaurant investments and performance</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push('/marketplace')}
                                variant="outline"
                                className="h-12 px-6 rounded-xl font-bold"
                            >
                                <Eye size={18} className="mr-2" />
                                Browse Market
                            </Button>
                            <Button
                                className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black"
                            >
                                <Download size={18} className="mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Total Value
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            ${totalValue.toLocaleString()}
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            {totalPL >= 0 ? (
                                <TrendingUp size={24} className="text-primary" />
                            ) : (
                                <TrendingDown size={24} className="text-text" />
                            )}
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Total P/L
                        </p>
                        <p className={`text-3xl font-black font-mono ${totalPL >= 0 ? 'text-primary' : 'text-text'}`}>
                            {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString()}
                        </p>
                        <p className={`text-sm font-bold mt-1 ${totalPL >= 0 ? 'text-primary' : 'text-text'}`}>
                            {totalPL >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Dividends Earned
                        </p>
                        <p className="text-3xl font-black font-mono text-primary">
                            ${totalDividends.toLocaleString()}
                        </p>
                        <p className="text-xs text-text opacity-70 mt-1">
                            This month: ${(totalDividends * 0.3).toFixed(2)}
                        </p>
                    </Card>

                    <Card className="p-6 bg-primary text-background">
                        <div className="flex items-center justify-between mb-2">
                            <PieChart size={24} />
                        </div>
                        <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">
                            Holdings
                        </p>
                        <p className="text-3xl font-black font-mono">
                            {holdings.length}
                        </p>
                        <p className="text-xs opacity-80 mt-1">
                            Restaurants
                        </p>
                    </Card>
                </div>

                {/* Holdings Table */}
                <Card className="p-6 bg-white border border-surface mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-text">Your Holdings</h2>
                        <Badge className="bg-primary/10 text-primary px-3 py-1 text-sm font-bold">
                            {holdings.length} Active Investments
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {holdings.map((holding, idx) => (
                            <motion.div
                                key={holding.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 bg-surface/30 rounded-xl hover:bg-surface/50 transition-all cursor-pointer group"
                                onClick={() => router.push(`/restaurant/${holding.id}`)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-text mb-1 group-hover:text-primary transition-colors">
                                            {holding.restaurantName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-text opacity-70">
                                            <Badge className="bg-primary/10 text-primary px-2 py-1 text-xs font-bold">
                                                {holding.cuisine}
                                            </Badge>
                                            <span>{holding.shares} shares</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-mono font-black text-primary">
                                            ${holding.currentPrice}
                                        </p>
                                        <p className="text-sm text-text opacity-70">
                                            Avg: ${holding.avgBuyPrice}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Total Value</p>
                                        <p className="text-lg font-mono font-bold text-text">
                                            ${holding.totalValue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">P/L</p>
                                        <div className="flex items-center gap-2">
                                            {holding.profitLoss >= 0 ? (
                                                <ArrowUpRight size={16} className="text-primary" />
                                            ) : (
                                                <ArrowDownRight size={16} className="text-text" />
                                            )}
                                            <p className={`text-lg font-mono font-bold ${holding.profitLoss >= 0 ? 'text-primary' : 'text-text'
                                                }`}>
                                                {holding.profitLoss >= 0 ? '+' : ''}${Math.abs(holding.profitLoss).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">P/L %</p>
                                        <p className={`text-lg font-mono font-bold ${holding.profitLossPercent >= 0 ? 'text-primary' : 'text-text'
                                            }`}>
                                            {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Dividends</p>
                                        <p className="text-lg font-mono font-bold text-primary">
                                            ${holding.dividendsEarned.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Performance Chart Placeholder */}
                <Card className="p-6 bg-white border border-surface">
                    <h2 className="text-2xl font-black text-text mb-6">Portfolio Performance</h2>
                    <div className="h-64 flex items-center justify-center bg-surface/30 rounded-xl">
                        <div className="text-center">
                            <BarChart3 size={48} className="text-text opacity-30 mx-auto mb-3" />
                            <p className="text-text opacity-50 font-bold">
                                Performance chart coming soon
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

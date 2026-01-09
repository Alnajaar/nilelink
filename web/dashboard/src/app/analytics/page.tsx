"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, BarChart3, PieChart, Zap,
    DollarSign, Users, Building, Target, Brain, Download
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function AnalyticsPage() {
    const router = useRouter();

    const marketStats = {
        totalMarketCap: 6781000,
        totalVolume24h: 487000,
        avgDividendYield: 11.2,
        activeRestaurants: 24,
        totalInvestors: 2847,
        averageROI: 18.5,
        marketGrowth: 127.3
    };

    const topPerformers = [
        { name: 'Delta Kitchen', growth: 24.5, volume: 125000, yield: 15.0 },
        { name: 'Cairo Grill Prime', growth: 18.2, volume: 98000, yield: 8.5 },
        { name: 'Spice Route', growth: 15.7, volume: 76000, yield: 10.2 },
        { name: 'Nile Bistro', growth: 12.3, volume: 65000, yield: 12.3 }
    ];

    const sectorPerformance = [
        { sector: 'Mediterranean', restaurants: 8, marketShare: 35, avgYield: 9.2 },
        { sector: 'Asian', restaurants: 6, marketShare: 25, avgYield: 11.5 },
        { sector: 'Egyptian', restaurants: 5, marketShare: 20, avgYield: 13.8 },
        { sector: 'French', restaurants: 3, marketShare: 12, avgYield: 8.7 },
        { sector: 'Other', restaurants: 2, marketShare: 8, avgYield: 10.1 }
    ];

    const aiInsights = [
        {
            type: 'opportunity',
            title: 'Undervalued Egyptian Cuisine',
            description: 'AI models predict 40% growth potential in Egyptian restaurants based on cultural trends',
            confidence: 87
        },
        {
            type: 'warning',
            title: 'Market Volatility Expected',
            description: 'Tourism season ending may impact revenue for tourist-focused venues',
            confidence: 72
        },
        {
            type: 'trend',
            title: 'Rising Dividend Yields',
            description: 'Platform average yield up 2.3% this quarter due to improved operations',
            confidence: 94
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">Analytics & Market Intelligence</h1>
                            <p className="text-text opacity-70">AI-powered insights and real-time market data</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="h-12 px-6 rounded-xl font-bold"
                            >
                                <Download size={18} className="mr-2" />
                                Export Report
                            </Button>
                            <Button
                                onClick={() => router.push('/marketplace')}
                                className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black"
                            >
                                <Target size={18} className="mr-2" />
                                Find Opportunities
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Market Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} className="text-primary" />
                            <TrendingUp size={16} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Total Market Cap
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            ${(marketStats.totalMarketCap / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-primary font-bold mt-1">+{marketStats.marketGrowth}% YTD</p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            24h Volume
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            ${(marketStats.totalVolume24h / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs text-text opacity-50 mt-1">Across all venues</p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Avg Dividend Yield
                        </p>
                        <p className="text-3xl font-black font-mono text-primary">
                            {marketStats.avgDividendYield}%
                        </p>
                        <p className="text-xs text-primary font-bold mt-1">Best in class</p>
                    </Card>

                    <Card className="p-6 bg-primary text-background">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">
                            Avg ROI (6mo)
                        </p>
                        <p className="text-3xl font-black font-mono">
                            {marketStats.averageROI}%
                        </p>
                        <p className="text-xs opacity-80 mt-1">Platform average</p>
                    </Card>
                </div>

                {/* AI Insights */}
                <Card className="p-6 bg-white border border-surface mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Brain size={20} className="text-background" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-text">AI Market Insights</h2>
                            <p className="text-sm text-text opacity-70">Powered by machine learning models</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {aiInsights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 bg-surface/30 rounded-xl border-2 border-surface hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className={`px-2 py-1 text-xs font-bold ${insight.type === 'opportunity' ? 'bg-primary/10 text-primary' :
                                            insight.type === 'warning' ? 'bg-text/10 text-text' :
                                                'bg-primary/10 text-primary'
                                        }`}>
                                        {insight.type.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-text opacity-50 font-mono">{insight.confidence}% confidence</span>
                                </div>
                                <h3 className="text-lg font-black text-text mb-2">{insight.title}</h3>
                                <p className="text-sm text-text opacity-70">{insight.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performers */}
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Zap size={20} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-text">Top Performers (30d)</h2>
                        </div>

                        <div className="space-y-4">
                            {topPerformers.map((restaurant, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-surface/30 rounded-xl hover:bg-surface/50 transition-all cursor-pointer"
                                    onClick={() => router.push(`/restaurant/${idx}`)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                <span className="text-background font-black text-sm">#{idx + 1}</span>
                                            </div>
                                            <h3 className="font-bold text-text">{restaurant.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp size={16} className="text-primary" />
                                            <span className="text-lg font-mono font-black text-primary">
                                                +{restaurant.growth}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-text opacity-50 text-xs">Volume</p>
                                            <p className="font-mono font-bold text-text">${(restaurant.volume / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div>
                                            <p className="text-text opacity-50 text-xs">Dividend Yield</p>
                                            <p className="font-mono font-bold text-primary">{restaurant.yield}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Sector Analysis */}
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <PieChart size={20} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-text">Sector Analysis</h2>
                        </div>

                        <div className="space-y-4">
                            {sectorPerformance.map((sector, idx) => (
                                <div key={idx} className="p-4 bg-surface/30 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-text">{sector.sector}</h3>
                                            <p className="text-xs text-text opacity-50">{sector.restaurants} restaurants</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-mono font-black text-primary">{sector.avgYield}%</p>
                                            <p className="text-xs text-text opacity-50">Avg yield</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-surface rounded-full h-2 mb-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${sector.marketShare}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-text opacity-70">{sector.marketShare}% market share</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Market Activity Chart Placeholder */}
                <Card className="p-6 bg-white border border-surface mt-8">
                    <h2 className="text-2xl font-black text-text mb-6">Market Activity (Real-time)</h2>
                    <div className="h-96 flex items-center justify-center bg-surface/30 rounded-xl">
                        <div className="text-center">
                            <BarChart3 size={64} className="text-text opacity-30 mx-auto mb-4" />
                            <p className="text-text opacity-50 font-bold mb-2">
                                Advanced charting coming soon
                            </p>
                            <p className="text-sm text-text opacity-30">
                                Real-time price movements, volume analysis, and technical indicators
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

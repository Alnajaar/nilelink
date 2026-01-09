"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Star, MapPin, Users, TrendingUp, DollarSign,
    Calendar, BarChart3, ShoppingCart, Eye, Download, Vote
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function RestaurantDetailPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'governance'>('overview');

    const restaurant = {
        id: 'rest-001',
        name: 'Cairo Grill Prime',
        cuisine: 'Mediterranean',
        location: 'Downtown Cairo',
        description: 'Premium Mediterranean dining experience featuring authentic recipes and modern culinary techniques.',
        sharePrice: 125.50,
        priceChange24h: 5.2,
        marketCap: 2510000,
        totalShares: 20000,
        availableShares: 2500,
        sharesSold: 17500,
        dailyRevenue: 45000,
        monthlyRevenue: 1350000,
        monthlyCosts: 850000,
        profitMargin: 37.0,
        dividendYield: 8.5,
        rating: 4.8,
        reviews: 1247,
        yearsOperating: 8,
        employees: 45,
        avgCustomerSpend: 85,
        dailyTransactions: 530
    };

    const shareholders = [
        { name: 'Public Investors', percentage: 87.5, shares: 17500 },
        { name: 'Founder/Owner', percentage: 12.5, shares: 2500 }
    ];

    const financialHistory = [
        { month: 'Jun', revenue: 1200000, profit: 420000 },
        { month: 'Jul', revenue: 1250000, profit: 445000 },
        { month: 'Aug', revenue: 1280000, profit: 465000 },
        { month: 'Sep', revenue: 1310000, profit: 480000 },
        { month: 'Oct', revenue: 1335000, profit: 492000 },
        { month: 'Nov', revenue: 1350000, profit: 500000 }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="flex items-center gap-2 text-text hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-bold">Back to Marketplace</span>
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-text mb-2">{restaurant.name}</h1>
                            <div className="flex items-center gap-4 text-text opacity-70">
                                <Badge className="bg-primary/10 text-primary px-3 py-1 font-bold">
                                    {restaurant.cuisine}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {restaurant.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="fill-primary text-primary" />
                                    {restaurant.rating} ({restaurant.reviews} reviews)
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    {restaurant.yearsOperating} years operating
                                </div>
                            </div>
                            <p className="text-text mt-4 max-w-2xl">
                                {restaurant.description}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-5xl font-mono font-black text-primary mb-1">
                                ${restaurant.sharePrice}
                            </p>
                            <p className="text-lg font-bold text-primary">
                                +{restaurant.priceChange24h}% (24h)
                            </p>
                            <div className="flex gap-3 mt-4">
                                <Button
                                    onClick={() => router.push(`/trade?restaurant=${restaurant.id}&action=buy`)}
                                    className="bg-primary hover:opacity-90 text-background h-12 px-8 rounded-xl font-black uppercase tracking-widest"
                                >
                                    <ShoppingCart size={18} className="mr-2" />
                                    Invest Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl font-bold"
                                >
                                    <Eye size={18} className="mr-2" />
                                    Watch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-surface">
                    {(['overview', 'financials', 'governance'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 font-black uppercase tracking-widest text-sm transition-all ${activeTab === tab
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text opacity-50 hover:opacity-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Key Metrics */}
                            <Card className="p-6 bg-white border border-surface">
                                <h2 className="text-2xl font-black text-text mb-6">Key Metrics</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Market Cap</p>
                                        <p className="text-2xl font-mono font-black text-text">
                                            ${(restaurant.marketCap / 1000000).toFixed(1)}M
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Daily Revenue</p>
                                        <p className="text-2xl font-mono font-black text-text">
                                            ${(restaurant.dailyRevenue / 1000).toFixed(0)}k
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Profit Margin</p>
                                        <p className="text-2xl font-mono font-black text-primary">
                                            {restaurant.profitMargin}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Dividend Yield</p>
                                        <p className="text-2xl font-mono font-black text-primary">
                                            {restaurant.dividendYield}%
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Live POS Data */}
                            <Card className="p-6 bg-white border border-surface">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-text">Live POS Data</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Live</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-4 bg-surface/30 rounded-xl">
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Today's Sales</p>
                                        <p className="text-3xl font-mono font-black text-primary">
                                            ${(restaurant.dailyRevenue * 0.67).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-text opacity-70 mt-1">As of {new Date().toLocaleTimeString()}</p>
                                    </div>
                                    <div className="p-4 bg-surface/30 rounded-xl">
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Transactions</p>
                                        <p className="text-3xl font-mono font-black text-text">
                                            {Math.floor(restaurant.dailyTransactions * 0.67)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-surface/30 rounded-xl">
                                        <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Avg Spend</p>
                                        <p className="text-3xl font-mono font-black text-text">
                                            ${restaurant.avgCustomerSpend}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Revenue Trend */}
                            <Card className="p-6 bg-white border border-surface">
                                <h2 className="text-2xl font-black text-text mb-6">6-Month Revenue Trend</h2>
                                <div className="flex items-end justify-between gap-4 h-64">
                                    {financialHistory.map((month, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full flex flex-col justify-end flex-1">
                                                <div
                                                    className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                                                    style={{ height: `${(month.revenue / 1500000) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-text">{month.month}</p>
                                                <p className="text-xs text-text opacity-50 font-mono">
                                                    ${(month.revenue / 1000).toFixed(0)}k
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Share Distribution */}
                            <Card className="p-6 bg-white border border-surface">
                                <h3 className="text-lg font-black text-text mb-4">Share Distribution</h3>
                                <div className="space-y-4">
                                    {shareholders.map((holder, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-text">{holder.name}</span>
                                                <span className="text-sm font-bold text-primary">{holder.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-surface rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${holder.percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-text opacity-70 mt-1">
                                                {holder.shares.toLocaleString()} shares
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Available Shares */}
                            <Card className="p-6 bg-primary text-background">
                                <h3 className="text-lg font-black mb-3">Available for Purchase</h3>
                                <p className="text-4xl font-mono font-black mb-2">
                                    {restaurant.availableShares.toLocaleString()}
                                </p>
                                <p className="text-sm opacity-90">
                                    Out of {restaurant.totalShares.toLocaleString()} total shares
                                </p>
                                <Button
                                    onClick={() => router.push(`/trade?restaurant=${restaurant.id}&action=buy`)}
                                    className="w-full mt-6 bg-background hover:bg-surface text-primary h-12 rounded-xl font-black uppercase tracking-widest"
                                >
                                    Buy Shares
                                </Button>
                            </Card>

                            {/* Operations */}
                            <Card className="p-6 bg-white border border-surface">
                                <h3 className="text-lg font-black text-text mb-4">Operations</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text opacity-70">Employees</span>
                                        <span className="font-bold text-text">{restaurant.employees}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text opacity-70">Daily Customers</span>
                                        <span className="font-bold text-text">{restaurant.dailyTransactions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text opacity-70">Avg Check Size</span>
                                        <span className="font-bold text-text">${restaurant.avgCustomerSpend}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Financials Tab */}
                {activeTab === 'financials' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-6 bg-white border border-surface">
                            <h2 className="text-2xl font-black text-text mb-6">Monthly Financials</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl">
                                    <span className="font-medium text-text">Gross Revenue</span>
                                    <span className="text-2xl font-mono font-black text-text">
                                        ${restaurant.monthlyRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-surface/30 rounded-xl">
                                    <span className="font-medium text-text">Operating Costs</span>
                                    <span className="text-2xl font-mono font-black text-text">
                                        ${restaurant.monthlyCosts.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border-2 border-primary">
                                    <span className="font-medium text-primary">Net Profit</span>
                                    <span className="text-2xl font-mono font-black text-primary">
                                        ${(restaurant.monthlyRevenue - restaurant.monthlyCosts).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border border-surface">
                            <h2 className="text-2xl font-black text-text mb-6">Dividend Distribution</h2>
                            <p className="text-sm text-text opacity-70 mb-4">
                                Shareholders receive 60% of net profits, distributed weekly
                            </p>
                            <div className="p-6 bg-primary rounded-xl text-background">
                                <p className="text-sm opacity-90 mb-2">Next Dividend (per share)</p>
                                <p className="text-4xl font-mono font-black">
                                    ${((restaurant.monthlyRevenue - restaurant.monthlyCosts) * 0.6 / restaurant.totalShares / 4).toFixed(2)}
                                </p>
                                <p className="text-xs opacity-80 mt-2">Paid weekly</p>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Governance Tab */}
                {activeTab === 'governance' && (
                    <Card className="p-6 bg-white border border-surface">
                        <h2 className="text-2xl font-black text-text mb-6">Shareholder Governance</h2>
                        <div className="text-center py-12">
                            <Vote size={64} className="text-text opacity-30 mx-auto mb-4" />
                            <p className="text-lg font-bold text-text mb-2">No Active Proposals</p>
                            <p className="text-sm text-text opacity-70">
                                Shareholders will vote on major decisions like menu changes, expansions, and strategic partnerships
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

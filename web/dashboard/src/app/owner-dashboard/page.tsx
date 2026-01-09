"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building, TrendingUp, Users, DollarSign, Vote,
    Download, Eye, Settings, BarChart3, Calendar
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function OwnerDashboardPage() {
    const router = useRouter();

    const restaurant = {
        name: 'Cairo Grill Prime',
        sharePrice: 125.50,
        priceChange24h: 5.2,
        totalShares: 20000,
        sharesSold: 17500,
        sharesAvailable: 2500,
        capitalRaised: 2193750,
        marketCap: 2510000,
        shareholderCount: 342,
        dailyRevenue: 45000,
        monthlyRevenue: 1350000,
        monthlyCosts: 850000,
        nextDividendPayout: 300000
    };

    const recentTransactions = [
        { date: '2025-01-10', buyer: 'Investor #2841', shares: 50, price: 125.50 },
        { date: '2025-01-10', buyer: 'Investor #1923', shares: 25, price: 125.30 },
        { date: '2025-01-09', buyer: 'Investor #3104', shares: 100, price: 124.80 },
        { date: '2025-01-09', buyer: 'Investor #   2456', shares: 75, price: 124.50 }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">Owner Dashboard</h1>
                            <p className="text-text opacity-70">Manage your restaurant listing and investor relations</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="h-12 px-6 rounded-xl font-bold"
                            >
                                <Settings size={18} className="mr-2" />
                                Settings
                            </Button>
                            <Button
                                onClick={() => router.push(`/restaurant/${restaurant.name}`)}
                                className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black"
                            >
                                <Eye size={18} className="mr-2" />
                                View Public Page
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Restaurant Info Card */}
                <Card className="p-6 bg-white border border-surface mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-text mb-2">{restaurant.name}</h2>
                            <div className="flex items-center gap-4 text-sm text-text opacity-70">
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    {restaurant.shareholderCount} shareholders
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building size={16} />
                                    {restaurant.sharesSold.toLocaleString()} / {restaurant.totalShares.toLocaleString()} shares sold
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-mono font-black text-primary">
                                ${restaurant.sharePrice}
                            </p>
                            <p className="text-lg font-bold text-primary">
                                +{restaurant.priceChange24h}% (24h)
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} className="text-primary" />
                            <TrendingUp size={16} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Capital Raised
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            ${(restaurant.capitalRaised / 1000000).toFixed(1)}M
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Market Cap
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            ${(restaurant.marketCap / 1000000).toFixed(1)}M
                        </p>
                    </Card>

                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center justify-between mb-2">
                            <Users size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                            Shareholders
                        </p>
                        <p className="text-3xl font-black font-mono text-text">
                            {restaurant.shareholderCount}
                        </p>
                    </Card>

                    <Card className="p-6 bg-primary text-background">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={24} />
                        </div>
                        <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">
                            Next Dividend
                        </p>
                        <p className="text-3xl font-black font-mono">
                            ${(restaurant.nextDividendPayout / 1000).toFixed(0)}k
                        </p>
                        <p className="text-xs opacity-80 mt-1">Due in 3 days</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Share Transactions */}
                        <Card className="p-6 bg-white border border-surface">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-text">Recent Share Transactions</h2>
                                <Button variant="outline" className="h-10 px-4 rounded-lg font-bold text-sm">
                                    <Download size={16} className="mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {recentTransactions.map((tx, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-surface/30 rounded-lg hover:bg-surface/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-text">{tx.buyer}</p>
                                            <p className="text-xs text-text opacity-70">{tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-primary">
                                                {tx.shares} shares @ ${tx.price}
                                            </p>
                                            <p className="text-xs text-text opacity-70">
                                                Total: ${(tx.shares * tx.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Revenue Performance */}
                        <Card className="p-6 bg-white border border-surface">
                            <h2 className="text-2xl font-black text-text mb-6">Monthly Performance</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-surface/30 rounded-xl">
                                    <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Revenue</p>
                                    <p className="text-3xl font-mono font-black text-text">
                                        ${(restaurant.monthlyRevenue / 1000).toFixed(0)}k
                                    </p>
                                </div>
                                <div className="p-4 bg-surface/30 rounded-xl">
                                    <p className="text-xs text-text opacity-50 uppercase font-bold mb-2">Costs</p>
                                    <p className="text-3xl font-mono font-black text-text">
                                        ${(restaurant.monthlyCosts / 1000).toFixed(0)}k
                                    </p>
                                </div>
                                <div className="p-4 bg-primary/10 rounded-xl">
                                    <p className="text-xs text-primary opacity-70 uppercase font-bold mb-2">Net Profit</p>
                                    <p className="text-3xl font-mono font-black text-primary">
                                        ${((restaurant.monthlyRevenue - restaurant.monthlyCosts) / 1000).toFixed(0)}k
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Share Availability */}
                        <Card className="p-6 bg-white border border-surface">
                            <h3 className="text-lg font-black text-text mb-4">Share Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-text">Shares Sold</span>
                                        <span className="text-sm font-bold text-primary">
                                            {((restaurant.sharesSold / restaurant.totalShares) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-surface rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${(restaurant.sharesSold / restaurant.totalShares) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-text opacity-70 mt-1">
                                        {restaurant.sharesSold.toLocaleString()} / {restaurant.totalShares.toLocaleString()}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-surface">
                                    <p className="text-xs text-text opacity-50 uppercase font-bold mb-1">Available</p>
                                    <p className="text-2xl font-mono font-black text-text">
                                        {restaurant.sharesAvailable.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Governance */}
                        <Card className="p-6 bg-white border border-surface">
                            <h3 className="text-lg font-black text-text mb-4">Governance</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-surface/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Vote size={16} className="text-primary" />
                                        <p className="text-sm font-bold text-text">Active Proposals</p>
                                    </div>
                                    <p className="text-3xl font-black text-text">0</p>
                                </div>
                                <Button
                                    className="w-full bg-primary hover:opacity-90 text-background h-10 rounded-lg font-bold"
                                >
                                    Create Proposal
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-6 bg-primary text-background">
                            <h3 className="text-lg font-black mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full p-3 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-bold text-left transition-colors">
                                    Update Business Info
                                </button>
                                <button className="w-full p-3 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-bold text-left transition-colors">
                                    Issue More Shares
                                </button>
                                <button className="w-full p-3 bg-background/20 hover:bg-background/30 rounded-lg text-sm font-bold text-left transition-colors">
                                    Download Reports
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

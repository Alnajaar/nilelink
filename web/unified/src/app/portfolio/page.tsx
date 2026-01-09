"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Wallet, ArrowUpRight, Plus, TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import useSWR from 'swr';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Restaurant {
    restaurantName: string;
    investment: number;
    ownershipPercent: number;
    restaurantAddress?: string;
    kpis?: Record<string, any>;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PortfolioPage() {
    const [walletAddress, setWalletAddress] = useState('0x742d35Cc657A8b1F4d2b5C8b3E4aF2E6b9C1D3F5'); // Mock wallet for demo

    const { data: portfolioData, error, isLoading } = useSWR(
        walletAddress ? `/api/investor/portfolio?walletAddress=${walletAddress}` : null,
        fetcher,
        { refreshInterval: 30000 } // Refresh every 30 seconds
    );

    const { data: dividendsData } = useSWR(
        walletAddress ? `/api/investor/dividends?walletAddress=${walletAddress}` : null,
        fetcher,
        { refreshInterval: 30000 }
    );

    const portfolio = portfolioData?.portfolio || {};
    const restaurants: Restaurant[] = portfolioData?.restaurants || [];
    const dividends = dividendsData?.accruedDividends || 0;

    // Prepare chart data
    const chartData = {
        labels: restaurants.map(r => r.restaurantName),
        datasets: [{
            data: restaurants.map(r => r.investment),
            backgroundColor: [
                '#0A2540', '#00C389', '#F5B301', '#00C389',
                '#4A1C1C', '#0A2540', '#00C389', '#F5B301'
            ],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#ffffff',
                    font: { size: 12, weight: 'bold' as const },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: (context: any) => `${context.parsed.toLocaleString()}`
                }
            }
        }
    };

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-[1600px] mx-auto">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Failed to load portfolio</h2>
                        <p className="text-zinc-500">Please try again later or connect your wallet.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">My Portfolio</h1>
                        <p className="text-zinc-500 font-medium">Manage your restaurant investments and node ownership.</p>
                    </div>
                    <Button className="h-12 px-6 bg-accent hover:bg-accent-dark text-text-inverse font-bold text-sm shadow-xl shadow-accent/20 flex items-center gap-2">
                        <Plus size={18} />
                        New Investment
                    </Button>
                </header>

                {/* Portfolio Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-blue-500/10">
                                <DollarSign size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Invested</p>
                                <p className="text-2xl font-black text-white">
                                    ${isLoading ? '...' : portfolio.totalInvestment?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-emerald-500/10">
                                <TrendingUp size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total ROI</p>
                                <p className="text-2xl font-black text-white">
                                    ${isLoading ? '...' : portfolio.totalROI?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-purple-500/10">
                                <Building2 size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Restaurants</p>
                                <p className="text-2xl font-black text-white">
                                    {isLoading ? '...' : portfolio.restaurantCount || '0'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-orange-500/10">
                                <Wallet size={20} className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dividends</p>
                                <p className="text-2xl font-black text-white">
                                    ${isLoading ? '...' : dividends.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Investment Distribution Chart */}
                    <GlassCard className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Investment Distribution</h3>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                {restaurants.length} Holdings
                            </Badge>
                        </div>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : restaurants.length > 0 ? (
                            <div className="h-80 w-full">
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-30">
                                <div className="text-center">
                                    <PieChart size={48} className="mx-auto mb-4 text-zinc-600" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No investments found</p>
                                    <p className="text-xs text-zinc-500 mt-2">Start investing in restaurants to see your portfolio distribution.</p>
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    {/* Dividend Management */}
                    <div className="space-y-8">
                        <GlassCard className="bg-emerald-500/5 border-emerald-500/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Wallet size={20} className="text-emerald-500" />
                                <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Accrued Dividends</span>
                            </div>
                            <div className="text-4xl font-black text-white mb-2">
                                ${isLoading ? '...' : dividends.toLocaleString() || '0.00'}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mb-6">
                                <ArrowUpRight size={14} /> Ready to Claim
                            </div>
                            <Button
                                disabled={dividends <= 0}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-600 text-white font-bold text-sm uppercase tracking-widest rounded-xl"
                            >
                                Withdraw Dividends
                            </Button>
                        </GlassCard>

                        {/* ROI Summary */}
                        <GlassCard>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Portfolio Performance</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-zinc-500">ROI Percentage</span>
                                    <span className={`text-sm font-bold ${portfolio.roiPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {portfolio.roiPercentage?.toFixed(1) || '0.0'}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-zinc-500">Payback Period</span>
                                    <span className="text-sm font-bold text-white">{portfolio.paybackPeriod || '0'} months</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-zinc-500">Dividend Yield</span>
                                    <span className="text-sm font-bold text-white">{portfolio.dividendYield?.toFixed(1) || '0.0'}%</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Restaurant Holdings */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-8">Restaurant Holdings</h3>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <GlassCard key={i} className="animate-pulse">
                                    <div className="h-20 bg-white/5 rounded"></div>
                                </GlassCard>
                            ))}
                        </div>
                    ) : restaurants.length > 0 ? (
                        <div className="space-y-4">
                            {restaurants.map((restaurant: Restaurant, i: number) => (
                                <GlassCard key={i} className="hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <Building2 size={24} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{restaurant.restaurantName}</h4>
                                                <p className="text-sm text-zinc-500">{restaurant.restaurantAddress}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-white">${restaurant.investment.toLocaleString()}</div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                {restaurant.ownershipPercent}% ownership
                                            </div>
                                        </div>
                                    </div>
                                    {restaurant.kpis && Object.keys(restaurant.kpis).length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(restaurant.kpis).slice(0, 4).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="text-center">
                                                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{key}</div>
                                                        <div className="text-sm font-bold text-white">{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <GlassCard className="py-20 text-center border-dashed border-white/20">
                            <Building2 size={48} className="mx-auto mb-4 text-zinc-600" />
                            <h4 className="text-xl font-bold text-white mb-2">No Restaurant Investments</h4>
                            <p className="text-zinc-500 mb-6">Start investing in restaurant businesses to build your portfolio.</p>
                            <Button className="bg-blue-600 hover:bg-blue-500">
                                Discover Restaurants
                            </Button>
                        </GlassCard>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

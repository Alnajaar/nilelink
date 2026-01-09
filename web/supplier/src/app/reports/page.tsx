"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Package, Users, Download,
    Calendar, ArrowLeft, BarChart3, PieChart, Activity
} from 'lucide-react';

import { useAuth } from '@/shared/contexts/AuthContext';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function ReportsPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    const [analytics, setAnalytics] = useState({
        totalRevenue: 145600.00,
        totalOrders: 342,
        avgOrderValue: 425.73,
        topProducts: [
            { name: 'Roma Tomatoes', revenue: 12500, orders: 50 },
            { name: 'Chicken Breast', revenue: 10200, orders: 30 },
            { name: 'Basmati Rice', revenue: 9800, orders: 61 },
            { name: 'Olive Oil', revenue: 7200, orders: 15 },
            { name: 'Yellow Onions', revenue: 6900, orders: 77 }
        ],
        topCustomers: [
            { name: 'Cairo Grill', orders: 45, revenue: 25000 },
            { name: 'Nile Bistro', orders: 38, revenue: 19500 },
            { name: 'Delta Kitchen', orders: 32, revenue: 18000 }
        ],
        monthlyTrend: [
            { month: 'Jan', revenue: 38000 },
            { month: 'Feb', revenue: 42000 },
            { month: 'Mar', revenue: 45000 },
            { month: 'Apr', revenue: 48000 },
            { month: 'May', revenue: 52000 },
            { month: 'Jun', revenue: 56000 }
        ]
    });

    const handleExport = () => {
        alert('Exporting report to CSV...');
    };

    return (
        <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-white border-b border-surface px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-surface rounded-lg">
                                <ArrowLeft size={20} className="text-text" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-text">Analytics & Reports</h1>
                                <p className="text-sm text-text opacity-70">Track performance and insights</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Date Range Filter */}
                            <div className="flex gap-2">
                                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${dateRange === range
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleExport} variant="outline" className="h-12 px-6 rounded-xl font-bold">
                                <Download size={18} className="mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6 bg-white border border-surface">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <DollarSign size={24} className="text-primary" />
                                </div>
                                <TrendingUp size={16} className="text-primary" />
                            </div>
                            <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                                Total Revenue
                            </p>
                            <p className="text-3xl font-black font-mono text-text">
                                ${analytics.totalRevenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-primary font-bold mt-2">+12.5% vs last period</p>
                        </Card>

                        <Card className="p-6 bg-white border border-surface">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Package size={24} className="text-primary" />
                                </div>
                                <Activity size={16} className="text-text opacity-50" />
                            </div>
                            <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">
                                Total Orders
                            </p>
                            <p className="text-3xl font-black font-mono text-text">
                                {analytics.totalOrders}
                            </p>
                            <p className="text-xs text-primary font-bold mt-2">+8.3% vs last period</p>
                        </Card>

                        <Card className="p-6 bg-primary text-background">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-background/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 size={24} />
                                </div>
                                <TrendingUp size={16} />
                            </div>
                            <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">
                                Avg Order Value
                            </p>
                            <p className="text-3xl font-black font-mono">
                                ${analytics.avgOrderValue.toFixed(2)}
                            </p>
                            <p className="text-xs font-bold mt-2 opacity-80">+3.2% vs last period</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Products */}
                        <Card className="p-6 bg-white border border-surface">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Package size={20} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-black text-text">Top Products</h2>
                            </div>

                            <div className="space-y-3">
                                {analytics.topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg hover:bg-surface/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                <span className="text-background font-black text-sm">#{idx + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-text">{product.name}</p>
                                                <p className="text-xs text-text opacity-50">{product.orders} orders</p>
                                            </div>
                                        </div>
                                        <p className="font-mono font-black text-primary">
                                            ${product.revenue.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Top Customers */}
                        <Card className="p-6 bg-white border border-surface">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Users size={20} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-black text-text">Top Customers</h2>
                            </div>

                            <div className="space-y-3">
                                {analytics.topCustomers.map((customer, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg hover:bg-surface/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                <span className="text-background font-black text-sm">#{idx + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-text">{customer.name}</p>
                                                <p className="text-xs text-text opacity-50">{customer.orders} orders</p>
                                            </div>
                                        </div>
                                        <p className="font-mono font-black text-primary">
                                            ${customer.revenue.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Monthly Trend Chart (Simplified) */}
                    <Card className="p-6 bg-white border border-surface mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-primary" />
                            </div>
                            <h2 className="text-xl font-black text-text">Revenue Trend</h2>
                        </div>

                        <div className="flex items-end justify-between gap-4 h-64">
                            {analytics.monthlyTrend.map((month, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col justify-end flex-1">
                                        <div
                                            className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                                            style={{ height: `${(month.revenue / 60000) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-text">{month.month}</p>
                                        <p className="text-xs text-text opacity-50 font-mono">${(month.revenue / 1000).toFixed(0)}k</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    {/* Settlement Matrix (Phase 12) */}
                    <div className="mt-12">
                        <SettlementMatrix />
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

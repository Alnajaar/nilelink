"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeft,
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    Activity,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState('Last 7 Days');

    // Mock Chart Data (Visual representation only)
    const chartBars = [40, 65, 45, 80, 55, 90, 70];

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full" onClick={() => router.push('/admin')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Business Analytics</h1>
                        <p className="text-text-muted font-medium">Deep dive into your sales, staff performance, and inventory velocity.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={16} />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-white border border-border-subtle h-10 pl-10 pr-4 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option>Today</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        Export Report
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">
                {/* Executive Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Revenue', value: '$48,294.00', change: '+12.5%', icon: DollarSign, color: 'text-success' },
                        { label: 'Total Orders', value: '1,842', change: '+5.2%', icon: ShoppingBag, color: 'text-primary' },
                        { label: 'Avg. Order', value: '$26.21', change: '-1.4%', icon: TrendingUp, color: 'text-warning' },
                        { label: 'New Customers', value: '142', change: '+8.1%', icon: Users, color: 'text-info' }
                    ].map((stat, idx) => (
                        <Card key={idx} className="p-6 bg-white border-border-subtle shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-background-subtle to-transparent rounded-bl-full -mr-4 -mt-4"></div>
                            <div className="relative z-10 flex justify-between items-start mb-4">
                                <div className={`p-3 bg-background-subtle rounded-xl ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <Badge variant={stat.change.startsWith('+') ? 'success' : 'error'} className="text-[10px]">
                                    {stat.change}
                                </Badge>
                            </div>
                            <p className="text-xs font-black text-text-subtle uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-text-main tracking-tight">{stat.value}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <Card className="lg:col-span-2 p-8 bg-white border-border-subtle shadow-sm h-96 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black text-text-main uppercase tracking-tight">Revenue Trends</h3>
                            <div className="flex items-center gap-4 text-xs font-bold text-text-muted">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Dine-In</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Delivery</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 border-b border-border-subtle">
                            {chartBars.map((height, i) => (
                                <div key={i} className="w-full bg-background-subtle rounded-t-xl relative group h-full flex items-end">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className="w-full bg-primary rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            ${height * 140}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs font-bold text-text-subtle uppercase tracking-widest px-4">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </Card>

                    {/* Top Products */}
                    <Card className="p-8 bg-white border-border-subtle shadow-sm flex flex-col">
                        <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-8">Top Products</h3>
                        <div className="flex-1 space-y-6">
                            {[
                                { name: 'Latte', sales: 482, revenue: '$2,410' },
                                { name: 'Espresso', sales: 390, revenue: '$1,170' },
                                { name: 'Avocado Toast', sales: 210, revenue: '$2,520' },
                                { name: 'Croissant', sales: 185, revenue: '$740' },
                                { name: 'Iced Tea', sales: 140, revenue: '$560' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center text-xs font-black text-text-muted">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-text-subtle uppercase tracking-widest">{item.sales} sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-text-main">{item.revenue}</p>
                                        <ArrowUpRight size={14} className="ml-auto text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-xs uppercase tracking-widest font-black text-text-subtle hover:text-primary">
                            View Full Menu Report
                        </Button>
                    </Card>
                </div>
            </main>
        </div>
    );
}

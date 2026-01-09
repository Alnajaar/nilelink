"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    RefreshCw,
    ArrowLeft,
    Activity,
    Zap,
    Scale,
    BarChart3,
    Clock,
    Users,
    ShoppingCart,
    Target,
    Calendar,
    Download,
    Filter,
    TrendingDown,
    Package,
    User,
    AlertTriangle,
    Award
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
    const router = useRouter();
    const { journalEngine } = usePOS();
    const [report, setReport] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
    const [selectedMetric, setSelectedMetric] = useState<'sales' | 'customers' | 'inventory' | 'staff'>('sales');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Enhanced analytics data
    const [analyticsData, setAnalyticsData] = useState({
        // Sales metrics
        sales: {
            totalRevenue: 12480.50,
            totalOrders: 342,
            avgOrderValue: 36.49,
            topItems: [
                { name: 'Wagyu Burger', sold: 45, revenue: 2250.00 },
                { name: 'Truffle Fries', sold: 67, revenue: 1005.00 },
                { name: 'Matcha Latte', sold: 89, revenue: 445.00 }
            ],
            hourlySales: [120, 180, 240, 320, 280, 380, 450, 520, 480, 420, 380, 350, 420, 480, 520, 580, 620, 580, 520, 450, 380, 320, 250, 180],
            paymentMethods: [
                { method: 'Cash', amount: 4200.50, percentage: 34 },
                { method: 'Card', amount: 5800.00, percentage: 46 },
                { method: 'Crypto', amount: 2480.00, percentage: 20 }
            ]
        },
        // Customer analytics
        customers: {
            totalCustomers: 1250,
            newCustomers: 89,
            repeatCustomers: 342,
            avgSpend: 42.50,
            customerSatisfaction: 4.7,
            popularTimes: ['12:00-14:00', '18:00-20:00', '19:00-21:00']
        },
        // Inventory insights
        inventory: {
            totalValue: 14250.00,
            lowStockItems: 8,
            outOfStockItems: 2,
            turnoverRate: 2.3,
            wastePercentage: 3.2,
            topSelling: ['Ground Beef', 'Burger Buns', 'Cheddar Cheese']
        },
        // Staff performance
        staff: {
            totalStaff: 12,
            activeShifts: 8,
            avgPerformance: 94.2,
            topPerformers: [
                { name: 'Ahmed Hassan', role: 'Manager', score: 98 },
                { name: 'Sarah Jones', role: 'Server', score: 96 },
                { name: 'Mike Ross', role: 'Chef', score: 95 }
            ],
            attendanceRate: 97.5
        }
    });

    useEffect(() => {
        if (journalEngine) {
            const pl = journalEngine.getReport('PL');
            setReport(pl);
        } else {
            // Mock data if engine not ready
            setReport({
                totalRevenue: 12480.50,
                totalExpenses: 8240.20,
                netProfit: 4240.30,
                revenue: [
                    { name: 'Dine-in Sales', code: 'REV-01', balance: 8400.00 },
                    { name: 'Takeaway Sales', code: 'REV-02', balance: 3200.50 },
                    { name: 'Delivery Revenue', code: 'REV-03', balance: 880.00 },
                ],
                expenses: [
                    { name: 'Proteins & Meat', code: 'EXP-10', balance: 4200.00 },
                    { name: 'Bakery & Grains', code: 'EXP-20', balance: 1200.00 },
                    { name: 'Dairy & Veg', code: 'EXP-30', balance: 2840.20 },
                ]
            });
        }
    }, [journalEngine, refreshTrigger]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (!mounted) return null;

    if (!report) return (
        <div className="h-screen flex items-center justify-center bg-neutral">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-border-subtle shrink-0">
                <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="w-12 h-12 p-0 rounded-2xl border-border-subtle bg-white hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Intelligence Engine active</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                                Business <span className="text-primary">Intelligence</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Time Range Selector */}
                        <div className="flex bg-white/50 p-1.5 rounded-[2rem] border border-border-subtle shadow-xl items-center h-14">
                            {(['today', 'week', 'month', 'year'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`h-full px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-text-primary/40 hover:text-text-primary'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="h-14 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 px-8"
                        >
                            <RefreshCw size={18} className="mr-3" /> Execute Refresh
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 relative z-10 space-y-12">
                {/* Metric Selector Matrix */}
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {[
                        { id: 'sales', label: 'Revenue Streams', icon: DollarSign },
                        { id: 'customers', label: 'Network Insights', icon: Users },
                        { id: 'inventory', label: 'Resource Stock', icon: Package },
                        { id: 'staff', label: 'Operator KPIs', icon: Target }
                    ].map((metric) => (
                        <button
                            key={metric.id}
                            onClick={() => setSelectedMetric(metric.id as any)}
                            className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all whitespace-nowrap shadow-xl ${selectedMetric === metric.id
                                    ? 'bg-primary text-white border-primary border-none'
                                    : 'bg-white text-text-primary border-border-subtle hover:border-primary/50'
                                }`}
                        >
                            <metric.icon size={20} className={selectedMetric === metric.id ? 'text-white' : 'text-primary'} />
                            <span className="font-black uppercase tracking-[0.2em] text-xs italic">{metric.label}</span>
                        </button>
                    ))}
                </div>

                {/* KPI Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {selectedMetric === 'sales' && [
                        { label: 'Settlement Total', value: analyticsData.sales.totalRevenue, icon: DollarSign, color: 'primary', trend: '+12%', format: 'currency' },
                        { label: 'Total Executions', value: analyticsData.sales.totalOrders, icon: ShoppingCart, color: 'success', trend: '+8%', format: 'number' },
                        { label: 'Unit Avg Value', value: analyticsData.sales.avgOrderValue, icon: TrendingUp, color: 'info', trend: '+15%', format: 'currency' },
                        { label: 'Frame High Sales', value: Math.max(...analyticsData.sales.hourlySales), icon: Clock, color: 'warning', trend: '+22%', format: 'currency' },
                    ].map((kpi, idx) => (
                        <Card key={idx} className="p-10 rounded-[3rem] bg-white border-border-subtle shadow-2xl flex flex-col justify-between h-[220px] group hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-primary/5 text-primary">
                                    <kpi.icon size={24} />
                                </div>
                                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black italic">{kpi.trend}</div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-[0.4em] mb-2 italic">{kpi.label}</h3>
                                <p className="text-3xl font-black text-text-primary tracking-tighter italic">
                                    {kpi.format === 'currency' ? formatCurrency(kpi.value) : kpi.value.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    ))}

                    {selectedMetric === 'customers' && [
                        { label: 'Protocol Users', value: analyticsData.customers.totalCustomers, icon: Users, color: 'primary', trend: '+18%', format: 'number' },
                        { label: 'New Nodes', value: analyticsData.customers.newCustomers, icon: User, color: 'success', trend: '+25%', format: 'number' },
                        { label: 'Network Avg Spend', value: analyticsData.customers.avgSpend, icon: DollarSign, color: 'info', trend: '+12%', format: 'currency' },
                        { label: 'Loyalty Index', value: analyticsData.customers.customerSatisfaction, icon: Target, color: 'warning', trend: '+5%', format: 'rating' },
                    ].map((kpi, idx) => (
                        <Card key={idx} className="p-10 rounded-[3rem] bg-white border-border-subtle shadow-2xl flex flex-col justify-between h-[220px] group hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-secondary/5 text-secondary">
                                    <kpi.icon size={24} />
                                </div>
                                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black italic">{kpi.trend}</div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-[0.4em] mb-2 italic">{kpi.label}</h3>
                                <p className="text-3xl font-black text-text-primary tracking-tighter italic">
                                    {kpi.format === 'currency' ? formatCurrency(kpi.value) :
                                        kpi.format === 'rating' ? `${kpi.value}/5.0` :
                                            kpi.value.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    ))}

                    {selectedMetric === 'inventory' && [
                        { label: 'Vault Total Value', value: analyticsData.inventory.totalValue, icon: Package, color: 'primary', trend: '+8%', format: 'currency' },
                        { label: 'Inbound Alerts', value: analyticsData.inventory.lowStockItems, icon: AlertTriangle, color: 'warning', trend: '-15%', format: 'number' },
                        { label: 'Flow Matrix Rate', value: analyticsData.inventory.turnoverRate, icon: TrendingUp, color: 'success', trend: '+22%', format: 'decimal' },
                        { label: 'Leakage Ratio', value: analyticsData.inventory.wastePercentage, icon: TrendingDown, color: 'error', trend: '-8%', format: 'percentage' },
                    ].map((kpi, idx) => (
                        <Card key={idx} className="p-10 rounded-[3rem] bg-white border-border-subtle shadow-2xl flex flex-col justify-between h-[220px] group hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-primary/5 text-primary">
                                    <kpi.icon size={24} />
                                </div>
                                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black italic">{kpi.trend}</div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-[0.4em] mb-2 italic">{kpi.label}</h3>
                                <p className="text-3xl font-black text-text-primary tracking-tighter italic">
                                    {kpi.format === 'currency' ? formatCurrency(kpi.value) :
                                        kpi.format === 'percentage' ? `${kpi.value}%` :
                                            kpi.format === 'decimal' ? `${kpi.value}x` :
                                                kpi.value.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    ))}

                    {selectedMetric === 'staff' && [
                        { label: 'Active Operators', value: analyticsData.staff.activeShifts, icon: Users, color: 'primary', trend: '+5%', format: 'number' },
                        { label: 'Efficiency Quota', value: analyticsData.staff.avgPerformance, icon: Target, color: 'success', trend: '+12%', format: 'percentage' },
                        { label: 'Uptime Ratio', value: analyticsData.staff.attendanceRate, icon: Clock, color: 'info', trend: '+98%', format: 'percentage' },
                        { label: 'Total Authorized', value: analyticsData.staff.totalStaff, icon: User, color: 'warning', trend: '0%', format: 'number' },
                    ].map((kpi, idx) => (
                        <Card key={idx} className="p-10 rounded-[3rem] bg-white border-border-subtle shadow-2xl flex flex-col justify-between h-[220px] group hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-secondary/5 text-secondary">
                                    <kpi.icon size={24} />
                                </div>
                                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black italic">{kpi.trend}</div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-[0.4em] mb-2 italic">{kpi.label}</h3>
                                <p className="text-3xl font-black text-text-primary tracking-tighter italic">
                                    {kpi.format === 'percentage' ? `${kpi.value}%` : kpi.value.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Analytical Overlays */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[600px]">
                    {/* Primary Insight Layer */}
                    <Card className="rounded-[4rem] bg-white border-border-subtle shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-12 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-1">Primary <span className="text-primary">Intelligence</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/30">Frame specific metrics</p>
                            </div>
                            <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center border border-border-subtle">
                                <BarChart3 size={20} className="text-primary" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                            {selectedMetric === 'sales' && analyticsData.sales.topItems.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex justify-between items-center p-8 rounded-[2.5rem] bg-neutral/50 border border-border-subtle hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary font-black shadow-xl border border-border-subtle group-hover:scale-110 transition-transform">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="font-black text-text-primary uppercase tracking-widest text-sm mb-1">{item.name}</div>
                                            <div className="text-[10px] text-text-primary/40 font-black uppercase tracking-[0.2em] italic">{item.sold} protocol units</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-primary italic tracking-tight">{formatCurrency(item.revenue)}</div>
                                </motion.div>
                            ))}

                            {selectedMetric === 'customers' && (
                                <div className="space-y-8">
                                    <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-primary italic">Live Traffic Density</h4>
                                        <div className="flex gap-4 h-32 items-end">
                                            {[40, 60, 80, 100, 70, 50, 90, 120, 100, 80, 60].map((h, i) => (
                                                <div key={i} className="flex-1 bg-primary/20 rounded-t-xl hover:bg-primary transition-colors cursor-help group relative" style={{ height: `${h}%` }}>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {h} Units
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {analyticsData.customers.popularTimes.map((time, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-8 rounded-[2.5rem] bg-neutral border border-border-subtle">
                                            <span className="font-black uppercase tracking-widest text-sm">{time} Status</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-success animate-pulse rounded-full" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-success">Peak Saturation</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedMetric === 'inventory' && analyticsData.inventory.topSelling.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-8 rounded-[2.5rem] bg-neutral border border-border-subtle">
                                    <div className="flex items-center gap-4">
                                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-sm">{item}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-primary bg-primary/10 px-4 py-2 rounded-full">High Flow</span>
                                </div>
                            ))}

                            {selectedMetric === 'staff' && analyticsData.staff.topPerformers.map((staff, idx) => (
                                <div key={idx} className="flex justify-between items-center p-8 rounded-[2.5rem] bg-neutral border border-border-subtle group hover:bg-white transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black italic shadow-xl group-hover:rotate-12 transition-transform">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <div className="font-black text-text-primary uppercase tracking-widest text-sm">{staff.name}</div>
                                            <div className="text-[10px] text-text-primary/40 font-black uppercase tracking-[0.2em] italic">{staff.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-success italic tracking-tight">{staff.score}%</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Secondary Insight Layer */}
                    <Card className="rounded-[4rem] bg-white border-border-subtle shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-12 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-1">Secondary <span className="text-secondary">Metrics</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary/30">Deep protocol analysis</p>
                            </div>
                            <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center border border-border-subtle">
                                <Activity size={20} className="text-secondary" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-4">
                            {selectedMetric === 'sales' && (
                                <div className="space-y-6">
                                    {analyticsData.sales.paymentMethods.map((method, idx) => (
                                        <div key={idx} className="p-8 rounded-[2.5rem] border border-border-subtle bg-neutral group hover:border-secondary/30 transition-all">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-black uppercase tracking-widest text-sm italic">{method.method} Settlement</h4>
                                                <span className="text-lg font-black text-secondary italic">{method.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-border-subtle">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${method.percentage}%` }}
                                                    transition={{ duration: 1, delay: idx * 0.2 }}
                                                    className="bg-secondary h-full rounded-full shadow-lg shadow-secondary/20"
                                                />
                                            </div>
                                            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 italic">Total Value: {formatCurrency(method.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedMetric === 'customers' && (
                                <div className="space-y-6">
                                    <div className="p-10 rounded-[3rem] bg-white border border-border-subtle shadow-inner">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Protocol Satisfaction</h4>
                                            <span className="text-2xl font-black text-secondary italic">{analyticsData.customers.customerSatisfaction}/5.0</span>
                                        </div>
                                        <div className="space-y-4">
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div key={star} className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black w-4">{star}</span>
                                                    <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-secondary h-full rounded-full"
                                                            style={{ width: star === 5 ? '70%' : star === 4 ? '15%' : '5%' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 rounded-[2.5rem] bg-neutral border border-border-subtle text-center">
                                            <div className="text-3xl font-black text-secondary italic mb-2">{analyticsData.customers.repeatCustomers}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Returning Nodes</div>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-neutral border border-border-subtle text-center">
                                            <div className="text-3xl font-black text-primary italic mb-2">{analyticsData.customers.newCustomers}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Node Discovery</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMetric === 'inventory' && (
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2.5rem] border border-border-subtle bg-error/5 group">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black uppercase tracking-[0.4em] text-xs italic text-error">Out of Stock Frames</h4>
                                            <AlertTriangle size={18} className="text-error" />
                                        </div>
                                        <div className="text-4xl font-black text-error italic">{analyticsData.inventory.outOfStockItems}</div>
                                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic text-error">Critical Reorder Priority</p>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] border border-border-subtle bg-warning/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-black uppercase tracking-[0.4em] text-xs italic text-warning">Low Stock Buffers</h4>
                                            <Scale size={18} className="text-warning" />
                                        </div>
                                        <div className="text-4xl font-black text-warning italic">{analyticsData.inventory.lowStockItems}</div>
                                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic text-warning">Standard Reorder Queue</p>
                                    </div>
                                </div>
                            )}

                            {selectedMetric === 'staff' && (
                                <div className="space-y-8">
                                    <div className="p-10 rounded-[3rem] bg-secondary/5 border border-secondary/20">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary italic">Consolidated Score</h4>
                                            <span className="text-2xl font-black text-secondary italic">{analyticsData.staff.avgPerformance}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-white border border-secondary/20 rounded-full overflow-hidden">
                                            <div className="bg-secondary h-full rounded-full" style={{ width: `${analyticsData.staff.avgPerformance}%` }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 rounded-[2.5rem] bg-neutral border border-border-subtle text-center">
                                            <div className="text-3xl font-black text-primary italic mb-2">{analyticsData.staff.attendanceRate}%</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Attendance Uptime</div>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-neutral border border-border-subtle text-center">
                                            <div className="text-3xl font-black text-secondary italic mb-2">{analyticsData.staff.activeShifts}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Live Operators</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>

            {/* Global Aesthetics */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
}

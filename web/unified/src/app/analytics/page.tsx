"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, MousePointer2, Activity, Zap, Globe, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/shared/components/Badge';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30D');

    // Mock data for charts - in real app, this would come from API
    const volumeData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Protocol Volume ($M)',
            data: [2.1, 2.8, 3.2, 4.1, 3.8, 5.2, 6.1, 7.3, 8.2, 9.1, 10.5, 12.2],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3b82f6',
        }]
    };

    const growthData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: [{
            label: 'Revenue Growth',
            data: [15, 22, 18, 28, 35, 42, 38, 55],
            backgroundColor: '#10b981',
            borderRadius: 4,
        }]
    };

    const regionalData = [
        { region: 'Middle East', growth: 24.5, volume: 45.2, flag: '🇸🇦' },
        { region: 'East Africa', growth: 18.3, volume: 32.1, flag: '🇰🇪' },
        { region: 'Central Asia', growth: 15.7, volume: 28.9, flag: '🇺🇿' },
        { region: 'West Africa', growth: 12.4, volume: 22.5, flag: '🇳🇬' },
        { region: 'South Asia', growth: 9.8, volume: 18.7, flag: '🇮🇳' },
    ];

    const liveMetrics = [
        { label: 'Avg Order Value', value: '$12.42', change: '+3.2%', icon: MousePointer2, color: 'text-blue-400' },
        { label: 'Settlement Time', value: '142ms', change: '-8.1%', icon: Clock, color: 'text-emerald-400' },
        { label: 'Network Latency', value: '12ms', change: '-2.3%', icon: Zap, color: 'text-purple-400' },
        { label: 'Active Nodes', value: '247', change: '+12', icon: Globe, color: 'text-orange-400' },
        { label: 'Protocol Fees (24h)', value: '$4,821', change: '+15.7%', icon: DollarSign, color: 'text-cyan-400' },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: (context: any) => `${context.parsed.y.toFixed(1)}M`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                    callback: (value: any) => `${value}M`
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: (context: any) => `${context.parsed.y.toFixed(1)}K`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                    callback: (value: any) => `${value}K`
                }
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Network Analytics</h1>
                        <p className="text-zinc-500 font-medium">Deep insights into protocol volume and edge node performance.</p>
                    </div>
                    <div className="flex gap-3">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Live Data
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            Updated 2m ago
                        </Badge>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Charts Section */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Volume Chart */}
                        <GlassCard className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Protocol Volume Trend</h3>
                                    <p className="text-sm text-zinc-500">Monthly transaction volume across all regions</p>
                                </div>
                                <div className="flex p-1 rounded-2xl bg-zinc-900 border border-white/5">
                                    {['7D', '30D', '90D', '1Y'].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === range
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                                                : 'text-zinc-500 hover:text-white'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <Line data={volumeData} options={chartOptions} />
                            </div>
                        </GlassCard>

                        {/* Growth and Regional Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <GlassCard className="p-8">
                                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Weekly Revenue Growth</h4>
                                <div className="h-48 mb-4">
                                    <Bar data={growthData} options={barOptions} />
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    <span className="font-bold text-emerald-500">+267% growth this month</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8">
                                <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Top Growth Regions</h4>
                                <div className="space-y-4">
                                    {regionalData.map((region, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{region.flag}</span>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{region.region}</div>
                                                    <div className="text-xs text-zinc-500">${region.volume}M volume</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-emerald-500">+{region.growth}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        {/* Regional Performance Grid */}
                        <GlassCard className="p-8">
                            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Regional Performance Overview</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regionalData.map((region, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xl">{region.flag}</span>
                                            <span className="text-sm font-bold text-white">{region.region}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">Volume</span>
                                                <span className="font-bold text-white">${region.volume}M</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">Growth</span>
                                                <span className="font-bold text-emerald-500">+{region.growth}%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                                                <div
                                                    className="bg-blue-500 h-1 rounded-full"
                                                    style={{ width: `${(region.volume / 50) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Live Metrics Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <GlassCard className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity size={20} className="text-blue-400" />
                                <h3 className="font-bold text-lg">Live Metrics</h3>
                            </div>
                            <div className="space-y-6">
                                {liveMetrics.map((metric, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl bg-white/5 ${metric.color}`}>
                                                <metric.icon size={16} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">
                                                    {metric.label}
                                                </div>
                                                <div className="text-sm font-bold text-white">{metric.value}</div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold ${metric.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {metric.change}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Network Health */}
                        <GlassCard className="p-8 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                Network Health
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Uptime</span>
                                    <span className="text-sm font-bold text-emerald-400">99.98%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Active Validators</span>
                                    <span className="text-sm font-bold text-white">1,247</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Block Time</span>
                                    <span className="text-sm font-bold text-white">2.1s</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                                    <div className="bg-emerald-500 h-2 rounded-full w-[99.98%]"></div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Quick Actions */}
                        <GlassCard className="p-8 border-dashed border-white/20">
                            <h4 className="font-bold text-lg mb-6">Quick Actions</h4>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold">
                                    Export Analytics Report
                                </button>
                                <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold">
                                    Configure Alerts
                                </button>
                                <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold">
                                    View Raw Data
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

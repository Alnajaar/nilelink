"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    FileText,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Clock,
    Calendar,
    Filter,
    BarChart3,
    PieChart,
    FileSpreadsheet,
    Printer
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

// Mock data for demonstration
const generateMockData = () => ({
    daily: {
        date: new Date().toISOString().split('T')[0],
        totalSales: 2847.50,
        totalOrders: 89,
        averageOrder: 32.05,
        cashSales: 1247.50,
        cardSales: 1450.00,
        cryptoSales: 150.00,
        refunds: 45.25,
        topItems: [
            { name: 'Wagyu Burger', quantity: 12, revenue: 600.00 },
            { name: 'Truffle Fries', quantity: 18, revenue: 270.00 },
            { name: 'Craft Beer', quantity: 15, revenue: 225.00 }
        ],
        hourlySales: [
            { hour: '10:00', sales: 120.50 },
            { hour: '11:00', sales: 180.25 },
            { hour: '12:00', sales: 245.75 },
            { hour: '13:00', sales: 320.00 },
            { hour: '14:00', sales: 280.50 },
            { hour: '15:00', sales: 195.25 },
            { hour: '16:00', sales: 165.00 },
            { hour: '17:00', sales: 220.75 },
            { hour: '18:00', sales: 395.25 },
            { hour: '19:00', sales: 524.25 },
            { hour: '20:00', sales: 400.00 }
        ]
    },
    weekly: {
        totalSales: 18542.75,
        totalOrders: 623,
        averageOrder: 29.77,
        dailyBreakdown: [
            { date: '2024-01-15', sales: 2847.50, orders: 89 },
            { date: '2024-01-16', sales: 3124.25, orders: 95 },
            { date: '2024-01-17', sales: 2654.00, orders: 78 },
            { date: '2024-01-18', sales: 2895.75, orders: 92 },
            { date: '2024-01-19', sales: 3247.50, orders: 98 },
            { date: '2024-01-20', sales: 3567.75, orders: 107 },
            { date: '2024-01-21', sales: 3206.00, orders: 64 }
        ]
    }
});

export default function ReportsPage() {
    const router = useRouter();
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState(generateMockData());

    const exportToPDF = async () => {
        setIsGenerating(true);
        try {
            // Mock PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, this would generate and download a PDF
            const element = document.createElement('a');
            element.href = '#'; // Mock PDF URL
            element.download = `nilelink-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
            element.click();

            console.log('PDF exported successfully');
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToExcel = async () => {
        setIsGenerating(true);
        try {
            // Mock Excel generation
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real implementation, this would generate and download an Excel file
            const element = document.createElement('a');
            element.href = '#'; // Mock Excel URL
            element.download = `nilelink-report-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
            element.click();

            console.log('Excel exported successfully');
        } catch (error) {
            console.error('Excel export failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const printReport = async () => {
        setIsGenerating(true);
        try {
            // Mock print functionality
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real implementation, this would send to printer
            window.print();

            console.log('Report sent to printer');
        } catch (error) {
            console.error('Print failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-background-subtle rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-text-main mb-2">Business Reports</h1>
                        <p className="text-text-muted font-medium text-lg">Comprehensive sales and performance analytics</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Report Type Selector */}
                    <div className="flex bg-surface rounded-xl p-1">
                        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setReportType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${
                                    reportType === type
                                        ? 'bg-primary text-background'
                                        : 'text-text-muted hover:text-text-main'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Export Actions */}
                    <Button
                        onClick={exportToPDF}
                        disabled={isGenerating}
                        className="gap-2"
                        variant="outline"
                    >
                        <FileText size={16} />
                        {isGenerating ? 'Generating...' : 'PDF'}
                    </Button>

                    <Button
                        onClick={exportToExcel}
                        disabled={isGenerating}
                        className="gap-2"
                        variant="outline"
                    >
                        <FileSpreadsheet size={16} />
                        {isGenerating ? 'Generating...' : 'Excel'}
                    </Button>

                    <Button
                        onClick={printReport}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        <Printer size={16} />
                        {isGenerating ? 'Printing...' : 'Print'}
                    </Button>
                </div>
            </div>

            {reportType === 'daily' && <DailyReport data={data.daily} />}
            {reportType === 'weekly' && <WeeklyReport data={data.weekly} />}
            {reportType === 'monthly' && <MonthlyReportPlaceholder />}
        </div>
    );
}

function DailyReport({ data }: { data: any }) {
    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">${data.totalSales.toFixed(2)}</p>
                            <p className="text-sm text-text-muted">Total Sales</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">{data.totalOrders}</p>
                            <p className="text-sm text-text-muted">Total Orders</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">${data.averageOrder.toFixed(2)}</p>
                            <p className="text-sm text-text-muted">Avg Order Value</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">{data.date}</p>
                            <p className="text-sm text-text-muted">Report Date</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                    <h3 className="text-xl font-black text-text-main mb-6">Payment Methods</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-text-main">Cash</span>
                            <span className="font-bold text-green-600">${data.cashSales.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(data.cashSales / data.totalSales) * 100}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-text-main">Card</span>
                            <span className="font-bold text-blue-600">${data.cardSales.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(data.cardSales / data.totalSales) * 100}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-text-main">Crypto</span>
                            <span className="font-bold text-purple-600">${data.cryptoSales.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${(data.cryptoSales / data.totalSales) * 100}%` }}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-8">
                    <h3 className="text-xl font-black text-text-main mb-6">Top Selling Items</h3>
                    <div className="space-y-4">
                        {data.topItems.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Badge variant="neutral" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                        {index + 1}
                                    </Badge>
                                    <span className="text-text-main font-medium">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-text-main">${item.revenue.toFixed(2)}</div>
                                    <div className="text-xs text-text-muted">{item.quantity} sold</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Hourly Sales Chart */}
            <Card className="p-8">
                <h3 className="text-xl font-black text-text-main mb-6">Hourly Sales Performance</h3>
                <div className="grid grid-cols-11 gap-2">
                    {data.hourlySales.map((hour: any, index: number) => (
                        <div key={index} className="text-center">
                            <div className="text-xs text-text-muted mb-2">{hour.hour}</div>
                            <div className="relative">
                                <div
                                    className="w-full bg-primary rounded-t"
                                    style={{
                                        height: `${Math.max((hour.sales / 600) * 100, 20)}px`,
                                        minHeight: '20px'
                                    }}
                                />
                            </div>
                            <div className="text-xs font-bold text-text-main mt-1">
                                ${hour.sales.toFixed(0)}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function WeeklyReport({ data }: { data: any }) {
    return (
        <div className="space-y-8">
            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 text-center">
                    <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-3xl font-black text-text-main">${data.totalSales.toLocaleString()}</p>
                    <p className="text-text-muted">Total Weekly Sales</p>
                </Card>

                <Card className="p-8 text-center">
                    <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-3xl font-black text-text-main">{data.totalOrders}</p>
                    <p className="text-text-muted">Total Orders</p>
                </Card>

                <Card className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-3xl font-black text-text-main">${data.averageOrder.toFixed(2)}</p>
                    <p className="text-text-muted">Average Order Value</p>
                </Card>
            </div>

            {/* Daily Breakdown */}
            <Card className="p-8">
                <h3 className="text-xl font-black text-text-main mb-6">Daily Performance</h3>
                <div className="space-y-4">
                    {data.dailyBreakdown.map((day: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-primary text-background rounded-lg flex items-center justify-center font-bold text-sm">
                                    {new Date(day.date).getDate()}
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">{day.date}</p>
                                    <p className="text-sm text-text-muted">{day.orders} orders</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-primary">${day.sales.toFixed(2)}</p>
                                <p className="text-sm text-text-muted">
                                    Avg: ${(day.sales / day.orders).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function MonthlyReportPlaceholder() {
    return (
        <Card className="p-16 text-center">
            <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-2xl font-black text-text-main mb-4">Monthly Report</h3>
            <p className="text-text-muted mb-8">
                Monthly reporting with advanced analytics and trend analysis coming soon.
            </p>
            <Badge variant="info" className="text-lg px-4 py-2">
                In Development
            </Badge>
        </Card>
    );
}
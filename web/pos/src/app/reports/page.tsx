/**
 * Reports & Analytics Page
 * Business intelligence and insights
 * 
 * FEATURES:
 * - Sales reports (daily, weekly, monthly)
 * - Revenue analytics
 * - Top selling products
 * - Employee performance
 * - Customer analytics
 * - Profit margins
 * - Tax reports
 * - Export capabilities
 * - Visual charts and graphs
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { complianceEngine } from '@shared/services/ComplianceEngine';
import { useRole } from '@shared/hooks/useGuard';

// ============================================
// TYPES
// ============================================

interface SalesReport {
    date: string;
    orders: number;
    revenue: number;
    profit: number;
    avgOrderValue: number;
}

interface ProductPerformance {
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
    profit: number;
}

interface AnalyticsData {
    salesReports: SalesReport[];
    topProducts: ProductPerformance[];
    totalRevenue: number;
    totalOrders: number;
    totalProfit: number;
    avgOrderValue: number;
    taxCollected: number;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';
type ReportType = 'sales' | 'products' | 'employees' | 'tax' | 'inventory';

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReportsPage() {
    const { isManager } = useRole(['MANAGER', 'ADMIN', 'SUPER_ADMIN']);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [activeReport, setActiveReport] = useState<ReportType>('sales');
    const [country, setCountry] = useState('SA'); // From business settings

    useEffect(() => {
        if (!isManager) {
            setError('Access denied');
            setLoading(false);
            return;
        }

        loadAnalytics();
    }, [isManager, timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // TODO: Get business ID from auth context
            const businessId = 'current-business-id';

            // Calculate date range
            const now = Math.floor(Date.now() / 1000);
            let fromDate = now;

            switch (timeRange) {
                case '7d': fromDate = now - (7 * 24 * 60 * 60); break;
                case '30d': fromDate = now - (30 * 24 * 60 * 60); break;
                case '90d': fromDate = now - (90 * 24 * 60 * 60); break;
                case '1y': fromDate = now - (365 * 24 * 60 * 60); break;
            }

            // Fetch orders
            const orders = await graphService.getOrdersByBusiness(businessId);
            const filteredOrders = orders.filter(o => o.createdAt >= fromDate);

            // Calculate metrics
            const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total), 0);
            const totalOrders = filteredOrders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Tax collected
            const taxCollected = filteredOrders.reduce((sum, o) => sum + Number(o.tax || 0), 0);

            // TODO: Calculate profit (need product costs)
            const totalProfit = 0;

            // Generate daily sales reports
            const salesByDate = new Map<string, { orders: number; revenue: number }>();
            filteredOrders.forEach(order => {
                const date = new Date(order.createdAt * 1000).toLocaleDateString();
                const existing = salesByDate.get(date) || { orders: 0, revenue: 0 };
                salesByDate.set(date, {
                    orders: existing.orders + 1,
                    revenue: existing.revenue + Number(order.total),
                });
            });

            const salesReports: SalesReport[] = Array.from(salesByDate.entries()).map(([date, data]) => ({
                date,
                orders: data.orders,
                revenue: data.revenue,
                profit: 0, // TODO: Calculate
                avgOrderValue: data.revenue / data.orders,
            }));

            // Top products (TODO: Need order items data)
            const topProducts: ProductPerformance[] = [];

            setAnalytics({
                salesReports,
                topProducts,
                totalRevenue,
                totalOrders,
                totalProfit,
                avgOrderValue,
                taxCollected,
            });

            setError(null);
        } catch (err: any) {
            console.error('[Reports] Failed to load:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        if (!analytics) return;

        // Create CSV content
        let csv = '';

        if (activeReport === 'sales') {
            csv = 'Date,Orders,Revenue,Profit,Avg Order Value\n';
            analytics.salesReports.forEach(report => {
                csv += `${report.date},${report.orders},${report.revenue.toFixed(2)},${report.profit.toFixed(2)},${report.avgOrderValue.toFixed(2)}\n`;
            });
        }

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport}-report-${timeRange}.csv`;
        a.click();
    };

    if (!isManager) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only managers can view reports</p>
                </div>
            </div>
        );
    }

    if (loading && !analytics) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-blue-400 text-center">
                    <div className="animate-spin text-6xl mb-4">📊</div>
                    <p className="text-sm uppercase tracking-wider">Generating Reports...</p>
                </div>
            </div>
        );
    }

    if (error && !analytics) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Error Loading Reports</h1>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={loadAnalytics}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                        Sales • Performance • Insights • Trends
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>

                    <button
                        onClick={handleExportReport}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold"
                    >
                        📥 Export CSV
                    </button>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
                {[
                    { id: 'sales', label: 'Sales', icon: '📈' },
                    { id: 'products', label: 'Products', icon: '📦' },
                    { id: 'tax', label: 'Tax', icon: '💰' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveReport(tab.id as ReportType)}
                        className={`px-6 py-3 rounded font-bold text-sm uppercase whitespace-nowrap transition-colors ${activeReport === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {analytics && (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard
                            label="Total Revenue"
                            value={`$${analytics.totalRevenue.toFixed(2)}`}
                            icon="💰"
                            color="green"
                        />
                        <MetricCard
                            label="Total Orders"
                            value={analytics.totalOrders.toLocaleString()}
                            icon="📋"
                            color="blue"
                        />
                        <MetricCard
                            label="Avg Order Value"
                            value={`$${analytics.avgOrderValue.toFixed(2)}`}
                            icon="📊"
                            color="purple"
                        />
                        <MetricCard
                            label="Tax Collected"
                            value={`$${analytics.taxCollected.toFixed(2)}`}
                            icon="🏛️"
                            color="yellow"
                        />
                    </div>

                    {/* Sales Report */}
                    {activeReport === 'sales' && analytics.salesReports.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <span>📈</span>
                                Daily Sales Performance
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Orders</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Revenue</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Avg Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {analytics.salesReports.map((report, idx) => (
                                            <tr key={idx} className="hover:bg-white/5">
                                                <td className="px-6 py-4 text-white">{report.date}</td>
                                                <td className="px-6 py-4 text-center text-white font-bold">{report.orders}</td>
                                                <td className="px-6 py-4 text-right text-green-400 font-bold text-lg">
                                                    ${report.revenue.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-300">
                                                    ${report.avgOrderValue.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Top Products */}
                    {activeReport === 'products' && (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <span>📦</span>
                                Top Selling Products
                            </h2>

                            {analytics.topProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.topProducts.map((product, idx) => (
                                        <div
                                            key={product.productId}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl font-black text-white/30">#{idx + 1}</div>
                                                <div>
                                                    <div className="text-white font-bold">{product.productName}</div>
                                                    <div className="text-gray-400 text-xs">{product.unitsSold} units sold</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-green-400 font-bold text-lg">
                                                    ${product.revenue.toFixed(2)}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    Profit: ${product.profit.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <div className="text-4xl mb-4">📭</div>
                                    <p>No product data available for this period</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tax Report */}
                    {activeReport === 'tax' && (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <span>💰</span>
                                Tax Report - {complianceEngine.getRules(country)?.countryName}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 rounded-lg p-6">
                                    <div className="text-gray-400 text-sm mb-2">Tax Rate</div>
                                    <div className="text-white text-3xl font-black">
                                        {complianceEngine.getRules(country)?.vatRate}%
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-6">
                                    <div className="text-gray-400 text-sm mb-2">Taxable Sales</div>
                                    <div className="text-white text-3xl font-black">
                                        ${(analytics.totalRevenue - analytics.taxCollected).toFixed(2)}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-6">
                                    <div className="text-gray-400 text-sm mb-2">Tax Collected</div>
                                    <div className="text-green-400 text-3xl font-black">
                                        ${analytics.taxCollected.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <h3 className="text-blue-400 font-bold mb-2">Tax Filing Information</h3>
                                <p className="text-blue-200 text-sm">
                                    This report can be used for tax filing purposes. Ensure all transactions are properly recorded.
                                    For {complianceEngine.getRules(country)?.countryName}, tax returns must be filed{' '}
                                    {complianceEngine.getRules(country)?.taxFilingFrequency || 'according to local regulations'}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Period Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-gray-300 text-sm mb-1">Best Day</div>
                                <div className="text-white font-bold">
                                    {analytics.salesReports.length > 0
                                        ? analytics.salesReports.reduce((best, current) =>
                                            current.revenue > best.revenue ? current : best
                                        ).date
                                        : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-300 text-sm mb-1">Total Transactions</div>
                                <div className="text-white font-bold">{analytics.totalOrders}</div>
                            </div>
                            <div>
                                <div className="text-gray-300 text-sm mb-1">Growth Rate</div>
                                <div className="text-green-400 font-bold">
                                    {/* TODO: Calculate based on previous period */}
                                    —
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function MetricCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string;
    icon: string;
    color: 'green' | 'blue' | 'purple' | 'yellow';
}) {
    const colors = {
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
        </div>
    );
}

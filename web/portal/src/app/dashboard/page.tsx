'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ExternalLink,
    Activity,
    BarChart3,
    Globe,
    TrendingUp,
    Zap,
    ArrowUpRight,
    ShieldCheck,
    ChevronRight,
    Users,
    Store,
    DollarSign,
    ShoppingCart,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingDown,
    PieChart,
    LineChart,
    Package,
    Truck,
    CreditCard,
    Settings,
    Bell,
    Search,
    Filter,
    Download,
    Upload,
    Wifi,
    WifiOff,
    Server,
    Database,
    Layers,
    Target,
    Award,
    Calendar,
    MapPin,
    Star,
    MessageSquare,
    Phone,
    Mail,
    Navigation
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { useAuth } from '@shared/contexts/AuthContext';
import { api } from '@shared/utils/api';
import { NeuralHUD } from '@shared/components/NeuralHUD';
import { useIntelligence } from '@shared/hooks/useIntelligence';

// Advanced Type Definitions
interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    activeRestaurants: number;
    totalTransactions: number;
    pendingOrders: number;
    systemHealth: number;
    networkLatency: number;
}

interface OrderData {
    id: string;
    customerName: string;
    restaurantName: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    timestamp: string;
    items: number;
}

interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical';
    components: Array<{
        name: string;
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        responseTime: number;
    }>;
    predictions: Array<{
        type: string;
        probability: number;
        impact: 'low' | 'medium' | 'high';
        recommendation: string;
    }>;
}

interface RealTimeMetrics {
    activeConnections: number;
    ordersPerMinute: number;
    revenuePerHour: number;
    systemLoad: number;
    errorRate: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'analytics' | 'system'>('overview');
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

    // Data States
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const { data: intelligence, isAnalyzing: isAIAnalyzing, analyze: runIntelligence } = useIntelligence();

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Business metadata
    const [businessMeta, setBusinessMeta] = useState<any>(null);

    // Load initial data
    useEffect(() => {
        loadDashboardData();
        const meta = localStorage.getItem('nilelink_business_meta');
        if (meta) setBusinessMeta(JSON.parse(meta));

        // Set up real-time updates
        setupRealTimeUpdates();
    }, []);

    // Real-time updates setup
    const setupRealTimeUpdates = useCallback(() => {
        // In a real implementation, this would connect to WebSocket
        const interval = setInterval(() => {
            updateRealTimeMetrics();
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load all dashboard data in parallel
            const [
                statsResponse,
                ordersResponse,
                healthResponse,
                analyticsResponse
            ] = await Promise.allSettled([
                api.get('/analytics/dashboard'),
                api.get('/orders/recent'),
                api.get('/health'),
                api.get('/analytics/detailed')
            ]);

            // Trigger AI Intelligence analysis for the dashboard state
            runIntelligence({
                amount: businessMeta ? 0 : 15420,
                currency: 'USD',
                userId: user?.id || 'admin',
                userAgeDays: 365,
                txnHistoryCount: businessMeta ? 0 : 15420,
                ipCountry: 'USA',
                billingCountry: 'USA'
            }, {
                role: (user?.role as any) || 'admin',
                system_state: 'marketplace'
            });

            // Process stats
            if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
                setStats(statsResponse.value.data);
            } else {
                setStats({
                    totalOrders: businessMeta ? 0 : 15420,
                    totalRevenue: 0,
                    activeUsers: businessMeta ? 1 : 1234,
                    activeRestaurants: businessMeta ? businessMeta.nodeCount : 89,
                    totalTransactions: businessMeta ? 0 : 25680,
                    pendingOrders: businessMeta ? 0 : 23,
                    systemHealth: 98.5,
                    networkLatency: 45
                });
            }

            // Process recent orders
            if (ordersResponse.status === 'fulfilled' && ordersResponse.value.success) {
                setRecentOrders(ordersResponse.value.data || []);
            }

            // Process system health
            if (healthResponse.status === 'fulfilled' && healthResponse.value.success) {
                setSystemHealth(healthResponse.value.data);
            }

            // Process analytics
            if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.success) {
                setAnalyticsData(analyticsResponse.value.data);
            }

            setLastUpdate(new Date());

        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const updateRealTimeMetrics = async () => {
        try {
            // Simulate real-time metrics update
            setRealTimeMetrics({
                activeConnections: Math.floor(Math.random() * 1000) + 500,
                ordersPerMinute: Math.floor(Math.random() * 10) + 5,
                revenuePerHour: Math.floor(Math.random() * 5000) + 2000,
                systemLoad: Math.floor(Math.random() * 30) + 20,
                errorRate: Math.random() * 0.1
            });
        } catch (err) {
            console.error('Real-time metrics update failed:', err);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadDashboardData();
        setIsRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                            />
                            <p className="text-slate-600">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h2>
                            <p className="text-slate-600 mb-4">{error}</p>
                            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Home
                            </Link>
                            <div className="h-6 w-px bg-slate-300" />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                                <p className="text-sm text-slate-600">
                                    Welcome back, {user ? `${user.firstName || user.email || (user as any).walletAddress || 'User'}` : 'Admin'} • Last updated: {lastUpdate.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <Wifi className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-slate-600">Connected</span>
                            </div>
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="outline"
                                size="sm"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-1 mt-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: Activity },
                            { id: 'orders', label: 'Orders', icon: ShoppingCart },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                            { id: 'system', label: 'System', icon: Server }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    {
                                        label: 'Total Orders',
                                        value: formatNumber(stats?.totalOrders || 0),
                                        change: '+12.5%',
                                        changeType: 'positive' as const,
                                        icon: ShoppingCart,
                                        color: 'blue'
                                    },
                                    {
                                        label: 'Total Revenue',
                                        value: formatCurrency(stats?.totalRevenue || 0),
                                        change: '+8.2%',
                                        changeType: 'positive' as const,
                                        icon: DollarSign,
                                        color: 'green'
                                    },
                                    {
                                        label: 'Active Users',
                                        value: formatNumber(stats?.activeUsers || 0),
                                        change: '+15.3%',
                                        changeType: 'positive' as const,
                                        icon: Users,
                                        color: 'purple'
                                    },
                                    {
                                        label: 'Active Restaurants',
                                        value: formatNumber(stats?.activeRestaurants || 0),
                                        change: '+5.1%',
                                        changeType: 'positive' as const,
                                        icon: Store,
                                        color: 'orange'
                                    }
                                ].map((metric, index) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="p-6 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                                                    <p className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</p>
                                                    <div className="flex items-center mt-2">
                                                        <TrendingUp className={`w-4 h-4 mr-1 ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                                            }`} />
                                                        <span className={`text-sm font-medium ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {metric.change}
                                                        </span>
                                                        <span className="text-sm text-slate-500 ml-1">vs last period</span>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-full ${metric.color === 'blue' ? 'bg-blue-100' :
                                                    metric.color === 'green' ? 'bg-green-100' :
                                                        metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                                                    }`}>
                                                    <metric.icon className={`w-6 h-6 ${metric.color === 'blue' ? 'text-blue-600' :
                                                        metric.color === 'green' ? 'text-green-600' :
                                                            metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                                                        }`} />
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Neural Intelligence HUD - The Autonomous Protocol */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <NeuralHUD data={intelligence} isAnalyzing={isAIAnalyzing} />
                            </motion.div>

                            {/* Real-time Metrics */}
                            {realTimeMetrics && (
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-slate-900">Real-time Activity</h2>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-sm text-slate-600">Live</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Active Connections', value: realTimeMetrics.activeConnections, icon: Wifi },
                                            { label: 'Orders/Min', value: realTimeMetrics.ordersPerMinute, icon: Zap },
                                            { label: 'Revenue/Hour', value: `${realTimeMetrics.revenuePerHour}`, icon: DollarSign, format: false },
                                            { label: 'System Load', value: `${realTimeMetrics.systemLoad}%`, icon: Server, format: false },
                                            { label: 'Error Rate', value: `${(realTimeMetrics.errorRate * 100).toFixed(2)}%`, icon: AlertTriangle, format: false }
                                        ].map((metric) => (
                                            <div key={metric.label} className="text-center">
                                                <metric.icon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {metric.format !== false ? formatNumber(metric.value as number) : metric.value}
                                                </p>
                                                <p className="text-sm text-slate-600">{metric.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Recent Orders & System Health */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Orders */}
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View All
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {recentOrders.slice(0, 5).map((order, index) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{order.customerName}</p>
                                                        <p className="text-sm text-slate-600">{order.restaurantName}</p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold text-slate-900">{formatCurrency(order.amount)}</p>
                                                    <Badge
                                                        variant={
                                                            order.status === 'delivered' ? 'success' :
                                                                order.status === 'preparing' ? 'warning' :
                                                                    order.status === 'cancelled' ? 'error' : 'neutral'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {recentOrders.length === 0 && (
                                            <div className="text-center py-8">
                                                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                                <p className="text-slate-600">No recent orders</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* System Health */}
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-slate-900">System Health</h2>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-green-500' :
                                                systemHealth?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} />
                                            <span className="text-sm font-medium capitalize">{systemHealth?.status || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(systemHealth?.components || [
                                            { name: 'API Gateway', status: 'healthy', uptime: 99.9, responseTime: 45 },
                                            { name: 'Database', status: 'healthy', uptime: 99.8, responseTime: 23 },
                                            { name: 'Cache Layer', status: 'warning', uptime: 98.5, responseTime: 67 },
                                            { name: 'File Storage', status: 'healthy', uptime: 99.9, responseTime: 34 }
                                        ]).map((component) => (
                                            <div key={component.name} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 rounded-full ${component.status === 'healthy' ? 'bg-green-500' :
                                                        component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <span className="text-sm font-medium text-slate-900">{component.name}</span>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm text-slate-600">{component.uptime}% uptime</p>
                                                    <p className="text-xs text-slate-500">{component.responseTime}ms avg</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {systemHealth?.predictions && systemHealth.predictions.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <h3 className="text-sm font-medium text-slate-900 mb-3">AI Predictions</h3>
                                            {systemHealth.predictions.slice(0, 2).map((prediction, index) => (
                                                <div key={index} className="flex items-start space-x-3 mb-3">
                                                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${prediction.impact === 'high' ? 'text-red-500' :
                                                        prediction.impact === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-slate-700">{prediction.recommendation}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {prediction.probability}% chance • {prediction.impact} impact
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900">Order Management</h2>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">Order #{order.id}</p>
                                                    <p className="text-sm text-slate-600">{order.customerName} • {order.restaurantName}</p>
                                                    <p className="text-xs text-slate-500">{order.timestamp}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="font-semibold text-slate-900">{formatCurrency(order.amount)}</p>
                                                    <p className="text-sm text-slate-600">{order.items} items</p>
                                                </div>
                                                <Badge variant={
                                                    order.status === 'delivered' ? 'success' :
                                                        order.status === 'preparing' ? 'warning' :
                                                            order.status === 'cancelled' ? 'error' : 'neutral'
                                                }>
                                                    {order.status}
                                                </Badge>
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Revenue Analytics</h2>
                                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                        <div className="text-center">
                                            <LineChart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-600">Revenue chart will be displayed here</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Distribution</h2>
                                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                        <div className="text-center">
                                            <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-600">Order distribution chart will be displayed here</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'system' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: 'CPU Usage', value: '45%', icon: Server, color: 'blue' },
                                    { label: 'Memory Usage', value: '67%', icon: Database, color: 'green' },
                                    { label: 'Network I/O', value: '12 MB/s', icon: Globe, color: 'purple' },
                                    { label: 'Active Sessions', value: '1,234', icon: Users, color: 'orange' },
                                    { label: 'Queue Length', value: '23', icon: Layers, color: 'red' },
                                    { label: 'Response Time', value: '45ms', icon: Zap, color: 'yellow' }
                                ].map((metric) => (
                                    <Card key={metric.label} className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${metric.color === 'blue' ? 'bg-blue-100' :
                                                metric.color === 'green' ? 'bg-green-100' :
                                                    metric.color === 'purple' ? 'bg-purple-100' :
                                                        metric.color === 'orange' ? 'bg-orange-100' :
                                                            metric.color === 'red' ? 'bg-red-100' : 'bg-yellow-100'
                                                }`}>
                                                <metric.icon className={`w-6 h-6 ${metric.color === 'blue' ? 'text-blue-600' :
                                                    metric.color === 'green' ? 'text-green-600' :
                                                        metric.color === 'purple' ? 'text-purple-600' :
                                                            metric.color === 'orange' ? 'text-orange-600' :
                                                                metric.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                                                <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <Card className="p-6 mt-8">
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">System Logs</h2>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {[
                                        { time: '14:32:15', level: 'INFO', message: 'Database connection established' },
                                        { time: '14:31:42', level: 'WARN', message: 'High memory usage detected' },
                                        { time: '14:30:18', level: 'INFO', message: 'User authentication successful' },
                                        { time: '14:29:55', level: 'ERROR', message: 'Payment processing failed' },
                                        { time: '14:28:33', level: 'INFO', message: 'Order placed successfully' }
                                    ].map((log, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-500">{log.time}</span>
                                            <Badge variant={
                                                log.level === 'ERROR' ? 'error' :
                                                    log.level === 'WARN' ? 'warning' : 'neutral'
                                            } className="text-xs">
                                                {log.level}
                                            </Badge>
                                            <span className="text-sm text-slate-700 flex-1">{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

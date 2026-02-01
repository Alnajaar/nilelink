'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, TrendingUp, TrendingDown, Users, Package,
    DollarSign, Clock, CheckCircle, XCircle, AlertTriangle,
    Eye, Filter, Download, Calendar, Search, RefreshCw
} from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface ActivityItem {
    id: string;
    type: 'order' | 'inventory' | 'payment' | 'user' | 'system';
    action: string;
    description: string;
    userId?: string;
    userName?: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error' | 'info';
    metadata?: Record<string, any>;
    impact?: 'low' | 'medium' | 'high';
}

interface ActivityStats {
    totalActivities: number;
    todayActivities: number;
    successRate: number;
    avgResponseTime: number;
    topActivities: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
}

export default function ActivitiesAnalysisPage() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        fetchActivities();
    }, [user]);

    useEffect(() => {
        filterActivities();
    }, [activities, searchTerm, selectedType, selectedStatus, dateRange]);

    const fetchActivities = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/analytics/activity?supplierId=${user.uid}&range=${dateRange}`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
                setStats(data.stats || null);
            } else {
                // Generate mock data for demonstration
                generateMockActivities();
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            generateMockActivities();
        } finally {
            setLoading(false);
        }
    };

    const generateMockActivities = () => {
        const mockActivities: ActivityItem[] = [
            {
                id: '1',
                type: 'order',
                action: 'Order Created',
                description: 'New order #ORD-2024-001 created by customer',
                userId: 'user123',
                userName: 'John Doe',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                status: 'success',
                impact: 'medium'
            },
            {
                id: '2',
                type: 'inventory',
                action: 'Stock Updated',
                description: 'Inventory for "Premium Coffee Beans" updated from 50 to 75 units',
                userId: 'admin',
                userName: 'System Admin',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                status: 'success',
                impact: 'low'
            },
            {
                id: '3',
                type: 'payment',
                action: 'Payment Processed',
                description: 'Payment of $125.50 received for order #ORD-2024-001',
                userId: 'system',
                userName: 'Payment Gateway',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
                status: 'success',
                impact: 'high'
            },
            {
                id: '4',
                type: 'user',
                action: 'User Registered',
                description: 'New customer "Jane Smith" registered and verified email',
                userId: 'user456',
                userName: 'Jane Smith',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
                status: 'success',
                impact: 'medium'
            },
            {
                id: '5',
                type: 'system',
                action: 'Backup Completed',
                description: 'Automated system backup completed successfully',
                userId: 'system',
                userName: 'System',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
                status: 'success',
                impact: 'low'
            },
            {
                id: '6',
                type: 'order',
                action: 'Order Cancelled',
                description: 'Order #ORD-2024-002 cancelled due to payment failure',
                userId: 'user789',
                userName: 'Bob Johnson',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
                status: 'error',
                impact: 'high'
            },
            {
                id: '7',
                type: 'inventory',
                action: 'Low Stock Alert',
                description: 'Alert: "Organic Tea Leaves" stock below minimum threshold (5 units remaining)',
                userId: 'system',
                userName: 'Inventory Monitor',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                status: 'warning',
                impact: 'medium'
            }
        ];

        setActivities(mockActivities);

        const mockStats: ActivityStats = {
            totalActivities: 156,
            todayActivities: 23,
            successRate: 94.2,
            avgResponseTime: 2.3,
            topActivities: [
                { type: 'order', count: 67, percentage: 43 },
                { type: 'inventory', count: 45, percentage: 29 },
                { type: 'payment', count: 23, percentage: 15 },
                { type: 'user', count: 21, percentage: 13 }
            ]
        };

        setStats(mockStats);
    };

    const filterActivities = () => {
        let filtered = activities;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (activity.userName && activity.userName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(activity => activity.type === selectedType);
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(activity => activity.status === selectedStatus);
        }

        // Filter by date range
        const now = new Date();
        const rangeMs = {
            '1h': 1000 * 60 * 60,
            '24h': 1000 * 60 * 60 * 24,
            '7d': 1000 * 60 * 60 * 24 * 7,
            '30d': 1000 * 60 * 60 * 24 * 30
        }[dateRange] || 1000 * 60 * 60 * 24 * 7;

        filtered = filtered.filter(activity =>
            (now.getTime() - activity.timestamp.getTime()) <= rangeMs
        );

        setFilteredActivities(filtered);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package className="w-4 h-4" />;
            case 'inventory': return <TrendingUp className="w-4 h-4" />;
            case 'payment': return <DollarSign className="w-4 h-4" />;
            case 'user': return <Users className="w-4 h-4" />;
            case 'system': return <Activity className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'info': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getImpactColor = (impact?: string) => {
        switch (impact) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return timestamp.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading activity analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 antialiased">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Activity Analysis</h1>
                            <p className="text-slate-600">Monitor and analyze all system activities</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={fetchActivities}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card className="border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Activities</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.totalActivities}</p>
                                    <p className="text-xs text-slate-500 mt-1">Last {dateRange}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-500" />
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.successRate}%</p>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-xs text-green-500">+2.1%</span>
                                    </div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Avg Response Time</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.avgResponseTime}s</p>
                                    <div className="flex items-center mt-1">
                                        <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="text-xs text-yellow-500">Target: <2s</span>
                                    </div>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Today's Activities</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.todayActivities}</p>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                                        <span className="text-xs text-purple-500">+15%</span>
                                    </div>
                                </div>
                                <Calendar className="w-8 h-8 text-purple-500" />
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Activity Type Breakdown */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <Card>
                            <h2 className="text-xl font-semibold text-slate-900 mb-6">Activity Breakdown</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.topActivities.map((activity, index) => (
                                    <div key={activity.type} className="text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            {getActivityIcon(activity.type)}
                                            <span className="ml-2 text-sm font-medium text-slate-700 capitalize">
                                                {activity.type}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">{activity.count}</p>
                                        <p className="text-xs text-slate-500">{activity.percentage}% of total</p>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${activity.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search activities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="order">Orders</option>
                                    <option value="inventory">Inventory</option>
                                    <option value="payment">Payments</option>
                                    <option value="user">Users</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="info">Info</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1h">Last Hour</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedType('all');
                                        setSelectedStatus('all');
                                        setDateRange('7d');
                                    }}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Activities List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Activity Feed ({filteredActivities.length} activities)
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Showing filtered results</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredActivities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100' :
                                        activity.status === 'warning' ? 'bg-yellow-100' :
                                        activity.status === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-medium text-slate-900">{activity.action}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                                {activity.impact && (
                                                    <span className={`text-xs font-medium ${getImpactColor(activity.impact)}`}>
                                                        {activity.impact} impact
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-2">{activity.description}</p>

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <div className="flex items-center gap-4">
                                                {activity.userName && (
                                                    <span>By: {activity.userName}</span>
                                                )}
                                                <span>{formatTimestamp(activity.timestamp)}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-3 h-3 mr-1" />
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredActivities.length === 0 && (
                            <div className="text-center py-12">
                                <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-slate-900 mb-2">No activities found</h3>
                                <p className="text-slate-600">Try adjusting your filters or check back later for new activities.</p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

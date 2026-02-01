"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, Calendar, Download, Filter,
    CreditCard, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface EarningsRecord {
    id: string;
    amount: number;
    commission: number;
    status: 'pending' | 'paid' | 'cancelled';
    referralName: string;
    referralEmail: string;
    orderId: string;
    orderAmount: number;
    date: string;
    payoutDate?: string;
}

export default function AffiliateEarningsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.uid) return;

            try {
                const response = await fetch(`/api/affiliates/earnings?period=${period}`);
                if (response.ok) {
                    const data = await response.json();
                    setEarnings(data.earnings || []);
                }
            } catch (error) {
                console.error('Error fetching earnings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [user, period]);

    const filteredEarnings = earnings.filter(earning => {
        if (filter === 'all') return true;
        return earning.status === filter;
    });

    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
    const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.amount, 0);
    const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, earning) => sum + earning.amount, 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading earnings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Earnings Overview</h1>
                        <p className="text-slate-600 mt-2">Track your affiliate commissions and payouts</p>
                    </div>
                    <Button
                        onClick={() => router.push('/affiliate')}
                        variant="outline"
                    >
                        Back to Dashboard
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card className="border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-slate-900">${totalEarnings.toFixed(2)}</p>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-xs text-green-500">Lifetime</span>
                                </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pending Payout</p>
                                <p className="text-2xl font-bold text-slate-900">${pendingEarnings.toFixed(2)}</p>
                                <div className="flex items-center mt-1">
                                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                                    <span className="text-xs text-blue-500">Processing</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Paid Out</p>
                                <p className="text-2xl font-bold text-slate-900">${paidEarnings.toFixed(2)}</p>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                                    <span className="text-xs text-purple-500">Completed</span>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <CreditCard className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-4 mb-6"
                >
                    <div className="flex gap-2">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as any)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="all">All time</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'pending', 'paid'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
                                    }`}
                            >
                                {status === 'all' ? 'All Earnings' : status.charAt(0).toUpperCase() + status.slice(1)}
                                ({earnings.filter(e => status === 'all' || e.status === status).length})
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </motion.div>

                {/* Earnings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Referral
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Order
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Commission
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredEarnings.map((earning) => (
                                        <tr key={earning.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-900">{earning.referralName}</div>
                                                    <div className="text-sm text-slate-500">{earning.referralEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-900">${earning.orderAmount.toFixed(2)}</div>
                                                    <div className="text-sm text-slate-500">Order #{earning.orderId}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-900">${earning.amount.toFixed(2)}</div>
                                                    <div className="text-sm text-slate-500">{earning.commission}% rate</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        earning.status === 'paid' ? 'success' :
                                                            earning.status === 'pending' ? 'warning' : 'error'
                                                    }
                                                    className="flex items-center gap-1 w-fit"
                                                >
                                                    {getStatusIcon(earning.status)}
                                                    {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900">
                                                <div>
                                                    <div className="font-medium">{new Date(earning.date).toLocaleDateString()}</div>
                                                    {earning.payoutDate && (
                                                        <div className="text-sm text-slate-500">
                                                            Paid: {new Date(earning.payoutDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredEarnings.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-slate-900 mb-2">No earnings yet</h3>
                                <p className="text-slate-600 mb-6">
                                    {filter === 'all'
                                        ? "Share your referral links to start earning commissions!"
                                        : `No ${filter} earnings found for the selected period.`
                                    }
                                </p>
                                <Button onClick={() => router.push('/affiliate/share')}>
                                    Create Referral Links
                                </Button>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Payout Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8"
                >
                    <Card>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Payout Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Minimum Payout</h4>
                                <p className="text-slate-600">$25.00</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Payout Frequency</h4>
                                <p className="text-slate-600">Monthly (1st of each month)</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Payment Method</h4>
                                <p className="text-slate-600">Bank transfer or PayPal</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 mb-2">Processing Time</h4>
                                <p className="text-slate-600">3-5 business days</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

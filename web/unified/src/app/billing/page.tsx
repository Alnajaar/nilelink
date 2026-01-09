"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    Users,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    Plus,
    Settings,
    BarChart3
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState('subscriptions');

    const subscriptionPlans = [
        {
            id: 'startup',
            name: 'Startup',
            price: 49,
            users: 'Up to 10',
            features: ['Basic Analytics', 'Email Support', '5GB Storage'],
            current: false
        },
        {
            id: 'growth',
            name: 'Growth',
            price: 149,
            users: 'Up to 50',
            features: ['Advanced Analytics', 'Priority Support', '25GB Storage', 'API Access'],
            current: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 499,
            users: 'Unlimited',
            features: ['Custom Analytics', '24/7 Support', 'Unlimited Storage', 'White-label', 'Dedicated Manager'],
            current: false
        }
    ];

    const feeSettings = [
        { label: 'Transaction Fee', value: '2.9%', description: 'Per transaction processing fee' },
        { label: 'Settlement Fee', value: '1.5%', description: 'Cross-border settlement fee' },
        { label: 'API Usage Fee', value: '$0.001', description: 'Per API call' },
        { label: 'Storage Fee', value: '$0.10', description: 'Per GB per month' }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-primary-dark">Billing & Fees</h1>
                        <p className="text-primary-dark/60 mt-2">Manage subscriptions, payments, and fee structures.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline">Export Invoice</Button>
                        <Button>Add Payment Method</Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary-dark/60 font-medium">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-primary-dark">$24,590</p>
                                <p className="text-xs text-green-600 font-medium">+12.5% from last month</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary-dark/60 font-medium">Active Subscriptions</p>
                                <p className="text-2xl font-bold text-primary-dark">1,247</p>
                                <p className="text-xs text-blue-600 font-medium">+8.2% from last month</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary-dark/60 font-medium">Avg Transaction Fee</p>
                                <p className="text-2xl font-bold text-primary-dark">2.3%</p>
                                <p className="text-xs text-purple-600 font-medium">-0.1% from last month</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary-dark/60 font-medium">Failed Payments</p>
                                <p className="text-2xl font-bold text-primary-dark">23</p>
                                <p className="text-xs text-red-600 font-medium">2.1% failure rate</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-8 bg-background-card p-1 rounded-xl border border-border">
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'subscriptions'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-primary-dark/60 hover:text-primary-dark'
                        }`}
                    >
                        Subscriptions
                    </button>
                    <button
                        onClick={() => setActiveTab('fees')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'fees'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-primary-dark/60 hover:text-primary-dark'
                        }`}
                    >
                        Fee Management
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'payments'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-primary-dark/60 hover:text-primary-dark'
                        }`}
                    >
                        Payment History
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'subscriptions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {subscriptionPlans.map((plan) => (
                            <Card key={plan.id} className={`p-6 ${plan.current ? 'ring-2 ring-primary border-primary' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary-dark">{plan.name}</h3>
                                        <p className="text-2xl font-bold text-primary">${plan.price}<span className="text-sm font-normal">/month</span></p>
                                    </div>
                                    {plan.current && <Badge className="bg-primary text-white">Current Plan</Badge>}
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-primary-dark/60 mb-3">Users: {plan.users}</p>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm">
                                                <CheckCircle size={16} className="text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    className={`w-full ${plan.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={plan.current}
                                >
                                    {plan.current ? 'Current Plan' : 'Upgrade'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-primary-dark mb-6">Fee Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {feeSettings.map((fee, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                        <div>
                                            <p className="font-medium text-primary-dark">{fee.label}</p>
                                            <p className="text-sm text-primary-dark/60">{fee.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-primary">{fee.value}</span>
                                            <Button variant="ghost" size="sm">
                                                <Settings size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-primary-dark mb-6">Fee Analytics</h3>
                            <div className="h-64 bg-background-light rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 size={48} className="text-primary-dark/20 mx-auto mb-4" />
                                    <p className="text-primary-dark/60">Fee analytics chart would appear here</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <Card className="p-6">
                        <h3 className="text-xl font-bold text-primary-dark mb-6">Payment History</h3>
                        <div className="space-y-4">
                            {[
                                { date: '2024-01-15', amount: '$149.00', status: 'completed', method: 'Credit Card ****4521' },
                                { date: '2023-12-15', amount: '$149.00', status: 'completed', method: 'Credit Card ****4521' },
                                { date: '2023-11-15', amount: '$49.00', status: 'completed', method: 'Credit Card ****4521' },
                                { date: '2023-10-15', amount: '$49.00', status: 'failed', method: 'Credit Card ****4521' },
                            ].map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${
                                            payment.status === 'completed' ? 'bg-green-500' :
                                            payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                        <div>
                                            <p className="font-medium text-primary-dark">{payment.amount}</p>
                                            <p className="text-sm text-primary-dark/60">{payment.method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-primary-dark">{payment.date}</p>
                                        <Badge variant={
                                            payment.status === 'completed' ? 'success' :
                                            payment.status === 'pending' ? 'warning' : 'error'
                                        }>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
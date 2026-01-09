"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, ShoppingCart,
    AlertCircle, DollarSign, TrendingUp,
    Plus, Check, X, Clock, Wallet, PiggyBank, ArrowUpRight, Crown
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { PageTransition } from '@/shared/components/PageTransition';
import { useDemo } from '@/contexts/DemoContext';

// Mock data types
interface SellerStats {
    totalRevenue: number;
    activeListings: number;
    pendingOrders: number;
    trustScore: number;
}

interface Order {
    id: string;
    items: string[];
    total: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'DISPUTED';
    buyer: string;
    createdAt: string;
}

export default function SellerDashboard() {
    const [stats, setStats] = useState<SellerStats>({
        totalRevenue: 15420.50,
        activeListings: 12,
        pendingOrders: 3,
        trustScore: 98
    });

    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'ORD-1024',
            items: ['Premium Coffee Beans (1kg) x 2'],
            total: 49.98,
            status: 'PENDING',
            buyer: 'Alice Smith',
            createdAt: '2025-12-30T10:30:00Z'
        },
        {
            id: 'ORD-1023',
            items: ['Organic Local Vegetables Box x 1'],
            total: 35.00,
            status: 'CONFIRMED',
            buyer: 'Bob Jones',
            createdAt: '2025-12-30T09:15:00Z'
        },
        {
            id: 'ORD-1022',
            items: ['Catering Service - Gold Package'],
            total: 499.00,
            status: 'SHIPPED',
            buyer: 'Corporate Events Inc.',
            createdAt: '2025-12-29T14:20:00Z'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'FINANCE'>('OVERVIEW');
    const [capitalRequest, setCapitalRequest] = useState('');
    const [loanActive, setLoanActive] = useState(false);
    const { isDemoMode } = useDemo();

    // MOCK CREDIT LIMIT
    const creditLimit = 12000;
    const availableCredit = loanActive ? 2000 : 12000;

    const handleAcceptOrder = (orderId: string) => {
        // Mock API call
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o));
    };

    const handleRequestCapital = () => {
        if (!capitalRequest) return;
        // Mock API call
        setTimeout(() => {
            setLoanActive(true);
            setStats(prev => ({ ...prev, totalRevenue: prev.totalRevenue + Number(capitalRequest) }));
            setCapitalRequest('');
        }, 1000);
    };

    return (
        <PageTransition>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-text-main">
                            Seller Dashboard
                        </h1>
                        <p className="text-text-muted">Manage your business, orders, and listings.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === 'OVERVIEW' ? 'primary' : 'outline'}
                            onClick={() => setActiveTab('OVERVIEW')}
                        >
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === 'FINANCE' ? 'primary' : 'outline'}
                            onClick={() => setActiveTab('FINANCE')}
                        >
                            <DollarSign className="mr-2" size={18} />
                            Capital & DeFi
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/marketplace/seller/subscriptions'}>
                            <Crown className="mr-2" size={18} />
                            Manage Subscriptions
                        </Button>
                        <Button>
                            <Plus className="mr-2" size={18} />
                            Create New Listing
                        </Button>
                    </div>
                </div>

                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, type: 'currency' },
                                { label: 'Active Listings', value: stats.activeListings, icon: Package, type: 'number' },
                                { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, type: 'number', urgent: true },
                                { label: 'Trust Score', value: `${stats.trustScore}/100`, icon: AlertCircle, type: 'text' }
                            ].map((stat, i) => (
                                <Card key={i} className={`gap-4 ${stat.urgent ? 'border-primary' : ''}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-background-subtle rounded-xl text-primary">
                                            <stat.icon size={24} />
                                        </div>
                                        <span className="text-text-muted font-medium text-sm">{stat.label}</span>
                                    </div>
                                    <div className="text-3xl font-black text-text-main ml-1">
                                        {stat.type === 'currency' ? (
                                            <CurrencyDisplay amount={stat.value as number} />
                                        ) : stat.value}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-xl font-black text-text-main flex items-center gap-2">
                                    <Clock size={20} /> Recent Orders
                                </h2>
                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <Card key={order.id} className="group hover:border-primary/30 transition-all">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="font-mono text-sm text-text-muted">{order.id}</span>
                                                            <Badge variant={
                                                                order.status === 'PENDING' ? 'warning' :
                                                                    order.status === 'CONFIRMED' ? 'info' :
                                                                        order.status === 'SHIPPED' ? 'success' : 'success'
                                                            }>
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="font-bold text-lg mb-1">{order.buyer}</h3>
                                                        <p className="text-text-muted text-sm mb-2">{order.items.join(', ')}</p>
                                                        <p className="text-xs text-text-subtle">
                                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-4 min-w-[150px]">
                                                        <CurrencyDisplay amount={order.total} className="text-2xl font-black" />
                                                        {order.status === 'PENDING' && (
                                                            <div className="flex gap-2 w-full">
                                                                <Button
                                                                    size="sm"
                                                                    className="flex-1 bg-primary text-white"
                                                                    onClick={() => handleAcceptOrder(order.id)}
                                                                >
                                                                    Accept
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="flex-1 text-danger border-danger/20 hover:bg-danger/5">
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {order.status === 'CONFIRMED' && (
                                                            <Button size="sm" variant="outline" className="w-full">
                                                                Print Label
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="No active orders"
                                        description="Your products are listed and visible to buyers."
                                        icon={<ShoppingCart size={48} />}
                                    />
                                )}
                            </div>

                            {/* Quick Actions / Performance */}
                            <div className="space-y-6">
                                <Card className="bg-primary text-white border-none relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <TrendingUp size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold mb-2">Pro Seller Tips</h3>
                                        <p className="text-white/80 mb-6 text-sm">
                                            Sellers with detailed descriptions and high-quality images see 40% more sales.
                                        </p>
                                        <Button className="bg-white text-primary hover:bg-white/90 w-full border-none">
                                            Improve Listings
                                        </Button>
                                    </div>
                                </Card>

                                <div className="bg-surface/30 rounded-2xl p-6 border border-border-subtle">
                                    <h3 className="font-black text-lg mb-4">Performance</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">Response Rate</span>
                                                <span className="font-bold text-success">98%</span>
                                            </div>
                                            <div className="h-2 bg-text/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-success w-[98%]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">On-Time Delivery</span>
                                                <span className="font-bold text-warning">92%</span>
                                            </div>
                                            <div className="h-2 bg-text/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-warning w-[92%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'FINANCE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Credit Limit Card */}
                        <Card className="p-8 bg-gradient-to-br from-primary to-primary-dark text-white border-none">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-white/80 font-medium mb-1">Available Credit Limit</p>
                                    <h2 className="text-5xl font-black">
                                        <CurrencyDisplay amount={availableCredit} />
                                    </h2>
                                </div>
                                <div className="p-4 bg-white/10 rounded-full">
                                    <Wallet size={32} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Trust Score Impact</span>
                                        <span className="font-bold text-success">+ $5,000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Pending Orders Collateral</span>
                                        <span className="font-bold text-success">+ $7,000</span>
                                    </div>
                                </div>
                                <p className="text-xs text-white/60 text-center">
                                    *Powered by NileLink DeFi Protocol. Rates as low as 2.5% APR.
                                </p>
                            </div>
                        </Card>

                        {/* Request Capital */}
                        <Card className="p-8">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <PiggyBank className="text-primary" /> Request Instant Capital
                            </h3>

                            {!loanActive ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text-main mb-2">Amount Needed</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-background-subtle border-transparent focus:border-primary font-bold text-lg"
                                                placeholder="5000"
                                                value={capitalRequest}
                                                onChange={(e) => setCapitalRequest(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background-subtle rounded-xl text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Processing Fee (2.5%)</span>
                                            <span className="font-bold">${Number(capitalRequest || 0) * 0.025}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Settle Date</span>
                                            <span className="font-bold">Next Payout (Auto-Deduct)</span>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 text-lg" onClick={handleRequestCapital} disabled={!capitalRequest}>
                                        Get Funds Instantly <ArrowUpRight className="ml-2" />
                                    </Button>

                                    {isDemoMode && (
                                        <p className="text-xs text-center text-primary animate-pulse">
                                            Demo Mode: Approval will be instantaneous
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Funds Disbursed!</h3>
                                    <p className="text-text-muted mb-6">
                                        ${capitalRequest || '10,000'} has been added to your wallet balance.
                                    </p>
                                    <Button variant="outline" onClick={() => setLoanActive(false)}>
                                        Request More
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

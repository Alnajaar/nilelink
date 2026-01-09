"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    CreditCard,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Settings,
    ArrowRight,
    Clock,
    DollarSign
} from 'lucide-react';

interface UserSubscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string | null;
    trialEndDate: string | null;
    nextBillingDate: string | null;
    autoRenew: boolean;
    totalPaid: number;
    renewalCount: number;
    plan: {
        id: string;
        name: string;
        price: number;
        currency: string;
        billingCycle: string;
        seller: {
            name: string;
        };
        benefits: {
            type: string;
            title: string;
            description: string | null;
        }[];
    };
}

export default function MySubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/subscriptions/my-subscriptions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setSubscriptions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (subscriptionId: string) => {
        if (!confirm('Are you sure you want to cancel this subscription? You will lose access at the end of your billing period.')) {
            return;
        }

        try {
            setCancellingId(subscriptionId);
            const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchSubscriptions(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            ACTIVE: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'Active' },
            PENDING: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'Pending' },
            CANCELLED: { color: 'bg-text-subtle/10 text-text-subtle border-text-subtle/20', icon: XCircle, label: 'Cancelled' },
            PAST_DUE: { color: 'bg-danger/10 text-danger border-danger/20', icon: AlertCircle, label: 'Past Due' },
            EXPIRED: { color: 'bg-text-subtle/10 text-text-subtle border-text-subtle/20', icon: XCircle, label: 'Expired' },
        };

        const badge = badges[status as keyof typeof badges] || badges.PENDING;
        const Icon = badge.icon;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${badge.color} text-xs font-bold uppercase tracking-wider`}>
                <Icon size={14} />
                {badge.label}
            </div>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
    const inactiveSubscriptions = subscriptions.filter(s => s.status !== 'ACTIVE');

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-text-main mb-2">My Subscriptions</h1>
                    <p className="text-text-muted">Manage your active subscriptions and billing</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 animate-pulse">
                                <div className="h-6 bg-background-subtle rounded w-1/3 mb-4" />
                                <div className="h-4 bg-background-subtle rounded w-full mb-2" />
                                <div className="h-4 bg-background-subtle rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center">
                        <CreditCard size={64} className="mx-auto text-text-subtle mb-4" />
                        <h3 className="text-2xl font-bold text-text-main mb-2">No active subscriptions</h3>
                        <p className="text-text-muted mb-6">Browse the marketplace to find subscription plans</p>
                        <button
                            onClick={() => router.push('/marketplace/subscriptions')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-xl font-bold hover:bg-secondary-dark transition-all"
                        >
                            Browse Subscriptions
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Active Subscriptions */}
                        {activeSubscriptions.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-text-main mb-4">Active Subscriptions</h2>
                                <div className="space-y-4">
                                    {activeSubscriptions.map((subscription) => (
                                        <div key={subscription.id} className="bg-white rounded-2xl border border-border-subtle p-6 hover:shadow-lg transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-black text-text-main">
                                                            {subscription.plan.name}
                                                        </h3>
                                                        {getStatusBadge(subscription.status)}
                                                    </div>
                                                    <p className="text-sm text-text-muted">{subscription.plan.seller.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-text-main">
                                                        ${Number(subscription.plan.price).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-text-subtle">
                                                        per {subscription.plan.billingCycle.toLowerCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Benefits */}
                                            <div className="grid grid-cols-2 gap-2 mb-4 p-4 bg-background-subtle rounded-xl">
                                                {subscription.plan.benefits.slice(0, 4).map((benefit, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <CheckCircle size={14} className="text-success flex-shrink-0" />
                                                        <span className="text-xs text-text-main font-medium">{benefit.title}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border-subtle">
                                                <div>
                                                    <p className="text-xs text-text-subtle uppercase tracking-wider mb-1">Start Date</p>
                                                    <p className="text-sm font-medium text-text-main">{formatDate(subscription.startDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-subtle uppercase tracking-wider mb-1">Next Billing</p>
                                                    <p className="text-sm font-medium text-text-main">{formatDate(subscription.nextBillingDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-subtle uppercase tracking-wider mb-1">Total Paid</p>
                                                    <p className="text-sm font-medium text-text-main">
                                                        ${Number(subscription.totalPaid).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-subtle uppercase tracking-wider mb-1">Renewals</p>
                                                    <p className="text-sm font-medium text-text-main">{subscription.renewalCount}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw size={14} className={subscription.autoRenew ? 'text-success' : 'text-text-subtle'} />
                                                    <span className="text-sm text-text-muted">
                                                        Auto-renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleCancelSubscription(subscription.id)}
                                                        disabled={cancellingId === subscription.id}
                                                        className="px-4 py-2 border border-danger text-danger rounded-lg hover:bg-danger/5 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {cancellingId === subscription.id ? 'Cancelling...' : 'Cancel Subscription'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive Subscriptions */}
                        {inactiveSubscriptions.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-text-main mb-4">Past Subscriptions</h2>
                                <div className="space-y-4">
                                    {inactiveSubscriptions.map((subscription) => (
                                        <div key={subscription.id} className="bg-background-subtle/50 rounded-2xl border border-border-subtle p-6 opacity-75">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-text-main">
                                                            {subscription.plan.name}
                                                        </h3>
                                                        {getStatusBadge(subscription.status)}
                                                    </div>
                                                    <p className="text-sm text-text-muted mb-2">{subscription.plan.seller.name}</p>
                                                    <div className="flex items-center gap-4 text-xs text-text-subtle">
                                                        <span>Started: {formatDate(subscription.startDate)}</span>
                                                        {subscription.endDate && <span>Ended: {formatDate(subscription.endDate)}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
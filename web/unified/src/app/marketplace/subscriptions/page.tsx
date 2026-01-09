"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    TrendingUp,
    Clock,
    Users,
    Check,
    Star,
    ArrowRight,
    Sparkles,
    Zap
} from 'lucide-react';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    richDescription: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    trialDays: number;
    subscriberCount: number;
    seller: {
        name: string;
    };
    benefits: {
        type: string;
        title: string;
        description: string | null;
        value: any;
    }[];
    totalSubscribers: number;
}

export default function SubscriptionMarketplacePage() {
    const router = useRouter();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBillingCycle, setSelectedBillingCycle] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('POPULARITY');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, [searchQuery, selectedBillingCycle, sortBy]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedBillingCycle !== 'all') params.append('billingCycle', selectedBillingCycle);
            params.append('sortBy', sortBy);

            const response = await fetch(`/api/subscriptions/marketplace?${params}`);
            const data = await response.json();

            if (data.success) {
                setPlans(data.data.plans);
            }
        } catch (error) {
            console.error('Failed to fetch subscription plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (planId: string) => {
        // TODO: Show subscription modal or navigate when detail page is available
        console.log('Subscribe to plan:', planId);
        // router.push(`/marketplace/subscriptions/${planId}`);
    };

    const getBillingCycleLabel = (cycle: string) => {
        switch (cycle) {
            case 'MONTHLY': return '/month';
            case 'YEARLY': return '/year';
            case 'CUSTOM': return '';
            default: return '';
        }
    };

    const getBenefitIcon = (type: string) => {
        switch (type) {
            case 'DISCOUNT': return '💰';
            case 'FREE_DELIVERY': return '🚚';
            case 'EARLY_ACCESS': return '⚡';
            case 'EXCLUSIVE_ITEM': return '✨';
            default: return '🎁';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-primary to-primary/95 text-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                            <Sparkles size={16} className="text-accent" />
                            <span className="text-sm font-medium">Exclusive Member Benefits</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight">
                            Subscribe & Save
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Unlock exclusive benefits, discounts, and perks from your favorite sellers
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                            <input
                                type="text"
                                placeholder="Search subscription plans..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-text-main border-0 shadow-xl focus:ring-2 focus:ring-accent transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white border-b border-border-subtle sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle hover:bg-background-subtle transition-colors"
                            >
                                <Filter size={18} />
                                <span className="font-medium">Filters</span>
                            </button>

                            {showFilters && (
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedBillingCycle}
                                        onChange={(e) => setSelectedBillingCycle(e.target.value)}
                                        className="px-4 py-2 rounded-lg border border-border-subtle bg-white"
                                    >
                                        <option value="all">All Cycles</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-border-subtle bg-white"
                        >
                            <option value="POPULARITY">Most Popular</option>
                            <option value="PRICE_LOW">Price: Low to High</option>
                            <option value="PRICE_HIGH">Price: High to Low</option>
                            <option value="NEWEST">Newest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 animate-pulse">
                                <div className="h-48 bg-background-subtle rounded-xl mb-4" />
                                <div className="h-6 bg-background-subtle rounded w-3/4 mb-2" />
                                <div className="h-4 bg-background-subtle rounded w-full mb-4" />
                                <div className="h-8 bg-background-subtle rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles size={64} className="mx-auto text-text-subtle mb-4" />
                        <h3 className="text-2xl font-bold text-text-main mb-2">No subscriptions found</h3>
                        <p className="text-text-muted">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="group bg-white rounded-2xl border border-border-subtle hover:border-secondary hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                {/* Banner Image */}
                                {plan.bannerUrl ? (
                                    <div className="h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                                        <img
                                            src={plan.bannerUrl}
                                            alt={plan.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                        <Zap size={64} className="text-secondary/30" />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Plan Info */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-text-main mb-1 group-hover:text-secondary transition-colors">
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm text-text-muted">{plan.seller.name}</p>
                                        </div>
                                        {plan.logoUrl && (
                                            <img
                                                src={plan.logoUrl}
                                                alt={plan.seller.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                            />
                                        )}
                                    </div>

                                    {/* Description */}
                                    {plan.description && (
                                        <p className="text-sm text-text-muted mb-4 line-clamp-2">
                                            {plan.description}
                                        </p>
                                    )}

                                    {/* Benefits */}
                                    <div className="space-y-2 mb-6">
                                        {plan.benefits.slice(0, 3).map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-lg">{getBenefitIcon(benefit.type)}</span>
                                                <span className="text-sm text-text-main font-medium">{benefit.title}</span>
                                            </div>
                                        ))}
                                        {plan.benefits.length > 3 && (
                                            <div className="text-xs text-text-subtle">
                                                +{plan.benefits.length - 3} more benefits
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 pb-4 mb-4 border-b border-border-subtle">
                                        <div className="flex items-center gap-1 text-xs text-text-muted">
                                            <Users size={14} />
                                            <span>{plan.totalSubscribers} subscribers</span>
                                        </div>
                                        {plan.trialDays > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-success font-medium">
                                                <Clock size={14} />
                                                <span>{plan.trialDays}-day free trial</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price and CTA */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-text-main">
                                                    ${Number(plan.price).toFixed(2)}
                                                </span>
                                                <span className="text-sm text-text-muted">
                                                    {getBillingCycleLabel(plan.billingCycle)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-subtle">
                                                {plan.currency}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            className="flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-xl font-bold hover:bg-secondary-dark shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Subscribe
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
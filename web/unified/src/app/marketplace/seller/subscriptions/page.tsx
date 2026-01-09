"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Crown, Plus, Edit, Trash2, Eye, EyeOff, TrendingUp,
    Users, DollarSign, BarChart3, AlertCircle, CheckCircle,
    Settings, Calendar, Star, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Input } from '@/shared/components/Input';

import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { PageTransition } from '@/shared/components/PageTransition';
import { URLS } from '@/shared/utils/urls';

// Mock data types
interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    richDescription?: string;
    logoUrl?: string;
    bannerUrl?: string;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    trialDays: number;
    maxSubscribers?: number;
    visibility: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
    autoRenew: boolean;
    subscriberCount: number;
    createdAt: string;
    benefits: Array<{
        id: string;
        type: string;
        title: string;
        description?: string;
        value?: any;
        displayOrder: number;
        isActive: boolean;
    }>;
}

interface Analytics {
    plans: Array<{
        id: string;
        name: string;
        subscriberCount: number;
        activeSubscribers: number;
        revenue: number;
        createdAt: string;
    }>;
    totalRevenue: number;
    totalSubscribers: number;
    activeSubscribers: number;
    churnRate: number;
}

export default function SellerSubscriptionsDashboard() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PLANS' | 'ANALYTICS'>('OVERVIEW');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        richDescription: '',
        price: '',
        currency: 'USD',
        billingCycle: 'MONTHLY',
        trialDays: '0',
        maxSubscribers: '',
        visibility: 'PUBLIC',
        autoRenew: true
    });

    const [benefits, setBenefits] = useState<Array<{
        type: string;
        title: string;
        description: string;
        value: string;
    }>>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real scenario, use URLS.api
            // const [plansRes, analyticsRes] = await Promise.all([
            //     fetch(`${URLS.api}/subscriptions/plans`, { credentials: 'include' }),
            //     fetch(`${URLS.api}/subscriptions/analytics`, { credentials: 'include' })
            // ]);
            // const plansData = await plansRes.json();
            // const analyticsData = await analyticsRes.json();

            // Mock data for development
            await new Promise(r => setTimeout(r, 1000));

            const mockPlans: SubscriptionPlan[] = [
                {
                    id: '1',
                    name: 'Premium Dining Club',
                    description: 'Exclusive access to premium dining experiences',
                    price: 29.99,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    trialDays: 7,
                    visibility: 'PUBLIC',
                    status: 'ACTIVE',
                    autoRenew: true,
                    subscriberCount: 1250,
                    createdAt: '2024-01-15T10:00:00Z',
                    benefits: [
                        { id: '1', type: 'DISCOUNT', title: '20% off all menu items', description: 'Save on every visit', displayOrder: 1, isActive: true },
                        { id: '2', type: 'FREE_DELIVERY', title: 'Free delivery', description: 'On orders over $50', displayOrder: 2, isActive: true }
                    ]
                },
                {
                    id: '2',
                    name: 'VIP Experience',
                    description: 'Ultimate VIP dining experience',
                    price: 99.99,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    trialDays: 0,
                    visibility: 'PRIVATE',
                    status: 'DRAFT',
                    autoRenew: true,
                    subscriberCount: 0,
                    createdAt: '2024-01-20T10:00:00Z',
                    benefits: [
                        { id: '3', type: 'EARLY_ACCESS', title: 'Early reservations', description: 'Book before general release', displayOrder: 1, isActive: true }
                    ]
                }
            ];

            const mockAnalytics: Analytics = {
                plans: [
                    { id: '1', name: 'Premium Dining Club', subscriberCount: 1250, activeSubscribers: 1180, revenue: 35697.00, createdAt: '2024-01-15T10:00:00Z' }
                ],
                totalRevenue: 35697.00,
                totalSubscribers: 1250,
                activeSubscribers: 1180,
                churnRate: 5.6
            };

            setPlans(mockPlans);
            setAnalytics(mockAnalytics);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch subscription data', error);
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            // In a real scenario, make API call
            // const res = await fetch(`${URLS.api}/subscriptions/plans`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     credentials: 'include',
            //     body: JSON.stringify({ ...formData, benefits })
            // });
            // const data = await res.json();

            // Mock success
            const newPlan: SubscriptionPlan = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                richDescription: formData.richDescription,
                price: parseFloat(formData.price),
                currency: formData.currency || 'USD',
                billingCycle: formData.billingCycle as 'MONTHLY' | 'YEARLY' | 'CUSTOM',
                trialDays: parseInt(formData.trialDays),
                maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : undefined,
                visibility: formData.visibility as 'PUBLIC' | 'PRIVATE',
                status: 'ACTIVE',
                autoRenew: formData.autoRenew,
                subscriberCount: 0,
                createdAt: new Date().toISOString(),
                benefits: benefits.map((b, i) => ({
                    id: `benefit_${i}`,
                    ...b,
                    displayOrder: i + 1,
                    isActive: true
                }))
            };

            setPlans(prev => [...prev, newPlan]);
            setShowCreateForm(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create plan', error);
        }
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;

        try {
            // In a real scenario, make API call
            // const res = await fetch(`${URLS.api}/subscriptions/plans/${editingPlan.id}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     credentials: 'include',
            //     body: JSON.stringify({ ...formData, benefits })
            // });

            const updatedPlan: SubscriptionPlan = {
                id: editingPlan.id,
                name: formData.name,
                description: formData.description || '',
                richDescription: editingPlan.richDescription,
                logoUrl: editingPlan.logoUrl,
                bannerUrl: editingPlan.bannerUrl,
                price: parseFloat(formData.price),
                currency: formData.currency || 'USD',
                billingCycle: formData.billingCycle as 'MONTHLY' | 'YEARLY' | 'CUSTOM',
                visibility: formData.visibility as 'PUBLIC' | 'PRIVATE',
                status: editingPlan.status || 'ACTIVE',
                trialDays: parseInt(formData.trialDays),
                maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : undefined,
                autoRenew: formData.autoRenew ?? true,
                subscriberCount: editingPlan.subscriberCount,
                benefits: benefits.map((b, i) => ({
                    id: `benefit_${i}`,
                    ...b,
                    displayOrder: i + 1,
                    isActive: true
                })),
                createdAt: editingPlan.createdAt
            };

            setPlans(prev => prev.map(p => p.id === editingPlan.id ? updatedPlan : p));
            setEditingPlan(null);
            resetForm();
        } catch (error) {
            console.error('Failed to update plan', error);
        }
    };

    const handlePublishPlan = async (planId: string) => {
        try {
            // In a real scenario, make API call
            // await fetch(`${URLS.api}/subscriptions/plans/${planId}/publish`, {
            //     method: 'POST',
            //     credentials: 'include'
            // });

            setPlans(prev => prev.map(p =>
                p.id === planId ? { ...p, status: 'ACTIVE' } : p
            ));
        } catch (error) {
            console.error('Failed to publish plan', error);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this subscription plan?')) return;

        try {
            // In a real scenario, make API call
            // await fetch(`${URLS.api}/subscriptions/plans/${planId}`, {
            //     method: 'DELETE',
            //     credentials: 'include'
            // });

            setPlans(prev => prev.filter(p => p.id !== planId));
        } catch (error) {
            console.error('Failed to delete plan', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            richDescription: '',
            price: '',
            currency: 'USD',
            billingCycle: 'MONTHLY',
            trialDays: '0',
            maxSubscribers: '',
            visibility: 'PUBLIC',
            autoRenew: true
        });
        setBenefits([]);
    };

    const startEditing = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description,
            richDescription: plan.richDescription || '',
            price: plan.price.toString(),
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            trialDays: plan.trialDays.toString(),
            maxSubscribers: plan.maxSubscribers?.toString() || '',
            visibility: plan.visibility,
            autoRenew: plan.autoRenew
        });
        setBenefits(plan.benefits.map(b => ({
            type: b.type,
            title: b.title,
            description: b.description || '',
            value: b.value ? JSON.stringify(b.value) : ''
        })));
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="py-20">
                    <LoadingState message="Loading subscription dashboard..." />
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-text-main">
                            Subscription Management
                        </h1>
                        <p className="text-text-muted">Create and manage subscription plans for your customers.</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-accent hover:bg-accent-light"
                    >
                        <Plus className="mr-2" size={18} />
                        Create Subscription Plan
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-background-card p-1 rounded-xl border border-border">
                    {[
                        { key: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
                        { key: 'PLANS', label: 'My Plans', icon: Crown },
                        { key: 'ANALYTICS', label: 'Analytics', icon: TrendingUp }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
                                ? 'bg-accent text-background shadow-sm'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'OVERVIEW' && analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Total Revenue</p>
                                    <CurrencyDisplay amount={analytics.totalRevenue} className="text-2xl font-bold text-text-main" />
                                    <p className="text-xs text-success font-medium">+12.5% from last month</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-success" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Active Subscribers</p>
                                    <p className="text-2xl font-bold text-text-main">{analytics.activeSubscribers}</p>
                                    <p className="text-xs text-blue-600 font-medium">
                                        {((analytics.activeSubscribers / analytics.totalSubscribers) * 100).toFixed(1)}% retention
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Total Plans</p>
                                    <p className="text-2xl font-bold text-text-main">{analytics.plans.length}</p>
                                    <p className="text-xs text-purple-600 font-medium">
                                        {plans.filter(p => p.status === 'ACTIVE').length} active
                                    </p>
                                </div>
                                <Crown className="h-8 w-8 text-purple-500" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Churn Rate</p>
                                    <p className="text-2xl font-bold text-text-main">{analytics.churnRate}%</p>
                                    <p className="text-xs text-red-600 font-medium">Last 30 days</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-red-500" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Plans Tab */}
                {activeTab === 'PLANS' && (
                    <div className="space-y-6">
                        {plans.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {plans.map((plan) => (
                                    <Card key={plan.id} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-text-main">{plan.name}</h3>
                                                <p className="text-text-muted text-sm">{plan.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant={
                                                    plan.status === 'ACTIVE' ? 'success' :
                                                        plan.status === 'DRAFT' ? 'warning' : 'error'
                                                }>
                                                    {plan.status}
                                                </Badge>
                                                <Badge variant={plan.visibility === 'PUBLIC' ? 'info' : 'neutral'}>
                                                    {plan.visibility}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <CurrencyDisplay amount={plan.price} className="text-2xl font-bold text-text-main" />
                                                <p className="text-xs text-text-muted">per {plan.billingCycle.toLowerCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-text-main">{plan.subscriberCount}</p>
                                                <p className="text-xs text-text-muted">subscribers</p>
                                            </div>
                                        </div>

                                        {plan.benefits.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-text-main mb-2">Benefits:</p>
                                                <ul className="space-y-1">
                                                    {plan.benefits.slice(0, 2).map((benefit) => (
                                                        <li key={benefit.id} className="flex items-start gap-2 text-xs text-text-muted">
                                                            <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                                                            <span>{benefit.title}</span>
                                                        </li>
                                                    ))}
                                                    {plan.benefits.length > 2 && (
                                                        <li className="text-xs text-accent font-medium">
                                                            +{plan.benefits.length - 2} more benefits
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => startEditing(plan)}
                                            >
                                                <Edit size={16} className="mr-1" />
                                                Edit
                                            </Button>
                                            {plan.status === 'DRAFT' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePublishPlan(plan.id)}
                                                    className="bg-success hover:bg-success/80"
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    Publish
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="text-danger border-danger hover:bg-danger/10"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No subscription plans yet"
                                description="Create your first subscription plan to start monetizing your store."
                                icon={<Crown size={48} />}
                                action={{
                                    label: 'Create Your First Plan',
                                    onClick: () => setShowCreateForm(true)
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'ANALYTICS' && analytics && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-text-main mb-6">Revenue Analytics</h3>
                            <div className="h-64 bg-background-subtle rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 size={48} className="text-text-muted mx-auto mb-4" />
                                    <p className="text-text-muted">Revenue chart would appear here</p>
                                    <p className="text-sm text-text-muted mt-2">
                                        Total Revenue: <CurrencyDisplay amount={analytics.totalRevenue} />
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-text-main mb-6">Top Performing Plans</h3>
                                <div className="space-y-4">
                                    {analytics.plans.map((plan) => (
                                        <div key={plan.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-text-main">{plan.name}</p>
                                                <p className="text-sm text-text-muted">{plan.activeSubscribers} active subscribers</p>
                                            </div>
                                            <CurrencyDisplay amount={plan.revenue} className="font-bold text-success" />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-text-main mb-6">Performance Metrics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Total Subscribers</span>
                                        <span className="font-bold">{analytics.totalSubscribers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Active Subscribers</span>
                                        <span className="font-bold text-success">{analytics.activeSubscribers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Churn Rate</span>
                                        <span className="font-bold text-danger">{analytics.churnRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Avg Revenue per User</span>
                                        <CurrencyDisplay
                                            amount={analytics.totalRevenue / analytics.totalSubscribers}
                                            className="font-bold"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Create/Edit Form Modal */}
                {(showCreateForm || editingPlan) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-text-main mb-6">
                                    {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Plan Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Premium Dining Club"
                                        />
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Billing Cycle</label>
                                            <select
                                                value={formData.billingCycle}
                                                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg bg-background-subtle border border-border focus:border-accent"
                                            >
                                                <option value="MONTHLY">Monthly</option>
                                                <option value="YEARLY">Yearly</option>
                                                <option value="CUSTOM">Custom</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-main mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of what subscribers get..."
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-lg bg-background-subtle border border-border focus:border-accent resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="Price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="29.99"
                                        />
                                        <Input
                                            label="Trial Days"
                                            type="number"
                                            value={formData.trialDays}
                                            onChange={(e) => setFormData(prev => ({ ...prev, trialDays: e.target.value }))}
                                            placeholder="7"
                                        />
                                        <div>
                                            <label className="block text-sm font-bold text-text-main mb-2">Visibility</label>
                                            <select
                                                value={formData.visibility}
                                                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg bg-background-subtle border border-border focus:border-accent"
                                            >
                                                <option value="PUBLIC">Public</option>
                                                <option value="PRIVATE">Private (Invite Only)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Benefits Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-text-main">Benefits</h3>
                                            <Button
                                                size="sm"
                                                onClick={() => setBenefits(prev => [...prev, { type: 'DISCOUNT', title: '', description: '', value: '' }])}
                                            >
                                                <Plus size={16} className="mr-1" />
                                                Add Benefit
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {benefits.map((benefit, index) => (
                                                <Card key={index} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-bold text-text-main mb-2">Type</label>
                                                            <select
                                                                value={benefit.type}
                                                                onChange={(e) => {
                                                                    const newBenefits = [...benefits];
                                                                    newBenefits[index].type = e.target.value;
                                                                    setBenefits(newBenefits);
                                                                }}
                                                                className="w-full px-3 py-2 rounded-lg bg-background-subtle border border-border focus:border-accent text-sm"
                                                            >
                                                                <option value="DISCOUNT">Discount</option>
                                                                <option value="FREE_DELIVERY">Free Delivery</option>
                                                                <option value="EARLY_ACCESS">Early Access</option>
                                                                <option value="EXCLUSIVE_ITEM">Exclusive Item</option>
                                                                <option value="CUSTOM">Custom</option>
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <Input
                                                                label="Title"
                                                                value={benefit.title}
                                                                onChange={(e) => {
                                                                    const newBenefits = [...benefits];
                                                                    newBenefits[index].title = e.target.value;
                                                                    setBenefits(newBenefits);
                                                                }}
                                                                placeholder="Benefit title"
                                                            />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setBenefits(prev => prev.filter((_, i) => i !== index));
                                                                }}
                                                                className="text-danger border-danger hover:bg-danger/10"
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <Input
                                                            label="Description (optional)"
                                                            value={benefit.description}
                                                            onChange={(e) => {
                                                                const newBenefits = [...benefits];
                                                                newBenefits[index].description = e.target.value;
                                                                setBenefits(newBenefits);
                                                            }}
                                                            placeholder="Additional details about this benefit"
                                                        />
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <Button
                                        onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                                        disabled={!formData.name || !formData.description || !formData.price}
                                        className="flex-1"
                                    >
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setEditingPlan(null);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
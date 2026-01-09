"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Crown,
    Zap,
    Shield,
    Users,
    TrendingUp,
    Calendar,
    CreditCard,
    CheckCircle,
    ArrowRight,
    AlertTriangle,
    Star,
    Gift
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useSubscription } from '@shared/contexts/SubscriptionContext';
import Link from 'next/link';

export default function SubscriptionPage() {
    const router = useRouter();
    const { subscription, plans, upgradePlan, getRemainingTrialDays, isTrialExpired } = useSubscription();
    const [selectedPlan, setSelectedPlan] = useState<string>(subscription?.plan || 'starter');
    const [isUpgrading, setIsUpgrading] = useState(false);

    const trialDays = getRemainingTrialDays();
    const trialExpired = isTrialExpired();

    const handleUpgrade = async (planId: string) => {
        setIsUpgrading(true);
        try {
            await upgradePlan(planId);
            setSelectedPlan(planId);
            // Show success message
            alert('Plan upgraded successfully!');
        } catch (error) {
            alert('Failed to upgrade plan. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    const getUsagePercentage = (current: number, max: number) => {
        return Math.min((current / max) * 100, 100);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Crown size={32} className="text-white" />
                </div>
                <h1 className="text-4xl font-black text-text-main mb-2">Subscription Management</h1>
                <p className="text-text-muted font-medium text-lg max-w-2xl mx-auto">
                    Scale your business with the perfect plan. Upgrade anytime to unlock advanced features.
                </p>
            </div>

            {/* Current Plan Status */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-main">
                                {subscription?.planName || 'Free Trial'}
                            </h3>
                            <p className="text-text-muted font-medium">
                                {subscription?.isTrialActive ? 'Trial Period' : 'Active Subscription'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {subscription?.isTrialActive && (
                            <div className="flex items-center gap-2">
                                <Badge variant={trialExpired ? "error" : "success"} className="font-black">
                                    {trialExpired ? 'Trial Expired' : `${trialDays} days left`}
                                </Badge>
                                {trialExpired && (
                                    <Badge variant="error" className="animate-pulse">
                                        <AlertTriangle size={12} className="mr-1" />
                                        Action Required
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="text-right">
                            <p className="text-2xl font-black text-primary">
                                {plans.find((p: any) => p.id === subscription?.plan)?.price || 'Free'}
                            </p>
                            <p className="text-xs text-text-muted font-medium uppercase tracking-widest">
                                per month, billed monthly
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Usage Stats */}
            {subscription && (
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users size={20} className="text-primary" />
                            <span className="font-black text-text-main uppercase tracking-widest text-sm">Staff Usage</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-text-muted">Current Staff</span>
                                <span className="font-black text-text-main">
                                    {subscription.maxStaff === 999 ? 'Unlimited' : `${subscription.maxStaff} max`}
                                </span>
                            </div>
                            {subscription.maxStaff !== 999 && (
                                <div className="w-full bg-background-subtle rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${getUsagePercentage(5, subscription.maxStaff)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield size={20} className="text-primary" />
                            <span className="font-black text-text-main uppercase tracking-widest text-sm">Features</span>
                        </div>
                        <div className="space-y-2">
                            {subscription.features.slice(0, 3).map((feature: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-success" />
                                    <span className="text-sm font-medium text-text-main">{feature}</span>
                                </div>
                            ))}
                            {subscription.features.length > 3 && (
                                <p className="text-xs text-text-muted font-medium">
                                    +{subscription.features.length - 3} more features
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar size={20} className="text-primary" />
                            <span className="font-black text-text-main uppercase tracking-widest text-sm">Billing</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-text-muted">Next Billing</span>
                                <span className="font-black text-text-main">
                                    {subscription.isTrialActive ? 'After Trial' : 'Monthly'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-text-muted">Payment Method</span>
                                <span className="font-black text-text-main">•••• 4242</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Plan Selection */}
            <div>
                <h2 className="text-3xl font-black text-text-main mb-2 text-center">Choose Your Plan</h2>
                <p className="text-text-muted font-medium text-center mb-8">All plans include 24/7 support and free updates</p>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan: any) => {
                        const isCurrentPlan = subscription?.plan === plan.id;
                        const isPopular = plan.id === 'professional';

                        return (
                            <Card
                                key={plan.id}
                                className={`p-8 relative transition-all hover:shadow-xl ${isPopular
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-border-subtle hover:border-primary/50'
                                    } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                            >
                                {isPopular && (
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white font-black uppercase tracking-widest px-3 py-1">
                                        Most Popular
                                    </Badge>
                                )}

                                {isCurrentPlan && (
                                    <Badge variant="success" className="absolute -top-3 right-4 font-black uppercase tracking-widest">
                                        Current Plan
                                    </Badge>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-text-main mb-1">{plan.name}</h3>
                                    <p className="text-4xl font-black text-primary mb-2">{plan.price}</p>
                                    <p className="text-sm text-text-muted font-medium">{plan.description}</p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature: any, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                                            <span className="text-sm font-medium text-text-main leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-3">
                                    {isCurrentPlan ? (
                                        <Button
                                            variant="outline"
                                            className="w-full py-3 font-black uppercase tracking-widest"
                                            disabled
                                        >
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleUpgrade(plan.id)}
                                            isLoading={isUpgrading && selectedPlan === plan.id}
                                            className="w-full py-3 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                        >
                                            {isUpgrading && selectedPlan === plan.id ? 'Upgrading...' : 'Upgrade Now'}
                                            <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    )}

                                    <p className="text-xs text-text-muted font-medium text-center">
                                        30-day money-back guarantee • Instant activation
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Early Adopter Benefits */}
            {subscription?.isEarlyAdopter && (
                <Card className="p-8 bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                            <Gift size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-text-main">Early Adopter Benefits</h3>
                            <p className="text-text-muted font-medium">Thank you for being part of our founding community!</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white/50 rounded-xl">
                            <Star className="w-8 h-8 text-success mx-auto mb-2" />
                            <p className="font-black text-text-main">3 Months Free</p>
                            <p className="text-sm text-text-muted">Extended trial period</p>
                        </div>
                        <div className="text-center p-4 bg-white/50 rounded-xl">
                            <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="font-black text-text-main">Priority Support</p>
                            <p className="text-sm text-text-muted">Direct access to founders</p>
                        </div>
                        <div className="text-center p-4 bg-white/50 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
                            <p className="font-black text-text-main">Beta Features</p>
                            <p className="text-sm text-text-muted">Early access to new features</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Footer */}
            <div className="text-center pt-8 border-t border-border-subtle">
                <p className="text-sm text-text-muted font-medium mb-4">
                    Need help choosing the right plan? Our team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/support">
                        <Button variant="outline" className="font-bold">
                            Contact Support
                        </Button>
                    </Link>
                    <Link href="/admin">
                        <Button variant="outline" className="font-bold">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
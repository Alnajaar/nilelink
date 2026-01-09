import React, { ReactNode } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGuardProps {
    children: ReactNode;
    feature?: string;
    app?: string;
    plan?: string;
    fallback?: ReactNode;
    showUpgrade?: boolean;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
    children,
    feature,
    app,
    plan,
    fallback,
    showUpgrade = true
}) => {
    const { subscription, hasFeature, canAccessApp, isTrialExpired } = useSubscription();

    // Check if user has access
    const hasAccess = () => {
        if (!subscription) return false;

        if (plan && subscription.plan !== plan) return false;
        if (feature && !hasFeature(feature)) return false;
        if (app && !canAccessApp(app)) return false;

        // Check if trial is expired
        if (isTrialExpired()) return false;

        return true;
    };

    if (hasAccess()) {
        return <>{children}</>;
    }

    // Custom fallback
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default upgrade prompt
    if (showUpgrade) {
        return (
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-primary" />
                </div>

                <h3 className="text-2xl font-black text-text-main mb-2">Premium Feature</h3>
                <p className="text-text-muted font-medium mb-6 max-w-sm mx-auto">
                    This feature requires a higher plan. Upgrade your subscription to unlock advanced capabilities.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl">
                        <Zap size={16} className="text-primary" />
                        <span className="text-sm font-bold text-primary">Current Plan:</span>
                        <Badge variant="neutral" className="font-black">
                            {subscription?.planName || 'Free'}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link href="/admin/subscription">
                        <Button className="w-full sm:w-auto px-8 py-3 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Crown size={18} className="mr-2" />
                            Upgrade Plan
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Link>

                    <p className="text-xs text-text-muted font-medium">
                        Instant activation • Cancel anytime • 30-day money-back guarantee
                    </p>
                </div>
            </Card>
        );
    }

    return null;
};

// Higher-order component for subscription guarding
export function withSubscriptionGuard<P extends object>(
    Component: React.ComponentType<P>,
    guardProps: Omit<SubscriptionGuardProps, 'children'>
) {
    return function WrappedComponent(props: P) {
        return (
            <SubscriptionGuard {...guardProps}>
                <Component {...props} />
            </SubscriptionGuard>
        );
    };
}

// Hook for checking subscription status
export const useSubscriptionCheck = () => {
    const { subscription, hasFeature, canAccessApp, isTrialExpired, getRemainingTrialDays } = useSubscription();

    return {
        subscription,
        hasFeature,
        canAccessApp,
        isTrialExpired: isTrialExpired(),
        remainingTrialDays: getRemainingTrialDays(),
        isSubscribed: subscription?.isActive ?? false,
        isTrialActive: subscription?.isTrialActive ?? false,
        currentPlan: subscription?.plan || 'free',
        planName: subscription?.planName || 'Free Trial',
    };
};
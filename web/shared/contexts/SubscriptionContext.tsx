"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    limitations: {
        posTerminals: number;
        transactionsPerMonth: number;
        staffMembers: number;
        branches: number;
        apiCalls?: number;
    };
    capabilities: {
        basicReporting: boolean;
        advancedAnalytics: boolean;
        inventoryManagement: boolean;
        staffManagement: boolean;
        deliveryIntegration: boolean;
        supplierManagement: boolean;
        investmentPortal: boolean;
        multiBranchSync: boolean;
        customContracts: boolean;
        whiteLabel: boolean;
        dedicatedSupport: boolean;
        governance: boolean;
    };
    trialMonths: number;
    popular?: boolean;
}

export interface UserSubscription {
    plan: string;
    planName: string;
    trialMonths: number;
    isTrialActive: boolean;
    trialStartDate: string;
    features: string[];
    isEarlyAdopter: boolean;
    maxStaff: number;
    hasDelivery: boolean;
    hasSupplier: boolean;
    hasInvestment: boolean;
    trialEndDate?: string;
    isActive: boolean;
    billingCycle?: 'monthly' | 'yearly';
}

interface SubscriptionContextType {
    subscription: UserSubscription | null;
    plans: SubscriptionPlan[];
    hasFeature: (feature: string) => boolean;
    canAccessApp: (app: string) => boolean;
    getRemainingTrialDays: () => number;
    isTrialExpired: () => boolean;
    upgradePlan: (newPlanId: string) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    reactivateSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within SubscriptionProvider');
    }
    return context;
};

interface SubscriptionProviderProps {
    children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);

    const plans: SubscriptionPlan[] = [
        {
            id: 'starter',
            name: 'Starter',
            price: '$29/month',
            monthlyPrice: 29,
            yearlyPrice: 29 * 12 * 0.8, // 20% discount
            features: ['1 POS Terminal Limit', 'Basic Reporting', 'Email Support', '1,000 Transactions/mo', 'Inventory Sync', 'Staff Management'],
            limitations: {
                posTerminals: 1,
                transactionsPerMonth: 1000,
                staffMembers: 5,
                branches: 1,
                apiCalls: 10000
            },
            capabilities: {
                basicReporting: true,
                advancedAnalytics: false,
                inventoryManagement: true,
                staffManagement: true,
                deliveryIntegration: false,
                supplierManagement: false,
                investmentPortal: false,
                multiBranchSync: false,
                customContracts: false,
                whiteLabel: false,
                dedicatedSupport: false,
                governance: false
            },
            trialMonths: 1
        },
        {
            id: 'growth',
            name: 'Growth',
            price: '$79/month',
            monthlyPrice: 79,
            yearlyPrice: 79 * 12 * 0.8, // 20% discount
            features: ['Unlimited Terminals', 'Advanced Analytics', 'Staff Roles & Shifts', 'Inventory Management', 'Kitchen Display System', '24/7 Priority Support', 'Custom Smart Contracts', 'Dedicated Account Manager'],
            limitations: {
                posTerminals: -1, // unlimited
                transactionsPerMonth: -1, // unlimited
                staffMembers: -1, // unlimited
                branches: 5,
                apiCalls: -1 // unlimited
            },
            capabilities: {
                basicReporting: true,
                advancedAnalytics: true,
                inventoryManagement: true,
                staffManagement: true,
                deliveryIntegration: true,
                supplierManagement: false,
                investmentPortal: false,
                multiBranchSync: false,
                customContracts: true,
                whiteLabel: false,
                dedicatedSupport: true,
                governance: false
            },
            trialMonths: 3,
            popular: true
        },
        {
            id: 'protocol',
            name: 'Protocol',
            price: '$199/month',
            monthlyPrice: 199,
            yearlyPrice: 199 * 12 * 0.8, // 20% discount
            features: ['Everything in Growth', 'Multi-Branch Sync', 'Custom API & Webhooks', 'White-label Options', 'On-chain Governance', 'Dedicated Success Manager'],
            limitations: {
                posTerminals: -1, // unlimited
                transactionsPerMonth: -1, // unlimited
                staffMembers: -1, // unlimited
                branches: -1, // unlimited
                apiCalls: -1 // unlimited
            },
            capabilities: {
                basicReporting: true,
                advancedAnalytics: true,
                inventoryManagement: true,
                staffManagement: true,
                deliveryIntegration: true,
                supplierManagement: true,
                investmentPortal: true,
                multiBranchSync: true,
                customContracts: true,
                whiteLabel: true,
                dedicatedSupport: true,
                governance: true
            },
            trialMonths: 3
        }
    ];

    // Load subscription from localStorage
    useEffect(() => {
        const storedSubscription = localStorage.getItem('userSubscription');
        if (storedSubscription) {
            try {
                const parsed = JSON.parse(storedSubscription);
                setSubscription(parsed);
            } catch (error) {
                console.error('Error parsing subscription data:', error);
            }
        }
    }, []);

    const hasFeature = (feature: string): boolean => {
        if (!subscription) return false;

        const currentPlan = plans.find(p => p.id === subscription.plan);
        if (!currentPlan) return false;

        // Check if feature is in the subscription features list
        if (subscription.features.includes(feature)) return true;

        // Check specific feature mappings based on capabilities
        switch (feature) {
            case 'delivery':
                return currentPlan.capabilities.deliveryIntegration;
            case 'supplier':
                return currentPlan.capabilities.supplierManagement;
            case 'investment':
                return currentPlan.capabilities.investmentPortal;
            case 'analytics':
                return currentPlan.capabilities.basicReporting;
            case 'advanced-analytics':
                return currentPlan.capabilities.advancedAnalytics;
            case 'priority-support':
                return currentPlan.capabilities.dedicatedSupport;
            case 'white-label':
                return currentPlan.capabilities.whiteLabel;
            case 'dedicated-support':
                return currentPlan.capabilities.dedicatedSupport;
            case 'multi-branch-sync':
                return currentPlan.capabilities.multiBranchSync;
            case 'custom-contracts':
                return currentPlan.capabilities.customContracts;
            case 'governance':
                return currentPlan.capabilities.governance;
            case 'inventory-management':
                return currentPlan.capabilities.inventoryManagement;
            case 'staff-management':
                return currentPlan.capabilities.staffManagement;
            default:
                return false;
        }
    };

    const canAccessApp = (app: string): boolean => {
        if (!subscription) return false;

        const currentPlan = plans.find(p => p.id === subscription.plan);
        if (!currentPlan) return false;

        switch (app) {
            case 'pos':
                return true; // All plans have POS access
            case 'delivery':
                return currentPlan.capabilities.deliveryIntegration;
            case 'supplier':
                return currentPlan.capabilities.supplierManagement;
            case 'portal':
            case 'investment':
                return currentPlan.capabilities.investmentPortal;
            default:
                return false;
        }
    };

    const getRemainingTrialDays = (): number => {
        if (!subscription || !subscription.isTrialActive) return 0;

        const trialStart = new Date(subscription.trialStartDate);
        const trialEnd = new Date(trialStart);
        trialEnd.setMonth(trialStart.getMonth() + subscription.trialMonths);

        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    };

    const isTrialExpired = (): boolean => {
        return getRemainingTrialDays() <= 0 && subscription?.isTrialActive;
    };

    const upgradePlan = async (newPlanId: string): Promise<void> => {
        const newPlan = plans.find(p => p.id === newPlanId);
        if (!newPlan || !subscription) return;

        const updatedSubscription: UserSubscription = {
            ...subscription,
            plan: newPlanId,
            planName: newPlan.name,
            features: newPlan.features,
            maxStaff: newPlan.limitations.staffMembers,
            hasDelivery: newPlan.capabilities.deliveryIntegration,
            hasSupplier: newPlan.capabilities.supplierManagement,
            hasInvestment: newPlan.capabilities.investmentPortal,
        };

        setSubscription(updatedSubscription);
        localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription));
    };

    const cancelSubscription = async (): Promise<void> => {
        if (!subscription) return;

        const updatedSubscription: UserSubscription = {
            ...subscription,
            isActive: false,
        };

        setSubscription(updatedSubscription);
        localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription));
    };

    const reactivateSubscription = async (): Promise<void> => {
        if (!subscription) return;

        const updatedSubscription: UserSubscription = {
            ...subscription,
            isActive: true,
        };

        setSubscription(updatedSubscription);
        localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription));
    };

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                plans,
                hasFeature,
                canAccessApp,
                getRemainingTrialDays,
                isTrialExpired,
                upgradePlan,
                cancelSubscription,
                reactivateSubscription,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};
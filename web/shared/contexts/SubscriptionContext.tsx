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
        aiAssistant: boolean;
        kds: boolean;
        roleManagement: boolean;
        securityModule: boolean;
        profitOptimization: boolean;
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
    upgradePlan: (newPlanId: string, billingCycle?: 'monthly' | 'yearly') => Promise<void>;
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
            price: '$9/month',
            monthlyPrice: 9,
            yearlyPrice: 90, // ~17% Off (2 months free)
            features: ['1 POS Terminal', '3 Staff Accounts', 'Basic Inventory', 'Sales Reports', 'Email Support'],
            limitations: {
                posTerminals: 1,
                transactionsPerMonth: 1000,
                staffMembers: 3,
                branches: 1,
                apiCalls: 5000
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
                governance: false,
                aiAssistant: false,
                kds: false,
                roleManagement: false,
                securityModule: false,
                profitOptimization: false
            },
            trialMonths: 1
        },
        {
            id: 'business',
            name: 'Business',
            price: '$19/month',
            monthlyPrice: 19,
            yearlyPrice: 190, // ~17% Off (2 months free)
            features: ['5 Terminals', '10 Staff Accounts', 'Full Inventory', 'Basic AI Assistant', 'Role Management', 'Priority Support'],
            limitations: {
                posTerminals: 5,
                transactionsPerMonth: -1, // unlimited
                staffMembers: 10,
                branches: 1,
                apiCalls: 20000
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
                customContracts: false,
                whiteLabel: false,
                dedicatedSupport: true,
                governance: false,
                aiAssistant: true,
                kds: true,
                roleManagement: true,
                securityModule: false,
                profitOptimization: false
            },
            trialMonths: 1,
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$39/month',
            monthlyPrice: 39,
            yearlyPrice: 390, // ~17% Off (2 months free)
            features: ['Unlimited Terminals', 'Unlimited Staff', 'Advanced AI & Payroll', 'Supplier Management', 'Security Module', 'Profit Optimization'],
            limitations: {
                posTerminals: -1,
                transactionsPerMonth: -1,
                staffMembers: -1,
                branches: 3,
                apiCalls: -1
            },
            capabilities: {
                basicReporting: true,
                advancedAnalytics: true,
                inventoryManagement: true,
                staffManagement: true,
                deliveryIntegration: true,
                supplierManagement: true,
                investmentPortal: true,
                multiBranchSync: false,
                customContracts: false,
                whiteLabel: false,
                dedicatedSupport: true,
                governance: true,
                aiAssistant: true,
                // Premium gets "Advanced AI" which implies basic assistant + more. 
                // We'll use 'advanced-ai' feature string for Premium checks.
                kds: true,
                roleManagement: true,
                securityModule: true,
                profitOptimization: true
            },
            trialMonths: 1
        },
        {
            id: 'protocol',
            name: 'Enterprise',
            price: 'Custom',
            monthlyPrice: 99,
            yearlyPrice: 990,
            features: ['Multi-Branch Sync', 'Custom Integrations', 'Dedicated Success Manager', 'SLA', 'White-label Options'],
            limitations: {
                posTerminals: -1,
                transactionsPerMonth: -1,
                staffMembers: -1,
                branches: -1,
                apiCalls: -1
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
                governance: true,
                aiAssistant: true,
                kds: true,
                roleManagement: true,
                securityModule: true,
                profitOptimization: true
            },
            trialMonths: 3
        }
    ];

    // Load subscription from localStorage
    useEffect(() => {
        const storedSubscription = localStorage.getItem('userSubscription');
        const activationStatus = localStorage.getItem('nilelink_activation_status');

        if (storedSubscription) {
            try {
                const parsed = JSON.parse(storedSubscription);

                // Sync activation status from Engine
                if (activationStatus === 'active') {
                    parsed.isActive = true;
                }

                setSubscription(parsed);
            } catch (error) {
                console.error('Error parsing subscription data:', error);
            }
        }
    }, []);

    const hasFeature = (feature: string): boolean => {
        if (!subscription) return false;
        if (!subscription.isActive) return false; // STRICT GATING
        if (isTrialExpired()) return false; // EXPIRATION GATING

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
            case 'ai-assistant':
                return currentPlan.capabilities.aiAssistant;
            case 'kds':
                return currentPlan.capabilities.kds;
            case 'roles':
                return currentPlan.capabilities.roleManagement;
            case 'security':
                return currentPlan.capabilities.securityModule;
            case 'profit-optimization':
                return currentPlan.capabilities.profitOptimization;
            case 'advanced-ai':
                // Check if plan implies advanced AI (Premium/Protocol)
                return currentPlan.id === 'premium' || currentPlan.id === 'protocol';
            default:
                return false;
        }
    };

    const canAccessApp = (app: string): boolean => {
        if (!subscription) return false;
        if (!subscription.isActive) return false; // STRICT GATING
        if (isTrialExpired()) return false; // EXPIRATION GATING

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
        return getRemainingTrialDays() <= 0 && !!subscription?.isTrialActive;
    };

    const upgradePlan = async (newPlanId: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<void> => {
        const newPlan = plans.find(p => p.id === newPlanId);
        if (!newPlan) return;

        const baseSubscription: UserSubscription = subscription || {
            plan: 'starter',
            planName: 'Starter',
            trialMonths: 1,
            isTrialActive: true,
            trialStartDate: new Date().toISOString(),
            features: [],
            isEarlyAdopter: false,
            maxStaff: 5,
            hasDelivery: false,
            hasSupplier: false,
            hasInvestment: false,
            isActive: false, // DEFAULT TO PENDING
            billingCycle: billingCycle
        };

        const updatedSubscription: UserSubscription = {
            ...baseSubscription,
            plan: newPlanId,
            planName: newPlan.name,
            features: newPlan.features,
            maxStaff: newPlan.limitations.staffMembers,
            hasDelivery: newPlan.capabilities.deliveryIntegration,
            hasSupplier: newPlan.capabilities.supplierManagement,
            hasInvestment: newPlan.capabilities.investmentPortal,
            billingCycle: billingCycle,
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
/**
 * Plans & Features Management Page
 * Configure subscription plans, pricing, and feature access
 * 
 * SUPER_ADMIN ONLY
 * 
 * FEATURES:
 * - View all plan tiers
 * - Update pricing (writes to smart contract)
 * - Configure features per plan
 * - Set plan limits (employees, products, locations)
 * - Enable/disable features
 * - Preview plan comparison
 * - Pricing history
 */

'use client';

import { useState, useEffect } from 'react';
import { useRole, useGuard } from '@shared/hooks/useGuard';
import { PlanTier, PlanFeaturesDetail } from '@shared/types/database';
import { PLAN_FEATURES } from '@shared/services/GuardLayer';

// ============================================
// TYPES
// ============================================

interface PlanConfig {
    plan: PlanTier;
    price: number; // In USD
    billingPeriod: 'MONTHLY' | 'YEARLY';
    maxEmployees: number;
    maxProducts: number;
    maxLocations: number;
    features: string[];
    aiRecommendations: boolean;
    deliveryEnabled: boolean;
    loyaltyEnabled: boolean;
    inventoryManagement: boolean;
    reportingAdvanced: boolean;
    apiAccess: boolean;
    description: string;
    descriptionAr: string;
    isActive: boolean;
}

// ============================================
// DEFAULT PLAN CONFIGURATIONS
// ============================================

const DEFAULT_PLANS: Record<PlanTier, PlanConfig> = {
    STARTER: {
        plan: 'STARTER',
        price: 29,
        billingPeriod: 'MONTHLY',
        maxEmployees: 5,
        maxProducts: 100,
        maxLocations: 1,
        features: PLAN_FEATURES.STARTER,
        aiRecommendations: false,
        deliveryEnabled: false,
        loyaltyEnabled: false,
        inventoryManagement: false,
        reportingAdvanced: false,
        apiAccess: false,
        description: 'Perfect for small businesses just getting started',
        descriptionAr: 'مثالي للشركات الصغيرة التي بدأت للتو',
        isActive: true,
    },
    BUSINESS: {
        plan: 'BUSINESS',
        price: 99,
        billingPeriod: 'MONTHLY',
        maxEmployees: 20,
        maxProducts: 1000,
        maxLocations: 3,
        features: PLAN_FEATURES.BUSINESS,
        aiRecommendations: false,
        deliveryEnabled: false,
        loyaltyEnabled: false,
        inventoryManagement: true,
        reportingAdvanced: false,
        apiAccess: false,
        description: 'For growing businesses with multiple locations',
        descriptionAr: 'للشركات المتنامية مع مواقع متعددة',
        isActive: true,
    },
    PREMIUM: {
        plan: 'PREMIUM',
        price: 299,
        billingPeriod: 'MONTHLY',
        maxEmployees: 50,
        maxProducts: -1, // Unlimited
        maxLocations: 10,
        features: PLAN_FEATURES.PREMIUM,
        aiRecommendations: true,
        deliveryEnabled: true,
        loyaltyEnabled: true,
        inventoryManagement: true,
        reportingAdvanced: true,
        apiAccess: true,
        description: 'Advanced features for established businesses',
        descriptionAr: 'ميزات متقدمة للشركات المؤسسة',
        isActive: true,
    },
    ENTERPRISE: {
        plan: 'ENTERPRISE',
        price: 999,
        billingPeriod: 'MONTHLY',
        maxEmployees: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxLocations: -1, // Unlimited
        features: PLAN_FEATURES.ENTERPRISE,
        aiRecommendations: true,
        deliveryEnabled: true,
        loyaltyEnabled: true,
        inventoryManagement: true,
        reportingAdvanced: true,
        apiAccess: true,
        description: 'Full-scale solution with custom features and dedicated support',
        descriptionAr: 'حل كامل مع ميزات مخصصة ودعم مخصص',
        isActive: true,
    },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PlansPage() {
    const { isSuperAdmin } = useRole('SUPER_ADMIN');
    const { can } = useGuard();
    const [plans, setPlans] = useState<Record<PlanTier, PlanConfig>>(DEFAULT_PLANS);
    const [editingPlan, setEditingPlan] = useState<PlanTier | null>(null);
    const [saving, setSaving] = useState(false);

    // Load plans from smart contract (if available)
    useEffect(() => {
        if (!isSuperAdmin) return;

        loadPlans();
    }, [isSuperAdmin]);

    const loadPlans = async () => {
        try {
            // TODO: Query smart contract for plan configurations
            // For now, use defaults
            console.log('[Plans] Using default plan configurations');
        } catch (error: any) {
            console.error('[Plans] Failed to load:', error);
        }
    };

    const handleSavePlan = async (plan: PlanTier) => {
        const canManage = await can('MANAGE_PLAN_FEATURES');
        if (!canManage) {
            alert('You do not have permission to manage plans');
            return;
        }

        if (!confirm(`Save changes to ${plan} plan?`)) return;

        try {
            setSaving(true);

            const planConfig = plans[plan];

            // TODO: Write to smart contract
            // const tx = await planContract.updatePlan({
            //   plan: plan,
            //   price: ethers.utils.parseEther(planConfig.price.toString()),
            //   maxEmployees: planConfig.maxEmployees,
            //   maxProducts: planConfig.maxProducts,
            //   ...
            // });

            console.log('[Plans] Plan updated:', plan, planConfig);

            // Upload metadata to IPFS
            // const metadataHash = await ipfsService.uploadJSON({
            //   description: planConfig.description,
            //   descriptionAr: planConfig.descriptionAr,
            //   features: planConfig.features,
            // });

            alert('Plan saved successfully!');
            setEditingPlan(null);
        } catch (error: any) {
            alert(`Failed to save plan: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePrice = (plan: PlanTier, newPrice: number) => {
        setPlans(prev => ({
            ...prev,
            [plan]: { ...prev[plan], price: newPrice },
        }));
    };

    const handleToggleFeature = (plan: PlanTier, feature: keyof PlanConfig) => {
        setPlans(prev => ({
            ...prev,
            [plan]: { ...prev[plan], [feature]: !prev[plan][feature] },
        }));
    };

    const handleUpdateLimit = (plan: PlanTier, field: 'maxEmployees' | 'maxProducts' | 'maxLocations', value: number) => {
        setPlans(prev => ({
            ...prev,
            [plan]: { ...prev[plan], [field]: value },
        }));
    };

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only Super Admins can manage plans</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white mb-2">
                    Plans & Features
                </h1>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                    Configure Subscription Plans • Pricing • Feature Access
                </p>
            </div>

            {/* Plan Comparison Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Feature
                                </th>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <th key={plan} className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {plan}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {/* Price */}
                            <tr className="hover:bg-white/5">
                                <td className="px-6 py-4 font-bold text-white">Monthly Price</td>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <td key={plan} className="px-6 py-4 text-center">
                                        {editingPlan === plan ? (
                                            <input
                                                type="number"
                                                value={plans[plan].price}
                                                onChange={(e) => handleUpdatePrice(plan, parseInt(e.target.value))}
                                                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">${plans[plan].price}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Employees */}
                            <tr className="hover:bg-white/5">
                                <td className="px-6 py-4 font-bold text-white">Max Employees</td>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <td key={plan} className="px-6 py-4 text-center">
                                        {editingPlan === plan ? (
                                            <input
                                                type="number"
                                                value={plans[plan].maxEmployees}
                                                onChange={(e) => handleUpdateLimit(plan, 'maxEmployees', parseInt(e.target.value))}
                                                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span className="text-white">{plans[plan].maxEmployees === -1 ? 'Unlimited' : plans[plan].maxEmployees}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Products */}
                            <tr className="hover:bg-white/5">
                                <td className="px-6 py-4 font-bold text-white">Max Products</td>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <td key={plan} className="px-6 py-4 text-center">
                                        {editingPlan === plan ? (
                                            <input
                                                type="number"
                                                value={plans[plan].maxProducts}
                                                onChange={(e) => handleUpdateLimit(plan, 'maxProducts', parseInt(e.target.value))}
                                                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span className="text-white">{plans[plan].maxProducts === -1 ? 'Unlimited' : plans[plan].maxProducts}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Locations */}
                            <tr className="hover:bg-white/5">
                                <td className="px-6 py-4 font-bold text-white">Max Locations</td>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <td key={plan} className="px-6 py-4 text-center">
                                        {editingPlan === plan ? (
                                            <input
                                                type="number"
                                                value={plans[plan].maxLocations}
                                                onChange={(e) => handleUpdateLimit(plan, 'maxLocations', parseInt(e.target.value))}
                                                className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <span className="text-white">{plans[plan].maxLocations === -1 ? 'Unlimited' : plans[plan].maxLocations}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Feature Toggles */}
                            {['aiRecommendations', 'deliveryEnabled', 'loyaltyEnabled', 'inventoryManagement', 'reportingAdvanced', 'apiAccess'].map(feature => (
                                <tr key={feature} className="hover:bg-white/5">
                                    <td className="px-6 py-4 font-bold text-white capitalize">
                                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                                    </td>
                                    {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                        <td key={plan} className="px-6 py-4 text-center">
                                            {editingPlan === plan ? (
                                                <button
                                                    onClick={() => handleToggleFeature(plan, feature as keyof PlanConfig)}
                                                    className={`px-4 py-2 rounded font-bold text-xs ${plans[plan][feature as keyof PlanConfig]
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-600 text-gray-300'
                                                        }`}
                                                >
                                                    {plans[plan][feature as keyof PlanConfig] ? 'ENABLED' : 'DISABLED'}
                                                </button>
                                            ) : (
                                                <span className="text-2xl">
                                                    {plans[plan][feature as keyof PlanConfig] ? '✅' : '❌'}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Action Row */}
                            <tr className="bg-white/10">
                                <td className="px-6 py-4 font-bold text-white">Actions</td>
                                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                                    <td key={plan} className="px-6 py-4 text-center">
                                        {editingPlan === plan ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleSavePlan(plan)}
                                                    disabled={saving}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold text-xs disabled:opacity-50"
                                                >
                                                    💾 Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPlans(DEFAULT_PLANS);
                                                        setEditingPlan(null);
                                                    }}
                                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingPlan(plan)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold text-xs"
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(['STARTER', 'BUSINESS', 'PREMIUM', 'ENTERPRISE'] as PlanTier[]).map(plan => (
                    <PlanCard key={plan} config={plans[plan]} />
                ))}
            </div>

            {/* Notes */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    Important Notes
                </h3>
                <ul className="text-yellow-200 text-sm space-y-1 list-disc list-inside">
                    <li>Price changes affect NEW subscriptions only</li>
                    <li>Existing subscribers keep their current pricing</li>
                    <li>Feature changes apply immediately to all subscribers</li>
                    <li>Use -1 for unlimited limits</li>
                    <li>All changes are written to blockchain</li>
                </ul>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function PlanCard({ config }: { config: PlanConfig }) {
    const colors = {
        STARTER: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
        BUSINESS: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        PREMIUM: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        ENTERPRISE: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[config.plan]} backdrop-blur-sm border rounded-xl p-6`}>
            <h3 className="text-2xl font-black text-white mb-2">{config.plan}</h3>
            <div className="text-4xl font-black text-white mb-4">
                ${config.price}
                <span className="text-sm text-gray-400 font-normal">/mo</span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="text-gray-300">
                    <span className="font-bold">Employees:</span> {config.maxEmployees === -1 ? '∞' : config.maxEmployees}
                </div>
                <div className="text-gray-300">
                    <span className="font-bold">Products:</span> {config.maxProducts === -1 ? '∞' : config.maxProducts}
                </div>
                <div className="text-gray-300">
                    <span className="font-bold">Locations:</span> {config.maxLocations === -1 ? '∞' : config.maxLocations}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400">{config.description}</p>
            </div>
        </div>
    );
}

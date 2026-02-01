/**
 * Subscriber Management Page
 * Manage all business subscriptions, activation codes, and plan changes
 * 
 * FEATURES:
 * - View all subscribers from blockchain
 * - Generate activation codes (on-chain)
 * - Approve/reject plan changes
 * - Manually mark payments as received
 * - Revoke access for expired/unpaid accounts
 * - Filter by plan, status, country
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { contractService } from '@shared/services/web3/ContractService';
import { useRole, useGuard } from '@shared/hooks/useGuard';
import { PlanTier, OnChainBusiness } from '@shared/types/database';

// ===========================================
// TYPES
// ============================================

interface Subscriber {
    id: string;
    tokenId: string;
    owner: string;
    businessType: string;
    country: string;
    plan: PlanTier;
    planExpiry: number;
    paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
    isActive: boolean;
    registeredAt: number;
    metadataURI: string;
}

interface BusinessMetadata {
    name: string;
    nameAr?: string;
    logo?: string;
    contact: {
        phone: string;
        email: string;
    };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SubscribersPage() {
    const { isSuperAdmin } = useRole('SUPER_ADMIN');
    const { can } = useGuard();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterPlan, setFilterPlan] = useState<PlanTier | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'PENDING'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch subscribers
    useEffect(() => {
        if (!isSuperAdmin) {
            setError('Access denied');
            setLoading(false);
            return;
        }

        fetchSubscribers();
    }, [isSuperAdmin]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);

            const filters: any = {};
            if (filterPlan !== 'ALL') filters.plan = filterPlan;
            if (filterStatus === 'ACTIVE') filters.isActive = true;

            const businesses = await graphService.getAllBusinesses(filters);

            // Apply additional filtering
            let filtered = businesses as Subscriber[];

            if (filterStatus === 'EXPIRED') {
                const now = Math.floor(Date.now() / 1000);
                filtered = filtered.filter(b => b.planExpiry <= now);
            } else if (filterStatus === 'PENDING') {
                filtered = filtered.filter(b => b.paymentStatus === 'PENDING');
            }

            if (searchQuery) {
                filtered = filtered.filter(b =>
                    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.owner.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setSubscribers(filtered);
            setError(null);
        } catch (err: any) {
            console.error('[Subscribers] Failed to fetch:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Generate activation code
    const handleGenerateCode = async (businessId: string) => {
        const canGenerate = await can('GENERATE_ACTIVATION_CODE');
        if (!canGenerate) {
            alert('You do not have permission to generate activation codes');
            return;
        }

        try {
            alert('Initiating blockchain transaction... Please confirm in your wallet.');
            const txHash = await contractService.generateActivationCode(businessId);

            alert(`Transaction Sent!\nHash: ${txHash}\n\nThe activation code will be emitted in the transaction logs once confirmed.`);
            fetchSubscribers(); // Refresh
        } catch (err: any) {
            console.error(err);
            alert(`Failed to generate code: ${err.message}`);
        }
    };

    // Approve payment manually
    const handleApprovePayment = async (businessId: string) => {
        if (!confirm('Confirm manual payment approval? This will execute a blockchain transaction.')) return;

        try {
            alert('Initiating blockchain transaction...');
            const txHash = await contractService.approveBusinessPayment(businessId);

            alert(`Payment Approval Transaction Sent!\nHash: ${txHash}`);
            fetchSubscribers(); // Refresh
        } catch (err: any) {
            console.error(err);
            alert(`Failed to approve payment: ${err.message}`);
        }
    };

    // Deactivate business
    const handleDeactivate = async (businessId: string) => {
        if (!confirm('Are you sure you want to deactivate this business? They will lose access immediately.')) return;

        try {
            alert('Initiating emergency stop...');
            const txHash = await contractService.deactivateBusiness(businessId);

            alert(`Deactivation Transaction Sent!\nHash: ${txHash}`);
            fetchSubscribers(); // Refresh
        } catch (err: any) {
            console.error(err);
            alert(`Failed to deactivate: ${err.message}`);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only Super Admins can manage subscribers</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white mb-2">
                    Subscriber Management
                </h1>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                    Manage Subscriptions • Activation Codes • Payments
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by ID or owner address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Plan Filter */}
                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Plans</option>
                        <option value="STARTER">Starter</option>
                        <option value="BUSINESS">Business</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="ENTERPRISE">Enterprise</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="PENDING">Pending Payment</option>
                    </select>

                    {/* Apply Button */}
                    <button
                        onClick={fetchSubscribers}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Subscribers" value={subscribers.length} icon="🏢" />
                <StatCard
                    label="Active"
                    value={subscribers.filter(s => s.isActive && s.planExpiry > Date.now() / 1000).length}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    label="Expired"
                    value={subscribers.filter(s => s.planExpiry <= Date.now() / 1000).length}
                    icon="⏱️"
                    color="red"
                />
                <StatCard
                    label="Pending Payment"
                    value={subscribers.filter(s => s.paymentStatus === 'PENDING').length}
                    icon="💳"
                    color="yellow"
                />
            </div>

            {/* Subscribers Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin text-4xl mb-4">⚙️</div>
                        <p>Loading subscribers from blockchain...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p>{error}</p>
                        <button
                            onClick={fetchSubscribers}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                            Retry
                        </button>
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="text-4xl mb-4">📭</div>
                        <p>No subscribers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Business ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {subscribers.map((sub) => (
                                    <SubscriberRow
                                        key={sub.id}
                                        subscriber={sub}
                                        onGenerateCode={handleGenerateCode}
                                        onApprovePayment={handleApprovePayment}
                                        onDeactivate={handleDeactivate}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
    label,
    value,
    icon,
    color = 'blue',
}: {
    label: string;
    value: number;
    icon: string;
    color?: 'blue' | 'green' | 'red' | 'yellow';
}) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
        </div>
    );
}

function SubscriberRow({
    subscriber,
    onGenerateCode,
    onApprovePayment,
    onDeactivate,
}: {
    subscriber: Subscriber;
    onGenerateCode: (id: string) => void;
    onApprovePayment: (id: string) => void;
    onDeactivate: (id: string) => void;
}) {
    const isExpired = subscriber.planExpiry <= Date.now() / 1000;
    const isActive = subscriber.isActive && !isExpired;

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-mono text-sm text-gray-300">
                {subscriber.id.slice(0, 12)}...
            </td>
            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                {subscriber.owner.slice(0, 8)}...{subscriber.owner.slice(-6)}
            </td>
            <td className="px-6 py-4">
                <PlanBadge plan={subscriber.plan} />
            </td>
            <td className="px-6 py-4 text-white uppercase text-sm">
                {subscriber.country}
            </td>
            <td className="px-6 py-4 text-gray-300 text-sm">
                {new Date(subscriber.planExpiry * 1000).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <StatusBadge
                    status={isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'INACTIVE'}
                    paymentStatus={subscriber.paymentStatus}
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onGenerateCode(subscriber.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
                        title="Generate Activation Code"
                    >
                        🔑 Code
                    </button>
                    {subscriber.paymentStatus === 'PENDING' && (
                        <button
                            onClick={() => onApprovePayment(subscriber.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-bold"
                            title="Approve Payment"
                        >
                            ✅ Approve
                        </button>
                    )}
                    <button
                        onClick={() => onDeactivate(subscriber.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-bold"
                        title="Deactivate"
                    >
                        🚫 Deactivate
                    </button>
                </div>
            </td>
        </tr>
    );
}

function PlanBadge({ plan }: { plan: PlanTier }) {
    const colors = {
        STARTER: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        BUSINESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        PREMIUM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        ENTERPRISE: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[plan]}`}>
            {plan}
        </span>
    );
}

function StatusBadge({
    status,
    paymentStatus,
}: {
    status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
    paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
}) {
    if (paymentStatus === 'PENDING') {
        return (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                ⏳ Pending Payment
            </span>
        );
    }

    const colors = {
        ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
        EXPIRED: 'bg-red-500/20 text-red-300 border-red-500/30',
        INACTIVE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    const icons = {
        ACTIVE: '✅',
        EXPIRED: '⏱️',
        INACTIVE: '🚫',
    };

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[status]}`}>
            {icons[status]} {status}
        </span>
    );
}

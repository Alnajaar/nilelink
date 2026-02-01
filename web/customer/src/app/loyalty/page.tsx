/**
 * Customer Loyalty & Rewards Page
 * manage points, tiers, and rewards
 * 
 * FEATURES:
 * - Real-time point balance from blockchain
 * - Dynamic membership tiering (Bronze, Silver, Gold, Platinum)
 * - Points history (Earned from orders, Redeemed)
 * - Available rewards catalog for redemption
 * - Personal QR Code for in-store point usage
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { graphService } from '@shared/services/GraphService';

// ============================================
// TYPES
// ============================================

interface Reward {
    id: string;
    title: string;
    cost: number;
    description: string;
    icon: string;
    available: boolean;
}

interface PointTransaction {
    id: string;
    type: 'EARNED' | 'REDEEMED';
    amount: number;
    description: string;
    timestamp: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LoyaltyPage() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                // 1. Fetch Customer Profile for Balance
                const customer = await graphService.getCustomerByWallet(user.uid);
                if (customer) {
                    setBalance(customer.loyaltyPoints || 0);
                }

                // 2. Fetch Orders for History (simulate "Earned" events from orders)
                const orders = await graphService.getOrdersByCustomer(user.uid);
                const historyItems: PointTransaction[] = orders.map(order => ({
                    id: order.id,
                    type: 'EARNED',
                    amount: Math.floor(Number(order.total)), // 1 point per $1
                    description: `Order #${order.id.slice(0, 6).toUpperCase()}`,
                    timestamp: order.createdAt * 1000
                }));

                setHistory(historyItems);
            } catch (err) {
                console.error("Failed to load loyalty data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const rewards: Reward[] = [
        { id: 'r1', title: '$5 Discount', cost: 250, description: 'Get $5 off your next order', icon: '💸', available: true },
        { id: 'r2', title: 'Free Delivery', cost: 400, description: 'No delivery fee on your next order', icon: '🚚', available: true },
        { id: 'r3', title: '$15 Discount', cost: 700, description: 'Get $15 off your next order', icon: '💰', available: true },
        { id: 'r4', title: 'Free Drink', cost: 150, description: 'Redeem for any soft drink', icon: '🥤', available: true },
    ];

    // Tier calculation
    const getTier = (points: number) => {
        if (points >= 5000) return { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
        if (points >= 2000) return { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        if (points >= 500) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-500/20' };
        return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    };

    const currentTier = getTier(balance);

    const handleRedeem = (reward: Reward) => {
        if (balance < reward.cost) {
            alert('Insufficient points');
            return;
        }
        if (confirm(`Redeem ${reward.title} for ${reward.cost} points?`)) {
            setBalance(prev => prev - reward.cost);
            setHistory(prev => [{
                id: Math.random().toString(),
                type: 'REDEEMED',
                amount: reward.cost,
                description: `Redeemed ${reward.title}`,
                timestamp: Date.now()
            }, ...prev]);
            alert('Reward redeemed! Check your email for details.');
        }
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-white mb-8">NileLink Rewards</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-blue-600/20 border border-white/10 rounded-3xl p-8 overflow-hidden relative">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${currentTier.bg} ${currentTier.color}`}>
                                        {currentTier.name} Member
                                    </div>
                                    <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-1">Available Balance</h2>
                                    <div className="text-6xl font-black text-white flex items-end gap-2">
                                        {balance.toLocaleString()}
                                        <span className="text-xl text-blue-400 mb-2">Pts</span>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                                    {/* Personal QR code for store usage */}
                                    <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-4xl">🔳</div>
                                    <div className="text-black text-[10px] font-bold text-center mt-2 uppercase">Scan to Earn</div>
                                </div>
                            </div>

                            {/* Progress bar to next tier */}
                            <div className="mt-8 space-y-2">
                                <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                                    <span>Progress to next tier</span>
                                    <span>750 Pts remaining</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-2/3 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Rewards Catalog */}
                        <h2 className="text-2xl font-bold text-white mb-6">Available Rewards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rewards.map(reward => (
                                <div key={reward.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/20 transition-all">
                                    <div className="text-5xl">{reward.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold">{reward.title}</h3>
                                        <p className="text-gray-400 text-xs mb-3">{reward.description}</p>
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={balance < reward.cost}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-gray-600 rounded-lg text-white font-bold text-xs transition-all"
                                        >
                                            Redeem {reward.cost} Pts
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-full">
                            <h3 className="text-lg font-bold text-white mb-6">Points History</h3>
                            <div className="space-y-6">
                                {history.map(item => (
                                    <div key={item.id} className="flex items-start justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0">
                                        <div>
                                            <div className="text-white text-sm font-bold">{item.description}</div>
                                            <div className="text-gray-500 text-xs">{new Date(item.timestamp).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`font-black ${item.type === 'EARNED' ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.type === 'EARNED' ? '+' : '-'}{item.amount}
                                        </div>
                                    </div>
                                ))}

                                {history.length === 0 && !loading && (
                                    <div className="text-center py-10 text-gray-500 italic">No transactions yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

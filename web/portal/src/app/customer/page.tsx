"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Star, Clock, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { loyaltyApi } from '@shared/utils/api';

export default function CustomerPage() {
    const [profile, setProfile] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // In a real app, you'd handle auth state check here
                // For demo, we might fail if not logged in, but we'll try fetch
                const [profData, histData] = await Promise.all([
                    loyaltyApi.getProfile().catch(() => null),
                    loyaltyApi.getHistory().catch(() => [])
                ]);
                setProfile(profData);
                setHistory(histData || []);
            } catch (e) {
                console.error("Failed to load loyalty data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleRedeem = async (type: string, cost: number) => {
        if (!confirm(`Redeem ${cost} points for ${type.replace('_', ' ')}?`)) return;
        try {
            await loyaltyApi.redeem(cost, type);
            // Reload
            const prof = await loyaltyApi.getProfile();
            setProfile(prof);
            alert('Reward redeemed! Check your email.');
        } catch (e) {
            alert('Redemption failed. Insufficient points?');
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary pb-20">
            {/* Header */}
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to NileLink
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 inline-block">
                            Customer Profile
                        </Badge>
                        <h1 className="text-4xl font-black italic tracking-tighter">
                            MY REWARDS
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 opacity-50">Loading profile...</div>
                ) : !profile ? (
                    <Card className="p-8 text-center bg-white border-2 border-dashed border-neutral-300">
                        <Trophy size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Join the Club</h3>
                        <p className="mb-6 opacity-60">Sign in to start earning points on every order.</p>
                        <Link href="/auth/login">
                            <Button className="bg-primary text-white">Sign In / Sign Up</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-gradient-to-br from-primary to-primary-dark text-white p-8 border-0 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="text-white/60 text-sm font-medium mb-1">Current Balance</p>
                                            <h2 className="text-5xl font-black">{profile.loyaltyPoints.toLocaleString()}</h2>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                            <Star className="text-yellow-300 fill-current" size={24} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/80">Tier Status</span>
                                            <span className="font-bold">{profile.tier?.name || 'Standard'} Member</span>
                                        </div>
                                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-400 w-3/4"></div>
                                        </div>
                                        <p className="text-xs text-center text-white/50">1,250 points to Gold Status</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 bg-white border border-neutral-200">
                                <h3 className="font-bold mb-6 flex items-center gap-2">
                                    <Gift size={20} className="text-primary" />
                                    Redeem Rewards
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
                                        onClick={() => handleRedeem('FREE_ITEM', 500)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                                <Trophy size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Free Main Dish</p>
                                                <p className="text-xs opacity-60">Any item under $15</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs">
                                            500 pts
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
                                        onClick={() => handleRedeem('DISCOUNT_COUPON', 1000)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                                <Gift size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">50% Off Order</p>
                                                <p className="text-xs opacity-60">Max discount $25</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs">
                                            1,000 pts
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* History Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-6 bg-white border border-neutral-200 flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-60">Total Spent</p>
                                        <p className="text-2xl font-bold">${Number(profile.totalSpent).toLocaleString()}</p>
                                    </div>
                                </Card>
                                <Card className="p-6 bg-white border border-neutral-200 flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-60">Orders Placed</p>
                                        <p className="text-2xl font-bold">{profile.orderCount}</p>
                                    </div>
                                </Card>
                            </div>

                            <Card className="bg-white border border-neutral-200 p-0 overflow-hidden">
                                <div className="p-6 border-b border-neutral-100">
                                    <h3 className="font-bold">Activity History</h3>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {history.map((tx) => (
                                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tx.amount > 0 ? <TrendingUp size={18} /> : <Gift size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{tx.reason}</p>
                                                    <p className="text-xs opacity-50">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-text-primary'
                                                }`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                                            </span>
                                        </div>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="p-12 text-center opacity-50">
                                            No activity yet. Place your first order!
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

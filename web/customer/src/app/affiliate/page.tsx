"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users, DollarSign, Gift, CheckCircle, ArrowRight,
    Star, TrendingUp, Award, Target, Zap, Shield,
    BookOpen, AlertCircle, Info, Crown, Clock
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';

interface AffiliateStats {
    totalEarnings: number;
    pendingEarnings: number;
    referrals: number;
    conversionRate: number;
    level: string;
    nextLevelThreshold: number;
}

export default function AffiliatePage() {
    return (
        <AuthGuard>
            <AffiliateContent />
        </AuthGuard>
    );
}

function AffiliateContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRules, setShowRules] = useState(false);

    useEffect(() => {
        const checkAffiliateStatus = async () => {
            if (!user?.uid) return;

            try {
                // Get fresh token for production auth
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

                // Add userId query param for dev bypass + Auth header for production
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // Check if user is enrolled in affiliate program
                const response = await fetch(`/api/affiliates/me?userId=${user.uid}`, {
                    headers
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsEnrolled(data.isEnrolled || !!data.data?.profile);
                    if (data.data?.profile && data.data?.stats) {
                        const { stats: apiStats } = data.data;
                        setStats({
                            totalEarnings: apiStats.lifetimeEarnings,
                            pendingEarnings: apiStats.pendingEarnings,
                            referrals: apiStats.totalReferrals,
                            conversionRate: apiStats.totalReferrals > 0 ? Math.round((apiStats.activeReferrals / apiStats.totalReferrals) * 100) : 0,
                            level: data.data.profile.tier || 'BRONZE',
                            nextLevelThreshold: 10 // Mock threshold
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking affiliate status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAffiliateStatus();
    }, [user]);

    const handleEnroll = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Get fresh token for production auth
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`; // REQUIRED for production
            }

            const response = await fetch('/api/affiliates/enroll', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    userId: user.uid,
                    userEmail: user.email,
                    userName: user.displayName || 'Affiliate User'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setIsEnrolled(true);
                // Refresh to get full stats
                window.location.reload();
            } else {
                console.error('Failed to enroll in affiliate program');
            }
        } catch (error) {
            console.error('Error enrolling in affiliate program:', error);
        }
    };

    const affiliateRules = [
        {
            icon: Users,
            title: "Referral System",
            description: "Earn commissions when people you refer make purchases on NileLink"
        },
        {
            icon: DollarSign,
            title: "Tiered Commissions",
            description: "Higher commission rates as you reach different performance levels"
        },
        {
            icon: Target,
            title: "Performance Bonuses",
            description: "Extra rewards for hitting monthly referral and revenue targets"
        },
        {
            icon: Shield,
            title: "Quality Assurance",
            description: "All referrals must result in genuine purchases to qualify for commissions"
        },
        {
            icon: Clock,
            title: "30-Day Cookie",
            description: "Earn commission on purchases made within 30 days of your referral"
        },
        {
            icon: Award,
            title: "Exclusive Perks",
            description: "Access to exclusive deals, early product releases, and VIP support"
        }
    ];

    const commissionTiers = [
        { level: "Bronze", referrals: 0, commission: "5%", threshold: 0 },
        { level: "Silver", referrals: 10, commission: "7%", threshold: 10 },
        { level: "Gold", referrals: 50, commission: "10%", threshold: 50 },
        { level: "Platinum", referrals: 100, commission: "12%", threshold: 100 },
        { level: "Diamond", referrals: 250, commission: "15%", threshold: 250 }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading affiliate program...</p>
                </div>
            </div>
        );
    }

    if (isEnrolled && stats) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center mb-4">
                            <Crown className="w-12 h-12 text-yellow-500 mr-3" />
                            <h1 className="text-4xl font-bold text-slate-900">Affiliate Dashboard</h1>
                        </div>
                        <p className="text-slate-600 text-lg">Welcome to your affiliate control center</p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card className="border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Earnings</p>
                                    <p className="text-2xl font-bold text-slate-900">${stats.totalEarnings.toFixed(2)}</p>
                                    <div className="flex items-center mt-1">
                                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-xs text-green-500">+12% this month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Pending Earnings</p>
                                    <p className="text-2xl font-bold text-slate-900">${stats.pendingEarnings.toFixed(2)}</p>
                                    <div className="flex items-center mt-1">
                                        <Clock className="w-4 h-4 text-blue-500 mr-1" />
                                        <span className="text-xs text-blue-500">Processing</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Referrals</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.referrals}</p>
                                    <div className="flex items-center mt-1">
                                        <Users className="w-4 h-4 text-purple-500 mr-1" />
                                        <span className="text-xs text-purple-500">Active members</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</p>
                                    <div className="flex items-center mt-1">
                                        <Target className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="text-xs text-yellow-500">Above average</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Target className="w-6 h-6 text-yellow-500" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Current Level */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Award className="w-8 h-8 text-yellow-500 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Current Level: {stats.level}</h3>
                                        <p className="text-slate-600">Commission Rate: {commissionTiers.find(t => t.level === stats.level)?.commission}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600">Next Level</p>
                                    <p className="text-lg font-bold text-slate-900">{stats.nextLevelThreshold - stats.referrals} referrals to go</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/affiliate/share')}>
                            <div className="text-center p-6">
                                <Gift className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Referral Social</h3>
                                <p className="text-slate-600">Share your referral links on social media</p>
                            </div>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/affiliate/earnings')}>
                            <div className="text-center p-6">
                                <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Earnings</h3>
                                <p className="text-slate-600">Track your commissions and payouts</p>
                            </div>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/affiliate/referrals')}>
                            <div className="text-center p-6">
                                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">My Referrals</h3>
                                <p className="text-slate-600">View people you've referred</p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center mb-4">
                        <Users className="w-16 h-16 text-blue-500 mr-4" />
                        <h1 className="text-4xl font-bold text-slate-900">NileLink Affiliate Program</h1>
                    </div>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Join our exclusive affiliate program and earn commissions by referring customers to amazing suppliers
                    </p>
                </motion.div>

                {/* Program Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                >
                    {affiliateRules.map((rule, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <rule.icon className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{rule.title}</h3>
                                <p className="text-slate-600">{rule.description}</p>
                            </div>
                        </Card>
                    ))}
                </motion.div>

                {/* Commission Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <Card>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Commission Tiers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {commissionTiers.map((tier, index) => (
                                    <div key={tier.level} className="text-center p-4 bg-slate-50 rounded-lg">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Star className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-1">{tier.level}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{tier.commission} Commission</p>
                                        <p className="text-xs text-slate-500">{tier.referrals}+ Referrals</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Program Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <Card>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Program Rules & Guidelines</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRules(!showRules)}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {showRules ? 'Hide' : 'Show'} Rules
                                </Button>
                            </div>

                            {showRules && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-blue-900 mb-1">Eligibility</h4>
                                                <p className="text-blue-700 text-sm">Must be 18+ years old and have a valid NileLink account</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-yellow-900 mb-1">Cookie Duration</h4>
                                                <p className="text-yellow-700 text-sm">Commissions are earned on purchases made within 30 days of clicking your referral link</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-green-900 mb-1">Payment Terms</h4>
                                                <p className="text-green-700 text-sm">Commissions are paid monthly for approved purchases, minimum payout is $25</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Shield className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-red-900 mb-1">Prohibited Activities</h4>
                                                <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                                                    <li>Spamming or unsolicited marketing</li>
                                                    <li>Fraudulent referrals or fake accounts</li>
                                                    <li>Violating platform terms of service</li>
                                                    <li>Using misleading advertising</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Join Program CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <div className="p-8">
                            <Zap className="w-16 h-16 text-white mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
                            <p className="text-xl mb-8 text-blue-100">
                                Join thousands of successful affiliates and start earning commissions today
                            </p>
                            <Button
                                onClick={handleEnroll}
                                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-bold"
                            >
                                Join Affiliate Program
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

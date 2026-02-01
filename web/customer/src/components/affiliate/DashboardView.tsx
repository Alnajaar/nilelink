'use client';

import { useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { motion } from 'framer-motion';
import { Copy, Plus, Wallet, TrendingUp, Users, DollarSign, Loader2, QrCode } from 'lucide-react';
import ReferralList from './ReferralList';
import PayoutsList from './PayoutsList';
import Cookies from 'js-cookie';

export default function DashboardView() {
    const { affiliate, stats, isLoading, mutate } = useAffiliate();
    const [copied, setCopied] = useState(false);
    const [requestingPayout, setRequestingPayout] = useState(false);
    const [amount, setAmount] = useState('');

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    const referralLink = affiliate?.affiliateLink || `${typeof window !== 'undefined' ? window.location.origin : 'https://nilelink.app'}/register?ref=${affiliate?.referralCode}`;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRequestPayout = async () => {
        const val = parseFloat(amount);
        if (!val || val < 50) return alert('Minimum payout is $50');

        const token = Cookies.get('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/affiliates/payouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: val,
                    method: 'IN_APP_WALLET', // Default for now
                    details: {}
                })
            });
            const data = await res.json();
            if (data.success) {
                setAmount('');
                setRequestingPayout(false);
                mutate(); // Refresh balance
                alert('Payout requested!');
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Error requesting payout');
        }
    };

    return (
        <div className="pb-24">
            {/* Header Stats */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-3xl rounded-full translate-y-[-50%]" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title="Total Earnings"
                        value={`$${Number(affiliate?.lifetimeEarnings || 0).toFixed(2)}`}
                        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
                        trend="+12% this month"
                    />
                    <StatsCard
                        title="Available Balance"
                        value={`$${Number(affiliate?.balance || 0).toFixed(2)}`}
                        icon={<Wallet className="w-5 h-5 text-blue-400" />}
                        action={
                            <button
                                onClick={() => setRequestingPayout(!requestingPayout)}
                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
                            >
                                Cash Out
                            </button>
                        }
                    />
                    <StatsCard
                        title="Active Businesses"
                        value={stats?.activeReferrals || 0}
                        subValue={`/${stats?.totalReferrals || 0} Signed Up`}
                        icon={<Users className="w-5 h-5 text-indigo-400" />}
                    />
                </div>
            </div>

            {/* Payout Form */}
            {requestingPayout && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-4 bg-slate-800 rounded-xl border border-slate-700"
                >
                    <h3 className="font-semibold text-white mb-2">Request Payout</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount (Min $50)"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <button onClick={handleRequestPayout} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium">
                            Confirm
                        </button>
                        <button onClick={() => setRequestingPayout(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Share Section */}
            <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-500/30 backdrop-blur-md">
                <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                        <div className="flex bg-slate-950/50 rounded-xl border border-indigo-500/30 p-1.5 pl-4 items-center">
                            <span className="flex-1 text-slate-300 font-mono text-sm truncate">{referralLink}</span>
                            <button
                                onClick={copyLink}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-lg transition-all"
                            >
                                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-indigo-200/70">
                            Share this link with business owners. You earn when they transact.
                        </p>
                    </div>
                    <div className="flex-shrink-0 bg-white p-3 rounded-xl">
                        {/* Fallback QR if no library */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(referralLink)}`}
                            alt="QR Code"
                            className="w-24 h-24"
                        />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Referred Businesses</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    <ReferralList />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Payout History</h3>
                    </div>
                    <PayoutsList />
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, subValue, icon, trend, action }: any) {
    return (
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-slate-800/50">{icon}</div>
                {action}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    {subValue && <span className="text-sm text-slate-500 mb-1">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    );
}

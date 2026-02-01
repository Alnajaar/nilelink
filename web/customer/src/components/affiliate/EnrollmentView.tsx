'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Loader2, Users, DollarSign, Gift, ShieldCheck } from 'lucide-react';
import Cookies from 'js-cookie';

interface Props {
    onSuccess: () => void;
}

export default function EnrollmentView({ onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEnroll = async () => {
        setLoading(true);
        setError('');
        const token = Cookies.get('token');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/affiliates/enroll`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (data.success) {
                onSuccess();
            } else {
                setError(data.error || 'Failed to enroll');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                    NileLink Partner Program
                </div>

                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 mb-6 tracking-tight">
                    Earn by growing the ecosystem.
                </h1>

                <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto">
                    Refer businesses to NileLink and earn ongoing commissions.
                    Real cash payouts, transparent tracking, and exclusive rewards.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-10">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-bold text-white text-lg">Earning Structure</h3>
                        </div>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>10% commission on all referred business transactions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>$50 bonus for each business that stays active for 30 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Tier bonuses: Up to 15% commission for top performers</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Gift className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-white text-lg">Benefits</h3>
                        </div>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Instant payout processing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Real-time analytics dashboard</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Exclusive partner events and resources</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mb-10 text-center">
                    <h3 className="font-bold text-white text-xl mb-6">How It Works</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-left">
                        {
                            [
                                { title: '1. Apply', desc: 'Click "Become a Partner" to join the program.', icon: <ShieldCheck className="w-5 h-5" /> },
                                { title: '2. Share', desc: 'Send your unique referral link to business owners.', icon: <Users className="w-5 h-5" /> },
                                { title: '3. Earn', desc: 'Get paid when businesses join and stay active.', icon: <DollarSign className="w-5 h-5" /> }
                            ].map((item, i) => (
                                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <h4 className="font-semibold text-white">{item.title}</h4>
                                    </div>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        <>
                            Become a Partner <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}

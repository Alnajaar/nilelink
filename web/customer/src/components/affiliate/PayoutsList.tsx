'use client';

import { useAffiliatePayouts } from '@/hooks/useAffiliate';
import { Wallet, ArrowDownLeft } from 'lucide-react';

export default function PayoutsList() {
    const { payouts, isLoading } = useAffiliatePayouts();

    if (isLoading) return <div className="p-4 text-slate-400">Loading payouts...</div>;

    if (payouts.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500 text-sm">No payout history found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {payouts.map((payout: any) => (
                <div key={payout.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payout.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                                payout.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-200">
                                {payout.method === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Wallet Withdrawal'}
                            </div>
                            <div className="text-xs text-slate-500">
                                {new Date(payout.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-bold">
                            -${Number(payout.amount).toFixed(2)}
                        </div>
                        <div className={`text-xs font-medium ${payout.status === 'PAID' ? 'text-emerald-400' :
                                payout.status === 'REQUESTED' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {payout.status}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

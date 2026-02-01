'use client';

import { useAffiliateReferrals } from '@/hooks/useAffiliate';
import { Building2, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function ReferralList() {
    const { referrals, isLoading } = useAffiliateReferrals();

    if (isLoading) return <div className="p-4 text-slate-400">Loading referrals...</div>;

    if (referrals.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-300">No Referrals Yet</h3>
                <p className="text-slate-500 text-sm">Share your link to start earning!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {referrals.map((ref: any) => (
                <div key={ref.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-200">{ref.businessName || 'Unnamed Business'}</h4>
                            <StatusBadge status={ref.status} />
                        </div>
                        <p className="text-sm text-slate-500">{ref.contactEmail}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-slate-400">Earned</div>
                        <div className="text-emerald-400 font-bold">
                            ${Number(ref.totalCommissionEarned).toFixed(2)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        INVITED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        REGISTERED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        APPROVED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        DECLINED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const icons: any = {
        INVITED: <Clock className="w-3 h-3" />,
        REGISTERED: <CheckCircle2 className="w-3 h-3" />,
        ACTIVE: <CheckCircle2 className="w-3 h-3" />,
        DECLINED: <XCircle className="w-3 h-3" />,
    };

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['INVITED']}`}>
            {icons[status]} {status}
        </span>
    );
}

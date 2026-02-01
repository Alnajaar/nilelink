'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { toast } from 'react-hot-toast';
import {
    DollarSign,
    CreditCard,
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Store
} from 'lucide-react';

interface Settlement {
    id: string;
    ownerId: string;
    ownerType: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    method: 'CRYPTO' | 'CASH' | 'BANK';
    details?: string;
    verificationCode?: string;
    createdAt: string;
}

export default function AdminPayoutsPage() {
    const { user } = useAuth();
    const [payouts, setPayouts] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, [filter]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/payouts?status=${filter}`);
            const data = await res.json();
            setPayouts(data);
        } catch (error) {
            toast.error('Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const processPayout = async (id: string, status: 'COMPLETED' | 'FAILED', settlement: Settlement) => {
        try {
            let reference = '';
            let verificationCode = '';

            if (status === 'COMPLETED') {
                if (settlement.method === 'CASH') {
                    verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    alert(`GENERATED VERIFICATION CODE: ${verificationCode}\n\nGive this code to the recipient. They must enter it to confirm receipt.`);
                } else {
                    const ref = prompt(`Enter ${status} reference / transaction hash:`);
                    if (ref === null) return;
                    reference = ref;
                }
            }

            const res = await fetch('/api/admin/payouts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, reference, verificationCode })
            });

            if (res.ok) {
                toast.success(`Payout marked as ${status}`);
                fetchPayouts();
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            toast.error('Failed to process payout');
        }
    };

    const exportPayouts = () => {
        const headers = ['Owner ID', 'Type', 'Amount', 'Method', 'Status', 'Date'];
        const rows = payouts.map(p => [p.ownerId, p.ownerType, p.amount, p.method, p.status, p.createdAt]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_report.csv`;
        a.click();
    };

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <div className="p-20 text-center text-white font-black uppercase">Access Restricted</div>;
    }

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                            Payout <span className="text-blue-600">Queue</span>
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">Verify and settle manual withdrawal requests.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 min-w-[200px] relative">
                            <input
                                type="text"
                                placeholder="Search by ID or Owner..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>

                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
                            {['PENDING', 'COMPLETED', 'ALL'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={exportPayouts}
                            className="bg-white text-black hover:bg-blue-500 hover:text-white px-6 py-2 font-black text-[9px] uppercase italic rounded-2xl transition-all"
                        >
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500 animate-pulse font-black uppercase tracking-widest">Scanning Ledger...</div>
                    ) : payouts.length === 0 ? (
                        <GlassCard className="p-20 text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest">No pending requests in queue</p>
                        </GlassCard>
                    ) : (
                        payouts.map((p) => (
                            <GlassCard key={p.id} className="p-8 border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-500/20 transition-all">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${p.ownerType === 'DRIVER' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {p.ownerType === 'DRIVER' ? <Truck /> : <Store />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-white font-black uppercase italic tracking-tight">{p.ownerType} Withdrawal</h3>
                                            <Badge className="bg-white/5 border-white/10 text-[8px] font-black tracking-widest uppercase">
                                                ID: {p.ownerId.slice(0, 8)}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                            via {p.method} • {new Date(p.createdAt).toLocaleString()}
                                        </p>
                                        {p.details && <p className="text-gray-400 text-[11px] mt-2 italic">"{p.details}"</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 font-mono">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Settlement Amt</p>
                                        <p className="text-2xl font-black text-white">${p.amount.toLocaleString()}</p>
                                    </div>

                                    {p.status === 'PENDING' && (
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => processPayout(p.id, 'COMPLETED', p)}
                                                className="bg-green-600/10 hover:bg-green-600/20 text-green-500 border-green-500/20 px-6 py-3 font-black text-[10px] uppercase rounded-xl"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => processPayout(p.id, 'FAILED', p)}
                                                className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border-red-500/20 px-6 py-3 font-black text-[10px] uppercase rounded-xl"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    )}

                                    {p.status !== 'PENDING' && (
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={`${p.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                } px-6 py-2 font-black italic`}>
                                                {p.status}
                                            </Badge>
                                            {p.verificationCode && (
                                                <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                                                    Code: {p.verificationCode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
            );
}

'use client';

import React, { useEffect, useState } from 'react';
import { subscriptionEngine, ActivationRequest, ActivationStatus } from '@shared/services/SubscriptionEngine';
import { useRole } from '@shared/hooks/useGuard';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import {
    ShieldCheck,
    Clock,
    Mail,
    Building2,
    Key,
    CheckCircle,
    XCircle,
    Copy,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActivationsPage() {
    const { isSuperAdmin } = useRole('SUPER_ADMIN');
    const [requests, setRequests] = useState<ActivationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchRequests();
        }
    }, [isSuperAdmin]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/activations');
            const data = await response.json();

            if (data.success) {
                setRequests(data.requests.sort((a: any, b: any) => b.requestedAt - a.requestedAt));
            } else {
                throw new Error(data.error || 'Failed to fetch');
            }
        } catch (error) {
            console.error('Failed to fetch activation requests:', error);
            toast.error('Failed to load pending activations');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateKey = async (requestId: string) => {
        setProcessingId(requestId);
        try {
            const response = await fetch('/api/admin/activations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId: requestId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('License Key Generated Successfully');

                // Copy to clipboard automatically
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(data.code);
                    toast.success('Key copied to clipboard');
                }

                // Re-fetch to show the updated code
                await fetchRequests();
            } else {
                throw new Error(data.error || 'Generation failed');
            }
        } catch (error: any) {
            console.error('Generation failed:', error);
            toast.error(error.message || 'Failed to generate license key');
        } finally {
            setProcessingId(null);
        }
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleString();
    };

    if (!isSuperAdmin) {
        return (
            <div className="h-[60vh] flex items-center justify-center font-black text-red-500 uppercase italic tracking-widest">
                Access Restricted: Root Admin Only
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Activation <span className="text-blue-500">Center</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Verify node registrations and manage commercial license keys.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchRequests}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-gray-400 hover:text-white"
                        title="Sync Ledger"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Queue Priority</p>
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-4 py-1 font-black text-[9px] uppercase italic">Real-time Sync</Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 4].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <GlassCard className="p-20 text-center border-white/5">
                    <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest">All Nodes Activated</h3>
                    <p className="text-gray-500 mt-2">There are currently no pending activation requests in the protocol.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <GlassCard key={req.id} className="p-6 border-white/5 flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white truncate max-w-[150px] uppercase italic">{req.businessName}</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{req.businessType}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[8px] font-black uppercase italic">Pending</Badge>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <Mail size={14} className="text-gray-600" />
                                        <span className="truncate">{req.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <Clock size={14} className="text-gray-600" />
                                        <span>{formatTime(req.requestedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <ShieldCheck size={14} className="text-gray-600" />
                                        <span className="font-bold text-white tracking-widest uppercase">{req.planId}</span>
                                        <span className="text-[9px] text-gray-600">({req.billingCycle})</span>
                                    </div>
                                </div>

                                {req.visibleCode && (
                                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl mb-6 group-hover:bg-green-500/10 transition-all">
                                        <p className="text-[9px] font-black text-green-500/60 uppercase tracking-widest mb-1">Generated Key</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-mono font-black text-green-400 tracking-[0.2em]">{req.visibleCode}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(req.visibleCode!);
                                                    toast.success('Key copied');
                                                }}
                                                className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors text-green-500"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => handleGenerateKey(req.id)}
                                disabled={processingId === req.id || !!req.visibleCode}
                                className={`w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2
                                    ${req.visibleCode
                                        ? 'bg-green-600/10 text-green-500 border border-green-500/20 cursor-default'
                                        : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}
                            >
                                {processingId === req.id ? (
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : req.visibleCode ? (
                                    <>
                                        <CheckCircle size={14} />
                                        Key Dispatched
                                    </>
                                ) : (
                                    <>
                                        <Key size={14} />
                                        Generate License
                                    </>
                                )}
                            </Button>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}

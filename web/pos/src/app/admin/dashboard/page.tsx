'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Activity, CheckCircle, XCircle, RefreshCw, Key, Copy } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@shared/providers/AuthProvider';
import { subscriptionEngine, ActivationRequest } from '@shared/services/SubscriptionEngine';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [requests, setRequests] = useState<ActivationRequest[]>([]);
    const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({}); // Map requestId -> code
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
            return;
        }

        if (user) {
            fetchRequests();
        }
    }, [user, loading]);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const pending = await subscriptionEngine.getPendingRequests();
            setRequests(pending);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (request: ActivationRequest) => {
        try {
            // Confirm payment (Simulated manual check step)
            // In reality, Admin checks bank/wallet before clicking this.

            const code = await subscriptionEngine.generateActivationCode(request.id);
            setGeneratedCodes(prev => ({ ...prev, [request.id]: code }));

            // Refresh list to show updated state (or just remove it locally)
            // fetchRequests(); // Optional: Keep it visible to show the code
        } catch (error) {
            console.error('Approval failed', error);
            alert('Failed to generate code.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Code copied to clipboard: ' + text);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tightest italic">Admin Console</h1>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mt-2">NileLink Sovereign Control</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Active</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                        <Users className="text-zinc-500 mb-4" />
                        <h3 className="text-2xl font-black">{requests.length}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Pending Approvals</p>
                    </div>
                    {/* Placeholder Stats */}
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                        <Activity className="text-zinc-500 mb-4" />
                        <h3 className="text-2xl font-black">100%</h3>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Uptime</p>
                    </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden">
                    <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold uppercase tracking-wide">License Requests</h2>
                        <Button
                            variant="outline"
                            onClick={fetchRequests}
                            className="h-10 text-[10px] uppercase tracking-widest border-zinc-700 hover:bg-zinc-800"
                        >
                            <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                    </div>

                    {requests.length === 0 ? (
                        <div className="p-20 text-center">
                            <CheckCircle size={48} className="mx-auto text-zinc-800 mb-4" />
                            <p className="text-zinc-500 font-medium">No pending requests. All nodes operational.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                                    <tr>
                                        <th className="px-8 py-6">Business Identity</th>
                                        <th className="px-8 py-6">Plan Tier</th>
                                        <th className="px-8 py-6">Cycle</th>
                                        <th className="px-8 py-6">Trial Eligibility</th>
                                        <th className="px-8 py-6">Requested At</th>
                                        <th className="px-8 py-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-white text-sm">{req.businessName}</p>
                                                <p className="text-xs text-zinc-500 mt-1 font-mono">{req.email}</p>
                                                <span className="inline-block mt-2 px-2 py-1 bg-zinc-800 rounded text-[9px] uppercase tracking-wider text-zinc-400">
                                                    {req.businessType}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                                    <span className="font-bold text-sm uppercase">{req.planId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-block px-2 py-1 rounded text-[9px] uppercase tracking-wider font-bold ${req.billingCycle === 'yearly'
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                    }`}>
                                                    {req.billingCycle}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {/* Logic Check Visualization */}
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${req.trialDurationMonths === 3
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                                    }`}>
                                                    <span className="font-black text-xs">{req.trialDurationMonths} MO FREE</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs text-zinc-500 font-mono">
                                                    {new Date(req.requestedAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {generatedCodes[req.id] ? (
                                                    <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4">
                                                        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                                            <Key size={14} className="text-green-500" />
                                                            <span className="font-mono font-bold text-green-400 tracking-wider text-sm">
                                                                {generatedCodes[req.id]}
                                                            </span>
                                                            <button
                                                                onClick={() => copyToClipboard(generatedCodes[req.id])}
                                                                className="ml-2 hover:text-white transition-colors"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                        <p className="text-[9px] text-green-500/70 font-bold uppercase tracking-wider">Ready to Send</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-3">
                                                        <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-700 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-500 transition-all">
                                                            <XCircle size={18} />
                                                        </button>
                                                        <Button
                                                            onClick={() => handleApprove(req)}
                                                            className="h-10 bg-white text-black hover:bg-gray-200 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
                                                        >
                                                            Verify & Generate
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

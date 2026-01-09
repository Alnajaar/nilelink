"use client";

import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, CheckCircle, XCircle, Gavel } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { PageTransition } from '@/shared/components/PageTransition';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { EmptyState } from '@/shared/components/EmptyState';

interface Dispute {
    id: string;
    orderId: string;
    buyer: string;
    seller: string;
    amount: number;
    reason: string;
    status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
    createdAt: string;
    evidence: string[];
}

export default function AdminDisputePanel() {
    const [disputes, setDisputes] = useState<Dispute[]>([
        {
            id: 'DSP-8821',
            orderId: 'ORD-1022',
            buyer: 'Alice Smith',
            seller: 'TechGadgets Inc.',
            amount: 154.99,
            reason: 'Item arrived damaged and seller refused return.',
            status: 'OPEN',
            createdAt: '2025-12-28T14:30:00Z',
            evidence: ['photo_damaged_box.jpg', 'chat_log.pdf']
        },
        {
            id: 'DSP-8822',
            orderId: 'ORD-1019',
            buyer: 'Bob Jones',
            seller: 'FastFood Delivery',
            amount: 45.50,
            reason: 'Order never arrived but marked as delivered.',
            status: 'ESCALATED',
            createdAt: '2025-12-29T09:15:00Z',
            evidence: []
        }
    ]);

    const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

    const handleResolve = (disputeId: string, decision: 'REFUND_BUYER' | 'RELEASE_SELLER') => {
        // Mock API call
        console.log(`Resolving dispute ${disputeId} with ${decision}`);
        setDisputes(disputes.filter(d => d.id !== disputeId));
        setSelectedDispute(null);
    };

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border-subtle pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-text-main flex items-center gap-3">
                            <Shield className="text-primary" size={32} />
                            Dispute Resolution Center
                        </h1>
                        <p className="text-text-muted mt-2">Arbitrate conflicts and enforce marketplace trust.</p>
                    </div>
                    <Badge variant="warning" className="text-lg px-4 py-2">
                        {disputes.length} Open Cases
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Dispute List */}
                    <div className="lg:col-span-1 space-y-4">
                        {disputes.map((dispute) => (
                            <div
                                key={dispute.id}
                                onClick={() => setSelectedDispute(dispute.id)}
                                className={`cursor-pointer transition-all ${selectedDispute === dispute.id ? 'transform scale-102' : ''}`}
                            >
                                <Card
                                    padding="sm"
                                    className={`
                                        border-l-4 transition-all hover:shadow-md
                                        ${selectedDispute === dispute.id ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-transparent hover:border-l-border-subtle'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-text-muted">{dispute.id}</span>
                                        <span className="text-xs font-bold text-text-subtle">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-text-main mb-1 line-clamp-1">{dispute.reason}</h3>
                                    <div className="flex justify-between items-center mt-3">
                                        <Badge variant={dispute.status === 'ESCALATED' ? 'error' : 'warning'} size="sm">
                                            {dispute.status}
                                        </Badge>
                                        <CurrencyDisplay amount={dispute.amount} className="font-bold text-sm" />
                                    </div>
                                </Card>
                            </div>
                        ))}
                        {disputes.length === 0 && (
                            <EmptyState
                                title="No active disputes"
                                description="Good job! The marketplace is running smoothly."
                                icon={<CheckCircle size={32} />}
                            />
                        )}
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-2">
                        {selectedDispute ? (
                            <Card className="h-full border-t-4 border-t-primary animate-in fade-in slide-in-from-right-4 duration-300">
                                {(() => {
                                    const dispute = disputes.find(d => d.id === selectedDispute)!;
                                    return (
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-2xl font-black mb-2">Case {dispute.id}</h2>
                                                    <p className="text-text-muted flex items-center gap-2">
                                                        Order <span className="font-mono font-bold bg-background-subtle px-1 rounded">{dispute.orderId}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-text-muted mb-1">Disputed Amount</p>
                                                    <CurrencyDisplay amount={dispute.amount} className="text-3xl font-black text-text-main" />
                                                </div>
                                            </div>

                                            <div className="bg-background-subtle p-6 rounded-xl border border-border-subtle">
                                                <h3 className="font-bold text-sm text-text-subtle uppercase tracking-wider mb-3">Reason for Dispute</h3>
                                                <p className="text-lg leading-relaxed">{dispute.reason}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary"></div> Buyer
                                                    </h4>
                                                    <Card padding="sm" variant="flat">
                                                        <p className="font-medium">{dispute.buyer}</p>
                                                        <p className="text-xs text-text-muted mt-1">Trust Score: 98/100</p>
                                                        <p className="text-xs text-text-muted">Orders: 42</p>
                                                    </Card>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-text-subtle"></div> Seller
                                                    </h4>
                                                    <Card padding="sm" variant="flat">
                                                        <p className="font-medium">{dispute.seller}</p>
                                                        <p className="text-xs text-text-muted mt-1">Trust Score: 92/100</p>
                                                        <p className="text-xs text-text-muted">Total Sales: $14k</p>
                                                    </Card>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                                    <FileText size={18} /> Evidence Submitted
                                                </h4>
                                                <div className="flex gap-4 overflow-x-auto pb-2">
                                                    {dispute.evidence.length > 0 ? dispute.evidence.map((file, i) => (
                                                        <div key={i} className="flex-shrink-0 w-32 h-32 bg-background-subtle rounded-lg border border-border-subtle flex items-center justify-center flex-col gap-2 text-primary cursor-pointer hover:bg-surface transition-colors">
                                                            <FileText size={24} />
                                                            <span className="text-xs truncate w-full text-center px-2">{file}</span>
                                                        </div>
                                                    )) : (
                                                        <p className="text-text-muted italic text-sm">No files uploaded yet.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-border-subtle flex gap-4 justify-end">
                                                <Button size="lg" variant="outline" className="border-danger/20 text-danger hover:bg-danger/5" onClick={() => handleResolve(dispute.id, 'REFUND_BUYER')}>
                                                    <AlertTriangle size={18} className="mr-2" />
                                                    Refund Buyer
                                                </Button>
                                                <Button size="lg" className="bg-success text-white hover:bg-success/90" onClick={() => handleResolve(dispute.id, 'RELEASE_SELLER')}>
                                                    <Gavel size={18} className="mr-2" />
                                                    Release to Seller
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border-subtle rounded-2xl p-12">
                                <Shield size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a dispute to review details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

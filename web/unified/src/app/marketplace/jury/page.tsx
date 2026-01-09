
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Scale, ThumbsUp, ThumbsDown, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { PageTransition } from '@/shared/components/PageTransition';
import { EmptyState } from '@/shared/components/EmptyState';

// Mock data type
interface JuryCase {
    disputeId: string;
    evidence: { title: string; url: string; type: 'IMAGE' | 'DOCUMENT' }[];
    status: 'VOTING_OPEN' | 'RESOLVED';
    votesForBuyer: number;
    votesForSeller: number;
    deadline: string;
}

export default function JuryPage() {
    const [cases, setCases] = useState<JuryCase[]>([]);
    const [votedCases, setVotedCases] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock Fetch
        setTimeout(() => {
            setCases([
                {
                    disputeId: 'DISP-DEMO-001',
                    evidence: [
                        { title: 'Product Photo (Damaged)', url: '#', type: 'IMAGE' },
                        { title: 'Chat History', url: '#', type: 'DOCUMENT' }
                    ],
                    status: 'VOTING_OPEN',
                    votesForBuyer: 12,
                    votesForSeller: 4,
                    deadline: new Date(Date.now() + 86400000).toISOString()
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleVote = (caseId: string, vote: 'BUYER' | 'SELLER') => {
        setVotedCases([...votedCases, caseId]);
        // Animation feedback would go here
    };

    return (
        <PageTransition>
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-6 border-b border-border-subtle pb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Scale size={32} />
                    </div>
                    <div>
                        <Badge variant="warning" className="mb-2">BETA ACCESS</Badge>
                        <h1 className="text-4xl font-black text-text-main">Court on Chain</h1>
                        <p className="text-text-muted text-lg">Earn rewards by reviewing disputes and casting fair votes.</p>
                    </div>
                    <div className="ml-auto text-right hidden md:block">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">My Reputation</p>
                        <p className="text-3xl font-black text-primary">98.5 <span className="text-sm text-text-muted">/ 100</span></p>
                    </div>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-64 bg-surface rounded-3xl" />)}
                    </div>
                ) : cases.length > 0 ? (
                    <div className="grid gap-8">
                        {cases.map((c) => (
                            <motion.div
                                key={c.disputeId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className={`p-0 overflow-hidden ${votedCases.includes(c.disputeId) ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                    <div className="flex flex-col md:flex-row">
                                        {/* Evidence Panel */}
                                        <div className="md:w-2/5 bg-background-subtle p-8 border-b md:border-b-0 md:border-r border-border-subtle">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <FileText size={18} /> Evidence
                                                </h3>
                                                <Badge variant="info">2 Files</Badge>
                                            </div>
                                            <div className="space-y-3">
                                                {c.evidence.map((e, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-border-subtle flex items-center gap-4 hover:border-primary cursor-pointer transition-colors">
                                                        <div className="w-10 h-10 bg-background-subtle rounded-lg flex items-center justify-center">
                                                            {e.type === 'IMAGE' ? '🖼️' : '📄'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{e.title}</p>
                                                            <p className="text-xs text-text-muted">Click to view</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-border-custom">
                                                <p className="text-xs font-bold text-text-muted uppercase mb-2">Claim Details</p>
                                                <p className="text-sm italic">"I ordered a ceramic vase and it arrived shattered. The box was clearly crushed. I want a full refund."</p>
                                            </div>
                                        </div>

                                        {/* Voting Panel */}
                                        <div className="md:w-3/5 p-8 flex flex-col justify-center relative">
                                            {votedCases.includes(c.disputeId) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background-card/80 backdrop-blur-sm z-10">
                                                    <div className="bg-secondary text-background px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl animate-bounce">
                                                        <CheckCircle /> Vote Recorded
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-8 text-center">
                                                <h3 className="text-2xl font-black mb-2 text-text-main">Cast Your Verdict</h3>
                                                <p className="text-text-muted">Review the evidence carefully. Malicious voting will result in reputation loss.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <button
                                                    onClick={() => handleVote(c.disputeId, 'BUYER')}
                                                    className="group relative h-40 rounded-2xl bg-secondary/10 hover:bg-secondary/20 border-2 border-secondary/30 hover:border-secondary transition-all overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary transition-colors">
                                                        <ThumbsUp size={40} className="mb-3" />
                                                        <span className="font-black text-lg">Refund Buyer</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => handleVote(c.disputeId, 'SELLER')}
                                                    className="group relative h-40 rounded-2xl bg-error/10 hover:bg-error/20 border-2 border-error/30 hover:border-error transition-all overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-error transition-colors">
                                                        <ThumbsDown size={40} className="mb-3" />
                                                        <span className="font-black text-lg">Release to Seller</span>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="mt-8 flex justify-center gap-8 text-sm font-bold text-text-muted opacity-80">
                                                <span>Current Votes:</span>
                                                <span className="text-secondary">{c.votesForBuyer} for Refund</span>
                                                <span>vs</span>
                                                <span className="text-error">{c.votesForSeller} for Release</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Active Cases"
                        description="You fulfill your civic duty! Provide you with more cases soon."
                        icon={<Gavel size={48} />}
                    />
                )}
            </div>
        </PageTransition>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Vote,
    TrendingUp,
    Users,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronRight,
    Database,
    BarChart3
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';

interface Proposal {
    id: string;
    title: string;
    description: string;
    status: 'ACTIVE' | 'SUCCEEDED' | 'DEFEATED' | 'EXECUTED';
    type: string;
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
    createdAt: string;
}

export default function GovernanceRoom() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/investors/governance/proposals', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const json = await res.json();
            if (json.success) setProposals(json.data);
        } catch (err) {
            console.error('Failed to fetch proposals', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (proposalId: string, support: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
        try {
            const res = await fetch('http://localhost:3001/api/investors/governance/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ proposalId, support })
            });
            if (res.ok) fetchProposals();
        } catch (err) {
            console.error('Voting failed', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-blue-500/10 border-blue-500/20 glass-v2">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wider">Active Voters</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">1,248 <span className="text-xs text-blue-400/60 font-normal">nodes</span></p>
                </Card>

                <Card className="p-6 bg-purple-500/10 border-purple-500/20 glass-v2">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-medium text-purple-200 uppercase tracking-wider">Governance Hash</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">0x88...f2a1</p>
                </Card>

                <Card className="p-6 bg-emerald-500/10 border-emerald-500/20 glass-v2">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Database className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-medium text-emerald-200 uppercase tracking-wider">Treasury Balance</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">$4.2M <span className="text-xs text-emerald-400/60 font-normal">NLINK</span></p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Vote className="w-5 h-5 text-blue-400" />
                            Active Proposals
                        </h2>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/20">
                            {proposals.length} Proposals
                        </Badge>
                    </div>

                    {proposals.map((proposal) => (
                        <motion.div
                            layout
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedProposal(proposal)}
                            className={`cursor-pointer group relative overflow-hidden rounded-xl border p-5 transition-all
                ${selectedProposal?.id === proposal.id
                                    ? 'bg-white/5 border-blue-500/50 ring-1 ring-blue-500/30'
                                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-white/5 text-gray-400 text-[10px]">
                                            {proposal.type}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                        {proposal.title}
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-black/50" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 underline underline-offset-4 decoration-blue-500/30">
                                        Verify Consensus
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 h-1.5 rounded-full overflow-hidden bg-white/5">
                                <div className="bg-emerald-500" style={{ width: `${(Number(proposal.forVotes) / 3000) * 100}%` }} />
                                <div className="bg-rose-500" style={{ width: `${(Number(proposal.againstVotes) / 3000) * 100}%` }} />
                                <div className="bg-white/10" style={{ width: `${(Number(proposal.abstainVotes) / 3000) * 100}%` }} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedProposal ? (
                            <motion.div
                                key={selectedProposal.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 glass-v2 sticky top-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">{selectedProposal.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                    {selectedProposal.description}
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-emerald-400">For</span>
                                        <span className="text-white font-medium">{selectedProposal.forVotes} votes</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                                    </div>

                                    <div className="flex justify-between text-xs">
                                        <span className="text-rose-400">Against</span>
                                        <span className="text-white font-medium">{selectedProposal.againstVotes} votes</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: '15%' }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/30"
                                        onClick={() => handleVote(selectedProposal.id, 'FOR')}
                                    >
                                        VOTE FOR
                                    </Button>
                                    <Button
                                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border-rose-500/30"
                                        onClick={() => handleVote(selectedProposal.id, 'AGAINST')}
                                    >
                                        VOTE AGAINST
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-gray-500 text-sm text-center px-8">
                                <BarChart3 className="w-8 h-8 mb-4 opacity-20" />
                                Select a proposal to view tactical breakdown and participate in governance.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Vote, CheckCircle2, XCircle, Clock, Users,
    ChevronRight, Info, Filter, Plus, PieChart
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ReputationScorecard } from '@/shared/components/ReputationScorecard';

interface Proposal {
    id: string;
    restaurantName: string;
    title: string;
    description: string;
    category: 'Expansion' | 'Menu' | 'Operational' | 'Strategic';
    status: 'Active' | 'Passed' | 'Rejected' | 'Expired';
    votesFor: number;
    votesAgainst: number;
    totalSharesVoted: number;
    quorum: number;
    expiryDate: string;
    myVote?: 'for' | 'against';
    restaurantId: string;
}

export default function GovernancePage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('active');

    const [proposals] = useState<Proposal[]>([
        {
            id: 'prop-001',
            restaurantName: 'Cairo Grill Prime',
            restaurantId: 'rest-001',
            title: 'New Location: North Coast Extension',
            description: 'Proposal to use 40% of Q4 profits to lease a seasonal beachfront location in Marassi. Expected ROI: 22% in first season.',
            category: 'Expansion',
            status: 'Active',
            votesFor: 1250000,
            votesAgainst: 450000,
            totalSharesVoted: 1700000,
            quorum: 2000000,
            expiryDate: '2025-01-20',
            myVote: 'for'
        },
        {
            id: 'prop-002',
            restaurantName: 'Delta Kitchen',
            restaurantId: 'rest-003',
            title: 'Transition to Sustainable Delivery Packaging',
            description: 'Switch all delivery containers to 100% biodegradable material. Initial cost increase of 3.5%, balanced by marketing advantage.',
            category: 'Operational',
            status: 'Active',
            votesFor: 850000,
            votesAgainst: 120000,
            totalSharesVoted: 970000,
            quorum: 1500000,
            expiryDate: '2025-01-15'
        },
        {
            id: 'prop-003',
            restaurantName: 'Nile Bistro',
            restaurantId: 'rest-002',
            title: 'Adopt NileLink Supply Hub Exclusively',
            description: 'Source all raw ingredients through the NileLink Supplier ecosystem to optimize logistics costs and ensure food safety tracking.',
            category: 'Strategic',
            status: 'Passed',
            votesFor: 2100000,
            votesAgainst: 300000,
            totalSharesVoted: 2400000,
            quorum: 2000000,
            expiryDate: '2025-01-05'
        }
    ]);

    const filteredProposals = proposals.filter(p => {
        if (filter === 'all') return true;
        return p.status.toLowerCase() === filter;
    });

    const getProgress = (p: Proposal) => (p.votesFor / (p.votesFor + p.votesAgainst)) * 100;
    const getQuorumProgress = (p: Proposal) => (p.totalSharesVoted / p.quorum) * 100;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">Shareholder Governance</h1>
                            <p className="text-text opacity-70">Shape the future of the restaurants you own</p>
                        </div>
                        <Button
                            className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black uppercase tracking-widest"
                        >
                            <Plus size={18} className="mr-2" />
                            Submit Proposal
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 bg-white border border-surface">
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">Active Proposals</p>
                        <p className="text-3xl font-black font-mono text-text">
                            {proposals.filter(p => p.status === 'Active').length}
                        </p>
                    </Card>
                    <Card className="p-6 bg-white border border-surface">
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">Total Participation</p>
                        <p className="text-3xl font-black font-mono text-text">84.2%</p>
                    </Card>
                    <Card className="p-6 bg-white border border-surface">
                        <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold mb-1">My Eligibility</p>
                        <p className="text-3xl font-black font-mono text-primary">12,500</p>
                        <p className="text-[10px] text-text opacity-50 mt-1 uppercase">Voting Power (Shares)</p>
                    </Card>
                    <Card className="p-6 bg-primary text-background">
                        <p className="text-xs opacity-70 uppercase tracking-widest font-bold mb-1">Decentralized Power</p>
                        <p className="text-3xl font-black font-mono">100%</p>
                    </Card>
                </div>

                {/* Mastery & Reputation HUD */}
                <div className="mb-8">
                    <ReputationScorecard />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['active', 'passed', 'rejected', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-background shadow-lg shadow-primary/20'
                                : 'bg-surface text-text hover:bg-surface/70'
                                }`}
                        >
                            {f === 'active' && <Clock size={12} className="inline mr-2" />}
                            {f === 'passed' && <CheckCircle2 size={12} className="inline mr-2" />}
                            {f === 'rejected' && <XCircle size={12} className="inline mr-2" />}
                            {f}
                        </button>
                    ))}
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    {filteredProposals.map((proposal, idx) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-0 overflow-hidden bg-white border border-surface hover:shadow-xl transition-all">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => router.push(`/restaurant/${proposal.restaurantId}`)}
                                                    className="text-xs font-black text-primary uppercase tracking-tighter hover:underline"
                                                >
                                                    {proposal.restaurantName}
                                                </button>
                                                <span className="text-xs text-text opacity-30">•</span>
                                                <Badge className="bg-surface text-text/70 px-2 py-0.5 text-[10px] font-black uppercase">
                                                    {proposal.category}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-black text-text mb-2">{proposal.title}</h3>
                                            <p className="text-text/70 text-sm max-w-3xl leading-relaxed">
                                                {proposal.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-black uppercase tracking-widest mb-1 ${proposal.status === 'Active' ? 'text-primary' :
                                                proposal.status === 'Passed' ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                {proposal.status}
                                            </div>
                                            <p className="text-[10px] text-text opacity-50 font-bold">
                                                {proposal.status === 'Active' ? `Expires ${proposal.expiryDate}` : `Closed ${proposal.expiryDate}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                        {/* Voting Results */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs font-black uppercase">
                                                <span className="text-emerald-500">For</span>
                                                <span className="text-rose-500">Against</span>
                                            </div>
                                            <div className="h-4 bg-rose-500/10 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                                    style={{ width: `${getProgress(proposal)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-text opacity-70">
                                                <span>{proposal.votesFor.toLocaleString()} Shares ({getProgress(proposal).toFixed(1)}%)</span>
                                                <span>{proposal.votesAgainst.toLocaleString()} Shares ({(100 - getProgress(proposal)).toFixed(1)}%)</span>
                                            </div>
                                        </div>

                                        {/* Quorum and Participation */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs font-black uppercase">
                                                <span className="text-text opacity-50">Participation</span>
                                                <span className="text-text opacity-50">Quorum: {proposal.quorum.toLocaleString()}</span>
                                            </div>
                                            <div className="h-4 bg-surface rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${getQuorumProgress(proposal) >= 100 ? 'bg-primary' : 'bg-text opacity-20'}`}
                                                    style={{ width: `${Math.min(getQuorumProgress(proposal), 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-text opacity-70">
                                                <span>{proposal.totalSharesVoted.toLocaleString()} Voted</span>
                                                <span>{getQuorumProgress(proposal).toFixed(1)}% of Quorum</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="bg-surface/30 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {proposal.status === 'Active' ? (
                                            <>
                                                <Button
                                                    disabled={!!proposal.myVote}
                                                    className={`h-10 px-6 rounded-lg font-black uppercase text-xs transition-all ${proposal.myVote === 'for' ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        }`}
                                                >
                                                    {proposal.myVote === 'for' ? 'You Voted For' : 'Vote For'}
                                                </Button>
                                                <Button
                                                    disabled={!!proposal.myVote}
                                                    variant="outline"
                                                    className={`h-10 px-6 rounded-lg font-black uppercase text-xs transition-all ${proposal.myVote === 'against' ? 'bg-rose-500 text-white border-rose-500' : 'hover:bg-rose-500 hover:text-white hover:border-rose-500'
                                                        }`}
                                                >
                                                    {proposal.myVote === 'against' ? 'You Voted Against' : 'Vote Against'}
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 text-text opacity-50 font-black uppercase text-xs">
                                                <Info size={14} />
                                                Voting Closed
                                            </div>
                                        )}
                                    </div>
                                    <button className="text-text/50 hover:text-primary transition-colors flex items-center gap-1 font-black uppercase text-[10px] tracking-widest">
                                        View Discussion
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredProposals.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                        <Vote size={48} className="mb-4" />
                        <h3 className="text-xl font-black">No Proposals Found</h3>
                        <p className="text-sm font-bold">Try changing your filter settings</p>
                    </div>
                )}
            </div>
        </div>
    );
}

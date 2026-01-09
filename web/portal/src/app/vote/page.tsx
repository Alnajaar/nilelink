"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Vote, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@shared/components/Button';

export default function VotePage() {
    const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

    const proposals = [
        {
            id: 'prop-1',
            title: 'Increase Delivery Fee Subsidy',
            description: 'Proposal to increase driver subsidies by 15% to improve service quality',
            status: 'active',
            votes: { yes: 1247, no: 89 },
            endTime: '2025-01-15T12:00:00Z'
        },
        {
            id: 'prop-2',
            title: 'Add New Restaurant Categories',
            description: 'Expand marketplace to include grocery and pharmacy delivery',
            status: 'active',
            votes: { yes: 892, no: 234 },
            endTime: '2025-01-20T12:00:00Z'
        },
        {
            id: 'prop-3',
            title: 'Protocol Fee Adjustment',
            description: 'Reduce platform fees by 2% to increase merchant participation',
            status: 'passed',
            votes: { yes: 1456, no: 123 },
            endTime: '2024-12-30T12:00:00Z'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary border-b border-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" size="sm" className="border-surface text-nav-text hover:bg-surface">
                                <ArrowLeft className="mr-2" size={16} />
                                Back to Home
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Vote className="text-primary" size={24} />
                            <div>
                                <h1 className="text-2xl font-bold text-nav-text">Governance Voting</h1>
                                <p className="text-nav-text/80 text-sm">Participate in NileLink protocol decisions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="text-primary" size={24} />
                            <div>
                                <div className="text-2xl font-bold text-text">1,247</div>
                                <div className="text-text/70 text-sm">Total Voters</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Vote className="text-primary" size={24} />
                            <div>
                                <div className="text-2xl font-bold text-text">3</div>
                                <div className="text-text/70 text-sm">Active Proposals</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="text-primary" size={24} />
                            <div>
                                <div className="text-2xl font-bold text-text">89%</div>
                                <div className="text-text/70 text-sm">Participation Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposals */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-text mb-6">Active Proposals</h2>

                    {proposals.map((proposal) => (
                        <div key={proposal.id} className="bg-surface border border-primary rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-text">{proposal.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            proposal.status === 'active'
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-surface text-text'
                                        }`}>
                                            {proposal.status === 'active' ? 'Active' : 'Passed'}
                                        </span>
                                    </div>
                                    <p className="text-text/80 mb-4">{proposal.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-text/70 text-sm mb-2">
                                        <Clock size={16} />
                                        Ends {new Date(proposal.endTime).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Vote Counts */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-background rounded-lg p-4 border border-primary">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-text font-medium">Yes</span>
                                        <span className="text-primary font-bold">{proposal.votes.yes}</span>
                                    </div>
                                    <div className="w-full bg-surface rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${(proposal.votes.yes / (proposal.votes.yes + proposal.votes.no)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-background rounded-lg p-4 border border-primary">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-text font-medium">No</span>
                                        <span className="text-primary font-bold">{proposal.votes.no}</span>
                                    </div>
                                    <div className="w-full bg-surface rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${(proposal.votes.no / (proposal.votes.yes + proposal.votes.no)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Vote Actions */}
                            {proposal.status === 'active' && (
                                <div className="flex gap-4">
                                    <Button
                                        className="bg-primary text-background hover:bg-primary/90 flex-1"
                                        onClick={() => setSelectedProposal(proposal.id)}
                                    >
                                        <Vote className="mr-2" size={20} />
                                        Vote Yes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-primary text-primary hover:bg-surface flex-1"
                                        onClick={() => setSelectedProposal(proposal.id)}
                                    >
                                        <AlertTriangle className="mr-2" size={20} />
                                        Vote No
                                    </Button>
                                </div>
                            )}

                            {proposal.status === 'passed' && (
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle size={20} />
                                    <span className="font-medium">Proposal Passed</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-12 text-center">
                    <div className="bg-primary rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-nav-text mb-4">
                            Your Voice Matters
                        </h3>
                        <p className="text-nav-text/90 mb-6 max-w-2xl mx-auto">
                            Every stakeholder in the NileLink ecosystem has voting rights. Participate in shaping the future of decentralized commerce.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/login">
                                <Button className="bg-surface text-text hover:bg-background">
                                    <Vote className="mr-2" size={20} />
                                    Start Voting
                                </Button>
                            </Link>
                            <Link href="/transparency">
                                <Button variant="outline" className="border-surface text-nav-text hover:bg-surface">
                                    <Users className="mr-2" size={20} />
                                    View Governance
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

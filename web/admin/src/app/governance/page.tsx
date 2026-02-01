/**
 * NileLink Governance - Proposal Dashboard
 * Decentralized protocol management and voting
 * 
 * FEATURES:
 * - Active & Past Proposals (PIP - Protocol Improvement Proposals)
 * - Real-time Voting Progress (On-chain weights)
 * - Proposal Lifecycle Management (Draft -> Active -> Queued -> Executed)
 * - Voting Power (Based on Staked $NILE)
 * - Discussion links (Snapshot/Discourse integration)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';

// ============================================
// TYPES
// ============================================

interface Proposal {
    id: string;
    pip: number;
    title: string;
    proposer: string;
    description: string;
    status: 'ACTIVE' | 'PENDING' | 'EXECUTED' | 'CANCELLED';
    votesFor: number;
    votesAgainst: number;
    quorum: number;
    endTime: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GovernanceDashboard() {
    const { user } = useAuth();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [votingPower, setVotingPower] = useState(15200); // $NILE tokens

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            setLoading(true);
            // TODO: Fetch from Tally, Snapshot, or Custom Governor Contract
            // Mocking live proposals
            setTimeout(() => {
                setProposals([
                    {
                        id: '1',
                        pip: 42,
                        title: 'Reduce Driver Commission for Early Believers',
                        proposer: '0x71...CBB4',
                        description: 'Proposed reduction of protocol fee from 5% to 3.5% for drivers with 1000+ career deliveries to incentivize quality.',
                        status: 'ACTIVE',
                        votesFor: 1250000,
                        votesAgainst: 450000,
                        quorum: 2000000,
                        endTime: Date.now() + 172800000
                    },
                    {
                        id: '2',
                        pip: 43,
                        title: 'Expansion into Jordan Region',
                        proposer: 'NileLink Core',
                        description: 'Allocation of 100,000 $NILE from treasury to fund infrastructure and compliance engine for Jordan (JO) region.',
                        status: 'ACTIVE',
                        votesFor: 1850000,
                        votesAgainst: 50000,
                        quorum: 2000000,
                        endTime: Date.now() + 432000000
                    },
                    {
                        id: '3',
                        pip: 41,
                        title: 'IPFS Storage Node Incentive Program',
                        proposer: '0x88...6521',
                        description: 'Rewards for businesses running their own IPFS pins for decentralized data availability.',
                        status: 'EXECUTED',
                        votesFor: 2100000,
                        votesAgainst: 120000,
                        quorum: 2000000,
                        endTime: Date.now() - 86400000
                    },
                ]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-white italic tracking-tighter">Governance</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-[0.4em] mt-2">Protocol Ownership Portal</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex items-center gap-12 backdrop-blur-xl">
                        <div>
                            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">My Voting Power</div>
                            <div className="text-3xl font-black text-white">{votingPower.toLocaleString()} <span className="text-xs text-blue-400">$NILE</span></div>
                        </div>
                        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-black text-xs uppercase transition-all shadow-lg shadow-blue-900/20">
                            Stake for More
                        </button>
                    </div>
                </div>

                {/* Proposals Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Active Proposals
                        </h2>

                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>)
                        ) : (
                            <div className="space-y-6">
                                {proposals.map(prop => (
                                    <div key={prop.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-all group overflow-hidden relative">
                                        {prop.status === 'EXECUTED' && (
                                            <div className="absolute top-0 right-0 px-6 py-2 bg-green-600/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                                                Executed
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-blue-400 font-black text-xs">PIP-{prop.pip}</span>
                                            <span className="text-gray-600 text-xs font-bold">by {prop.proposer}</span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-4">{prop.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2">{prop.description}</p>

                                        <div className="space-y-2 mb-8">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-green-400">For: {(prop.votesFor / 1000000).toFixed(1)}M</span>
                                                <span className="text-red-400">Against: {(prop.votesAgainst / 1000000).toFixed(1)}M</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                                                    style={{ width: `${(prop.votesFor / (prop.votesFor + prop.votesAgainst)) * 100}%` }}
                                                ></div>
                                                <div
                                                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                                    style={{ width: `${(prop.votesAgainst / (prop.votesFor + prop.votesAgainst)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-gray-600 text-[10px] uppercase font-bold">Quorum: {((prop.votesFor + prop.votesAgainst) / prop.quorum * 100).toFixed(0)}% reached</span>
                                                <span className="text-gray-400 text-xs italic">Ends {new Date(prop.endTime).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button className="flex-1 py-4 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                                                View Details
                                            </button>
                                            {prop.status === 'ACTIVE' && (
                                                <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-black uppercase text-xs transition-all shadow-xl shadow-blue-900/10">
                                                    Vote Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: DAO Stats & Treasury */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">DAO Statistics</h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-12">

                            <div>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Ecosystem Treasury</div>
                                <div className="text-3xl font-black text-white">$42,500,000</div>
                                <div className="text-blue-400 text-xs mt-1">Managed by Smart Contract</div>
                            </div>

                            <div>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total $NILE Staked</div>
                                <div className="text-3xl font-black text-white">125.4M</div>
                                <div className="text-green-400 text-xs mt-1">45% of Circulating Supply</div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-white font-bold mb-4">Governance Tips</h3>
                                <ul className="space-y-4 text-xs text-gray-400 leading-relaxed">
                                    <li className="flex gap-3"><span>🔹</span> You can delegate your voting power to entities you trust.</li>
                                    <li className="flex gap-3"><span>🔹</span> Creating a proposal requires a minimum stake of 100,000 $NILE.</li>
                                    <li className="flex gap-3"><span>🔹</span> Quorum is required for any PIP to be automatically executed on-chain.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-white font-bold mb-2">Build a Proposal</h3>
                            <p className="text-gray-500 text-xs mb-6">Have an idea to improve the NileLink protocol? Submit your proposal to the community.</p>
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black uppercase text-[10px] tracking-widest transition-all">
                                Create New PIP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

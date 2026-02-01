/**
 * NileLink Staking & Rewards Portal
 * Economic participation layer for the protocol
 * 
 * FEATURES:
 * - Liquid Staking interface ($NILE -> stNILE)
 * - Real-time APY (Annual Percentage Yield) Tracking
 * - Reward Accrual visualization
 * - Multi-tier Staking Rewards (Bronze to Platinum)
 * - Validator Delegation interface
 * - Unbonding period management
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';

// ============================================
// TYPES
// ============================================

interface StakingPool {
    id: string;
    name: string;
    apy: number;
    totalStaked: number;
    myStake: number;
    lockPeriod: number; // days
    status: 'OPEN' | 'DEPRECATED';
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function StakingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(25000); // Available $NILE
    const [stakedAmount, setStakedAmount] = useState(75000); // Total Staked
    const [rewards, setRewards] = useState(125.42); // Unclaimed rewards
    const [stakeInput, setStakeInput] = useState('');

    const pools: StakingPool[] = [
        { id: 'P1', name: 'Flexible Savings', apy: 4.5, totalStaked: 12500000, myStake: 50000, lockPeriod: 0, status: 'OPEN' },
        { id: 'P2', name: '30-Day Lock', apy: 9.2, totalStaked: 45000000, myStake: 25000, lockPeriod: 30, status: 'OPEN' },
        { id: 'P3', name: '90-Day VIP Staking', apy: 18.5, totalStaked: 68000000, myStake: 0, lockPeriod: 90, status: 'OPEN' },
    ];

    useEffect(() => {
        // Simulate data fetch
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const handleStake = (poolId: string) => {
        const amount = parseFloat(stakeInput);
        if (isNaN(amount) || amount <= 0 || amount > balance) {
            alert('Invalid amount');
            return;
        }
        alert(`Staked ${amount} $NILE into pool ${poolId}. Governance power updated.`);
        setBalance(prev => prev - amount);
        setStakedAmount(prev => prev + amount);
        setStakeInput('');
    };

    const handleClaim = () => {
        alert(`Claimed ${rewards} $NILE rewards to your wallet.`);
        setBalance(prev => prev + rewards);
        setRewards(0);
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">Protocol Staking</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-1">Stake $NILE • Secure the POS ecosystem • Earn Rewards</p>
                    </div>
                    <button onClick={() => history.back()} className="text-gray-600 hover:text-white transition-all text-sm font-bold">← Back to Governance</button>
                </div>

                {/* Global Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">My Total Staked</div>
                            <div className="text-4xl font-black text-white">{stakedAmount.toLocaleString()} <span className="text-sm opacity-50">$NILE</span></div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-all">🔒</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group overflow-hidden">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Unclaimed Rewards</div>
                        <div className="text-4xl font-black text-green-400">{rewards.toFixed(2)} <span className="text-sm opacity-50">$NILE</span></div>
                        <button
                            onClick={handleClaim}
                            disabled={rewards <= 0}
                            className="mt-4 text-green-500 text-xs font-black uppercase tracking-widest hover:underline disabled:opacity-30"
                        >
                            Claim Rewards Now →
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Ecosystem APY</div>
                        <div className="text-4xl font-black text-white">12.4%</div>
                        <div className="text-blue-400 text-xs mt-1">Real-time dynamic yield</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Pool List */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic">Active Staking Pools</h2>

                        <div className="space-y-6">
                            {pools.map(pool => (
                                <div key={pool.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{pool.name}</h3>
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">APY</div>
                                                <div className="text-green-400 font-black text-xl">{pool.apy}%</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Lock Period</div>
                                                <div className="text-white font-black text-xl">{pool.lockPeriod === 0 ? 'Flexible' : `${pool.lockPeriod} Days`}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">My Stake</div>
                                                <div className="text-blue-400 font-black text-xl">{pool.myStake.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 min-w-[200px]">
                                        <input
                                            type="number"
                                            placeholder="Amount $NILE"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 transition-all"
                                            onChange={(e) => setStakeInput(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleStake(pool.id)}
                                            className="w-full py-3 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Stake $NILE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Wallet Info */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">My Portfolio</h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-10">

                            <div>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Available in Wallet</div>
                                <div className="text-3xl font-black text-white">{balance.toLocaleString()}</div>
                                <div className="text-blue-400 text-xs mt-1">$NILE (Liquid)</div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-white font-bold text-sm">Upcoming Unlocks</h4>
                                <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                                    <div className="text-xs text-gray-400">12,500 $NILE (30-Day Pool)</div>
                                    <div className="text-xs text-blue-400 font-black">In 12 Days</div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-white font-bold mb-4">Why Stake?</h3>
                                <ul className="space-y-4 text-xs text-gray-400 leading-relaxed">
                                    <li className="flex gap-3"><span>🚀</span> <b>Voting Power:</b> 1 $NILE = 1 Vote in the Governance DAO.</li>
                                    <li className="flex gap-3"><span>💰</span> <b>Fee Sharing:</b> Stakers earn a 0.5% share of all protocol transaction fees.</li>
                                    <li className="flex gap-3"><span>🛡️</span> <b>Security:</b> Distributed staking secures the decentralized data layer.</li>
                                </ul>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-black uppercase text-xs shadow-xl shadow-blue-900/20">
                                Auto-Compound Rewards
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

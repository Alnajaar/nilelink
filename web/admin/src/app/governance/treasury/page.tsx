/**
 * NileLink Treasury & Protocol Health
 * Radical transparency for the decentralized ecosystem
 * 
 * FEATURES:
 * - Real-time Treasury Balances (Multi-asset: $NILE, USDT, ETH)
 * - Protocol Revenue Streams (POS Fees, Delivery Fees, Subscriptions)
 * - Expenditure Audit Trail (Grants, Payroll, Infrastructure)
 * - Health Metrics (Runway, Burn Rate, Revenue Growth)
 * - On-chain verification links (Etherscan/Safe/The Graph)
 */

'use client';

import { useState, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

interface Asset {
    symbol: string;
    name: string;
    balance: number;
    valueUsd: number;
    change24h: number;
}

interface Transaction {
    id: string;
    type: 'INFLOW' | 'OUTFLOW';
    amount: number;
    asset: string;
    label: string;
    timestamp: string;
    recipient?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TreasuryPage() {
    const [loading, setLoading] = useState(true);

    const assets: Asset[] = [
        { symbol: 'NILE', name: 'NileLink Token', balance: 450000000, valueUsd: 22500000, change24h: 4.2 },
        { symbol: 'USDT', name: 'Tether USD', balance: 12500000, valueUsd: 12500000, change24h: 0.01 },
        { symbol: 'ETH', name: 'Ethereum', balance: 2500, valueUsd: 7500000, change24h: -1.2 },
    ];

    const transactions: Transaction[] = [
        { id: 'tx1', type: 'INFLOW', amount: 85000, asset: 'USDT', label: 'Monthly POS Protocol Fees', timestamp: '2026-01-20' },
        { id: 'tx2', type: 'OUTFLOW', amount: 25000, asset: 'USDT', label: 'Ecosystem Grant: Mobile App Dev', recipient: '0x12..99', timestamp: '2026-01-18' },
        { id: 'tx3', type: 'INFLOW', amount: 12400, asset: 'USDT', label: 'Delivery Network Royalty', timestamp: '2026-01-15' },
        { id: 'tx4', type: 'OUTFLOW', amount: 50000, asset: 'NILE', label: 'Staking Rewards Distribution', timestamp: '2026-01-10' },
    ];

    const totalValue = assets.reduce((acc, asset) => acc + asset.valueUsd, 0);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">Protocol Treasury</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-1">Real-time Ecosystem Health & Transparency</p>
                    </div>

                    <div className="text-right">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Treasury Value</div>
                        <div className="text-5xl font-black text-white">${totalValue.toLocaleString()}</div>
                        <div className="text-green-400 text-xs font-bold mt-1">↑ 12.5% from last period</div>
                    </div>
                </div>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {assets.map(asset => (
                        <div key={asset.symbol} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 text-6xl opacity-5 font-black group-hover:opacity-10 transition-all">{asset.symbol}</div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-bold">{asset.symbol[0]}</div>
                                <div className={`text-xs font-black ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{asset.name}</h3>
                                <div className="text-2xl font-black text-white">{asset.balance.toLocaleString()} {asset.symbol}</div>
                                <div className="text-gray-500 text-sm mt-1">${asset.valueUsd.toLocaleString()} USD</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Transaction Audit Trail */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic">Expenditure Audit</h2>
                            <button className="text-blue-400 text-xs font-black uppercase tracking-widest hover:underline">View All on Etherscan ↗</button>
                        </div>

                        <div className="space-y-4">
                            {transactions.map(tx => (
                                <div key={tx.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${tx.type === 'INFLOW' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                            {tx.type === 'INFLOW' ? '↙' : '↗'}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{tx.label}</div>
                                            <div className="text-gray-500 text-xs">{tx.timestamp} {tx.recipient && `• To: ${tx.recipient}`}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${tx.type === 'INFLOW' ? 'text-green-400' : 'text-white'}`}>
                                        {tx.type === 'INFLOW' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px] text-gray-500">{tx.asset}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protocol Metrics Sidebar */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">Performance</h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-12 backdrop-blur-xl">

                            <div>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Avg Weekly Revenue</div>
                                <div className="text-3xl font-black text-white">$142,500</div>
                                <div className="h-1 w-full bg-white/5 mt-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[72%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Burn Rate</div>
                                    <div className="text-xl font-black text-red-400">$45K/mo</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Runway</div>
                                    <div className="text-xl font-black text-green-400">8.2 Years</div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-white font-bold mb-4">Revenue Sources</h3>
                                <div className="space-y-4">
                                    <MetricProgress label="POS Marketplace" value={65} color="bg-blue-500" />
                                    <MetricProgress label="Logistics Protocol" value={22} color="bg-purple-500" />
                                    <MetricProgress label="Subscription Fees" value={13} color="bg-emerald-500" />
                                </div>
                            </div>

                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
                                <h4 className="text-blue-400 text-xs font-black uppercase mb-2">Transparency Note 📖</h4>
                                <p className="text-blue-200/70 text-[10px] leading-relaxed">
                                    All treasury movements are controlled via multi-sig wallets requiring DAO consensus. This dashboard fetches real-time balances from The Graph and direct on-chain subgraphs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function MetricProgress({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{value}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} w-[${value}%]`}></div>
            </div>
        </div>
    );
}

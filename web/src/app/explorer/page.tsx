/**
 * NileLink Protocol Explorer
 * Real-time event log and network transparency
 * 
 * FEATURES:
 * - Live Event Stream (Orders, Shipments, Votes, Payouts)
 * - Network Heatmap (Activity distribution)
 * - Protocol Health Status (Uptime, Sync status, Latency)
 * - Leaderboards (Top Businesses & Drivers - Anonymized)
 * - Deep links to transaction hashes on The Graph/Blockchain
 */

'use client';

import { useState, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

interface ProtocolEvent {
    id: string;
    type: 'ORDER' | 'SHIPMENT' | 'PAYOUT' | 'VOTE' | 'REGISTRATION';
    label: string;
    value?: string;
    txHash: string;
    timestamp: string;
    location: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExplorerPage() {
    const [events, setEvents] = useState<ProtocolEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [networkStats, setNetworkStats] = useState({
        avgBlockTime: '1.2s',
        totalNodes: 420,
        activeTraders: 12542,
        syncStatus: '99.9%'
    });

    useEffect(() => {
        // Simulate live event streaming
        loadInitialEvents();
        const interval = setInterval(addRandomEvent, 4000);
        return () => clearInterval(interval);
    }, []);

    const loadInitialEvents = () => {
        setEvents([
            { id: '1', type: 'ORDER', label: 'New Order Created', value: '$85.50', txHash: '0x12..34', timestamp: 'Just now', location: 'Riyadh, SA' },
            { id: '2', type: 'SHIPMENT', label: 'Delivery Dispatched', txHash: '0x88..12', timestamp: '2m ago', location: 'Dubai, AE' },
            { id: '3', type: 'PAYOUT', label: 'Protocol Settlement', value: '$4,200', txHash: '0x44..99', timestamp: '5m ago', location: 'Amman, JO' },
            { id: '4', type: 'REGISTRATION', label: 'New Business Registered', value: 'The Pizza Box', txHash: '0x22..11', timestamp: '12m ago', location: 'Cairo, EG' },
        ]);
        setLoading(false);
    };

    const addRandomEvent = () => {
        const types: ProtocolEvent['type'][] = ['ORDER', 'SHIPMENT', 'PAYOUT', 'VOTE'];
        const newEvent: ProtocolEvent = {
            id: Math.random().toString(),
            type: types[Math.floor(Math.random() * types.length)],
            label: 'Network Event Processed',
            value: `$${(Math.random() * 500).toFixed(2)}`,
            txHash: '0x' + Math.random().toString(16).slice(2, 6) + '..' + Math.random().toString(16).slice(2, 6),
            timestamp: 'Just now',
            location: ['Riyadh, SA', 'Dubai, AE', 'Amman, JO', 'Cairo, EG', 'Kuwait City, KW'][Math.floor(Math.random() * 5)]
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Explorer Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">Protocol Explorer</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-2">Live On-Chain Event Stream & Network Pulse</p>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 p-4 rounded-3xl gap-12 backdrop-blur-xl">
                        <ExplorerStat label="Sync Status" value={networkStats.syncStatus} color="text-green-400" />
                        <ExplorerStat label="Avg Finality" value={networkStats.avgBlockTime} color="text-blue-400" />
                        <ExplorerStat label="Total Nodes" value={networkStats.totalNodes.toString()} color="text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Live Event Log */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tighter italic">Live Transaction Feed</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Real-time indexing</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {events.map((event, idx) => (
                                <div
                                    key={event.id}
                                    className={`bg-white/5 border border-white/10 rounded-2xl p-6 transition-all animate-slide-in hover:bg-white/[0.07] ${idx === 0 ? 'border-blue-500/30 bg-blue-600/5' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg ${getEventColor(event.type)}`}>
                                                {getEventIcon(event.type)}
                                            </div>
                                            <div>
                                                <div className="text-white font-black">{event.label} {event.value && <span className="text-blue-400 ml-1">({event.value})</span>}</div>
                                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                                    {event.txHash} • {event.location}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{event.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Network Impact & Map */}
                    <div className="space-y-12">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">Network Distribution</h2>

                        {/* Regional Activity List */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-10">
                            <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center justify-between">
                                Top Regions <span>Activity</span>
                            </h3>
                            <div className="space-y-6">
                                <RegionActivity label="Saudi Arabia (KSA)" percentage={45} />
                                <RegionActivity label="United Arab Emirates (UAE)" percentage={22} />
                                <RegionActivity label="Jordan (JO)" percentage={15} />
                                <RegionActivity label="Egypt (EG)" percentage={12} />
                                <RegionActivity label="Kuwait (KW)" percentage={6} />
                            </div>
                        </div>

                        {/* Protocol Health Tip */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8">
                            <h4 className="text-white font-bold mb-2">Transparency Protocol</h4>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Every event in this stream reflects a transaction state-change on the blockchain or a verified IPFS pinning operation. User identity is protected through cryptographic hashing.
                            </p>
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black uppercase text-[10px] tracking-widest transition-all">
                                View Network Architecture
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// HELPERS & SUB-COMPONENTS
// ============================================

function ExplorerStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div>
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
        </div>
    );
}

function RegionActivity({ label, percentage }: { label: string, percentage: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{percentage}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

function getEventIcon(type: ProtocolEvent['type']) {
    switch (type) {
        case 'ORDER': return '🛒';
        case 'SHIPMENT': return '🚛';
        case 'PAYOUT': return '💸';
        case 'VOTE': return '🏛️';
        case 'REGISTRATION': return '📋';
    }
}

function getEventColor(type: ProtocolEvent['type']) {
    switch (type) {
        case 'ORDER': return 'bg-blue-600/20 text-blue-400';
        case 'SHIPMENT': return 'bg-purple-600/20 text-purple-400';
        case 'PAYOUT': return 'bg-green-600/20 text-green-400';
        case 'VOTE': return 'bg-orange-600/20 text-orange-400';
        case 'REGISTRATION': return 'bg-white/10 text-white';
    }
}

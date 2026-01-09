"use client";

import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, ArrowDownToLine, ExternalLink, CheckCircle, Clock, XCircle, Eye, Hash, Calendar, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';

export default function LedgerPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    // Mock ledger data - in real app, this would come from API
    const mockTransactions = [
        {
            id: '0x7a2b3c4d5e6f7890abcdef1234567890abcdef',
            blockNumber: 12456789,
            timestamp: '2024-01-15T10:30:00Z',
            type: 'settlement',
            from: '0x1234...5678',
            to: '0x9abc...def0',
            amount: '1250.50',
            currency: 'USD',
            status: 'confirmed',
            gasUsed: '21000',
            confirmations: 12,
            restaurantId: 'RST-001',
            region: 'Middle East'
        },
        {
            id: '0x8b3c4d5e6f7890abcdef1234567890abcdef12',
            blockNumber: 12456788,
            timestamp: '2024-01-15T10:25:00Z',
            type: 'dividend',
            from: '0xprotocol',
            to: '0x742d...c1d3',
            amount: '45.20',
            currency: 'NLP',
            status: 'confirmed',
            gasUsed: '18000',
            confirmations: 13,
            restaurantId: 'RST-005',
            region: 'West Africa'
        },
        {
            id: '0x9c4d5e6f7890abcdef1234567890abcdef1234',
            blockNumber: 12456787,
            timestamp: '2024-01-15T10:20:00Z',
            type: 'investment',
            from: '0x742d...c1d3',
            to: '0xprotocol',
            amount: '5000.00',
            currency: 'USD',
            status: 'confirmed',
            gasUsed: '25000',
            confirmations: 14,
            restaurantId: 'RST-003',
            region: 'Central Asia'
        },
        {
            id: '0x0d5e6f7890abcdef1234567890abcdef123456',
            blockNumber: 12456786,
            timestamp: '2024-01-15T10:15:00Z',
            type: 'fee',
            from: '0x1234...5678',
            to: '0xvalidators',
            amount: '2.50',
            currency: 'NLP',
            status: 'confirmed',
            gasUsed: '15000',
            confirmations: 15,
            restaurantId: null,
            region: 'Global'
        },
        {
            id: '0x1e6f7890abcdef1234567890abcdef12345678',
            blockNumber: 12456785,
            timestamp: '2024-01-15T10:10:00Z',
            type: 'settlement',
            from: '0x5678...9abc',
            to: '0xdef0...1234',
            amount: '890.75',
            currency: 'USD',
            status: 'pending',
            gasUsed: '22000',
            confirmations: 2,
            restaurantId: 'RST-012',
            region: 'East Africa'
        }
    ];

    const filteredTransactions = mockTransactions.filter(tx => {
        const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.restaurantId && tx.restaurantId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = selectedFilter === 'all' ||
            (selectedFilter === 'confirmed' && tx.status === 'confirmed') ||
            (selectedFilter === 'pending' && tx.status === 'pending') ||
            (selectedFilter === 'settlement' && tx.type === 'settlement') ||
            (selectedFilter === 'dividend' && tx.type === 'dividend') ||
            (selectedFilter === 'investment' && tx.type === 'investment');

        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle size={16} className="text-emerald-500" />;
            case 'pending':
                return <Clock size={16} className="text-amber-500" />;
            default:
                return <XCircle size={16} className="text-red-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Pending</Badge>;
            default:
                return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Failed</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            settlement: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            dividend: 'bg-green-500/10 text-green-400 border-green-500/20',
            investment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            fee: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        };
        return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>{type}</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Protocol Ledger</h1>
                        <p className="text-zinc-500 font-medium">Verify every transaction anchored to the global NileLink state.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-10 px-4 border-white/10 text-zinc-300 hover:bg-white/5">
                            <ArrowDownToLine size={16} className="mr-2" />
                            Export CSV
                        </Button>
                        <Button className="h-10 px-4 bg-blue-600 hover:bg-blue-500">
                            <Database size={16} className="mr-2" />
                            Verify Ledger
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Ledger Table */}
                    <div className="lg:col-span-8">
                        <GlassCard className="p-0 border-white/5 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-4 flex-1 max-w-lg">
                                    <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 focus-within:border-blue-500/30 transition-all text-sm">
                                        <Search size={16} className="text-zinc-600" />
                                        <input
                                            type="text"
                                            placeholder="Search hash, address, or restaurant ID..."
                                            className="bg-transparent border-none focus:outline-none w-full text-zinc-300"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => {/* toggle filter dropdown */ }}
                                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10 transition-all"
                                        >
                                            <Filter size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Live Sync
                                    </span>
                                    <span>8,492 Blocks</span>
                                    <span>124ms Avg</span>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.005]">
                                <div className="flex gap-2">
                                    {[
                                        { id: 'all', label: 'All', count: mockTransactions.length },
                                        { id: 'confirmed', label: 'Confirmed', count: mockTransactions.filter(tx => tx.status === 'confirmed').length },
                                        { id: 'pending', label: 'Pending', count: mockTransactions.filter(tx => tx.status === 'pending').length },
                                        { id: 'settlement', label: 'Settlements', count: mockTransactions.filter(tx => tx.type === 'settlement').length },
                                        { id: 'dividend', label: 'Dividends', count: mockTransactions.filter(tx => tx.type === 'dividend').length },
                                    ].map(filter => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setSelectedFilter(filter.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedFilter === filter.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                                                }`}
                                        >
                                            {filter.label} ({filter.count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className="max-h-[600px] overflow-y-auto">
                                {filteredTransactions.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {filteredTransactions.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="p-6 hover:bg-white/[0.02] transition-all cursor-pointer group"
                                                onClick={() => setSelectedTransaction(tx)}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(tx.status)}
                                                        <div className="flex items-center gap-2">
                                                            <Hash size={14} className="text-zinc-600" />
                                                            <span className="text-sm font-mono text-zinc-400">
                                                                {tx.id.slice(0, 10)}...{tx.id.slice(-8)}
                                                            </span>
                                                        </div>
                                                        <ExternalLink size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getTypeBadge(tx.type)}
                                                        {getStatusBadge(tx.status)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Amount</div>
                                                        <div className="font-bold text-white">
                                                            {tx.amount} {tx.currency}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Block</div>
                                                        <div className="font-mono text-zinc-400">#{tx.blockNumber}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Confirmations</div>
                                                        <div className="font-bold text-emerald-400">{tx.confirmations}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Region</div>
                                                        <div className="font-bold text-zinc-300">{tx.region}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                                                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                                                    <span>Gas: {tx.gasUsed}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <Database size={48} className="mx-auto mb-4 text-zinc-600" />
                                        <h3 className="text-lg font-bold text-white mb-2">No transactions found</h3>
                                        <p className="text-zinc-500">Try adjusting your search or filter criteria.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Transaction Details Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {selectedTransaction ? (
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Transaction Details</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(null)}>
                                        <XCircle size={16} />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Transaction Hash</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-mono text-zinc-300 break-all">{selectedTransaction.id}</span>
                                            <ExternalLink size={14} className="text-zinc-600 cursor-pointer hover:text-blue-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Block Number</label>
                                            <div className="text-sm font-mono text-white mt-1">#{selectedTransaction.blockNumber}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                                            <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">From</label>
                                        <div className="text-sm font-mono text-zinc-300 mt-1 break-all">{selectedTransaction.from}</div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">To</label>
                                        <div className="text-sm font-mono text-zinc-300 mt-1 break-all">{selectedTransaction.to}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Amount</label>
                                            <div className="text-lg font-bold text-white mt-1">
                                                {selectedTransaction.amount} {selectedTransaction.currency}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Type</label>
                                            <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gas Used</label>
                                            <div className="text-sm text-zinc-300 mt-1">{selectedTransaction.gasUsed}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Confirmations</label>
                                            <div className="text-sm text-emerald-400 mt-1">{selectedTransaction.confirmations}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Timestamp</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar size={14} className="text-zinc-600" />
                                            <span className="text-sm text-zinc-300">
                                                {new Date(selectedTransaction.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedTransaction.restaurantId && (
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Restaurant ID</label>
                                            <div className="text-sm font-mono text-blue-400 mt-1">{selectedTransaction.restaurantId}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-500">
                                        <Eye size={16} className="mr-2" />
                                        View on Explorer
                                    </Button>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard className="p-12 text-center border-dashed border-white/20">
                                <Database size={48} className="mx-auto mb-4 text-zinc-600" />
                                <h4 className="text-lg font-bold text-white mb-2">Select Transaction</h4>
                                <p className="text-sm text-zinc-500">Click on any transaction to view detailed information.</p>
                            </GlassCard>
                        )}

                        {/* Ledger Stats */}
                        <GlassCard className="p-6">
                            <h4 className="font-bold text-lg mb-6">Ledger Statistics</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Total Transactions</span>
                                    <span className="text-sm font-bold text-white">1,247,891</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Active Validators</span>
                                    <span className="text-sm font-bold text-emerald-400">247</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Network TPS</span>
                                    <span className="text-sm font-bold text-blue-400">1,247</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Finality Time</span>
                                    <span className="text-sm font-bold text-purple-400">2.1s</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

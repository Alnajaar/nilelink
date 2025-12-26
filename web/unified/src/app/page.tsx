"use client";

import React from 'react';
import {
    Activity,
    TrendingUp,
    Users,
    ShieldCheck,
    Database,
    Box,
    ArrowRight
} from 'lucide-react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { PageTransition } from '@/shared/components/PageTransition';

export default function DashboardOverview() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <UniversalHeader appName="Unified Admin" user={{ name: "Super Admin", role: "Root Access" }} />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Protocol Overview</h1>
                    <p className="text-text-muted">Real-time governance and health monitoring.</p>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Volume', value: '$1.24M', trend: '+12.5%', icon: TrendingUp, color: 'text-info' },
                        { label: 'Active Nodes', value: '84', trend: 'Healthy', icon: Activity, color: 'text-success' },
                        { label: 'Network Latency', value: '14ms', trend: '-2.1%', icon: ZapIcon, color: 'text-warning' },
                        { label: 'Ledger Audit', value: '100%', trend: 'Verified', icon: ShieldCheck, color: 'text-primary' },
                    ].map((stat, i) => (
                        <Card key={i} variant="default" padding="md" className="flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg bg-background-subtle ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-xs font-bold bg-background-subtle px-2 py-1 rounded text-text-muted">{stat.trend}</span>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-text-main tracking-tight mb-1">{stat.value}</div>
                                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text-main">Recent Ledger Events</h2>
                            <Button variant="ghost" size="sm">View Full Ledger</Button>
                        </div>

                        <Card variant="flat" padding="none" className="divide-y divide-border-subtle overflow-hidden">
                            {[
                                { id: 'TX-4521', type: 'SALE_AUTH', status: 'Anchored', time: '12s ago', node: 'Cairo-North-1' },
                                { id: 'TX-4520', type: 'SETTLEMENT', status: 'Pending', time: '45s ago', node: 'Dubai-Main-2' },
                                { id: 'TX-4519', type: 'INVENTORY', status: 'Anchored', time: '3m ago', node: 'Alex-Dist-2' },
                                { id: 'TX-4518', type: 'SALE_AUTH', status: 'Anchored', time: '14m ago', node: 'Cairo-North-1' },
                                { id: 'TX-4517', type: 'GOVERNANCE', status: 'Verified', time: '22m ago', node: 'Global-Consensus' },
                            ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-white transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded bg-background-subtle flex items-center justify-center text-text-muted">
                                            <Database size={14} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-text-main">{tx.type}</div>
                                            <div className="text-[10px] font-mono text-text-muted">{tx.id} • {tx.node}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${tx.status === 'Anchored' || tx.status === 'Verified' ? 'text-success' : 'text-warning'}`}>
                                            {tx.status}
                                        </div>
                                        <div className="text-[10px] text-text-muted">{tx.time}</div>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>

                    {/* Quick Actions & Protocol Health */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-bold text-text-main mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Button fullWidth variant="primary" leftIcon={<Box size={16} />}>Deploy New Node</Button>
                                <Button fullWidth variant="outline" leftIcon={<Users size={16} />}>Manage Roles</Button>
                                <Button fullWidth variant="outline" leftIcon={<ShieldCheck size={16} />}>Run Audit</Button>
                            </div>
                        </section>

                        <Card className="bg-primary-dark text-white border-none">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-success" />
                                System Health
                            </h3>
                            <div className="space-y-4 text-sm opacity-90">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Consensus</span>
                                    <span className="font-mono text-success">OPTIMAL</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Block Height</span>
                                    <span className="font-mono">19,204,382</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Active Peers</span>
                                    <span className="font-mono">84/84</span>
                                </div>
                            </div>
                            <div className="mt-6 text-[10px] uppercase tracking-widest text-center opacity-50">
                                Powered by NileLink Core v1.0
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Icon helper
function ZapIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}

"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Shield, Lock, Users, DollarSign } from 'lucide-react';
import { Button } from '@shared/components/Button';

export default function TransparencyPage() {
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
                            <Eye className="text-primary" size={24} />
                            <div>
                                <h1 className="text-2xl font-bold text-nav-text">Protocol Transparency</h1>
                                <p className="text-nav-text/80 text-sm">Real-time NileLink ecosystem metrics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Treasury Stats */}
                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="text-primary" size={24} />
                            <h3 className="text-xl font-bold text-text">Treasury</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text">Total Value Locked</span>
                                <span className="text-primary font-bold">$2.4M</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Daily Volume</span>
                                <span className="text-primary font-bold">$127.5K</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Active Users</span>
                                <span className="text-primary font-bold">8,942</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Stats */}
                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-primary" size={24} />
                            <h3 className="text-xl font-bold text-text">Security</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text">Network Uptime</span>
                                <span className="text-primary font-bold">99.98%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Failed Transactions</span>
                                <span className="text-primary font-bold">0.02%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Active Nodes</span>
                                <span className="text-primary font-bold">127</span>
                            </div>
                        </div>
                    </div>

                    {/* Governance Stats */}
                    <div className="bg-surface border border-primary rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="text-primary" size={24} />
                            <h3 className="text-xl font-bold text-text">Governance</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text">Total Voters</span>
                                <span className="text-primary font-bold">1,247</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Active Proposals</span>
                                <span className="text-primary font-bold">3</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text">Quorum Reached</span>
                                <span className="text-primary font-bold">89%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Activity */}
                <div className="mt-12 bg-surface border border-primary rounded-xl p-6">
                    <h3 className="text-xl font-bold text-text mb-6">Real-time Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-primary/20 last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <div>
                                        <div className="text-text font-medium">Transaction #{19043000 + i}</div>
                                        <div className="text-text/70 text-sm">{Math.floor(Math.random() * 500) + 10} NILE tokens</div>
                                    </div>
                                </div>
                                <div className="text-primary font-mono text-sm">
                                    {new Date(Date.now() - i * 30000).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-12 text-center">
                    <div className="bg-primary rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-nav-text mb-4">
                            Join the Transparent Economy
                        </h3>
                        <p className="text-nav-text/90 mb-6 max-w-2xl mx-auto">
                            Every transaction, every decision, every movement is visible and verifiable on the NileLink protocol.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/login">
                                <Button className="bg-surface text-text hover:bg-background">
                                    <Lock className="mr-2" size={20} />
                                    Access Dashboard
                                </Button>
                            </Link>
                            <Link href="/docs">
                                <Button variant="outline" className="border-surface text-nav-text hover:bg-surface">
                                    <Eye className="mr-2" size={20} />
                                    View Documentation
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

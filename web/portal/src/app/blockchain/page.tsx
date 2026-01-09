"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Zap } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function BlockchainPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to NileLink
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <Shield size={40} className="text-white" />
                </div>

                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-sm uppercase tracking-widest mb-6">
                    Blockchain Protocol
                </Badge>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">
                    Decentralized Settlement
                </h1>

                <p className="text-xl text-text-primary opacity-60 mb-12 max-w-2xl mx-auto">
                    Trustless escrow, governance, and settlement protocols ensuring transparency and security at scale.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 border-2 border-primary bg-white">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-black uppercase mb-4">Smart Contracts</h3>
                        <p className="text-text-primary opacity-60 text-sm">
                            Audited smart contracts for escrow and settlement with multi-sig security.
                        </p>
                    </Card>

                    <Card className="p-6 border-2 border-primary bg-white">
                        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-black uppercase mb-4">Decentralized</h3>
                        <p className="text-text-primary opacity-60 text-sm">
                            No single point of failure with distributed validation and consensus.
                        </p>
                    </Card>

                    <Card className="p-6 border-2 border-primary bg-white">
                        <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-black uppercase mb-4">High Performance</h3>
                        <p className="text-text-primary opacity-60 text-sm">
                            Sub-second settlement times with parallel processing and optimization.
                        </p>
                    </Card>
                </div>

                <Card className="p-8 border-2 border-primary bg-white mb-8">
                    <h3 className="text-2xl font-black uppercase mb-6">Protocol Status</h3>
                    <p className="text-text-primary opacity-60 mb-6">
                        Our blockchain protocol is live on Polygon mainnet with enterprise-grade security and performance monitoring.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <div className="text-2xl font-black text-primary">99.9%</div>
                            <div className="text-xs text-text-primary opacity-60 uppercase">Uptime</div>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <div className="text-2xl font-black text-primary">850ms</div>
                            <div className="text-xs text-text-primary opacity-60 uppercase">Avg Response</div>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <div className="text-2xl font-black text-primary">2,400</div>
                            <div className="text-xs text-text-primary opacity-60 uppercase">TPS</div>
                        </div>
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <div className="text-2xl font-black text-primary">$2.1M</div>
                            <div className="text-xs text-text-primary opacity-60 uppercase">TVL</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/governance">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                View Governance
                                <Shield className="ml-2" size={18} />
                            </Button>
                        </Link>
                        <Link href="/status">
                            <Button variant="outline">
                                Network Status
                            </Button>
                        </Link>
                    </div>
                </Card>

                <Link href="/docs/ecosystem">
                    <Button variant="outline" className="text-primary hover:text-primary/80">
                        ← Back to Ecosystem Overview
                    </Button>
                </Link>
            </div>
        </div>
    );
}

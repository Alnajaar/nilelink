"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, Zap } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function POSPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            {/* Header */}
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
                    <Store size={40} className="text-white" />
                </div>

                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-sm uppercase tracking-widest mb-6">
                    Point of Sale
                </Badge>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">
                    NilePOS Terminal
                </h1>

                <p className="text-xl text-text-primary opacity-60 mb-12 max-w-2xl mx-auto">
                    High-frequency retail infrastructure with offline capabilities and real-time synchronization.
                </p>

                <Card className="p-8 border-2 border-primary bg-white mb-8">
                    <h3 className="text-2xl font-black uppercase mb-6">Coming Soon</h3>
                    <p className="text-text-primary opacity-60 mb-6">
                        Our dedicated POS application is currently in development. This will be a native desktop application for Windows, macOS, and Linux with full offline capabilities.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-primary text-white hover:bg-primary/90">
                            Join Waitlist
                            <Zap className="ml-2" size={18} />
                        </Button>
                        <Link href="/get-started">
                            <Button variant="outline">
                                Get Started with Portal
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

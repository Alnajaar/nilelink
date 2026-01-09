"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, Zap, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function QRMenuPage() {
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
                    <Smartphone size={40} className="text-white" />
                </div>

                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-sm uppercase tracking-widest mb-6">
                    Smart QR Menus
                </Badge>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">
                    Dynamic QR Menus
                </h1>

                <p className="text-xl text-text-primary opacity-60 mb-12 max-w-2xl mx-auto">
                    Offline-capable QR menu system that loads instantly and updates in real-time when connected.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6 border-2 border-primary bg-white">
                        <Wifi className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-4">Online Mode</h3>
                        <p className="text-text-primary opacity-60">
                            Real-time menu updates, live inventory tracking, and instant order placement.
                        </p>
                    </Card>

                    <Card className="p-6 border-2 border-surface bg-white">
                        <WifiOff className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-4">Offline Mode</h3>
                        <p className="text-text-primary opacity-60">
                            Cached menu data loads instantly, orders queue automatically for sync when reconnected.
                        </p>
                    </Card>
                </div>

                <Card className="p-8 border-2 border-primary bg-white mb-8">
                    <h3 className="text-2xl font-black uppercase mb-6">Live Technology</h3>
                    <p className="text-text-primary opacity-60 mb-6">
                        Our QR menu system is fully operational with intelligent caching and automatic synchronization.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-primary text-white hover:bg-primary/90">
                            Try QR Menu Demo
                            <Zap className="ml-2" size={18} />
                        </Button>
                        <Link href="/get-started">
                            <Button variant="outline">
                                Get Started
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

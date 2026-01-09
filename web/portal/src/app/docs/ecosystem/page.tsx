"use client";

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Network,
    Zap,
    Shield,
    Globe,
    Users,
    Store,
    Truck,
    CreditCard,
    BarChart3,
    ChevronRight
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function EcosystemPage() {
    const ecosystemComponents = [
        {
            name: 'Unified Admin Portal',
            description: 'Centralized management console for all NileLink operations',
            icon: BarChart3,
            status: 'Live',
            url: '/dashboard'
        },
        {
            name: 'POS Terminal',
            description: 'Point of sale system with offline capabilities',
            icon: Store,
            status: 'Live',
            url: '/pos'
        },
        {
            name: 'Delivery Fleet',
            description: 'Real-time delivery tracking and driver dispatch',
            icon: Truck,
            status: 'Beta',
            url: '/delivery'
        },
        {
            name: 'Supplier Hub',
            description: 'Supply chain management and inventory sync',
            icon: Network,
            status: 'Live',
            url: '/supplier'
        },
        {
            name: 'Customer Portal',
            description: 'Order tracking, QR menus, and marketplace access',
            icon: Users,
            status: 'Live',
            url: '/customer'
        },
        {
            name: 'Payment Gateway',
            description: 'Cryptocurrency and fiat payment processing',
            icon: CreditCard,
            status: 'Live',
            url: '/payments'
        },
        {
            name: 'Smart QR Menus',
            description: 'Dynamic, offline-capable menu system',
            icon: Zap,
            status: 'Live',
            url: '/features/qr-menu'
        },
        {
            name: 'Blockchain Protocol',
            description: 'Decentralized settlement and governance',
            icon: Shield,
            status: 'Live',
            url: '/blockchain'
        }
    ];

    return (
        <div className="min-h-screen bg-neutral">
            {/* Header */}
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/docs" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to Docs
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-16">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Ecosystem Overview
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        NileLink Protocol
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-60 leading-relaxed max-w-4xl mx-auto">
                        A comprehensive economic operating system connecting restaurants, suppliers, delivery drivers, and customers through blockchain-powered transactions.
                    </p>
                </div>

                {/* Architecture Overview */}
                <Card className="p-12 mb-16 border-2 border-primary bg-white">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-center">System Architecture</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2">Blockchain Core</h3>
                            <p className="text-text opacity-60">
                                Decentralized settlement, escrow, and governance protocols ensuring trust and transparency.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Network size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2">Microservices</h3>
                            <p className="text-text opacity-60">
                                Modular architecture allowing independent scaling and deployment of each ecosystem component.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Globe size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2">Offline First</h3>
                            <p className="text-text opacity-60">
                                Full functionality without internet connectivity, with automatic synchronization when online.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Components Grid */}
                <div className="mb-16">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 text-center">Ecosystem Components</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ecosystemComponents.map((component, index) => (
                            <Card key={index} className="p-8 border-2 border-primary/10 hover:border-primary/30 bg-white transition-all duration-300 hover:shadow-xl">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <component.icon size={28} className="text-primary" />
                                    </div>
                                    <Badge
                                        variant={component.status === 'Live' ? 'success' : 'warning'}
                                        className="text-xs font-black"
                                    >
                                        {component.status}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{component.name}</h3>
                                <p className="text-text opacity-60 mb-6 leading-relaxed">{component.description}</p>

                                <Link href={component.url}>
                                    <div className="inline-flex items-center gap-2 text-primary font-bold uppercase text-sm tracking-widest hover:gap-3 transition-all">
                                        Learn More
                                        <ChevronRight size={16} />
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Data Flow */}
                <Card className="p-12 border-2 border-primary bg-gradient-to-br from-white to-primary/5">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-center">Data Flow</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-black uppercase mb-6">Real-time Synchronization</h3>
                            <ul className="space-y-4 text-text opacity-80">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>POS terminals sync orders and inventory changes instantly</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Customer QR scans trigger real-time menu updates</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Delivery tracking updates in real-time across all platforms</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Blockchain transactions settle automatically</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black uppercase mb-6">Offline Capabilities</h3>
                            <ul className="space-y-4 text-text opacity-80">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Complete POS operation without internet connectivity</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>QR menus load from cached data when offline</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Order queuing and automatic sync when reconnected</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Local data persistence across browser sessions</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

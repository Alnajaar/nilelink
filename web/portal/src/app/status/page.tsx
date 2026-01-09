'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '@shared/components/Card';

export default function StatusPage() {
    const services = [
        { name: 'Portal', url: 'https://nilelink.app', status: 'operational' },
        { name: 'Unified Admin', url: 'https://unified.nilelink.app', status: 'operational' },
        { name: 'POS System', url: 'https://pos.nilelink.app', status: 'operational' },
        { name: 'Delivery Fleet', url: 'https://delivery.nilelink.app', status: 'operational' },
        { name: 'Supplier Hub', url: 'https://supplier.nilelink.app', status: 'operational' },
        { name: 'Investor Dashboard', url: 'https://invest.nilelink.app', status: 'operational' },
        { name: 'API Gateway', url: 'https://api.nilelink.app', status: 'operational' },
    ];

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-primary-dark mb-4">Network Status</h1>
                <p className="text-text-muted text-lg mb-12">
                    Real-time status of all NileLink services and infrastructure.
                </p>

                <Card className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main">All Systems Operational</h2>
                            <p className="text-text-muted">No incidents reported</p>
                        </div>
                        <div className="flex items-center gap-2 text-success font-bold">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                            </span>
                            ONLINE
                        </div>
                    </div>
                </Card>

                <div className="space-y-4">
                    {services.map((service) => (
                        <Card key={service.name} className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-text-main">{service.name}</h3>
                                <a href={service.url} className="text-sm text-primary hover:underline flex items-center gap-1">
                                    {service.url} <ExternalLink size={12} />
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-success"></span>
                                <span className="text-sm font-medium text-success">Operational</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

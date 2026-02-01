'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Link as LinkIcon, CheckCircle, XCircle, Settings,
    Key, ShoppingCart, BarChart, Database, Globe
} from 'lucide-react';

export default function IntegrationsPage() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'connected' | 'api'>('catalog');

    const integrations = [
        {
            id: 'shopify',
            name: 'Shopify',
            description: 'Sync products, inventory, and orders with your Shopify store.',
            icon: ShoppingCart,
            status: 'connected',
            category: 'E-commerce'
        },
        {
            id: 'quickbooks',
            name: 'QuickBooks',
            description: 'Automated accounting and financial reporting.',
            icon: BarChart,
            status: 'disconnected',
            category: 'Finance'
        },
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Payment processing and dispute management.',
            icon: DollarSign,
            status: 'connected',
            category: 'Payments'
        },
        {
            id: 'mailchimp',
            name: 'Mailchimp',
            description: 'Sync customers for email marketing campaigns.',
            icon: Globe,
            status: 'disconnected',
            category: 'Marketing'
        },
        {
            id: 'sap',
            name: 'SAP ERP',
            description: 'Enterprise resource planning integration.',
            icon: Database,
            status: 'disconnected',
            category: 'ERP'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Integrations Hub</h1>
                    <p className="text-slate-500">Connect your favorite tools to NileLink</p>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'catalog'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Browse Catalog
                    </button>
                    <button
                        onClick={() => setActiveTab('connected')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'connected'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Connected Apps
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'api'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        API & Webhooks
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'catalog' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrations.map((app, index) => {
                            const StatusIcon = app.status === 'connected' ? CheckCircle : LinkIcon;

                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <app.icon size={24} className="text-slate-700" />
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                                            {app.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{app.name}</h3>
                                    <p className="text-sm text-slate-500 mb-6 flex-1">{app.description}</p>

                                    {app.status === 'connected' ? (
                                        <button className="w-full py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                            <CheckCircle size={16} /> Installed
                                        </button>
                                    ) : (
                                        <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                            <LinkIcon size={16} /> Connect
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="max-w-3xl">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Key size={20} className="text-slate-500" />
                                API Keys
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Use these keys to authenticate requests to the NileLink Supplier API.
                                Keep them secret and never share them in client-side code.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">Production Key</div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">pk_live_...4a2b</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium hover:bg-slate-50">Reveal</button>
                                        <button className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-100">Revoke</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">Test Key</div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">pk_test_...9x8y</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium hover:bg-slate-50">Reveal</button>
                                        <button className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-100">Revoke</button>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">
                                Generate New Key
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon component needed for the mock data array
function DollarSign({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );
}

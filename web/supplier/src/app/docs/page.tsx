import React from 'react';
import Link from 'next/link';
import { BookOpen, Code, FileText, ExternalLink, ChevronRight, Package, ShoppingCart, Truck } from 'lucide-react';

export const metadata = {
    title: 'Documentation | NileLink Supplier',
    description: 'API documentation and guides for the NileLink supplier platform'
};

export default function DocsPage() {
    const sections = [
        {
            title: 'Getting Started',
            icon: BookOpen,
            items: [
                { label: 'Introduction', href: '#introduction' },
                { label: 'Quick Start Guide', href: '#quick-start' },
                { label: 'Authentication', href: '#authentication' }
            ]
        },
        {
            title: 'Core Features',
            icon: Package,
            items: [
                { label: 'Product Management', href: '#products' },
                { label: 'Inventory Tracking', href: '#inventory' },
                { label: 'Order Processing', href: '#orders' }
            ]
        },
        {
            title: 'API Reference',
            icon: Code,
            items: [
                { label: 'Products API', href: '#api-products' },
                { label: 'Orders API', href: '#api-orders' },
                { label: 'Fulfillment API', href: '#api-fulfillment' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Hero Section */}
            <div className="border-b border-slate-800/50 bg-gradient-to-r from-blue-950/20 to-cyan-950/20">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                            <FileText className="w-4 h-4" />
                            <span>Supplier Documentation</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4">
                            NileLink Supplier Portal
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            Everything you need to know about managing your products, inventory, and orders on the NileLink platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {sections.map((section) => (
                                <div key={section.title} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <section.icon className="w-5 h-5 text-blue-400" />
                                        <h3 className="font-semibold text-white">{section.title}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <a
                                                    href={item.href}
                                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition group"
                                                >
                                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                                                    <span>{item.label}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Introduction */}
                        <section id="introduction" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 rounded-2xl p-8">
                                <h2 className="text-3xl font-bold text-white mb-4">Introduction</h2>
                                <p className="text-slate-300 mb-6">
                                    Welcome to the NileLink Supplier Platform. This documentation will help you get started with managing your products, tracking inventory, and fulfilling orders efficiently.
                                </p>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                        <Package className="w-8 h-8 text-blue-400 mb-2" />
                                        <h4 className="font-semibold text-white mb-1">Products</h4>
                                        <p className="text-sm text-slate-400">Manage your product catalog</p>
                                    </div>
                                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                        <ShoppingCart className="w-8 h-8 text-cyan-400 mb-2" />
                                        <h4 className="font-semibold text-white mb-1">Orders</h4>
                                        <p className="text-sm text-slate-400">Process and track orders</p>
                                    </div>
                                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                        <Truck className="w-8 h-8 text-emerald-400 mb-2" />
                                        <h4 className="font-semibold text-white mb-1">Fulfillment</h4>
                                        <p className="text-sm text-slate-400">Manage deliveries</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Start */}
                        <section id="quick-start" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 rounded-2xl p-8">
                                <h2 className="text-3xl font-bold text-white mb-4">Quick Start Guide</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Create Your Account</h4>
                                            <p className="text-slate-400">Sign up and complete your supplier profile with business details.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Add Products</h4>
                                            <p className="text-slate-400">Upload your product catalog with pricing and inventory information.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Start Receiving Orders</h4>
                                            <p className="text-slate-400">Monitor incoming orders and manage fulfillment from your dashboard.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* API Reference */}
                        <section id="api-products" className="scroll-mt-24">
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 rounded-2xl p-8">
                                <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
                                <p className="text-slate-300 mb-6">
                                    Access our RESTful API to integrate NileLink supplier features into your systems.
                                </p>

                                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-emerald-400 font-mono text-sm">GET</span>
                                        <code className="text-slate-300 font-mono text-sm">/api/suppliers/products</code>
                                    </div>
                                    <p className="text-slate-400 text-sm">Retrieve your product catalog</p>
                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-400 font-mono text-sm">POST</span>
                                        <code className="text-slate-300 font-mono text-sm">/api/suppliers/products</code>
                                    </div>
                                    <p className="text-slate-400 text-sm">Add a new product to your catalog</p>
                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-emerald-400 font-mono text-sm">GET</span>
                                        <code className="text-slate-300 font-mono text-sm">/api/suppliers/orders</code>
                                    </div>
                                    <p className="text-slate-400 text-sm">Retrieve all orders for your products</p>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href="https://docs.nilelink.com/api"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                    >
                                        <span>Full API Documentation</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Support */}
                        <section className="bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border border-blue-500/20 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Need Help?</h3>
                            <p className="text-slate-300 mb-6">
                                Our support team is here to assist you with any questions or issues.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="mailto:support@nilelink.com"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Contact Support
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

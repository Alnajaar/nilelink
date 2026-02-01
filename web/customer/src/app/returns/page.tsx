'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package, RotateCcw, FileText, Upload, MessageSquare,
    Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@shared/components/AuthGuard';

export default function ReturnsPage() {
    return (
        <AuthGuard>
            <ReturnsContent />
        </AuthGuard>
    );
}

function ReturnsContent() {
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');

    const returnReasons = [
        'Defective or damaged product',
        'Wrong item received',
        'Not as described',
        'Changed my mind',
        'Found better price elsewhere',
        'Quality issues',
        'Missing parts or accessories',
        'Other'
    ];

    const myReturns = [
        {
            id: 'RET-001',
            orderNumber: 'ORD-12345',
            product: 'Premium Organic Olive Oil',
            status: 'processing',
            requestDate: '2026-01-10',
            reason: 'Defective or damaged product',
            refundAmount: 24.99
        },
        {
            id: 'RET-002',
            orderNumber: 'ORD-12298',
            product: 'Artisan Sourdough Bread',
            status: 'approved',
            requestDate: '2026-01-05',
            reason: 'Quality issues',
            refundAmount: 8.99
        },
        {
            id: 'RET-003',
            orderNumber: 'ORD-12187',
            product: 'Grass-Fed Butter 500g',
            status: 'completed',
            requestDate: '2025-12-28',
            reason: 'Not as described',
            refundAmount: 12.50
        }
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'processing':
                return { color: 'text-blue-400 bg-blue-500/20', icon: Clock };
            case 'approved':
                return { color: 'text-green-400 bg-green-500/20', icon: CheckCircle };
            case 'rejected':
                return { color: 'text-red-400 bg-red-500/20', icon: XCircle };
            case 'completed':
                return { color: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle };
            default:
                return { color: 'text-slate-400 bg-slate-500/20', icon: AlertCircle };
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting return request:', { reason: selectedReason, description });
        // Submit logic here
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/history" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">Returns & Refunds</h1>
                    <p className="text-slate-400">Request a return or check the status of your existing returns</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* New Return Request */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Request a Return</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Order Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Select Order
                                    </label>
                                    <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Choose an order...</option>
                                        <option value="ORD-12345">ORD-12345 - Premium Olive Oil ($24.99)</option>
                                        <option value="ORD-12298">ORD-12298 - Artisan Bread ($8.99)</option>
                                        <option value="ORD-12187">ORD-12187 - Grass-Fed Butter ($12.50)</option>
                                    </select>
                                </div>

                                {/* Return Reason */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Reason for Return
                                    </label>
                                    <select
                                        value={selectedReason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a reason...</option>
                                        {returnReasons.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Additional Details
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Please provide more details about the issue..."
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Upload Photos (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition">
                                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400 mb-1">Click to upload or drag and drop</p>
                                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Submit Return Request
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Return Policy */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-blue-950/50 to-cyan-950/30 border border-blue-500/20 rounded-2xl p-6 sticky top-6">
                            <h3 className="text-xl font-bold text-white mb-4">Return Policy</h3>
                            <div className="space-y-4 text-sm text-slate-300">
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <p>30-day return window for most items</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <p>Free return shipping on defective items</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <p>Full refund processed within 5-7 business days</p>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <p>Items must be in original condition with packaging</p>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <p>Perishable items may have different policies</p>
                                </div>
                            </div>
                            <Link
                                href="/help/returns"
                                className="block mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                            >
                                Read Full Policy →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Existing Returns */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Returns</h2>

                    <div className="space-y-4">
                        {myReturns.map((returnItem, index) => {
                            const statusConfig = getStatusConfig(returnItem.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <motion.div
                                    key={returnItem.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-6 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white">{returnItem.product}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {returnItem.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>Return ID: {returnItem.id}</span>
                                                <span>Order: {returnItem.orderNumber}</span>
                                                <span>{returnItem.requestDate}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">${returnItem.refundAmount}</div>
                                            <div className="text-xs text-slate-400">Refund Amount</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                        <div className="text-sm text-slate-400">
                                            Reason: <span className="text-white">{returnItem.reason}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Contact Support
                                            </button>
                                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

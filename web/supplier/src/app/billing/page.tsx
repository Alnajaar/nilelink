'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Download from 'lucide-react/dist/esm/icons/download';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Check from 'lucide-react/dist/esm/icons/check';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

export default function BillingPage() {
    const { user } = useAuth();
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

    const balance = {
        current: 12450.00,
        pending: 3200.00,
        available: 9250.00
    };

    const paymentMethods = [
        {
            id: '1',
            type: 'bank',
            name: 'Business Account',
            last4: '4532',
            bank: 'National Bank of Egypt',
            isDefault: true
        },
        {
            id: '2',
            type: 'card',
            name: 'Backup Card',
            last4: '8756',
            bank: 'VISA',
            isDefault: false
        }
    ];

    const transactions = [
        {
            id: 'TXN-001',
            type: 'income',
            description: 'Payment for Order #ORD-2345',
            amount: 1250.00,
            date: '2026-01-12',
            status: 'completed'
        },
        {
            id: 'TXN-002',
            type: 'expense',
            description: 'Platform Fee',
            amount: -45.00,
            date: '2026-01-11',
            status: 'completed'
        },
        {
            id: 'TXN-003',
            type: 'income',
            description: 'Payment for Order #ORD-2340',
            amount: 2100.00,
            date: '2026-01-10',
            status: 'completed'
        },
        {
            id: 'TXN-004',
            type: 'income',
            description: 'Payment for Order #ORD-2335',
            amount: 875.00,
            date: '2026-01-09',
            status: 'pending'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Billing & Payments</h1>
                    <p className="text-slate-400">Manage your payments, invoices, and transactions</p>
                </div>

                {/* Balance Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8 text-blue-400" />
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${balance.current.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400">Current Balance</div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${balance.pending.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400">Pending</div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${balance.available.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400">Available to Withdraw</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Payment Methods */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Payment Methods</h2>
                                <button
                                    onClick={() => setShowAddPaymentModal(true)}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`p-4 rounded-xl border transition ${method.isDefault
                                                ? 'bg-blue-500/10 border-blue-500/30'
                                                : 'bg-slate-800/30 border-slate-700/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                {method.type === 'bank' ? (
                                                    <Building2 className="w-5 h-5 text-blue-400" />
                                                ) : (
                                                    <CreditCard className="w-5 h-5 text-purple-400" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-white">{method.name}</div>
                                                    <div className="text-sm text-slate-400">
                                                        {method.bank} •••• {method.last4}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {method.isDefault && (
                                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-white font-medium transition">
                                Manage Payment Methods
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-white transition">
                                    <Download className="w-4 h-4" />
                                    <span>Request Payout</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-white transition">
                                    <Receipt className="w-4 h-4" />
                                    <span>View Invoices</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Transactions */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
                                    View All →
                                </button>
                            </div>

                            <div className="space-y-3">
                                {transactions.map((transaction, index) => (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {transaction.type === 'income' ? (
                                                    <TrendingUp className="w-5 h-5" />
                                                ) : (
                                                    <CreditCard className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{transaction.description}</div>
                                                <div className="text-sm text-slate-400">
                                                    {transaction.date} • {transaction.id}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                            </div>
                                            <div>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Payment Modal */}
                {showAddPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Add Payment Method</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Payment Type
                                    </label>
                                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="bank">Bank Account</option>
                                        <option value="card">Credit/Debit Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Account/Card Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter account number"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowAddPaymentModal(false)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Add payment logic
                                        setShowAddPaymentModal(false);
                                    }}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Add Payment Method
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Share2, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { LedgerBadge } from '@/components/shared/LedgerBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export default function ReceiptClient({ id }: { id: string }) {
    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-3xl mx-auto pb-32">
            <header className="flex items-center justify-between mb-8">
                <Link href="/history">
                    <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={18} />}>
                        Back to Orders
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Share2 size={18} />}>Share</Button>
                    <Button variant="outline" size="sm" leftIcon={<Printer size={18} />}>Print</Button>
                </div>
            </header>

            <Card className="p-8 md:p-12 print:shadow-none print:border-none">
                {/* Receipt Header */}
                <div className="text-center border-b-2 border-dashed border-black/10 pb-8 mb-8">
                    <div className="w-16 h-16 bg-primary-dark text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-black italic">
                        NL
                    </div>
                    <h1 className="text-2xl font-bold text-primary-dark mb-1">NileLink Receipt</h1>
                    <p className="text-sm text-text-secondary mb-4">Official Protocol Record</p>

                    <div className="flex justify-center">
                        <LedgerBadge verified={true} hash={`0x${id}...`} />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                        <p className="text-text-secondary mb-1">Merchant</p>
                        <p className="font-bold text-primary-dark">Grand Cairo Grill</p>
                        <p className="text-xs text-text-secondary">Zamalek Branch</p>
                    </div>
                    <div className="text-right">
                        <p className="text-text-secondary mb-1">Date</p>
                        <p className="font-bold text-primary-dark">{new Date().toLocaleDateString()}</p>
                        <p className="text-xs text-text-secondary">{new Date().toLocaleTimeString()}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary mb-1">Order ID</p>
                        <p className="font-mono font-bold text-primary-dark">#{id}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-text-secondary mb-1">Payment Method</p>
                        <p className="font-bold text-primary-dark">Credit Card</p>
                        <p className="text-xs text-text-secondary">**** 4242</p>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead className="border-b border-black/10">
                            <tr>
                                <th className="text-left py-2 font-medium text-text-secondary">Item</th>
                                <th className="text-center py-2 font-medium text-text-secondary">Qty</th>
                                <th className="text-right py-2 font-medium text-text-secondary">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {[1, 2, 3].map((i) => (
                                <tr key={i}>
                                    <td className="py-3 text-primary-dark">Grilled Chicken Meal</td>
                                    <td className="py-3 text-center text-primary-dark">1</td>
                                    <td className="py-3 text-right font-mono"><CurrencyDisplay amount={12.50} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-black/10 pt-4 mb-8">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="font-mono"><CurrencyDisplay amount={37.50} /></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Tax</span>
                        <span className="font-mono"><CurrencyDisplay amount={3.00} /></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Fee</span>
                        <span className="font-mono"><CurrencyDisplay amount={2.50} /></span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary-dark pt-2 mt-2 border-t border-black/10">
                        <span>Total</span>
                        <span className="font-mono"><CurrencyDisplay amount={43.00} /></span>
                    </div>
                </div>

                {/* Verification Footer */}
                <div className="bg-black/5 p-4 rounded-lg flex items-start gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-primary-dark uppercase tracking-wider mb-1">Cryptographically Verified</p>
                        <p className="text-[10px] text-text-secondary font-mono break-all leading-tight">
                            0x7d5a...3f9c
                        </p>
                    </div>
                </div>
            </Card>

            <div className="mt-8 text-center">
                <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>Download PDF</Button>
            </div>
        </div>
    );
}

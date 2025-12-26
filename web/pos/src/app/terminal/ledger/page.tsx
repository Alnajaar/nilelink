"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { LedgerBadge } from '@/components/shared/LedgerBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function LedgerViewPage() {
    return (
        <div className="h-full p-6 bg-background-light overflow-y-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-primary-dark">Transaction Ledger</h1>
                <p className="text-text-secondary">Immutable record of all local transactions.</p>
            </header>

            <Card className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/5 text-xs font-bold text-text-secondary uppercase">
                        <tr>
                            <th className="p-4">Transaction Hash</th>
                            <th className="p-4">Time</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-sm">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-black/5 transition-colors">
                                <td className="p-4 font-mono text-xs text-primary-dark">0x7d5a...3f9c</td>
                                <td className="p-4 text-text-secondary">14:{30 + i}</td>
                                <td className="p-4 font-medium">Sale</td>
                                <td className="p-4 text-right font-mono font-bold text-primary-dark">
                                    <CurrencyDisplay amount={42.50} />
                                </td>
                                <td className="p-4 flex justify-center">
                                    <LedgerBadge verified={true} hash="0x..." />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

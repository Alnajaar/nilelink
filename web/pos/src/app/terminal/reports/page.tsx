"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { FileText, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="h-full p-6 bg-background-light overflow-y-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary-dark">Reports</h1>
                    <p className="text-text-secondary">End of Day & Shift Summaries.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Download size={18} />}>Export CSV</Button>
                    <Button variant="outline" leftIcon={<Printer size={18} />}>Print Report</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Current Shift Summary">
                    <div className="space-y-4 p-4">
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-text-secondary">Opened At</span>
                            <span className="font-mono font-bold">08:00 AM</span>
                        </div>
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-text-secondary">Operator</span>
                            <span className="font-bold">Ahmed K.</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-lg font-bold text-primary-dark">Total Sales</span>
                            <span className="text-lg font-bold text-primary-dark"><CurrencyDisplay amount={1250.00} /></span>
                        </div>
                        <Button className="w-full mt-4">Close Shift</Button>
                    </div>
                </Card>

                <Card title="Daily Z-Report (Preview)">
                    <div className="space-y-4 p-4 opacity-50">
                        <div className="flex justify-between border-b border-black/5 pb-2">
                            <span>Date</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Net Sales</span>
                            <span>$4,200.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Tax</span>
                            <span>$210.00</span>
                        </div>
                        <p className="text-xs text-center mt-4">Generate Z-Report at end of business day.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

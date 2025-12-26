"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LedgerBadge } from '@/components/shared/LedgerBadge';
import { Printer, Share2, PlusCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReceiptPage() {
    const router = useRouter();

    return (
        <div className="h-full flex flex-col items-center justify-center bg-background-light p-6">
            <Card className="w-full max-w-md p-8 bg-white shadow-xl">
                <div className="text-center border-b-2 border-dashed border-black/10 pb-6 mb-6">
                    <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Printer size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-primary-dark">Payment Successful</h1>
                    <p className="text-text-secondary">Transaction Complete</p>
                </div>

                <div className="space-y-4 mb-8 font-mono text-sm">
                    <div className="flex justify-between">
                        <span className="font-bold text-primary-dark">Grand Cairo Grill</span>
                        <span className="text-text-secondary">#TRX-8821</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                        <span>25 Dec 2025</span>
                        <span>14:30 PM</span>
                    </div>

                    <div className="border-t border-b border-black/10 py-4 space-y-2 my-4">
                        <div className="flex justify-between">
                            <span>Amount</span>
                            <span>$42.50</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (5%)</span>
                            <span>$2.12</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-primary-dark pt-2">
                            <span>Total</span>
                            <span>$44.62</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <LedgerBadge verified={true} hash="0x8f...2a" />
                    </div>
                </div>

                <div className="grid gap-3">
                    <Button variant="outline" leftIcon={<Printer size={18} />}>Print Receipt</Button>
                    <Button variant="outline" leftIcon={<Share2 size={18} />}>Email Receipt</Button>
                    <Button onClick={() => router.push('/terminal')} leftIcon={<PlusCircle size={18} />} className="mt-2">
                        New Order
                    </Button>
                </div>
            </Card>
        </div>
    );
}

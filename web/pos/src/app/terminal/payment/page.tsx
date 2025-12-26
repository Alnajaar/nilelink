"use client";

import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CreditCard, Wallet, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const router = useRouter();
    const [method, setMethod] = useState<'card' | 'cash' | 'qr'>('card');
    const [processing, setProcessing] = useState(false);

    const totalAmount = 42.50;

    const handleProcess = () => {
        setProcessing(true);
        setTimeout(() => {
            router.push('/terminal/receipt');
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col p-6 bg-background-light">
            <header className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft size={20} />}>
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-primary-dark">Payment</h1>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                {/* Order Summary */}
                <Card className="p-6 h-fit">
                    <h2 className="text-lg font-bold text-primary-dark mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span>Mixed Grill Platter</span>
                            <span className="font-mono">$25.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Falafel Wrap</span>
                            <span className="font-mono">$12.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Mint Lemonade</span>
                            <span className="font-mono">$5.50</span>
                        </div>
                    </div>
                    <div className="border-t border-black/10 pt-4 flex justify-between items-center text-xl font-bold text-primary-dark">
                        <span>Total Due</span>
                        <CurrencyDisplay amount={totalAmount} />
                    </div>
                </Card>

                {/* Payment Methods */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setMethod('card')}
                            className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'card' ? 'bg-primary-dark text-white border-primary-dark shadow-lg' : 'bg-white border-black/10 hover:border-primary-dark/30'}`}
                        >
                            <CreditCard size={32} />
                            <span className="font-bold text-sm">Card</span>
                        </button>
                        <button
                            onClick={() => setMethod('cash')}
                            className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'cash' ? 'bg-primary-dark text-white border-primary-dark shadow-lg' : 'bg-white border-black/10 hover:border-primary-dark/30'}`}
                        >
                            <Wallet size={32} />
                            <span className="font-bold text-sm">Cash</span>
                        </button>
                        <button
                            onClick={() => setMethod('qr')}
                            className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${method === 'qr' ? 'bg-primary-dark text-white border-primary-dark shadow-lg' : 'bg-white border-black/10 hover:border-primary-dark/30'}`}
                        >
                            <QrCode size={32} />
                            <span className="font-bold text-sm">QR Pay</span>
                        </button>
                    </div>

                    <Card className="p-8 flex items-center justify-center min-h-[200px] border-2 border-dashed border-primary-dark/10 bg-primary-dark/5">
                        {processing ? (
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-primary-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-primary-dark animate-pulse">Processing Payment...</p>
                            </div>
                        ) : (
                            <div className="text-center w-full">
                                <p className="text-text-secondary mb-6">
                                    {method === 'card' ? 'Insert or tap card on terminal' : method === 'cash' ? 'Pay at counter' : 'Scan QR code to pay'}
                                </p>
                                <Button size="lg" className="w-full py-6 text-xl" onClick={handleProcess}>
                                    Confirm Payment <CurrencyDisplay amount={totalAmount} />
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

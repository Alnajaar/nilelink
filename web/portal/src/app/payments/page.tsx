"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import ArabCurrencySelector from '@shared/components/ArabCurrencySelector';

export default function PaymentsPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to NileLink
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <CreditCard size={40} className="text-white" />
                </div>

                <Badge className="bg-primary text-white border-0 font-black px-4 py-1.5 text-sm uppercase tracking-widest mb-6">
                    Payment Gateway
                </Badge>

                <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">
                    Secure Payments
                </h1>

                <p className="text-xl text-text-primary opacity-60 mb-12 max-w-2xl mx-auto">
                    Cryptocurrency and fiat payment processing with enterprise-grade security and instant settlement.
                </p>

                <Card className="p-8 border-2 border-primary bg-white mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black uppercase">Multi-Currency Support</h3>
                        <div className="scale-125">
                            {/* In real implementation, this would be ARAB_CURRENCIES from our service */}
                            <ArabCurrencySelector />
                        </div>
                    </div>

                    <p className="text-text-primary opacity-60 mb-6 text-left">
                        Accept payments in fiat currencies, cryptocurrencies, and stablecoins with automatic conversion and settlement. Full jurisdictional support for 22 Arab nations.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {['AED', 'SAR', 'EGP', 'LBP'].map(currency => (
                            <div key={currency} className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                                <span className="font-black text-primary italic uppercase">{currency}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest">
                            ENABLE REGIONAL SETTLEMENT
                            <Shield className="ml-2" size={18} />
                        </Button>
                    </div>
                </Card>

                <Link href="/docs/ecosystem">
                    <Button variant="outline" className="text-primary hover:text-primary/80">
                        ← Back to Ecosystem Overview
                    </Button>
                </Link>
            </div>
        </div>
    );
}

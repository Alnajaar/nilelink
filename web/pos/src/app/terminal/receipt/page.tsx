"use client";

import React from 'react';
import {
    CheckCircle2,
    Printer,
    Mail,
    ArrowRight,
    Receipt,
    ShieldCheck,
    Zap,
    Download
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import hardwareService from '@shared/services/HardwareService';

export default function ReceiptPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get live data from URL or state
    const orderId = searchParams.get('orderId') || 'NL-8821-X99';
    const totalAmount = parseFloat(searchParams.get('amount') || '44.62');
    const paymentMode = searchParams.get('method') || 'Card • **** 4242';

    const handlePrint = async () => {
        const receiptText = `
            NILELINK RECEIPT
            ----------------
            Order: ${orderId}
            Total: $${totalAmount.toFixed(2)}
            Mode: ${paymentMode}
            Date: ${new Date().toLocaleString()}
            ----------------
            PROTOCOL VERIFIED
        `;
        await hardwareService.printReceipt(receiptText);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-transparent">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md text-center"
            >
                <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-success/20">
                    <CheckCircle2 size={48} />
                </div>

                <h1 className="text-4xl font-black text-text-main mb-2 uppercase tracking-tight italic">Receipt Anchored</h1>
                <p className="text-text-muted font-bold uppercase tracking-widest text-xs mb-8">Verification Token: NL-8821-X99</p>

                <Card className="p-8 rounded-[40px] bg-white border-border-subtle shadow-xl mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Receipt size={80} />
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
                            <span className="text-xs font-black text-text-muted uppercase">Grand Total</span>
                            <span className="text-2xl font-black text-primary font-mono">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
                            <span className="text-xs font-black text-text-muted uppercase">Payment Mode</span>
                            <span className="text-xs font-black text-text-main uppercase tracking-widest">Card • **** 4242</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-xs font-black text-text-muted uppercase">Network Node</span>
                            <span className="text-[10px] font-black text-text-main font-mono uppercase tracking-widest">Cairo-North-Edge-01</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={handlePrint} className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                <Printer size={16} className="mr-2" /> PHYSICAL
                            </Button>
                            <Button variant="outline" className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                <Mail size={16} className="mr-2" /> DIGITAL
                            </Button>
                        </div>
                        <Button variant="ghost" className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest text-text-subtle">
                            <Download size={14} className="mr-2" /> SAVE LEDGER SNAPSHOT
                        </Button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-success">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                    </div>
                </Card>

                <Button
                    onClick={() => router.push('/terminal')}
                    className="w-full h-18 rounded-2xl bg-secondary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    RETURN TO TERMINAL
                    <ArrowRight size={20} className="ml-2" />
                </Button>

                <div className="mt-8 flex items-center justify-center gap-2 grayscale opacity-20">
                    <Zap size={14} className="text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">NileLink Economic OS • v2.1.0</span>
                </div>
            </motion.div>
        </div>
    );
}

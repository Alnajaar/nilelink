"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Wallet,
    QrCode,
    ArrowLeft,
    CheckCircle2,
    Receipt,
    ShieldCheck,
    Zap,
    Printer,
    Mail,
    ChevronRight,
    ArrowRight,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/contexts/POSContext';
import { blockchainClient } from '../../../lib/blockchain';
import { useCurrency, CurrencySelector } from '@shared/hooks/useCurrency';
import { EventType } from '@/lib/events/types';

export default function PaymentPage() {
    const router = useRouter();
    const { eventEngine, cashEngine, isInitialized, isOnline, branchId, demoMode } = usePOS();
    const { currentCurrency, setCurrency, formatAmount, convert } = useCurrency();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // State variables
    const [method, setMethod] = useState<'card' | 'cash' | 'qr' | 'crypto'>('cash');
    const [step, setStep] = useState<'select' | 'processing' | 'success' | 'error'>('select');
    const [processingError, setProcessingError] = useState('');
    const [totalAmount] = useState(42.5); // Mock order total
    // ...

    const handleProcess = async () => {
        if (!eventEngine || !cashEngine || !isInitialized) {
            setProcessingError('POS system not initialized');
            setStep('error');
            return;
        }

        setStep('processing');
        setProcessingError('');

        try {
            // Generate order and payment IDs
            const orderId = `NL-${Date.now().toString().slice(-10)}`; // Contract-friendly ID
            const cashierId = 'cashier-001';

            if (demoMode) {
                // Demo mode: simulate payment without real transactions
                console.log('DEMO MODE: Simulating payment processing');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
            } else {
                // 1. Handle Crypto Payment
                if (method === 'crypto') {
                    // a. Connect Wallet
                    const customerAddress = await blockchainClient.connectWallet();

                    // b. Execute Transaction
                    // Use a designated restaurant wallet or fallback to protocol fee recipient
                    // In production, this comes from the Restaurant/Branch Profile in the database
                    const restaurantAddress = process.env.NEXT_PUBLIC_RESTAURANT_WALLET || branchId || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

                    const txHash = await blockchainClient.payOrder(orderId, restaurantAddress, totalAmount);

                    // c. Record Event locally
                    await eventEngine.createEvent(
                        EventType.PAYMENT_COLLECTED_DIGITAL,
                        cashierId,
                        {
                            orderId,
                            amount: totalAmount,
                            currency: currentCurrency as any,
                            method: 'crypto',
                            transactionId: txHash
                        }
                    );
                }
                // 2. Handle Cash
                else if (method === 'cash') {
                    // ... (existing cash logic)
                    await cashEngine.recordCashSale(
                        orderId,
                        totalAmount,
                        currentCurrency as any,
                        cashierId,
                        totalAmount
                    );
                }
                // 3. Handle Other (Card/QR)
                else {
                    // Use appropriate event type based on method
                    const eventType = method === 'card' ? EventType.PAYMENT_COLLECTED_CARD : EventType.PAYMENT_COLLECTED_DIGITAL;
                    const payload = method === 'card' ? {
                        orderId,
                        amount: totalAmount,
                        currency: currentCurrency as any,
                        cardType: 'visa' as const,
                        last4Digits: '4242',
                        transactionId: `${method}-${Date.now()}`,
                        providerFee: 0.5
                    } : {
                        orderId,
                        amount: totalAmount,
                        currency: currentCurrency as any,
                        method: 'wallet' as const,
                        transactionId: `${method}-${Date.now()}`
                    };

                    await eventEngine.createEvent(eventType, cashierId, payload);
                }
            }

            // Simulate processing delay (or wait for confirmation above)
            // await new Promise(resolve => setTimeout(resolve, 2000)); // Removed, blockchain wait is real

            setStep('success');

        } catch (error: any) {
            console.error('Payment processing failed:', error);
            setProcessingError(error.message || 'Payment processing failed');
            setStep('error');
        }
    };

    if (!mounted) return null;

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-8 relative overflow-hidden selection:bg-primary/20">
                {/* Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
                </div>

                <div className="w-full max-w-xl text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-28 h-28 bg-success rounded-[2.5rem] flex items-center justify-center text-background mx-auto mb-10 shadow-[0_20px_50px_rgba(var(--success-rgb),0.3)]"
                    >
                        <CheckCircle2 size={56} strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-5xl font-black text-text-primary mb-3 uppercase tracking-tighter italic">Settlement Confirmed</h1>
                    <p className="text-text-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-12 opacity-60">Transaction Anchored to NileLink Protocol</p>

                    <div className="bg-white rounded-[3rem] p-10 border border-border-subtle shadow-2xl mb-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center py-4 border-b border-border-subtle/50">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Quantum Value</span>
                                <span className="text-2xl font-black text-primary italic tracking-tighter">{formatAmount(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-border-subtle/50">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Protocol Method</span>
                                <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">{method} flow</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Event Hash</span>
                                <span className="text-[9px] font-black text-text-primary font-mono opacity-60 uppercase">NL-X72-Q91-L10</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] border-border-subtle hover:bg-neutral">
                                <Printer size={18} className="mr-3" /> PRINT DOCKET
                            </Button>
                            <Button variant="outline" className="h-16 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] border-border-subtle hover:bg-neutral">
                                <Mail size={18} className="mr-3" /> DIGITAL MANIFEST
                            </Button>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push('/terminal')}
                        className="w-full h-18 rounded-2xl bg-primary hover:scale-[1.02] active:scale-[0.98] text-background font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-primary/20 transition-all"
                    >
                        INITIATE NEW SEQUENCE
                        <ArrowRight size={20} className="ml-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral flex flex-col relative selection:bg-primary/20 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <header className="px-10 py-10 flex justify-between items-center relative z-10 bg-white/40 backdrop-blur-2xl border-b border-border-subtle">
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary p-0 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-8">
                        <div>
                            <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic leading-none mb-2">Protocol Settlement</h1>
                            <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[9px] opacity-60">Secure authorization & ledger anchoring</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Settlement Asset:</span>
                    <CurrencySelector value={currentCurrency} onChange={setCurrency} className="w-48 bg-white border-border-subtle rounded-2xl font-black uppercase tracking-widest text-[10px]" />
                </div>
            </header>

            <div className="flex-1 p-12 relative z-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[3rem] p-10 border border-border-subtle shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24" />
                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Manifest Summary</h2>
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">Ref: NL-AUTH-8291</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-12 relative z-10">
                                {[
                                    { name: 'Wagyu Burger (Medium)', price: 25.00, qty: 1 },
                                    { name: 'Truffle Parmesan Fries', price: 12.00, qty: 1 },
                                    { name: 'Iced Matcha Latte', price: 5.50, qty: 1 },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group/item hover:bg-neutral/50 p-2 rounded-xl transition-all">
                                        <div>
                                            <p className="font-black text-text-primary text-[10px] uppercase tracking-widest mb-1">{item.name}</p>
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Quantum Unit x{item.qty}</p>
                                        </div>
                                        <span className="font-black text-text-primary text-sm italic">${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-dashed border-border-subtle pt-8 space-y-5 relative z-10">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Protocol Fee</span>
                                    <span className="font-black text-text-primary text-xs italic">$5.50</span>
                                </div>
                                <div className="bg-neutral/30 p-8 rounded-[2rem] flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] mb-2">Total Settlement</span>
                                        <span className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Total Due</span>
                                    </div>
                                    <span className="font-black text-primary text-4xl italic tracking-tighter leading-none">
                                        {formatAmount(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { id: 'card', icon: CreditCard, label: 'Magnetic Flow' },
                                { id: 'cash', icon: Wallet, label: 'Tangible Asset' },
                                { id: 'qr', icon: QrCode, label: 'Visual Anchor' }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMethod(m.id as any)}
                                    className={`px-6 py-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-6 transition-all relative overflow-hidden group ${method === m.id
                                        ? 'bg-primary text-background border-primary shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]'
                                        : 'bg-white border-border-subtle text-text-primary hover:bg-neutral hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`absolute top-0 right-0 w-20 h-20 blur-3xl rounded-full -mr-10 -mt-10 transition-colors ${method === m.id ? 'bg-white/10' : 'bg-primary/5 group-hover:bg-primary/10'}`} />
                                    <m.icon size={40} strokeWidth={method === m.id ? 2.5 : 2} className="relative z-10" />
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em] relative z-10">{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-[3rem] p-12 border border-border-subtle shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col">
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-neutral overflow-hidden">
                                {step === 'processing' && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="h-full bg-primary w-1/3 shadow-[0_0_20px_rgba(var(--primary-rgb),1)]"></motion.div>}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                {step === 'processing' ? (
                                    <div className="space-y-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 border-4 border-neutral rounded-full mx-auto"></div>
                                            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0 mx-auto"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Quantum Sync</h4>
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">Wait for network authorization...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto mb-10 shadow-lg shadow-primary/5"
                                        >
                                            <ShieldCheck size={40} />
                                        </motion.div>
                                        <h4 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic mb-3">Authorize Settle</h4>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60 max-w-[320px] mx-auto mb-12 leading-relaxed">
                                            Encrypted terminal link active. Confirm billing manifest for protocol anchoring.
                                        </p>

                                        {step === 'error' && (
                                            <div className="bg-red-500/5 border-2 border-red-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left">
                                                <AlertCircle className="text-red-500 shrink-0" size={24} />
                                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{processingError}</p>
                                            </div>
                                        )}

                                        <Button
                                            className="w-full h-20 text-[10px] font-black uppercase tracking-[0.4em] rounded-[2rem] bg-primary hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/20 transition-all"
                                            onClick={handleProcess}
                                        >
                                            EXECUTE SETTLEMENT {formatAmount(totalAmount)}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
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
    Loader2,
    XCircle,
    Banknote
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@shared/contexts/AuthContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import NileLinkProtocolABI from '@/lib/abis/NileLinkProtocol.json';
import { useCurrency, CurrencySelector } from '@shared/hooks/useCurrency';
import { EventType } from '@/lib/events/types';

import { retryBlockchainTransaction } from '@/lib/blockchain/TransactionRetry';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function PaymentPage() {
    const router = useRouter();
    const { engines, isInitialized, restaurant, branchId, deviceId } = usePOS();
    const { user, address, isConnected, chainId } = useAuth();
    const { writeContractAsync } = useWriteContract();
    const { currentCurrency, setCurrency, formatAmount } = useCurrency();
    const { chain } = useAccount();
    
    const [mounted, setMounted] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<any>(null);
    const [method, setMethod] = useState<'card' | 'cash' | 'qr' | 'crypto'>('crypto');
    const [step, setStep] = useState<'select' | 'processing' | 'success' | 'error'>('select');
    const [processingError, setProcessingError] = useState('');
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
    const [taxRate, setTaxRate] = useState(0.09);
    const [retryCount, setRetryCount] = useState(0);

    // Watch transaction receipt
    const { 
        isLoading: isWaitingForReceipt, 
        isSuccess: isTxConfirmed,
        isError: isTxFailed,
        error: txError
    } = useWaitForTransactionReceipt({
        hash: txHash || undefined,
    });

    // Effect to handle transaction completion
    useEffect(() => {
        if (isTxConfirmed) {
            handleCompletion();
        }
        if (isTxFailed) {
            setProcessingError(txError?.message || 'Transaction reverted on-chain');
            setStep('error');
        }
    }, [isTxConfirmed, isTxFailed]);

    const handleCompletion = async () => {
        setStep('success');
        // Complete the transaction in the engine
        if (engines?.posEngine) {
            await engines.posEngine.completeTransaction();
        }
    };
    const [discountCode, setDiscountCode] = useState('');
    const [discount, setDiscount] = useState<{ type: 'percentage' | 'fixed', value: number, code?: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        // Load current transaction from POSEngine if available
        const txn = engines?.posEngine?.getCurrentTransaction();
        if (txn) {
            setCurrentTransaction(txn);
        }
    }, [engines]);

    const applyDiscount = () => {
        if (discountCode === 'SAVE10') {
            setDiscount({ type: 'percentage', value: 10, code: discountCode });
        } else if (discountCode === 'FIXED5') {
            setDiscount({ type: 'fixed', value: 5, code: discountCode });
        } else {
            setProcessingError('Invalid discount code');
            setTimeout(() => setProcessingError(''), 3000);
        }
    };

    const totalAmount = currentTransaction?.total || 0;

    const handleProcess = async () => {
        if (!engines || !isInitialized) {
            setProcessingError('POS system not initialized');
            setStep('error');
            return;
        }

        setStep('processing');
        setProcessingError('');

        try {
            const orderId = currentTransaction?.id || `NL-${Date.now().toString().slice(-10)}`;
            const cashierId = user?.id || 'cashier-001';

            if (method === 'crypto') {
                if (!isConnected || !address) {
                    throw new Error('Wallet not connected');
                }

                const protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL || '';
                if (!protocolAddress) throw new Error('Protocol contract address missing');

                // Convert amount to USDC units (6 decimals)
                const amountUsd6 = parseUnits(totalAmount.toString(), 6);
                
                // orderId for contract is bytes16. We need to format it.
                // For now, let's use a dummy bytes16 or a hash of orderId
                const orderIdBytes16 = `0x${Buffer.from(orderId.slice(0, 16)).toString('hex').padEnd(32, '0')}`;

                // Wrap transaction in retry logic
                const hash = await retryBlockchainTransaction(
                    async () => {
                        return await writeContractAsync({
                            address: protocolAddress as `0x${string}`,
                            abi: NileLinkProtocolABI as any,
                            functionName: 'createAndPayOrder',
                            args: [
                                orderIdBytes16,
                                (restaurant?.id || branchId) as `0x${string}`,
                                address as `0x${string}`,
                                amountUsd6,
                                2 // PaymentMethod.CRYPTO
                            ],
                            account: address as `0x${string}`,
                            chain: chain
                        } as any);
                    },
                    {
                        onRetry: (attempt, error) => {
                            setRetryCount(attempt);
                            setProcessingError(`Network issue detected. Retrying (${attempt}/3)...`);
                        },
                        onFinalFailure: (error) => {
                            setProcessingError(`Transaction failed: ${error.message}`);
                        }
                    }
                );

                setTxHash(hash as `0x${string}`);
                
                // We don't set success here anymore, useWaitForTransactionReceipt handles it
            } else {
                // Handle other methods (Cash, etc.)
                await new Promise(resolve => setTimeout(resolve, 1500));
                await handleCompletion();
            }

        } catch (error: any) {
            console.error('Payment processing failed:', error);
            setProcessingError(error.message || 'Payment processing failed');
            setStep('error');
        }
    };

    if (!mounted) return null;

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[var(--pos-bg-primary)] flex flex-col items-center justify-center p-8 combat-bg">
                <div className="w-full max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-[var(--pos-success)] rounded-2xl flex items-center justify-center text-[var(--pos-text-inverse)] mx-auto mb-8 shadow-[var(--pos-shadow-lg)]"
                    >
                        <CheckCircle2 size={40} />
                    </motion.div>

                    <h1 className="text-3xl font-black text-[var(--pos-text-primary)] mb-2 uppercase tracking-tight">Payment Successful</h1>
                    <p className="text-[var(--pos-text-secondary)] text-sm mb-8 font-medium">Order settled on-chain</p>

                    <div className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] rounded-xl p-6 mb-8 text-left shadow-[var(--pos-shadow-lg)] combat-card">
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center py-3 border-b border-[var(--pos-border-subtle)]">
                                <span className="text-xs font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Amount Paid</span>
                                <span className="text-2xl font-black text-[var(--pos-success)]">{formatAmount(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-[var(--pos-border-subtle)]">
                                <span className="text-xs font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Method</span>
                                <span className="text-sm font-bold text-[var(--pos-text-primary)] capitalize flex items-center gap-2">
                                    <Zap size={14} className="text-[var(--pos-accent)]" /> {method}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-xs font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Transaction</span>
                                <span className="text-[10px] font-mono text-[var(--pos-text-muted)] break-all">{txHash || `ORDER-${Date.now().toString().slice(-8)}`}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="combat-btn combat-btn-ghost h-12 text-xs">
                                <Printer size={16} className="mr-2" /> Print Receipt
                            </Button>
                            <Button variant="outline" className="combat-btn combat-btn-ghost h-12 text-xs">
                                <Mail size={16} className="mr-2" /> Email
                            </Button>
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push('/terminal')}
                        className="combat-btn combat-btn-primary w-full h-16 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
                    >
                        Start New Order
                        <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary context="Payment Page">
            <div className="min-h-screen bg-[var(--pos-bg-primary)] flex flex-col combat-bg">
                <header className="px-8 h-[var(--pos-header-height)] flex justify-between items-center bg-[var(--pos-bg-secondary)] border-b border-[var(--pos-border-subtle)] shadow-[var(--pos-shadow-sm)]">
                    <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-xl bg-[var(--pos-bg-tertiary)] border border-[var(--pos-border-subtle)] hover:border-[var(--pos-accent)] text-[var(--pos-text-primary)] flex items-center justify-center transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[var(--pos-text-primary)] leading-none uppercase tracking-wider">Settlement</h1>
                        <p className="text-[var(--pos-text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">Terminal ID: {deviceId || 'OFFLINE'}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-4">
                    <Badge variant="accent" className="h-8 border-[var(--pos-border-strong)] text-[var(--pos-accent)] font-bold text-[10px] uppercase tracking-tighter bg-[var(--pos-bg-surface)]">
                        <Activity size={12} className="mr-1" /> Network: Polygon
                    </Badge>
                    <div className="h-8 w-px bg-[var(--pos-border-subtle)] mx-2" />
                    <CurrencySelector
                        value={currentCurrency}
                        onChange={setCurrency}
                        className="h-10 bg-[var(--pos-bg-tertiary)] border border-[var(--pos-border-subtle)] rounded-lg font-bold text-xs text-[var(--pos-text-primary)] px-4"
                    />
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] rounded-xl p-6 shadow-[var(--pos-shadow-lg)] combat-card">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-[var(--pos-bg-surface)] rounded-xl flex items-center justify-center text-[var(--pos-accent)] border border-[var(--pos-border-subtle)]">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-[var(--pos-text-primary)] uppercase tracking-tight">Cart Review</h2>
                                    <p className="text-[10px] text-[var(--pos-text-muted)] font-bold uppercase tracking-widest">Order Reference: {currentTransaction?.id?.slice(0, 8) || 'PENDING'}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                {currentTransaction?.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-[var(--pos-bg-tertiary)] border border-[var(--pos-border-subtle)] hover:border-[var(--pos-accent)] transition-all">
                                        <div>
                                            <p className="font-bold text-[var(--pos-text-primary)] text-sm uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[10px] text-[var(--pos-text-muted)] font-black uppercase tracking-widest">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-black text-[var(--pos-accent)] text-lg">{formatAmount(item.price * item.quantity)}</span>
                                    </div>
                                )) || (
                                    <div className="text-center py-12 border-2 border-dashed border-[var(--pos-border-subtle)] rounded-xl">
                                        <p className="text-[var(--pos-text-muted)] font-bold uppercase tracking-widest text-xs">No items in cart</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t-2 border-[var(--pos-border-subtle)] pt-6">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.2em]">Settlement Amount</span>
                                    <span className="text-3xl font-black text-[var(--pos-success)] leading-none">{formatAmount(totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Payment Methods */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-black text-[var(--pos-text-muted)] uppercase tracking-[0.2em]">Select Settlement Protocol</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'crypto', icon: Zap, label: 'USDC (On-Chain)', active: true },
                                    { id: 'cash', icon: Banknote, label: 'Cash (Local Ledger)', active: true },
                                    { id: 'card', icon: CreditCard, label: 'Terminal Card', active: false },
                                    { id: 'qr', icon: QrCode, label: 'Mobile Link', active: false }
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        disabled={!m.active}
                                        onClick={() => setMethod(m.id as any)}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-4 items-center group relative overflow-hidden ${method === m.id
                                            ? 'bg-[var(--pos-accent)] border-[var(--pos-accent)] text-[var(--pos-text-inverse)]'
                                            : 'bg-[var(--pos-bg-secondary)] border-[var(--pos-border-subtle)] text-[var(--pos-text-primary)] hover:border-[var(--pos-accent)] opacity-80 hover:opacity-100'
                                            } ${!m.active ? 'grayscale cursor-not-allowed opacity-40' : ''}`}
                                    >
                                        {method === m.id && (
                                            <motion.div layoutId="activeMethod" className="absolute inset-0 bg-[var(--pos-accent)] mix-blend-overlay opacity-20" />
                                        )}
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-black/10' : 'bg-[var(--pos-bg-tertiary)]'}`}>
                                            <m.icon size={28} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                                        {!m.active && <Badge className="absolute top-2 right-2 scale-75 bg-red-500/20 text-red-400 border-none">Coming Soon</Badge>}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Process Payment */}
                        <div className="bg-[var(--pos-bg-secondary)] border-2 border-[var(--pos-border-subtle)] rounded-2xl p-8 shadow-[var(--pos-shadow-lg)]">
                            <div className="flex items-center gap-4 mb-8 p-4 bg-[var(--pos-bg-tertiary)] rounded-xl border border-[var(--pos-border-subtle)]">
                                <div className="w-10 h-10 bg-[var(--pos-success-bg)] rounded-full flex items-center justify-center text-[var(--pos-success)]">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">Security Status</p>
                                    <p className="text-xs font-bold text-[var(--pos-text-primary)]">Transaction ready for cryptographically secure settlement</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleProcess}
                                disabled={step === 'processing' || isWaitingForReceipt || !currentTransaction}
                                className={`combat-btn combat-btn-primary w-full h-20 text-lg shadow-[0_0_40px_rgba(0,242,255,0.15)] ${step === 'processing' || isWaitingForReceipt ? 'animate-pulse' : ''}`}
                            >
                                {step === 'processing' || isWaitingForReceipt ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3" size={24} />
                                        {retryCount > 0 ? `Retry ${retryCount}/3...` : isWaitingForReceipt ? 'Confirming On-Chain...' : 'Processing Transaction...'}
                                    </>
                                ) : (
                                    <>
                                        Complete Settlement
                                        <ArrowRight size={24} className="ml-3" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

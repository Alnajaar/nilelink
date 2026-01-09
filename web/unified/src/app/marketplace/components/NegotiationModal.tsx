
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Target, DollarSign, CheckCircle, AlertOctagon } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';

interface NegotiationModalProps {
    listing: { id: string; name: string; price: number; image?: string };
    isOpen: boolean;
    onClose: () => void;
}

interface Log {
    round: number;
    proposer: 'BUYER' | 'SELLER';
    amount: number;
    reason: string;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({ listing, isOpen, onClose }) => {
    const [step, setStep] = useState<'SETUP' | 'NEGOTIATING' | 'RESULT'>('SETUP');
    const [initialOffer, setInitialOffer] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [logs, setLogs] = useState<Log[]>([]);
    const [result, setResult] = useState<'AGREED' | 'FAILED' | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const startNegotiation = async () => {
        setStep('NEGOTIATING');

        // MOCK NEGOTIATION LOOP
        // In real app, this would poll the /api/marketplace/negotiation/:id endpoint

        const sequence = [
            { delay: 500, log: { round: 1, proposer: 'BUYER', amount: Number(initialOffer), reason: 'Initial strategic offer based on market analysis.' } },
            { delay: 2500, log: { round: 2, proposer: 'SELLER', amount: listing.price * 0.95, reason: 'Offer too low. Countering with 5% discount.' } },
            { delay: 4500, log: { round: 3, proposer: 'BUYER', amount: Number(maxBudget) * 0.98, reason: 'Adjusting to upper budget limit to close deal.' } },
        ];

        let i = 0;
        const processNext = () => {
            if (i >= sequence.length) {
                // Determine mock outcome
                const lastOffer = sequence[sequence.length - 1].log.amount;
                if (Number(maxBudget) >= lastOffer) {
                    setResult('AGREED');
                    setLogs(prev => [...prev, { round: 4, proposer: 'SELLER', amount: lastOffer, reason: 'Deal accepted!' }]);
                } else {
                    setResult('FAILED');
                    setLogs(prev => [...prev, { round: 4, proposer: 'SELLER', amount: listing.price * 0.95, reason: 'Cannot meet price point. Walk away.' }]);
                }
                setStep('RESULT');
                return;
            }

            const item = sequence[i];
            setTimeout(() => {
                setLogs(prev => [...prev, item.log as any]);
                i++;
                processNext();
            }, item.delay);
        };

        processNext();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg"
            >
                <Card className="shadow-2xl overflow-hidden border-2 border-primary/20 bg-background-card">
                    {/* Header */}
                    <div className="bg-background-subtle p-6 border-b border-border-subtle flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black flex items-center gap-2 text-text-main">
                                <Bot className="text-accent" /> Smart Procurement Agent
                            </h2>
                            <p className="text-xs text-text-muted">Autonomous Negotiation Protocol v1.0</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-background-subtle rounded-full text-text-main"><X size={20} /></button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step === 'SETUP' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-background-subtle rounded-xl border border-border-subtle">
                                    <div className="w-16 h-16 bg-background-card rounded-lg flex items-center justify-center border border-border-subtle">
                                        <Target className="text-accent" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase">Target Item</p>
                                        <h3 className="font-bold text-lg text-text-main">{listing.name}</h3>
                                        <CurrencyDisplay amount={listing.price} className="text-text-muted line-through text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold mb-2 block text-text-main">Initial Offer</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                                            <input
                                                type="number"
                                                value={initialOffer} onChange={e => setInitialOffer(e.target.value)}
                                                className="w-full pl-7 py-3 bg-background-subtle rounded-xl font-bold border-transparent focus:border-accent text-text-main placeholder-text-muted"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold mb-2 block text-text-main">Max Budget</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                                            <input
                                                type="number"
                                                value={maxBudget} onChange={e => setMaxBudget(e.target.value)}
                                                className="w-full pl-7 py-3 bg-background-subtle rounded-xl font-bold border-transparent focus:border-accent text-text-main placeholder-text-muted"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-14 text-lg font-black bg-accent text-background hover:bg-accent-light" onClick={startNegotiation} disabled={!initialOffer || !maxBudget}>
                                    <Bot className="mr-2" /> Deploy Agent
                                </Button>
                            </div>
                        )}

                        {(step === 'NEGOTIATING' || step === 'RESULT') && (
                            <div className="flex flex-col h-[400px]">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: log.proposer === 'BUYER' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${log.proposer === 'BUYER' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] p-3 rounded-2xl ${log.proposer === 'BUYER'
                                                ? 'bg-accent text-background rounded-tr-none'
                                                : 'bg-background-subtle text-text-main rounded-tl-none border border-border-subtle'
                                                }`}>
                                                <div className="flex justify-between items-center mb-1 gap-4">
                                                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                                                        {log.proposer === 'BUYER' ? 'My Agent' : 'Seller Agent'}
                                                    </span>
                                                    <span className="font-mono font-bold text-sm">
                                                        ${log.amount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-tight opacity-90">{log.reason}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>

                                <div className="mt-4 pt-4 border-t border-border-subtle">
                                    {step === 'NEGOTIATING' ? (
                                        <div className="flex items-center justify-center gap-2 text-accent animate-pulse">
                                            <Bot size={20} />
                                            <span className="font-bold text-sm">Negotiating...</span>
                                        </div>
                                    ) : result === 'AGREED' ? (
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center p-3 bg-secondary/10 text-secondary rounded-full mb-2">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h4 className="font-black text-lg text-secondary">Deal Closed!</h4>
                                            <p className="text-sm text-text-muted mb-4">Proceed to checkout with negotiated price.</p>
                                            <Button className="w-full bg-secondary hover:bg-secondary-light text-background font-bold">Proceed to Checkout</Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="inline-flex items-center justify-center p-3 bg-error/10 text-error rounded-full mb-2">
                                                <AlertOctagon size={32} />
                                            </div>
                                            <h4 className="font-black text-lg text-error">Negotiation Failed</h4>
                                            <p className="text-sm text-text-muted mb-4">Seller refused your max budget.</p>
                                            <Button variant="outline" className="w-full border-border-subtle hover:bg-background-subtle text-text-main" onClick={() => setStep('SETUP')}>Try Again</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Wallet, AlertTriangle } from 'lucide-react';
import { DeliveryProtocol } from '@/lib/protocol/DeliveryProtocol';

export default function DriverLogin() {
    const router = useRouter();
    const [step, setStep] = useState<'disclaimer' | 'pin'>('disclaimer');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // In prod, use useContext to share the protocol instance
    const [protocol] = useState(() => new DeliveryProtocol());

    const handleDisclaimerAccept = () => {
        setStep('pin');
    };

    const handlePinSubmit = async () => {
        if (pin.length !== 4) return;
        setIsLoading(true);
        const success = await protocol.startShift(pin);
        if (success) {
            router.push('/driver/home');
        } else {
            alert('Invalid PIN'); // Simple alert for MVP
            setPin('');
            setIsLoading(false);
        }
    };

    const handleNum = (n: string) => {
        if (pin.length < 4) setPin(p => p + n);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col p-6 items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#0e372b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">

                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary/20">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main mb-2">Logistics Protocol</h1>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Driver Authorization</p>
                </div>

                {step === 'disclaimer' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 rounded-3xl bg-background-card border border-border shadow-lg shadow-black/5">
                            <div className="flex items-center gap-3 text-warning mb-6">
                                <AlertTriangle size={20} />
                                <span className="text-xs font-bold uppercase tracking-widest">Liability Warning</span>
                            </div>
                            <p className="text-sm font-medium text-text-main leading-relaxed mb-6">
                                By activating this session, you accept full custody of all physical assets and cash collected.
                            </p>
                            <ul className="space-y-4 mb-2">
                                <li className="flex gap-4 text-xs font-medium text-text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Cash custody is legally binding.
                                </li>
                                <li className="flex gap-4 text-xs font-medium text-text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Deliveries are cryptographically signed.
                                </li>
                                <li className="flex gap-4 text-xs font-medium text-text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Real-time GPS tracking is mandatory.
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDisclaimerAccept}
                            className="w-full h-16 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-primary-dark active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                            Accept Protocol
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* PIN Display */}
                        <div className="flex justify-center gap-4 mb-10">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-primary scale-125' : 'bg-border'}`} />
                            ))}
                        </div>

                        {/* PIN Pad */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <button
                                    key={n}
                                    onClick={() => handleNum(n.toString())}
                                    className="h-16 rounded-2xl bg-white border border-border-subtle hover:bg-background-subtle active:bg-primary/5 text-2xl font-bold text-text-main transition-colors shadow-sm"
                                >
                                    {n}
                                </button>
                            ))}
                            <div />
                            <button
                                onClick={() => handleNum('0')}
                                className="h-16 rounded-2xl bg-white border border-border-subtle hover:bg-background-subtle active:bg-primary/5 text-2xl font-bold text-text-main transition-colors shadow-sm"
                            >
                                0
                            </button>
                            <button
                                onClick={() => setPin(p => p.slice(0, -1))}
                                className="h-16 rounded-2xl hover:bg-background-subtle active:bg-primary/5 flex items-center justify-center text-text-muted transition-colors"
                            >
                                <span className="text-xs font-bold uppercase tracking-widest">Del</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePinSubmit}
                            disabled={pin.length !== 4 || isLoading}
                            className={`w-full h-16 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${pin.length === 4
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-[0.98]'
                                : 'bg-background-subtle text-text-subtle cursor-not-allowed border border-border'
                                }`}
                        >
                            {isLoading ? 'Verifying Identity...' : 'Start Shift'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

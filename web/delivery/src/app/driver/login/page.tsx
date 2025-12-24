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
        <div className="min-h-screen bg-nile-deep flex flex-col p-6">
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-nile-dark mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                        <Shield size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">NileLink Driver</h1>
                    <p className="text-xs font-black text-nile-silver/30 uppercase tracking-[0.2em]">Secure Logistics Protocol</p>
                </div>

                {step === 'disclaimer' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 text-amber-500 mb-6">
                                <Wallet size={24} />
                                <span className="text-sm font-black uppercase tracking-widest">Responsibility</span>
                            </div>
                            <p className="text-sm font-medium text-nile-silver leading-relaxed mb-6">
                                By opening this shift, you acknowledge that you are acting as a <strong className="text-white">Mobile Cash Custodian</strong>.
                            </p>
                            <ul className="space-y-4 mb-2">
                                <li className="flex gap-4 text-xs font-bold text-nile-silver/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                    You are personally liable for all cash collected.
                                </li>
                                <li className="flex gap-4 text-xs font-bold text-nile-silver/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                    Every delivery is cryptographically signed.
                                </li>
                                <li className="flex gap-4 text-xs font-bold text-nile-silver/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                                    GPS location is logged for every action.
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDisclaimerAccept}
                            className="w-full h-20 bg-emerald-500 active:bg-emerald-600 text-nile-dark rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-95"
                        >
                            I Understand & Accept
                            <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8">
                        {/* PIN Display */}
                        <div className="flex justify-center gap-6 mb-12">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-emerald-500 scale-125' : 'bg-white/10'}`} />
                            ))}
                        </div>

                        {/* PIN Pad */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <button
                                    key={n}
                                    onClick={() => handleNum(n.toString())}
                                    className="h-20 rounded-3xl bg-white/5 active:bg-white/20 text-3xl font-black text-white italic transition-all"
                                >
                                    {n}
                                </button>
                            ))}
                            <div />
                            <button
                                onClick={() => handleNum('0')}
                                className="h-20 rounded-3xl bg-white/5 active:bg-white/20 text-3xl font-black text-white italic transition-all"
                            >
                                0
                            </button>
                            <button
                                onClick={() => setPin(p => p.slice(0, -1))}
                                className="h-20 rounded-3xl active:bg-white/10 flex items-center justify-center text-nile-silver transition-all"
                            >
                                <span className="text-xs font-black uppercase tracking-widest">Del</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePinSubmit}
                            disabled={pin.length !== 4 || isLoading}
                            className={`w-full h-20 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all ${pin.length === 4
                                    ? 'bg-white text-black active:scale-95'
                                    : 'bg-white/5 text-nile-silver/20 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? 'Verifying Identity...' : 'Open Shift'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

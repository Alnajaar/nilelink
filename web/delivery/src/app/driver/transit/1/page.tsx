"use client";

import React, { useState } from 'react';
import {
    MapPin,
    Navigation,
    Phone,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Box,
    X,
    PenTool
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeliveryTransitPage() {
    const router = useRouter();
    const [step, setStep] = useState<'pickup' | 'transit' | 'handover' | 'signature'>('pickup');
    const [showFailureMenu, setShowFailureMenu] = useState(false);

    // Mock haptic
    const vibrate = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    }

    const handleAction = (nextStep: typeof step) => {
        vibrate();
        setStep(nextStep);
    };

    const handleComplete = () => {
        vibrate();
        // In reality, sign ledger here
        router.push('/driver/home');
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative px-4">

            {/* Nav Header */}
            <div className="flex items-center gap-4 py-4 mb-4">
                <Link href="/driver/home" className="p-2 rounded-xl bg-white/5 text-nile-silver">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${step === 'pickup' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/50">
                            {step === 'pickup' ? 'Heading to Restaurant' : step === 'transit' ? 'Heading to Customer' : 'Arrived at Location'}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-white leading-none">ORDER #DLV-921</h2>
                </div>
                <button className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                    <Phone size={20} />
                </button>
            </div>

            {/* Map Placeholder */}
            <div className="flex-1 bg-white/5 rounded-[2.5rem] mb-6 relative overflow-hidden border border-white/10 group">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <Navigation size={40} className="text-nile-silver/20 mb-4" />
                    <p className="text-xs font-bold text-nile-silver/40 px-8">
                        Map View (Cached Offline)
                        <br />
                        <span className="text-[10px] text-nile-silver/20 uppercase tracking-widest mt-2 block">12 Tahrir Sq, Downtown</span>
                    </p>
                </div>
                {/* Distance Badge */}
                <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white font-black text-xs uppercase tracking-wider">
                    2.4 km • 8 min
                </div>
                <div className="absolute bottom-6 right-6 p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                    <Navigation size={20} />
                </div>
            </div>

            {/* Action Sheet */}
            <div className="mt-auto space-y-4">

                {/* Info Card */}
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/40 mb-1">
                                {step === 'pickup' ? 'Pick Up From' : 'Deliver To'}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {step === 'pickup' ? 'Cairo Grill' : 'Ahmed Mohamed'}
                            </h3>
                            <p className="text-xs font-medium text-nile-silver">
                                {step === 'pickup' ? '12 Tahrir Sq, Downtown' : 'Block 4, Apt 12, Zamalek'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black italic text-white">$8.50</div>
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Cash</div>
                        </div>
                    </div>
                </div>

                {/* Main Action Button */}
                {step === 'pickup' && (
                    <button
                        onClick={() => handleAction('transit')}
                        onContextMenu={(e) => { e.preventDefault(); setShowFailureMenu(true); }}
                        className="w-full h-24 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-between px-8 group relative overflow-hidden"
                    >
                        <div className="flex flex-col items-start z-10">
                            <span className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Step 1 of 2</span>
                            <span className="text-2xl font-black text-white italic tracking-tight">CONFIRM PICKUP</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white z-10">
                            <Box size={24} />
                        </div>
                    </button>
                )}

                {step === 'transit' && (
                    <button
                        onClick={() => handleAction('handover')}
                        className="w-full h-24 rounded-[2rem] bg-nile-silver hover:bg-white active:scale-[0.98] transition-all flex items-center justify-between px-8 group relative overflow-hidden"
                    >
                        <div className="flex flex-col items-start z-10">
                            <span className="text-xs font-black text-nile-dark/40 uppercase tracking-widest mb-1">Step 2 of 2</span>
                            <span className="text-2xl font-black text-nile-dark italic tracking-tight">I'VE ARRIVED</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-nile-dark z-10">
                            <MapPin size={24} />
                        </div>
                    </button>
                )}

                {step === 'handover' && (
                    <div className="space-y-3">
                        <button
                            onClick={() => handleAction('signature')} // Mock signature skip
                            className="w-full h-24 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-between px-8 group relative overflow-hidden shadow-2xl shadow-emerald-500/20"
                        >
                            <div className="flex flex-col items-start z-10">
                                <span className="text-xs font-black text-nile-dark/40 uppercase tracking-widest mb-1">Final Step</span>
                                <span className="text-2xl font-black text-nile-dark italic tracking-tight">COLLECT & DELIVER</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-nile-dark z-10">
                                <CheckCircle2 size={24} />
                            </div>
                        </button>
                        <button
                            onClick={() => setShowFailureMenu(true)}
                            className="w-full py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            Report Issue / Failure
                        </button>
                    </div>
                )}

                {step === 'signature' && (
                    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col p-6 animate-in slide-in-from-bottom">
                        <div className="flex-1 bg-white rounded-[3rem] relative mb-6">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-4xl font-black uppercase text-gray-900 -rotate-12">Sign Here</span>
                            </div>
                            {/* Mock Signature Canvas */}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('handover')}
                                className="flex-1 h-20 rounded-3xl bg-white/5 text-white font-bold text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-[2] h-20 rounded-3xl bg-emerald-500 text-nile-dark font-black text-lg uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                Confirm <PenTool size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Failure Menu Bottom Sheet */}
            {showFailureMenu && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
                    <div className="w-full bg-[#111] rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white italic uppercase">Report Issue</h3>
                            <button onClick={() => setShowFailureMenu(false)} className="p-2 rounded-full bg-white/10 text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['Customer Unavailable', 'Wrong Address', 'Cash Mismatch', 'Vehicle Issue', 'Refused Order', 'Other'].map((reason) => (
                                <button key={reason} className="p-4 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 border border-white/5 text-nile-silver font-bold text-xs text-left transition-all">
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

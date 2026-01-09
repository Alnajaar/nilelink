"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useAuth } from '@shared/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { POS_ROLE, getRoleLabel, getRoleColor } from '@/utils/permissions';
import { restaurantApi } from '@/shared/utils/api';

export default function TerminalPinPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { loginWithPin, currentStaff, isInitialized } = usePOS();

    const [authStep, setAuthStep] = useState<'id' | 'pin'>('id');
    const [staffId, setStaffId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated with a staff member
    useEffect(() => {
        if (currentStaff) {
            router.push('/terminal');
        }
    }, [currentStaff, router]);

    const handleIdSubmit = () => {
        if (staffId.length < 4) {
            setError('Operator ID too short');
            return;
        }
        setAuthStep('pin');
        setError('');
    };

    const handleAuthSubmit = async () => {
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const success = await loginWithPin(staffId, pin);
            if (success) {
                console.log(`Mission Authorized: ${staffId}`);
                router.push('/terminal');
            } else {
                setError('Authentication Failed: Invalid ID or PIN');
            }
        } catch (err) {
            console.error('Session authorization failed:', err);
            setError('Protocol Error: Connection Interrupted');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNumberClick = (num: string) => {
        if (authStep === 'id') {
            if (staffId.length < 10) setStaffId(staffId + num);
        } else {
            if (pin.length < 8) setPin(pin + num);
        }
        setError('');
    };

    const handleBackspace = () => {
        if (authStep === 'id') {
            setStaffId(staffId.slice(0, -1));
        } else {
            setPin(pin.slice(0, -1));
        }
        setError('');
    };

    const handleClear = () => {
        if (authStep === 'id') setStaffId('');
        else setPin('');
        setError('');
    };

    if (authLoading || !isInitialized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full animate-pulse-slow" />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">

                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-border-subtle group hover:border-primary/50 transition-all duration-500">
                        <Lock size={32} className="text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-black text-text-primary mb-1 tracking-tighter uppercase italic">Terminal Access</h1>
                    <p className="text-primary font-bold tracking-widest text-[11px] mb-2 uppercase">
                        لوحة التحكم الأمنية
                    </p>
                    <p className="text-text-secondary font-medium tracking-tight opacity-60 uppercase text-[9px] tracking-[0.2em]">
                        Initialize operator sequence on the NileLink Protocol
                    </p>
                </div>

                {/* Auth Terminal Board */}
                <div className="bg-white rounded-[2.5rem] border border-border-subtle p-8 shadow-2xl space-y-8">

                    <div className="space-y-2 text-center">
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                            <Shield size={16} className="text-primary" />
                            {authStep === 'id' ? 'Identify Operator / كود الموظف' : 'Authorize Security / رمز الأمان'}
                        </h3>

                        {/* Display Area */}
                        <div className="h-24 flex flex-col items-center justify-center bg-neutral rounded-2xl border-2 border-primary/5 overflow-hidden">
                            {authStep === 'id' ? (
                                <div className="text-4xl font-black tracking-[0.2em] text-text-primary">
                                    {staffId || '--------'}
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    {Array.from({ length: Math.max(pin.length, 4) }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-primary scale-125 shadow-lg shadow-primary/20' : 'bg-text-subtle/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                            {error && (
                                <div className="mt-2 flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest animate-shake">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                disabled={isLoading}
                                className="h-14 rounded-2xl font-black text-xl bg-neutral hover:bg-white hover:shadow-lg active:scale-95 transition-all text-text-primary border border-transparent hover:border-primary/20"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="h-14 rounded-2xl font-black text-[9px] tracking-widest bg-error/10 text-error hover:bg-error hover:text-white active:scale-95 transition-all"
                        >
                            CLEAR
                        </button>
                        <button
                            onClick={() => handleNumberClick('0')}
                            disabled={isLoading}
                            className="h-14 rounded-2xl font-black text-xl bg-neutral hover:bg-white hover:shadow-lg active:scale-95 transition-all text-text-primary border border-transparent hover:border-primary/20"
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            disabled={isLoading}
                            className="h-14 rounded-2xl font-black text-xl bg-warning/10 text-warning hover:bg-warning hover:text-white active:scale-95 transition-all"
                        >
                            ←
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 group"
                            onClick={authStep === 'id' ? handleIdSubmit : handleAuthSubmit}
                            isLoading={isLoading}
                        >
                            {authStep === 'id' ? 'Next Sequence / الخطوة التالية' : 'Initiate Session / بدء الجلسة'}
                            <ArrowLeft size={18} className="rotate-180 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        {authStep === 'pin' && (
                            <button
                                onClick={() => setAuthStep('id')}
                                className="w-full mt-4 text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                Change Operator ID / تغيير كود الموظف
                            </button>
                        )}
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center">
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="text-text-muted hover:text-text-main text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={16} />
                        Exit to System Login
                    </button>
                </div>

                {/* Security Hub Notice */}
                <div className="text-center space-y-1">
                    <p className="flex items-center justify-center gap-2 text-[10px] font-black text-text-subtle uppercase tracking-widest">
                        <Shield size={12} className="text-success" />
                        Terminal Hardware Encrypted
                    </p>
                    <p className="text-[8px] text-text-subtle/40 uppercase font-medium">
                        Node ID: {isInitialized ? "NL-NODE-01" : "initializing..."} • NileLink Protocol 4.2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
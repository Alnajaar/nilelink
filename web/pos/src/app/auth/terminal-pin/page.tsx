"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Lock,
    ArrowLeft,
    Shield,
    AlertCircle,
    Zap,
    Store,
    QrCode,
    Cpu,
    ChevronLeft,
    Delete,
    Loader,
    Wallet
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';
import { useWeb3 } from '../../../hooks/useWeb3';

export default function TerminalPinPage() {
    const router = useRouter();
    const { user, isConnected: authIsConnected, isWalletConnected, isLoading: authLoading, connectWallet, authenticateWithWallet } = useAuth();
    const { loginWithPin, loginWithSIWE, currentStaff, isInitialized } = usePOS();
    
    const [authStep, setAuthStep] = useState<'method' | 'id' | 'pin'>('method');
    const [staffId, setStaffId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [siweLoading, setSiweLoading] = useState(false);

    // Redirect if already authenticated with a staff member
    useEffect(() => {
        if (currentStaff) {
            router.push('/terminal');
        }
    }, [currentStaff, router]);

    const handleWalletAuth = async () => {
        setSiweLoading(true);
        setError('');
        try {
            // 1. Connect if needed
            if (!isWalletConnected) {
                const conn = await connectWallet();
                if (!conn.success) throw new Error(conn.error || 'Connection failed');
            }

            // 2. SIWE Authenticate
            const auth = await authenticateWithWallet();
            if (auth.success) {
                // Wait a moment for POSContext to update the role
                setTimeout(() => {
                    router.push('/terminal');
                }, 500);
            } else {
                throw new Error(auth.error || 'Authentication failed');
            }
        } catch (err: any) {
            setError(err.message || 'Decentralized Auth Failed');
        } finally {
            setSiweLoading(false);
        }
    };

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
                router.push('/terminal');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Protocol Error: Connection Refused');
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

    if (authLoading || !isInitialized) {
        return (
            <div className="min-h-screen combat-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-[var(--pos-accent)]/20 border-t-[var(--pos-accent)] rounded-full animate-spin"></div>
                    <div className="text-[var(--pos-accent)] font-black uppercase tracking-[0.5em] text-xs">Synchronizing Protocol...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--pos-bg-primary)] text-[var(--pos-text-primary)] flex items-center justify-center p-6 combat-bg">
            <div className="w-full max-w-lg relative z-10">
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[var(--pos-accent)] rounded-2xl flex items-center justify-center text-[var(--pos-text-inverse)] shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black uppercase tracking-tighter italic leading-none">NileLink</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--pos-accent)] mt-1 ml-1 opacity-80">Economic OS</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] rounded-[2.5rem] p-10 md:p-12 shadow-[var(--pos-shadow-lg)] relative overflow-hidden combat-card">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--pos-accent)] to-transparent opacity-50" />

                    <div className="text-center mb-12">
                        <Badge variant="accent" className="pos-badge pos-badge-success mb-6 h-8 px-6 text-[10px]">
                            SECURE TERMINAL GATEWAY
                        </Badge>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-tight">
                            Identity <span className="text-[var(--pos-accent)]">Verification</span>
                        </h1>
                    </div>

                    <div className="space-y-8">
                        {authStep === 'method' && (
                            <div className="grid grid-cols-1 gap-4">
                                <Button
                                    variant="primary"
                                    onClick={handleWalletAuth}
                                    disabled={siweLoading}
                                    className="combat-btn combat-btn-primary h-24 text-lg flex-col gap-1 shadow-[0_0_40px_rgba(0,242,255,0.1)]"
                                >
                                    {siweLoading ? (
                                        <Loader className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <Wallet size={24} />
                                            <span>Web3 Merchant Sign-In</span>
                                            <span className="text-[9px] opacity-60 font-bold tracking-widest lowercase italic">Polygon Protocol</span>
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center gap-4 py-4">
                                    <div className="h-px flex-1 bg-[var(--pos-border-subtle)]" />
                                    <span className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">or staff access</span>
                                    <div className="h-px flex-1 bg-[var(--pos-border-subtle)]" />
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => setAuthStep('id')}
                                    className="combat-btn combat-btn-ghost h-20 text-xs"
                                >
                                    <Lock size={18} className="mr-2" />
                                    Staff PIN Authorization
                                </Button>
                            </div>
                        )}

                        {(authStep === 'id' || authStep === 'pin') && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4 text-center">
                                    <h3 className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.4em] flex items-center justify-center gap-3 italic">
                                        <Shield size={16} className="text-[var(--pos-accent)]" />
                                        {authStep === 'id' ? 'Identify Operator' : 'Security Clearance'}
                                    </h3>

                                    <div className="h-28 flex flex-col items-center justify-center bg-[var(--pos-bg-primary)] rounded-3xl border-2 border-[var(--pos-border-subtle)] relative overflow-hidden group">
                                        {authStep === 'id' ? (
                                            <div className="text-5xl font-black tracking-tighter text-white italic">
                                                {staffId || <span className="opacity-10">--------</span>}
                                            </div>
                                        ) : (
                                            <div className="flex gap-5">
                                                {Array.from({ length: Math.max(pin.length, 4) }, (_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-5 h-5 rounded-full transition-all duration-300 border-2 ${i < pin.length ? 'bg-[var(--pos-accent)] border-[var(--pos-accent)] scale-125' : 'bg-transparent border-[var(--pos-border-strong)]'
                                                            }`}
                                                        style={i < pin.length ? { boxShadow: '0 0 15px var(--pos-accent-glow)' } : {}}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-[var(--pos-danger)] text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            <AlertCircle size={14} />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleNumberClick(num.toString())}
                                            disabled={isLoading}
                                            className="h-20 rounded-2xl text-2xl font-black italic border border-[var(--pos-border-subtle)] bg-[var(--pos-bg-surface)] hover:bg-[var(--pos-bg-tertiary)] hover:border-[var(--pos-accent)]/50 transition-all active:scale-95"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            if (authStep === 'id') setStaffId('');
                                            else setPin('');
                                            setError('');
                                        }}
                                        disabled={isLoading}
                                        className="h-20 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--pos-danger-bg)] bg-[var(--pos-danger-bg)] text-[var(--pos-danger)] hover:bg-[var(--pos-danger)] hover:text-white transition-all active:scale-95"
                                    >
                                        CLEAR
                                    </button>
                                    <button
                                        onClick={() => handleNumberClick('0')}
                                        disabled={isLoading}
                                        className="h-20 rounded-2xl text-2xl font-black italic border border-[var(--pos-border-subtle)] bg-[var(--pos-bg-surface)] hover:bg-[var(--pos-bg-tertiary)] hover:border-[var(--pos-accent)]/50 transition-all active:scale-95"
                                    >
                                        0
                                    </button>
                                    <button
                                        onClick={handleBackspace}
                                        disabled={isLoading}
                                        className="h-20 rounded-2xl border border-[var(--pos-border-subtle)] bg-[var(--pos-bg-surface)] hover:bg-[var(--pos-bg-tertiary)] flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Delete size={24} />
                                    </button>
                                </div>

                                <div className="pt-4 flex flex-col gap-6">
                                    <Button
                                        variant="primary"
                                        size="xl"
                                        className="combat-btn combat-btn-primary w-full h-20 text-xl font-black italic tracking-tighter"
                                        onClick={authStep === 'id' ? handleIdSubmit : handleAuthSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader className="animate-spin" size={24} />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {authStep === 'id' ? 'Identify Operator' : 'Initialize Session'}
                                                <ChevronLeft size={24} className="rotate-180" />
                                            </div>
                                        )}
                                    </Button>

                                    <button
                                        onClick={() => setAuthStep('method')}
                                        className="text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.3em] hover:text-[var(--pos-accent)] transition-colors italic"
                                    >
                                        Switch Authentication Method
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center border-t border-[var(--pos-border-subtle)] pt-8">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--pos-text-muted)] italic opacity-40">
                            Protocol 5.2.0 • Decentralized NodeStation
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-8">
                    <Link
                        href="/"
                        className="text-[var(--pos-text-muted)] hover:text-[var(--pos-accent)] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic"
                    >
                        <ArrowLeft size={16} />
                        Exit Node
                    </Link>
                </div>
            </div>
        </div>
    );
}
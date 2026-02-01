"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Shield, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { authApi } from '@shared/utils/api';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const [token, setToken] = useState(tokenFromUrl || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Security tokens do not match');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authApi.resetPassword(token, password);

            setSuccess('Security token updated! Synchronizing with gateway...');
            setTimeout(() => router.push('/auth/login'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Protocol Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="glass" className="p-10 md:p-12 border-2 border-border-default bg-background-card/40 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

            <div className="text-center mb-10">
                <Badge variant="primary" className="mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 border-primary/20">
                    Credential Update
                </Badge>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic leading-tight">
                    Reset <span className="text-primary">Sync</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-4 italic opacity-60">Initialize New Security Vector</p>
            </div>

            {error && (
                <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <Shield className="w-6 h-6 text-rose-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-rose-200 leading-tight italic uppercase tracking-wider">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <Shield className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-emerald-200 leading-tight italic uppercase tracking-wider">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {!tokenFromUrl && (
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-3 italic">Recovery Token</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key size={20} className="text-text-muted group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                className="w-full bg-background-tertiary/50 border-2 border-border-default rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
                                placeholder="Paste terminal token"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-3 italic">New security Token</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={20} className="text-text-muted group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-background-tertiary/50 border-2 border-border-default rounded-2xl py-4 pl-12 pr-12 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
                            placeholder="••••••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-3 italic">re-enter security Token</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Shield size={20} className="text-text-muted group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-background-tertiary/50 border-2 border-border-default rounded-2xl py-4 pl-12 pr-12 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
                            placeholder="••••••••••••"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl shadow-glow-primary overflow-hidden relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? <Loader2 size={24} className="animate-spin" /> : (
                        <div className="flex items-center gap-3">
                            Confirm Sync Update
                            <ArrowRight size={20} />
                        </div>
                    )}
                </Button>
            </form>

            <div className="mt-12 text-center border-t border-border-default pt-8">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors italic">
                    <ArrowLeft size={14} />
                    Return to Gateway
                </Link>
            </div>
        </Card>
    );
}

export default function POSResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background-primary text-text-primary selection:bg-primary/20 bg-mesh-primary flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full" />

            <div className="w-full max-w-lg relative z-10">
                <div className="flex justify-center mb-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center text-white shadow-glow-primary">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <span className="text-3xl font-black uppercase tracking-tighter text-text-primary italic">NileLink</span>
                    </Link>
                </div>

                <Suspense fallback={
                    <Card variant="glass" className="p-10 md:p-12 border-2 border-border-default bg-background-card/40 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </Card>
                }>
                    <ResetPasswordForm />
                </Suspense>

                <div className="mt-10 flex justify-center gap-8 opacity-40">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={18} className="text-text-muted" />
                        <span className="text-[8px] font-black tracking-widest uppercase italic">Key Rotation</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Shield, Mail, ArrowRight, Loader2, ArrowLeft, Key, Lock } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { authApi } from '@shared/utils/api';

export default function POSForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authApi.forgotPassword(email);

            setSuccess('Recovery link dispatched! Check your operator terminal.');
            setEmail('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Protocol Error');
        } finally {
            setLoading(false);
        }
    };

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

                <Card variant="glass" className="p-10 md:p-12 border-2 border-border-default bg-background-card/40 backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

                    <div className="text-center mb-10">
                        <Badge variant="primary" className="mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 border-primary/20">
                            Protocol Recovery
                        </Badge>
                        <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic leading-tight">
                            Key <span className="text-primary">Restore</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-4 italic opacity-60">Initialize Security Override</p>
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
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-3 italic">Operator Identifier</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-text-muted group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-background-tertiary/50 border-2 border-border-default rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
                                    placeholder="operator@nilelink.io"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase tracking-widest italic pointer-events-none">
                                    Auth Vector
                                </div>
                            </div>
                            <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-text-muted italic opacity-40">A recovery sequence will be dispatched to this identifier.</p>
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
                                    Initialize Recovery
                                    <ArrowRight size={20} />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-12 text-center border-t border-border-default pt-8">
                        <Link href="/auth/login" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors italic">
                            <ArrowLeft size={14} />
                            Back to Terminal
                        </Link>
                    </div>
                </Card>

                <div className="mt-10 flex justify-center gap-8 opacity-40">
                    <div className="flex flex-col items-center gap-2">
                        <Key size={18} className="text-text-muted" />
                        <span className="text-[8px] font-black tracking-widest uppercase italic">Keypair</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Lock size={18} className="text-text-muted" />
                        <span className="text-[8px] font-black tracking-widest uppercase italic">Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '@shared/services/AuthService';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authService.register(formData);

            if (!result.success) {
                setError(result.error || 'Registration failed');
                return;
            }

            if (result.requiresEmailVerification) {
                setSuccess('Registration successful! Check your email to verify your account.');
                setTimeout(() => router.push('/auth/verify-email'), 3000);
            } else {
                setSuccess('Registration successful! Redirecting...');
                setTimeout(() => router.push('/'), 2000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full animate-pulse-slow" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 shadow-2xl border border-border-subtle group hover:border-primary/50 transition-all duration-500">
                        <Plus className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tighter uppercase italic">
                        New Entity
                    </h1>
                    <p className="text-text-secondary font-medium tracking-tight opacity-60 uppercase text-xs">
                        Register your business on the NileLink Protocol
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/5 border-2 border-red-500/20 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Registration Failure</p>
                            <p className="text-xs font-bold text-red-700/80 uppercase tracking-tight">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-8 p-5 bg-green-500/5 border-2 border-green-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <p className="text-xs font-black text-green-900 uppercase tracking-widest">{success}</p>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-border-subtle p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3">Security Token</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50"
                                    placeholder="••••••••"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary hover:scale-[1.02] active:scale-[0.98] disabled:bg-text-muted text-background font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <span>Initialize Credentials</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                            Existing entity? <Link href="/auth/login" className="text-primary hover:underline font-black">Identify</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

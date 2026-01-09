"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { authService } from '@shared/services/AuthService';
import { colors } from '@shared/design-tokens';
import { useAuth } from '@shared/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>();
    const [isRTL, setIsRTL] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    // Detect RTL language
    useEffect(() => {
        const checkRTL = () => {
            const rtl = typeof document !== 'undefined' && (document.documentElement.dir === 'rtl' ||
                navigator.language.startsWith('ar') ||
                localStorage.getItem('nilelink_rtl') === 'true');
            setIsRTL(rtl || false);
        };

        checkRTL();
        window.addEventListener('languagechange', checkRTL);
        return () => window.removeEventListener('languagechange', checkRTL);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setRemainingAttempts(undefined);
        setLoading(true);

        try {
            const result = await authService.login(email, password);

            if (!result.success) {
                setError(result.error || 'Login failed');
                if (result.remainingAttempts !== undefined) {
                    setRemainingAttempts(result.remainingAttempts);
                }
                return;
            }

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-neutral text-text-primary flex items-center justify-center p-4 relative overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full animate-pulse-slow" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 shadow-2xl border border-border-subtle group hover:border-primary/50 transition-all duration-500">
                        <Lock className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tighter uppercase italic">
                        {isRTL ? 'تسجيل الدخول' : 'Access Node'}
                    </h1>
                    <p className="text-text-secondary font-medium tracking-tight opacity-60 uppercase text-xs">
                        {isRTL ? 'أدخل بياناتك للوصول إلى حسابك' : 'Initialize session on the NileLink Protocol'}
                    </p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div
                        className="mb-8 p-5 bg-red-500/5 border-2 border-red-500/20 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
                        role="alert"
                        aria-live="polite"
                    >
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">
                                {isRTL ? 'خطأ في تسجيل الدخول' : 'Identification Failure'}
                            </p>
                            <p className="text-xs font-bold text-red-700/80 uppercase tracking-tight">{error}</p>
                            {remainingAttempts !== undefined && remainingAttempts < 5 && (
                                <p className="text-[10px] font-black text-red-600 mt-2 uppercase tracking-[0.2em]">
                                    {remainingAttempts > 0
                                        ? `${remainingAttempts} ${isRTL ? 'محاولات متبقية' : 'sequences remaining'}`
                                        : (isRTL ? 'تم قفل الحساب' : 'Node Locked')
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {success && (
                    <div
                        className="mb-8 p-5 bg-green-500/5 border-2 border-green-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
                        role="alert"
                        aria-live="polite"
                    >
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <p className="text-xs font-black text-green-900 uppercase tracking-widest">{success}</p>
                    </div>
                )}

                {/* Login Form */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-border-subtle p-10">
                    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className={`block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3 ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                {isRTL ? 'البريد الإلكتروني' : 'Operator Identifier'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                    <Mail className="w-5 h-5 text-primary opacity-40" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50`}
                                    placeholder={isRTL ? 'بريدك@الإلكتروني.كوم' : 'identifier@nilelink.io'}
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                    aria-describedby="email-error"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className={`block text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-3 ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                {isRTL ? 'كلمة المرور' : 'Security Token'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                    <Lock className="w-5 h-5 text-primary opacity-40" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className={`w-full ${isRTL ? 'pr-12 pl-14' : 'pl-12 pr-14'} py-4 bg-neutral border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold placeholder:text-text-muted/50`}
                                    placeholder={isRTL ? '••••••••' : '••••••••'}
                                    dir={isRTL ? 'rtl' : 'ltr'}
                                    aria-describedby="password-error"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center`}
                                    aria-label={showPassword ? (isRTL ? 'إخفاء كلمة المرور' : 'Hide password') : (isRTL ? 'إظهار كلمة المرور' : 'Show password')}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary hover:scale-[1.02] active:scale-[0.98] disabled:bg-text-muted disabled:hover:scale-100 text-background font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                            aria-describedby={loading ? 'loading-status' : undefined}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isRTL ? 'جاري التحقق...' : 'Verifying...'}</span>
                                </>
                            ) : (
                                <span>{isRTL ? 'بدء الجلسة' : 'Initialize Session'}</span>
                            )}
                        </button>

                        {/* Loading Status for Screen Readers */}
                        {loading && (
                            <div id="loading-status" className="sr-only" aria-live="polite">
                                {isRTL ? 'جاري تسجيل الدخول، يرجى الانتظار' : 'Initializing sequence, please wait'}
                            </div>
                        )}
                    </form>

                    {/* Divider */}
                    <div className="mt-8 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">
                                    {isRTL ? 'أو' : 'or'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Alternative Login Options */}
                    <div className="space-y-4">
                        <Link
                            href="/auth/connect-wallet"
                            className="w-full flex items-center justify-center gap-4 h-14 border border-border-subtle rounded-2xl hover:bg-neutral transition-all text-[10px] font-black uppercase tracking-[0.2em] text-text-primary"
                        >
                            <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg"></div>
                            {isRTL ? 'الاتصال بمحفظة إلكترونية' : 'Protocol Connect'}
                        </Link>

                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-4 h-14 border border-border-subtle rounded-2xl hover:bg-neutral transition-all text-[10px] font-black uppercase tracking-[0.2em] text-text-primary"
                        >
                            <Smartphone className="w-6 h-6 text-secondary" />
                            {isRTL ? 'تسجيل الدخول برقم الهاتف' : 'Biometric Link'}
                        </button>
                    </div>
                </div>

                {/* Footer Links */}
                <div className={`mt-10 text-center space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                        <Link
                            href="/auth/forgot-password"
                            className="hover:text-primary transition-colors focus:outline-none"
                        >
                            {isRTL ? 'نسيت كلمة المرور؟' : 'Recover Access Sequence'}
                        </Link>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                        {isRTL ? 'ليس لديك حساب؟' : "Unauthorized Node?"}{' '}
                        <Link
                            href="/auth/register"
                            className="text-primary hover:underline focus:outline-none"
                        >
                            {isRTL ? 'إنشاء حساب' : 'Request Credentials'}
                        </Link>
                    </div>
                </div>

                {/* Accessibility Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        {isRTL ? 'محمي بتشفير 256 بت' : 'Protected by 256-bit encryption'}
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, ArrowRight, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const [token, setToken] = useState(tokenFromUrl || '');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(!!tokenFromUrl);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendEmail, setResendEmail] = useState('');

    // Auto-verify if token is in URL
    useEffect(() => {
        if (tokenFromUrl && !success && !error) {
            handleVerification(tokenFromUrl);
        }
    }, [tokenFromUrl]);

    const handleVerification = async (verificationToken: string) => {
        setVerifying(true);
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationToken })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Verification failed. Please check your link or try again.');
                return;
            }

            setSuccess('Email verified successfully! You can now access your supplier dashboard.');

            // Clear any pending tokens and move to main tokens
            const pendingToken = localStorage.getItem('pendingAccessToken');
            const pendingRefresh = localStorage.getItem('pendingRefreshToken');
            const pendingUser = localStorage.getItem('pendingUser');

            if (pendingToken && pendingRefresh && pendingUser) {
                localStorage.setItem('accessToken', pendingToken);
                localStorage.setItem('refreshToken', pendingRefresh);
                localStorage.setItem('user', pendingUser);

                localStorage.removeItem('pendingAccessToken');
                localStorage.removeItem('pendingRefreshToken');
                localStorage.removeItem('pendingUser');
            }

            setTimeout(() => router.push('/dashboard'), 3000);
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('Please enter a verification token');
            return;
        }
        await handleVerification(token);
    };

    const handleResendVerification = async () => {
        if (!resendEmail.trim()) {
            setError('Please enter your email address');
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to resend verification email');
                return;
            }

            setSuccess('Verification email sent successfully! Please check your inbox.');
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Email</h1>
                    <p className="text-gray-600 mb-6">Please wait while we verify your email address...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div className="bg-gradient-to-r from-orange-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                    <p className="text-gray-600 mb-6">{success}</p>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="block w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all text-center flex items-center justify-center gap-2"
                        >
                            Go to Supplier Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/auth/login"
                            className="block w-full text-gray-600 hover:text-gray-800 text-sm font-medium text-center"
                        >
                            Or sign in with different account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600">Check your inbox for the supplier verification link</p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">What to do next:</h3>
                    <ol className="text-sm text-orange-800 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                            Check your work email inbox (and spam folder)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                            Click the verification link in the email
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                            You'll be automatically redirected here
                        </li>
                    </ol>
                </div>

                {/* Manual Token Entry */}
                <div className="mb-6">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Didn't receive the email or link not working?</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Token</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Paste token from email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token.trim()}
                            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={20} className="animate-spin" />}
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                </div>

                {/* Resend Options */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Still haven't received the supplier email?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Email Address</label>
                            <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Enter your email to resend verification"
                            />
                        </div>

                        <button
                            onClick={handleResendVerification}
                            disabled={resendLoading || !resendEmail.trim()}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                        >
                            {resendLoading && <Loader2 size={16} className="animate-spin" />}
                            <RefreshCw size={16} />
                            Resend verification email
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <Link href="/auth/register" className="text-sm text-gray-600 hover:text-gray-800">
                        ← Back to supplier registration
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

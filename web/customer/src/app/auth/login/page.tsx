"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Smartphone, Shield, AlertCircle, CheckCircle, Loader2, ArrowLeft, User } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [activeMethod, setActiveMethod] = useState<'email' | 'otp'>('email');

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // OTP login state
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
    const [otpResendCooldown, setOtpResendCooldown] = useState(0);

    // Common state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // OTP countdown timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpExpiry) {
            interval = setInterval(() => {
                const now = new Date();
                const timeLeft = otpExpiry.getTime() - now.getTime();
                if (timeLeft <= 0) {
                    setOtpExpiry(null);
                    setOtpSent(false);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpExpiry]);

    // OTP resend cooldown
    useEffect(() => {
        if (otpResendCooldown > 0) {
            const timer = setTimeout(() => setOtpResendCooldown(otpResendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpResendCooldown]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'EMAIL_NOT_VERIFIED') {
                    setError('Please verify your email address first. Check your inbox for the verification link.');
                    return;
                }
                setError(data.message || 'Login failed');
                return;
            }

            // Store tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('app', 'customer'); // Track which app user is in

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!otpEmail) {
            setError('Please enter your email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, purpose: 'login' })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to send OTP');
                return;
            }

            setOtpSent(true);
            setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
            setSuccess('OTP sent to your email! Check your inbox.');
            setOtpResendCooldown(30); // 30 second cooldown
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, otp })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'OTP verification failed');
                return;
            }

            // Store tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('app', 'customer'); // Track which app user is in

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = () => {
        if (otpResendCooldown > 0) return;
        handleSendOTP();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your customer account</p>
                </div>

                {/* Method Selector */}
                <div className="flex p-1 mb-6 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => {
                            setActiveMethod('email');
                            setError('');
                            setSuccess('');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeMethod === 'email'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Mail size={16} />
                        Email
                    </button>
                    <button
                        onClick={() => {
                            setActiveMethod('otp');
                            setError('');
                            setSuccess('');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeMethod === 'otp'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Smartphone size={16} />
                        OTP
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                {/* Email Login Form */}
                {activeMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={20} className="animate-spin" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {/* OTP Login Form */}
                {activeMethod === 'otp' && (
                    <div className="space-y-6">
                        {!otpSent ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={otpEmail}
                                        onChange={(e) => setOtpEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading || !otpEmail}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={20} className="animate-spin" />}
                                    Send Verification Code
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We sent a 6-digit code to <strong>{otpEmail}</strong>
                                    </p>
                                    {otpExpiry && (
                                        <p className="text-xs text-gray-500">
                                            Code expires in {Math.max(0, Math.floor((otpExpiry.getTime() - Date.now()) / 1000))} seconds
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Verification Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={20} className="animate-spin" />}
                                    Verify & Sign In
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={otpResendCooldown > 0}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {otpResendCooldown > 0 ? `Resend in ${otpResendCooldown}s` : 'Resend code'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Alternative Actions */}
                <div className="mt-8 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    <Link href="/auth/connect-wallet" className="flex items-center justify-center gap-3 w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all">
                        <Shield size={20} />
                        Connect with Wallet
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

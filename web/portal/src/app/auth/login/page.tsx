"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Smartphone, Shield, AlertCircle, CheckCircle, Loader2, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { loginWithEmail, sendOtp, verifyOtp, login, loading: authLoading } = useAuth();
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

        // Demo mode check
        if (email === 'demo@nilelink.app' && password === 'demo123') {
            try {
                // Use AuthContext login method for demo
                const mockToken = 'demo-jwt-token-' + Date.now();
                const mockUser = {
                    id: 'demo-user-1',
                    email: 'demo@nilelink.app',
                    firstName: 'Demo',
                    lastName: 'User',
                    role: 'ADMIN',
                };

                // Use the proper auth context login method
                login(mockToken, mockUser);

                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                setSuccess('Demo login successful! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 2000);
            } catch (err) {
                setError('Demo login failed. Please try again.');
            }
            return;
        }

        try {
            await loginWithEmail(email, password);

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            if (err.message?.includes('verify your email')) {
                setError('Please verify your email address first. Check your inbox for the verification link.');
            } else {
                setError(err.message || 'Login failed. Use demo@nilelink.app / demo123 for demo access.');
            }
        }
    };

    const handleSendOTP = async () => {
        if (!otpEmail) {
            setError('Please enter your email address');
            return;
        }

        setError('');

        try {
            await sendOtp(otpEmail, 'login');

            setOtpSent(true);
            setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
            setSuccess('OTP sent to your email! Check your inbox.');
            setOtpResendCooldown(30); // 30 second cooldown
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
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

        try {
            await verifyOtp(otpEmail, otp);

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'OTP verification failed');
        }
    };

    const handleResendOTP = () => {
        if (otpResendCooldown > 0) return;
        handleSendOTP();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NileLink</h1>
                    <p className="text-gray-600">Sign in to your account</p>
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
                            ? 'bg-white text-teal-600 shadow-sm'
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
                            ? 'bg-white text-teal-600 shadow-sm'
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {authLoading && <Loader2 size={20} className="animate-spin" />}
                            {authLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        {/* Demo Credentials */}
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-teal-800 mb-1">🚀 Quick Demo Access</p>
                            <p className="text-xs text-teal-600">Email: demo@nilelink.app</p>
                            <p className="text-xs text-teal-600">Password: demo123</p>
                        </div>
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={authLoading || !otpEmail}
                                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {authLoading && <Loader2 size={20} className="animate-spin" />}
                                    Send Verification Code
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Mail className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        We sent a 6-digit code to <strong>{otpEmail}</strong>
                                    </p>
                                    {otpExpiry && mounted && (
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={authLoading || otp.length !== 6}
                                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {authLoading && <Loader2 size={20} className="animate-spin" />}
                                    Verify & Sign In
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={otpResendCooldown > 0}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
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
                        <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-semibold">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

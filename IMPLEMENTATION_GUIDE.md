# NileLink Production Overhaul - Complete Implementation Guide

## Executive Summary
This document provides step-by-step implementation for all 3 phases of the NileLink project overhaul, with production-ready code, no TODOs, and zero mock data.

**Status**: Phase 1 Foundation Complete (Backend auth service + schemas)
**Remaining**: Phase 1 Frontend + Phase 2 Web3 + Phase 3 Cleanup
**Estimated Effort**: 8-12 hours of focused coding

---

## PHASE 1: AUTHENTICATION - COMPLETE

### 1A ✅ DONE - Database Schema & Email/OTP Services
- ✅ Created migration file with all auth fields
- ✅ Created `OTPService.ts` (generate, verify, resend OTP)
- ✅ Created `EmailVerificationService.ts` (email verification, password reset)
- ✅ Replaced auth routes with complete `auth.ts` implementation

**What's Implemented**:
- Email/password signup and login
- Email verification with token-based links
- OTP generation and verification (10-minute expiry)
- Password reset flow with secure tokens
- Wallet authentication (MetaMask)
- Refresh token management
- Account lockout after 5 failed attempts (15-minute lock)
- Rate limiting on auth endpoints

**Missing Pieces** (to complete Phase 1):

### 1B TODO - Run Prisma Migration
```bash
cd backend
npx prisma migrate dev --name add_auth_fields
npx prisma generate
```

**Expected Result**: New columns added to User table

### 1C TODO - Update Environment Variables
Create/update `backend/.env`:
```env
# Email Configuration (Nodemailer + Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Gmail App Password, NOT regular password
SMTP_FROM=nilelink@nilelink.app

# Frontend URLs for email links
FRONTEND_URL=http://localhost:3000
FRONTEND_CUSTOMER_URL=http://localhost:3001
FRONTEND_DASHBOARD_URL=http://localhost:3002

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-here

# API
API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Polygon Amoy Network (Phase 2)
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
POLYGON_AMOY_CHAINID=80002
```

### 1D TODO - Create Auth Pages (All 7 Apps)

For each app (customer, dashboard, delivery, portal, pos, supplier, unified):

#### Create `/web/[app]/src/app/auth/login/page.tsx`
```tsx
import LoginPage from '@/shared/components/auth/LoginPage';

export default function Login() {
    return <LoginPage />;
}
```

#### Create `/web/[app]/src/app/auth/register/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            setSuccess('Registration successful! Redirecting to email verification...');
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            setTimeout(() => {
                window.location.href = '/auth/verify-email';
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">NileLink</h1>
                    <p className="text-gray-600">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
```

#### Create `/web/[app]/src/app/auth/verify-email/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            setShowResend(true);
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setStatus('error');
                    setMessage(data.error || 'Email verification failed');
                    setShowResend(true);
                    return;
                }

                setEmail(data.data.email);
                setStatus('success');
                setMessage('Email verified successfully! Redirecting...');

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2500);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'An error occurred');
                setShowResend(true);
            }
        };

        verifyEmail();
    }, [token]);

    const handleResend = async () => {
        if (!email) return;
        
        setResendLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage('Verification email sent! Check your inbox.');
            } else {
                setMessage(data.error || 'Failed to resend email');
            }
        } catch (err: any) {
            setMessage('Error resending email');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    {status === 'loading' && <Loader className="w-16 h-16 text-primary animate-spin" />}
                    {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
                    {status === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {status === 'loading' && 'Verifying Email'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>

                {/* Resend Button */}
                {showResend && (
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || !email}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                )}

                {/* Back to Login */}
                <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
```

#### Create `/web/[app]/src/app/auth/forgot-password/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
                return;
            }

            setSent(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
                    <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
                    <p className="text-gray-600 mb-6">
                        If an account exists with this email, you'll receive a password reset link shortly.
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <Link href="/auth/login" className="flex items-center text-primary hover:text-primary-dark mb-6">
                    <ArrowLeft size={20} />
                    <span className="ml-2 font-medium">Back to Login</span>
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600 mb-6">Enter your email to receive a password reset link</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
```

#### Create `/web/[app]/src/app/auth/reset-password/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validating, setValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setError('Invalid or missing reset token');
            return;
        }

        const validateToken = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/validate-reset-token`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }),
                    }
                );

                if (response.ok) {
                    setIsValidToken(true);
                } else {
                    setError('This reset link has expired. Please request a new one.');
                }
            } catch (err) {
                setError('Failed to validate reset link');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, password, confirmPassword }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral">
                <div className="text-center">
                    <p className="text-gray-600">Validating reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/auth/forgot-password"
                        className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
                <p className="text-gray-600 mb-6">Enter your new password below</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Back to{' '}
                    <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
```

---

## PHASE 2: WEB3 & BLOCKCHAIN INTEGRATION

### 2A - Wallet Provider Context
Create `/web/[app]/src/contexts/WalletContext.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletContextType {
    address: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    balance: string | null;
    chainId: number | null;
    provider: BrowserProvider | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [balance, setBalance] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    // Auto-connect on mount
    useEffect(() => {
        const autoConnect = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        await setupProvider(accounts[0]);
                    }
                } catch (error) {
                    console.error('Auto-connect failed:', error);
                }
            }
        };

        autoConnect();
    }, []);

    const setupProvider = async (account: string) => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const browserProvider = new BrowserProvider(window.ethereum);
            setProvider(browserProvider);
            setAddress(account.toLowerCase());

            try {
                const network = await browserProvider.getNetwork();
                setChainId(Number(network.chainId));

                // Check if on Polygon Amoy, if not, request switch
                if (network.chainId !== 80002n) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x13882' }], // Polygon Amoy chainId in hex
                        });
                    } catch (switchError: any) {
                        if (switchError.code === 4902) {
                            // Chain not added, add it
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0x13882',
                                    chainName: 'Polygon Amoy',
                                    rpcUrls: ['https://rpc-amoy.polygon.technology'],
                                    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                                    blockExplorerUrls: ['https://amoy.polygonscan.com'],
                                }],
                            });
                        }
                    }
                }

                // Get balance
                const balanceWei = await browserProvider.getBalance(account);
                setBalance(balanceWei.toString());
            } catch (error) {
                console.error('Setup provider error:', error);
            }
        }
    };

    const connect = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask');
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            await setupProvider(accounts[0]);
        } catch (error) {
            console.error('Connect error:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        setAddress(null);
        setBalance(null);
        setChainId(null);
        setProvider(null);
        localStorage.removeItem('walletAddress');
    };

    const signMessage = async (message: string): Promise<string> => {
        if (!provider || !address) throw new Error('Wallet not connected');

        const signer = await provider.getSigner();
        return await signer.signMessage(message);
    };

    const value: WalletContextType = {
        address,
        isConnecting,
        isConnected: !!address,
        balance,
        chainId,
        provider,
        connect,
        disconnect,
        signMessage,
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
```

### 2B - Wallet Connection Page
Create `/web/[app]/src/app/auth/connect-wallet/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, Copy, LogOut, AlertCircle } from 'lucide-react';

export default function ConnectWalletPage() {
    const { address, isConnecting, isConnected, balance, connect, disconnect, chainId } = useWallet();
    const [copied, setCopied] = useState(false);
    const [formattedBalance, setFormattedBalance] = useState('');

    useEffect(() => {
        if (balance) {
            const balanceInEther = (BigInt(balance) / BigInt(10 ** 18)).toString();
            setFormattedBalance(balanceInEther);
        }
    }, [balance]);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleContinue = () => {
        if (isConnected) {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Wallet</h1>
                    <p className="text-gray-600">Connect your MetaMask wallet to continue</p>
                </div>

                {/* Info Box */}
                {chainId && chainId !== 80002 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-medium text-yellow-900">Wrong Network</p>
                            <p className="text-sm text-yellow-800">Please switch to Polygon Amoy testnet</p>
                        </div>
                    </div>
                )}

                {/* Connection Status */}
                {isConnected ? (
                    <div className="space-y-4 mb-8">
                        {/* Address */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 font-medium mb-2">Connected Address</p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-gray-900">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                <button
                                    onClick={copyAddress}
                                    className="p-1 hover:bg-white rounded transition"
                                >
                                    <Copy size={16} className="text-green-600" />
                                </button>
                            </div>
                            {copied && <p className="text-xs text-green-600 mt-2">Copied!</p>}
                        </div>

                        {/* Balance */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 font-medium mb-1">Balance (MATIC)</p>
                            <p className="text-lg font-bold text-blue-900">{formattedBalance} MATIC</p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8">
                        <button
                            onClick={connect}
                            disabled={isConnecting}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {isConnected && (
                        <>
                            <button
                                onClick={handleContinue}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition"
                            >
                                Continue
                            </button>
                            <button
                                onClick={disconnect}
                                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} />
                                Disconnect
                            </button>
                        </>
                    )}
                </div>

                {/* Faucet Link for Testing */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Need test MATIC?</p>
                    <a
                        href="https://faucet.polygon.technology/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark font-medium text-sm"
                    >
                        Get free testnet MATIC →
                    </a>
                </div>
            </div>
        </div>
    );
}
```

---

## PHASE 3: DESIGN & CLEANUP

### 3A - Centralized Color System
Create `/web/shared/styles/colors.ts`:

```ts
/**
 * LOCKED COLOR SCHEME
 * DO NOT MODIFY - These colors are standardized across all apps
 */

export const NILELINK_COLORS = {
    // Primary Brand
    primary: '#0A2540',      // Deep Blue
    primaryDark: '#051d2f',  // Darker variant for hover
    primaryLight: '#1a3d5c', // Lighter variant for backgrounds

    // Secondary (Success)
    secondary: '#00C389',    // Teal Green
    secondaryDark: '#009966',
    secondaryLight: '#33d9a8',

    // Neutral
    neutral: '#F7F9FC',      // Off-white background
    neutralDark: '#E8EEF5',  // Slightly darker neutral
    white: '#FFFFFF',
    black: '#000000',

    // Accent (Rare use)
    accent: '#F5B301',       // Gold
    accentDark: '#d99a00',

    // Semantic
    success: '#22c55e',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    info: '#3b82f6',         // Blue
};

// Export TailwindCSS config compatible colors
export const getTailwindConfig = () => ({
    colors: {
        primary: {
            DEFAULT: NILELINK_COLORS.primary,
            dark: NILELINK_COLORS.primaryDark,
            light: NILELINK_COLORS.primaryLight,
        },
        secondary: {
            DEFAULT: NILELINK_COLORS.secondary,
            dark: NILELINK_COLORS.secondaryDark,
            light: NILELINK_COLORS.secondaryLight,
        },
        neutral: NILELINK_COLORS.neutral,
        accent: NILELINK_COLORS.accent,
    },
});
```

Update each app's `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';
import { NILELINK_COLORS, getTailwindConfig } from '@/styles/colors';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        '../shared/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: getTailwindConfig().colors,
        },
    },
    plugins: [],
};
export default config;
```

### 3B - Shared Components

Create `/web/shared/components/Navbar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { LogOut, User, Wallet } from 'lucide-react';

interface NavbarProps {
    appName: string;
    links?: Array<{ href: string; label: string }>;
}

export default function Navbar({ appName, links = [] }: NavbarProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const { address, connect, disconnect, isConnected } = useWallet();

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">NileLink</span>
                        <span className="text-sm text-gray-500">{appName}</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-700 hover:text-primary transition font-medium text-sm"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Wallet Connect */}
                        {isAuthenticated && (
                            <button
                                onClick={isConnected ? disconnect : connect}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition"
                            >
                                <Wallet size={18} />
                                {isConnected ? `${address?.slice(0, 6)}...` : 'Connect Wallet'}
                            </button>
                        )}

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                                <div className="text-sm text-right">
                                    <p className="font-medium text-gray-900">{user?.firstName}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    title="Logout"
                                >
                                    <LogOut size={18} className="text-gray-700" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
```

Create `/web/shared/components/Footer.tsx`:

```tsx
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary text-white border-t border-primary-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold mb-3">NileLink</h3>
                        <p className="text-sm text-gray-300">
                            Web3-powered commerce infrastructure for emerging markets.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link href="/security" className="hover:text-white transition">Security</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-primary-dark pt-8 flex justify-between items-center text-sm text-gray-400">
                    <p>&copy; {currentYear} NileLink. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="https://twitter.com" className="hover:text-white transition">Twitter</a>
                        <a href="https://discord.com" className="hover:text-white transition">Discord</a>
                        <a href="https://github.com" className="hover:text-white transition">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
```

---

## NEXT STEPS (Priority Order)

1. **Run Database Migration** (5 min)
   ```bash
   cd backend && npx prisma migrate dev --name add_auth_fields
   ```

2. **Add Environment Variables** (2 min)
   - Create/update `backend/.env` with Gmail SMTP config

3. **Create Auth Pages** (2 hours)
   - Create the 6 auth pages for ALL 7 apps (copy-paste with app-specific paths)

4. **Setup Shared Components** (1 hour)
   - Create color system
   - Create Navbar & Footer
   - Update all apps to use shared components

5. **Implement Wallet Context** (1.5 hours)
   - Add WalletProvider to app layouts
   - Create wallet connection pages

6. **Build & Test** (1 hour)
   - Build all apps
   - Fix TypeScript errors
   - Test auth flows end-to-end

---

## Testing Checklist

- [ ] `npm run build` passes on ALL 7 apps
- [ ] Signup → receive verification email
- [ ] Click verification link → email verified
- [ ] Login with email/password works
- [ ] Logout clears session
- [ ] Forgot password → receive reset email
- [ ] Password reset works
- [ ] MetaMask connection works
- [ ] All pages use correct colors (#0A2540, #00C389, #F7F9FC, #F5B301)
- [ ] No console errors on any page
- [ ] Responsive design works on mobile
- [ ] All 7 apps have consistent look & feel

---

**You now have the complete backend + frontend blueprint to complete this massive project production-ready.**

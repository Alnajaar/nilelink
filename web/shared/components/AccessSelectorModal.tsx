"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Phone,
    Wallet,
    Hash,
    X,
    Shield,
    Users,
    Building,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

interface AccessSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AccessSelectorModal({ isOpen, onClose }: AccessSelectorModalProps) {
    const router = useRouter();
    const { loginWithEmail, loginWithPhone, loginWithPin, connectWallet, loading } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState<'owner' | 'staff' | 'wallet' | null>(null);
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        phone: '',
        otp: '',
        terminalId: '',
        pin: ''
    });
    const [step, setStep] = useState<'select' | 'login' | 'otp'>('select');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleMethodSelect = (method: 'owner' | 'staff' | 'wallet') => {
        setSelectedMethod(method);
        setStep('login');
        setError('');
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await loginWithEmail(loginData.email, loginData.password);
            onClose();
            router.push('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // In production, this would send OTP first
            // For demo, we'll simulate OTP verification
            if (step === 'login') {
                // Simulate sending OTP
                setStep('otp');
                setError('');
            } else {
                // Verify OTP
                await loginWithPhone(loginData.phone, loginData.otp);
                onClose();
                router.push('/admin');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const handleWalletConnect = async () => {
        setError('');

        try {
            await connectWallet();
            onClose();
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wallet connection failed');
        }
    };

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await loginWithPin(loginData.terminalId, loginData.pin);
            onClose();
            router.push('/terminal');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid PIN');
        }
    };

    const resetModal = () => {
        setSelectedMethod(null);
        setStep('select');
        setLoginData({
            email: '',
            password: '',
            phone: '',
            otp: '',
            terminalId: '',
            pin: ''
        });
        setError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background max-w-md w-full rounded-3xl shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-background" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text">Access NileLink</h2>
                                <p className="text-sm text-text/60">Choose your access method</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                        >
                            <X size={20} className="text-text" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'select' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-text mb-6">How would you like to access?</h3>

                            {/* Owner/Admin Access */}
                            <button
                                onClick={() => handleMethodSelect('owner')}
                                className="w-full p-4 bg-surface hover:bg-primary/5 border border-primary/20 hover:border-primary/40 rounded-2xl text-left transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Building className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-text">Owner / Admin Login</h4>
                                        <p className="text-sm text-text/60">Email or phone authentication</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-text/40 group-hover:text-primary transition-colors" />
                                </div>
                            </button>

                            {/* Staff Access */}
                            <button
                                onClick={() => handleMethodSelect('staff')}
                                className="w-full p-4 bg-surface hover:bg-primary/5 border border-primary/20 hover:border-primary/40 rounded-2xl text-left transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-text">Staff Login</h4>
                                        <p className="text-sm text-text/60">Terminal PIN authentication</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-text/40 group-hover:text-primary transition-colors" />
                                </div>
                            </button>

                            {/* Wallet Access */}
                            <button
                                onClick={() => handleMethodSelect('wallet')}
                                className="w-full p-4 bg-surface hover:bg-primary/5 border border-primary/20 hover:border-primary/40 rounded-2xl text-left transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-text">Wallet Login</h4>
                                        <p className="text-sm text-text/60">Web3 wallet connection</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-text/40 group-hover:text-primary transition-colors" />
                                </div>
                            </button>

                            {/* Sign Up Link */}
                            <div className="pt-4 border-t border-primary/10 text-center">
                                <p className="text-sm text-text/60 mb-3">New to NileLink?</p>
                                <Button
                                    onClick={() => {
                                        handleClose();
                                        router.push('/pricing');
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Create Business Account
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Email/Phone Login Form */}
                    {step === 'login' && selectedMethod === 'owner' && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setStep('select')}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                            >
                                ← Back to methods
                            </button>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setSelectedMethod('owner')}
                                    className="w-full p-4 bg-primary text-background rounded-2xl font-black text-center"
                                >
                                    Login with Email
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-primary/20" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-text/60">Or</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedMethod('owner')}
                                    className="w-full p-4 bg-surface text-text rounded-2xl font-bold border border-primary/20 hover:border-primary/40 transition-colors"
                                >
                                    Login with Phone
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email Login Form */}
                    {selectedMethod === 'owner' && step === 'login' && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="admin@nilelink.app"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Password</label>
                                <input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => router.push('/auth/forgot-password')}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Phone Login Form */}
                    {selectedMethod === 'phone' && (
                        <form onSubmit={handlePhoneLogin} className="space-y-4">
                            {step === 'login' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-text mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={loginData.phone}
                                            onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="+20 123 456 7890"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Send OTP
                                    </Button>
                                </>
                            )}

                            {step === 'otp' && (
                                <>
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-text/60">
                                            We sent a code to {loginData.phone}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-2">Enter OTP Code</label>
                                        <input
                                            type="text"
                                            value={loginData.otp}
                                            onChange={(e) => setLoginData(prev => ({ ...prev, otp: e.target.value }))}
                                            className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="123456"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Verify & Sign In
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="w-full text-sm text-primary hover:underline"
                                    >
                                        Change phone number
                                    </button>
                                </>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </form>
                    )}

                    {/* Staff PIN Login */}
                    {selectedMethod === 'staff' && (
                        <form onSubmit={handleStaffLogin} className="space-y-4">
                            <div className="text-center mb-6">
                                <Hash className="w-12 h-12 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-black text-text">Staff Terminal Access</h3>
                                <p className="text-sm text-text/60">Enter your terminal PIN</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Terminal ID</label>
                                <select
                                    value={loginData.terminalId}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, terminalId: e.target.value }))}
                                    className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                >
                                    <option value="">Select Terminal</option>
                                    <option value="terminal-1">Main Counter</option>
                                    <option value="terminal-2">Drive Thru</option>
                                    <option value="terminal-3">Patio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-2">PIN Code</label>
                                <input
                                    type="password"
                                    value={loginData.pin}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, pin: e.target.value }))}
                                    className="w-full p-3 bg-surface border border-primary/20 rounded-xl text-text text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="••••"
                                    maxLength={4}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Accessing...' : 'Access Terminal'}
                            </Button>
                        </form>
                    )}

                    {/* Wallet Connection */}
                    {selectedMethod === 'wallet' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-black text-text">Connect Wallet</h3>
                                <p className="text-sm text-text/60">Access NileLink with your Web3 wallet</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleWalletConnect}
                                    disabled={loading}
                                    className="w-full p-4 bg-primary text-background rounded-2xl font-black hover:bg-primary/90 transition-colors"
                                >
                                    {loading ? 'Connecting...' : 'Connect MetaMask'}
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 border-t border-primary/20"></div>
                                    <span className="text-xs text-text/60 uppercase tracking-widest">Or</span>
                                    <div className="flex-1 border-t border-primary/20"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        disabled
                                        className="p-3 bg-surface text-text/40 rounded-xl font-medium cursor-not-allowed"
                                    >
                                        WalletConnect
                                    </button>
                                    <button
                                        disabled
                                        className="p-3 bg-surface text-text/40 rounded-xl font-medium cursor-not-allowed"
                                    >
                                        Coinbase
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="text-xs text-text/60 text-center">
                                <p>By connecting your wallet, you agree to our</p>
                                <p>
                                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
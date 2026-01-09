'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Smartphone, Globe, Loader2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Web3LoginPage from './Web3LoginPage';

interface LoginPageProps {
    appName?: string;
    onLoginSuccess?: (data: any) => void;
    useWeb3Auth?: boolean; // New prop to enable Web3 authentication
}

export default function LoginPage({
    appName = 'NileLink',
    onLoginSuccess,
    useWeb3Auth = false // Default to traditional authentication for now
}: LoginPageProps) {

    // Enable Web3 authentication
    if (useWeb3Auth) {
        return (
            <Web3LoginPage
                appName={appName}
                onLoginSuccess={onLoginSuccess}
            />
        );
    }

    // Traditional authentication
    const [activeMethod, setActiveMethod] = useState<'email' | 'otp'>('email');

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // OTP login state
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Common state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Demo Credentials Integration
        if (email === 'demo@nilelink.app' && password === 'demo123') {
            const mockData = {
                user: { id: 'demo-1', email: 'demo@nilelink.app', role: 'ADMIN' },
                accessToken: 'demo-token-' + Date.now(),
                refreshToken: 'demo-refresh'
            };

            localStorage.setItem('accessToken', mockData.accessToken);
            localStorage.setItem('refreshToken', mockData.refreshToken);
            localStorage.setItem('user', JSON.stringify(mockData.user));

            setSuccess('Demo Login Successful!');
            if (onLoginSuccess) onLoginSuccess(mockData);
            return;
        }

        try {
            // Mock API call for demo
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            const data = {
                user: { id: 'user-1', email, role: 'USER' },
                accessToken: 'mock-token-' + Date.now(),
                refreshToken: 'mock-refresh-' + Date.now()
            };

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess('Login successful! Redirecting...');
            if (onLoginSuccess) onLoginSuccess(data);
        } catch (err: any) {
            setError('Login failed. Please try again.');
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
            // Mock OTP send
            await new Promise(resolve => setTimeout(resolve, 500));
            setOtpSent(true);
            setSuccess('OTP sent to your email!');
        } catch (err: any) {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Mock OTP verification
            await new Promise(resolve => setTimeout(resolve, 500));

            const data = {
                user: { id: 'user-1', email: otpEmail, role: 'USER' },
                accessToken: 'mock-otp-token-' + Date.now(),
                refreshToken: 'mock-otp-refresh-' + Date.now()
            };

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess('Login successful!');
            if (onLoginSuccess) onLoginSuccess(data);
        } catch (err: any) {
            setError('OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 mesh-bg relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-md glass-v2 rounded-[2.5rem] p-10 border border-white/10 relative z-10 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 overflow-hidden rounded-2xl shadow-xl">
                        <img src="/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Welcome to {appName}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">Strategic Ecosystem Access</p>
                </div>

                {/* Method Selector */}
                <div className="flex p-1 mb-8 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMethod === 'email'
                            ? 'bg-white text-primary shadow-lg'
                            : 'text-white/40 hover:text-white'
                            }`}
                    >
                        <Mail size={14} />
                        Identity
                    </button>
                    <button
                        onClick={() => setActiveMethod('otp')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMethod === 'otp'
                            ? 'bg-white text-primary shadow-lg'
                            : 'text-white/40 hover:text-white'
                            }`}
                    >
                        <Smartphone size={14} />
                        OTP Sync
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-200 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-emerald-200 font-medium">{success}</p>
                    </div>
                )}

                {/* Forms */}
                {activeMethod === 'email' ? (
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="IDENTITY EMAIL"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="ACCESS KEY"
                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'CALIBRATING...' : 'AUTHORIZE ACCESS'}
                        </button>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">🚀 Quick Demo Access</p>
                            <p className="text-[8px] font-mono text-white/40">EMAIL: demo@nilelink.app</p>
                            <p className="text-[8px] font-mono text-white/40">KEY: demo123</p>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        {!otpSent ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="email"
                                        value={otpEmail}
                                        onChange={(e) => setOtpEmail(e.target.value)}
                                        placeholder="IDENTITY EMAIL"
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading || !otpEmail}
                                    className="w-full bg-secondary text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    GENERATE SYNC CODE
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                        VERIFICATION CODE SENT TO
                                    </p>
                                    <p className="text-xs font-mono text-secondary">{otpEmail}</p>
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="0 0 0 0 0 0"
                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-2xl font-black text-center tracking-[0.5em] focus:border-secondary outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-secondary text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    VERIFY & AUTHORIZE
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Footer Links */}
                <div className="mt-10 space-y-4 text-center">
                    <div className="flex items-center gap-4 py-4">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Alternative Gateways</span>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest">
                        <Shield size={14} />
                        CONNECT HARDWARE WALLET
                    </button>

                    <p className="text-[10px] font-medium text-white/40">
                        NEW TO THE PROTOCOL?{' '}
                        <Link href="/auth/register" className="text-secondary hover:text-secondary-light font-black uppercase tracking-widest italic ml-1 transition-all">
                            INITIALIZE ACCOUNT
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

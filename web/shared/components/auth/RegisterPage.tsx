'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '@shared/utils/api';

interface RegisterPageProps {
    appName?: string;
    onRegisterSuccess?: (data: any) => void;
}

export default function RegisterPage({
    appName = 'NileLink',
    onRegisterSuccess
}: RegisterPageProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'DRIVER' // Default for delivery app, can be customized
    });
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
            const data = await authApi.signup(formData) as any;
            setSuccess('ACCOUNT INITIALIZED SUCCESSFULLY. REDIRECTING TO SYNC...');
            if (onRegisterSuccess) onRegisterSuccess(data);
        } catch (err: any) {
            setError(err.message || 'INITIALIZATION FAILED');
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

            <div className="w-full max-w-lg glass-v2 rounded-[2.5rem] p-10 border border-white/10 relative z-10 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 overflow-hidden rounded-2xl shadow-xl">
                        <img src="/shared/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Initialize {appName}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">Protocol Onboarding Node</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="FIRST NAME"
                                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                                required
                            />
                        </div>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="LAST NAME"
                                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="IDENTITY EMAIL"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-mono uppercase tracking-widest focus:border-secondary outline-none transition-all placeholder:text-white/10"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'INITIALIZING...' : 'CREATE PROTOCOL IDENTITY'}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-10 space-y-4 text-center border-t border-white/5 pt-8">
                    <p className="text-[10px] font-medium text-white/40 italic">
                        BY REGISTERING, YOU AGREE TO THE PROTOCOL CONSENSUS TERMS.
                    </p>
                    <p className="text-[10px] font-medium text-white/40">
                        ALREADY HAVE AN IDENTITY?{' '}
                        <Link href="/auth/login" className="text-secondary hover:text-secondary-light font-black uppercase tracking-widest italic ml-1 transition-all">
                            AUTHORIZE ACCESS
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

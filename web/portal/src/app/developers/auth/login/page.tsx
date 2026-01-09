"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Code,
    Github,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function DeveloperLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock authentication - in real app this would call API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate successful login
            localStorage.setItem('developer_token', 'mock_jwt_token');
            router.push('/developers/dashboard');

        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        try {
            // Mock GitHub OAuth - in real app this would redirect to GitHub
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.setItem('developer_token', 'mock_github_token');
            router.push('/developers/dashboard');
        } catch (err) {
            setError('GitHub authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            {/* Header */}
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        ← Back to NileLink
                    </Link>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-12">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Code size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-text-primary mb-2">Developer Portal</h1>
                    <p className="text-text-muted">Access NileLink APIs and documentation</p>
                </div>

                <Card className="p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={20} className="text-error flex-shrink-0" />
                            <p className="text-error font-medium text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="developer@nilelink.app"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-border-subtle rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full h-12 bg-primary text-background font-black uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={18} />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2" size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-1 h-px bg-border-subtle"></div>
                        <span className="px-4 text-sm font-medium text-text-muted">or</span>
                        <div className="flex-1 h-px bg-border-subtle"></div>
                    </div>

                    {/* GitHub Login */}
                    <Button
                        onClick={handleGithubLogin}
                        disabled={loading}
                        variant="outline"
                        className="w-full h-12 border-2 border-text/20 hover:border-primary/50 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 animate-spin" size={18} />
                        ) : (
                            <Github className="mr-2" size={18} />
                        )}
                        Continue with GitHub
                    </Button>

                    {/* Links */}
                    <div className="mt-8 space-y-4 text-center">
                        <Link href="/developers/signup" className="block text-primary hover:text-primary/80 font-medium transition-colors">
                            Don't have an account? Sign up
                        </Link>
                        <Link href="/developers/forgot-password" className="block text-text-muted hover:text-text-primary font-medium transition-colors">
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Developer Notice */}
                    <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Code size={16} className="text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-text-primary uppercase tracking-widest mb-1">
                                    Developer Access
                                </p>
                                <p className="text-xs text-text-muted">
                                    Access NileLink APIs, documentation, and developer tools. Sign up for a free developer account to get started.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-text-muted">
                        NileLink Developer Portal • API Version 2.1.0
                    </p>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
    defaultMethod?: 'email' | 'phone';
    onAuthSuccess?: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login', defaultMethod = 'email', onAuthSuccess }: AuthModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
    const [method, setMethod] = useState<'email' | 'phone'>(defaultMethod);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (activeTab === 'login') {
                // Use real login API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                // Store the JWT token
                localStorage.setItem('nilelink_auth_token', data.data.token);

                // Call success callback
                if (onAuthSuccess) {
                    onAuthSuccess(data.data.user);
                }

                onClose();
                router.push('/admin');
            } else {
                // For now, redirect to register page for full registration flow
                onClose();
                router.push('/auth/register');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-background-card rounded-2xl p-8 max-w-md w-full mx-4 relative border border-border-subtle shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-main"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-text-main">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-text-muted mt-2">
                        {activeTab === 'login' ? 'Sign in to your account' : 'Join the NileLink ecosystem'}
                    </p>
                </div>

                <div className="flex mb-6 border-b border-border-subtle">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${activeTab === 'login'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${activeTab === 'register'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex space-x-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setMethod('email')}
                            className={`flex-1 py-2 px-4 rounded-lg border transition-all ${method === 'email'
                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                : 'border-border-subtle text-text-muted hover:bg-background-subtle'
                                }`}
                        >
                            <Mail size={16} className="inline mr-2" />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('phone')}
                            className={`flex-1 py-2 px-4 rounded-lg border transition-all ${method === 'phone'
                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                : 'border-border-subtle text-text-muted hover:bg-background-subtle'
                                }`}
                        >
                            📱 Phone
                        </button>
                    </div>

                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail size={18} />}
                        required
                        className="bg-background-subtle border-transparent focus:border-primary text-text-main placeholder-text-muted"
                    />

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={18} />}
                            required
                            className="bg-background-subtle border-transparent focus:border-primary text-text-main placeholder-text-muted"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Button type="submit" className="w-full bg-primary text-background hover:bg-primary-light font-bold" isLoading={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                            </>
                        ) : (
                            activeTab === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </Button>

                    {error && (
                        <div className="text-center text-error text-sm font-medium mt-3 p-3 bg-error/10 rounded-lg border border-error/20">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
"use client";

import React, { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    Fingerprint,
    Eye,
    EyeOff,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Smartphone
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { useAuth } from '../providers/FirebaseAuthProvider';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
    defaultMethod?: 'email' | 'phone' | 'wallet';
    onAuthSuccess?: (userData: any) => void;
}

export function AuthModal({
    isOpen,
    onClose,
    defaultTab = 'login',
    defaultMethod = 'email',
    onAuthSuccess
}: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
    const [activeMethod, setActiveMethod] = useState<'email' | 'phone' | 'wallet'>(defaultMethod);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Email form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Phone form
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [country, setCountry] = useState('US');

    // Wallet form
    const [walletAddress, setWalletAddress] = useState('');
    const [walletConnected, setWalletConnected] = useState(false);

    const { loginWithEmail, loginWithPhone, loginWithWallet, register, sendOtp, verifyOtp, connectWallet } = useAuth();

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setOtp('');
        setOtpSent(false);
        setWalletAddress('');
        setWalletConnected(false);
        setError('');
        setIsLoading(false);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (activeTab === 'login') {
                const result = await loginWithEmail(email, password);
                if (result.success) {
                    if (onAuthSuccess) onAuthSuccess(result.user);
                    onClose();
                } else {
                    setError(result.error || 'Login failed');
                }
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                const result = await register({
                    email,
                    password,
                    firstName,
                    lastName
                });
                if (result.success) {
                    // Auto login after registration
                    const loginResult = await loginWithEmail(email, password);
                    if (loginResult.success) {
                        onClose();
                    }
                } else {
                    setError(result.error || 'Registration failed');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (activeTab === 'login') {
                if (!otpSent) {
                    // Send OTP first
                    const result = await sendOtp(phone);
                    if (result.success) {
                        setOtpSent(true);
                    } else {
                        setError(result.error || 'Failed to send OTP');
                    }
                } else {
                    // Verify OTP and login
                    const result = await loginWithPhone(phone, otp);
                    if (result.success) {
                        if (onAuthSuccess) onAuthSuccess(result.user);
                        onClose();
                    } else {
                        setError(result.error || 'Login failed');
                    }
                }
            } else {
                if (!otpSent) {
                    // Send OTP for registration
                    const result = await sendOtp(phone);
                    if (result.success) {
                        setOtpSent(true);
                    } else {
                        setError(result.error || 'Failed to send OTP');
                    }
                } else {
                    // Verify OTP and register
                    const result = await register({
                        phone,
                        firstName,
                        lastName,
                        country
                    });
                    if (result.success) {
                        if (onAuthSuccess) onAuthSuccess(result.user);
                        onClose();
                    } else {
                        setError(result.error || 'Registration failed');
                    }
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWalletAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!walletConnected) {
                const result = await connectWallet();
                if (result.success && result.address) {
                    setWalletAddress(result.address);
                    setWalletConnected(true);
                } else {
                    setError(result.error || 'Failed to connect wallet');
                }
            } else {
                // For demo purposes, we'll simulate wallet signature
                const message = `Sign in to NileLink\n\nTimestamp: ${Date.now()}`;
                const result = await loginWithWallet(walletAddress, 'demo_signature', message);
                if (result.success) {
                    if (onAuthSuccess) onAuthSuccess(result.user);
                    onClose();
                } else {
                    setError(result.error || 'Wallet login failed');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary">
                        {activeTab === 'login' ? 'Welcome Back' : 'Join NileLink'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-bg-muted transition-colors"
                    >
                        <X size={20} className="text-text-muted" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 mx-6 mt-6 bg-bg-muted rounded-lg">
                    <button
                        onClick={() => {
                            setActiveTab('login');
                            resetForm();
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'login'
                            ? 'bg-white text-text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('register');
                            resetForm();
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'register'
                            ? 'bg-white text-text-primary shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Method Selector */}
                <div className="flex p-1 mx-6 mt-4 bg-bg-accent rounded-lg">
                    <button
                        onClick={() => setActiveMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${activeMethod === 'email'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Mail size={16} />
                        Email
                    </button>
                    <button
                        onClick={() => setActiveMethod('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${activeMethod === 'phone'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Smartphone size={16} />
                        Phone
                    </button>
                    <button
                        onClick={() => setActiveMethod('wallet')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${activeMethod === 'wallet'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Fingerprint size={16} />
                        Identity
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-error-light border border-error rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-error flex-shrink-0" />
                        <span className="text-sm text-error-dark">{error}</span>
                    </div>
                )}

                {/* Forms */}
                <div className="p-6 pt-4">
                    {activeMethod === 'email' && (
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {activeTab === 'register' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="john@nilelink.app"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pr-12 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            {activeTab === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full py-3 text-white bg-primary hover:bg-primary-dark"
                            >
                                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>
                    )}

                    {activeMethod === 'phone' && (
                        <form onSubmit={handlePhoneAuth} className="space-y-4">
                            {activeTab === 'register' && !otpSent && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">
                                            Country
                                        </label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="US">🇺🇸 United States</option>
                                            <option value="GB">🇬🇧 United Kingdom</option>
                                            <option value="DE">🇩🇪 Germany</option>
                                            <option value="FR">🇫🇷 France</option>
                                            <option value="AE">🇦🇪 United Arab Emirates</option>
                                            <option value="IN">🇮🇳 India</option>
                                            <option value="CN">🇨🇳 China</option>
                                            <option value="JP">🇯🇵 Japan</option>
                                            <option value="KR">🇰🇷 South Korea</option>
                                            <option value="BR">🇧🇷 Brazil</option>
                                            <option value="MX">🇲🇽 Mexico</option>
                                            <option value="AU">🇦🇺 Australia</option>
                                            <option value="CA">🇨🇦 Canada</option>
                                            <option value="RU">🇷🇺 Russia</option>
                                            <option value="ZA">🇿🇦 South Africa</option>
                                            <option value="NG">🇳🇬 Nigeria</option>
                                            <option value="EG">🇪🇬 Egypt</option>
                                            <option value="TR">🇹🇷 Turkey</option>
                                            <option value="SA">🇸🇦 Saudi Arabia</option>
                                            <option value="TH">🇹🇭 Thailand</option>
                                            <option value="VN">🇻🇳 Vietnam</option>
                                            <option value="ID">🇮🇩 Indonesia</option>
                                            <option value="MY">🇲🇾 Malaysia</option>
                                            <option value="PH">🇵🇭 Philippines</option>
                                            <option value="SG">🇸🇬 Singapore</option>
                                            <option value="NZ">🇳🇿 New Zealand</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="px-3 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="US">+1</option>
                                        <option value="GB">+44</option>
                                        <option value="DE">+49</option>
                                        <option value="FR">+33</option>
                                        <option value="AE">+971</option>
                                        <option value="IN">+91</option>
                                        <option value="CN">+86</option>
                                        <option value="JP">+81</option>
                                        <option value="KR">+82</option>
                                        <option value="BR">+55</option>
                                        <option value="MX">+52</option>
                                        <option value="AU">+61</option>
                                        <option value="CA">+1</option>
                                        <option value="RU">+7</option>
                                        <option value="ZA">+27</option>
                                        <option value="NG">+234</option>
                                        <option value="EG">+20</option>
                                        <option value="TR">+90</option>
                                        <option value="SA">+966</option>
                                        <option value="TH">+66</option>
                                        <option value="VN">+84</option>
                                        <option value="ID">+62</option>
                                        <option value="MY">+60</option>
                                        <option value="PH">+63</option>
                                        <option value="SG">+65</option>
                                        <option value="NZ">+64</option>
                                    </select>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="1234567890"
                                        disabled={otpSent}
                                    />
                                </div>
                            </div>
                            {otpSent && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full py-3 text-white bg-primary hover:bg-primary-dark"
                            >
                                {!otpSent
                                    ? (activeTab === 'login' ? 'Send Code' : 'Send Verification')
                                    : (activeTab === 'login' ? 'Verify & Login' : 'Verify & Register')
                                }
                            </Button>
                            {otpSent && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setOtp('');
                                    }}
                                    className="w-full text-sm text-primary hover:underline"
                                >
                                    Change phone number
                                </button>
                            )}
                        </form>
                    )}

                    {activeMethod === 'wallet' && (
                        <form onSubmit={handleWalletAuth} className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Fingerprint size={32} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">
                                    Anchor Secure Identity
                                </h3>
                                <p className="text-sm text-text-muted">
                                    Access your node securely via identity anchoring
                                </p>
                            </div>

                            {!walletConnected ? (
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full py-3 text-white bg-primary hover:bg-primary-dark"
                                >
                                    Connect MetaMask
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-success-light border border-success rounded-lg flex items-center gap-3">
                                        <CheckCircle size={20} className="text-success" />
                                        <div>
                                            <div className="text-sm font-medium text-success-dark">
                                                Identity Anchored
                                            </div>
                                            <div className="text-xs text-success">
                                                Node ID: {walletAddress.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        className="w-full py-3 text-white bg-primary hover:bg-primary-dark"
                                    >
                                        Verify & Sync
                                    </Button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
}
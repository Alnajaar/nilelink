"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Briefcase, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        investmentExperience: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Password strength
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return 'First name is required';
        if (!formData.lastName.trim()) return 'Last name is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 8) return 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        if (!formData.investmentExperience) return 'Please select your investment experience';
        if (!agreeToTerms) return 'You must agree to the terms and conditions';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
            const res = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: 'INVESTOR' // Default role for investors
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            setSuccess('Account created successfully! Please check your email for verification.');
            setVerificationSent(true);

            // Store tokens temporarily (user needs to verify email)
            localStorage.setItem('pendingAccessToken', data.accessToken);
            localStorage.setItem('pendingRefreshToken', data.refreshToken);
            localStorage.setItem('pendingUser', JSON.stringify(data.user));
            localStorage.setItem('app', 'investor'); // Track which app user is in

            setTimeout(() => router.push('/auth/verify-email'), 3000);
        } catch (err: any) {
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError('Unable to connect to the server. Please ensure the backend API is running and accessible at ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api'));
            } else {
                setError(err?.message || 'Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Fair';
        return 'Strong';
    };

    if (verificationSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
                    <p className="text-gray-600 mb-6">
                        Welcome to NileLink Investor Portal! Please check your email for verification.
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-purple-800">
                            Click the verification link in your email to activate your investor account and start exploring investment opportunities.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link
                            href="/auth/verify-email"
                            className="block w-full bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-green-600 transition-all text-center flex items-center justify-center gap-2"
                        >
                            Go to Verification Page
                            <TrendingUp className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={() => setVerificationSent(false)}
                            className="block w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                            ← Back to registration
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Investor Network</h1>
                    <p className="text-gray-600">Create your investor account</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="John"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Investment Experience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="investmentExperience"
                                value={formData.investmentExperience}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                            >
                                <option value="">Select your experience level</option>
                                <option value="beginner">Beginner (New to investing)</option>
                                <option value="intermediate">Intermediate (Some experience)</option>
                                <option value="advanced">Advanced (Experienced investor)</option>
                                <option value="professional">Professional (Institutional)</option>
                            </select>
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="investor@email.com"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Password strength:</span>
                                    <span className={`text-xs font-medium ${
                                        passwordStrength <= 2 ? 'text-red-600' :
                                        passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                            <div className="mt-1 flex items-center gap-2">
                                {formData.password === formData.confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-xs text-green-600">Passwords match</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-xs text-red-600">Passwords don't match</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                            I agree to the{' '}
                            <Link href="/legal/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                                Privacy Policy
                            </Link>
                            {' '}for investor accounts
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !agreeToTerms}
                        className="w-full bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={20} className="animate-spin" />}
                        {loading ? 'Creating Account...' : 'Create Investor Account'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                            Sign in to portal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
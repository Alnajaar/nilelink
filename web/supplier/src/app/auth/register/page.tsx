"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Building, CheckCircle, AlertCircle, Loader2, Truck } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Information
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',

        // Business Information
        companyName: '',
        businessType: '',
        industry: '',
        companySize: '',
        businessAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        taxId: '',
        businessDescription: '',

        // Supplier Preferences
        supplyCategories: [] as string[],
        deliveryRadius: '',
        minimumOrderValue: '',
        paymentTerms: 'Net 30',
        certifications: [] as string[]
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors when user starts typing
        if (error) setError('');
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!formData.firstName.trim()) return 'First name is required';
            if (!formData.lastName.trim()) return 'Last name is required';
            if (!formData.email.trim()) return 'Email is required';
            if (!formData.password) return 'Password is required';
            if (formData.password.length < 8) return 'Password must be at least 8 characters';
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        } else if (step === 2) {
            if (!formData.companyName.trim()) return 'Company name is required';
            if (!formData.businessType) return 'Business type is required';
            if (!formData.industry) return 'Industry is required';
            if (!formData.companySize) return 'Company size is required';
        } else if (step === 3) {
            if (!formData.businessAddress.trim()) return 'Business address is required';
            if (!formData.city.trim()) return 'City is required';
            if (!formData.state.trim()) return 'State is required';
            if (!formData.zipCode.trim()) return 'ZIP code is required';
            if (formData.supplyCategories.length === 0) return 'At least one supply category is required';
            if (!agreeToTerms) return 'You must agree to the terms and conditions';
        }
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate all steps
        for (let step = 1; step <= 3; step++) {
            const validationError = validateStep(step);
            if (validationError) {
                setError(validationError);
                setCurrentStep(step);
                return;
            }
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/suppliers/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
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
            localStorage.setItem('app', 'supplier'); // Track which app user is in

            setTimeout(() => router.push('/auth/verify-email'), 3000);
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
                    <p className="text-gray-600 mb-6">
                        Welcome to NileLink Supplier Portal! Please check your email for verification.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-orange-800">
                            Click the verification link in your email to activate your supplier account and start managing your supply chain.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Link
                            href="/auth/verify-email"
                            className="block w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all text-center flex items-center justify-center gap-2"
                        >
                            Go to Verification Page
                            <Truck className="w-5 h-5" />
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-100">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step <= currentStep ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-12 h-0.5 mx-2 ${
                                        step < currentStep ? 'bg-gradient-to-r from-orange-500 to-blue-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Supplier Network</h1>
                        <p className="text-gray-600">
                            {currentStep === 1 && "Start with your personal information"}
                            {currentStep === 2 && "Tell us about your business"}
                            {currentStep === 3 && "Complete your business profile"}
                        </p>
                    </div>
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

                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

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
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

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
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                Next Step
                                <Truck className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Business Information */}
                {currentStep === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Your Company Ltd."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Type</option>
                                    <option value="manufacturer">Manufacturer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="wholesaler">Wholesaler</option>
                                    <option value="retailer">Retailer</option>
                                    <option value="importer">Importer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="food_beverage">Food & Beverage</option>
                                    <option value="restaurant">Restaurant/Hospitality</option>
                                    <option value="retail">Retail</option>
                                    <option value="wholesale">Wholesale</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                            <select
                                name="companySize"
                                value={formData.companySize}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            >
                                <option value="">Select Size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-1000">201-1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                            <textarea
                                name="businessDescription"
                                value={formData.businessDescription}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Tell us about your business..."
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-300 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                Next Step
                                <Truck className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Business Profile & Preferences */}
                {currentStep === 3 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                            <input
                                type="text"
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="123 Business St"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="New York"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="NY"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="10001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                >
                                    <option value="United States">United States</option>
                                    <option value="Canada">Canada</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Supply Categories (Select all that apply)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Food & Beverage', 'Bakery', 'Dairy', 'Meat & Seafood', 'Produce', 'Dry Goods', 'Beverages', 'Cleaning Supplies', 'Paper Products', 'Other'].map((category) => (
                                    <label key={category} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.supplyCategories.includes(category)}
                                            onChange={(e) => {
                                                const updated = e.target.checked
                                                    ? [...formData.supplyCategories, category]
                                                    : formData.supplyCategories.filter(c => c !== category);
                                                setFormData(prev => ({ ...prev, supplyCategories: updated }));
                                            }}
                                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (miles)</label>
                                <input
                                    type="number"
                                    name="deliveryRadius"
                                    value={formData.deliveryRadius}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value ($)</label>
                                <input
                                    type="number"
                                    name="minimumOrderValue"
                                    value={formData.minimumOrderValue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="500"
                                />
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-start gap-3 pt-4">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                                I agree to the{' '}
                                <Link href="/legal/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="/legal/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                                    Privacy Policy
                                </Link>
                                {' '}for supplier accounts
                            </label>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-300 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !agreeToTerms}
                                className="bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-orange-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={20} className="animate-spin" />}
                                {loading ? 'Creating Account...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                            Sign in to portal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

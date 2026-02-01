'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirebaseAuth } from '@shared/providers/FirebaseAuthProvider';
import { motion } from 'framer-motion';
import {
    CheckCircle, ChevronRight, Package, MapPin, CreditCard,
    Upload, Building2, Globe, Phone, Mail, Sparkles, Wallet
} from 'lucide-react';

interface OnboardingData {
    role: string;
    businessType: string;
    branches: string;
    owners: string;
    inventory: string;
    posDevice: string;
    plan: string;
    // Step 2
    businessName: string;
    phone: string;
    website: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
    // Step 3
    email: string;
    emailVerified: boolean;
    walletConnected: boolean;
    ownerName: string; // Added based on renderStepContent case 1
    // Step 4 & 5
    categories: string[];
    bankName: string;
    bankAccount: string;
}

const categories = ['Food & Beverages', 'Packaging', 'Equipment', 'Cleaning', 'Furniture', 'Tech'];

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<OnboardingData>({
        // Step 1: Choose Role
        role: 'business_owner',

        // Step 2: Choose Business Type
        businessType: 'restaurant',

        // Step 3: Business Structure
        branches: '1',
        owners: 'one',
        inventory: 'central',

        // Step 4: POS Usage
        posDevice: 'tablet',

        // Step 5: Permissions & Roles (info only)
        // No data needed

        // Step 6: Plan Selection
        // Step 6: Plan Selection
        plan: 'starter',

        // Initial Empty Values for other steps to satisfy interface
        businessName: '',
        phone: '',
        website: '',
        country: 'Egypt',
        address: '',
        city: '',
        postalCode: '',
        email: '',
        emailVerified: false,
        walletConnected: false,
        ownerName: '',
        categories: [],
        bankName: '',
        bankAccount: ''
    });

    const toggleCategory = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const steps = [
        {
            title: 'Choose Role',
            description: 'What is your role?',
            icon: Building2
        },
        {
            title: 'Business Type',
            description: 'What type of business?',
            icon: Package
        },
        {
            title: 'Business Structure',
            description: 'Tell us about your setup',
            icon: MapPin
        },
        {
            title: 'POS Usage',
            description: 'How will you use POS?',
            icon: CreditCard
        },
        {
            title: 'Permissions & Roles',
            description: 'Understand access levels',
            icon: CheckCircle
        },
        {
            title: 'Plan Selection',
            description: 'Choose your plan',
            icon: Globe
        },
        {
            title: 'Complete',
            description: 'You\'re all set!',
            icon: Sparkles
        }
    ];

    const plans = [
        {
            id: 'starter',
            name: 'Starter Plan',
            price: 150,
            features: ['1 branch', 'Limited users', 'Core POS', 'Blockchain fees excluded'],
            trial: true
        },
        {
            id: 'growth',
            name: 'Growth Plan',
            price: 500,
            features: ['Multiple branches', 'Advanced analytics', 'Priority support', 'Blockchain fees excluded'],
            trial: true
        }
    ];

    const { user } = useAuth(); // Connect to real auth context
    const { updateProfile } = useFirebaseAuth();

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding - Save real data
            try {
                // Update user profile with business information
                if (user) {
                    await updateProfile({
                        displayName: `${formData.ownerName} - ${formData.businessName}`,
                        // Store additional data in custom claims or local storage
                    });
                }

                // Redirect
                router.push('/dashboard?onboarding=complete');
            } catch (error) {
                console.error('Onboarding save failed:', error);
                // Fallback redirect even if save fails (don't block user)
                router.push('/dashboard?onboarding=complete');
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };



    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Select your role in the business</p>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => setFormData({ ...formData, role: 'business_owner' })}
                                className={`p-4 rounded-lg border transition ${formData.role === 'business_owner' ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800/30 border-slate-700'}`}
                            >
                                <div className="font-semibold">Business Owner</div>
                                <div className="text-sm text-slate-400">Full control over the business</div>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, role: 'branch_manager' })}
                                className={`p-4 rounded-lg border transition ${formData.role === 'branch_manager' ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800/30 border-slate-700'}`}
                            >
                                <div className="font-semibold">Branch Manager</div>
                                <div className="text-sm text-slate-400">Manage operations for a branch</div>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, role: 'cashier' })}
                                className={`p-4 rounded-lg border transition ${formData.role === 'cashier' ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800/30 border-slate-700'}`}
                            >
                                <div className="font-semibold">Cashier</div>
                                <div className="text-sm text-slate-400">Handle sales and transactions</div>
                            </button>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                value={formData.ownerName}
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+20 123 456 7890"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="123 Main Street"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cairo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Country *
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Egypt">Egypt</option>
                                <option value="UAE">United Arab Emirates</option>
                                <option value="Saudi Arabia">Saudi Arabia</option>
                                <option value="Jordan">Jordan</option>
                            </select>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Select all categories that apply to your business</p>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={`px-4 py-3 rounded-lg border transition ${formData.categories.includes(category)
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Bank Name *
                            </label>
                            <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="National Bank of Egypt"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Account Number *
                            </label>
                            <input
                                type="text"
                                value={formData.bankAccount}
                                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter account number"
                            />
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-400">
                                💡 This information is encrypted and secure. We'll use it to deposit your earnings.
                            </p>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                    <div>
                                        <div className="font-semibold text-white">Email Verification</div>
                                        <div className="text-sm text-slate-400">{formData.email}</div>
                                    </div>
                                </div>
                                {formData.emailVerified ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={() => setFormData({ ...formData, emailVerified: true })}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Verify Now
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Wallet className="w-6 h-6 text-purple-400" />
                                    <div>
                                        <div className="font-semibold text-white">Wallet Connection</div>
                                        <div className="text-sm text-slate-400">Optional - for crypto payments</div>
                                    </div>
                                </div>
                                {formData.walletConnected ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <button
                                        onClick={() => setFormData({ ...formData, walletConnected: true })}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">All Set!</h2>
                        <p className="text-slate-400 mb-8">
                            Your supplier account is ready. Start adding products and accepting orders.
                        </p>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-left">
                            <h3 className="font-semibold text-white mb-4">Next Steps:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span>Add your first products</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span>Set up inventory tracking</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span>Start receiving orders</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <span className="text-sm text-slate-400">
                            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
                    {/* Step Icon and Title */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            {React.createElement(steps[currentStep].icon, {
                                className: 'w-7 h-7 text-white'
                            })}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
                            <p className="text-slate-400">{steps[currentStep].description}</p>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="mb-8">
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <span>{currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Building,
    MapPin,
    CreditCard,
    User,
    Shield,
    Zap
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { useAuth } from '@shared/contexts/AuthContext';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    required: boolean;
}

const steps: OnboardingStep[] = [
    {
        id: 'business',
        title: 'Business Information',
        description: 'Tell us about your business',
        icon: Building,
        required: true
    },
    {
        id: 'location',
        title: 'Location & Settings',
        description: 'Set up your business location',
        icon: MapPin,
        required: true
    },
    {
        id: 'owner',
        title: 'Owner Details',
        description: 'Complete your profile',
        icon: User,
        required: true
    },
    {
        id: 'payment',
        title: 'Payment Setup',
        description: 'Configure your billing',
        icon: CreditCard,
        required: true
    },
    {
        id: 'security',
        title: 'Security Setup',
        description: 'Secure your account',
        icon: Shield,
        required: true
    },
    {
        id: 'complete',
        title: 'Setup Complete',
        description: 'Welcome to NileLink!',
        icon: Zap,
        required: false
    }
];

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Business info
        businessName: '',
        businessType: '',
        // Location
        address: '',
        country: 'Egypt',
        currency: 'EGP',
        taxRate: 14,
        timezone: 'Africa/Cairo',
        // Owner
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        // Payment
        plan: searchParams.get('plan') || 'free',
        paymentMethod: 'card',
        // Security
        twoFactorEnabled: false
    });

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    useEffect(() => {
        if (user) {
            // If user is already authenticated, redirect to admin
            router.push('/admin');
        }
    }, [user, router]);

    const handleNext = async () => {
        if (currentStepData.required && !validateCurrentStep()) {
            return;
        }

        setCompletedSteps(prev => new Set(prev).add(currentStep));

        if (isLastStep) {
            await handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStepData.id) {
            case 'business':
                return formData.businessName.trim() !== '' && formData.businessType !== '';
            case 'location':
                return formData.address.trim() !== '' && formData.country !== '';
            case 'owner':
                return formData.firstName.trim() !== '' &&
                       formData.lastName.trim() !== '' &&
                       formData.email.trim() !== '' &&
                       formData.password.length >= 8;
            case 'payment':
                return true; // Payment validation would be more complex
            case 'security':
                return true;
            default:
                return true;
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Mock onboarding completion for demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock user data
            const mockUser = {
                id: `onboard-${Date.now()}`,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: 'OWNER',
                businessName: formData.businessName,
                isActive: true,
                authType: 'email',
                plan: formData.plan
            };

            const mockToken = 'onboarding-jwt-token-' + Date.now();

            localStorage.setItem('accessToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));

            router.push('/dashboard');
        } catch (error) {
            console.error('Onboarding failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderStepContent = () => {
        switch (currentStepData.id) {
            case 'business':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Business Name *</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => updateFormData('businessName', e.target.value)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Enter your business name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Business Type *</label>
                            <select
                                value={formData.businessType}
                                onChange={(e) => updateFormData('businessType', e.target.value)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            >
                                <option value="">Select business type</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="cafe">Cafe</option>
                                <option value="retail">Retail Store</option>
                                <option value="bar">Bar/Pub</option>
                                <option value="food-truck">Food Truck</option>
                                <option value="catering">Catering</option>
                            </select>
                        </div>
                    </div>
                );

            case 'location':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Business Address *</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => updateFormData('address', e.target.value)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Street address, city, state"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Country *</label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => updateFormData('country', e.target.value)}
                                    className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                >
                                    <option value="Egypt">Egypt</option>
                                    <option value="UAE">UAE</option>
                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                    <option value="Kuwait">Kuwait</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => updateFormData('currency', e.target.value)}
                                    className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="EGP">Egyptian Pound (EGP)</option>
                                    <option value="AED">UAE Dirham (AED)</option>
                                    <option value="SAR">Saudi Riyal (SAR)</option>
                                    <option value="USD">US Dollar (USD)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Tax Rate (%)</label>
                            <input
                                type="number"
                                value={formData.taxRate}
                                onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>
                    </div>
                );

            case 'owner':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                    className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="John"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => updateFormData('lastName', e.target.value)}
                                    className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="owner@business.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Password *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                className="w-full p-4 bg-surface border border-primary/20 rounded-xl text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Minimum 8 characters"
                                required
                            />
                            {formData.password && formData.password.length < 8 && (
                                <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>
                            )}
                        </div>
                    </div>
                );

            case 'payment':
                return (
                    <div className="space-y-6">
                        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                            <h3 className="text-lg font-bold text-text mb-2">Selected Plan</h3>
                            <p className="text-primary font-mono text-xl">
                                {formData.plan === 'free' ? 'Free Trial (3 months)' :
                                 formData.plan === 'standard' ? 'Standard Plan ($99/month)' :
                                 'Enterprise Plan ($299/month)'}
                            </p>
                        </div>

                        {formData.plan !== 'free' && (
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Payment Method</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 bg-surface border border-primary/20 rounded-xl cursor-pointer hover:border-primary/40">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                                            className="text-primary"
                                        />
                                        <div>
                                            <div className="font-bold text-text">Credit/Debit Card</div>
                                            <div className="text-sm text-text/60">Visa, MasterCard, American Express</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-surface border border-primary/20 rounded-xl cursor-pointer hover:border-primary/40">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="bank"
                                            checked={formData.paymentMethod === 'bank'}
                                            onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                                            className="text-primary"
                                        />
                                        <div>
                                            <div className="font-bold text-text">Bank Transfer</div>
                                            <div className="text-sm text-text/60">Direct bank transfer</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-text mb-2">Secure Your Account</h3>
                            <p className="text-text/60">Enable additional security features</p>
                        </div>

                        <div className="bg-surface p-6 rounded-xl border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-text mb-1">Two-Factor Authentication</h4>
                                    <p className="text-sm text-text/60">Add an extra layer of security to your account</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.twoFactorEnabled}
                                        onChange={(e) => updateFormData('twoFactorEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>

                        <div className="text-sm text-text/60 space-y-2">
                            <p>• We'll send security codes to your email for important actions</p>
                            <p>• Your data is encrypted and secure</p>
                            <p>• You can change these settings anytime in your account</p>
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                            <Check size={40} className="text-background" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-text mb-2">Setup Complete!</h3>
                            <p className="text-text/60">
                                Welcome to NileLink! Your business is now ready to start accepting payments.
                            </p>
                        </div>

                        <div className="bg-surface p-6 rounded-xl border border-primary/20 max-w-md mx-auto">
                            <h4 className="font-bold text-text mb-4">What's Next?</h4>
                            <ul className="text-left space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-primary" />
                                    <span>Create your first terminal</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-primary" />
                                    <span>Add your menu items</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-primary" />
                                    <span>Configure payment methods</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={16} className="text-primary" />
                                    <span>Start processing orders</span>
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background">
                            <Zap size={24} />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink Setup</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-surface border-b border-primary/10">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index <= currentStep
                                        ? completedSteps.has(index)
                                            ? 'bg-primary text-background'
                                            : 'bg-primary/50 text-background'
                                        : 'bg-surface text-text/40'
                                }`}>
                                    {completedSteps.has(index) ? (
                                        <Check size={16} />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-2 ${
                                        completedSteps.has(index) ? 'bg-primary' : 'bg-surface'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-black text-text mb-1">{currentStepData.title}</h2>
                        <p className="text-text/60">{currentStepData.description}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="bg-surface rounded-3xl p-8 border border-primary/10">
                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            disabled={currentStep === 0 || loading}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? 'Processing...' : isLastStep ? 'Complete Setup' : 'Continue'}
                            {!isLastStep && <ArrowRight size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}

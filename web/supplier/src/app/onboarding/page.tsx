"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, Package, MapPin, Bell, CreditCard,
    ChevronRight, Sparkles
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export default function OnboardingFlow() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [settings, setSettings] = useState({
        inventory: false,
        notifications: false,
        payment: false
    });

    const steps = [
        {
            id: 1,
            title: 'Welcome to NileLink',
            description: 'Your wholesale supply hub is ready. Let\'s get you set up in 3 quick steps.',
            icon: Sparkles
        },
        {
            id: 2,
            title: 'Set Up Inventory',
            description: 'Configure your product catalog and stock management preferences',
            icon: Package,
            action: 'inventory'
        },
        {
            id: 3,
            title: 'Configure Notifications',
            description: 'Choose how you want to receive order and stock alerts',
            icon: Bell,
            action: 'notifications'
        },
        {
            id: 4,
            title: 'Payment Setup',
            description: 'Add your bank details for automated payouts',
            icon: CreditCard,
            action: 'payment'
        }
    ];

    const handleNext = () => {
        if (step < steps.length) {
            setStep(step + 1);
        } else {
            // Complete onboarding
            router.push('/dashboard?onboarded=true');
        }
    };

    const handleSkip = () => {
        router.push('/dashboard');
    };

    const currentStep = steps[step - 1];

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="w-full max-w-2xl bg-white border border-surface p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-text">
                            Step {step} of {steps.length}
                        </span>
                        <span className="text-sm text-text opacity-70">
                            {Math.round((step / steps.length) * 100)}% Complete
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="mb-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <currentStep.icon size={40} className="text-background" />
                            </div>
                            <h1 className="text-3xl font-black text-text mb-2">
                                {currentStep.title}
                            </h1>
                            <p className="text-text opacity-70">
                                {currentStep.description}
                            </p>
                        </div>

                        {/* Step-specific content */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { icon: Package, label: 'Inventory' },
                                        { icon: Bell, label: 'Alerts' },
                                        { icon: CreditCard, label: 'Payments' }
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-6 bg-surface/30 rounded-xl text-center"
                                        >
                                            <item.icon size={32} className="text-primary mx-auto mb-2" />
                                            <p className="text-sm font-bold text-text">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step > 1 && currentStep.action && (
                            <div className="bg-surface/30 rounded-xl p-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <button
                                        type="button"
                                        onClick={() => setSettings(prev => ({
                                            ...prev,
                                            [currentStep.action!]: !prev[currentStep.action as keyof typeof settings]
                                        }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${settings[currentStep.action as keyof typeof settings]
                                                ? 'bg-primary'
                                                : 'bg-surface'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-background rounded-full transition-transform ${settings[currentStep.action as keyof typeof settings]
                                                ? 'translate-x-6'
                                                : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                    <span className="text-sm font-medium text-text">
                                        Enable {currentStep.action} features
                                    </span>
                                </label>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={handleSkip}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-bold"
                    >
                        Skip for Now
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="flex-[2] bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                    >
                        {step === steps.length ? (
                            <>
                                <Check size={18} className="mr-2" />
                                Complete Setup
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight size={18} className="ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building, MapPin, Users, DollarSign, TrendingUp,
    Check, ChevronRight, Sparkles, FileText, Zap
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export default function ListRestaurantPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Business Details
        name: '',
        cuisine: '',
        location: '',
        yearsOperating: '',
        // Step 2: Financials
        monthlyRevenue: '',
        monthlyCosts: '',
        employeeCount: '',
        // Step 3: Offering
        totalShares: '20000',
        sharePrice: '',
        sharesForSale: '',
        // Step 4: POS Integration
        posConnected: false
    });

    const steps = [
        { id: 1, title: 'Business Details', icon: Building },
        { id: 2, title: 'Financial Data', icon: DollarSign },
        { id: 3, title: 'Share Offering', icon: TrendingUp },
        { id: 4, title: 'POS Integration', icon: Zap }
    ];

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Submit listing
            router.push('/owner-dashboard');
        }
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const suggestedValuation = formData.monthlyRevenue && formData.monthlyCosts
        ? (parseFloat(formData.monthlyRevenue) - parseFloat(formData.monthlyCosts)) * 12 * 3.5
        : 0;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="w-full max-w-4xl bg-white border border-surface p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Building size={32} className="text-background" />
                    </div>
                    <h1 className="text-3xl font-black text-text mb-2">List Your Restaurant</h1>
                    <p className="text-text opacity-70">Raise capital by selling shares to investors worldwide</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center flex-1">
                            <div className={`flex flex-col items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.id ? 'bg-primary text-background' : 'bg-surface text-text'
                                    }`}>
                                    {step > s.id ? <Check size={24} /> : <s.icon size={24} />}
                                </div>
                                <p className="text-xs font-bold text-text mt-2">{s.title}</p>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-1 flex-1 mx-2 ${step > s.id ? 'bg-primary' : 'bg-surface'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="mb-8">
                    {/* Step 1: Business Details */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Restaurant Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="Cairo Grill Prime"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text mb-2">Cuisine Type</label>
                                    <select
                                        value={formData.cuisine}
                                        onChange={(e) => updateField('cuisine', e.target.value)}
                                        className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    >
                                        <option value="">Select</option>
                                        <option value="Mediterranean">Mediterranean</option>
                                        <option value="French">French</option>
                                        <option value="Egyptian">Egyptian</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Asian">Asian</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text mb-2">Years Operating</label>
                                    <input
                                        type="number"
                                        value={formData.yearsOperating}
                                        onChange={(e) => updateField('yearsOperating', e.target.value)}
                                        className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => updateField('location', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="Downtown Cairo"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Financials */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Average Monthly Revenue</label>
                                <input
                                    type="number"
                                    value={formData.monthlyRevenue}
                                    onChange={(e) => updateField('monthlyRevenue', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="150000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Average Monthly Costs</label>
                                <input
                                    type="number"
                                    value={formData.monthlyCosts}
                                    onChange={(e) => updateField('monthlyCosts', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="90000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Number of Employees</label>
                                <input
                                    type="number"
                                    value={formData.employeeCount}
                                    onChange={(e) => updateField('employeeCount', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="25"
                                />
                            </div>

                            {suggestedValuation > 0 && (
                                <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary">
                                    <p className="text-sm font-bold text-primary mb-2">AI-Suggested Valuation</p>
                                    <p className="text-4xl font-mono font-black text-primary">
                                        ${suggestedValuation.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-text mt-2">
                                        Based on 3.5x annual net profit (industry standard)
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Share Offering */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Share Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.sharePrice}
                                    onChange={(e) => updateField('sharePrice', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="125.50"
                                />
                                <p className="text-xs text-text opacity-70 mt-2">
                                    Suggested: ${(suggestedValuation / parseFloat(formData.totalShares)).toFixed(2)} per share
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Shares for Sale</label>
                                <input
                                    type="number"
                                    value={formData.sharesForSale}
                                    onChange={(e) => updateField('sharesForSale', e.target.value)}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    placeholder="5000"
                                />
                                <p className="text-xs text-text opacity-70 mt-2">
                                    Out of {formData.totalShares} total shares ({((parseFloat(formData.sharesForSale) / parseFloat(formData.totalShares)) * 100).toFixed(1)}% equity)
                                </p>
                            </div>

                            {formData.sharePrice && formData.sharesForSale && (
                                <div className="p-6 bg-primary rounded-xl text-background">
                                    <p className="text-sm font-bold opacity-90 mb-2">Capital to Raise</p>
                                    <p className="text-4xl font-mono font-black">
                                        ${(parseFloat(formData.sharePrice) * parseFloat(formData.sharesForSale)).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 4: POS Integration */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center p-8 bg-surface/30 rounded-xl">
                                <Zap size={48} className="text-primary mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-text mb-2">Connect Your POS</h3>
                                <p className="text-text opacity-70 mb-6">
                                    Real-time sales data builds investor trust and enables instant dividend distribution
                                </p>
                                <Button
                                    onClick={() => updateField('posConnected', true)}
                                    className="bg-primary hover:opacity-90 text-background h-12 px-8 rounded-xl font-black uppercase tracking-widest"
                                >
                                    {formData.posConnected ? (
                                        <>
                                            <Check size={20} className="mr-2" />
                                            POS Connected
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} className="mr-2" />
                                            Connect NileLink POS
                                        </>
                                    )}
                                </Button>
                            </div>

                            {formData.posConnected && (
                                <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Check size={24} className="text-primary" />
                                        <h4 className="text-lg font-black text-primary">Ready to Launch!</h4>
                                    </div>
                                    <p className="text-sm text-text">
                                        Your restaurant will be listed on the marketplace and available for investment immediately.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {step > 1 && (
                        <Button
                            onClick={() => setStep(step - 1)}
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold"
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={handleNext}
                        className="flex-[2] bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                    >
                        {step === 4 ? (
                            <>
                                <Sparkles size={18} className="mr-2" />
                                Launch Listing
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

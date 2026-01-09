"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    MapPin,
    DollarSign,
    Tags,
    ArrowRight,
    CheckCircle2,
    Building2,
    Users
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [location, setLocation] = useState('');
    const [currency, setCurrency] = useState('EGP');
    const [taxRate, setTaxRate] = useState('14');
    const [category, setCategory] = useState('');

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            router.push('/admin');
        }, 2000);
    };

    const steps = [
        {
            title: "Store Details",
            desc: "Where is your business located?",
            icon: Building2,
            content: (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Store Address</label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. 123 Nile Corniche, Cairo"
                            icon={<MapPin size={18} />}
                            className="bg-background-subtle border-transparent h-14 font-bold rounded-2xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Business Category</label>
                        <select
                            className="w-full h-14 px-4 pl-12 bg-background-subtle rounded-2xl font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary border-transparent appearance-none"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="" disabled>Select a category</option>
                            <option value="fnb">Food & Beverage</option>
                            <option value="retail">Retail Store</option>
                            <option value="service">Service Business</option>
                        </select>
                        <Tags className="absolute left-4 top-[42px] pointer-events-none text-text-muted" size={18} />
                    </div>
                </div>
            )
        },
        {
            title: "Financials",
            desc: "Configure your currency and tax settings.",
            icon: DollarSign,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Currency</label>
                            <select
                                className="w-full h-14 px-4 bg-background-subtle rounded-2xl font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-primary border-transparent"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="EGP">EGP (E£)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="SAR">SAR (﷼)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Tax Rate (%)</label>
                            <Input
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                placeholder="14"
                                type="number"
                                className="bg-background-subtle border-transparent h-14 font-bold rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Staff Setup",
            desc: "Create your first admin account.",
            icon: Users,
            content: (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-success" />
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-2">You&apos;re All Set!</h3>
                    <p className="text-text-muted max-w-sm mx-auto mb-8">
                        The &quot;Owner&quot; role has been assigned to your account. You can add more staff members later from the admin dashboard.
                    </p>
                    <div className="p-4 bg-background-subtle rounded-2xl inline-block text-left mb-4 w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-primary">
                                #1
                            </div>
                            <div>
                                <p className="font-black text-text-main text-sm">Owner Account</p>
                                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Full Access • Rate Limit: Unlimited</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-8 flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1 h-2 rounded-full bg-border-subtle overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: step >= s ? '100%' : '0%' }}
                            className="h-full bg-primary"
                        />
                    </div>
                ))}
            </div>

            <Card className="w-full max-w-md p-8 md:p-12 rounded-[48px] bg-white shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                {React.createElement(steps[step - 1].icon, { size: 24 })}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Step {step} of {totalSteps}</span>
                        </div>

                        <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">{steps[step - 1].title}</h1>
                        <p className="text-text-muted font-medium mb-8">{steps[step - 1].desc}</p>

                        {steps[step - 1].content}

                        <div className="pt-8 mt-4 border-t border-border-subtle flex gap-4">
                            {step > 1 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(step - 1)}
                                    className="h-14 rounded-2xl font-black text-text-muted"
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                isLoading={isLoading}
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-sm"
                            >
                                {step === totalSteps ? 'Launch Dashboard' : 'Continue'}
                                {step !== totalSteps && <ArrowRight size={18} className="ml-2" />}
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Card>

            <p className="mt-8 font-mono text-[10px] text-text-subtle uppercase tracking-widest opacity-60">
                Setup Wizard • v2.1.0 • Session ID: {Math.floor(Math.random() * 999999)}
            </p>
        </div>
    );
}

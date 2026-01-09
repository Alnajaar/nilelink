"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
    CheckCircle2, Building2, Coffee, Store,
    Users, ShieldCheck, Zap, Globe, Cpu,
    ChevronRight, Wallet, Sparkles, Building
} from 'lucide-react';
import { authApi, ApiError } from '@shared/utils/api';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';

type Step = 'personal' | 'business' | 'scale' | 'workforce' | 'finalizing';

export default function RegisterOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('personal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        // Business
        businessName: '',
        businessType: 'restaurant' as 'cafe' | 'restaurant' | 'retail' | 'other',
        // Scale
        locationCount: 1,
        systemCount: 1, // Systems per location
        // Workforce
        initialManagerEmail: '',
        initialManagerName: '',
        initialManagerPass: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(''); // Clear error on edit
    };

    const handleNumberChange = (name: string, val: number) => {
        setFormData(prev => ({ ...prev, [name]: Math.max(1, Math.min(1000, val)) }));
        if (error) setError(''); // Clear error on edit
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        setStep('finalizing');

        try {
            // 1. Call Hyper-Ecosystem Deployer
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');
            const response = await fetch(`${baseUrl}/api/onboarding/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    locationCount: formData.locationCount,
                    systemCount: formData.systemCount,
                    initialManagerEmail: formData.initialManagerEmail,
                    initialManagerName: formData.initialManagerName
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Deployment failed');
            }

            setSuccess('Hyper-Ecosystem Deployed Successfully!');

            // Critical Data Persistence
            localStorage.setItem('nilelink_onboarding_completed', 'true');
            localStorage.setItem('nilelink_business_meta', JSON.stringify(result.data.business));

            // Store Auth Tokens
            localStorage.setItem('token', result.data.accessToken);
            localStorage.setItem('user', JSON.stringify(result.data.user));

            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            const errorMessage = err instanceof ApiError ? (err.message || 'Onboarding failed') : 'Neural network synchronization failed. Please retry.';
            setError(errorMessage);

            // Intelligent Error Navigation
            if (errorMessage.toLowerCase().includes('user already exists') || errorMessage.toLowerCase().includes('email')) {
                setStep('personal'); // Send back to step 1 to fix email
            } else {
                setStep('workforce'); // Send back to review last inputs
            }
        } finally {
            setLoading(false);
        }
    };

    const nextStep = (current: Step, next: Step) => {
        // Validation could go here
        setStep(next);
    };

    const prevStep = (prev: Step) => {
        setStep(prev);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 relative overflow-hidden flex items-center justify-center p-6">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-secondary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left Side: Branding & Info */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                            <Sparkles size={28} />
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.4em] italic">NileLink AI</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-black tracking-tighter leading-none italic uppercase">
                            Deploy Your <br />
                            <span className="text-primary">Ecosystem.</span>
                        </h1>
                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md italic">
                            Initialize the world's most advanced business intelligence and operations platform.
                            From one cafe to a global empire.
                        </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="space-y-4 pt-8">
                        {[
                            { id: 'personal', label: 'Identity Protocol', icon: ShieldCheck },
                            { id: 'business', label: 'Business Domain', icon: Building2 },
                            { id: 'scale', label: 'Operations Scale', icon: Cpu },
                            { id: 'workforce', label: 'Neural Workforce', icon: Users },
                        ].map((s, idx) => (
                            <div key={s.id} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${step === s.id ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' :
                                    idx < ['personal', 'business', 'scale', 'workforce'].indexOf(step) ? 'bg-success/20 border-success text-success' : 'border-white/10 text-white/20'
                                    }`}>
                                    {idx < ['personal', 'business', 'scale', 'workforce'].indexOf(step) ? <CheckCircle2 size={14} /> : idx + 1}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${step === s.id ? 'text-white' : 'text-white/20'
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Onboarding Card */}
                <div className="lg:col-span-7">
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">

                        <AnimatePresence mode="wait">
                            {step === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Owner <span className="text-primary">Identity</span></h2>
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Establish primary operator credentials</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">First Name</label>
                                            <input
                                                name="firstName" value={formData.firstName} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all italic"
                                                placeholder="e.g. Alexander"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">Last Name</label>
                                            <input
                                                name="lastName" value={formData.lastName} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all italic"
                                                placeholder="e.g. Nile"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">Email Access Point</label>
                                        <input
                                            name="email" value={formData.email} onChange={handleChange}
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all italic"
                                            placeholder="alex@nilelink.app"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">Secure Cipher</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password" value={formData.password} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all italic"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => nextStep('personal', 'business')}
                                        className="w-full h-20 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-[0.3em] italic rounded-3xl shadow-2xl shadow-primary/20 transition-all"
                                    >
                                        Initiate Protocol <ChevronRight size={20} className="ml-2" />
                                    </Button>
                                </motion.div>
                            )}

                            {step === 'business' && (
                                <motion.div
                                    key="business"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Entity <span className="text-primary">Domain</span></h2>
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Define your business architecture</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">Business Designation</label>
                                        <input
                                            name="businessName" value={formData.businessName} onChange={handleChange}
                                            className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl px-8 text-2xl font-black text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all italic uppercase tracking-tight"
                                            placeholder="e.g. NILE COFFEE HQ"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'cafe', label: 'Coffee Shop', icon: Coffee },
                                            { id: 'restaurant', label: 'Restaurant', icon: Store },
                                            { id: 'retail', label: 'Retail Haus', icon: Building },
                                            { id: 'other', label: 'Custom Org', icon: Globe },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData(prev => ({ ...prev, businessType: type.id as any }))}
                                                className={`h-24 flex items-center gap-4 px-6 rounded-3xl border transition-all ${formData.businessType === type.id
                                                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                <type.icon size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => prevStep('personal')} className="h-20 flex-1 border-white/10 text-white/40 rounded-3xl font-black uppercase tracking-widest italic">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => nextStep('business', 'scale')}
                                            className="h-20 flex-[2] bg-primary text-white font-black uppercase tracking-widest italic rounded-3xl shadow-2xl shadow-primary/20"
                                        >
                                            Next Stage
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'scale' && (
                                <motion.div
                                    key="scale"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Operational <span className="text-primary">Scale</span></h2>
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Configure your physical nodes & terminals</p>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Locations Slider/Input */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Total Global Branches</label>
                                                <span className="text-3xl font-black italic text-primary">{formData.locationCount}</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="1000" step="1"
                                                value={formData.locationCount}
                                                onChange={(e) => handleNumberChange('locationCount', parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between text-[10px] font-black text-white/20 italic tracking-widest uppercase">
                                                <span>1 Node</span>
                                                <span>500 Nodes</span>
                                                <span>1000 Nodes</span>
                                            </div>
                                        </div>

                                        {/* Systems per Location */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Terminals Per Node</label>
                                                <span className="text-3xl font-black italic text-secondary">{formData.systemCount}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4">
                                                {[1, 2, 5, 10].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => handleNumberChange('systemCount', num)}
                                                        className={`h-16 rounded-2xl border transition-all font-black italic ${formData.systemCount === num
                                                            ? 'bg-secondary/20 border-secondary text-secondary shadow-lg shadow-secondary/10'
                                                            : 'bg-white/5 border-white/10 text-white/40'
                                                            }`}
                                                    >
                                                        {num} Units
                                                    </button>
                                                ))}
                                                <input
                                                    type="number"
                                                    value={formData.systemCount}
                                                    onChange={(e) => handleNumberChange('systemCount', parseInt(e.target.value))}
                                                    className="col-span-4 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-black text-white/40 focus:outline-none italic"
                                                    placeholder="Custom Amount (Max 1000)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => prevStep('business')} className="h-20 flex-1 border-white/10 text-white/40 rounded-3xl font-black uppercase tracking-widest italic">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => nextStep('scale', 'workforce')}
                                            className="h-20 flex-[2] bg-primary text-white font-black uppercase tracking-widest italic rounded-3xl shadow-2xl shadow-primary/20"
                                        >
                                            Scale Deployment
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'workforce' && (
                                <motion.div
                                    key="workforce"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Neural <span className="text-primary">Workforce</span></h2>
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic">Automate initial staff accounts</p>
                                    </div>

                                    <Card className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] space-y-6">
                                        <div className="flex items-center gap-4 text-primary">
                                            <Zap size={24} className="animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Hyper-Automation active</span>
                                        </div>
                                        <p className="text-white/60 text-xs font-medium italic leading-relaxed">
                                            Our AI will automatically generate {formData.locationCount} manager accounts and {formData.locationCount * 3} cashier accounts
                                            with temporary access protocols. Specify your primary General Manager below.
                                        </p>
                                    </Card>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">GM Full Name</label>
                                            <input
                                                name="initialManagerName" value={formData.initialManagerName} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none italic"
                                                placeholder="e.g. Marcus Aurelius"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">GM Direct Email</label>
                                            <input
                                                name="initialManagerEmail" value={formData.initialManagerEmail} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none italic"
                                                placeholder="marcus@nilelink.app"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic ml-2">Initial Security Key</label>
                                            <input
                                                name="initialManagerPass" value={formData.initialManagerPass} onChange={handleChange}
                                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none italic"
                                                placeholder="SYSTEM-AUTO-GENERATE"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => prevStep('scale')} className="h-20 flex-1 border-white/10 text-white/40 rounded-3xl font-black uppercase tracking-widest italic">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="h-20 flex-[2] bg-primary text-white font-black uppercase tracking-widest italic rounded-3xl shadow-2xl shadow-primary/20"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : 'Finalize Deployment'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'finalizing' && (
                                <motion.div
                                    key="finalizing"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center py-20 text-center space-y-8"
                                >
                                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative">
                                        <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <Sparkles size={48} className="text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Deploying <span className="text-primary">Ecosystem</span></h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic leading-loose">
                                            Synchronizing {formData.locationCount} nodes... <br />
                                            Provisioning {formData.locationCount * formData.systemCount} terminals... <br />
                                            Onboarding neural workforce...
                                        </p>
                                    </div>
                                    {success && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-success/10 border border-success/20 rounded-2xl text-success font-black uppercase tracking-widest text-[10px] italic">
                                            {success}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="mt-8 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl text-secondary text-[10px] font-black uppercase tracking-widest italic text-center">
                                {error}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Global Aesthetics */}
            <style jsx global>{`
                input[type='range']::-webkit-slider-thumb {
                    width: 24px;
                    height: 24px;
                    background: #00F5FF;
                    border: 4px solid #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
                }
            `}</style>
        </div>
    );
}

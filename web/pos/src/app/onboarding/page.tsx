"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    MapPin,
    DollarSign,
    Tags,

    ArrowRight,
    CheckCircle2,
    Building2,
    Users,
    Printer,
    ScanLine,
    ShieldCheck,
    Cpu,
    Zap,
    Globe,
    CreditCard,
    Monitor,
    User,
    Eye,
    EyeOff,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@shared/providers/AuthProvider';
import { useSubscription } from '@shared/contexts/SubscriptionContext';
import { subscriptionEngine } from '@shared/services/SubscriptionEngine';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import { DeepSpaceBackground } from '@shared/components/DeepSpaceBackground';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, profile, refreshAuth, register, loading } = useAuth();
    const { plans, upgradePlan } = useSubscription();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Account Stats
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Business Genesis
    const [businessName, setBusinessName] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('business'); // Default to most popular
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [hardwareConfig, setHardwareConfig] = useState({
        printer: false,
        scanner: false,
        kds: false
    });

    const [error, setError] = useState<string | null>(null);
    const [isInitialUserCheck, setIsInitialUserCheck] = useState(true);
    const [startedAsGuest, setStartedAsGuest] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (loading) return;
        setStartedAsGuest(!user);
        setIsInitialUserCheck(false);
    }, [loading]);

    const totalSteps = startedAsGuest ? 5 : 4;

    const handleNext = async () => {
        setError(null);

        const currentStepData = steps[step - 1];

        // Rigorous Validation Phase
        if (startedAsGuest && step === 1) {
            if (!firstName.trim() || !email.trim() || password.length < 8) {
                setError('Identity credentials required. Password must be at least 8 characters.');
                return;
            }
            if (!email.includes('@')) {
                setError('A valid administrative email protocol is required.');
                return;
            }
        }

        const businessStepIdx = startedAsGuest ? 2 : 1;
        if (step === businessStepIdx) {
            if (!businessName.trim()) {
                setError('Legally registered business name is required.');
                return;
            }
            if (!category) {
                setError('Select a primary economic sector for your node.');
                return;
            }
            if (!location.trim()) {
                setError('Node jurisdiction (City, Country) is mandatory.');
                return;
            }
        }

        const planStepIdx = startedAsGuest ? 3 : 2;
        if (step === planStepIdx) {
            if (!selectedPlan) {
                setError('Select a protocol subscription tier to proceed.');
                return;
            }
        }

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setError(null);
        setIsLoading(true);
        try {
            // 1. If not logged in, register first
            if (!user) {
                if (!email || !password || !firstName) {
                    throw new Error('Founder identity must be established before deployment.');
                }
                await register(email, password, firstName, lastName || '');
            }

            // 2. Deployment of business logic
            const businessId = `bn_${Math.random().toString(36).substr(2, 9)}`;

            // Upgrade plan in subscription context
            await upgradePlan(selectedPlan);

            // Persist the decentralized node configuration
            const persistentConfig = {
                businessId,
                businessName,
                category,
                location,
                location,
                hardware: hardwareConfig,
                plan: selectedPlan,
                billingCycle,
                role: 'RESTAURANT_OWNER',
                setupAt: new Date().toISOString()
            };

            localStorage.setItem('nilelink_business_config', JSON.stringify(persistentConfig));

            // CRITICAL: Update the master user session with the new business identity
            const storedUserStr = localStorage.getItem('nilelink_user');
            const currentUser = storedUserStr ? JSON.parse(storedUserStr) : (user || {});
            const updatedUser = {
                ...currentUser,
                firstName: firstName || currentUser.firstName,
                lastName: lastName || currentUser.lastName,
                businessId,
                businessName,
                role: 'RESTAURANT_OWNER',
                plan: selectedPlan,
                isActive: true
            };
            localStorage.setItem('nilelink_user', JSON.stringify(updatedUser));

            // Sync session across the terminal
            await refreshAuth();

            // 2.5 Submit Activation Request (Decentralized License)
            const resolvedUserId = user?.uid || updatedUser.id || (auth.currentUser ? auth.currentUser.uid : (`local_${Date.now()}`));

            // Non-blocking activation request - proceed even if Firestore is unavailable
            try {
                await Promise.race([
                    subscriptionEngine.submitActivationRequest({
                        userId: resolvedUserId,
                        email: email || user?.email || 'admin@local',
                        businessName: businessName,
                        businessType: category,
                        planId: selectedPlan,
                        billingCycle
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
                ]);
                console.log('✅ Activation request submitted to Firestore');
            } catch (firestoreError: any) {
                console.warn('⚠️ Firestore activation request failed, proceeding with local storage:', firestoreError.message);
                // Store activation request locally as fallback
                localStorage.setItem('nilelink_pending_activation', JSON.stringify({
                    userId: resolvedUserId,
                    email: email || user?.email || 'admin@local',
                    businessName: businessName,
                    businessType: category,
                    planId: selectedPlan,
                    billingCycle,
                    requestedAt: Date.now(),
                    status: 'pending'
                }));
            }

            // 3. Final Deployment Redirect -> PENDING ACTIVATION
            // User cannot access dashboard until "Access Code" is verified
            router.push('/activation');
        } catch (error: any) {
            // Handle aborted requests gracefully - these are usually from navigation/unmount
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                console.warn('[Onboarding] Request aborted, redirecting anyway:', error.message);
                // Still proceed to activation page
                router.push('/activation');
                return;
            }

            console.error('System initialization failure:', error);
            setError(error.message || 'Onboarding protocol interrupted.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || isInitialUserCheck) {
        return (
            <div className="min-h-screen bg-pos-bg-primary flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-pos-accent border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-pos-text-muted font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Protocol...</p>
            </div>
        );
    }

    const steps = [
        ...(startedAsGuest ? [{
            title: "Founder Identity",
            desc: "Establish your cryptographic administrative soul.",
            icon: User,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">First Name</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Root"
                                className="bg-pos-bg-secondary/50 border-pos-border-subtle h-16 font-bold rounded-2xl text-white focus:border-pos-accent transition-all pl-6"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Last Name</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Admin"
                                className="bg-pos-bg-secondary/50 border-pos-border-subtle h-16 font-bold rounded-2xl text-white focus:border-pos-accent transition-all pl-6"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Primary Email Protocol</label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@enterprise.link"
                            className="bg-pos-bg-secondary/50 border-pos-border-subtle h-16 font-bold rounded-2xl text-white focus:border-pos-accent transition-all pl-6"
                        />
                        <p className="mt-2 text-[9px] text-pos-text-muted font-bold uppercase tracking-wider">This will be your primary node recovery and verification channel.</p>
                    </div>
                    <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Secure Password Access</label>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-pos-bg-secondary/50 border-pos-border-subtle h-16 font-bold rounded-2xl text-white focus:border-pos-accent transition-all pl-6"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-12 text-pos-text-muted hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            )
        }] : []),
        {
            title: "Business Genesis",
            desc: "Define your node in the NileLink Protocol.",
            icon: Building2,
            content: (
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Legally Registered Name</label>
                        <Input
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="e.g. Nile Coffee Roasters"
                            className="bg-pos-bg-secondary/50 border-pos-border-subtle h-14 font-bold rounded-2xl text-white focus:border-pos-accent transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Domain/Category</label>
                            <select
                                className="w-full h-14 px-4 bg-pos-bg-secondary/50 border border-pos-border-subtle rounded-2xl font-bold text-white focus:outline-none focus:border-pos-accent appearance-none transition-all"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>Select Sector</option>
                                <option value="fnb">Restaurant / Cafe</option>
                                <option value="retail">Supermarket / Retail</option>
                                <option value="service">Service Industry</option>
                                <option value="logistics">Logistics Node</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pos-text-muted mb-3 block">Jurisdiction</label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City, Country"
                                icon={<Globe size={18} className="text-pos-accent" />}
                                className="bg-pos-bg-secondary/50 border-pos-border-subtle h-14 font-bold rounded-2xl text-white"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Protocol Membership",
            desc: "Select your commercial deployment tier.",
            icon: Zap,
            content: (

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex bg-pos-bg-secondary/50 p-1 rounded-2xl mb-6 border border-pos-border-subtle">
                        {['monthly', 'yearly'].map((cycle) => (
                            <button
                                key={cycle}
                                onClick={() => setBillingCycle(cycle as any)}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === cycle ? 'bg-pos-accent text-black shadow-lg' : 'text-pos-text-muted hover:text-white'
                                    }`}
                            >
                                {cycle} {cycle === 'yearly' && <span className="ml-2 text-[8px] bg-black/20 px-1 py-0.5 rounded text-black font-bold border border-black/10">-17%</span>}
                            </button>
                        ))
                        }
                    </div >

                    {
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative group ${selectedPlan === plan.id
                                    ? 'bg-pos-accent/10 border-pos-accent shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                                    : 'bg-pos-bg-secondary/30 border-pos-border-subtle hover:border-pos-accent/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-black text-white text-lg uppercase tracking-tight italic">{plan.name}</h4>
                                        <p className="text-pos-text-muted text-xs font-medium">
                                            {billingCycle === 'monthly' ? `$${plan.monthlyPrice}` : `$${plan.yearlyPrice}`}
                                            <span className="opacity-50">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </p>
                                    </div>
                                    {selectedPlan === plan.id && (
                                        <CheckCircle2 size={20} className="text-pos-accent" />
                                    )}
                                </div>
                                <ul className="space-y-2">
                                    {plan.features.slice(0, 4).map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[10px] text-pos-text-secondary font-bold uppercase tracking-wide">
                                            <div className="w-1 h-1 bg-pos-accent rounded-full" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {plan.popular && (
                                    <Badge className="absolute -top-3 right-4 bg-pos-accent text-black font-black uppercase text-[8px] tracking-[0.2em]">MOST DEPLOYED</Badge>
                                )}
                            </div>
                        ))
                    }
                </div >
            )

        },
        {
            title: "External Hardware",
            desc: "Synchronize your physical terminal devices.",
            icon: Cpu,
            content: (
                <div className="space-y-6">
                    <p className="text-sm text-pos-text-secondary font-medium leading-relaxed">
                        NileLink automatically detects institutional-grade peripheral devices. Select what you'll be using for this node.
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'printer', name: 'Thermal Receipt Printer', icon: Printer, desc: '80mm Network/Bluetooth' },
                            { id: 'scanner', name: 'Zebra/Honeywell Scanner', icon: ScanLine, desc: 'High-speed 2D/QR Code' },
                            { id: 'kds', name: 'Kitchen Display (KDS)', icon: Monitor, desc: 'Real-time Order Workflow' }
                        ].map((hw) => (
                            <button
                                key={hw.id}
                                onClick={() => setHardwareConfig(prev => ({ ...prev, [hw.id]: !prev[hw.id as keyof typeof prev] }))}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${hardwareConfig[hw.id as keyof typeof hardwareConfig]
                                    ? 'bg-pos-accent/10 border-pos-accent'
                                    : 'bg-pos-bg-secondary/30 border-pos-border-subtle hover:bg-pos-bg-secondary/50'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl ${hardwareConfig[hw.id as keyof typeof hardwareConfig] ? 'bg-pos-accent text-black' : 'bg-pos-bg-tertiary text-pos-text-muted'}`}>
                                    <hw.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-white text-sm uppercase italic tracking-tight">{hw.name}</p>
                                    <p className="text-[10px] text-pos-text-muted font-bold uppercase tracking-widest">{hw.desc}</p>
                                </div>
                                {hardwareConfig[hw.id as keyof typeof hardwareConfig] && (
                                    <Badge className="bg-pos-accent/20 text-pos-accent border-pos-accent/30 py-1">ENABLED</Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Identity Verified",
            desc: "Establishing administrative sovereignty.",
            icon: ShieldCheck,
            content: (
                <div className="text-center py-6">
                    <div className="w-24 h-24 bg-pos-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-pos-accent/20 relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border border-pos-accent/30"
                        />
                        <ShieldCheck size={48} className="text-pos-accent" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 italic tracking-tightest uppercase">Sovereign Node Ready</h3>
                    <p className="text-pos-text-secondary font-medium max-w-sm mx-auto mb-8">
                        Your cryptographic identity has been linked to <span className="text-white font-bold">{businessName || 'the enterprise'}</span>.
                        As the Founder, you have full governance rights over this node.
                    </p>
                    <div className="p-6 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[2rem] text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pos-accent/10 rounded-2xl flex items-center justify-center font-black text-pos-accent border border-pos-accent/20">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-black text-white text-[10px] uppercase tracking-widest opacity-60">Verified Node Founder</p>
                                <p className="font-bold text-white text-sm uppercase italic tracking-tight">{firstName} {lastName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-pos-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <DeepSpaceBackground />

            {/* Progress indicator */}
            <div className="w-full max-w-lg mb-16 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-pos-accent flex items-center gap-2">
                        <Zap size={12} className="animate-pulse" />
                        Initialization Phase
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-pos-text-muted">{step} of {totalSteps}</span>
                </div>
                <div className="flex gap-3">
                    {Array.from({ length: totalSteps }).map((_, i) => {
                        const s = i + 1;
                        return (
                            <div key={s} className="flex-1 h-2 rounded-full bg-pos-bg-tertiary overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: step >= s ? '100%' : '0%' }}
                                    className={`h-full ${step >= s ? 'bg-pos-accent shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-transparent'}`}
                                    transition={{ duration: 0.6, ease: "circOut" }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card className="w-full max-w-lg p-10 md:p-14 rounded-[3rem] bg-pos-bg-primary/80 backdrop-blur-3xl border-pos-border-subtle shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative z-10 border-t-pos-accent/20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-pos-accent/10 rounded-2xl text-pos-accent border border-pos-accent/20">
                                {React.createElement(steps[step - 1].icon, { size: 28 })}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tightest uppercase italic leading-none">{steps[step - 1].title}</h1>
                                <p className="text-pos-accent text-[10px] font-black uppercase tracking-[0.3em] mt-1">Phase {step}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <p className="text-pos-text-secondary font-medium mb-10 text-lg">{steps[step - 1].desc}</p>

                        <div className="mb-10">
                            {steps[step - 1].content}
                        </div>

                        <div className="pt-8 border-t border-pos-border-subtle/30 flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="h-20 px-8 rounded-3xl font-black text-pos-text-muted uppercase tracking-widest text-xs hover:text-white transition-colors"
                                >
                                    Rollback
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={isLoading}
                                className={`flex-1 h-20 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl text-sm transition-all flex items-center justify-center gap-3 active:scale-95 ${isLoading
                                    ? 'bg-pos-bg-tertiary text-pos-text-muted cursor-wait'
                                    : 'bg-white text-black hover:bg-pos-accent hover:scale-[1.02]'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        {step === totalSteps ? 'Deploy Node' : 'Next Phase'}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Card>

            {/* Footer decoration */}
            <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
                <div className="flex items-center gap-6 opacity-40">
                    <img src="/shared/assets/icons/polygon.svg" alt="Polygon" className="h-4 grayscale" />
                    <img src="/shared/assets/icons/siwe.svg" alt="SIWE" className="h-4 grayscale" />
                    <div className="w-[1px] h-4 bg-pos-border-subtle" />
                    <p className="font-mono text-[8px] text-pos-text-muted uppercase tracking-[0.4em]">Protocol Node v2.4.92</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-pos-bg-secondary/50 border border-pos-border-subtle">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black text-pos-text-muted uppercase tracking-widest">Network Synchronized</span>
                </div>
            </div>

            <style jsx global>{`
                .mesh-bg {
                    background-image: 
                        radial-gradient(at 0% 0%, hsla(188, 86%, 53%, 0.15) 0, transparent 50%), 
                        radial-gradient(at 50% 0%, hsla(280, 80%, 50%, 0.1) 0, transparent 50%), 
                        radial-gradient(at 100% 0%, hsla(188, 86%, 53%, 0.15) 0, transparent 50%);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(34, 211, 238, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

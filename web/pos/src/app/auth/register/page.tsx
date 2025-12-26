"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Store, User, ArrowRight, Building2, Globe } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Zap size={32} className="text-background-light" fill="currentColor" />
                    </div>
                    <h1 className="text-4xl font-bold text-primary-dark mb-4">Provision Branch</h1>
                    <p className="text-text-secondary text-sm">Onboard your business to the NileLink Protocol</p>
                </div>

                <div className="bg-background-white p-12 rounded-2xl border border-border-light shadow-lg">
                    <div className="flex gap-4 mb-12">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-background-light">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: step >= s ? '100%' : '0%' }}
                                    className="h-full bg-primary-dark transition-all duration-500"
                                />
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-primary-dark">Restaurant / Business Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                        <input type="text" placeholder="The Grand Cairo Grill" className="w-full pl-12 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-primary-dark">Business Category</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                        <select className="w-full pl-12 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent appearance-none bg-background-light">
                                            <option>Food & Beverage (F&B)</option>
                                            <option>Retail & Grocery</option>
                                            <option>Pharmacy & Health</option>
                                            <option>General Services</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full h-12 bg-primary-dark text-background-light rounded-lg font-semibold hover:bg-primary-light transition-colors flex items-center justify-center gap-2">
                                Continue
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-nile-silver/30 uppercase tracking-[0.3em] ml-2">Primary Region</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-nile-silver/20 group-focus-within:text-white transition-colors" size={20} />
                                        <input type="text" placeholder="Dubai, UAE" className="w-full nile-input pl-16 py-5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-nile-silver/30 uppercase tracking-[0.3em] ml-2">Admin Email</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-nile-silver/20 group-focus-within:text-white transition-colors" size={20} />
                                        <input type="email" placeholder="admin@business.com" className="w-full nile-input pl-16 py-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 h-20 btn-secondary">Back</button>
                                <button onClick={() => setStep(3)} className="flex-[2] h-20 btn-primary flex items-center justify-center gap-4">
                                    Deploy Branch
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                                <Zap size={48} className="text-emerald-500" fill="currentColor" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">Branch Ready</h2>
                            <p className="text-nile-silver/40 font-bold max-w-sm mx-auto mb-12">Your business node has been provisioned on the NileLink Protocol. Identity hash secured.</p>
                            <Link href="/auth/login" className="btn-primary inline-flex items-center gap-4">
                                Launch Terminal
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    )}

                    <div className="mt-12 pt-12 border-t border-white/5 text-center">
                        <p className="text-xs font-bold text-nile-silver/30">
                            Already have a terminal? <Link href="/auth/login" className="text-white hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

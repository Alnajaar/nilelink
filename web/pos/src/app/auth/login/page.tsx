"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Delete, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (pin.length !== 4) return;

        // Mock PIN check
        if (pin === '1234' || pin === '0000') {
            setIsLoading(true);
            // Simulate auth delay
            setTimeout(() => {
                router.push('/terminal');
            }, 800);
        } else {
            setError(true);
            setPin('');
            // Shake animation would be triggered ideally
        }
    };

    return (
        <div className="min-h-screen bg-nile-deep flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-nile-dark/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-3xl bg-nile-silver flex items-center justify-center shadow-2xl mx-auto mb-8">
                        <Zap size={32} className="text-nile-dark" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-4 italic uppercase">Terminal Login</h1>
                    <p className="text-nile-silver/40 font-bold uppercase tracking-[0.2em] text-xs">Enter Operator PIN</p>
                </div>

                <div className="glass-panel p-8 rounded-5xl border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                    {/* PIN Display */}
                    <div className="flex justify-center gap-4 mb-10">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length
                                        ? 'bg-nile-silver scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                        : 'bg-white/10'
                                    } ${error ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="text-center mb-6 flex items-center justify-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                            <AlertCircle size={14} />
                            Invalid PIN
                        </div>
                    )}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-20 rounded-3xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-3xl font-black text-white italic transition-all active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <div />
                        <button
                            onClick={() => handleNumberClick('0')}
                            className="h-20 rounded-3xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-3xl font-black text-white italic transition-all active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            className="h-20 rounded-3xl hover:bg-white/5 active:bg-white/10 flex items-center justify-center text-nile-silver/50 hover:text-red-400 transition-all active:scale-95"
                        >
                            <Delete size={24} />
                        </button>
                    </div>

                    <button
                        onClick={() => handleLogin()}
                        disabled={isLoading || pin.length !== 4}
                        className="w-full h-20 btn-primary flex items-center justify-center gap-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-nile-dark/20 border-t-nile-dark rounded-full animate-spin" />
                        ) : (
                            <>
                                Access Terminal
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <div className="text-[10px] font-black text-nile-silver/20 uppercase tracking-[0.2em] mb-2">Default PIN: 1234</div>
                    <div className="text-[10px] font-black text-nile-silver/10 uppercase tracking-[0.5em]">
                        Protocol Anchored v0.1.0
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

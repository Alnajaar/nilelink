"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingDown, Clock, Percent } from 'lucide-react';

interface MarketPulse {
    economicLoadFactor: number;
    demandHotspots: string[];
    incentiveActive: boolean;
    efficiencyRating: number;
}

export const DemandPulse: React.FC = () => {
    const [pulse, setPulse] = useState<MarketPulse | null>(null);

    useEffect(() => {
        // In a real scenario, this would be a socket subscription to the EventEngine
        // For this high-fidelity demo, we simulate the "Pulse"
        const interval = setInterval(() => {
            const mockLoad = 0.5 + Math.random(); // Fluctuates between 0.5 and 1.5
            setPulse({
                economicLoadFactor: mockLoad,
                demandHotspots: ['MAADI', 'ZAMALEK'],
                incentiveActive: mockLoad < 0.9,
                efficiencyRating: Math.round((1 / mockLoad) * 100)
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!pulse) return null;

    return (
        <AnimatePresence>
            {pulse.incentiveActive && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative shadow-2xl overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20 animate-pulse">
                                    <Zap size={18} className="text-yellow-300 fill-yellow-300" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Neural Market Pulse</h4>
                                    <p className="font-bold text-sm tracking-tight flex items-center gap-2">
                                        High Efficiency Detected • <span className="text-emerald-300">Free Delivery Active</span>
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Cluster Load</span>
                                    <span className="font-mono font-bold text-sm">{Math.round(pulse.economicLoadFactor * 100)}%</span>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Efficiency</span>
                                    <span className="font-mono font-bold text-sm text-emerald-400">+{pulse.efficiencyRating}%</span>
                                </div>
                            </div>

                            <div className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Claim Incentive</span>
                                <TrendingDown size={14} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

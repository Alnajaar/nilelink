'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Zap,
    TrendingUp,
    AlertTriangle,
    Activity,
    ArrowUpRight,
    ShieldCheck,
    Workflow
} from 'lucide-react';

interface IntelligenceBridgeProps {
    context: 'pos' | 'delivery' | 'supplier' | 'customer';
}

export const NeuralIntelligenceBridge: React.FC<IntelligenceBridgeProps> = ({ context }) => {
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate neural inference fetch
        const timer = setTimeout(() => {
            const insightsByContext = {
                pos: {
                    title: 'Optimal Pricing Reached',
                    description: 'Neural models suggest a 5% increase for the "Prime Beef" category based on regional demand velocity.',
                    type: 'OPTIMIZATION',
                    impact: '+12% Revenue',
                    confidence: 94.2
                },
                delivery: {
                    title: 'Predictive Route Scaling',
                    description: 'Weather patterns in Cairo-North suggest a 20% delay. Activate "Silt-Flow" optimization protocol?',
                    type: 'LOGISTICS',
                    impact: '-15m Delay',
                    confidence: 88.5
                },
                supplier: {
                    title: 'Supply Depletion Alert',
                    description: 'Demand for "Organic Flour" is outstripping predicted stock levels by 4x. Accelerate sourcing?',
                    type: 'RISK',
                    impact: 'Prevent Stockout',
                    confidence: 97.8
                },
                customer: {
                    title: 'Imperial Recommendation',
                    description: 'Based on your preference for "Spicy", we recommend the Nile-Red Curry. Predictive match score: 99%',
                    type: 'PERSONALIZATION',
                    impact: '99% Match',
                    confidence: 99.1
                }
            };

            setInsight(insightsByContext[context]);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [context]);

    return (
        <div className="relative group">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] flex items-center justify-center gap-4 border-dashed"
                    >
                        <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bridging Neural Nexus...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="insight"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden group/card"
                    >
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Zap size={14} className="text-white fill-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Neural Intel Core</span>
                                </div>
                                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{insight.confidence}% Confidence</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                                    {insight.title}
                                    <ArrowUpRight size={14} className="text-blue-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Predicted Impact</p>
                                    <p className="text-sm font-black text-white italic">{insight.impact}</p>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[8px] rounded-lg transition-all shadow-lg shadow-blue-600/20">
                                    Execute Optimization
                                </button>
                            </div>
                        </div>

                        {/* Background Orbs */}
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover/card:bg-blue-600/20 transition-colors" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

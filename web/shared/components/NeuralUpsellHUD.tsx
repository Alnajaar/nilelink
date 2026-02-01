import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { AIAnalysisResponse } from '../services/AIService';

interface NeuralUpsellHUDProps {
    data: AIAnalysisResponse;
    isAnalyzing: boolean;
}

export const NeuralUpsellHUD: React.FC<NeuralUpsellHUDProps> = ({ data, isAnalyzing }) => {
    if (isAnalyzing) {
        return (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-pulse">
                <div className="flex items-center space-x-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Mesh: Analyzing...</span>
                </div>
            </div>
        );
    }

    const { prediction, data: aiData } = data;

    if (!prediction || !aiData) return null;

    // Find the best upsell or strategy recommendation
    const strategyRec = aiData.recommendations?.find(r => r.toLowerCase().includes('loyalty') || r.toLowerCase().includes('upsell') || r.toLowerCase().includes('offer'))
        || aiData.recommendations?.[0]
        || "Optimize operations with AI insights";

    const riskLevel = aiData.risk_level || 'UNKNOWN';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">AI Intelligence HUD</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${riskLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {riskLevel} RISK
                </div>
            </div>

            {/* Recommendation Card */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-md group hover:border-primary/40 transition-all">
                <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
                        <Brain className="h-3 w-3 text-background" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Agent Strategy</p>
                        <p className="text-xs font-black text-text-primary leading-tight italic">
                            "{strategyRec}"
                        </p>
                    </div>
                </div>

                {/* Confidence Sparkle */}
                <div className="absolute top-2 right-2">
                    <div className="flex items-center space-x-1">
                        <span className="text-[8px] font-black text-primary/60">{Math.round(prediction.confidence_score * 100)}% Match</span>
                    </div>
                </div>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-neutral rounded-xl border border-border-subtle hover:bg-white transition-all">
                    <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-text-secondary">Settlement Prob.</span>
                    </div>
                    <p className="text-xs font-black text-text-primary italic">99.2%</p>
                </div>
                <div className="p-3 bg-neutral rounded-xl border border-border-subtle hover:bg-white transition-all">
                    <div className="flex items-center space-x-2 mb-1">
                        <ShieldCheck className="h-3 w-3 text-blue-500" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-text-secondary">Fraud Shield</span>
                    </div>
                    <p className="text-xs font-black text-text-primary italic tracking-widest uppercase">ACTIVE</p>
                </div>
            </div>

            {/* Warnings Alert */}
            <AnimatePresence>
                {(aiData.concerns || []).length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start space-x-2"
                    >
                        <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-black text-red-600/80 uppercase tracking-tighter leading-snug">
                            {aiData.concerns?.[0]}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

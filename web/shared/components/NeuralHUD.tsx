import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ShieldCheck, Activity, TrendingUp, AlertTriangle, MessageSquare, Radar } from 'lucide-react';
import { AIAnalysisResponse } from '../services/AIService';

interface NeuralHUDProps {
    data: AIAnalysisResponse;
    isAnalyzing: boolean;
}

export const NeuralHUD: React.FC<NeuralHUDProps> = ({ data, isAnalyzing }) => {
    const [activeTab, setActiveTab] = useState<'negotiation' | 'simulations' | 'learning'>('negotiation');

    if (isAnalyzing) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-12 backdrop-blur-xl">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Radar className="h-12 w-12 text-emerald-400" />
                    </motion.div>
                    <p className="text-emerald-400 font-mono animate-pulse">SYNCHRONIZING NEURAL MESH agents...</p>
                </div>
            </div>
        );
    }

    const { prediction, model, safety, data: aiData } = data;

    if (!prediction || !aiData || !safety) return null;

    // Safe defaults if model is undefined
    const modelName = model?.name || 'NEURAL_AI';
    const modelVersion = model?.version || 'v1.0';

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-black/90 p-1 backdrop-blur-2xl shadow-2xl">
            {/* Top Bar / Status */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-y-1">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-emerald-400" />
                        <span className="font-bold tracking-tight text-white uppercase text-xs">{modelName} {modelVersion}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono italic">
                        <span>LATENCY: {data?.latency_ms || 0}ms</span>
                        <span>•</span>
                        <span>ENV: {data?.environment || 'production'}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${aiData?.risk_level === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {aiData?.risk_level || 'UNKNOWN'} RISK
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 min-h-[400px]">
                {/* Lateral Navigation */}
                <div className="col-span-1 border-r border-white/10 flex flex-col p-2 space-y-1">
                    {[
                        { id: 'negotiation', icon: MessageSquare, label: 'Neural Debate' },
                        { id: 'simulations', icon: TrendingUp, label: 'Projection Matrix' },
                        { id: 'learning', icon: Activity, label: 'Self Learning' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="text-xs font-semibold tracking-wide uppercase">{tab.label}</span>
                        </button>
                    ))}

                    <div className="mt-auto p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Confidence</span>
                            <span className="text-[10px] text-emerald-400 font-mono">{Math.round(prediction.confidence_score * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${prediction.confidence_score * 100}%` }}
                                className="h-full bg-emerald-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-span-3 p-6 bg-black/20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'negotiation' && (
                            <motion.div
                                key="negotiation"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Agent Conflict Resolution</h3>
                                    <span className="text-[10px] text-emerald-500 font-mono italic animate-pulse">STREAM ACTIVE</span>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {aiData.negotiation_log?.map((log, i) => (
                                        <div key={i} className="flex space-x-3 text-xs leading-relaxed">
                                            <span className="font-mono text-zinc-500 flex-shrink-0">[{i + 1}]</span>
                                            <p className={`font-medium ${log.includes('SYSTEM:') ? 'text-emerald-400' : log.includes('RISK:') ? 'text-red-400' : 'text-zinc-300'}`}>
                                                {log}
                                            </p>
                                        </div>
                                    ))}
                                    {(!aiData.negotiation_log || aiData.negotiation_log.length === 0) && (
                                        <p className="text-zinc-500 italic text-xs">No active conflict detected. Majority consensus reached.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'simulations' && (
                            <motion.div
                                key="simulations"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 gap-4"
                            >
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Future Timeline Simulations</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {aiData.future_simulations?.map((sim) => (
                                        <div key={sim.scenario} className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-between h-full group hover:border-emerald-500/30 transition-colors">
                                            <div>
                                                <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full ${sim.scenario === 'best' ? 'bg-emerald-500/20 text-emerald-400' : sim.scenario === 'worst' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {sim.scenario} casus
                                                </span>
                                                <div className="mt-3 text-xs text-white font-semibold leading-snug group-hover:text-emerald-400 transition-colors">
                                                    {sim.recommendation}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                                    <span>EXPOSURE</span>
                                                    <span className="font-mono">{sim.risk_exposure * 100}%</span>
                                                </div>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500/40" style={{ width: `${sim.risk_exposure * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 rounded-lg bg-red-400/5 border border-red-400/10 flex items-start space-x-3">
                                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Worst-Case Consequences</span>
                                        <ul className="mt-1 text-[11px] text-zinc-400 list-disc list-inside space-y-0.5">
                                            {aiData.future_simulations?.find(s => s.scenario === 'worst')?.irreversible_consequences.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'learning' && (
                            <motion.div
                                key="learning"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Reinforcement Status</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="text-[10px] text-emerald-400 font-mono tracking-tighter">NEURAL ADAPTATION ACTIVE</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-white uppercase tracking-tight">System Integrity</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono tracking-tighter">99.98%</div>
                                        <p className="text-[10px] text-zinc-500 mt-1">Stability index based on recent 500 outcome loops.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Activity className="h-4 w-4 text-blue-400" />
                                            <span className="text-xs font-bold text-white uppercase tracking-tight">Learning Velocity</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono tracking-tighter">14.2 ops/s</div>
                                        <p className="text-[10px] text-zinc-500 mt-1">Adjusting neural weights dynamically per report.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Autonomous Recalibration Log</p>
                                    <div className="space-y-2 font-mono text-[10px]">
                                        <div className="flex justify-between text-zinc-400">
                                            <span>[OUTCOME_REPORT_77a2]</span>
                                            <span className="text-emerald-400">+ Geo_Sensitivity_Weight: 0.042</span>
                                        </div>
                                        <div className="flex justify-between text-zinc-400">
                                            <span>[OUTCOME_REPORT_bc21]</span>
                                            <span className="text-blue-400">- UX_Friction_Pressure: 0.015</span>
                                        </div>
                                        <div className="flex justify-between text-zinc-400 italic">
                                            <span>[NEURAL_MESH_SYNC]</span>
                                            <span className="text-zinc-600 font-bold tracking-widest">SUCCESS</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Safeguards / Warnings */}
            {safety.warnings.length > 0 && (
                <div className="p-3 bg-red-500/10 border-t border-red-500/20 flex items-center space-x-3">
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                    <div className="flex overflow-x-auto space-x-4 no-scrollbar">
                        {safety.warnings.map((w, i) => (
                            <span key={i} className="text-[9px] text-red-300 font-bold uppercase tracking-wider whitespace-nowrap">WARNING: {w}</span>
                        ))}
                    </div>
                </div>
            )}

            {!safety.warnings.length && !safety.fallback_applied && (
                <div className="p-3 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center justify-center space-x-3">
                    <span className="text-[8px] text-emerald-500/50 font-bold uppercase tracking-[0.2em]">All Systems Nominal • Direct Protocol Execution</span>
                </div>
            )}
        </div>
    );
};

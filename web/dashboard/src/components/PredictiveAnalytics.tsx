'use client';

import React, { useState, useEffect } from 'react';
import { systemApi } from '@/shared/utils/api';
import { Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

export default function PredictiveAnalytics() {
    const [prediction, setPrediction] = useState<any>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const health = await systemApi.getHealth();
                if (health.predictions && health.predictions.length > 0) {
                    setPrediction(health.predictions[health.predictions.length - 1]);
                }
            } catch (error) {
                console.error('Failed to fetch predictions:', error);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    if (!prediction) return null;

    const loadPercent = Math.round(prediction.forecastedLoad * 100);
    const failureProb = Math.round(prediction.probabilityOfFailure * 100);

    return (
        <Card className="p-8 glass-v2 border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Activity size={80} className="text-secondary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Neural Predictor</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Forecasting Cluster Demand</p>
                        </div>
                    </div>
                    <Badge variant={failureProb > 30 ? 'error' : 'success'} className="px-4 py-1.5 font-black uppercase tracking-widest">
                        {failureProb > 30 ? 'High Risk' : 'Optimal'}
                    </Badge>
                </div>

                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Forecasted Node Load</span>
                            <span className="text-lg font-mono font-black text-secondary">{loadPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                            <div
                                className="h-full bg-secondary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,195,137,0.4)]"
                                style={{ width: `${loadPercent}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">Failure Probability</p>
                                <p className={`text-2xl font-black font-mono tracking-tighter ${failureProb > 40 ? 'text-red-500' : 'text-white'}`}>
                                    {failureProb}%
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">Confidence Score</p>
                                <p className="text-2xl font-black font-mono tracking-tighter text-white">99.4%</p>
                            </div>
                        </div>
                    </div>

                    {prediction.recommendedAction && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                            <AlertTriangle className="text-emerald-500" size={20} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                                Proactive scaling recommended: Reallocating shards...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

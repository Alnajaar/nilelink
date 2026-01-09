"use client";

import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

interface ReputationData {
    overallScore: number;
    trustScore: number;
    qualityScore: number;
    volumeScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: {
        reviewScore: number;
        successRate: number;
        volumeTrend: 'UP' | 'DOWN' | 'STABLE';
    };
}

const mockData: ReputationData = {
    overallScore: 0.92,
    trustScore: 0.95,
    qualityScore: 0.88,
    volumeScore: 0.90,
    riskLevel: 'LOW',
    factors: {
        reviewScore: 4.8,
        successRate: 0.99,
        volumeTrend: 'UP'
    }
};

export const ReputationScorecard = ({ data = mockData }: { data?: ReputationData }) => {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            default: return 'text-red-400 bg-red-500/10 border-red-500/20';
        }
    };

    return (
        <Card className="p-6 glass-v2 border-white/10 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Shield className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tighter italic">Institutional Reputation</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Protocol Trust Index</p>
                    </div>
                </div>
                <Badge className={`${getRiskColor(data.riskLevel)} text-[10px] font-black uppercase italic border`}>
                    {data.riskLevel} RISK PROFILE
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Trust Score</p>
                    <p className="text-4xl font-black text-white italic">{(data.trustScore * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Quality Score</p>
                    <p className="text-4xl font-black text-emerald-400 italic">{(data.qualityScore * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Overall Merit</p>
                    <p className="text-4xl font-black text-primary italic">{(data.overallScore * 100).toFixed(0)}%</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-white/50 mb-2">
                        <span>Ecosystem Consistency</span>
                        <span className="text-emerald-400">EXCEPTIONAL</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[92%]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-white/70 uppercase">99.2% Success Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-white/70 uppercase">Bullish Volume Trend</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-purple-500" />
                        <span className="text-[10px] font-bold text-white/70 uppercase">Governance Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-white/70 uppercase">Alpha Tier Delegate</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

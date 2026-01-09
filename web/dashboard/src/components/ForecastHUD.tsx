"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Zap, Info, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Badge } from './shared/Badge';

export default function ForecastHUD() {
    const [pulse, setPulse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPulse = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/market/pulse');
                const data = await res.json();
                if (data.success) {
                    setPulse(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch pulse:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPulse();
        const interval = setInterval(fetchPulse, 10000); // Pulse every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Economic Load Card */}
            <Card className="glass-v2 border-white/5 bg-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity size={80} className="text-white" />
                </div>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Economic_Load_Factor</CardTitle>
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px] font-black">AI_OPTIMIZED</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white italic tracking-tighter">
                            {pulse?.economicLoadFactor?.toFixed(2) || '1.00'}x
                        </span>
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                    </div>
                    <p className="text-[9px] text-white/30 mt-2 font-medium uppercase tracking-tight">System throughput vs. demand velocity</p>
                </CardContent>
            </Card>

            {/* Fee Multiplier Card */}
            <Card className="glass-v2 border-white/5 bg-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={80} className="text-[#F5B301]" />
                </div>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Neural_Fee_Multiplier</CardTitle>
                        <TrendingUp size={14} className="text-[#F5B301]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#F5B301] italic tracking-tighter">
                            {pulse?.suggestedFeeMultiplier || '1.00'}x
                        </span>
                        <ArrowUpRight size={18} className="text-[#F5B301]" />
                    </div>
                    <p className="text-[9px] text-white/30 mt-2 font-medium uppercase tracking-tight">Dynamic adjustment based on cluster saturation</p>
                </CardContent>
            </Card>

            {/* Demand Hotspots */}
            <Card className="glass-v2 border-white/5 bg-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Globe size={80} className="text-blue-500" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Demand_Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {pulse?.demandHotspots?.map((region: string) => (
                            <Badge key={region} className="bg-blue-500/10 text-blue-400 border-blue-400/20 font-black text-[9px] uppercase italic">
                                {region}_SURGE
                            </Badge>
                        )) || <span className="text-xs text-white/20 italic font-bold uppercase tracking-widest">Equilibrium_Reached</span>}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '78%' }}
                                className="h-full bg-blue-500"
                            />
                        </div>
                        <span className="text-[9px] font-black text-white/40 uppercase">78%_CAPACITY</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

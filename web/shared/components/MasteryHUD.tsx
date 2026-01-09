"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star, Target, ChevronRight, Award, ShieldAlert } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

interface Profile {
    experiencePoints: number;
    totalPoints: number;
    neuralScore: number;
    streakCount: number;
    currentTier?: {
        name: string;
        displayName: string;
        color: string;
    };
}

export const MasteryHUD = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/loyalty/profile', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const json = await res.json();
                if (json.success) setProfile(json.data);
            } catch (err) {
                console.error("MasteryHUD: Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="w-full h-32 glass-v2 rounded-2xl animate-pulse flex items-center justify-center">
            <Zap className="text-white/20 animate-bounce" />
        </div>
    );

    const level = Math.floor(Math.sqrt((profile?.experiencePoints || 0) / 100)) + 1;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const progress = ((profile?.experiencePoints || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

    return (
        <Card className="p-6 glass-v2 border-white/10 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-500" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-surface flex items-center justify-center border border-white/20 shadow-xl">
                            <span className="text-2xl font-black text-white italic">{level}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center border-2 border-white shadow-lg">
                            <Zap size={12} className="text-white fill-white" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-tighter text-xl italic flex items-center gap-2">
                            Level {level} Master
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0 border italic">
                                Active Streak: {profile?.streakCount}d
                            </Badge>
                        </h4>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Current Tier: <span className="text-white">{profile?.currentTier?.displayName || 'Neural Pioneer'}</span>
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Neural Core Score</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(profile?.neuralScore || 0.5) * 100}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                            />
                        </div>
                        <span className="text-xs font-black text-white">{(profile?.neuralScore || 0.5).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 italic">
                        <span>XP Progress</span>
                        <span>{profile?.experiencePoints} / {nextLevelXP} XP</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-xl overflow-hidden border border-white/10 p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-primary via-surface to-primary rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Award size={10} className="group-hover/item:text-yellow-400 transition-colors" />
                            Active Rewards
                        </p>
                        <p className="text-sm font-black text-white italic">2 UNCLAIMED</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Target size={10} className="group-hover/item:text-blue-400 transition-colors" />
                            Next Milestone
                        </p>
                        <p className="text-sm font-black text-white italic">5 ORDERS LEFT</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Map, Navigation, Search, Filter,
    Truck, Users, Timer, Activity,
    ShieldCheck, Zap, Globe, Expand,
    Maximize2, List, MoreVertical, CheckCircle2
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function DispatchConsole() {
    const [viewMode, setViewMode] = useState<'Map' | 'Grid'>('Map');

    const activeMissions = [
        { id: 'M-1250', driver: 'Ahmed Nile', target: 'Zamalek', status: 'IN_TRANSIT', progress: 45, time: '4m' },
        { id: 'M-1248', driver: 'Sara Cairo', target: 'Downtown', status: 'PICKUP', progress: 12, time: '2m' },
        { id: 'M-1252', driver: 'Karim Giza', target: 'Maadi', status: 'IN_TRANSIT', progress: 85, time: '12m' },
        { id: 'M-1255', driver: 'Layla Dubai', target: 'Marina', status: 'COMPLETED', progress: 100, time: '---' }
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-8">
            {/* Control Bar */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-text rounded-lg text-primary">
                            <Map size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-text uppercase tracking-tighter">Live Dispatch</h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="p-1 bg-surface rounded-2xl flex border-2 border-transparent focus-within:border-text transition-all">
                        <button
                            onClick={() => setViewMode('Map')}
                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${viewMode === 'Map' ? 'bg-text text-background shadow-lg' : 'text-text opacity-30'}`}
                        >
                            Map View
                        </button>
                        <button
                            onClick={() => setViewMode('Grid')}
                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${viewMode === 'Grid' ? 'bg-text text-background shadow-lg' : 'text-text opacity-30'}`}
                        >
                            Grid View
                        </button>
                    </div>
                    <Button variant="outline" className="h-14 px-8 border-2 border-text text-text font-black uppercase tracking-widest rounded-2xl hover:bg-surface transition-all">
                        <Filter size={18} className="mr-2" />
                        Filters
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex gap-8">
                {/* Main View Area */}
                <div className="flex-1 bg-text rounded-[3rem] relative overflow-hidden border-2 border-text shadow-2xl">
                    {/* Simulated Map Layer */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

                    {/* Simulated Path Trajectories */}
                    <svg className="absolute inset-0 w-full h-full stroke-primary opacity-10 stroke-[2] fill-none">
                        <path d="M100,200 Q400,300 800,400" className="animate-pulse" />
                        <path d="M200,800 Q500,600 900,100" />
                    </svg>

                    {/* Active Driver Nodes on Map */}
                    {activeMissions.slice(0, 3).map((m, i) => (
                        <motion.div
                            key={m.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="absolute"
                            style={{ top: `${20 + i * 25}%`, left: `${30 + i * 20}%` }}
                        >
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-text shadow-2xl border-4 border-primary group-hover:scale-110 transition-transform">
                                    <Truck size={24} className="text-primary" />
                                </div>
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 mt-2 w-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Card className="p-3 bg-text text-background border-0 shadow-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{m.driver}</p>
                                        <p className="text-[8px] font-bold text-background opacity-50 uppercase">{m.target} • {m.time} remaining</p>
                                    </Card>
                                </div>
                                <div className="absolute inset-0 w-12 h-12 bg-primary rounded-2xl animate-ping opacity-20" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Hud Overlays */}
                    <div className="absolute top-8 left-8 flex flex-col gap-4">
                        <div className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/5 rounded-2xl text-background">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Global Coverage</p>
                            <p className="text-2xl font-black font-mono tracking-tighter">84.2%</p>
                        </div>
                        <div className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/5 rounded-2xl text-background">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Active Signal</p>
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-emerald-500" />
                                <span className="text-xl font-black font-mono tracking-tighter">Optimal</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 right-8 flex gap-3">
                        <Button className="w-14 h-14 bg-white text-text rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                            <Maximize2 size={24} />
                        </Button>
                        <Button className="w-14 h-14 bg-white text-text rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                            <Globe size={24} />
                        </Button>
                    </div>
                </div>

                {/* Right Panel - Active Missions Feed */}
                <div className="w-96 flex flex-col gap-6 shrink-0 overflow-y-auto no-scrollbar">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 px-2">Mission Intelligence</h3>
                    {activeMissions.map((mission, i) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-6 border-2 border-surface bg-white hover:border-text transition-all group cursor-pointer relative overflow-hidden">
                                {mission.status === 'COMPLETED' && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-text opacity-40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        <Navigation size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-text uppercase tracking-tight">{mission.driver}</h4>
                                        <p className="text-[10px] font-bold text-text opacity-30 uppercase tracking-widest">{mission.target}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                                        <span>Progress</span>
                                        <span>{mission.time} remaining</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${mission.progress}%` }}
                                            className={`h-full ${mission.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary'}`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Badge className="bg-surface text-text/40 text-[8px] font-black border-0 uppercase">{mission.status}</Badge>
                                        <Button variant="outline" className="h-8 w-8 p-0 border-2 border-surface rounded-lg opacity-20 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    <Button className="w-full h-14 bg-surface text-text font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-text hover:text-background transition-all border-2 border-text/5">
                        <Expand size={14} className="mr-2" />
                        Expand Data Intelligence
                    </Button>
                </div>
            </div>
        </div>
    );
}

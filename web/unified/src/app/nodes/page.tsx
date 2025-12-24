"use client";

import React from 'react';
import { Globe, Map, Activity, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function NodesPage() {
    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Edge Nodes</h1>
                    <p className="text-zinc-500 font-medium">Global consensus network status and health.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 h-[600px] rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center p-12">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px]" />
                        <div className="relative text-center max-w-md">
                            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <Globe size={48} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 uppercase italic tracking-tighter">Initializing Global Map</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-10 uppercase font-bold tracking-widest text-xs">Connecting to P2P relay mesh to identify peer distribution...</p>
                            <div className="flex justify-center gap-12">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">84</div>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Active Peers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">12ms</div>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Mesh Latency</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-2">Top Performers</h4>
                        {[
                            { name: 'Cairo-North-1', load: '42%', color: 'text-blue-500' },
                            { name: 'Dubai-Main-2', load: '18%', color: 'text-purple-500' },
                            { name: 'London-Edge-4', load: '65%', color: 'text-emerald-500' },
                            { name: 'Paris-Node-1', load: '31%', color: 'text-amber-500' },
                        ].map((node, i) => (
                            <GlassCard key={i} className="p-4 py-6 border-white/[0.03]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity size={16} className={node.color} />
                                        <span className="text-sm font-bold">{node.name}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-zinc-500">{node.load}</span>
                                </div>
                            </GlassCard>
                        ))}

                        <div className="p-8 rounded-[2rem] border border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center opacity-40">
                            <Shield size={32} className="text-zinc-600 mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Peer Security Check: 100%</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

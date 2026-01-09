"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Cpu, Globe, Lock, Zap, TrendingUp, Shield,
    Network, ArrowRight, Server, Database, Layers, X,
    Play, Pause, ShoppingCart, Truck, Activity, Radar,
    ShieldCheck, Wifi
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import Link from 'next/link';
import { useDemo } from '@shared/contexts/DemoContext';
import { Map as MapIcon, Navigation } from 'lucide-react';

const TacticalMapView = () => {
    return (
        <div className="absolute inset-0 z-10 p-12 overflow-hidden flex items-center justify-center">
            {/* City Grid Skeleton */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Dynamic Routes */}
            <svg className="w-full h-full relative" viewBox="0 0 800 600">
                <motion.path
                    d="M 100 100 Q 400 50 700 300"
                    fill="none"
                    stroke="#F5B301"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.path
                    d="M 200 500 Q 100 300 600 100"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="12 12"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />

                {/* Driver Nodes */}
                {[
                    { x: 100, y: 100, id: 'D-01' },
                    { x: 700, y: 300, id: 'D-02' },
                    { x: 600, y: 100, id: 'D-03' }
                ].map((node, i) => (
                    <g key={i}>
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="4"
                            fill="#F5B301"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        />
                        <text x={node.x + 8} y={node.y + 4} className="text-[10px] font-mono fill-white/20 uppercase font-black">{node.id}</text>
                    </g>
                ))}
            </svg>

            {/* Tactical HUD Overlay */}
            <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-[#F5B301]/10 text-[#F5B301] rounded-xl">
                    <Navigation size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F5B301]">Real-time Dispatch</p>
                    <p className="text-xs font-mono font-bold">OPTIMizing_ROUTES // 98%_EFFICIENCY</p>
                </div>
            </div>
        </div>
    );
};

const BlockLedgerView = ({ state }: { state: any }) => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                <AnimatePresence>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={state.blockHeight - i}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1 - i * 0.1, y: 0 }}
                            className={`p-4 rounded-2xl border glass-v2 flex flex-col justify-between h-32
                ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 bg-white/5 rounded-md">
                                    <Database size={12} className={i === 0 ? 'text-emerald-400' : 'text-gray-500'} />
                                </div>
                                <span className="text-[9px] font-mono text-white/20">#{state.blockHeight - i}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Finality</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                                    <p className="text-xs font-mono">0x{Math.random().toString(16).substr(2, 6)}...f2</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center gap-8 px-8 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                    <Layers className="text-blue-400 w-5 h-5" />
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Settlement Bridge</p>
                        <p className="text-sm font-bold text-white uppercase italic">Active_Flow // LayerZero_V2</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[9px] uppercase font-black text-white/20">TPS</p>
                        <p className="text-xs font-mono font-bold text-emerald-400">{Math.round(state.tps)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] uppercase font-black text-white/20">Finality_L2</p>
                        <p className="text-xs font-mono font-bold text-white">0.8s</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResilienceLayerView = ({ state }: { state: any }) => {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                {[
                    { label: 'Cluster_Alpha', region: 'ME-NORTH', nodes: 842, status: 'STABLE', icon: Globe },
                    { label: 'Cluster_Delta', region: 'DE-WEST', nodes: 612, status: 'RESERVING', icon: Server },
                    { label: 'Shadow_Mesh', region: 'GLOBAL', nodes: 1240, status: 'STANDBY', icon: ShieldCheck },
                    { label: 'Edge_Hubs', region: 'APAC-S', nodes: 212, status: 'STABLE', icon: Wifi },
                ].map((cluster, i) => (
                    <motion.div
                        key={cluster.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[2rem] border glass-v2 bg-white/5 border-white/10 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <cluster.icon size={20} className="text-blue-400" />
                            </div>
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px] font-black tracking-widest">
                                {cluster.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{cluster.region}</p>
                            <h4 className="text-lg font-bold text-white uppercase italic">{cluster.label}</h4>
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-bold text-white/20">
                                <span>Healthy Nodes</span>
                                <span>{cluster.nodes}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '92%' }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 flex items-center gap-12 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <Activity className="text-emerald-400 w-6 h-6 animate-pulse" />
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Protocol Heartbeat</p>
                        <p className="text-sm font-mono font-bold text-white uppercase italic">Active_Monitoring // 0.8sLatency</p>
                    </div>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[10px] uppercase font-black text-white/20 mb-1">Global Health</p>
                        <p className="text-2xl font-black text-emerald-500 font-mono tracking-tighter">99.998%</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-white/20 mb-1">Shadow Sync</p>
                        <p className="text-2xl font-black text-blue-400 font-mono tracking-tighter">12ms</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MasterOrchestrationDemo() {
    const { simulatedState, isDemoMode, setIsPlaying } = useDemo() as any;
    const [activeLayer, setActiveLayer] = useState<'terminal' | 'intelligence' | 'fleet' | 'settlement' | 'resilience'>('terminal');

    const ecosystemLayers = [
        {
            id: 'terminal',
            name: 'Terminal Layer',
            icon: ShoppingCart,
            color: 'text-blue-400',
            description: 'Global POS & Marketplace nodes generating transactional demand.',
            metrics: ['Active Sessions: 12,402', 'Demand Delta: +14.2%']
        },
        {
            id: 'intelligence',
            name: 'Intelligence Layer',
            icon: Brain,
            color: 'text-emerald-400',
            description: 'Autonomous Protocol (Negotiations & Multi-Timeline Simulations).',
            metrics: ['Agents Active: 12', 'Neural Load: 28%']
        },
        {
            id: 'fleet',
            name: 'Fleet Layer',
            icon: Truck,
            color: 'text-[#F5B301]',
            description: 'Logistics Orchestration & Real-time Driver Dispatch.',
            metrics: ['Drivers Syncing: 894', 'Dispatch Latency: 1.2s']
        },
        {
            id: 'settlement',
            name: 'Settlement Layer',
            icon: Lock,
            color: 'text-white',
            description: 'Atomic Payouts & Multi-Chain Consensus Finality.',
            metrics: ['Block Height: #' + simulatedState.blockHeight.toLocaleString(), 'TPS: ' + Math.round(simulatedState.tps)]
        },
        {
            id: 'resilience',
            name: 'Resilience Layer',
            icon: ShieldCheck,
            color: 'text-indigo-400',
            description: 'Autonomous Healing & Shadow Mesh Synchronization.',
            metrics: ['Clusters Stable: 4/4', 'Failover Latency: 0.4s']
        }
    ];

    // Auto-cycle through layers for orchestration feel
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveLayer(prev => {
                const currentIndex = ecosystemLayers.findIndex(l => l.id === prev);
                return ecosystemLayers[(currentIndex + 1) % ecosystemLayers.length].id as any;
            });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#020817] text-white selection:bg-emerald-500/30 selection:text-emerald-400 antialiased overflow-hidden font-sans">
            {/* Neural HUD Overlay */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20">
                                <Activity size={24} className="text-[#020817]" />
                            </div>
                            <div>
                                <span className="font-black uppercase tracking-tighter text-2xl italic flex items-center gap-2">
                                    NileLink <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded italic opacity-50 NOT-ITALIC not-italic">V3.0_HUD</span>
                                </span>
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-emerald-500/60 mt-0.5">Global Nervous System</p>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 border-l border-white/10 pl-12">
                            {[
                                { label: 'TPS', value: Math.round(simulatedState.tps), color: 'text-emerald-400' },
                                { label: 'BLOCK', value: '#' + simulatedState.blockHeight, color: 'text-white/40' },
                                { label: 'ORCHESTRATION', value: activeLayer.toUpperCase(), color: 'text-blue-400 animate-pulse' }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">{stat.label}</span>
                                    <span className={`text-[11px] font-black font-mono tracking-widest ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-12">
                                Enter Dashboard
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" className="text-white/20 hover:text-white uppercase text-[10px] font-black tracking-widest">
                                <X size={20} className="mr-2" /> EXIT
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Orchestration Canvas */}
            <main className="pt-32 pb-12 px-8 max-w-[1600px] mx-auto h-screen flex flex-col">
                <div className="flex-1 grid lg:grid-cols-12 gap-12 items-center">

                    {/* Left: Tactical Insights */}
                    <div className="lg:col-span-4 space-y-12 h-full flex flex-col justify-center">
                        <div className="space-y-6">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black px-4 py-2 text-[10px] uppercase tracking-[0.3em]">
                                Autonomous Mode Active
                            </Badge>
                            <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic">
                                The <span className="text-white/30 truncate">Dynamic</span> <br /> Orchestrator.
                            </h1>
                            <p className="text-sm text-white/40 font-medium uppercase tracking-tight max-w-sm leading-relaxed">
                                NileLink intelligently routes value, risk, and logistics across a global node network in real-time.
                            </p>
                        </div>

                        {/* Layer Switcher */}
                        <div className="space-y-3">
                            {ecosystemLayers.map((layer) => (
                                <button
                                    key={layer.id}
                                    onClick={() => setActiveLayer(layer.id as any)}
                                    className={`w-full p-6 rounded-[2rem] border transition-all text-left group flex items-center justify-between ${activeLayer === layer.id
                                        ? 'bg-white/5 border-white/20 shadow-2xl shadow-emerald-500/5'
                                        : 'bg-transparent border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeLayer === layer.id ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'}`}>
                                            <layer.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black uppercase tracking-tighter text-sm italic">{layer.name}</h3>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{layer.id === 'intelligence' ? 'NEURAL MESH' : 'ACTIVE NODE'}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className={`transition-transform ${activeLayer === layer.id ? 'translate-x-0' : '-translate-x-4 opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: The Visualization Hub */}
                    <div className="lg:col-span-8 relative h-[80vh] flex flex-col justify-center">
                        <div className="relative aspect-[4/3] max-h-full bg-black/40 border border-white/5 rounded-[4rem] overflow-hidden group shadow-2xl">
                            {/* Neural Background */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>

                            {/* Data Flow Visualization */}
                            <div className="absolute inset-0 flex items-center justify-center p-20">
                                <div className="grid grid-cols-2 gap-12 w-full max-w-2xl relative">

                                    {/* Connection Lines (Framer Motion) */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                        <motion.path
                                            d="M 120 120 L 480 120 L 480 480 L 120 480 Z"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            strokeDasharray="10 10"
                                            animate={{ strokeDashoffset: [0, -100] }}
                                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <AnimatePresence mode="wait">
                                        {activeLayer === 'fleet' ? (
                                            <motion.div
                                                key="tactical-map"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                <TacticalMapView />
                                            </motion.div>
                                        ) : activeLayer === 'settlement' ? (
                                            <motion.div
                                                key="block-ledger"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                <BlockLedgerView state={simulatedState} />
                                            </motion.div>
                                        ) : activeLayer === 'resilience' ? (
                                            <motion.div
                                                key="resilience-mesh"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0"
                                            >
                                                <ResilienceLayerView state={simulatedState} />
                                            </motion.div>
                                        ) : (
                                            ecosystemLayers.map((layer, i) => (
                                                <motion.div
                                                    key={layer.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{
                                                        opacity: activeLayer === layer.id ? 1 : 0.3,
                                                        scale: activeLayer === layer.id ? 1.05 : 1,
                                                    }}
                                                    className={`relative p-8 rounded-[3rem] border transition-all flex flex-col items-center text-center cursor-pointer overflow-hidden ${activeLayer === layer.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'
                                                        }`}
                                                    onClick={() => setActiveLayer(layer.id as any)}
                                                >
                                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${activeLayer === layer.id ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-white/20'}`}>
                                                        <layer.icon size={32} />
                                                    </div>
                                                    <h4 className="font-black tracking-widest uppercase text-xs mb-4">{layer.name}</h4>

                                                    <div className="space-y-1.5 w-full">
                                                        {layer.metrics.map((m, j) => (
                                                            <div key={j} className="text-[9px] font-mono text-white/40 uppercase tracking-tighter truncate">{m}</div>
                                                        ))}
                                                    </div>

                                                    {/* Pulse Effect for active */}
                                                    {activeLayer === layer.id && (
                                                        <motion.div
                                                            className="absolute inset-0 border-2 border-emerald-500/50 rounded-[3rem]"
                                                            animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                    )}
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Floating Stats Bar */}
                            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[300px]">
                                    <h5 className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-[0.2em] italic flex items-center gap-2">
                                        <Radar size={12} className="text-emerald-500 animate-pulse" /> Layer_Insight: {activeLayer}
                                    </h5>
                                    <p className="text-xs font-black text-white italic leading-snug">
                                        {ecosystemLayers.find(l => l.id === activeLayer)?.description}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-20 w-1.5 bg-emerald-500 animate-pulse rounded-full" />
                                    <div className="h-12 w-1.5 bg-white/10 rounded-full" />
                                    <div className="h-16 w-1.5 bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Telemetry */}
                <div className="mt-auto flex items-center justify-between opacity-30 pt-12">
                    <div className="flex gap-12 font-mono text-[9px] font-black uppercase tracking-[0.4em]">
                        <div className="flex items-center gap-3"><Cpu size={14} /> CLUSTER_STABLE</div>
                        <div className="flex items-center gap-3 text-emerald-500"><Activity size={14} /> HEALING_AGENT_LIVE</div>
                        <div className="flex items-center gap-3"><Globe size={14} /> MESH_SYNC_READY</div>
                    </div>
                    <div className="font-mono text-[10px] font-black border-l border-white/10 pl-12 italic">
                        REVISION_X-88 // {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </main>
        </div>
    );
}

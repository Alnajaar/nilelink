"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Globe, Map as MapIcon, Activity, Shield, Server, Zap, Clock, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { mockSmartNodes } from '@/lib/mockData';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function NodesPage() {
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Enhanced mock data with more details
    const enhancedNodes = mockSmartNodes.map(node => ({
        ...node,
        status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'warning' : 'offline',
        uptime: Math.floor(Math.random() * 100),
        tps: Math.floor(Math.random() * 1000) + 100,
        latency: Math.floor(Math.random() * 50) + 10,
        region: node.name.includes('Cairo') ? 'Middle East' :
            node.name.includes('Dubai') ? 'Middle East' :
                node.name.includes('London') ? 'Europe' :
                    node.name.includes('Paris') ? 'Europe' :
                        node.name.includes('New York') ? 'North America' :
                            node.name.includes('Tokyo') ? 'Asia Pacific' :
                                node.name.includes('Sydney') ? 'Asia Pacific' :
                                    node.name.includes('Mumbai') ? 'Asia Pacific' : 'Global'
    }));

    const filteredNodes = filterStatus === 'all'
        ? enhancedNodes
        : enhancedNodes.filter(node => node.status === filterStatus);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Wifi size={16} className="text-emerald-500" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'offline':
                return <WifiOff size={16} className="text-red-500" />;
            default:
                return <Server size={16} className="text-zinc-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            offline: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return (
            <Badge className={colors[status as keyof typeof colors]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const totalNodes = enhancedNodes.length;
    const activeNodes = enhancedNodes.filter(n => n.status === 'active').length;
    const avgLatency = Math.round(enhancedNodes.reduce((sum, n) => sum + n.latency, 0) / totalNodes);

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Edge Nodes</h1>
                        <p className="text-zinc-500 font-medium">Global consensus network status and health.</p>
                    </div>
                    <div className="flex gap-3">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {activeNodes}/{totalNodes} Online
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {avgLatency}ms Avg Latency
                        </Badge>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Network Overview Stats */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <Globe size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Nodes</p>
                                    <p className="text-2xl font-black text-white">{totalNodes}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-blue-500/10">
                                    <Activity size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Nodes</p>
                                    <p className="text-2xl font-black text-white">{activeNodes}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-purple-500/10">
                                    <Zap size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Avg TPS</p>
                                    <p className="text-2xl font-black text-white">
                                        {Math.round(enhancedNodes.reduce((sum, n) => sum + n.tps, 0) / totalNodes)}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-orange-500/10">
                                    <Clock size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Avg Latency</p>
                                    <p className="text-2xl font-black text-white">{avgLatency}ms</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Map Section */}
                    <div className="lg:col-span-3">
                        <GlassCard className="p-6 h-[600px] relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Global Node Distribution</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('active')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('warning')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'warning' ? 'bg-amber-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                            }`}
                                    >
                                        Warning
                                    </button>
                                </div>
                            </div>
                            <Map
                                locations={filteredNodes}
                                center={[20, 0]}
                                zoom={2}
                                height="480px"
                                className="rounded-2xl"
                            />
                        </GlassCard>
                    </div>

                    {/* Node Details Sidebar */}
                    <div className="space-y-6">
                        {selectedNode ? (
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-bold text-lg">{selectedNode.name}</h4>
                                    {getStatusBadge(selectedNode.status)}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Region</label>
                                            <div className="text-sm font-bold text-white mt-1">{selectedNode.region}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Load</label>
                                            <div className="text-sm font-bold text-white mt-1">{selectedNode.load}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Performance</label>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-400">TPS</span>
                                                <span className="font-bold text-white">{selectedNode.tps}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-400">Latency</span>
                                                <span className="font-bold text-white">{selectedNode.latency}ms</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-400">Uptime</span>
                                                <span className="font-bold text-emerald-400">{selectedNode.uptime}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard className="p-8 text-center border-dashed border-white/20">
                                <Globe size={32} className="mx-auto mb-4 text-zinc-600" />
                                <h4 className="text-lg font-bold text-white mb-2">Select Node</h4>
                                <p className="text-sm text-zinc-500">Click on a node on the map to view details.</p>
                            </GlassCard>
                        )}

                        {/* Node List */}
                        <GlassCard className="p-6">
                            <h4 className="font-bold text-lg mb-6">All Nodes</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredNodes.map((node, i) => (
                                    <div
                                        key={i}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-white/20 ${selectedNode?.id === node.id
                                                ? 'bg-blue-500/10 border-blue-500/20'
                                                : 'bg-white/5 border-white/5'
                                            }`}
                                        onClick={() => setSelectedNode(node)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(node.status)}
                                                <span className="text-sm font-bold text-white">{node.name}</span>
                                            </div>
                                            {getStatusBadge(node.status)}
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>{node.region}</span>
                                            <span>{node.load} load</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Network Health */}
                        <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield size={20} className="text-emerald-400" />
                                <h4 className="font-bold text-lg">Network Health</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Consensus</span>
                                    <span className="text-sm font-bold text-emerald-400">100%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Security</span>
                                    <span className="text-sm font-bold text-emerald-400">Verified</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-400">Last Incident</span>
                                    <span className="text-sm font-bold text-white">247d ago</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

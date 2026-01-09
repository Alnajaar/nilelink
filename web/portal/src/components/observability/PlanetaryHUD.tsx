'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    ShieldAlert,
    Zap,
    Globe,
    Server,
    Wifi,
    Triangle,
    AlertCircle,
    Play,
    Settings2,
    Database,
    RefreshCcw
} from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import dynamic from 'next/dynamic';

const NetworkMap = dynamic(() => import('@shared/components/NetworkMap'), { ssr: false });

export default function PlanetaryHUD() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [activeStressors, setActiveStressors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInjecting, setIsInjecting] = useState(false);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/resilience/health/global');
            const json = await res.json();
            if (json.success) {
                // Map backend nodes to NetworkMap format
                const mappedNodes = json.data.nodes.map((n: any, i: number) => ({
                    id: n.id,
                    name: n.type,
                    status: n.status === 'HEALTHY' ? 'online' : 'degraded',
                    latitude: 30 + (i * 2), // Mock positions for visualization
                    longitude: 31 + (i * 5),
                    region: n.region,
                    load: n.load || 'Normal'
                }));
                setNodes(mappedNodes);
                setActiveStressors(json.data.activeStressors);
            }
        } catch (err) {
            console.error('Fetch health failed', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerChaos = async (type: string) => {
        setIsInjecting(true);
        try {
            await fetch('http://localhost:3001/api/resilience/chaos/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type,
                    target: nodes[1]?.id || 'supplier-delta-01',
                    duration: 60,
                    severity: 8
                })
            });
            fetchHealth();
        } catch (err) {
            console.error('Trigger chaos failed', err);
        } finally {
            setTimeout(() => setIsInjecting(false), 2000);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 h-[600px] relative">
                    <NetworkMap nodes={nodes} height="100%" />

                    <div className="absolute top-6 left-6 z-20 space-y-4 pointer-events-none">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Globe className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Planetary Sync</p>
                                <p className="text-sm font-mono font-bold text-white">NODES_ACTIVE // 2,401</p>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {activeStressors.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl flex items-center gap-4"
                                >
                                    <ShieldAlert className="text-red-400 w-5 h-5 animate-pulse" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-red-200 tracking-widest">Chaos Active</p>
                                        <p className="text-xs font-mono font-bold text-white">{activeStressors[0].type}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-white/5 border-white/10 glass-v2">
                        <h3 className="text-sm font-black uppercase text-white/40 mb-6 flex items-center gap-2 tracking-widest">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Chaos Agent v1.0
                        </h3>

                        <div className="space-y-3">
                            {[
                                { label: 'Inject Node Failure', type: 'NODE_FAILURE', icon: Server },
                                { label: 'Network Congestion', type: 'NETWORK_LATENCY', icon: Wifi },
                                { label: 'Bridge Disruption', type: 'BRIDGE_CONGESTION', icon: Triangle },
                                { label: 'Supplier Outage', type: 'SUPPLIER_OUTAGE', icon: AlertCircle }
                            ].map((btn) => (
                                <Button
                                    key={btn.type}
                                    disabled={isInjecting}
                                    onClick={() => triggerChaos(btn.type)}
                                    className="w-full justify-start gap-4 bg-white/5 hover:bg-red-500 hover:text-white border-white/5 transition-all py-6 h-auto text-xs font-bold uppercase tracking-widest relative overflow-hidden group"
                                >
                                    <btn.icon className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                    {btn.label}
                                    {isInjecting && <RefreshCcw className="absolute right-4 w-4 h-4 animate-spin opacity-40" />}
                                </Button>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-black/40 border-white/5 space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Protocol Resilience</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Circuit Breaker</span>
                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/20">READY</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Node Failover</span>
                                <span className="text-white font-mono">0.4s (Simulated)</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '99%' }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                            <p className="text-[9px] text-gray-500 italic leading-relaxed">
                                NileLink Autonomous Recovery logic is currently monitoring 12,402 edge transactions per second.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

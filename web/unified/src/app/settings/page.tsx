"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Settings, Globe, Shield, Zap, Database,
    Bell, Lock, Cpu, Save, RefreshCcw,
    ChevronRight, AlertCircle, Info, Server
} from 'lucide-react';

import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export default function ProtocolSettings() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Protocol');

    const tabs = ['Protocol', 'Network', 'Security', 'Webhooks', 'Regional'];

    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <UniversalHeader
                appName="Command Center"
                user={{ name: "Super Admin", role: "Root Protocol Access" }}
            />

            <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-text rounded-lg text-primary">
                                <Settings size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-text uppercase tracking-tighter">Protocol Configuration</h1>
                        </div>
                        <p className="text-text opacity-40 font-black uppercase text-[10px] tracking-[0.3em] ml-12">Global Network Parameters • v4.0.2</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 px-8 border-2 border-text text-text font-black uppercase tracking-widest rounded-2xl hover:bg-surface transition-all">
                            <RefreshCcw size={18} className="mr-2" />
                            Discard Changes
                        </Button>
                        <Button className="h-14 px-10 bg-text text-background font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-xl shadow-text/10">
                            <Save size={18} className="mr-2" />
                            Propagate Config
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Navigation Rail */}
                    <div className="lg:col-span-3 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-between group ${activeTab === tab ? 'bg-text text-background shadow-xl' : 'hover:bg-surface text-text opacity-40 hover:opacity-100'
                                    }`}
                            >
                                {tab}
                                <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${activeTab === tab ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                        ))}

                        <div className="mt-12 p-8 rounded-[2.5rem] bg-surface/50 border-2 border-dashed border-surface">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle size={20} className="text-primary mt-1" />
                                <p className="text-[10px] font-black uppercase text-text opacity-60 tracking-wider leading-relaxed">
                                    Changes to protocol parameters require 2/3 validator consensus to take effect.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full h-10 border-2 border-text text-text font-black text-[8px] uppercase tracking-widest rounded-xl hover:bg-text hover:text-background transition-all">
                                View Consensus Status
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Core {activeTab} Variables</h3>
                                    <div className="h-px flex-1 bg-surface" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Settlement Threshold', value: '42%', desc: 'Minimum node consensus required for automatic revenue anchoring.', type: 'slider' },
                                        { label: 'Anchor Fee Rate', value: '0.002 NL', desc: 'Base protocol fee charged per cross-regional settlement event.', type: 'input' },
                                        { label: 'Block Finality Delta', value: '1.2s', desc: 'Target time between block propagation and network-wide finality.', type: 'input' },
                                        { label: 'Edge Proximity Optimization', value: 'ON', desc: 'Automatically route requests to the nearest edge validator node.', type: 'toggle' }
                                    ].map((field, i) => (
                                        <Card key={i} className="p-8 border-2 border-surface bg-white hover:border-text transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text opacity-40">{field.label}</label>
                                                <Badge className="bg-primary/10 text-primary uppercase border-0 font-black text-[8px]">Propagated</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <input
                                                    type="text"
                                                    defaultValue={field.value}
                                                    className="flex-1 bg-surface h-14 rounded-2xl px-6 font-mono font-black text-xl border-2 border-transparent focus:border-text outline-none transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-text opacity-40 font-medium leading-relaxed">{field.desc}</p>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Advanced Overrides</h3>
                                    <div className="h-px flex-1 bg-surface" />
                                </div>

                                <Card className="p-8 border-2 border-text bg-text text-background relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <Shield size={120} />
                                    </div>
                                    <div className="relative max-w-xl">
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Manual Consensus Override</h4>
                                        <p className="text-sm opacity-60 font-medium mb-8 leading-relaxed">
                                            Only use this in emergency protocol failure scenarios. Forcing consensus bypasses standard validator voting and anchors states via root-key authorization.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button className="h-12 px-8 bg-primary text-background font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all">
                                                Initialize Override
                                            </Button>
                                            <Button variant="outline" className="h-12 px-8 border-2 border-background/20 text-background font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-background hover:text-text transition-all">
                                                Audit Docs
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </section>

                            <section>
                                <Card className="p-8 border-2 border-dashed border-surface bg-surface/20 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-text opacity-20">
                                            <Server size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-text uppercase tracking-tighter">Backup Configuration Flow</h4>
                                            <p className="text-sm font-medium text-text opacity-40">Export current environment variables and protocol states.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="h-14 px-8 border-2 border-text text-text font-black uppercase tracking-widest rounded-2xl hover:bg-text hover:text-background transition-all">
                                        Export JSON Config
                                    </Button>
                                </Card>
                            </section>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

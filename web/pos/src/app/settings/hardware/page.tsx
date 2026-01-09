"use client";

import React, { useState, useEffect } from 'react';
import {
    Cpu, Printer, Smartphone, Search, Plus, Settings,
    RefreshCw, ShieldCheck, CreditCard, Box, Zap,
    Activity, ArrowLeft, Terminal, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

interface Device {
    id: string;
    productName: string;
    manufacturerName: string;
    serialNumber?: string;
    type: 'printer' | 'scanner' | 'unknown';
}

export default function HardwareSettings() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial mock device
        setDevices([
            {
                id: 'usb-72x1',
                productName: 'Protocol-X Thermal Printer',
                manufacturerName: 'NILELINK CORE',
                serialNumber: 'NL-PRN-8829',
                type: 'printer'
            }
        ]);
    }, []);

    const scanForDevices = async () => {
        setIsSearching(true);
        setTimeout(() => {
            const mockDevice: Device = {
                id: `usb-${Math.random().toString(36).substr(2, 4)}`,
                productName: 'Quantum Scan Pro',
                manufacturerName: 'NILELINK EDGE',
                serialNumber: 'NL-SCN-4421',
                type: 'scanner'
            };
            setDevices(prev => [...prev, mockDevice]);
            setIsSearching(false);
        }, 2000);
    };

    const runTestPrint = (device: Device) => {
        // Test sequence simulation
        console.log(`Executing test sequence on ${device.id}`);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <header className="px-10 py-10 flex justify-between items-center relative z-10 bg-white/40 backdrop-blur-2xl border-b border-border-subtle sticky top-0">
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary p-0 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic leading-none mb-2">Hardware Nodes</h1>
                        <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[9px] opacity-60 italic">Physical terminal & perimeter bridge control</p>
                    </div>
                </div>

                <Button
                    onClick={scanForDevices}
                    isLoading={isSearching}
                    className="h-14 px-8 bg-primary text-background font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <RefreshCw size={16} className={`mr-3 ${isSearching ? 'animate-spin' : ''}`} />
                    INITIALIZE DISCOVERY
                </Button>
            </header>

            <main className="max-w-7xl mx-auto p-12 space-y-12 relative z-10">
                {/* Active Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-primary" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">Connected Hardware Array</h2>
                        </div>
                        <Badge className="bg-success text-background text-[8px] font-black uppercase tracking-widest px-3 py-1">Nodes Active: {devices.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {devices.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-24 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-border-subtle"
                            >
                                <div className="w-20 h-20 bg-neutral rounded-full flex items-center justify-center mx-auto mb-6 text-text-secondary opacity-20">
                                    <Terminal size={40} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-text-secondary opacity-60">No hardware nodes detected in local perimeter.</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-2">Activate discovery to sync devices via USB.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {devices.map((device, idx) => (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white rounded-[2.5rem] p-8 border border-border-subtle shadow-xl hover:shadow-2xl transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 bg-neutral rounded-3xl flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform">
                                                {device.type === 'printer' ? <Printer size={32} /> : <Search size={32} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-xl font-black text-text-primary uppercase tracking-tight italic">{device.productName}</h4>
                                                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">USB 4.0</Badge>
                                                </div>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40 italic">
                                                    {device.manufacturerName} · HWID: {device.serialNumber}
                                                </p>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-success opacity-80">Online</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldCheck size={12} className="text-primary opacity-60" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-40">Secure Bridge</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                className="h-14 px-8 rounded-2xl border-border-subtle hover:bg-neutral font-black text-[9px] tracking-[0.2em] uppercase transition-all"
                                                onClick={() => runTestPrint(device)}
                                            >
                                                RUN TEST SEQUENCE
                                            </Button>
                                            <Button
                                                className="h-14 px-8 rounded-2xl bg-neutral text-text-primary hover:bg-neutral-dark font-black text-[9px] tracking-[0.2em] uppercase transition-all"
                                            >
                                                CONFIGURE NODE
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
                    <Card className="p-10 rounded-[3rem] bg-white border border-border-subtle shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Protocol Standard</h3>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">Data transmission encoding</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 'escpos', label: 'ESC/POS (Protocol Def)', desc: 'Industry standard for thermal nodes.' },
                                { id: 'star', label: 'Star Graphics System', desc: 'Accelerated for Star Micronics hardware.' },
                                { id: 'legacy', label: 'Legacy Text Driver', desc: 'Fallback for vintage matrix devices.' }
                            ].map(p => (
                                <label key={p.id} className="flex items-center justify-between p-6 bg-neutral/30 rounded-[1.5rem] border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-border-subtle flex items-center justify-center group-hover:border-primary transition-colors">
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform" />
                                        </div>
                                        <div>
                                            <span className="block font-black text-xs uppercase tracking-widest text-text-primary mb-1">{p.label}</span>
                                            <span className="text-[10px] font-medium text-text-secondary opacity-60">{p.desc}</span>
                                        </div>
                                    </div>
                                    <input type="radio" name="protocol" defaultChecked={p.id === 'escpos'} className="hidden" />
                                </label>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-10 rounded-[3rem] bg-white border border-border-subtle shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 blur-3xl rounded-full -mr-24 -mt-24" />
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-secondary">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Bridge Automation</h3>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">Triggered node sequences</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 'drawer', label: 'Quantum Drawer Pulse', desc: 'Auto-trigger on tangible asset settlement.' },
                                { id: 'print', label: 'Direct Kitchen Print', desc: 'Synchronous printing on order anchoring.' },
                                { id: 'label', label: 'Barcode Label Auto-Gen', desc: 'Print manifest IDs for all items.' }
                            ].map(a => (
                                <label key={a.id} className="flex items-center justify-between p-6 bg-neutral/30 rounded-[1.5rem] border border-transparent hover:border-secondary/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-6 h-6 rounded-lg bg-white border border-border-subtle flex items-center justify-center group-hover:border-secondary transition-colors">
                                            <Zap size={14} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div>
                                            <span className="block font-black text-xs uppercase tracking-widest text-text-primary mb-1">{a.label}</span>
                                            <span className="text-[10px] font-medium text-text-secondary opacity-60">{a.desc}</span>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked={a.id !== 'label'} className="hidden" />
                                </label>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Store,
    Receipt,
    Globe,
    Shield,
    Smartphone,
    Save,
    Upload,
    ChevronRight,
    Building2,
    ShieldCheck,
    CreditCard,
    Settings,
    Bell,
    CheckCircle2,
    AlertCircle,
    Activity
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Switch } from '@/shared/components/Switch';
import { Badge } from '@/shared/components/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const tabs = [
        { id: 'general', label: 'Business Profile', icon: Building2, desc: 'Identity & Brand' },
        { id: 'receipts', label: 'Fiscal Logic', icon: Receipt, desc: 'Tax & Receipts' },
        { id: 'online', label: 'Neural Store', icon: Globe, desc: 'Web Presence' },
        { id: 'security', label: 'SecOps Config', icon: Shield, desc: 'Access Control' },
        { id: 'devices', label: 'Device Hub', icon: Smartphone, desc: 'Unified Nodes' },
    ];

    return (
        <div className="min-h-screen bg-background-primary flex flex-col relative selection:bg-primary/20 overflow-hidden bg-mesh-primary antialiased">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 flex flex-col relative z-10 gap-8 p-8 lg:p-12">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-4">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="glass"
                            className="w-16 h-16 rounded-[1.5rem] border-2 border-border-default/50 hover:bg-white/10 text-text-primary transition-all shadow-xl backdrop-blur-3xl"
                            onClick={() => router.push('/admin')}
                        >
                            <ArrowLeft size={24} />
                        </Button>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-5xl lg:text-6xl font-black text-text-primary uppercase tracking-tighter italic leading-none">Global <span className="text-primary italic">Command</span></h1>
                                <Badge variant="primary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic shadow-glow-primary/20 border-primary/20 bg-primary/10">System Root</Badge>
                            </div>
                            <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">Configure Business Shards & Neural Operational Protocols</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-20 px-10 rounded-[2rem] bg-primary text-white hover:scale-105 active:scale-95 font-black tracking-[0.3em] uppercase text-[11px] shadow-glow-primary transition-all italic border-2 border-primary/20 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-4">
                                {isSaving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSaving ? 'UPDATING CORE...' : 'COMMIT CHANGES'}
                            </div>
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
                    {/* Settings Navigation */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-4">
                        <Card variant="glass" className="p-6 rounded-[3rem] border-2 border-border-default/50 shadow-2xl backdrop-blur-3xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                            <div className="space-y-2 relative z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all text-left relative group/btn
                                            ${activeTab === tab.id
                                                ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-glow-primary/5'
                                                : 'bg-transparent text-text-tertiary hover:bg-white/5 hover:text-text-primary'
                                            }
                                        `}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border ${activeTab === tab.id
                                                ? 'bg-primary text-white border-primary/30 shadow-glow-primary'
                                                : 'bg-background-tertiary/40 text-text-tertiary/60 border-border-default/50 group-hover/btn:border-primary/30 group-hover/btn:text-primary group-hover/btn:bg-primary/5'
                                            }`}>
                                            <tab.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black uppercase text-[11px] tracking-[0.2em] italic">{tab.label}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 italic mt-0.5 group-hover/btn:opacity-60 ${activeTab === tab.id ? 'text-primary opacity-60' : ''}`}>
                                                {tab.desc}
                                            </p>
                                        </div>
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="admin-nav-glow" className="absolute left-0 w-1.5 h-10 bg-primary rounded-full shadow-glow-primary" />
                                        )}
                                        <ChevronRight size={16} className={`opacity-0 group-hover/btn:opacity-100 transition-all ${activeTab === tab.id ? 'translate-x-0 opacity-40' : '-translate-x-2'}`} />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Node Sync Info */}
                        <Card variant="glass" className="p-8 rounded-[3rem] border-2 border-border-default/50 shadow-2xl backdrop-blur-3xl bg-primary/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-primary/20 rounded-[1.2rem] flex items-center justify-center text-primary border border-primary/30">
                                    <Settings size={22} className="animate-[spin_4s_linear_infinite]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Ecosystem Root</p>
                                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic mt-0.5">Configuration v2.0-Sync</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Content Area */}
                    <Card variant="glass" className="flex-1 border-2 border-border-default/50 rounded-[4rem] p-12 lg:p-16 overflow-y-auto shadow-3xl backdrop-blur-4xl relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 blur-[120px] rounded-full pointer-events-none -mr-64 -mt-64" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10 h-full"
                            >
                                {activeTab === 'general' && (
                                    <div className="max-w-4xl space-y-16">
                                        <section className="space-y-12">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Badge variant="primary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic shadow-glow-primary/20">Identity Matrix</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Business <span className="text-primary italic">Profile</span></h3>

                                            <div className="flex flex-col md:flex-row items-start gap-12">
                                                <div className="w-48 h-48 bg-background-tertiary/40 rounded-[3rem] border-2 border-dashed border-border-default/50 flex flex-col items-center justify-center text-text-tertiary/40 cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group/logo shadow-inner relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                                    <Upload size={32} className="mb-3 group-hover/logo:scale-110 group-hover/logo:shadow-glow-primary/20 transition-all" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest italic opacity-40 translate-y-2 group-hover/logo:translate-y-0 transition-transform">Upload Logo</span>
                                                </div>
                                                <div className="flex-1 w-full space-y-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Market Entity Name</label>
                                                        <Input defaultValue="Cairo Bistro" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Entity Brief</label>
                                                        <textarea
                                                            className="w-full p-8 bg-background-tertiary/40 border-2 border-border-default/50 rounded-[2rem] font-bold text-xs uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none min-h-[160px] italic transition-all shadow-xl placeholder:text-text-tertiary/20"
                                                            defaultValue="Authentic Egyptian cuisine served with modern flair."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="pt-16 border-t-2 border-border-default/30 space-y-12">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic border-border-default/50">Neural Contact</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Gateway <span className="text-primary italic">Routing</span></h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Administrator Email</label>
                                                    <Input defaultValue="admin@cairobistro.com" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Voice Comms Uplink</label>
                                                    <Input defaultValue="+20 123 456 7890" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                                <div className="col-span-full space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Physical Node Coordinates</label>
                                                    <Input defaultValue="12 Corniche El Nile, Maadi, Cairo" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'receipts' && (
                                    <div className="max-w-4xl space-y-16">
                                        <section className="space-y-12">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Badge variant="primary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic shadow-glow-primary/20">Fiscal Algorithm</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Tax <span className="text-primary italic">Equations</span></h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">VAT / Neural Surcharge (%)</label>
                                                    <Input defaultValue="14" type="number" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                                <div className="space-y-3 opacity-80">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Fiscal Shard ID</label>
                                                    <div className="h-20 bg-background-tertiary/20 border-2 border-border-default/30 rounded-[1.5rem] px-8 flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-widest text-text-tertiary italic">TX-992831</span>
                                                        <ShieldCheck className="text-primary/40" size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="pt-16 border-t-2 border-border-default/30 space-y-12">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic border-border-default/50">Output Customization</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Receipt <span className="text-primary italic">Manifest</span></h3>

                                            <div className="space-y-8">
                                                {[
                                                    { label: 'Neural Logo Imprint', desc: 'Saturate high-fidelity brand shards on physical output.', icon: Store, active: true },
                                                    { label: 'Wisdom Protocol Sink', desc: 'Incorporate randomized neural insights into decimal footer.', icon: Globe, active: true },
                                                    { label: 'SecOps Verification Hash', desc: 'Print protocol verification string for fiscal audits.', icon: ShieldCheck, active: false },
                                                ].map((toggle, i) => (
                                                    <div key={i} className="flex items-center justify-between p-8 bg-background-tertiary/20 backdrop-blur-3xl rounded-[2.5rem] border-2 border-border-default/50 hover:border-primary/30 transition-all group/toggle shadow-xl">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 bg-background-card/60 rounded-2xl border-2 border-border-default/50 flex items-center justify-center text-primary group-hover/toggle:scale-110 transition-transform shadow-inner">
                                                                <toggle.icon size={22} className="opacity-40 group-hover/toggle:opacity-100 transition-opacity" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-xs uppercase tracking-widest text-text-primary italic mb-1">{toggle.label}</p>
                                                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic leading-relaxed max-w-sm">{toggle.desc}</p>
                                                            </div>
                                                        </div>
                                                        <Switch defaultChecked={toggle.active} className="data-[state=checked]:bg-primary shadow-glow-primary/20 scale-125" />
                                                    </div>
                                                ))}

                                                <div className="space-y-3 pt-6">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Manifest Footer Broadcast</label>
                                                    <Input defaultValue="Thank you for dining with us! Follow us @cairobistro" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {/* Placeholder for other tabs */}
                                {(activeTab !== 'general' && activeTab !== 'receipts') && (
                                    <div className="h-full flex flex-col items-center justify-center py-40">
                                        <motion.div
                                            animate={{
                                                rotate: -360,
                                                scale: [1, 1.15, 1]
                                            }}
                                            transition={{
                                                rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                                                scale: { duration: 5, repeat: Infinity }
                                            }}
                                            className="mb-12 relative"
                                        >
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                            <Shield size={140} className="text-primary opacity-10 relative z-10" />
                                        </motion.div>

                                        <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-text-primary italic mb-4">Shard Integration</h3>

                                        <div className="flex items-center gap-3 px-8 py-3 bg-primary/10 border-2 border-primary/30 rounded-full mb-6 shadow-glow-primary/10">
                                            <Activity size={16} className="text-primary animate-pulse" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Node Calibration Active</p>
                                        </div>

                                        <p className="max-w-md text-center text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic leading-relaxed">
                                            This administrative segment is undergoing neural synchronization. The v2.0 protocol upgrade is saturation-point for this module. Verify uplink with Command Hub for early access.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </div>
            </main>

            {/* Global Signature */}
            <footer className="p-8 lg:p-12 border-t border-border-default/30 flex justify-between items-center relative z-20 backdrop-blur-3xl bg-background-primary/20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 opacity-40">
                        <Building2 size={16} className="text-text-tertiary" />
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.5em] italic">Enterprise Root Node</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-40 font-mono">
                        <span className="text-[8px] px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary">SECURE</span>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.5em] italic">SYNC: 100%</span>
                    </div>
                </div>
                <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.8em] opacity-20 italic">
                    NILELINK SECURE PROTOCOL SYNC · v2.0 ADMIN
                </p>
            </footer>

            <style jsx global>{`
                :root {
                    --primary-rgb: 0, 0, 0;
                }
            `}</style>
        </div>
    );
}

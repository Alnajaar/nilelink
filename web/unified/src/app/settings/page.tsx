"use client";

import React from 'react';
import { User, Bell, Lock, Globe, HardDrive } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';

export default function SettingsPage() {
    const sections = [
        { title: 'Profile Info', icon: User, desc: 'Manage your public protocol identity.' },
        { title: 'Notifications', icon: Bell, desc: 'Set alerts for node health and revenue events.' },
        { title: 'Security', icon: Lock, desc: 'Manage API keys and private wallet connections.' },
        { title: 'Regional Proxy', icon: Globe, desc: 'Choose your default NileLink RPC node.' },
        { title: 'Storage Logic', icon: HardDrive, desc: 'Configure local-first database retention.' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Settings</h1>
                    <p className="text-zinc-500 font-medium">Configure your core interface and node interaction parameters.</p>
                </header>

                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <div key={i} className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-white/5 text-zinc-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <section.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1">{section.title}</h3>
                                    <p className="text-zinc-500 text-sm font-medium">{section.desc}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-white/30 transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] mb-4">Protocol Core v0.1.0-STABLE</p>
                    <button className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Disconnect Node Session</button>
                </div>
            </div>
        </DashboardLayout>
    );
}

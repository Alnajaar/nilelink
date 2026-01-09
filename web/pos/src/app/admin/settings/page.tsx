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
    Upload
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Switch } from '@/shared/components/Switch';

export default function AdminSettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full" onClick={() => router.push('/admin')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Global Settings</h1>
                        <p className="text-text-muted font-medium">Configure your business profile, receipts, and security policies.</p>
                    </div>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20 bg-success hover:bg-success-hover text-white">
                    <Save size={18} />
                    Save Changes
                </Button>
            </header>

            <main className="max-w-7xl mx-auto flex gap-8">
                {/* Settings Nav */}
                <div className="w-64 shrink-0 space-y-2">
                    {[
                        { id: 'general', label: 'General Info', icon: Store },
                        { id: 'receipts', label: 'Receipts & Tax', icon: Receipt },
                        { id: 'online', label: 'Online Store', icon: Globe },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'devices', label: 'Devices', icon: Smartphone },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-muted hover:bg-background-subtle hover:text-text-main'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'general' && (
                        <Card className="p-8 bg-white border-border-subtle shadow-sm space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-6">Business Profile</h3>
                                <div className="flex items-start gap-8">
                                    <div className="w-32 h-32 bg-background-subtle rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-text-muted cursor-pointer hover:border-primary hover:text-primary transition-colors">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase">Upload Logo</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Business Name</label>
                                            <Input defaultValue="Cairo Bistro" className="font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Description</label>
                                            <textarea className="w-full p-4 bg-background-subtle rounded-xl border-transparent font-medium text-sm focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]" defaultValue="Authentic Egyptian cuisine served with modern flair." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border-subtle">
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-6">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Email Address</label>
                                        <Input defaultValue="admin@cairobistro.com" className="font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Phone Number</label>
                                        <Input defaultValue="+20 123 456 7890" className="font-bold" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Physical Address</label>
                                        <Input defaultValue="12 Corniche El Nile, Maadi, Cairo" className="font-bold" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'receipts' && (
                        <Card className="p-8 bg-white border-border-subtle shadow-sm space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-6">Tax Configuration</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">VAT / Tax Rate (%)</label>
                                        <Input defaultValue="14" type="number" className="font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Tax ID / Registration</label>
                                        <Input defaultValue="TX-992831" className="font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-border-subtle">
                                <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-6">Receipt Customization</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-text-main">Show Logo on Receipt</p>
                                            <p className="text-xs text-text-muted">Print your business logo at the top.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-text-main">Show Wisdom Quote</p>
                                            <p className="text-xs text-text-muted">Print a randomized wisdom quote at bottom.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-subtle mb-2 block">Custom Footer Message</label>
                                        <Input defaultValue="Thank you for dining with us! Follow us @cairobistro" className="font-bold" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Placeholder for other tabs */}
                    {(activeTab !== 'general' && activeTab !== 'receipts') && (
                        <Card className="p-12 text-center bg-white border-border-subtle border-dashed">
                            <div className="w-16 h-16 bg-background-subtle rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                                {activeTab === 'online' && <Globe size={32} />}
                                {activeTab === 'security' && <Shield size={32} />}
                                {activeTab === 'devices' && <Smartphone size={32} />}
                            </div>
                            <h3 className="text-xl font-black text-text-main mb-2">Category Under Maintenance</h3>
                            <p className="text-text-muted max-w-sm mx-auto">This settings module is currently being upgraded to the new protocol standard. Check back soon.</p>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { User, MapPin, CreditCard, Bell, Settings, LogOut, ArrowLeft, ShieldCheck, Gem } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { MasteryHUD } from '@/shared/components/MasteryHUD';

export default function ProfilePage() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto pb-32">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="bg-white border border-border-subtle rounded-xl h-10 w-10 p-0">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Identity</h1>
                        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Manage your decentralized profile</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex flex-col items-center text-center p-8 bg-white rounded-[32px] border border-border-subtle shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#0e372b] to-[#1a5f4a]"></div>

                            <div className="w-24 h-24 rounded-full bg-white p-1 relative z-10 mb-4 shadow-lg">
                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black">
                                    NL
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center text-white">
                                    <ShieldCheck size={12} />
                                </div>
                            </div>

                            <h2 className="text-xl font-black text-text-main">NileLink User</h2>
                            <p className="text-sm font-medium text-text-muted mb-4">user@nilelink.app</p>

                            <Badge variant="success" className="bg-success/10 text-success border-transparent">
                                Verified Citizen
                            </Badge>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { label: 'Personal Info', icon: User, active: true },
                                { label: 'Saved Locations', icon: MapPin },
                                { label: 'Payment Methods', icon: CreditCard },
                                { label: 'Notifications', icon: Bell },
                                { label: 'Privacy & Security', icon: ShieldCheck },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${item.active
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-white text-text-muted hover:bg-background-subtle hover:text-text-main'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[24px] text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2 text-indigo-200">
                                    <Gem size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Nile Premium</span>
                                </div>
                                <h3 className="text-lg font-black mb-1">Upgrade to Pro</h3>
                                <p className="text-xs text-indigo-100/80 mb-4">Get 0 fees and priority delivery.</p>
                                <Button size="sm" className="bg-white text-indigo-700 hover:bg-indigo-50 w-full font-black text-xs uppercase tracking-widest">
                                    Learn More
                                </Button>
                            </div>
                            <Gem size={80} className="absolute -bottom-4 -right-4 text-white/10 rotate-12" />
                        </div>

                        <Button variant="ghost" className="w-full text-danger border border-transparent hover:bg-danger/5 hover:border-danger/20 justify-start h-14 rounded-2xl px-4 font-bold">
                            <LogOut size={18} className="mr-3" />
                            Disconnect Wallet
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-8 space-y-6">
                        <MasteryHUD />

                        <Card className="p-8 bg-white border-border-subtle shadow-sm rounded-[32px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-text-main">Global Profile</h3>
                                <Button size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest">Save Changes</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="First Name" defaultValue="Nile" className="font-bold" />
                                <Input label="Last Name" defaultValue="Link" className="font-bold" />
                                <div className="md:col-span-2">
                                    <Input label="Email Address" defaultValue="user@nilelink.app" type="email" />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label="Phone Number" defaultValue="+20 123 456 7890" type="tel" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-white border-border-subtle shadow-sm rounded-[32px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-text-main">Saved Locations</h3>
                                <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-xl">Add New</Button>
                            </div>

                            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-text-main">Home</h4>
                                        <Badge variant="success" className="text-[9px] h-5 px-1.5">Default</Badge>
                                    </div>
                                    <p className="text-text-muted text-sm font-medium">Block 4, Sector 9, Zamalek</p>
                                    <p className="text-text-subtle text-xs font-mono mt-1">Cairo, Egypt</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-text-subtle hover:text-primary">Edit</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

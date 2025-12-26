"use client";

import React from 'react';
import Link from 'next/link';
import { User, MapPin, CreditCard, Bell, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-4xl mx-auto pb-32">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={18} />}>
                        Back to Home
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-primary-dark">Your Profile</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    <Card className="p-4 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-primary-dark text-white flex items-center justify-center text-3xl mb-4">
                            NL
                        </div>
                        <h2 className="text-xl font-bold text-primary-dark">NileLink User</h2>
                        <p className="text-sm text-text-secondary">user@nilelink.app</p>
                        <div className="mt-4 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold uppercase tracking-wider">
                            Verified account
                        </div>
                    </Card>

                    <nav className="space-y-2">
                        {[
                            { label: 'Personal Info', icon: User, active: true },
                            { label: 'Saved Addresses', icon: MapPin },
                            { label: 'Payment Methods', icon: CreditCard },
                            { label: 'Notifications', icon: Bell },
                            { label: 'Settings', icon: Settings },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${item.active
                                        ? 'bg-primary-dark text-white'
                                        : 'hover:bg-black/5 text-primary-dark'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <Button variant="outline" className="w-full text-error border-error/20 hover:bg-error/5 hover:border-error" leftIcon={<LogOut size={18} />}>
                        Sign Out
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card title="Personal Information">
                        <h3 className="text-lg font-bold text-primary-dark mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="Nile" />
                            <Input label="Last Name" defaultValue="Link" />
                            <div className="md:col-span-2">
                                <Input label="Email Address" defaultValue="user@nilelink.app" type="email" />
                            </div>
                            <div className="md:col-span-2">
                                <Input label="Phone Number" defaultValue="+20 123 456 7890" type="tel" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button>Save Changes</Button>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-primary-dark">Default Address</h3>
                            <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-primary-dark mt-1" size={20} />
                            <div>
                                <p className="font-bold text-primary-dark">Home</p>
                                <p className="text-text-secondary text-sm">Block 4, Sector 9</p>
                                <p className="text-text-secondary text-sm">Zamalek, Cairo</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

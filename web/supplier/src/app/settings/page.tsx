"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User, Building, MapPin, Bell, Lock, CreditCard,
    Mail, Phone, Save, ArrowLeft
} from 'lucide-react';

import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import AuthGuard from '@shared/components/AuthGuard';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [settings, setSettings] = useState({
        businessName: user?.displayName?.split(' - ')[1] || 'My Business',
        contactPerson: user?.displayName?.split(' - ')[0] || user?.displayName || 'Supplier',
        email: user?.email || '',
        phone: '',
        address: '',
        notifications: {
            orderAlerts: true,
            lowStockAlerts: true,
            paymentUpdates: true,
            emailDigest: false
        }
    });

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-white border-b border-surface px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-surface rounded-lg">
                                <ArrowLeft size={20} className="text-text" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-text">Settings</h1>
                                <p className="text-sm text-text opacity-70">Manage your account and preferences</p>
                            </div>
                        </div>
                        <Button onClick={handleSave} className="bg-primary hover:opacity-90 text-background h-12 px-6 rounded-xl font-black uppercase tracking-widest">
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                    {/* Business Information */}
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Building size={24} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text">Business Information</h2>
                                <p className="text-sm text-text opacity-70">Update your company details</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Business Name</label>
                                <input
                                    type="text"
                                    value={settings.businessName}
                                    onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Contact Person</label>
                                <input
                                    type="text"
                                    value={settings.contactPerson}
                                    onChange={(e) => setSettings(prev => ({ ...prev, contactPerson: e.target.value }))}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={settings.phone}
                                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Warehouse Address</label>
                                <input
                                    type="text"
                                    value={settings.address}
                                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full h-12 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Notification Preferences */}
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Bell size={24} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text">Notifications</h2>
                                <p className="text-sm text-text opacity-70">Manage how you receive updates</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(settings.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-surface/30 rounded-xl">
                                    <span className="text-sm font-medium text-text capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <button
                                        onClick={() => setSettings(prev => ({
                                            ...prev,
                                            notifications: { ...prev.notifications, [key]: !value }
                                        }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-surface'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-background rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Security */}
                    <Card className="p-6 bg-white border border-surface">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Lock size={24} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text">Security</h2>
                                <p className="text-sm text-text opacity-70">Password and authentication</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold justify-start">
                                <Lock size={18} className="mr-3" />
                                Change Password
                            </Button>
                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold justify-start">
                                <Mail size={18} className="mr-3" />
                                Update Email
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}

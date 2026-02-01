"use client";

import React, { useState } from 'react';
import {
    Users, Search, UserPlus, Gift, Star, Clock,
    ChevronRight, ArrowLeft, Trophy, Zap, ShieldCheck, Mail, Phone
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function LoyaltyPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Mock loyalty data
    const mockCustomers = [
        { id: 'C-001', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1 234 567 890', tier: 'Gold', points: 1250, recentActivity: 'Bought 3 Coffee' },
        { id: 'C-002', name: 'Sarah Miller', email: 'sarah@example.com', phone: '+1 234 567 891', tier: 'Platinum', points: 4500, recentActivity: 'Redeemed Burger' },
        { id: 'C-003', name: 'David Chen', email: 'david@example.com', phone: '+1 234 567 892', tier: 'Silver', points: 450, recentActivity: 'New Member' },
    ];

    const rewards = [
        { id: 'R-01', title: 'Free Coffee', cost: 500, icon: Gift, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 'R-02', title: '15% Off Total', cost: 1200, icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'R-03', title: 'Premium Burger', cost: 2500, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'R-04', title: 'Secret Menu Access', cost: 5000, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="min-h-screen bg-neutral flex flex-col relative selection:bg-primary/20 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <header className="px-10 py-10 flex justify-between items-center relative z-10 bg-white/40 backdrop-blur-2xl border-b border-border-subtle">
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary p-0 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic leading-none mb-2">Loyalty Nexus</h1>
                        <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[9px] opacity-60">Customer Retention & Rewards Protocol</p>
                    </div>
                </div>
                <Button className="h-14 px-8 bg-primary text-background rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 group">
                    <UserPlus className="mr-3 group-hover:scale-110 transition-transform" /> ENROLL NEW CUSTOMER
                </Button>
            </header>

            <div className="space-y-3">
                <h2 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic">Select Identity</h2>
                <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[10px] opacity-60 max-w-sm mx-auto">
                    Scan terminal link or search the NileLink Ledger to access customer retention profile.
                </p>
            </div>
            <Button className="h-16 px-10 border-2 border-border-subtle bg-white text-text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral transition-all">
                <Zap className="mr-3 text-primary" /> QUICK SEARCH
            </Button>
        </div>
    );
}

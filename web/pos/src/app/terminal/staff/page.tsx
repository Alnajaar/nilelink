"use client";

import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Clock,
    Award,
    MoreHorizontal,
    Search,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface StaffMember {
    id: string;
    name: string;
    role: 'Manager' | 'Cashier' | 'Server' | 'Chef';
    status: 'Active' | 'On Break' | 'Offline';
    clockIn: string;
    performance: number;
    avatar?: string;
}

export default function StaffPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const [staff, setStaff] = useState<StaffMember[]>([
        { id: '1', name: 'Ahmed Hassan', role: 'Manager', status: 'Active', clockIn: '08:30 AM', performance: 98 },
        { id: '2', name: 'Sarah Jones', role: 'Server', status: 'Active', clockIn: '09:00 AM', performance: 95 },
        { id: '3', name: 'Mike Ross', role: 'Chef', status: 'Active', clockIn: '07:45 AM', performance: 99 },
        { id: '4', name: 'Lisa Chen', role: 'Cashier', status: 'On Break', clockIn: '09:15 AM', performance: 92 },
        { id: '5', name: 'Tom Hardy', role: 'Server', status: 'Offline', clockIn: '-', performance: 88 },
    ]);

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: StaffMember['status']) => {
        switch (status) {
            case 'Active': return 'success';
            case 'On Break': return 'warning';
            case 'Offline': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <div className="p-8 flex flex-col h-full gap-8 bg-background">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Users size={22} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main uppercase tracking-tight">Staff Node</h1>
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs ml-1">Workforce Management & Access Control</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button size="sm" className="font-black uppercase tracking-widest px-6 shadow-xl shadow-primary/20 bg-primary text-white">
                        <UserPlus size={18} className="mr-2" /> RECRUIT NODE
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border-border-subtle rounded-[32px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-success/10 rounded-lg text-success">
                            <Clock size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">On Shift</span>
                    </div>
                    <h4 className="text-3xl font-black text-text-main">{staff.filter(s => s.status !== 'Offline').length} <span className="text-lg text-text-muted font-bold">/ {staff.length}</span></h4>
                </Card>

                <Card className="p-6 bg-white border-border-subtle rounded-[32px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Award size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Avg Performance</span>
                    </div>
                    <h4 className="text-3xl font-black text-text-main">
                        {Math.round(staff.reduce((acc, curr) => acc + curr.performance, 0) / staff.length)}%
                    </h4>
                </Card>

                <Card className="p-6 bg-white border-border-subtle rounded-[32px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                            <Shield size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Access Level</span>
                    </div>
                    <h4 className="text-3xl font-black text-text-main">High</h4>
                </Card>
            </div>

            <Card className="flex-1 rounded-[40px] bg-white border-border-subtle p-8 overflow-hidden flex flex-col shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-8 shrink-0">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find staff members..."
                            className="w-full h-14 pl-12 pr-4 bg-background-subtle border border-border-subtle rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-2">
                    {filteredStaff.map((member) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group"
                        >
                            <Card className="p-6 rounded-[32px] border-border-subtle hover:border-primary/50 hover:shadow-xl transition-all h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 rounded-[24px] bg-background-subtle flex items-center justify-center border border-border-subtle overflow-hidden">
                                        <User size={32} className="text-text-muted" />
                                    </div>
                                    <Badge size="sm" variant={getStatusVariant(member.status)} className="font-black uppercase text-[10px]">
                                        {member.status}
                                    </Badge>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-text-main leading-tight mb-1">{member.name}</h3>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{member.role}</p>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <div className="flex justify-between items-center p-3 bg-background-subtle rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase">
                                            <Clock size={14} /> Clock In
                                        </div>
                                        <span className="font-black text-text-main text-sm">{member.clockIn}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-background-subtle rounded-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase">
                                            <Award size={14} /> Score
                                        </div>
                                        <span className="font-black text-success text-sm">{member.performance}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" className="rounded-xl font-bold">Profile</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl font-bold">Message</Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Users,
    Shield,
    UserPlus,
    CreditCard,
    ArrowLeft,
    Search,
    Filter,
    MoreVertical,
    Clock,
    Activity,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { AddStaffModal } from '@/components/admin/AddStaffModal';
import { getRoleColor, getRoleLabel } from '@/utils/permissions';

export default function AdminStaffPage() {
    const router = useRouter();
    const { engines, isInitialized } = usePOS();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch staff on mount
    React.useEffect(() => {
        const fetchStaff = async () => {
            if (engines.staffEngine) {
                try {
                    const list = await engines.staffEngine.listStaff();
                    setStaffList(list);
                } catch (err) {
                    console.error('Failed to fetch staff:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (isInitialized) {
            fetchStaff();
        }
    }, [isInitialized, engines.staffEngine]);

    const handleAddStaff = async (staffData: any) => {
        if (engines.staffEngine) {
            await engines.staffEngine.createStaff({
                username: staffData.username,
                phone: staffData.phone,
                pin: staffData.pin,
                roles: staffData.roles,
                permissions: staffData.permissions,
                branchId: 'branch-cairo-grill' // Default for now
            });
            // Refresh list
            const list = await engines.staffEngine.listStaff();
            setStaffList(list);
        }
    };

    const filteredStaff = staffList.filter(s =>
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.uniqueCode.includes(searchQuery) ||
        s.roles.some((r: string) => r.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl bg-white shadow-sm border border-border-subtle" onClick={() => router.push('/admin')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic">Staff Intelligence</h1>
                            <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1 px-3">Protocol 4.0</Badge>
                        </div>
                        <p className="text-text-muted font-medium uppercase text-[11px] tracking-widest opacity-60">Maintain zero-error human operations in the NileLink node.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 rounded-2xl gap-3 text-[11px] font-black uppercase tracking-widest bg-white">
                        <Shield size={18} className="text-primary" />
                        Roles & Permissions
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="h-12 rounded-2xl gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        <UserPlus size={18} />
                        Recruit Operator
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">
                {/* Protocol HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Verified Personnel', value: staffList.length, icon: Users, color: 'text-primary' },
                        { label: 'Active Sessions', value: staffList.filter(s => s.status === 'active').length, icon: Activity, color: 'text-success' },
                        { label: 'Ecosystem Trust', value: '99.8%', icon: Shield, color: 'text-info' },
                        { label: 'Security Health', value: 'Optimal', icon: Lock, color: 'text-warning' },
                    ].map((stat, idx) => (
                        <Card key={idx} className="p-8 flex items-center justify-between bg-white border-border-subtle shadow-xl rounded-[2rem] group hover:border-primary/50 transition-all duration-500">
                            <div>
                                <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className="text-3xl font-black text-text-primary italic tracking-tighter">{stat.value}</p>
                            </div>
                            <div className={`w-14 h-14 bg-neutral/50 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                <stat.icon size={24} />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Staff Matrix */}
                <Card className="bg-white border-border-subtle shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-neutral/20">
                        <div className="relative w-[500px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                            <Input
                                placeholder="Search by name, role, or 8-digit unique code..."
                                className="pl-14 h-14 bg-white border-border-subtle rounded-2xl text-[11px] font-bold uppercase tracking-widest placeholder:text-text-subtle/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="h-14 rounded-2xl text-text-muted gap-3 uppercase text-[10px] font-black tracking-widest hover:bg-white border border-transparent hover:border-border-subtle px-6">
                                <Filter size={18} />
                                Segment
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Initializing Personnel Matrix...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral/50 border-b border-border-subtle">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-subtle uppercase tracking-[0.4em]">Operator Identity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-subtle uppercase tracking-[0.4em]">Protocol Roles</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-subtle uppercase tracking-[0.4em]">Node Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-subtle uppercase tracking-[0.4em]">Access Code</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-text-subtle uppercase tracking-[0.4em]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {filteredStaff.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-neutral/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                                                    {employee.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text-primary tracking-tight">{employee.username}</p>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{employee.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {employee.roles.map((role: any) => (
                                                    <Badge key={role} className={`${getRoleColor(role)} font-black text-[9px] uppercase tracking-widest py-1 px-3 rounded-lg`}>
                                                        {getRoleLabel(role)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${employee.status === 'active' ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-text-subtle'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${employee.status === 'active' ? 'text-success' : 'text-text-muted'}`}>
                                                    {employee.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-text-primary text-[10px] font-black tracking-[0.2em] font-mono bg-neutral/50 py-2 px-4 rounded-xl border border-border-subtle/50">
                                                <Lock size={14} className="text-text-muted" />
                                                {employee.uniqueCode}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl px-4">
                                                Examine
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </main>

            <AddStaffModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddStaff}
            />
        </div>
    );
}

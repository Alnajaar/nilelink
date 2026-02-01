'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { cn } from '@shared/utils/cn';
import { toast } from 'react-hot-toast';
import {
    Percent,
    DollarSign,
    ShieldCheck,
    Search,
    Edit3,
    History,
    ArrowLeft,
    Store,
    Truck,
    Users,
    Package
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'pos' | 'supplier' | 'delivery' | 'affiliate';

interface ManagedEntity {
    id: string;
    name: string;
    owner?: string;
    type?: string;
    plan?: string;
    status: string;
    balance?: number;
    totalEarnings?: number;
    referralCode?: string;
    commissionRule: {
        type: 'PERCENTAGE' | 'FIXED';
        value: number;
    } | null;
}

export default function CommissionManagementPage() {
    const { user } = useAuth();
    const [entities, setEntities] = useState<ManagedEntity[]>([]);
    const [tab, setTab] = useState<TabType>('pos');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEntity, setEditingEntity] = useState<ManagedEntity | null>(null);
    const [newRule, setNewRule] = useState({ type: 'PERCENTAGE' as const, value: 0 });

    const fetchEntities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/commissions?tab=${tab}`);
            const result = await res.json();

            if (result.success) {
                setEntities(result.data);
            }
        } catch (error) {
            toast.error('Failed to fetch entities');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchEntities();
    }, [fetchEntities]);

    const handleUpdateRule = async () => {
        if (!editingEntity) return;
        try {
            const res = await fetch('/api/admin/commissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingEntity.id,
                    category: tab.toUpperCase(),
                    type: newRule.type,
                    value: newRule.value,
                    adminId: user?.uid
                })
            });

            if (res.ok) {
                toast.success('Commission Rule Synchronized');
                setEditingEntity(null);
                fetchEntities();
            }
        } catch (error) {
            toast.error('Sync failed');
        }
    };

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <div className="p-20 text-center text-white font-black italic uppercase">Access Denied</div>;
    }

    const filteredEntities = entities.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.owner && e.owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                <div>
                    <Link href="/super-admin" className="flex items-center gap-2 text-blue-500 hover:text-white transition-colors mb-6 text-[10px] font-black uppercase tracking-[0.3em]">
                        <ArrowLeft className="w-3 h-3" /> System Terminal
                    </Link>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                        Revenue <span className="text-blue-500">Governance</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium italic opacity-70">Enforce platform commissions and affiliate splits across all nodes.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl">
                    <button
                        onClick={() => setTab('pos')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'pos' ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Store className="w-4 h-4" /> POS Nodes
                    </button>
                    <button
                        onClick={() => setTab('supplier')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'supplier' ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Package className="w-4 h-4" /> Suppliers
                    </button>
                    <button
                        onClick={() => setTab('delivery')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'delivery' ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Truck className="w-4 h-4" /> Delivery
                    </button>
                    <button
                        onClick={() => setTab('affiliate')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'affiliate' ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Users className="w-4 h-4" /> Affiliates
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder={`Search ${tab.toUpperCase()} cluster by name, id or owner...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] pl-16 pr-8 py-6 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-md"
                />
            </div>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Syncing with Ledger...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEntities.map((entity) => (
                        <GlassCard key={entity.id} className="p-8 group border-white/5 hover:border-blue-500/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all" />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1 line-clamp-1">{entity.name}</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        {entity.id.slice(0, 12)}...
                                    </p>
                                </div>
                                <Badge className={cn(
                                    "font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full border",
                                    entity.commissionRule ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-white/5 border-white/10 text-gray-500"
                                )}>
                                    {entity.commissionRule ? 'Override' : 'Protocol Default'}
                                </Badge>
                            </div>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group/metric hover:bg-white/[0.04] transition-all">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Commission</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-white italic">
                                            {entity.commissionRule?.value ?? (tab === 'pos' ? '8.0' : tab === 'supplier' ? '5.0' : tab === 'affiliate' ? (entity.commissionRate ? entity.commissionRate * 100 : '10.0') : '2.5')}
                                            <span className="text-xs ml-1 text-blue-500">{entity.commissionRule?.type === 'FIXED' ? 'USD' : '%'}</span>
                                        </span>
                                    </div>
                                </div>

                                {tab === 'affiliate' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Earnings</p>
                                            <p className="text-sm font-black text-green-400">${entity.totalEarnings?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Code</p>
                                            <p className="text-sm font-black text-white uppercase">{entity.referralCode || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}

                                {tab === 'pos' && (
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Plan</span>
                                            <span className="text-[10px] font-black text-blue-400 uppercase">{entity.plan || 'STARTER'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Owner</span>
                                            <span className="text-[10px] font-black text-white truncate max-w-[120px]">{entity.owner || '—'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => {
                                    setEditingEntity(entity);
                                    setNewRule({
                                        type: entity.commissionRule?.type || 'PERCENTAGE',
                                        value: entity.commissionRule?.value || (tab === 'pos' ? 8 : tab === 'supplier' ? 5 : tab === 'affiliate' ? (entity.commissionRate ? entity.commissionRate * 100 : 10) : 2.5)
                                    });
                                }}
                                className="w-full h-14 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white border border-white/10 hover:border-blue-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 relative z-10"
                            >
                                <Edit3 className="w-4 h-4" /> Modify Parameters
                            </Button>
                        </GlassCard>
                    ))}
                </div>
            )}

            {editingEntity && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <GlassCard className="max-w-xl w-full p-10 border-blue-500/50 shadow-2xl shadow-blue-900/20">
                        <div className="flex items-center gap-3 mb-2 text-blue-500">
                            <ShieldCheck size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Override</span>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase italic mb-8 tracking-tighter">Adjust Revenue <span className="text-blue-500">Architecture</span></h3>

                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 mb-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject Node</p>
                            <p className="text-xl font-black text-white uppercase italic">{editingEntity.name}</p>
                            <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">ID: {editingEntity.id}</p>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-4">Commission Algorithm</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setNewRule({ ...newRule, type: 'PERCENTAGE' })}
                                        className={cn(
                                            "h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all flex items-center justify-center gap-3",
                                            newRule.type === 'PERCENTAGE' ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30" : "bg-white/5 border-white/10 text-gray-500"
                                        )}
                                    >
                                        <Percent className="w-4 h-4" /> Percentage Base
                                    </button>
                                    <button
                                        onClick={() => setNewRule({ ...newRule, type: 'FIXED' })}
                                        className={cn(
                                            "h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all flex items-center justify-center gap-3",
                                            newRule.type === 'FIXED' ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30" : "bg-white/5 border-white/10 text-gray-500"
                                        )}
                                    >
                                        <DollarSign className="w-4 h-4" /> Fixed Amount
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-4">Value ({newRule.type === 'FIXED' ? 'USD' : 'Percent'})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newRule.value}
                                        onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                                        className="w-full h-20 bg-white/5 border border-white/10 rounded-[1.5rem] px-8 text-3xl font-black text-white focus:outline-none focus:border-blue-500/50"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-500/50">
                                        {newRule.type === 'FIXED' ? '$' : '%'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    onClick={() => setEditingEntity(null)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest h-16 rounded-2xl border border-white/10"
                                >
                                    Abort
                                </Button>
                                <Button
                                    onClick={handleUpdateRule}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest h-16 rounded-2xl shadow-2xl shadow-blue-900/40"
                                >
                                    Apply Change
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

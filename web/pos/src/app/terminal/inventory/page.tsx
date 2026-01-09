"use client";

import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, ArrowUpRight, AlertTriangle,
    BarChart3, ArrowLeft, TrendingDown, TrendingUp,
    RefreshCw, Filter, Download, MoreHorizontal, Box,
    ChevronDown, ChevronUp, Zap, ShieldCheck, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [inventory, setInventory] = useState([
        { id: '1', name: 'Wagyu Beef Patties', category: 'Proteins', stock: 42, minStock: 20, unit: 'pcs', price: 12.50, trend: 'up' },
        { id: '2', name: 'Brioche Buns', category: 'Bakery', stock: 15, minStock: 50, unit: 'pcs', price: 0.80, trend: 'down' },
        { id: '3', name: 'Truffle Oil', category: 'Pantry', stock: 8, minStock: 5, unit: 'L', price: 85.00, trend: 'stable' },
        { id: '4', name: 'Fresh Arugula', category: 'Produce', stock: 3, minStock: 10, unit: 'kg', price: 15.00, trend: 'down' },
        { id: '5', name: 'Artesian Water', category: 'Beverages', stock: 120, minStock: 100, unit: 'bottles', price: 2.10, trend: 'up' },
    ]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 overflow-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <header className="px-10 py-10 flex justify-between items-center relative z-10 bg-white/40 backdrop-blur-2xl border-b border-border-subtle sticky top-0">
                <div className="flex items-center gap-6">
                    <Button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-white border border-border-subtle hover:bg-neutral text-text-primary p-0 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-xl shadow-primary/20">
                            <Box size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic leading-none mb-2">Vault Assets</h1>
                            <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[9px] opacity-60 italic">Real-time inventory ledger & quantum stock</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="h-14 bg-neutral text-text-primary hover:bg-neutral-dark font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-8 transition-all">
                        <Download size={16} className="mr-3" /> EXPORT LEDGER
                    </Button>
                    <Button className="h-14 bg-primary text-background hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-10 shadow-xl shadow-primary/20 transition-all">
                        <Plus size={18} className="mr-3" /> ADD NEW UNIT
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-12 space-y-12 relative z-10">
                {/* Stats Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Vault Valuation', value: '$14.2M', change: '+8.2%', icon: DollarSign, color: 'text-primary', glow: 'bg-primary/10' },
                        { label: 'Deficit Risk', value: '04 Units', sub: 'Critical refills required', icon: AlertTriangle, color: 'text-red-500', glow: 'bg-red-500/10' },
                        { label: 'Protocol Sync', value: 'Verified', sub: 'Last sync: 4m ago', icon: RefreshCw, color: 'text-success', glow: 'bg-success/10' },
                    ].map((stat, idx) => (
                        <Card key={idx} className="p-10 rounded-[3rem] bg-white border border-border-subtle shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.glow} blur-3xl rounded-full -mr-16 -mt-16 group-hover:blur-4xl transition-all`} />
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className={`w-12 h-12 ${stat.glow} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary opacity-60">{stat.label}</span>
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-4xl font-black text-text-primary italic tracking-tighter">{stat.value}</h4>
                                {stat.change ? (
                                    <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-success uppercase tracking-widest">
                                        <TrendingUp size={12} />
                                        <span>{stat.change} Delta</span>
                                    </div>
                                ) : (
                                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-2 opacity-40">{stat.sub}</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Table Console */}
                <Card className="rounded-[3.5rem] bg-white border border-border-subtle shadow-2xl overflow-hidden flex flex-col p-12">
                    <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40" size={20} />
                            <input
                                type="text"
                                placeholder="Scan asset hash or name..."
                                className="w-full h-18 pl-18 pr-8 bg-neutral rounded-[1.5rem] border-0 focus:ring-2 focus:ring-primary/20 text-sm font-black uppercase tracking-widest transition-all placeholder:opacity-30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="h-18 px-10 bg-neutral text-text-primary hover:bg-neutral-dark border border-transparent rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em]">
                            <Filter size={18} className="mr-3" /> FILTER HIERARCHY
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary opacity-40">
                                    <th className="px-8 pb-4 text-left">Entity Descriptor</th>
                                    <th className="px-8 pb-4 text-center">Current Mass</th>
                                    <th className="px-8 pb-4 text-center">Lower Threshold</th>
                                    <th className="px-8 pb-4 text-right">Quantum Price</th>
                                    <th className="px-8 pb-4 text-right">Sequence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="group cursor-pointer">
                                        <td className="px-8 py-8 bg-neutral/30 group-hover:bg-white rounded-l-[2rem] border-y border-l border-transparent group-hover:border-border-subtle transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text-primary uppercase tracking-tight italic mb-1">{item.name}</p>
                                                    <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">{item.category}</Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xl font-black italic tracking-tighter ${item.stock < item.minStock ? 'text-red-500' : 'text-text-primary'}`}>
                                                    {item.stock} {item.unit}
                                                </span>
                                                {item.stock < item.minStock && (
                                                    <span className="text-[7px] font-black text-red-500 uppercase tracking-widest mt-1">Deficit Hazard</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                            <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">{item.minStock} {item.unit}</span>
                                        </td>
                                        <td className="px-8 py-8 text-right group-hover:bg-white border-y border-transparent group-hover:border-border-subtle transition-all">
                                            <span className="text-lg font-black text-primary italic tracking-tighter">${item.price.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-8 bg-neutral/30 group-hover:bg-white rounded-r-[2rem] text-right border-y border-r border-transparent group-hover:border-border-subtle transition-all">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-3 hover:bg-neutral rounded-xl text-text-secondary transition-colors">
                                                    <TrendingUp size={18} />
                                                </button>
                                                <button className="p-3 hover:bg-neutral rounded-xl text-text-secondary transition-colors">
                                                    <Plus size={18} />
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-12 h-12 p-0 rounded-xl hover:bg-neutral group-hover:translate-x-1 transition-all"
                                                >
                                                    <ArrowUpRight size={20} className="text-primary" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <p className="text-center text-[9px] font-black text-text-secondary uppercase tracking-[0.4em] opacity-40">
                    Encrypted Inventory Feed Hash: 72-911-L42-X00
                </p>
            </main>
        </div>
    );
}

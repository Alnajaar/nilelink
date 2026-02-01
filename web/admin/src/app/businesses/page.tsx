'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { graphService } from '@shared/services/GraphService';
import { cn } from '@/lib/utils';
import {
    Search,
    MapPin,
    Building2,
    ToggleLeft,
    ChevronRight,
    Globe,
    Database,
    Zap,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessesPage() {
    const { isConnected } = useAuth();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'LIST' | 'HIERARCHY'>('LIST');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                setLoading(true);
                const data = await graphService.getAllBusinesses();
                if (data) {
                    setBusinesses(data);
                }
            } catch (error) {
                console.error('Failed to fetch businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) {
            fetchBusinesses();
        }
    }, [isConnected]);

    const brandHierarchy = businesses.reduce((acc: any, biz) => {
        const ownerId = biz.owner?.id || 'unknown';
        if (!acc[ownerId]) {
            acc[ownerId] = {
                ownerName: biz.owner?.displayName || `Owner ${ownerId.slice(0, 6)}`,
                branches: []
            };
        }
        acc[ownerId].branches.push(biz);
        return acc;
    }, {});

    const filteredBusinesses = businesses.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.country && b.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.owner?.displayName && b.owner.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin text-4xl text-blue-500">⏳</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Business Registry</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Node <span className="text-blue-500">Control</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Manage global brand hierarchy and regional branch nodes.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex gap-1">
                        <button
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'LIST' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"
                            )}
                            onClick={() => setViewMode('LIST')}
                        >
                            Global List
                        </button>
                        <button
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'HIERARCHY' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"
                            )}
                            onClick={() => setViewMode('HIERARCHY')}
                        >
                            Brand Map
                        </button>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl px-6">
                        <Plus className="w-4 h-4 mr-2" /> Register Node
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <GlassCard className="p-4 border border-white/5">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Brand DID, Node ID or Geographic Region..."
                        className="w-full h-12 bg-transparent pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </GlassCard>

            {viewMode === 'LIST' ? (
                <div className="space-y-4">
                    {filteredBusinesses.map((business, idx) => (
                        <motion.div
                            key={business.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard className="p-6 border border-white/5 group hover:border-blue-500/30 transition-all overflow-visible">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                            <Building2 className="text-blue-400 w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                                                    {business.owner.displayName}
                                                </h3>
                                                <Badge className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    business.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                                )}>
                                                    {business.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-red-500" /> {business.country}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span className="font-mono text-blue-400/60 lowercase italic">did:ethr:{business.id.slice(0, 12)}...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 text-center hidden xl:flex">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Commission</p>
                                            <p className="text-xl font-black text-white italic">{business.commissionRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Currency</p>
                                            <p className="text-xl font-black text-white italic">{business.localCurrency}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sync Status</p>
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black">ON-CHAIN</Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-auto">
                                        <Button variant="outline" className="h-11 px-6 border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl">Manage Node</Button>
                                        <Button variant="outline" className="h-11 px-4 border-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-400 uppercase font-black text-[10px] rounded-xl">
                                            <ToggleLeft className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(brandHierarchy).map(([ownerId, data]: [any, any], idx) => (
                        <motion.div
                            key={ownerId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                                    {data.ownerName} <span className="text-blue-500/60 font-medium ml-2 text-sm not-italic">({data.branches.length} Registered Nodes)</span>
                                </h3>
                                <Button size="sm" variant="outline" className="border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl">Brand Config</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {data.branches.map((branch: any) => (
                                    <GlassCard key={branch.id} className="p-5 border border-white/5 group hover:border-blue-500/40 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                <Zap className="text-blue-400 w-5 h-5 fill-blue-400/20" />
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[8px] font-black tracking-widest">ACTIVE</Badge>
                                        </div>
                                        <p className="text-xs font-black text-white uppercase italic mb-1">{branch.country}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-6">{branch.localCurrency} Settlement Node</p>
                                        <Button className="w-full bg-white/5 hover:bg-blue-600 border border-white/5 text-[10px] font-black uppercase tracking-widest py-5 rounded-xl transition-all">Select Node</Button>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}


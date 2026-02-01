'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Shield,
    LayoutDashboard,
    Users,
    ShoppingBag,
    Truck,
    TrendingUp,
    Box,
    Globe,
    Zap,
    ChevronRight,
    Monitor,
    Building2,
    Lock
} from 'lucide-react';
import Link from 'next/link';

interface AppNode {
    id: string;
    name: string;
    description: string;
    icon: any;
    href: string;
    color: string;
    badge?: string;
}

const appNodes: AppNode[] = [
    { id: 'admin', name: 'Admin Portal', description: 'Entity Management & CRM Hub', icon: Users, href: '/admin', color: 'text-blue-500' },
    { id: 'pos', name: 'POS System', description: 'Retail Intelligence & Terminal', icon: Monitor, href: '/terminal', color: 'text-cyan-500', badge: 'Active' },
    { id: 'dashboard', name: 'Mission Control', description: 'Global Analytics & Real-time Ops', icon: LayoutDashboard, href: '/dashboard', color: 'text-indigo-500' },
    { id: 'marketplace', name: 'Market Portal', description: 'Multi-tenant Marketplace Hub', icon: Globe, href: '/protocol-node?hub=market', color: 'text-emerald-500' },
    { id: 'delivery', name: 'Delivery Hub', description: 'Tactical Logistics & Routing', icon: Truck, href: '/protocol-node?hub=delivery', color: 'text-orange-500' },
    { id: 'supplier', name: 'Supplier Hub', description: 'Supply Chain Intelligence', icon: Box, href: '/protocol-node?hub=supplier', color: 'text-amber-500' },
];

interface ImperialNavigatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ImperialNavigator: React.FC<ImperialNavigatorProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl"
                        onClick={onClose}
                    />

                    {/* Container */}
                    <div className="relative h-full flex items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-6xl bg-slate-900/50 border border-white/5 rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 relative overflow-hidden shadow-2xl shadow-blue-500/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-12 right-12 p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:rotate-90"
                            >
                                <X size={24} />
                            </button>

                            <div className="space-y-12 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Imperial Node Navigator</span>
                                    </div>
                                    <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic">
                                        Ecosystem <span className="text-blue-600">Switchboard</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium max-w-2xl text-lg">
                                        Seamlessly transition between individual NileLink empires while maintaining session persistence and localized configuration.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {appNodes.map((app, idx) => (
                                        <Link key={app.id} href={app.href} onClick={onClose}>
                                            <motion.div
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group p-8 bg-slate-950/50 border border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all flex items-center gap-6 relative overflow-hidden"
                                            >
                                                <div className={`p-5 rounded-2xl bg-slate-900 border border-white/5 ${app.color} group-hover:scale-110 transition-transform`}>
                                                    <app.icon size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic group-hover:text-blue-500 transition-colors">{app.name}</h3>
                                                        {app.badge && (
                                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                                                                {app.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                                        {app.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" size={20} />

                                                {/* Hover Deco */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Session Identity</span>
                                            <span className="text-xs font-black text-white italic">Administrator (Global)</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Active Protocols</span>
                                            <span className="text-xs font-black text-emerald-500 italic">SSO Active • JWT Secured</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
                                        <Lock size={14} className="text-slate-500" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maximum Encryption Standard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

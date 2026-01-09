"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Lightbulb, Zap, UtensilsCrossed, ScrollText,
    Wallet, Bike, BarChart3, UserPlus, Settings,
    ShieldCheck, LogOut, ChevronRight, Globe
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { usePOS } from '@/contexts/POSContext';
import { Printer, Tablet, Wifi } from 'lucide-react';

interface POSSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    storeName?: string;
    storeAddress?: string;
}

export const POSSideMenu: React.FC<POSSideMenuProps> = ({
    isOpen,
    onClose,
    storeName = "The Backburner - Tripoli",
    storeAddress = "Tripoli, el cheikh hassan khaled street"
}) => {
    const { currentStaff, logout } = usePOS();

    if (!isOpen) return null;

    const menuItems = [
        { icon: Lightbulb, label: "Merchant guide", color: "text-amber-400" },
        { icon: Zap, label: "Live Orders", active: true },
        { icon: UtensilsCrossed, label: "Menu" },
        { icon: ScrollText, label: "Order History" },
        { icon: Wallet, label: "Wallet" },
        { icon: Bike, label: "Request a NileLink", isHighlight: true },
        { icon: BarChart3, label: "Analytics" },
        { icon: UserPlus, label: "Create Account" },
        { icon: Settings, label: "Settings" },
        { icon: ShieldCheck, label: "Verification Code" },
        { icon: LogOut, label: "Log Out" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-[320px] bg-white z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header Image & Store Info */}
                        <div className="relative h-48 shrink-0 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800"
                                alt="Store"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white p-0 hover:bg-white/40"
                            >
                                <X size={20} />
                            </Button>

                            <div className="absolute bottom-4 left-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center p-1">
                                    <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                                        <div className="w-8 h-4 bg-white rounded-full relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-1 bg-red-500 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h2 className="text-lg font-black leading-tight tracking-tight">{storeName}</h2>
                                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">{storeAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Staff Profile (Phase 10) */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-neutral/30 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                                {currentStaff?.username.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[11px] font-black text-text-primary truncate uppercase italic">{currentStaff?.username || 'Operator Selection Required'}</h3>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">ID: {currentStaff?.uniqueCode || '--------'}</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
                            <div className="space-y-1">
                                {menuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={item.label === "Log Out" ? () => { logout(); onClose(); } : undefined}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${item.active
                                            ? 'bg-primary/5 text-primary'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={20} className={item.color || (item.active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />
                                            <span className={`text-sm font-bold tracking-tight ${item.active ? 'font-black' : 'font-semibold'}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                        {!item.active && <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hardware Health (Phase 14) */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Hardware Health</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-slate-100">
                                    <Printer size={16} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase">Printer</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-slate-100">
                                    <Tablet size={16} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase">Reader</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-slate-100">
                                    <Wifi size={16} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase">Network</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                    <Globe size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Sync</p>
                                    <p className="text-[11px] font-bold text-slate-700">Tripoli Main Cluster</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

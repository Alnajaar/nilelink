"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Lightbulb, Zap, UtensilsCrossed, ScrollText,
    Wallet, Bike, BarChart3, UserPlus, Settings,
    ShieldCheck, LogOut, ChevronRight, Globe, Users
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@shared/providers/AuthProvider';
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
}) => {
    const router = useRouter();
    const { user } = useAuth();
    const { currentStaff, logout } = usePOS();

    const storeName = user?.businessName || "NileLink Node";
    const storeAddress = user?.location || "Protocol Jurisdiction Not Set";

    if (!isOpen) return null;

    const menuItems = [
        { icon: Lightbulb, label: "Merchant guide", color: "text-amber-400", href: "/terminal/guide" },
        { icon: Zap, label: "Live Orders", active: true, href: "/terminal" },
        { icon: UtensilsCrossed, label: "Menu", href: "/terminal" },
        { icon: ScrollText, label: "Order History", href: "/orders" },
        { icon: Wallet, label: "Wallet", href: "/terminal/ledger" },
        { icon: Users, label: "Loyalty Nexus", href: "/terminal/loyalty", isHighlight: true },
        { icon: Bike, label: "Request a NileLink", href: "/terminal/requests" },
        { icon: BarChart3, label: "Analytics", href: "/reports" },
        { icon: UserPlus, label: "Create Account", href: "/auth/register" },
        { icon: Settings, label: "Settings", href: "/terminal/settings" },
        { icon: ShieldCheck, label: "Verification Code", href: "/auth/terminal-pin" },
        { icon: LogOut, label: "Log Out", action: 'logout' },
    ];

    const handleItemClick = (item: any) => {
        if (item.action === 'logout') {
            logout();
            onClose();
            return;
        }
        if (item.href) {
            router.push(item.href);
            onClose();
        }
    };

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
                        className="fixed left-0 top-0 bottom-0 w-[340px] bg-[var(--pos-bg-secondary)] z-[101] shadow-[var(--pos-shadow-lg)] flex flex-col border-r border-[var(--pos-border-subtle)]"
                    >
                        {/* Header Image & Store Info */}
                        <div className="relative h-56 shrink-0 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800"
                                alt="Store"
                                className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--pos-bg-secondary)] via-[var(--pos-bg-secondary)]/40 to-transparent" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white p-0 hover:bg-white/20"
                            >
                                <X size={24} />
                            </Button>

                            <div className="absolute bottom-6 left-8 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl border-2 border-[var(--pos-accent)] shadow-[0_0_20px_rgba(0,242,255,0.2)] overflow-hidden bg-black flex items-center justify-center p-1">
                                    <Zap size={28} className="text-[var(--pos-accent)]" fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black leading-tight tracking-tighter uppercase italic">{storeName}</h2>
                                    <p className="text-[9px] font-bold text-[var(--pos-accent)] uppercase tracking-[0.3em] mt-1">NileLink Node Station</p>
                                </div>
                            </div>
                        </div>

                        {/* Staff Profile */}
                        <div className="px-8 py-6 border-b border-[var(--pos-border-subtle)] bg-[var(--pos-bg-tertiary)]/50 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--pos-bg-surface)] border border-[var(--pos-border-subtle)] flex items-center justify-center text-[var(--pos-accent)] font-black text-xl italic shadow-inner">
                                {currentStaff?.username.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-black text-white truncate uppercase tracking-tight italic">{currentStaff?.username || 'Operator Selection Required'}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--pos-success)] animate-pulse" />
                                    <p className="text-[9px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.2em]">ID: {currentStaff?.uniqueCode || '--------'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
                            <div className="space-y-2">
                                {menuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleItemClick(item)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${item.active
                                            ? 'bg-[var(--pos-accent)] text-[var(--pos-text-inverse)] shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                                            : 'text-[var(--pos-text-secondary)] hover:bg-[var(--pos-bg-surface)] hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <item.icon size={22} className={item.color || (item.active ? 'text-[var(--pos-text-inverse)]' : 'text-[var(--pos-text-muted)] group-hover:text-[var(--pos-accent)]')} />
                                            <span className={`text-sm font-bold tracking-tight uppercase ${item.active ? 'font-black' : ''}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.active && <div className="w-2 h-2 rounded-full bg-black/20" />}
                                        {!item.active && <ChevronRight size={16} className="text-[var(--pos-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hardware Health */}
                        <div className="px-8 py-6 bg-[var(--pos-bg-tertiary)] border-t border-[var(--pos-border-subtle)]">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--pos-text-muted)] mb-4 italic">Subsystem Integrity</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Printer, label: 'Printer' },
                                    { icon: Tablet, label: 'Reader' },
                                    { icon: Wifi, label: 'Link' }
                                ].map((hw, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] group hover:border-[var(--pos-success)] transition-colors">
                                        <hw.icon size={18} className="text-[var(--pos-success)] opacity-80 group-hover:opacity-100" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--pos-text-muted)]">{hw.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="p-8 border-t border-[var(--pos-border-subtle)] bg-black">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--pos-bg-surface)] border border-[var(--pos-border-subtle)] flex items-center justify-center text-[var(--pos-accent)] shadow-lg">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--pos-text-muted)] italic">Node Synchronization</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tight mt-0.5">Polygon Protocol // Mainnet</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

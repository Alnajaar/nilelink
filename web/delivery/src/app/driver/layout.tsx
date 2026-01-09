"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid, List, Wallet, User, Zap,
    Wifi, WifiOff, Map, Bell, ShieldCheck
} from 'lucide-react';
import { AuthGuard } from '@shared/components/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const NeuralMesh = dynamic(() => import('@shared/components/NeuralMesh').then(mod => mod.NeuralMesh), {
    ssr: false
});

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isOnline = true; // Simulated

    const navItems = [
        { icon: LayoutGrid, label: 'Mission', path: '/driver/home' },
        { icon: List, label: 'Queue', path: '/driver/queue' },
        { icon: Wallet, label: 'Earnings', path: '/driver/wallet' },
        { icon: User, label: 'Shift', path: '/driver/shift' },
    ];

    // Don't show nav on login or transit pages for focus
    const hideNav = pathname === '/driver/login' || pathname.includes('/driver/transit');

    return (
        <AuthGuard requiredRole={['DRIVER', 'FLEET_MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background text-text flex flex-col font-sans selection:bg-primary/20 overflow-hidden relative">
                <NeuralMesh />
                {/* Protocol Status Bar */}
                <div className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-500 border-b ${isOnline ? 'bg-white/80 backdrop-blur-xl border-primary/5' : 'bg-rose-50 border-rose-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-primary' : 'bg-rose-500'} animate-pulse`} />
                            {isOnline && <div className="absolute inset-0 w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-20" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                            {isOnline ? 'Node Sync: Active' : 'Node Disconnected'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative text-text opacity-20 hover:opacity-100 transition-opacity">
                            <Bell size={18} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                        </button>
                        <div className="h-4 w-px bg-text/5" />
                        <ShieldCheck size={18} className="text-primary opacity-40" />
                    </div>
                </div>

                {/* Main Viewport */}
                <main className={`flex-1 w-full max-w-lg mx-auto relative z-10 no-scrollbar ${hideNav ? 'pb-0' : 'pb-32'} pt-20 px-6`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Tactical Navigation Rail */}
                {!hideNav && (
                    <nav className="fixed bottom-0 w-full z-50 px-6 pb-8 pt-4">
                        <div className="max-w-md mx-auto h-20 bg-text rounded-[2.5rem] flex items-center justify-around shadow-2xl shadow-text/20 border border-white/10 px-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="relative flex flex-col items-center justify-center gap-1 group w-16"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive
                                            ? 'bg-primary text-background shadow-lg shadow-black/20 scale-110'
                                            : 'text-background/40 hover:text-background hover:bg-white/5'
                                            }`}>
                                            <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                )}
            </div>
        </AuthGuard>
    );
}

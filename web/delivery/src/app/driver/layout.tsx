"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Wallet, User, Globe, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/components/shared/hooks/useNetworkStatus';
import { AuthProvider } from '@/shared/contexts/AuthContext';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const status = useNetworkStatus();
    const isOnline = status === 'online';

    const navItems = [
        { icon: Home, label: 'Home', path: '/driver/home' },
        { icon: List, label: 'Queue', path: '/driver/queue' },
        { icon: Wallet, label: 'Wallet', path: '/driver/wallet' },
        { icon: User, label: 'Shift', path: '/driver/shift' },
    ];

    return (
        <AuthProvider>
            <div className="min-h-screen relative bg-background-light text-text-primary flex flex-col font-sans selection:bg-emerald-500/30 overflow-hidden">
                {/* Status Bar */}
                <div className={`fixed top-0 w-full z-50 px-6 py-3 flex justify-between items-center bg-white/80 backdrop-blur-md border-b ${isOnline ? 'border-primary-dark/5' : 'border-error/20 bg-error/10'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-error'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                            {isOnline ? 'Protocol Live' : 'Edge Node Offline'}
                        </span>
                    </div>
                    {!isOnline && <WifiOff size={14} className="text-error" />}
                </div>

                {/* Main Content Area */}
                <main className="flex-1 pb-32 pt-20 overflow-y-auto w-full max-w-md mx-auto no-scrollbar relative z-10 px-6">
                    {children}
                </main>

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 w-full z-50 bg-white/90 backdrop-blur-xl border-t border-primary-dark/5 pb-8 pt-4">
                    <div className="flex justify-around items-center w-full max-w-md mx-auto h-16">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full active:scale-95 transition-transform"
                                >
                                    <div className={`w-12 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/20' : 'text-text-secondary'}`}>
                                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-primary-dark' : 'text-text-secondary/50'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </AuthProvider>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Wallet, User, Globe, Wifi, WifiOff } from 'lucide-react';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
    }, []);

    const navItems = [
        { icon: Home, label: 'Home', path: '/driver/home' },
        { icon: List, label: 'Queue', path: '/driver/queue' },
        { icon: Wallet, label: 'Wallet', path: '/driver/wallet' },
        { icon: User, label: 'Shift', path: '/driver/shift' },
    ];

    return (
        <div className="min-h-screen relative text-white flex flex-col font-sans selection:bg-emerald-500/30 overflow-hidden">
            <div className="mesh-bg" />

            {/* Status Bar */}
            <div className={`fixed top-0 w-full z-50 px-6 py-3 flex justify-between items-center glass-v2 border-b ${isOnline ? 'border-white/5' : 'border-red-500/20 bg-red-900/10'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        {isOnline ? 'Protocol Live' : 'Edge Node Offline'}
                    </span>
                </div>
                {!isOnline && <WifiOff size={14} className="text-red-500" />}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 pb-32 pt-20 overflow-y-auto w-full max-w-md mx-auto no-scrollbar relative z-10 px-6">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full z-50 glass-v2 border-t border-white/5 pb-8 pt-4">
                <div className="flex justify-around items-center w-full max-w-md mx-auto h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full active:scale-90 transition-transform"
                            >
                                <div className={`w-12 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/20'}`}>
                                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-white/10'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    );
}

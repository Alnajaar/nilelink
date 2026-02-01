'use client';

import React from 'react';
import {
    Search,
    Bell,
    HelpCircle,
    Shield,
    Globe,
    Activity,
    Cpu
} from 'lucide-react';
import { useAuth } from '@shared/providers/AuthProvider';
import { motion } from 'framer-motion';

import { NotificationBell } from '../notifications/NotificationBell';

export function AdminTopbar() {
    const { user } = useAuth();

    return (
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#02050a]/40 backdrop-blur-xl sticky top-0 z-30">
            {/* Left: Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="search"
                        placeholder="Search Protocol DID, Businesses, or Transactions..."
                        className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">
                {/* System Status Indicators */}
                <div className="hidden lg:flex items-center gap-4 border-r border-white/10 pr-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <Activity className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Mainnet Online</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Cpu className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">AI Node Alpha</span>
                    </div>
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Support/Help */}
                <button className="p-2 rounded-xl hover:bg-white/5 transition-colors hidden sm:block">
                    <HelpCircle className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>

                {/* Network / Protocol Selector */}
                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div className="pr-3 hidden md:block">
                        <p className="text-[10px] font-black text-white leading-none uppercase italic">Polygon</p>
                        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest opacity-60">Amoy Testnet</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

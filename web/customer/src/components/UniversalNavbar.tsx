"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown, Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationBadge } from './ui/NotificationBadge';

export function UniversalNavbar() {
    const { unreadCount } = useNotifications();
    
    return (
        <nav className="relative z-50 border-b border-surface bg-primary px-6 lg:px-12 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap size={22} className="text-text" fill="currentColor" />
                </div>
                <span className="text-nav-text font-black tracking-tighter">NileLink</span>
            </Link>

            <div className="hidden lg:flex items-center gap-10">
                {['Ecosystem', 'Protocol', 'Developers', 'Network'].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-xs font-bold uppercase tracking-widest text-nav-text hover:text-surface transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-surface text-xs font-bold text-text">
                    <Globe size={14} />
                    EN
                    <ChevronDown size={12} />
                </div>
                
                {/* Notification Bell */}
                <div className="relative">
                    <button className="p-2 text-nav-text hover:bg-surface rounded-lg transition-colors relative">
                        <Bell size={20} />
                        <NotificationBadge count={unreadCount} />
                    </button>
                </div>
                
                <Link
                    href="https://dashboard.nilelink.app"
                    className="bg-surface text-text hover:bg-background px-4 py-2.5 text-[10px] font-bold rounded-lg border border-primary transition-colors"
                >
                    Launch Console
                </Link>
                <button className="lg:hidden p-2 text-nav-text">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
}
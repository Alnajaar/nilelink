'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileBarChart,
    ShieldCheck,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    Zap,
    Key,
    Percent
} from 'lucide-react';
import { useAuth } from '@shared/providers/AuthProvider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Businesses', href: '/businesses', icon: Building2 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
    { name: 'Activations', href: '/super-admin/activations', icon: Key, role: 'SUPER_ADMIN' },
    { name: 'Commissions', href: '/super-admin/commissions', icon: Percent, role: 'SUPER_ADMIN' },
    { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck, role: 'SUPER_ADMIN' },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-white/5 bg-[#02050a]/40 backdrop-blur-xl">
            {/* Logo Section */}
            <div className="p-8">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
                        <Zap className="text-white w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white leading-none tracking-tighter uppercase italic">
                            NILE<span className="text-blue-500">LINK</span>
                        </h1>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1 opacity-60">
                            Protocol Control
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    if (item.role && user?.role !== item.role) return null;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative overflow-hidden",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-blue-400 shadow-blue-500" : "text-gray-500 group-hover:text-blue-400"
                            )} />
                            <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute right-0 w-1 h-6 bg-blue-500 rounded-l-full"
                                />
                            )}

                            <ChevronRight className={cn(
                                "ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all",
                                isActive ? "opacity-100 text-blue-400" : "text-gray-600"
                            )} />
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 text-xs font-bold text-white uppercase italic">
                        {user?.firstName?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate uppercase italic">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter truncate opacity-60">
                            {user?.role === 'SUPER_ADMIN' ? 'Root Admin' : 'Admin'}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

"use client";

import React from 'react';
import { Zap, Menu, Globe, ChevronDown, Activity, User, LayoutGrid, Bell } from 'lucide-react';
import Link from 'next/link';
import { AppSwitcher } from './AppSwitcher';
import { NotificationBadge } from './NotificationBadge';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';

interface UniversalNavbarProps {
    context?: 'supplier' | 'customer' | 'default';
}

export function UniversalNavbar({ context = 'default' }: UniversalNavbarProps = {}) {
    const { isConnected, address, profile, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = React.useState(false);

    // Filter notifications based on role for premium security
    const user = profile ? { ...profile, email: profile.email || '' } : null;
    const filteredNotifications = notifications.filter(n => !n.isAdminOnly || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
    const displayUnreadCount = filteredNotifications.filter(n => !n.read).length;

    const getNavItems = () => {
        switch (context) {
            case 'customer':
                return [
                    { href: "/", label: "Home" },
                    { href: "/restaurants", label: "Restaurants" },
                    { href: "/orders", label: "Orders" },
                    { href: "/account", label: "Account" },
                ];
            case 'supplier':
                return [
                    { href: "/", label: "Dashboard" },
                    { href: "/catalog", label: "Catalog" },
                    { href: "/orders", label: "Orders" },
                    { href: "/analytics", label: "Analytics" },
                ];
            default:
                return [
                    { href: "/", label: "Home" },
                    { href: "/pos", label: "POS Terminal" },
                    { href: "/supplier", label: "Supply Chain" },
                    { href: "/customer", label: "Customer Portal" },
                    { href: "/docs", label: "Documentation" },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center shadow-2xl overflow-hidden rounded-xl">
                            <img src="/shared/assets/logo/logo-square.png" alt="NileLink" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
                        {navItems.map((item, index) => (
                            <Link
                                key={`${item.href}-${index}`}
                                href={item.href}
                                className="hover:opacity-100 transition-opacity"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:block">
                        <AppSwitcher />
                    </div>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-text hover:bg-primary/10 rounded-lg transition-colors relative"
                        >
                            <Bell size={20} />
                            <NotificationBadge count={displayUnreadCount} />
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <NotificationCenter
                                    notifications={filteredNotifications.map(n => ({
                                        ...n,
                                        timestamp: n.createdAt
                                    }))}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                />
                            </div>
                        )}
                    </div>

                    {isConnected && user ? (
                        <Link href="/profile"
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20 group cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                {user.firstName?.[0] || user.email?.[0] || address?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">My Account</span>
                        </Link>
                    ) : (
                        <Link href="/auth/login"
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20 group"
                        >
                            <User className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Connect Account</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

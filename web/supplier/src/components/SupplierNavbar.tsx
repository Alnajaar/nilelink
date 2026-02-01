'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

import {
    Search, Bell, Globe, User, Menu, X, ChevronDown,
    Package, BarChart3, ShoppingCart, Truck, Box,
    FileText, LogOut, Settings, Wallet, AlertCircle,
    PackageSearch, TrendingUp
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<any>;
    description?: string;
    badge?: number;
}

const supplierNavigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        description: 'Overview & Analytics'
    },
    {
        label: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
        description: 'Manage Purchase Orders'
    },
    {
        label: 'Catalog',
        href: '/catalog',
        icon: Package,
        description: 'Product Catalog'
    },
    {
        label: 'Inventory',
        href: '/inventory',
        icon: Box,
        description: 'Stock Management'
    },
    {
        label: 'Fulfillment',
        href: '/fulfillment',
        icon: Truck,
        description: 'Shipment Tracking'
    },
    {
        label: 'Reports',
        href: '/reports',
        icon: FileText,
        description: 'Analytics & Reports'
    }
];

interface SupplierNavbarProps {
    variant?: 'default' | 'minimal' | 'transparent';
}

export default function SupplierNavbar({ variant = 'default' }: SupplierNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user: authUser, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadNotifications, setUnreadNotifications] = useState(3);
    const [isMounted, setIsMounted] = useState(false);
    const [localUser, setLocalUser] = useState<any>(null);

    // Use auth context user only after mount to avoid hydration mismatch
    const user = isMounted ? (authUser || localUser) : null;
    const isLoggedIn = isMounted && !!user;

    // Load user from localStorage on mount for immediate display
    useEffect(() => {
        setIsMounted(true);
        try {
            const storedUserJson = localStorage.getItem('nilelink_current_user');
            if (storedUserJson) {
                const storedUser = JSON.parse(storedUserJson);
                setLocalUser(storedUser);
            }
        } catch (e) {
            console.error('Failed to parse stored user:', e);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const bgClass = variant === 'transparent'
        ? 'bg-transparent'
        : scrolled
            ? 'bg-background-primary/95 backdrop-blur-xl border-b border-border-medium shadow-xl'
            : 'bg-background-primary/70 backdrop-blur-lg border-b border-border-default';

    // Don't render until mounted to avoid hydration errors
    if (!isMounted) {
        return (
            <nav className="sticky top-0 z-40 w-full bg-background-primary/70 backdrop-blur-lg border-b border-border-default">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg" />
                            <span className="text-xl font-bold text-white">NileLink</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="h-9 w-20 bg-background-secondary rounded-lg animate-pulse" />
                            <div className="h-9 w-24 bg-primary/20 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            {/* Desktop Navbar */}
            <motion.nav
                className={`sticky top-0 z-40 w-full transition-all duration-300 ${bgClass}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <img
                                src="/logo.png"
                                alt="NileLink Logo"
                                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                    // Fallback if logo fails to load
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg items-center justify-center text-white font-bold text-sm hidden">
                                NL
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                                    NileLink
                                </span>
                                <span className="text-xs text-slate-400">Supplier Portal</span>
                            </div>
                        </Link>

                        {/* Center Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {supplierNavigationItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isActive
                                                ? 'text-blue-400 bg-blue-500/10'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative hidden lg:block">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-48 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                                </div>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition">
                                <Bell className="w-5 h-5 text-slate-300 hover:text-white" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Settings */}
                            <Link href="/settings" className="p-2 hover:bg-slate-800/50 rounded-lg transition">
                                <Settings className="w-5 h-5 text-slate-300 hover:text-white" />
                            </Link>

                            {/* Profile / Login */}
                            {isMounted && (isLoggedIn ? (
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                            {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="hidden xl:block text-left">
                                            <div className="text-sm font-medium text-white">{user?.firstName || user?.name || 'Supplier'}</div>
                                            <div className="text-xs text-slate-400">{user?.role || 'VENDOR'}</div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>

                                    <motion.div
                                        className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700/30">
                                            {user?.email || 'Supplier Account'}
                                        </div>
                                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link href="/ledger" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70">
                                            <Wallet className="w-4 h-4" />
                                            <span>Ledger & Payments</span>
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70">
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </Link>
                                        <hr className="my-2 border-slate-700/30" />
                                        <button onClick={async () => {
                                            await logout();
                                            router.push('/auth/login');
                                        }} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800/70 text-left">
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/auth/login" className="px-4 py-2 text-slate-300 hover:text-white transition">
                                        Login
                                    </Link>
                                    <Link href="/auth/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                        Register
                                    </Link>
                                </div>
                            ))}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 hover:bg-slate-800/50 rounded-lg transition"
                            >
                                {mobileOpen ? (
                                    <X className="w-5 h-5 text-slate-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-slate-300" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.div
                            className="absolute top-[72px] left-0 right-0 bg-slate-900/95 border-b border-slate-800/50 max-h-[calc(100vh-72px)] overflow-y-auto"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4">
                                {/* Mobile Search */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
                                </div>

                                {/* Mobile Navigation */}
                                <div className="space-y-1">
                                    {supplierNavigationItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${isActive
                                                        ? 'text-blue-400 bg-blue-500/10'
                                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                                    }`}
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                                <span>{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

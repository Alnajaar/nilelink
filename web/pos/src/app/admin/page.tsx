"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Settings, Package, Users, BarChart,
    CreditCard, ArrowUpRight, Search, Bell, Plus, Clock,
    Shield, CheckCircle2, AlertCircle, Gem, Store, Menu, X,
    Zap, TrendingUp, Activity, Box, Globe, LogOut, DollarSign,
    Laptop, RefreshCw, Printer, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePOS } from '@/contexts/POSContext';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { engines, isInitialized } = usePOS();
    const [mounted, setMounted] = useState(false);
    const [businessName, setBusinessName] = useState('NileLink Business');
    const [userLocation, setUserLocation] = useState<string>('');
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [stats, setStats] = useState<any[]>([]);
    const [terminals, setTerminals] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        
        // Load business data
        const storedBusiness = localStorage.getItem('businessName');
        if (storedBusiness) setBusinessName(storedBusiness);

        // Get user location
        getUserLocation();

        // Load real data
        loadDashboardData();
    }, [isInitialized, engines]);

    const getUserLocation = async () => {
        setIsLocationLoading(true);
        try {
            // In a real implementation, this would get actual location
            setUserLocation('Cairo, Egypt');
        } catch (error) {
            console.error('Failed to get location:', error);
            setUserLocation('Location unavailable');
        } finally {
            setIsLocationLoading(false);
        }
    };

    const loadDashboardData = async () => {
        if (!isInitialized || !engines.orderEngine) return;

        try {
            // Load real statistics
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            
            const todaysOrders = await engines.orderEngine.getOrdersByDate(startOfDay);
            const totalRevenue = todaysOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
            const activeOrders = todaysOrders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled').length;
            
            setStats([
                { 
                    label: 'Today\'s Revenue', 
                    value: `$${totalRevenue.toFixed(2)}`, 
                    change: '+12%', 
                    icon: TrendingUp, 
                    color: 'text-blue-600', 
                    glow: 'shadow-blue-500/20', 
                    variant: 'primary' as const 
                },
                { 
                    label: 'Active Orders', 
                    value: activeOrders.toString(), 
                    change: '+5%', 
                    icon: Activity, 
                    color: 'text-green-600', 
                    glow: 'shadow-green-500/20', 
                    variant: 'success' as const 
                },
                { 
                    label: 'Products', 
                    value: (await engines.productEngine.getProductCount()).toString(), 
                    change: '0%', 
                    icon: Package, 
                    color: 'text-purple-600', 
                    glow: 'shadow-purple-500/20', 
                    variant: 'accent' as const 
                },
                { 
                    label: 'Staff Members', 
                    value: (await engines.staffEngine.getStaffCount()).toString(), 
                    change: '-2%', 
                    icon: Users, 
                    color: 'text-orange-600', 
                    glow: 'shadow-orange-500/20', 
                    variant: 'warning' as const 
                },
            ]);

            // Load terminal data
            const terminalData = [
                { 
                    name: 'Main Counter', 
                    id: 'POS-001', 
                    status: 'Active', 
                    users: 2, 
                    type: 'Stationary', 
                    statusVariant: 'success' as const 
                },
                { 
                    name: 'Kitchen Display', 
                    id: 'KDS-001', 
                    status: 'Active', 
                    users: 1, 
                    type: 'Display', 
                    statusVariant: 'success' as const 
                },
                { 
                    name: 'Mobile Terminal', 
                    id: 'MPOS-001', 
                    status: 'Offline', 
                    users: 0, 
                    type: 'Handheld', 
                    statusVariant: 'error' as const 
                }
            ];
            setTerminals(terminalData);

            // Load notifications
            const recentNotifications = [
                { 
                    id: 1, 
                    title: 'Low Stock Alert', 
                    message: 'Coffee beans stock is running low', 
                    time: '5m ago', 
                    type: 'warning' 
                },
                { 
                    id: 2, 
                    title: 'New Order', 
                    message: 'Table 5 placed a new order', 
                    time: '12m ago', 
                    type: 'success' 
                },
                { 
                    id: 3, 
                    title: 'Payment Received', 
                    message: 'USDC payment confirmed for order #12345', 
                    time: '25m ago', 
                    type: 'info' 
                }
            ];
            setNotifications(recentNotifications);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', active: true },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: Users, label: 'Staff', path: '/admin/staff' },
        { icon: BarChart, label: 'Analytics', path: '/admin/analytics' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    if (!mounted) return null;

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-[60] w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg`}>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-xs text-gray-500">Business Management</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    item.active
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <Card className="p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <Gem size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-600 uppercase">Business Plan</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                            Standard plan active with all features unlocked.
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => router.push('/admin/plans')}
                        >
                            View Plans
                        </Button>
                    </Card>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-6">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {businessName}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="success" className="text-xs">
                                    Online
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Globe size={14} className="text-blue-500" />
                                    {userLocation}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-lg hover:bg-gray-100 relative"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                                            <Badge variant="info" className="text-xs">
                                                {notifications.length} new
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {notifications.map(n => (
                                                <div key={n.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        n.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                        n.type === 'success' ? 'bg-green-100 text-green-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                        {n.type === 'warning' ? <AlertCircle size={16} /> : 
                                                         n.type === 'success' ? <CheckCircle2 size={16} /> : 
                                                         <Activity size={16} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                                        <p className="text-xs text-gray-600">{n.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-4 py-2 text-xs text-gray-600 hover:text-gray-900">
                                            View all notifications
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <Badge variant={stat.variant} className="text-xs">
                                            {stat.change}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: Plus, label: 'Add Product', path: '/admin/products', color: 'bg-blue-50 text-blue-600' },
                                { icon: Users, label: 'Add Staff', path: '/admin/staff', color: 'bg-green-50 text-green-600' },
                                { icon: Package, label: 'Inventory', path: '/terminal/inventory', color: 'bg-purple-50 text-purple-600' },
                                { icon: CreditCard, label: 'Payments', path: '/admin/payments', color: 'bg-orange-50 text-orange-600' }
                            ].map((action, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ y: -4 }}
                                    onClick={() => router.push(action.path)}
                                    className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-all group"
                                >
                                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                        <action.icon size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">{action.label}</p>
                                    <p className="text-xs text-gray-500">Click to start</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Terminals */}
                        <Card className="p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Terminals</h3>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.push('/admin/settings/hardware')}
                                >
                                    Manage
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {terminals.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600">
                                                {t.type === 'Stationary' ? <Laptop size={20} /> : 
                                                 t.type === 'Display' ? <RefreshCw size={20} /> : 
                                                 <Smartphone size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{t.name}</p>
                                                <p className="text-xs text-gray-500">ID: {t.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={t.statusVariant} className="text-xs mb-1">
                                                {t.status}
                                            </Badge>
                                            <p className="text-xs text-gray-500">{t.users} users</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                {notifications.slice(0, 3).map((event, idx) => (
                                    <div key={idx} className="flex gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-all">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            event.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                            event.type === 'success' ? 'bg-green-100 text-green-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {event.type === 'warning' ? <AlertCircle size={16} /> : 
                                             event.type === 'success' ? <CheckCircle2 size={16} /> : 
                                             <Activity size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-gray-600">{event.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{event.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-blue-600">
                                View all activity
                            </button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

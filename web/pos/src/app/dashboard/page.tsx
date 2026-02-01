'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, ShoppingCart, Users, Settings,
    LogOut, Bell, Search, Menu, X, TrendingUp,
    Activity, Package, Shield, CheckCircle,
    Clock, AlertCircle, Database, Cpu, Network,
    Zap, Globe, MapPin, User, Plus, Eye, Edit, Trash2,
    Filter, Download, Upload, ArrowUpRight, ArrowDownRight,
    RefreshCw, HardDrive, LayoutGrid, List, Layers, Wallet,
    Key, ShieldAlert, Wifi, Printer, Tablet, UserPlus,
    Banknote, Truck, MessageSquare, ChevronRight
} from 'lucide-react';
import { useAuth } from '@shared/providers/AuthProvider';
import { usePOS } from '@/contexts/POSContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { LocationSwitcher } from '@/components/LocationSwitcher';
import graphService from '@shared/services/GraphService';
import { ProductType, UnitType, ProductStatus, InventoryTrackingMethod } from '@/lib/core/ProductInventoryEngine';
import { PayrollView } from '@/components/dashboard/PayrollView';
import { ProcurementView } from '@/components/dashboard/ProcurementView'; // Corrected import path

// --- TYPES ---
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    sku?: string;
}

interface Order {
    id: string;
    customer: string;
    items: number;
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
    time: string;
    paymentMethod: string;
    timestamp: number;
}

interface Staff {
    id: string;
    username: string;
    role: string;
    status: string;
    uniqueCode: string;
}

interface KPICard {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    trend: 'up' | 'down' | 'neutral';
    color: string;
}

// --- SUB-COMPONENTS ---

const SystemHUD = ({ nodeHealth, syncStatus, activeRole, onToggleSidebar }: any) => (
    <div className="flex flex-wrap items-center gap-4 px-6 py-2 bg-pos-bg-primary/40 backdrop-blur-xl border-b border-pos-border-subtle sticky top-0 z-40">
        <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-pos-text-muted hover:text-pos-accent transition-colors"
        >
            <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${nodeHealth === 'OPTIMAL' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-warning animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Node: {nodeHealth}</span>
        </div>
        <div className="h-4 w-[1px] bg-pos-border-subtle" />
        <div className="flex items-center gap-2">
            <RefreshCw size={12} className={`text-pos-accent ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Ledger: {syncStatus}</span>
        </div>
        <div className="h-4 w-[1px] bg-pos-border-subtle" />
        <div className="flex items-center gap-2">
            <Shield size={12} className="text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Sovereign OS v4.2</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-pos-accent">Role:</span>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-pos-accent/30 text-pos-accent px-3">
                    {activeRole}
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <button className="relative group">
                    <Bell size={18} className="text-pos-text-muted group-hover:text-white transition-colors" />
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary rounded-full border border-pos-bg-primary" />
                </button>
                <div className="h-8 w-8 rounded-xl bg-pos-bg-secondary border border-pos-border-subtle flex items-center justify-center overflow-hidden">
                    <User size={16} className="text-pos-text-muted" />
                </div>
            </div>
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, actions }: { title: string, subtitle?: string, actions?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-8 pt-10 border-b border-pos-border-subtle pb-8 bg-gradient-to-b from-pos-bg-secondary/20 to-transparent">
        <div>
            <h2 className="text-5xl font-black italic tracking-tightest uppercase leading-none mb-3 text-white">{title}</h2>
            {subtitle && <p className="text-xs font-bold uppercase tracking-[0.3em] text-pos-accent ml-1">{subtitle}</p>}
        </div>
        <div className="flex gap-4">{actions}</div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
    const router = useRouter();
    const { user, isWalletConnected, isLoading, logout, address } = useAuth();
    const { engines, isInitialized, restaurantId } = usePOS();
    const { businessType } = useBusiness();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('24H');

    // Real Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [syncState, setSyncState] = useState<'IDLE' | 'SYNCING' | 'ERROR'>('IDLE');
    const [nodeHealth, setNodeHealth] = useState<'OPTIMAL' | 'DEGRADED'>('OPTIMAL');

    // Modals & Action State
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [newStaffData, setNewStaffData] = useState({ username: '', pin: '', role: 'CASHIER' as any });
    const [newProductData, setNewProductData] = useState({ name: '', price: '', stock: '', category: 'General' });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Session Security & Routing
    useEffect(() => {
        if (mounted && !isLoading) {
            if (!user && !isWalletConnected) {
                router.push('/auth/login');
            } else if (user && !user.businessId && user.role === 'USER') {
                router.push('/onboarding');
            } else {
                // Strict Activation Check
                const activationStatus = localStorage.getItem('nilelink_activation_status');
                const isDev = user?.email?.includes('@nilelink.com'); // Allow Admins/Devs bypass
                if (activationStatus !== 'active' && !isDev) {
                    router.push('/activation');
                }
            }
        }
    }, [mounted, user, isWalletConnected, isLoading, router]);

    // Data Engine Integration
    const loadOperationalData = async () => {
        if (!isInitialized || !mounted) return;
        setSyncState('SYNCING');

        try {
            // 1. Fetch Orders from Ledger
            if (engines.orderEngine) {
                const allOrders = await engines.orderEngine.getAllOrders();
                const filtered = allOrders
                    .filter((o: any) => !restaurantId || o.restaurantId === restaurantId)
                    .map((o: any) => ({
                        id: o.id,
                        customer: o.customerName || 'Walk-in customer',
                        items: o.items?.length || 0,
                        total: Number(o.totalAmount || o.total || 0),
                        status: (o.status || 'pending') as Order['status'],
                        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---',
                        timestamp: o.createdAt ? new Date(o.createdAt).getTime() : 0,
                        paymentMethod: o.paymentMethod || 'Unknown'
                    }))
                    .sort((a: any, b: any) => b.timestamp - a.timestamp);
                setOrders(filtered);
            }

            // 2. Fetch Products
            if (engines.productEngine) {
                const searchId = restaurantId || 'DEV_INTERNAL_NODE';
                const businessProducts = await engines.productEngine.searchProducts({ businessId: searchId });
                setProducts(businessProducts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.variants?.[0]?.price || 0,
                    stock: p.variants?.[0]?.inventory?.available || 0,
                    category: p.category || 'General',
                    sku: p.variants?.[0]?.sku || 'P-000'
                })));
            }

            // 3. Fetch Staff
            if (engines.staffEngine) {
                const staff = await engines.staffEngine.listStaff();
                setStaffList(staff.map((s: any) => ({
                    id: s.id,
                    username: s.username,
                    role: s.roles[0],
                    status: s.status,
                    uniqueCode: s.uniqueCode
                })));
            }

            // 4. Fetch Alerts (Notifications)
            if (engines.productEngine) {
                const alerts = engines.productEngine.getAlerts();
                setNotifications(alerts.map((a: any) => ({
                    id: a.id,
                    type: a.severity === 'urgent' || a.severity === 'critical' || a.severity === 'high' ? 'critical' : a.severity === 'medium' ? 'warning' : 'success',
                    title: a.type.replace('_', ' ').toUpperCase(),
                    msg: a.message,
                    time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })));
            }

            setSyncState('IDLE');
        } catch (error) {
            console.error('[Dashboard Engine] Sync Fault:', error);
            setSyncState('ERROR');
            setNodeHealth('DEGRADED');
        }
    };

    useEffect(() => {
        loadOperationalData();
        const interval = setInterval(loadOperationalData, 10000); // 10s Auto-Sync for tighter feedback
        return () => clearInterval(interval);
    }, [isInitialized, mounted, engines, restaurantId]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetId = restaurantId || 'DEV_INTERNAL_NODE';

        if (!engines.staffEngine) {
            console.error('Staff Engine subsystem offline');
            return;
        }

        setSyncState('SYNCING');
        try {
            await engines.staffEngine.createStaff({
                username: newStaffData.username,
                phone: '+0000000000',
                pin: newStaffData.pin,
                roles: [newStaffData.role],
                branchId: targetId
            });
            console.log(`🛡️ Personnel OS: Authorized member commitment to node ${targetId} successful.`);
            console.log('🛡️ Personnel OS: Authorized member commitment successful.');
            setIsStaffModalOpen(false);
            setNewStaffData({ username: '', pin: '', role: 'CASHIER' as any });
            setSyncState('IDLE');
            await loadOperationalData();
            alert('Personnel Authorized Successfully.');
        } catch (error) {
            console.error('Failed to add staff:', error);
            setSyncState('ERROR');
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetId = restaurantId || 'DEV_INTERNAL_NODE';

        if (!engines.productEngine) {
            console.error('Product Engine subsystem offline');
            return;
        }

        setSyncState('SYNCING');
        try {
            // Comprehensive product registration with all required protocol fields
            await (engines.productEngine as any).createProduct({
                name: newProductData.name,
                businessId: targetId,
                description: 'Institutional-grade asset registered via Mission Control.',
                type: ProductType.PHYSICAL,
                category: newProductData.category,
                tags: ['DASHBOARD_ASSET'],
                unitType: UnitType.PIECE,
                unitName: 'Unit',
                status: ProductStatus.ACTIVE,
                taxRate: 0,
                taxInclusive: true,
                images: [],
                metadata: { source: 'MissionControl' },
                createdBy: 'ADMIN_NODE',
                variants: [{
                    id: `v_${Date.now()}`,
                    name: 'Standard',
                    sku: `SKU-${Date.now().toString().slice(-6)}`,
                    price: parseFloat(newProductData.price),
                    cost: parseFloat(newProductData.price) * 0.5,
                    status: ProductStatus.ACTIVE,
                    attributes: {},
                    barcodes: [],
                    images: [],
                    inventory: {
                        method: InventoryTrackingMethod.SIMPLE,
                        available: parseInt(newProductData.stock),
                        reserved: 0,
                        onOrder: 0,
                        committed: 0,
                        damaged: 0,
                        minStock: 10,
                        maxStock: 1000,
                        reorderPoint: 20,
                        locations: [],
                        batches: [],
                        autoReorder: false
                    }
                }]
            });
            console.log('📦 Asset Inventory: Committing resource to decentralized ledger successful.');
            setIsProductModalOpen(false);
            setNewProductData({ name: '', price: '', stock: '', category: 'General' });
            setSyncState('IDLE');
            await loadOperationalData();
            alert('Asset Committed to Ledger Successfully.');
        } catch (error) {
            console.error('Failed to add product:', error);
            setSyncState('ERROR');
        }
    };

    // Financial KPIs Calculation
    const kpiStats: KPICard[] = useMemo(() => {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const todaysOrders = orders.filter(o => o.timestamp >= todayStart);
        const totalRev = todaysOrders.reduce((sum, o) => sum + o.total, 0);
        const activeCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'ready').length;

        return [
            {
                title: 'Gross Revenue',
                value: `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                change: 12.5,
                icon: TrendingUp,
                trend: 'up',
                color: 'pos-accent'
            },
            {
                title: 'Order Velocity',
                value: todaysOrders.length,
                change: 4.2,
                icon: ShoppingCart,
                trend: 'up',
                color: 'success'
            },
            {
                title: 'Operational Heat',
                value: activeCount,
                change: -2.1,
                icon: Activity,
                trend: todaysOrders.length > 10 ? 'up' : 'down',
                color: activeCount > 5 ? 'secondary' : 'success'
            },
            {
                title: 'Staff Online',
                value: staffList.filter(s => s.status === 'active').length,
                change: 0,
                icon: Users,
                trend: 'neutral',
                color: 'pos-text-muted'
            }
        ];
    }, [orders, staffList]);

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-[#020408] flex items-center justify-center font-sans uppercase">
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-20 h-20 border-b-4 border-pos-accent rounded-full shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                    />
                    <p className="text-[12px] font-black tracking-[0.6em] text-pos-accent animate-pulse uppercase">NileLink Protocol Syncing...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'overview', icon: LayoutGrid, label: 'Mission Control' },
        { id: 'sales', icon: ShoppingCart, label: 'Commercial Ledger' },
        { id: 'products', icon: Package, label: 'Asset Inventory' },
        { id: 'staff', icon: Users, label: 'Personnel OS' },
        { id: 'payroll', icon: Banknote, label: 'Payroll & ROI' },
        { id: 'suppliers', icon: Truck, label: 'Procurement' },
        { id: 'analytics', icon: BarChart3, label: 'Intelligence' },
        { id: 'ai', icon: Zap, label: 'Cognitive Assistant' },
        { id: 'notifications', icon: Bell, label: 'Neural Alerts' },
        { id: 'hardware', icon: HardDrive, label: 'Neural Terminals' },
        { id: 'settings', icon: Settings, label: 'Protocol Config' }
    ];

    // --- TAB RENDERING ---

    const renderOverview = () => (
        <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {kpiStats.map((stat, idx) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-8 bg-pos-bg-secondary/40 border-2 border-pos-border-subtle rounded-[2.5rem] hover:border-pos-accent/50 transition-all relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pos-accent/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-pos-accent/10 transition-colors" />
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-pos-bg-primary border border-pos-border-subtle text-${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend === 'up' ? 'text-success' : 'text-secondary'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : stat.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                                {stat.change > 0 && `+${stat.change}%`}
                                {stat.change < 0 && `${stat.change}%`}
                                {stat.change === 0 && 'Stable'}
                            </div>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-pos-text-secondary mb-3">{stat.title}</h3>
                        <p className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-8">
                {/* REVENUE VELOCITY CHART */}
                <div className="xl:col-span-2 p-10 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-pos-text-muted mb-2">Revenue Velocity</h3>
                            <p className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">Institutional Growth</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="border-pos-accent text-pos-accent text-[9px] px-4 font-black">LIVE FEED</Badge>
                        </div>
                    </div>
                    <div className="h-80 w-full relative group">
                        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--pos-accent)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="var(--pos-accent)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                d="M0,250 Q50,220 100,240 T200,180 T300,210 T400,120 T500,150 T600,80 T700,110 T800,40 T900,70 T1000,20 L1000,300 L0,300 Z"
                                fill="url(#gradient)"
                            />
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                d="M0,250 Q50,220 100,240 T200,180 T300,210 T400,120 T500,150 T600,80 T700,110 T800,40 T900,70 T1000,20"
                                fill="none"
                                stroke="var(--pos-accent)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            />
                        </svg>
                    </div>
                </div>

                {/* RECENT OPERATIONAL LOGS */}
                <div className="p-10 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem] flex flex-col h-[500px]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pos-text-muted mb-8 italic">Commercial Registry</h3>
                    <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-2">
                        {orders.length > 0 ? orders.slice(0, 10).map((order) => (
                            <div key={order.id} className="group p-5 bg-pos-bg-primary/40 border border-pos-border-subtle rounded-3xl hover:border-pos-accent/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{order.id.slice(-8)}</h5>
                                        <p className="text-[10px] font-bold text-pos-accent uppercase tracking-widest">{order.customer}</p>
                                    </div>
                                    <span className="text-base font-black italic tracking-tighter text-white">${order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Badge variant="outline" className={`text-[10px] font-black uppercase border-none px-0 ${order.status === 'delivered' ? 'text-success' : 'text-pos-accent'}`}>
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-pos-text-secondary uppercase tracking-widest">{order.time}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <Clock size={48} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Transactions Registered</p>
                            </div>
                        )}
                    </div>
                    <Button variant="outline" className="mt-8 h-14 rounded-2xl border-pos-border-subtle text-[9px] font-black uppercase tracking-[0.2em]" onClick={() => setActiveTab('sales')}>
                        Historical Registry
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderCommercialLedger = () => (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Commercial Ledger"
                subtitle="End-to-end transaction transparency and immutable settlement logs"
                actions={
                    <>
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-pos-border-subtle text-[9px] font-black uppercase tracking-widest hover:bg-pos-bg-secondary">
                            <Filter size={14} className="mr-2" /> Filter Registry
                        </Button>
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-pos-border-subtle text-[9px] font-black uppercase tracking-widest hover:bg-pos-bg-secondary">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                    </>
                }
            />

            <div className="bg-pos-bg-secondary/20 border border-pos-border-subtle rounded-[3rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-pos-bg-primary/40 border-b border-pos-border-subtle">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Transaction ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Customer Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Total Value</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Settlement Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Payment Protocol</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-pos-text-muted pr-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pos-border-subtle/50">
                            {orders.length > 0 ? orders.map((order, idx) => (
                                <tr key={order.id} className={`${idx % 2 === 0 ? 'bg-pos-bg-primary/20' : 'bg-transparent'} hover:bg-pos-accent/5 transition-colors group`}>
                                    <td className="px-8 py-6 font-black text-xs text-white uppercase tracking-tighter">{order.id}</td>
                                    <td className="px-8 py-6 font-bold text-xs text-pos-text-secondary uppercase tracking-widest">{order.customer}</td>
                                    <td className="px-8 py-6 font-black text-base italic tracking-tighter text-pos-accent">${order.total.toFixed(2)}</td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 border-2 ${order.status === 'delivered' ? 'border-success text-success' : 'border-pos-accent text-pos-accent'}`}>
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-black uppercase text-white tracking-widest">{order.paymentMethod}</td>
                                    <td className="px-8 py-6 text-right pr-12">
                                        <button className="p-4 bg-pos-bg-primary border-2 border-pos-border-subtle rounded-xl text-white hover:text-pos-accent hover:border-pos-accent transition-all">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Database size={48} className="mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.4em]">Empty Commercial Ledger</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAssetInventory = () => (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Asset Inventory"
                subtitle="Protocol-level stock management and decentralized catalog coordination"
                actions={
                    <>
                        <>
                            <Button
                                className="h-16 px-10 rounded-2xl bg-pos-accent text-black font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                onClick={() => setIsProductModalOpen(true)}
                            >
                                <Plus size={16} className="mr-2" /> Add Resource
                            </Button>
                        </>
                    </>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                {products.length > 0 ? products.map((p) => (
                    <motion.div
                        key={p.id}
                        whileHover={{ y: -5 }}
                        className="bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[2.5rem] p-8 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pos-accent/5 blur-3xl rounded-full" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-pos-bg-primary rounded-2xl border border-pos-border-subtle">
                                <Package size={24} className="text-pos-text-muted group-hover:text-pos-accent transition-colors" />
                            </div>
                            <Badge variant={p.stock > 10 ? 'success' : 'secondary'} className="text-[8px] font-black uppercase tracking-widest px-3">
                                {p.stock} Units
                            </Badge>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pos-accent mb-2">{p.sku || 'SKU-PENDING'}</h4>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none truncate">{p.name}</h3>
                        <div className="flex items-center justify-between border-t-2 border-pos-border-subtle/50 pt-6">
                            <span className="text-2xl font-black italic tracking-tighter text-pos-accent">${p.price.toFixed(2)}</span>
                            <div className="flex gap-2">
                                <button className="p-4 bg-pos-bg-primary border-2 border-pos-border-subtle rounded-xl text-white hover:text-pos-accent transition-all"><Edit size={18} /></button>
                                <button className="p-4 bg-pos-bg-primary border-2 border-pos-border-subtle rounded-xl text-white hover:text-secondary transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center border-2 border-dashed border-pos-border-subtle rounded-[3rem] opacity-30">
                        <Package size={64} className="mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.4em]">No Assets Registered in Node</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderPersonnelOS = () => (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Personnel OS"
                subtitle="Administrative sovereignty and identity access management for node staff"
                actions={
                    <Button
                        className="h-16 px-10 rounded-2xl bg-pos-accent text-black font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        onClick={() => setIsStaffModalOpen(true)}
                    >
                        <UserPlus size={16} className="mr-2" /> Recruit Staff
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staffList.map((staff, idx) => (
                    <motion.div
                        key={staff.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem] p-8 flex items-center gap-6 group hover:border-pos-accent/30 transition-all"
                    >
                        <div className="w-20 h-20 rounded-[2rem] bg-pos-bg-primary border-2 border-pos-border-subtle flex items-center justify-center text-pos-accent text-3xl font-black italic shadow-inner group-hover:border-pos-accent/50 transition-all">
                            {staff.username.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black uppercase italic tracking-tightest leading-none text-white mb-1.5">{staff.username}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-pos-accent/20 text-pos-accent">{staff.role}</Badge>
                                <span className="text-[10px] font-black text-pos-text-muted uppercase tracking-widest opacity-40">#{staff.uniqueCode}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-pos-text-muted'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest text-pos-text-muted">{staff.status}</span>
                            </div>
                        </div>
                        <button className="p-4 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl text-pos-text-muted hover:text-pos-accent transition-all">
                            <Settings size={20} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderHardware = () => (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Neural Terminals"
                subtitle="Hardware subsystem synchronization and perimeter device monitoring"
                actions={
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-pos-border-subtle font-black uppercase tracking-widest text-[10px]">
                        <RefreshCw size={16} className="mr-2" /> Global Health Test
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-4">
                {[
                    { id: 'T-01', name: 'Master Commercial Node', type: 'Primary Display', status: 'Optimal', icon: Tablet, latency: '12ms' },
                    { id: 'P-01', name: 'Kitchen Ledger Printer', type: 'Thermal Subsystem', status: 'Online', icon: Printer, latency: '4ms' },
                    { id: 'R-01', name: 'Identity Biometric Reader', type: 'Security Shield', status: 'Calibrating', icon: ShieldAlert, latency: '---' }
                ].map((device) => (
                    <div key={device.id} className="bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem] p-10 group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 rounded-full ${device.status === 'Optimal' || device.status === 'Online' ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-5 bg-pos-bg-primary rounded-3xl border border-pos-border-subtle">
                                <device.icon size={32} className={device.status === 'Optimal' || device.status === 'Online' ? 'text-success' : 'text-warning'} />
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-pos-text-muted mb-1">{device.id}</h4>
                                <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest border-none px-0 ${device.status === 'Optimal' || device.status === 'Online' ? 'text-success' : 'text-warning'}`}>
                                    {device.status}
                                </Badge>
                            </div>
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tightest leading-none text-white mb-2">{device.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pos-text-muted opacity-60 mb-8">{device.type}</p>

                        <div className="flex items-center justify-between border-t border-pos-border-subtle/30 pt-8">
                            <div className="flex items-center gap-3">
                                <Wifi size={14} className="text-pos-text-muted" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-pos-text-muted">Lat: {device.latency}</span>
                            </div>
                            <button className="text-[9px] font-black uppercase tracking-widest text-pos-accent hover:underline">Diagnostic Report</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Protocol Configuration"
                subtitle="Master node governance and commercial jurisdiction calibration"
            />

            <div className="max-w-4xl space-y-8">
                <div className="p-10 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <Key size={24} className="text-pos-accent" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Identity Management</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-pos-text-muted ml-1">Commercial Name</label>
                            <input type="text" defaultValue={user?.businessName} className="w-full h-16 bg-pos-bg-primary/40 border border-pos-border-subtle rounded-2xl px-6 font-black uppercase tracking-widest text-sm focus:border-pos-accent outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-pos-text-muted ml-1">Protocol Node ID</label>
                            <input type="text" disabled defaultValue={restaurantId} className="w-full h-16 bg-pos-bg-primary/20 border border-pos-border-subtle rounded-2xl px-6 font-black uppercase tracking-widest text-xs opacity-50 outline-none" />
                        </div>
                    </div>
                    <Button className="mt-10 h-16 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]">Apply Security Patches</Button>
                </div>

                <div className="p-10 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <Globe size={24} className="text-secondary" />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Sovereign Jurisdiction</h3>
                    </div>
                    <p className="text-sm text-pos-text-muted mb-8 italic tracking-tight">Current node location: {user?.location || 'Unassigned Jurisdiction'}</p>
                    <LocationSwitcher />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans selection:bg-pos-accent/30 overflow-hidden">
            <SystemHUD nodeHealth={nodeHealth} syncStatus={syncState} activeRole={user?.role || 'OPERATOR'} onToggleSidebar={() => setSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
                {/* MOBILE SIDEBAR DRAWERS */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed left-0 top-0 bottom-0 w-[280px] bg-pos-bg-primary border-r border-pos-border-subtle z-[51] lg:hidden flex flex-col"
                            >
                                <div className="p-6 border-b border-pos-border-subtle flex items-center justify-between">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase">{user?.businessName || 'Node Alpha'}</h2>
                                    <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <nav className="space-y-2">
                                        {menuItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-pos-accent text-black' : 'text-pos-text-muted hover:bg-pos-bg-secondary'}`}
                                            >
                                                <item.icon size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                                <div className="p-6 border-t border-pos-border-subtle">
                                    <button onClick={logout} className="flex items-center gap-4 text-pos-text-muted hover:text-secondary opacity-60">
                                        <LogOut size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Deauthorize</span>
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* DESKTOP SIDEBAR */}
                <aside className="w-[340px] border-r-2 border-pos-border-subtle bg-pos-bg-primary flex flex-col hidden lg:flex shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
                    <div className="p-10">
                        <div className="flex items-center gap-6 mb-12 overflow-hidden bg-pos-bg-secondary/30 p-6 rounded-[2.5rem] border border-pos-border-subtle">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                className="w-14 h-14 bg-pos-accent rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(34,211,238,0.4)] shrink-0"
                            >
                                <Zap size={32} fill="currentColor" />
                            </motion.div>
                            <div className="min-w-0">
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none truncate text-white">Node Alpha</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pos-accent mt-1">{businessType} ID</p>
                            </div>
                        </div>

                        <nav className="space-y-5">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-8 py-6 rounded-[2rem] transition-all group border-2 ${activeTab === item.id
                                        ? 'bg-pos-accent border-pos-accent text-black shadow-2xl shadow-pos-accent/30 scale-[1.02]'
                                        : 'text-white/60 hover:text-white hover:bg-pos-bg-secondary/50 border-transparent hover:border-pos-border-subtle'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <item.icon size={22} className={activeTab === item.id ? 'stroke-[3px]' : 'group-hover:text-pos-accent'} />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] leading-none mt-0.5">{item.label}</span>
                                    </div>
                                    {activeTab === item.id && <motion.div layoutId="nav-dot" className="w-2.5 h-2.5 rounded-full bg-black/50" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto p-10 border-t-2 border-pos-border-subtle bg-pos-bg-secondary/20">
                        <div className="p-8 bg-pos-bg-primary border-2 border-pos-accent/20 rounded-[2.5rem] mb-8 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pos-accent/5 blur-3xl rounded-full" />
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">Protocol Safe</span>
                            </div>
                            <p className="text-[10px] font-bold text-pos-text-secondary uppercase tracking-[0.2em] leading-relaxed">Sovereign Encryption Node Active. Data immutable.</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-6 px-8 py-6 text-pos-danger/60 hover:text-pos-danger hover:bg-pos-danger/5 rounded-[2rem] transition-all border-2 border-transparent hover:border-pos-danger/20 group"
                        >
                            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] mt-0.5">Deauthorize Node</span>
                        </button>
                    </div>
                </aside>

                {/* MISSION CONTROL CENTER */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pos-bg-primary/20 via-transparent to-transparent">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'sales' && renderCommercialLedger()}
                            {activeTab === 'products' && renderAssetInventory()}
                            {activeTab === 'staff' && renderPersonnelOS()}
                            {activeTab === 'payroll' && <PayrollView />}
                            {activeTab === 'suppliers' && <ProcurementView />}
                            {activeTab === 'hardware' && renderHardware()}
                            {activeTab === 'settings' && renderSettings()}

                            {activeTab === 'analytics' && (
                                <div className="p-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
                                    <BarChart3 size={80} className="text-pos-accent mb-10 opacity-40 animate-pulse" />
                                    <h2 className="text-3xl font-black uppercase italic tracking-tightest mb-4">Neural Intelligence OS</h2>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-pos-text-muted max-w-lg mb-10 opacity-60">Calibration in progress. Fetching cross-branch longitudinal datasets for predictive commercial modeling.</p>
                                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-pos-border-subtle text-white font-bold" onClick={() => setActiveTab('overview')}>Sync Primary Node</Button>
                                </div>
                            )}

                            {activeTab === 'ai' && (
                                <div className="p-10 flex flex-col items-center justify-center min-h-[70vh] text-center max-w-4xl mx-auto">
                                    <div className="w-24 h-24 rounded-full bg-pos-accent/20 border-2 border-pos-accent flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                                        <Zap size={48} className="text-pos-accent" />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tightest uppercase mb-4 text-white">NileLink Cognitive Assistant</h2>
                                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-pos-accent mb-12">Universal Business Oracle v1.4.2</p>

                                    <div className="w-full bg-pos-bg-secondary/20 border-2 border-pos-border-subtle rounded-[3rem] p-10 text-left space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-pos-accent/10 flex items-center justify-center mt-1"><MessageSquare size={16} className="text-pos-accent" /></div>
                                            <div className="flex-1 bg-pos-bg-primary/40 border border-pos-border-subtle p-6 rounded-2xl">
                                                <p className="text-sm text-white font-medium leading-relaxed italic">"Welcome back, Administrator. Neural synchronization complete. Currently analyzing Longitudinal Revenue Velocity for Node Alpha. Would you like a projection of next week's inventory requirements based on Current Asset Reserves?"</p>
                                            </div>
                                        </div>
                                        <div className="pt-8 border-t border-pos-border-subtle/50 flex gap-4">
                                            <input placeholder="Query the Oracle..." className="flex-1 h-14 bg-pos-bg-primary border border-pos-border-subtle rounded-xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                            <Button className="h-14 w-14 rounded-xl bg-pos-accent text-black"><ChevronRight size={24} /></Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="p-10 space-y-8">
                                    <SectionHeader title="Neural Alerts" subtitle="Real-time protocol event log and mission critical notifications" />
                                    <div className="grid gap-4 max-w-4xl">
                                        {notifications.length > 0 ? notifications.map(alert => (
                                            <div key={alert.id} className="p-8 bg-pos-bg-secondary/40 border-2 border-pos-border-subtle rounded-3xl flex gap-6 items-center group hover:border-pos-accent/30 transition-all">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${alert.type === 'critical' ? 'bg-pos-danger text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : alert.type === 'warning' ? 'bg-pos-warning text-white' : 'bg-pos-success text-white'}`}>
                                                    {alert.type === 'critical' ? <AlertCircle size={24} /> : alert.type === 'warning' ? <HardDrive size={24} /> : <CheckCircle size={24} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{alert.title}</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-pos-accent">{alert.time}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-pos-text-secondary leading-relaxed uppercase tracking-wide">{alert.msg}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-8 text-center text-pos-text-muted">No active neural alerts. System operating within nominal parameters.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {(isStaffModalOpen || isProductModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => { setIsStaffModalOpen(false); setIsProductModalOpen(false); }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-pos-bg-secondary border-2 border-pos-accent/30 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(34,211,238,0.1)]"
                        >
                            {isStaffModalOpen ? (
                                <form onSubmit={handleAddStaff} className="space-y-8">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Recruit Node Personnel</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Operator Identity</label>
                                            <input required value={newStaffData.username} onChange={e => setNewStaffData({ ...newStaffData, username: e.target.value })} placeholder="e.g. ALAN_TURK" className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Access Token (PIN)</label>
                                                <input required type="password" maxLength={6} value={newStaffData.pin} onChange={e => setNewStaffData({ ...newStaffData, pin: e.target.value })} placeholder="******" className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Protocol Role</label>
                                                <select value={newStaffData.role} onChange={e => setNewStaffData({ ...newStaffData, role: e.target.value as any })} className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent appearance-none">
                                                    <option value="CASHIER">CASHIER</option>
                                                    <option value="MANAGER">MANAGER</option>
                                                    <option value="SERVER">SERVER</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <Button type="button" variant="outline" className="flex-1 h-16 rounded-2xl" onClick={() => setIsStaffModalOpen(false)}>Abort</Button>
                                        <Button type="submit" disabled={syncState === 'SYNCING'} className="flex-1 h-16 rounded-2xl bg-pos-accent text-black font-black uppercase shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                                            {syncState === 'SYNCING' ? 'Authorized...' : 'Authorize Member'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleAddProduct} className="space-y-8">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Register Asset Resource</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Resource Name</label>
                                            <input required value={newProductData.name} onChange={e => setNewProductData({ ...newProductData, name: e.target.value })} placeholder="e.g. Premium Espresso" className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Unit Valuation ($)</label>
                                                <input required type="number" step="0.01" value={newProductData.price} onChange={e => setNewProductData({ ...newProductData, price: e.target.value })} placeholder="0.00" className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-pos-accent ml-2">Initial Reserves</label>
                                                <input required type="number" value={newProductData.stock} onChange={e => setNewProductData({ ...newProductData, stock: e.target.value })} placeholder="0" className="w-full h-16 bg-pos-bg-primary border border-pos-border-subtle rounded-2xl px-6 font-bold text-white outline-none focus:border-pos-accent" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <Button type="button" variant="outline" className="flex-1 h-16 rounded-2xl border-pos-border-subtle text-pos-text-muted hover:text-white font-black uppercase tracking-widest text-[10px]" onClick={() => setIsProductModalOpen(false)}>Abort</Button>
                                        <Button type="submit" disabled={syncState === 'SYNCING'} className="flex-1 h-16 rounded-2xl bg-pos-accent text-black font-black uppercase text-[10px] tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all">
                                            {syncState === 'SYNCING' ? 'Syncing...' : 'Commit to Ledger'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Neural Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pos-accent/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[160px] rounded-full" />
            </div>
        </div>
    );
}
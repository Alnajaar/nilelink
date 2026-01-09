"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Package, TrendingUp, AlertTriangle, DollarSign, Activity,
    ShoppingCart, Users, BarChart3, Clock, CheckCircle,
    Truck, FileText, Settings, Bell, Search, Plus, Brain,
    Zap, Star, Award, Target, ArrowUp, ArrowDown,
    RefreshCw, Eye, Download, Filter, Calendar, Globe
} from 'lucide-react';

import { useAuth } from '@shared/contexts/AuthContext';
import { useNotification } from '@shared/contexts/NotificationContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function SupplierDashboard() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { notify } = useNotification();
    const [data, setData] = useState<any[]>([]);
    const [credit, setCredit] = useState<any>(null);
    const [autonomousDrafts, setAutonomousDrafts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        revenue: 0,
        growth: 0,
        efficiency: 0
    });

    // Initial Data Fetch with enhanced mock data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Enhanced mock data for advanced dashboard
                setData([
                    { id: '1', name: 'Premium Coffee Beans', sku: 'PCB-001', current: 150, min: 50, unit: 'kg', category: 'Beverages', price: 45.99, sales: 1250 },
                    { id: '2', name: 'Organic Olive Oil', sku: 'OOO-002', current: 25, min: 30, unit: 'liters', category: 'Oils', price: 89.99, sales: 890 },
                    { id: '3', name: 'Artisan Bread', sku: 'AB-003', current: 200, min: 100, unit: 'loaves', category: 'Bakery', price: 12.50, sales: 2100 },
                    { id: '4', name: 'Fresh Salmon', sku: 'FS-004', current: 40, min: 35, unit: 'kg', category: 'Seafood', price: 156.99, sales: 675 },
                    { id: '5', name: 'Seasonal Vegetables', sku: 'SV-005', current: 300, min: 200, unit: 'kg', category: 'Produce', price: 8.99, sales: 3450 },
                    { id: '6', name: 'Craft Beer Selection', sku: 'CBS-006', current: 180, min: 150, unit: 'cases', category: 'Beverages', price: 199.99, sales: 540 },
                    { id: '7', name: 'Premium Cheese Board', sku: 'PCB-007', current: 85, min: 80, unit: 'sets', category: 'Dairy', price: 145.99, sales: 320 }
                ]);

                setCredit({
                    limit: 75000,
                    used: 18500,
                    available: 56500,
                    terms: 'Net 30',
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    utilizationRate: 24.7,
                    invoices: [
                        { id: 'INV-2024-001', amount: 4200, status: 'Pending', due: '2024-01-15' },
                        { id: 'INV-2024-002', amount: 6800, status: 'Pending', due: '2024-01-20' },
                        { id: 'INV-2024-003', amount: 7500, status: 'Paid', due: '2024-01-08' }
                    ]
                });

                setStats({
                    totalOrders: 342,
                    pendingOrders: 18,
                    lowStockItems: 3,
                    revenue: 67890,
                    growth: 12.5,
                    efficiency: 94.2
                });

                setAutonomousDrafts([
                    {
                        id: 'PO-2024-001',
                        notes: 'AI-driven restock prediction based on seasonal demand analysis and historical sales velocity',
                        totalAmount: 3800,
                        priority: 'High',
                        items: JSON.stringify([
                            { qty: 35, name: 'Organic Olive Oil', sku: 'OOO-002', supplier: 'Mediterranean Organics' },
                            { qty: 75, name: 'Premium Coffee Beans', sku: 'PCB-001', supplier: 'Ethiopian Estates' },
                            { qty: 25, name: 'Craft Beer Selection', sku: 'CBS-006', supplier: 'Local Brewery Co.' }
                        ]),
                        predictedSavings: 1200,
                        confidence: 87
                    },
                    {
                        id: 'PO-2024-002',
                        notes: 'Bulk discount opportunity detected for high-volume seasonal items',
                        totalAmount: 5200,
                        priority: 'Medium',
                        items: JSON.stringify([
                            { qty: 120, name: 'Seasonal Vegetables', sku: 'SV-005', supplier: 'Fresh Farm Collective' }
                        ]),
                        predictedSavings: 800,
                        confidence: 92
                    }
                ]);
            } catch (e) {
                console.error("Failed to fetch supplier data", e);
                notify({ type: 'error', title: 'Dashboard Load Error', message: 'Failed to load dashboard data. Using cached data.' });
            }
        };
        fetchData();
    }, [notify]);

    const approveAutonomousOrder = async (poId: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/suppliers/purchase-orders/${poId}/approve`, {
                method: 'POST'
            });
            const json = await res.json();
            if (json.success) {
                notify({ type: 'success', title: 'Order Approved', message: 'Autonomous restock is now in fulfillment.' });
                setAutonomousDrafts(prev => prev.filter(p => p.id !== poId));
                // Reload inventory
                const invRes = await fetch('http://localhost:3001/api/suppliers/inventory');
                const invData = await invRes.json();
                if (invData.success) setData(invData.data);
            }
        } catch (e) {
            notify({ type: 'error', title: 'Approval Failed', message: 'Network or server error.' });
        }
    };

    const handleRestock = async (id: string, name: string) => {
        try {
            const res = await fetch('http://localhost:3001/api/suppliers/restock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, amount: 50 }) // Default restock amount
            });
            const json = await res.json();

            if (json.success) {
                notify({ type: 'success', title: 'Restock Initiated', message: json.message });
                // Optimistic update
                setData((prev: any[]) => prev.map((item: any) =>
                    item.id === id ? { ...item, current: item.current + 50 } : item
                ));
                setCredit((prev: any) => ({
                    ...prev,
                    used: json.data.creditUsage
                }));
            }
        } catch (e) {
            notify({ type: 'error', title: 'Restock Failed', message: 'Could not process request' });
        }
    };

    if (isLoading) return null;

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-slate-50 antialiased">
                <main className="max-w-7xl mx-auto px-6 py-8 w-full">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 mb-1 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                    Supplier Intelligence Hub
                                </h1>
                                <p className="text-slate-600 font-medium">Advanced analytics and automated supply chain management</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="h-11 px-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </Button>
                            <Button className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                New Order
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, change: `+${stats.growth}%`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Active Orders', value: stats.totalOrders, change: 'Running', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Network Efficiency', value: `${stats.efficiency}%`, change: 'Peak', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Low Stock Alerts', value: stats.lowStockItems, change: 'Priority', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -2 }}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.color} ${stat.bg} uppercase tracking-widest`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Credit & Liquidity Protocol */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-8 text-white shadow-sm">

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Credit Liquidity Protocol</h3>
                                        <p className="text-xs text-slate-400">Institutional grade settlement network</p>
                                    </div>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 uppercase tracking-widest py-1 px-4">{credit?.terms || 'NET 30'}</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-4xl font-black tracking-tighter italic mb-2">${(credit?.available || 0).toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Drawdown</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">Usage Progress</span>
                                                <span className="text-blue-400">{credit?.utilizationRate || 0}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${credit?.utilizationRate || 0}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Pending Obligations</h4>
                                        <div className="space-y-4">
                                            {credit?.invoices.slice(0, 2).map((inv: any) => (
                                                <div key={inv.id} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-black text-white">{inv.id}</p>
                                                        <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Due {inv.due}</p>
                                                    </div>
                                                    <span className="font-mono text-sm font-black text-blue-400">${inv.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6">
                                    <Calendar size={24} />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Next Settlement</h4>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter italic mb-4">{new Date(credit?.dueDate).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">Automatic settlement will be initiated from the primary corporate vault.</p>
                            </div>
                            <Button className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-slate-800 relative z-10 transition-all">
                                Pay Now
                            </Button>
                        </Card>
                    </div>

                    {/* Autonomous Orchestration Room */}
                    {autonomousDrafts.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="text-primary animate-pulse" />
                                <h2 className="text-xl font-black text-text uppercase tracking-tighter">Autonomous Orchestration</h2>
                                <Badge variant="info" className="bg-primary/10 text-primary">AI Triggered</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {autonomousDrafts.map((draft) => (
                                    <Card key={draft.id} className="p-6 border-2 border-primary/20 bg-white hover:border-primary transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Stock Depletion Predicted</p>
                                                <h4 className="font-bold text-lg">Auto-Restock Draft #{draft.id.slice(-6)}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs opacity-50 font-mono">ESTIMATED COST</p>
                                                <p className="font-black text-xl text-primary">${draft.totalAmount}</p>
                                            </div>
                                        </div>
                                        <div className="bg-surface/30 rounded-xl p-4 mb-6">
                                            <p className="text-xs font-mono opacity-60 mb-2 italic">"{draft.notes}"</p>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                                {JSON.parse(draft.items).map((item: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-white border border-surface rounded-md">
                                                        {item.qty}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={() => approveAutonomousOrder(draft.id)}
                                                className="flex-1 bg-primary text-background font-black uppercase tracking-widest py-6 rounded-xl hover:scale-[1.02] transition-transform"
                                            >
                                                APPROVE & FULFILL
                                            </Button>
                                            <Button variant="outline" className="px-6 py-6 border-border-subtle rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                                REJECT
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inventory Table */}
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Smart Inventory</h2>
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-surface/50 border-b border-surface">
                                <tr>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest opacity-50">Product</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest opacity-50">Status</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest opacity-50">Stock Level</th>
                                    <th className="p-4 text-xs font-black uppercase tracking-widest opacity-50 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.map((item: any) => (
                                    <tr key={item.id} className="border-b border-surface last:border-0 hover:bg-surface/20 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs opacity-50 font-mono">{item.sku}</p>
                                        </td>
                                        <td className="p-4">
                                            {item.current < item.min ? (
                                                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Low Stock</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Health</Badge>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold">{item.current}/{item.min} {item.unit}</span>
                                                <div className="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.current < item.min ? 'bg-red-500' : 'bg-primary'}`}
                                                        style={{ width: `${Math.min((item.current / (item.min * 2)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            {item.current < item.min && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRestock(item.id, item.name)}
                                                    className="bg-primary text-background font-bold text-xs"
                                                >
                                                    Restock (+50)
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
                <div className="pb-12"></div>
            </div>
        </AuthGuard>
    );
}
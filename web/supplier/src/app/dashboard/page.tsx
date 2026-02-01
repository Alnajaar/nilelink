/**
 * Wholesale Supplier Command Center
 * management portal for producers and distributors
 * 
 * FEATURES:
 * - Real-time B2B sales analytics
 * - Order fulfillment pipeline (Received -> Processing -> Shipped)
 * - Bulk Product management (Price tiers, MOQ settings)
 * - Direct payments via stablecoins/fiat
 * - Logistics integration for B2B delivery tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { graphService } from '@shared/services/GraphService';
import { Skeleton } from '@shared/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface SupplierOrder {
    id: string;
    businessName: string;
    total: number;
    items: number;
    status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    timestamp: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupplierDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<SupplierOrder[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadSupplierData();
    }, []);

    const loadSupplierData = async () => {
        try {
            setLoading(true);

            if (!user?.businessId && !user?.walletAddress) {
                setLoading(false);
                return;
            }

            const businessId = user.businessId || user.walletAddress;

            const [ordersData, statsData] = await Promise.all([
                graphService.getPurchaseOrdersBySupplier(businessId),
                graphService.getSupplier(businessId)
            ]);

            // Map subgraph purchase orders to UI format
            const mappedOrders: SupplierOrder[] = ordersData.map((order: any) => ({
                id: order.id,
                businessName: `Partner ${order.restaurant.id.slice(0, 8)}`,
                total: parseFloat(order.totalAmountUsd6) / 1000000, // usd6 format
                items: 0,
                status: order.status === 0 ? 'PENDING' : order.status === 1 ? 'PREPARING' : 'SHIPPED',
                timestamp: new Date(parseInt(order.createdAt) * 1000).toLocaleString()
            }));

            setOrders(mappedOrders);

            // Set stats from subgraph
            if (statsData) {
                setStats({
                    volume: parseFloat(statsData.totalVolumeUsd6 || '0') / 1000000,
                    activeOrders: parseInt(statsData.activeOrders || '0'),
                    totalOrders: parseInt(statsData.totalOrders || '0'),
                    reach: 0, // Need to implement unique restaurant count in subgraph if needed
                });
            }

            setLoading(false);
        } catch (err) {
            console.error('[Supplier Dashboard] Load failed:', err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">Supplier Hub</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-2">Production & Wholesale Distribution Manager</p>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-2 rounded-2xl">
                        <div className="px-6 py-2">
                            <span className="text-[10px] text-gray-500 font-bold block uppercase">Monthly Volume</span>
                            <span className="text-xl font-black text-white">${stats?.volume?.toLocaleString() || '0.00'}</span>
                        </div>
                        <button className="bg-blue-600 px-8 py-3 rounded-xl text-white font-black text-xs uppercase shadow-xl shadow-blue-900/20">
                            Add Bulk Product
                        </button>
                    </div>
                </div>

                {/* Core KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 h-32">
                                <Skeleton variant="text" width="60%" className="mb-4" />
                                <Skeleton variant="text" width="80%" className="h-8" />
                            </div>
                        ))
                    ) : (
                        <>
                            <SupplierStat label="Active Orders" value={stats?.activeOrders?.toString() || '0'} icon="📦" />
                            <SupplierStat label="Total Orders" value={stats?.totalOrders?.toString() || '0'} icon="🚛" />
                            <SupplierStat label="Low Production" value="No Alerts" icon="⚠️" color="text-green-400" />
                            <SupplierStat label="Network Reach" value="Global" icon="🌍" />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Order Pipeline */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">B2B Order Pipeline</h2>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 flex justify-between">
                                        <div className="flex items-center gap-8">
                                            <Skeleton variant="circle" width={56} height={56} />
                                            <div className="space-y-2">
                                                <Skeleton variant="text" width={150} height={24} />
                                                <Skeleton variant="text" width={200} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <Skeleton variant="text" width={100} height={32} />
                                            <Skeleton variant="text" width={80} height={24} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                {orders.map((order, idx) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-black italic">!</div>
                                            <div>
                                                <div className="text-white font-black text-lg">{order.businessName}</div>
                                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">{order.items} Bulk Slots • {order.timestamp}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Order Total</div>
                                                <div className="text-2xl font-black text-white">${order.total.toLocaleString()}</div>
                                            </div>

                                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {order.status}
                                            </div>

                                            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                                →
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Production & Inventory Sidebar */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">Production Insights</h2>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-12">
                            <div>
                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Stock Utilization</div>
                                <div className="text-3xl font-black text-white">82%</div>
                                <div className="h-1.5 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[82%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Fulfillment Alerts</h3>
                                <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                                    <p className="text-orange-400 text-xs leading-relaxed font-bold">⚠️ Production Bottleneck at Warehouse A. Estimated 24h delay for 12 pending orders.</p>
                                </div>
                                <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-2xl">
                                    <p className="text-green-400 text-xs leading-relaxed font-bold">✓ High demand predicted for "Brioche Buns" next week. Increase production by 20%.</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all">
                                    Warehouse Operations Hub
                                </button>
                            </div>
                        </div>

                        {/* Quick Contact for Businesses */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-white/10 rounded-3xl p-8">
                            <h4 className="text-white font-bold mb-2">Merchant Chat</h4>
                            <p className="text-gray-500 text-xs mb-6">4 merchants have questions about their current orders.</p>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-black uppercase transition-all">
                                Open Chat Hub (4)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SupplierStat({ label, value, icon, color = 'text-white' }: { label: string, value: string, icon: string, color?: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:bg-white/[0.07] group">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{label}</div>
            <div className="flex items-center justify-between">
                <div className={`text-3xl font-black ${color}`}>{value}</div>
                <div className="text-3xl opacity-30 group-hover:opacity-100 transition-all">{icon}</div>
            </div>
        </div>
    );
}
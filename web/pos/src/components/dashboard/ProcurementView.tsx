import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, AlertTriangle, ChevronRight, Search, Filter, Plus } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export const ProcurementView = () => {
    // Mock data for initial UI build
    const { engines, restaurantId } = usePOS();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (engines.procurementEngine) {
                setLoading(true);
                const businessId = restaurantId || 'DEV_INTERNAL_NODE';

                // Trigger analysis first to ensure fresh data
                const recs = await engines.procurementEngine.generateReorderRecommendations(businessId);

                setRecommendations(recs.map(r => ({
                    id: r.productId, // Use productId as key
                    product: r.productName,
                    current: `${r.currentStock} Units`,
                    reorder: `${r.recommendedQuantity} Units`,
                    supplier: r.supplierName,
                    status: r.priority === 'urgent' ? 'URGENT' : 'WARNING',
                    cost: `$${r.totalCost.toFixed(2)}`,
                    raw: r // Keep raw object for actions
                })));
                setLoading(false);
            }
        };
        loadData();
    }, [engines.procurementEngine, restaurantId]);

    const handleAutoOrder = async (rec: any) => {
        if (!engines.procurementEngine) return;
        try {
            await engines.procurementEngine.createProcurementOrder(
                restaurantId || 'DEV_INTERNAL_NODE',
                rec.raw.supplierId,
                [{ productId: rec.raw.productId, quantity: rec.raw.recommendedQuantity }],
                'DASHBOARD_USER'
            );
            alert(`Auto-Order triggered for ${rec.product}`);
        } catch (e) {
            console.error(e);
            alert('Failed to trigger order');
        }
    };

    const suppliers = [
        { id: 's1', name: 'Ethiopian Imports Ltd', status: 'VERIFIED', deliveryTime: '2 Days', rating: 4.8 },
        { id: 's2', name: 'Local Dairy Co', status: 'VERIFIED', deliveryTime: '1 Day', rating: 4.5 },
        { id: 's3', name: 'Global Packaging Solutions', status: 'PENDING', deliveryTime: '5 Days', rating: 4.0 },
    ];

    return (
        <div className="space-y-8 pb-20 p-6">
            {/* AI Recommendations Section */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">AI Reorder Proposals</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pos-text-muted mt-1">Predictive logistics engine output</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, idx) => (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[2rem] p-6 hover:border-pos-accent/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant={rec.status === 'URGENT' ? 'destructive' : 'warning'} className="text-[9px] font-black uppercase tracking-widest px-3 border-2">
                                    {rec.status}
                                </Badge>
                                <span className="text-xl font-black italic tracking-tighter text-white">{rec.cost}</span>
                            </div>

                            <h4 className="text-lg font-bold text-white mb-2">{rec.product}</h4>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs">
                                    <span className="text-pos-text-muted uppercase tracking-wider font-bold">Current Stock</span>
                                    <span className="text-pos-danger font-mono font-bold">{rec.current}</span>
                                </div>
                                <div className="w-full h-1 bg-pos-bg-tertiary rounded-full overflow-hidden">
                                    <div className="h-full bg-pos-danger w-[15%]" />
                                </div>
                                <div className="flex justify-between text-xs pt-2 border-t border-pos-border-subtle/30">
                                    <span className="text-pos-text-muted uppercase tracking-wider font-bold">Proposed Order</span>
                                    <span className="text-pos-accent font-mono font-bold">{rec.reorder}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleAutoOrder(rec)}
                                    className="flex-1 bg-pos-accent text-black font-black uppercase text-[10px] tracking-widest h-10 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Auto-Order
                                </Button>
                                <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-pos-border-subtle">
                                    <ChevronRight size={16} />
                                </Button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-pos-border-subtle/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Truck size={12} className="text-pos-text-muted" />
                                    <span className="text-[10px] font-bold text-pos-text-secondary uppercase tracking-wider">{rec.supplier}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Trigger Card */}
                    <button className="bg-pos-bg-primary/20 border-2 border-dashed border-pos-border-subtle rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 hover:border-pos-accent/30 hover:bg-pos-accent/5 transition-all group min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-pos-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={24} className="text-pos-text-muted group-hover:text-pos-accent" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-pos-text-muted group-hover:text-pos-accent">Add Manual Order</span>
                    </button>
                </div>
            </div>

            {/* Supplier Directory */}
            <div className="bg-pos-bg-secondary/20 border border-pos-border-subtle rounded-[2rem] overflow-hidden mt-8">
                <div className="p-8 border-b border-pos-border-subtle flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Verified Supply Chain</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pos-text-muted mt-1">Decentralized partner registry</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-pos-text-muted" />
                            <input placeholder="Search partners..." className="h-10 pl-10 pr-4 bg-pos-bg-primary rounded-xl border border-pos-border-subtle text-xs font-bold text-white outline-none focus:border-pos-accent w-64" />
                        </div>
                        <Button variant="outline" className="border-pos-accent text-pos-accent font-bold uppercase text-xs h-10">
                            + Onboard Supplier
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-pos-bg-primary/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Partner Name</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Verification</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Lead Time</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Performance</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pos-border-subtle/50">
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-pos-accent/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-pos-bg-tertiary flex items-center justify-center">
                                                <Package size={14} className="text-pos-accent" />
                                            </div>
                                            <span className="font-bold text-xs text-white uppercase tracking-wider">{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant={supplier.status === 'VERIFIED' ? 'success' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2">
                                            {supplier.status}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 font-mono text-xs text-pos-text-secondary">
                                        {supplier.deliveryTime}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < Math.floor(supplier.rating) ? 'bg-pos-accent' : 'bg-pos-bg-tertiary'}`} />
                                                ))}
                                            </div>
                                            <span className="ml-2 text-[10px] font-bold text-pos-text-muted">{supplier.rating}/5.0</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Button size="sm" variant="ghost" className="text-pos-text-muted hover:text-white text-[10px] font-black uppercase tracking-widest h-8">
                                            View Catalog
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

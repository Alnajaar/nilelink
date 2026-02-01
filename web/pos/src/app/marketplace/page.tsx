/**
 * B2B Supplier Marketplace
 * wholesale purchasing for NileLink businesses
 * 
 * FEATURES:
 * - Direct ordering from wholesalers
 * - Bulk pricing tiers (Buy 100+, get 20% off)
 * - Pulse Integration: Highlight items low in POS inventory
 * - Multi-currency (USDT, Local Fiat)
 * - Fast restock logic (One-click reorder)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';

// ============================================
// TYPES
// ============================================

interface WholesaleProduct {
    id: string;
    name: string;
    category: string;
    supplier: string;
    pricePerUnit: number;
    minOrder: number;
    stockStatus: 'IN_STOCK' | 'LOW' | 'OUT_OF_STOCK';
    image?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupplierMarketplace() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<WholesaleProduct[]>([]);
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        loadWholesaleCatalog();
    }, []);

    const loadWholesaleCatalog = async () => {
        try {
            setLoading(true);
            // TODO: Fetch from The Graph / Supplier Subgraph
            setTimeout(() => {
                setProducts([
                    { id: 'WP1', name: 'Premium Beef Patties (XL)', category: 'Frozen', supplier: 'MeatMasters JO', pricePerUnit: 4.50, minOrder: 50, stockStatus: 'IN_STOCK' },
                    { id: 'WP2', name: 'Artisan Brioche Buns', category: 'Bakery', supplier: 'Daily Bread KSA', pricePerUnit: 0.85, minOrder: 200, stockStatus: 'IN_STOCK' },
                    { id: 'WP3', name: 'Organic Mozzarella (5kg)', category: 'Dairy', supplier: 'EuroFoods UAE', pricePerUnit: 35.00, minOrder: 10, stockStatus: 'LOW' },
                    { id: 'WP4', name: 'Eco-Friendly Burger Wraps', category: 'Packaging', supplier: 'GreenPack Egypt', pricePerUnit: 0.12, minOrder: 1000, stockStatus: 'IN_STOCK' },
                ]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">B2B Marketplace</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-2">Source directly from verified NileLink Suppliers</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-xs font-bold">
                            📦 Stock Alerts: <span className="text-orange-400">3 Items Low</span>
                        </div>
                        <div className="bg-blue-600 rounded-2xl px-6 py-3 text-white text-xs font-black shadow-lg shadow-blue-900/20 cursor-pointer">
                            🛒 View Cart ({cart.length})
                        </div>
                    </div>
                </div>

                {/* Intelligence Alert: Smart Restock */}
                <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-white/5 rounded-3xl p-8 mb-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-600/20 rounded-full flex items-center justify-center text-2xl animate-pulse">🧠</div>
                        <div>
                            <h3 className="text-white font-bold mb-1">Pulse Smart Restock</h3>
                            <p className="text-gray-400 text-sm">Based on your weekend sales forecast, we recommend ordering <b>500 units</b> of Brioche Buns today.</p>
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        Auto-Fill Order
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Sidebar Filters */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">Categories</h2>
                        <div className="space-y-2">
                            {['All Supplies', 'Food & Beverage', 'Packaging', 'Equipment', 'Cleaning'].map(cat => (
                                <button key={cat} className="w-full text-left px-6 py-4 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all text-sm font-bold">
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-white font-bold mb-6">Verified Suppliers</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full"></div>
                                    <span className="text-gray-400 text-xs font-bold">MeatMasters JO</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-green-500/20 rounded-full"></div>
                                    <span className="text-gray-400 text-xs font-bold">Daily Bread KSA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                [...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-white/5 rounded-3xl animate-pulse"></div>)
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
                                        <div className="aspect-[4/3] bg-white/5 flex items-center justify-center text-5xl relative">
                                            📦
                                            {product.stockStatus === 'LOW' && (
                                                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">
                                                    Critical Stock
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div>
                                                <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">{product.category}</div>
                                                <h3 className="text-white font-bold truncate">{product.name}</h3>
                                                <p className="text-gray-500 text-[10px] font-bold mt-1">Supplier: {product.supplier}</p>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Wholesale Price</div>
                                                    <div className="text-2xl font-black text-white">${product.pricePerUnit.toFixed(2)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Min Order</div>
                                                    <div className="text-white font-bold">{product.minOrder} u</div>
                                                </div>
                                            </div>

                                            <button className="w-full py-4 bg-white/5 hover:bg-white text-gray-500 hover:text-black font-black uppercase text-xs rounded-2xl transition-all border border-white/5">
                                                Add to Order
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

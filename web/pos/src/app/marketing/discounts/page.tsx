/**
 * Smart Discount & Dynamic Pricing Engine
 * AI automation for inventory-linked profitability
 * 
 * FEATURES:
 * - Inventory-Linked Discounts (Automatic price drops for high stock)
 * - Expiry Management (Smart pricing for perishable items)
 * - Dynamic Happy Hour (AI-triggered discounts during low forecast periods)
 * - Campaign Integration (One-click sync with AI Campaign Manager)
 * - Profit Margin Safeguards (Minimum price locks)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { graphService } from '@shared/services/GraphService';

// ============================================
// TYPES
// ============================================

interface SmartDiscount {
    id: string;
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    reason: 'OVERSTOCK' | 'EXPIRY' | 'DEMAND';
    trigger: string;
    status: 'ACTIVE' | 'PENDING' | 'REJECTED';
    roi_prediction: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SmartDiscountsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeDiscounts, setActiveDiscounts] = useState<SmartDiscount[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<SmartDiscount[]>([]);

    useEffect(() => {
        loadDiscountData();
    }, []);

    const loadDiscountData = async () => {
        try {
            setLoading(true);
            // TODO: Fetch high-inventory products from Inventory Service
            // TODO: Fetch low-demand forecasts from Pulse Service

            // Mocking AI suggestions
            setAiSuggestions([
                { id: '1', productName: 'Fresh Burger Buns (Pack 12)', originalPrice: 12.00, discountedPrice: 7.20, reason: 'EXPIRY', trigger: 'Expiring in 48h', status: 'PENDING', roi_prediction: '+15% volume' },
                { id: '2', productName: 'Classic Beef Patty', originalPrice: 45.00, discountedPrice: 38.00, reason: 'OVERSTOCK', trigger: '142% stock level', status: 'PENDING', roi_prediction: 'Clearance in 3 days' },
                { id: '3', productName: 'Soft Drink 330ml', originalPrice: 3.00, discountedPrice: 2.25, reason: 'DEMAND', trigger: 'Low Tuesday forecast', status: 'PENDING', roi_prediction: 'Upsell opportunity' },
            ]);

            setActiveDiscounts([
                { id: '4', productName: 'Extra Spicy Sauce', originalPrice: 5.00, discountedPrice: 3.50, reason: 'DEMAND', trigger: 'Inventory clearance', status: 'ACTIVE', roi_prediction: '+5% total bill' },
            ]);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = (id: string) => {
        const item = aiSuggestions.find(s => s.id === id);
        if (!item) return;
        setAiSuggestions(prev => prev.filter(s => s.id !== id));
        setActiveDiscounts(prev => [...prev, { ...item, status: 'ACTIVE' }]);
        // TODO: Write to Smart Contract / Inventory System
        alert(`Approved! ${item.productName} prices updated on-chain.`);
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white">Smart Discounts</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-1">AI-Automated Price Optimization</p>
                    </div>

                    <div className="bg-blue-600 rounded-2xl px-8 py-4 flex items-center gap-6 shadow-xl shadow-blue-900/20">
                        <div className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center text-xl font-black italic">!</div>
                        <div>
                            <div className="text-white font-black text-sm uppercase">Auto-Pilot Mode</div>
                            <div className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">AI manages prices within 15% range</div>
                        </div>
                        <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* AI Suggestions Column */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">AI Recommendations</h2>
                            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Inventory...</span>
                        </div>

                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-44 bg-white/5 rounded-3xl animate-pulse"></div>)
                        ) : (
                            <div className="space-y-6">
                                {aiSuggestions.map(rec => (
                                    <div key={rec.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                                            {rec.reason}
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-1">{rec.productName}</h3>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Trigger: {rec.trigger}</p>
                                        </div>

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-end gap-3">
                                                <div className="text-gray-500 line-through text-sm">${rec.originalPrice.toFixed(2)}</div>
                                                <div className="text-green-400 font-black text-3xl">${rec.discountedPrice.toFixed(2)}</div>
                                                <div className="text-[10px] text-green-500 font-black bg-green-500/10 px-2 py-1 rounded">-{Math.round((1 - rec.discountedPrice / rec.originalPrice) * 100)}%</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Predicted Impact</div>
                                                <div className="text-white font-bold">{rec.roi_prediction}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleApprove(rec.id)}
                                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-black text-xs uppercase transition-all shadow-lg shadow-blue-900/10"
                                            >
                                                Apply Price Change ✓
                                            </button>
                                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-xs font-bold uppercase transition-all">
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {aiSuggestions.length === 0 && (
                                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <p className="text-gray-600 italic">No price optimizations needed currently.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active Rules & Status */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Active Pricing Rules</h2>

                        <div className="space-y-4">
                            {activeDiscounts.map(discount => (
                                <div key={discount.id} className="bg-white/5 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-2xl">🔥</div>
                                        <div>
                                            <div className="text-white font-bold">{discount.productName}</div>
                                            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">${discount.discountedPrice.toFixed(2)} (Active)</div>
                                        </div>
                                    </div>
                                    <button className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline">Revoke Rule</button>
                                </div>
                            ))}

                            {/* Safeguard Settings */}
                            <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                                <h3 className="text-white font-bold flex items-center gap-3">
                                    <span className="text-xl">🛡️</span> Profit Safeguards
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-gray-300 text-sm font-bold">Minimum Margin Lock</div>
                                            <div className="text-gray-500 text-[10px] uppercase">Never discount below COGS + 5%</div>
                                        </div>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-gray-300 text-sm font-bold">Smart Expiry Buffer</div>
                                            <div className="text-gray-500 text-[10px] uppercase">Start discounting 3 days before expiry</div>
                                        </div>
                                        <div className="text-white font-mono text-xs">72H</div>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all">
                                    Configure Pricing Strategy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

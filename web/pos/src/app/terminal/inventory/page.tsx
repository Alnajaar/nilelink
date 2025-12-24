"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    AlertCircle,
    BrainCircuit,
    ArrowRight,
    Search,
    RefreshCw
} from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';

export default function InventoryPage() {
    const { recipeEngine, intelligenceEngine } = usePOS();
    const [items, setItems] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any>(null);

    useEffect(() => {
        if (recipeEngine) {
            setItems(recipeEngine.getAllInventory());
        }
    }, [recipeEngine]);

    useEffect(() => {
        const genForecast = async () => {
            if (intelligenceEngine) {
                const f = await intelligenceEngine.generateForecast(new Date().toISOString().split('T')[0]);
                setForecast(f);
            }
        };
        genForecast();
    }, [intelligenceEngine]);

    const getStockStatus = (qty: number) => {
        if (qty < 10) return { label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        if (qty < 50) return { label: 'LOW', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        return { label: 'GOOD', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    };

    return (
        <div className="h-full flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Inventory Hub</h1>
                    <p className="text-nile-silver/50 font-bold uppercase tracking-widest text-xs">Stock Management & AI Forecasting</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-nile-silver/30">
                    <Search size={18} />
                    <input type="text" placeholder="Search Items..." className="bg-transparent border-none focus:outline-none text-sm w-48" />
                </div>
            </header>

            {/* Smart Insights Banner (Phase 4) */}
            {forecast && (
                <div className="p-8 rounded-[3rem] bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <BrainCircuit size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500 text-white"><BrainCircuit size={20} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">NileLink Predictive Intelligence</span>
                        </div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">Tomorrow's Demand Forecast</h3>
                        <p className="max-w-xl text-nile-silver/60 text-sm font-bold leading-relaxed mb-6">
                            Based on historical ledger patterns, we project a <strong>${forecast.predictedRevenue.toLocaleString()}</strong> revenue day.
                            High demand expected for <strong>Burgers</strong> (approx 42 units).
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="px-6 py-3 rounded-xl bg-blue-500 text-white font-black uppercase text-xs hover:scale-105 transition-transform">
                                Auto-Generate Purchase Order
                            </button>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30">Confidence Score: {(forecast.confidenceScore * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar flex-1 pb-20">
                {items.map((item) => {
                    const status = getStockStatus(item.quantity);
                    return (
                        <div key={item.id} className="p-6 rounded-3xl glass-panel group hover:bg-white/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-nile-silver group-hover:scale-110 transition-transform">
                                    <Package size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-lg ${status.bg} ${status.color} text-[10px] font-black uppercase`}>
                                    {status.label}
                                </span>
                            </div>

                            <h4 className="text-xl font-bold text-white mb-1">{item.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/30 mb-6">ID: {item.id}</p>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-black text-white tracking-tighter">{item.quantity}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">{item.unit} Available</div>
                                </div>
                                <button className="w-10 h-10 rounded-xl bg-nile-silver text-nile-dark flex items-center justify-center hover:scale-110 transition-transform">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

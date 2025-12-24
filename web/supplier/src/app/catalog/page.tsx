"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Search,
    Package,
    Tag,
    Edit3,
    Boxes,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';
import { SupplierLedger } from '@/lib/engines/SupplierLedger';

export default function SupplierCatalog() {
    const [products, setProducts] = useState<any[]>([]);
    const [ledger] = useState(() => new SupplierLedger());

    useEffect(() => {
        setProducts(ledger.getData().catalog);
    }, [ledger]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">

            {/* Header */}
            <header className="p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-3 rounded-2xl bg-white/5 text-nile-silver hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Catalog</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20 mt-1">Inventory Management</p>
                    </div>
                </div>
                <button className="h-14 px-8 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={18} /> Add Product
                </button>
            </header>

            <main className="flex-1 p-6 md:p-10 space-y-8">

                {/* Search Bar */}
                <div className="h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 gap-4">
                    <Search size={20} className="text-nile-silver/20" />
                    <input type="text" placeholder="Search product name, ID, or batch..." className="bg-transparent border-none focus:outline-none flex-1 font-bold text-sm" />
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((item) => (
                        <div key={item.id} className="p-8 rounded-[3rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-nile-silver/20 group-hover:text-white transition-colors">
                                    <Package size={28} />
                                </div>
                                <button className="p-3 rounded-xl bg-white/5 text-nile-silver/20 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                    <Edit3 size={18} />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 leading-none">{item.name}</h3>
                            <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-8">Base Unit: {item.unit}</div>

                            <div className="h-px bg-white/5 mb-8" />

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/30 mb-1">Standard Price</div>
                                    <div className="text-2xl font-black italic text-white">${item.price.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/30 mb-1">Stock Level</div>
                                    <div className="text-2xl font-black italic text-emerald-500">{item.stock} {item.unit}</div>
                                </div>
                            </div>

                            <div className="absolute top-8 right-8">
                                <CheckCircle2 size={14} className="text-emerald-500/50" />
                            </div>
                        </div>
                    ))}

                    {/* Quick Add Skeleton */}
                    <div className="p-8 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-white/20 transition-all min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-nile-silver/20" />
                        </div>
                        <h4 className="text-lg font-black italic tracking-tighter uppercase text-nile-silver/20">New Listing</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-nile-silver/10 mt-1 italic">Anchors to protocol sequence</p>
                    </div>
                </div>

            </main>

        </div>
    );
}

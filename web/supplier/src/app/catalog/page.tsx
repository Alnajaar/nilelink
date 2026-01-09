"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, Search, Filter, Edit, Trash2,
    TrendingUp, AlertTriangle, Eye, ImagePlus, DollarSign
} from 'lucide-react';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useNotification } from '@/shared/contexts/NotificationContext';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

interface Product {
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    status: 'in-stock' | 'low' | 'out';
}

export default function CatalogPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { notify } = useNotification();

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const [products, setProducts] = useState<Product[]>([
        {
            sku: 'TOM-001',
            name: 'Roma Tomatoes',
            category: 'Vegetables',
            price: 2.50,
            stock: 150,
            minStock: 100,
            maxStock: 300,
            unit: 'kg',
            status: 'in-stock'
        },
        {
            sku: 'ONI-002',
            name: 'Yellow Onions',
            category: 'Vegetables',
            price: 1.80,
            stock: 75,
            minStock: 150,
            maxStock: 400,
            unit: 'kg',
            status: 'low'
        },
        {
            sku: 'CHI-003',
            name: 'Chicken Breast',
            category: 'Meat',
            price: 8.50,
            stock: 25,
            minStock: 80,
            maxStock: 200,
            unit: 'kg',
            status: 'low'
        },
        {
            sku: 'RIC-004',
            name: 'Basmati Rice',
            category: 'Grains',
            price: 3.20,
            stock: 250,
            minStock: 200,
            maxStock: 500,
            unit: 'kg',
            status: 'in-stock'
        },
        {
            sku: 'OIL-005',
            name: '  Olive Oil',
            category: 'Oils',
            price: 12.00,
            stock: 0,
            minStock: 50,
            maxStock: 150,
            unit: 'L',
            status: 'out'
        }
    ]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || product.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-white border-b border-surface px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-text">Product Catalog</h1>
                                <p className="text-sm text-text opacity-70">Manage your product inventory and pricing</p>
                            </div>
                            <Button
                                onClick={() => setShowAddModal(true)}
                                className="h-12 bg-primary hover:opacity-90 text-background font-black uppercase tracking-widest px-6"
                            >
                                <Plus size={18} className="mr-2" />
                                Add Product
                            </Button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text opacity-30" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by SKU or product name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium placeholder:text-text placeholder:opacity-30"
                                />
                            </div>
                            <div className="flex gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === cat
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Products Table */}
                    <Card className="bg-white border border-surface overflow-hidden rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-surface">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            SKU
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Stock
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text opacity-50">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filteredProducts.map((product, idx) => (
                                            <motion.tr
                                                key={product.sku}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="border-b border-surface hover:bg-surface/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-bold text-primary">
                                                        {product.sku}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-text">{product.name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className="bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                                                        {product.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-mono font-black text-text">
                                                        ${product.price.toFixed(2)}/{product.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-mono font-bold text-text mb-1">
                                                            {product.stock} {product.unit}
                                                        </span>
                                                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all ${product.status === 'in-stock' ? 'bg-primary' : 'bg-text'
                                                                    }`}
                                                                style={{ width: `${Math.min((product.stock / product.maxStock) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge className={`${getStatusColor(product.status)} px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                                                        {product.status.replace('-', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                                                            <Edit size={16} className="text-text" />
                                                        </button>
                                                        <button className="p-2 hover:bg-surface rounded-lg transition-colors">
                                                            <Trash2 size={16} className="text-text" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {filteredProducts.length === 0 && (
                        <div className="h-96 flex flex-col items-center justify-center text-center opacity-30">
                            <Package size={64} className="text-text mb-4" />
                            <p className="text-lg font-bold text-text">No products found</p>
                            <p className="text-sm text-text mt-2">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

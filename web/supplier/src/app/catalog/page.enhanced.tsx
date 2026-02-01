'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package, Plus, Search, Filter, Grid3x3, LayoutList,
    Edit, Trash2, MoreHorizontal, ChevronDown, TrendingUp,
    Upload, Download, Eye, Tag, AlertTriangle
} from 'lucide-react';

import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive' | 'low-stock';
    sales: number;
    revenue: number;
    image?: string;
}

export default function CatalogPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const mockProducts: Product[] = [
        {
            id: '1',
            name: 'Premium Coffee Beans',
            sku: 'PCB-001',
            category: 'Beverages',
            price: 45.99,
            stock: 150,
            status: 'active',
            sales: 1250,
            revenue: 57487.50
        },
        {
            id: '2',
            name: 'Organic Olive Oil',
            sku: 'OOO-002',
            category: 'Oils',
            price: 89.99,
            stock: 25,
            status: 'low-stock',
            sales: 890,
            revenue: 80091.10
        },
        {
            id: '3',
            name: 'Artisan Bread',
            sku: 'AB-003',
            category: 'Bakery',
            price: 12.50,
            stock: 200,
            status: 'active',
            sales: 2100,
            revenue: 26250.00
        }
    ];

    const stats = [
        { label: 'Total Products', value: mockProducts.length, icon: Package, color: 'blue' as const },
        { label: 'Active Listings', value: mockProducts.filter(p => p.status === 'active').length, icon: Eye, color: 'emerald' as const },
        { label: 'Low Stock Alert', value: mockProducts.filter(p => p.status === 'low-stock').length, icon: AlertTriangle, color: 'amber' as const },
        { label: 'Total Revenue', value: `$${mockProducts.reduce((sum, p) => sum + p.revenue, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'purple' as const }
    ];

    const categories = ['all', 'Beverages', 'Oils', 'Bakery', 'Dairy', 'Produce'];
    const filteredProducts = mockProducts.filter(p =>
        (selectedCategory === 'all' || p.category === selectedCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <SupplierPageTemplate
            title="Product Catalog"
            subtitle="Manage your inventory and listings"
            icon={Package}
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            }
        >
            {/* Stats Grid */}
            <PageSection title="Catalog Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>
            </PageSection>

            {/* Search & Filter */}
            <PageSection title="Product List">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-xl
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                                     font-medium text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-12 px-4 bg-white border border-gray-300 rounded-xl font-medium text-gray-900
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                                     appearance-none cursor-pointer min-w-[200px]"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all
                                      ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'}`}
                        >
                            <Grid3x3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all
                                      ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'}`}
                        >
                            <LayoutList size={18} />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="group hover:shadow-xl transition-all overflow-hidden">
                                    {/* Image Area */}
                                    <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform">
                                            <Package className="w-full h-full text-blue-600" />
                                        </div>
                                        <Badge className={`absolute top-3 right-3 z-10
                                                        ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                          product.status === 'low-stock' ? 'bg-amber-100 text-amber-700' :
                                                          'bg-gray-100 text-gray-700'}`}>
                                            {product.status === 'active' ? 'Active' : product.status === 'low-stock' ? 'Low Stock' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-mono mb-4">{product.sku}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Price</p>
                                                <p className="text-lg font-black text-blue-600">${product.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Stock</p>
                                                <p className="text-lg font-black text-gray-900">{product.stock} units</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 h-10 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                                                <Edit className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button className="flex-1 h-10 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                                                <Eye className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button className="flex-1 h-10 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors">
                                                <Trash2 className="w-4 h-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">SKU</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Price</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Stock</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-black text-gray-900">{product.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.sku}</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-600">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div>
                                                <p className="font-black text-gray-900">{product.stock}</p>
                                                <p className="text-xs text-gray-500">units</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge className={`${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            product.status === 'low-stock' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {product.status === 'active' ? 'Active' : product.status === 'low-stock' ? 'Low Stock' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </PageSection>
        </SupplierPageTemplate>
    );
}
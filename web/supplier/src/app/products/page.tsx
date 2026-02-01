"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, Search, Filter, MoreHorizontal,
    Edit, Trash2, Tag, DollarSign, Image as ImageIcon,
    AlertCircle, CheckCircle, RefreshCw, X
} from 'lucide-react';

import { useAuth } from '@shared/contexts/AuthContext';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Input } from '@shared/components/Input';
import { Badge } from '@shared/components/Badge';
import { useNotifications } from '@shared/contexts/NotificationContext';

export default function ProductsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addNotification: notify } = useNotifications();

    // State
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // New Product Form State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        description: '',
        category: '',
        stock: '0',
        minStock: '10'
    });

    // Fetch products
    const fetchProducts = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/products?supplierId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            notify({
                type: 'error',
                title: 'Error',
                message: 'Failed to load products'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    supplierId: user?.uid
                })
            });

            if (response.ok) {
                notify({
                    type: 'success',
                    title: 'Success',
                    message: 'Product created successfully'
                });
                setIsAddModalOpen(false);
                setFormData({
                    name: '',
                    sku: '',
                    price: '',
                    description: '',
                    category: '',
                    stock: '0',
                    minStock: '10'
                });
                fetchProducts();
            } else {
                throw new Error('Failed to create product');
            }
        } catch (error) {
            notify({
                type: 'error',
                title: 'Error',
                message: 'Failed to create product'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                notify({
                    type: 'success',
                    title: 'Deleted',
                    message: 'Product deleted successfully'
                });
                fetchProducts();
            }
        } catch (error) {
            notify({
                type: 'error',
                title: 'Error',
                message: 'Failed to delete product'
            });
        }
    };

    // Filter products
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Product Catalog</h1>
                        <p className="text-slate-600 mt-1">Manage your inventory and listings</p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Product
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-8 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </Card>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-900">No products found</h3>
                        <p className="text-slate-500 mt-2 mb-6">Get started by adding your first product to the catalog.</p>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-slate-100 relative group">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => { }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-1">{product.name}</h3>
                                                <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                                            </div>
                                            <Badge variant={product.inventory?.quantity > 0 ? 'success' : 'error'}>
                                                {product.inventory?.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-xl font-black text-slate-900">${product.price.toFixed(2)}</p>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <Package className="w-4 h-4 mr-1" />
                                                {product.inventory?.quantity || 0} units
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-slate-900">Add New Product</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProduct} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Product Name *</label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Premium Coffee Beans"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">SKU *</label>
                                        <Input
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            placeholder="e.g. COF-001"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Price *</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Category</label>
                                        <Input
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Beverages"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Initial Stock</label>
                                        <Input
                                            name="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Min Stock Alert</label>
                                        <Input
                                            name="minStock"
                                            type="number"
                                            value={formData.minStock}
                                            onChange={handleInputChange}
                                            placeholder="10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                                        placeholder="Product description..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Product'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

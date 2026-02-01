'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, Filter, Edit, Trash2, Image, Tag, DollarSign, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/AuthProvider';
import AuthGuard from '@shared/components/AuthGuard';
import { Skeleton, ProductCardSkeleton } from '@shared/components/Skeleton';
import { web3Service } from '@shared/services/Web3Service';
import { graphService } from '@shared/services/GraphService';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  lastUpdated: string;
}

export default function SupplierCatalogPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Decentralized Subgraph
  useEffect(() => {
    const loadProducts = async () => {
      const supplierId = user?.walletAddress || user?.id;
      if (!supplierId) return;

      try {
        setLoading(true);
        // Step 1: Fetch from Subgraph (Source of Truth)
        const inventory = await graphService.getInventoryBySupplier(supplierId);

        if (inventory && inventory.length > 0) {
          const normalized = inventory.map((item: any) => ({
            id: item.id,
            name: item.name,
            sku: item.id.slice(0, 8),
            category: item.category,
            price: Number(item.unitCostUsd6) / 1000000,
            stock: Number(item.currentStock),
            minStock: Number(item.reorderPoint),
            isActive: item.isActive,
            lastUpdated: new Date(Number(item.lastUpdated) * 1000).toISOString()
          }));
          setProducts(normalized);
        } else {
          // Fallback to API if subgraph is empty (leaked data migration)
          const response = await fetch(`/api/products?supplierId=${supplierId}`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products || data || []);
          }
        }
      } catch (error) {
        console.error('Error loading products from Graph:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  const categories = ['all', 'Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'blue' as const,
      change: `${products.filter(p => p.isActive).length} Active`
    },
    {
      label: 'Low Stock Items',
      value: products.filter(p => p.stock <= p.minStock).length,
      icon: AlertTriangle,
      color: 'amber' as const,
      change: 'Needs restocking'
    },
    {
      label: 'Featured Products',
      value: products.filter(p => p.isFeatured).length,
      icon: TrendingUp,
      color: 'purple' as const,
      change: 'Promoted items'
    },
    {
      label: 'Avg Profit Margin',
      value: '42%',
      icon: DollarSign,
      color: 'emerald' as const,
      change: 'Healthy margins'
    }
  ];

  const handleSaveProduct = async (productData: any) => {
    try {
      const supplierId = user?.id || user?.walletAddress;
      if (!supplierId) throw new Error('Not authenticated');

      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products?id=${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...productData, supplierId }),
        });

        if (response.ok) {
          const result = await response.json();
          setProducts(prev => prev.map(p =>
            p.id === editingProduct.id
              ? { ...result.product, lastUpdated: new Date().toISOString() }
              : p
          ));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...productData, supplierId }),
        });

        if (response.ok) {
          const result = await response.json();
          setProducts(prev => [...prev, { ...result.product, lastUpdated: new Date().toISOString() }]);

          // 3. Anchor on-chain (Asynchronous background task)
          const supplierAddress = user?.walletAddress || user?.id;
          if (supplierAddress && supplierAddress.startsWith('0x')) {
            console.log('[Catalog] Anchoring product on-chain...');
            web3Service.addInventoryItemOnChain(
              result.product.id,
              supplierAddress,
              result.product.name,
              result.product.category,
              10, // Default min stock
              result.product.price
            ).then(txHash => {
              if (txHash) console.log('[Catalog] Product anchored:', txHash);
            }).catch(e => console.error('[Catalog] Anchor failed:', e));
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create product');
        }
      }

      setShowAddProduct(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.message}`);
    }
  };

  const toggleProductStatus = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...result.product, lastUpdated: new Date().toISOString() } : p
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product status');
      }
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      alert(`Error updating product status: ${error.message}`);
    }
  };

  const toggleFeaturedStatus = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isFeatured: !product.isFeatured
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...result.product, lastUpdated: new Date().toISOString() } : p
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update featured status');
      }
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      alert(`Error updating featured status: ${error.message}`);
    }
  };

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <SupplierPageTemplate
        title="Product Catalog"
        icon={Package}
        subtitle="Manage your product inventory and offerings"
        actions={
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black uppercase tracking-widest px-6 shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filters */}
        <PageSection title="Product Management" subtitle="Search and organize your product catalog">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <PageSection title="Catalog Overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-28">
                      <Skeleton variant="text" width="40%" className="mb-3" />
                      <Skeleton variant="text" width="70%" className="h-8" />
                    </div>
                  ))
                ) : (
                  <>
                    <StatCard
                      label="Total Products"
                      value={products.length}
                      icon={Package}
                      color="blue"
                    />
                    <StatCard
                      label="Active Listings"
                      value={products.filter(p => p.isActive).length}
                      icon={TrendingUp}
                      color="emerald"
                    />
                    <StatCard
                      label="Out of Stock"
                      value={products.filter(p => !p.stock || p.stock === 0).length}
                      icon={XCircle}
                      color="red"
                    />
                    <StatCard
                      label="Low Inventory"
                      value={products.filter(p => p.stock && p.stock < 10).length}
                      icon={AlertTriangle}
                      color="amber"
                    />
                  </>
                )}
              </div>
            </PageSection>

            {/* Main Catalog Area */}
            <PageSection title="Wholesale Inventory">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, SKU or tag..."
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${categoryFilter === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                  [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                  <AnimatePresence>
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                      >
                        <div className="aspect-square bg-white/10 relative overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
                              <Package className="w-12 h-12 text-white/20" />
                            </div>
                          )}
                          <Badge className={`absolute top-4 right-4 ${product.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowAddProduct(true);
                                }}
                                variant="outline"
                                className="flex-1 h-10 text-sm rounded-lg"
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => toggleProductStatus(product.id)}
                                variant={product.isActive ? "outline" : "secondary"}
                                className={`flex-1 h-10 text-sm rounded-lg ${product.isActive ? 'hover:border-red-300 hover:text-red-600' : ''}`}
                              >
                                {product.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {
                filteredProducts.length === 0 && (
                  <div className="h-96 flex flex-col items-center justify-center text-center">
                    <Package size={64} className="text-gray-300 mb-4" />
                    <p className="text-lg font-bold text-gray-600">No products found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
                  </div>
                )
              }
            </PageSection>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
              <ProductFormModal
                product={editingProduct}
                onSave={handleSaveProduct}
                onClose={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                }}
              />
            )}
          </SupplierPageTemplate>
        </AuthGuard>
        );
}

        // Product Form Modal Component
        function ProductFormModal({
          product,
          onSave,
          onClose
        }: {
          product: Product | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
          name: product?.name || '',
        sku: product?.sku || '',
        category: product?.category || 'Dairy',
        price: product?.price || 0,
        cost: product?.cost || 0,
        stock: product?.stock || 0,
        minStock: product?.minStock || 10,
        unit: product?.unit || 'units',
        description: product?.description || '',
        tags: product?.tags.join(', ') || '',
        isActive: product?.isActive ?? true,
        isFeatured: product?.isFeatured ?? false
  });

        const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Beverages'];

  const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
        onSave({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(formData.price.toString()),
        cost: parseFloat(formData.cost.toString()),
        stock: parseInt(formData.stock.toString()),
        minStock: parseInt(formData.minStock.toString())
    });
  };

        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="organic, dairy, fresh"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-medium">Active Product</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-medium">Featured Product</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg"
                >
                  {product ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
        );
}
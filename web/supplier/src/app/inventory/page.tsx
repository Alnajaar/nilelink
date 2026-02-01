'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package, Search, Plus, Edit, Trash2, Eye, Filter,
  AlertTriangle, CheckCircle, MoreVertical, Download
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import web3Service from '@shared/services/Web3Service';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  currency: string;
  taxRate: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [syncing, setSyncing] = useState(false);

  const handleSyncToProtocol = async () => {
    setSyncing(true);
    try {
      const toastId = toast.loading('Anchoring inventory on-chain...');
      let successCount = 0;

      for (const product of products) {
        const tx = await web3Service.addInventoryItemOnChain(
          product.id,
          product.supplierId,
          product.name,
          product.category,
          product.minStock,
          product.price,
          product.currency
        );
        if (tx) successCount++;
      }

      toast.success(`Successfully anchored ${successCount} products`, { id: toastId });
    } catch (error) {
      toast.error('On-chain sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?supplierId=${user?.uid}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const categories = [...new Set(products.map(p => p.category))];

  const getStatus = (product: Product) => {
    if (product.stock <= 0) {
      return { text: 'Out of Stock', variant: 'danger' };
    } else if (product.stock <= product.minStock) {
      return { text: 'Low Stock', variant: 'warning' };
    } else {
      return { text: 'In Stock', variant: 'success' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-main">Inventory Management</h1>
              <p className="text-text-muted">Manage your products and stock levels</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSyncToProtocol}
                disabled={syncing || products.length === 0}
                className="flex items-center gap-2 border-primary text-primary"
              >
                <CheckCircle className={`w-4 h-4 ${syncing ? 'animate-pulse' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync to Protocol'}
              </Button>
              <Button
                onClick={() => router.push('/inventory/add')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Products</p>
                <p className="text-2xl font-bold text-text-main">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Low Stock Items</p>
                <p className="text-2xl font-bold text-text-main">
                  {products.filter(p => p.stock <= p.minStock && p.stock > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Out of Stock</p>
                <p className="text-2xl font-bold text-text-main">
                  {products.filter(p => p.stock <= 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Value</p>
                <p className="text-2xl font-bold text-text-main">
                  ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Products List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const status = getStatus(product);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-border-subtle rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-text-main mb-1">{product.name}</h3>
                      <p className="text-sm text-text-muted mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <Badge variant="secondary">+{product.tags.length - 2}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-text-main">${product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          On-Chain Verified
                        </div>
                      </div>
                      <Badge variant={status.variant as any}>{status.text}</Badge>
                    </div>

                    <div className="flex justify-between text-sm text-text-muted mb-4">
                      <span>SKU: {product.sku}</span>
                      <span>In stock: {product.stock}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-text-subtle">{product.category}</span>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface/50">
                  <tr>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStatus(product);
                    return (
                      <tr key={product.id} className="border-t border-border-subtle">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="bg-slate-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                            <div>
                              <div className="font-medium text-text-main">{product.name}</div>
                              <div className="text-sm text-text-muted">{product.description.substring(0, 30)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-text-muted">{product.sku}</td>
                        <td className="py-4 px-4 text-text-muted">{product.category}</td>
                        <td className="py-4 px-4 text-text-main">${product.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-text-main">{product.stock}</td>
                        <td className="py-4 px-4">
                          <Badge variant={status.variant as any}>{status.text}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-medium text-text-main mb-2">No products found</h3>
            <p className="text-text-muted mb-6">Try adjusting your search or filters</p>
            <Button
              onClick={() => router.push('/inventory/add')}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add your first product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
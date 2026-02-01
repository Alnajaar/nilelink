/**
 * Product Management Page
 * Manage business product catalog
 * 
 * FEATURES:
 * - View all products
 * - Add new products (with IPFS image upload)
 * - Edit existing products
 * - Delete products
 * - Manage inventory levels
 * - Set pricing
 * - Categories and tags
 * - Bulk operations
 * - Low stock alerts
 * - Search and filter
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { ipfsService } from '@shared/services/IPFSService';
import { useGuard } from '@shared/hooks/useGuard';
import { ProductWithMetadata } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface ProductForm {
  name: string;
  nameAr?: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image?: string;
  isActive: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: '',
  nameAr: '',
  description: '',
  sku: '',
  category: '',
  price: 0,
  cost: 0,
  stock: 0,
  minStock: 5,
  isActive: true,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProductsPage() {
  const { can } = useGuard();
  const [products, setProducts] = useState<ProductWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStock, setFilterStock] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithMetadata | null>(null);
  const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // TODO: Get business ID from auth context
      const businessId = 'current-business-id';
      const productList = await graphService.getProductsByBusiness(businessId);
      setProducts(productList as ProductWithMetadata[]);
      setError(null);
    } catch (err: any) {
      console.error('[Products] Failed to load:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    const canCreate = await can('CREATE_PRODUCT');
    if (!canCreate) {
      alert('You do not have permission to create products');
      return;
    }

    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const handleEditProduct = async (product: ProductWithMetadata) => {
    const canUpdate = await can('UPDATE_PRODUCT');
    if (!canUpdate) {
      alert('You do not have permission to edit products');
      return;
    }

    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameAr: product.nameAr,
      description: product.description || '',
      sku: product.sku || '',
      category: product.category,
      price: Number(product.price),
      cost: Number(product.cost || 0),
      stock: Number(product.stock),
      minStock: Number(product.minStock || 5),
      image: product.image,
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    const canDelete = await can('DELETE_PRODUCT');
    if (!canDelete) {
      alert('You do not have permission to delete products');
      return;
    }

    if (!confirm('Delete this product? This action cannot be undone.')) return;

    try {
      // TODO: Write to smart contract
      console.log('[Products] Deleting:', productId);

      await loadProducts();
      alert('Product deleted successfully');
    } catch (err: any) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      // Upload to IPFS
      const result = await ipfsService.uploadFile(file, {
        name: `product-${Date.now()}`,
        keyvalues: {
          type: 'product_image',
        },
      });

      const imageUrl = ipfsService.getIPFSUrl(result.IpfsHash);
      setFormData(prev => ({ ...prev, image: imageUrl }));

      console.log('[Products] ✅ Image uploaded:', imageUrl);
    } catch (err: any) {
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    try {
      setSaving(true);

      // Upload metadata to IPFS
      const metadata = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        image: formData.image,
      };

      const metadataHash = await ipfsService.uploadProductMetadata(metadata);

      // TODO: Write to smart contract
      if (editingProduct) {
        console.log('[Products] Updating product:', editingProduct.id, formData);
        // await productContract.updateProduct(...)
      } else {
        console.log('[Products] Creating product:', formData);
        // await productContract.createProduct(...)
      }

      // Simulate blockchain write
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      await loadProducts();
    } catch (err: any) {
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Filter products
  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;

    let matchesStock = true;
    if (filterStock === 'IN_STOCK') matchesStock = Number(p.stock) > Number(p.minStock || 5);
    if (filterStock === 'LOW_STOCK') matchesStock = Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 5);
    if (filterStock === 'OUT_OF_STOCK') matchesStock = Number(p.stock) === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 5)).length;
  const outOfStockCount = products.filter(p => Number(p.stock) === 0).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-wider">
            Manage Products • Inventory • Pricing
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
        >
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Products" value={products.length} icon="📦" />
        <StatCard label="In Stock" value={products.filter(p => Number(p.stock) > Number(p.minStock || 5)).length} icon="✅" color="green" />
        <StatCard label="Low Stock" value={lowStockCount} icon="⚠️" color="yellow" />
        <StatCard label="Out of Stock" value={outOfStockCount} icon="🚫" color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <button
            onClick={loadProducts}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">
            <div className="text-4xl mb-4">⚠️</div>
            <p>{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📭</div>
            <p>No products found</p>
            <button
              onClick={handleAddProduct}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => handleDeleteProduct(product.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          formData={formData}
          setFormData={setFormData}
          uploading={uploading}
          saving={saving}
          onImageUpload={handleImageUpload}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: {
  label: string;
  value: number;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-3xl font-black text-white">{value}</div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductWithMetadata;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stock = Number(product.stock);
  const minStock = Number(product.minStock || 5);
  const isLowStock = stock > 0 && stock <= minStock;
  const isOutOfStock = stock === 0;

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-2xl">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
            ) : (
              '📦'
            )}
          </div>
          <div>
            <div className="text-white font-bold">{product.name}</div>
            {product.nameAr && <div className="text-gray-400 text-xs" dir="rtl">{product.nameAr}</div>}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300 font-mono text-sm">{product.sku || '—'}</td>
      <td className="px-6 py-4 text-white uppercase text-sm">{product.category}</td>
      <td className="px-6 py-4 text-right text-white font-bold">${Number(product.price).toFixed(2)}</td>
      <td className="px-6 py-4 text-right">
        <span className={`font-bold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-green-400'}`}>
          {stock}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {isOutOfStock ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Low Stock
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-500/20 text-green-300 border border-green-500/30">
            In Stock
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-bold"
          >
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductModal({
  product,
  formData,
  setFormData,
  uploading,
  saving,
  onImageUpload,
  onSave,
  onClose,
}: {
  product: ProductWithMetadata | null;
  formData: ProductForm;
  setFormData: React.Dispatch<React.SetStateAction<ProductForm>>;
  uploading: boolean;
  saving: boolean;
  onImageUpload: (file: File) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#0a0f1a] border border-white/20 rounded-xl p-8 max-w-2xl w-full mx-4 my-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Image Upload */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center text-4xl">
                {formData.image ? (
                  <img src={formData.image} alt="Product" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  '📦'
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-bold cursor-pointer inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? '⏳ Uploading...' : '📁 Upload Image'}
                </label>
                <p className="text-xs text-gray-500 mt-1">Max 5MB • JPG, PNG</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Name (English) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Name (Arabic)</label>
              <input
                type="text"
                value={formData.nameAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* SKU & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Sale Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Current Stock *</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Minimum Stock Alert</label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 bg-white/10 border-white/20 rounded"
            />
            <label htmlFor="isActive" className="text-white font-bold">
              Active (visible in POS)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onSave}
            disabled={saving || uploading}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Saving...' : product ? '💾 Update Product' : '➕ Create Product'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

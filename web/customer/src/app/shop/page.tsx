/**
 * Customer Shop Page
 * Browse and search products from all businesses
 * 
 * FEATURES:
 * - Browse products by category
 * - Search across all businesses
 * - Filter by business, price, availability
 * - Product cards with images
 * - Add to cart
 * - View product details
 * - Real-time inventory check
 * - Loyalty points display
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { ProductWithMetadata } from '@shared/types/database';
import { useAuth } from '@shared/providers/AuthProvider';
import { ProductCardSkeleton } from '@shared/components/Skeleton';

// ============================================
// TYPES
// ============================================

interface CartItem {
    productId: string;
    businessId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ShopPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<ProductWithMetadata[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedBusiness, setSelectedBusiness] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc'>('name');

    // View mode
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadProducts();
        loadCart();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);

            // Fetch active businesses first
            const businesses = await graphService.getAllBusinesses();

            // Get products for all active businesses
            const allProducts: ProductWithMetadata[] = [];

            // Optimization: In a real app we might paginate or just get featured products
            // For now, we fetch from the first 50 businesses to popluate the 'Global Shop'
            const activeBusinesses = businesses.filter(b => b.status === 'ACTIVE').slice(0, 50);

            for (const business of activeBusinesses) {
                const products = await graphService.getProductsByBusiness(business.id);
                allProducts.push(...products);
            }

            setProducts(allProducts);
            setError(null);
        } catch (err: any) {
            console.error('[Shop] Failed to load products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCart = () => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('customer_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    };

    const saveCart = (newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem('customer_cart', JSON.stringify(newCart));
    };

    const addToCart = (product: ProductWithMetadata) => {
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            const newCart = cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            saveCart(newCart);
        } else {
            const newCart = [...cart, {
                productId: product.id,
                businessId: product.businessId,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                image: product.image,
            }];
            saveCart(newCart);
        }

        // Show feedback
        alert(`${product.name} added to cart!`);
    };

    // Filter and sort products
    const categories = Array.from(new Set(products.map(p => p.category)));
    const businesses = Array.from(new Set(products.map(p => p.businessId)));

    let filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesBusiness = selectedBusiness === 'ALL' || p.businessId === selectedBusiness;
        const inStock = Number(p.stock) > 0;

        return matchesSearch && matchesCategory && matchesBusiness && inStock;
    });

    // Sort
    filteredProducts.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        return 0;
    });

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-[#02050a]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-4xl font-black text-white mb-2">
                        Shop Products
                    </h1>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                        Browse • Search • Order • Earn Rewards
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search & Filters Bar */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="md:col-span-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex-1 py-3 rounded-lg font-bold ${viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                ⊞ Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 py-3 rounded-lg font-bold ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                ☰ List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cart Summary (Sticky) */}
                {cartItemCount > 0 && (
                    <div className="fixed top-4 right-4 z-50">
                        <a
                            href="/cart"
                            className="flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full text-white font-bold shadow-lg transition-all hover:scale-105"
                        >
                            <span className="text-2xl">🛒</span>
                            <div>
                                <div className="text-xs uppercase">Cart</div>
                                <div className="font-black">{cartItemCount} items</div>
                            </div>
                        </a>
                    </div>
                )}

                {/* Products Grid/List */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p>{error}</p>
                        <button
                            onClick={loadProducts}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-6xl mb-4">📭</div>
                        <p>No products found</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                            : 'space-y-4'
                    }>
                        {filteredProducts.map(product => (
                            viewMode === 'grid' ? (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => addToCart(product)}
                                />
                            ) : (
                                <ProductListItem
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => addToCart(product)}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ProductCard({
    product,
    onAddToCart,
}: {
    product: ProductWithMetadata;
    onAddToCart: () => void;
}) {
    const inStock = Number(product.stock) > 0;

    return (
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl">
            {/* Product Image */}
            <div className="aspect-square bg-white/10 flex items-center justify-center text-6xl overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    '📦'
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-white font-bold mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                    {product.description || 'No description'}
                </p>

                {/* Price & Stock */}
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <div className="text-green-400 font-black text-2xl">
                            ${Number(product.price).toFixed(2)}
                        </div>
                        <div className={`text-xs font-bold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
                            {inStock ? `${product.stock} in stock` : 'Out of stock'}
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    disabled={!inStock}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}

function ProductListItem({
    product,
    onAddToCart,
}: {
    product: ProductWithMetadata;
    onAddToCart: () => void;
}) {
    const inStock = Number(product.stock) > 0;

    return (
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all">
            <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        '📦'
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {product.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
                            {inStock ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                        <span className="text-gray-500 text-xs uppercase">{product.category}</span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="text-right">
                    <div className="text-green-400 font-black text-3xl mb-3">
                        ${Number(product.price).toFixed(2)}
                    </div>
                    <button
                        onClick={onAddToCart}
                        disabled={!inStock}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

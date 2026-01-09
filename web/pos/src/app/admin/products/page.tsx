"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Folder,
    Package,
    Tag,
    Image as ImageIcon,
    Edit3,
    Trash2,
    Eye,
    Upload,
    Camera,
    X,
    Check,
    Save,
    Grid3X3,
    List,
    Brain,
    AlertTriangle,
    TrendingUp,
    Shield
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
// TODO: Uncomment when AIContext and useAI hooks are available
// import { useAIContext } from '@/shared/contexts/AIContext';
// import { useAIConfidence } from '@/shared/hooks/useAI';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    discount?: number;
    image?: string;
    stock: number | 'unlimited';
    sku?: string;
    barcode?: string;
    isActive: boolean;
    preparationTime?: number;
    cost?: number;
    tags?: string[];
}

interface Category {
    id: string;
    name: string;
    color: string;
    productCount: number;
    isActive: boolean;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // TODO: AI integration - uncomment when AIContext is available
    // const { ai, analyzeTransaction, getMemory } = useAIContext();
    // const { getRiskBadgeVariant, getConfidenceLabel, getConfidenceColor } = useAIConfidence();
    
    // Placeholder AI functions until modules are available
    const ai = { isInitialized: false, serviceHealth: null, agents: null };
    const getRiskBadgeVariant = (severity: any) => 'outline' as const;
    const getConfidenceLabel = (confidence: number) => `${Math.round(confidence * 100)}%`;
    const getConfidenceColor = (confidence: number) => 'bg-success';

    // State
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'insights'>('products');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // AI-specific state
    const [aiInsights, setAiInsights] = useState<any[]>([]);
    const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
    const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

    // Modals
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Data - in production this would come from an API
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            name: 'Premium Wagyu Burger',
            description: 'Japanese Wagyu beef patty with truffle aioli and artisanal bun',
            category: 'Burgers',
            price: 45.99,
            discount: 0,
            image: '/api/placeholder/200/150',
            stock: 15,
            sku: 'WAG-BUR-001',
            barcode: '1234567890123',
            isActive: true,
            preparationTime: 15,
            cost: 18.50,
            tags: ['premium', 'signature']
        },
        {
            id: '2',
            name: 'Truffle Fries',
            description: 'Hand-cut fries with black truffle oil and parmesan cheese',
            category: 'Sides',
            price: 12.99,
            discount: 0,
            image: '/api/placeholder/200/150',
            stock: 25,
            sku: 'TRF-FRY-002',
            isActive: true,
            preparationTime: 8,
            cost: 3.25,
            tags: ['vegetarian']
        },
        {
            id: '3',
            name: 'Craft Espresso',
            description: 'Single-origin Ethiopian beans, expertly roasted',
            category: 'Beverages',
            price: 4.50,
            discount: 0,
            stock: 'unlimited',
            sku: 'CFT-ESP-003',
            isActive: true,
            preparationTime: 2,
            cost: 0.75,
            tags: ['hot', 'coffee']
        }
    ]);

    const [categories, setCategories] = useState<Category[]>([
        { id: '1', name: 'Burgers', color: '#00C389', productCount: 1, isActive: true },
        { id: '2', name: 'Sides', color: '#F7F9FC', productCount: 1, isActive: true },
        { id: '3', name: 'Beverages', color: '#0A2540', productCount: 1, isActive: true },
        { id: '4', name: 'Desserts', color: '#F7F9FC', productCount: 0, isActive: true }
    ]);

    // AI initialization
    useEffect(() => {
        // Generate AI recommendations based on products (without external AI context)
        const recommendations: string[] = [];

        // Analyze low stock items
        const lowStockItems = products.filter(p =>
            typeof p.stock === 'number' && p.stock < 10 && p.stock > 0
        );
        if (lowStockItems.length > 0) {
            recommendations.push(`Restock ${lowStockItems.length} low-stock items to prevent sales gaps`);
        }

        // Analyze pricing patterns
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);
        const highPriceItems = products.filter(p => p.price > avgPrice * 1.5);
        if (highPriceItems.length > 0) {
            recommendations.push(`Consider pricing strategy for ${highPriceItems.length} premium items`);
        }

        setAiRecommendations(recommendations);

        // Mock fraud alerts for demonstration
        const alerts = [
            {
                id: '1',
                type: 'UNUSUAL_ACTIVITY',
                severity: 'MEDIUM',
                message: 'Unusual order pattern detected for premium items',
                timestamp: new Date().toISOString(),
                affectedItems: ['Premium Wagyu Burger']
            }
        ];
        setFraudAlerts(alerts);
        setAiInsights([]);
    }, [products]);

    // Computed values
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'low' && typeof product.stock === 'number' && product.stock < 10) ||
            (stockFilter === 'out' && product.stock === 0);

        return matchesSearch && matchesCategory && matchesStock && product.isActive;
    });

    const totalValue = products.reduce((sum, product) => {
        const stockValue = product.stock === 'unlimited' ? 0 : (product.stock || 0) * (product.cost || 0);
        return sum + stockValue;
    }, 0);

    // Handlers
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
        const file = event.target.files?.[0];
        if (file) {
            // In production, upload to cloud storage
            const reader = new FileReader();
            reader.onload = (e) => {
                setProducts(prev => prev.map(p =>
                    p.id === productId ? { ...p, image: e.target?.result as string } : p
                ));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = (productData: Partial<Product>) => {
        if (editingProduct) {
            // Update existing
            setProducts(prev => prev.map(p =>
                p.id === editingProduct.id ? { ...p, ...productData } : p
            ));
        } else {
            // Add new
            const newProduct: Product = {
                id: Date.now().toString(),
                name: productData.name || '',
                description: productData.description || '',
                category: productData.category || categories[0]?.name || 'Uncategorized',
                price: productData.price || 0,
                discount: productData.discount || 0,
                image: productData.image,
                stock: productData.stock || 0,
                sku: productData.sku || `PRD-${Date.now().toString().slice(-4)}`,
                barcode: productData.barcode,
                isActive: productData.isActive ?? true,
                preparationTime: productData.preparationTime,
                cost: productData.cost,
                tags: productData.tags || []
            };
            setProducts(prev => [...prev, newProduct]);
        }

        setShowAddProduct(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = (productId: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    const handleSaveCategory = (categoryData: Partial<Category>) => {
        if (editingCategory) {
            // Update existing
            setCategories(prev => prev.map(c =>
                c.id === editingCategory.id ? { ...c, ...categoryData } : c
            ));
        } else {
            // Add new
            const newCategory: Category = {
                id: Date.now().toString(),
                name: categoryData.name || '',
                color: categoryData.color || 'rgb(0, 195, 137)',
                productCount: 0,
                isActive: true
            };
            setCategories(prev => [...prev, newCategory]);
        }

        setShowAddCategory(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = (categoryId: string) => {
        if (confirm('Are you sure you want to delete this category? All products in this category will be moved to "Uncategorized".')) {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
            // Move products to uncategorized
            setProducts(prev => prev.map(p =>
                p.category === categories.find(c => c.id === categoryId)?.name
                    ? { ...p, category: 'Uncategorized' }
                    : p
            ));
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full" onClick={() => router.push('/admin')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Products & Inventory</h1>
                        <p className="text-text-muted font-medium">Manage your menu, track stock, and organize categories.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-text-muted">Inventory Value</p>
                        <p className="text-lg font-black text-text-main">${totalValue.toFixed(2)}</p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setActiveTab('categories')}
                    >
                        <Folder size={18} />
                        Categories
                    </Button>
                    <Button
                        className="gap-2 shadow-lg shadow-primary/20"
                        onClick={() => {
                            setEditingProduct(null);
                            setShowAddProduct(true);
                        }}
                    >
                        <Plus size={18} />
                        Add Product
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="mb-6 flex gap-1 p-1 bg-background-subtle rounded-xl">
                    <Button
                        variant={activeTab === 'products' ? 'primary' : 'ghost'}
                        className={`flex-1 rounded-lg ${activeTab === 'products' ? 'shadow-sm' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={16} className="mr-2" />
                        Products ({filteredProducts.length})
                    </Button>
                    <Button
                        variant={activeTab === 'categories' ? 'primary' : 'ghost'}
                        className={`flex-1 rounded-lg ${activeTab === 'categories' ? 'shadow-sm' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        <Folder size={16} className="mr-2" />
                        Categories ({categories.length})
                    </Button>
                    <Button
                        variant={activeTab === 'insights' ? 'primary' : 'ghost'}
                        className={`flex-1 rounded-lg ${activeTab === 'insights' ? 'shadow-sm' : ''}`}
                        onClick={() => setActiveTab('insights')}
                    >
                        <Brain size={16} className="mr-2" />
                        AI Insights
                        {fraudAlerts.length > 0 && (
                            <Badge className="ml-2 bg-error text-white text-xs">
                                {fraudAlerts.length}
                            </Badge>
                        )}
                    </Button>
                </div>

                <Card className="bg-white border-border-subtle shadow-sm overflow-hidden">
                    {/* Search and Filters */}
                    <div className="p-6 border-b border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                                <Input
                                    placeholder={`Search ${activeTab}...`}
                                    className="pl-10 h-11 bg-background-subtle border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'products' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="text-text-muted gap-2"
                                            onClick={() => setShowFilters(!showFilters)}
                                        >
                                            <Filter size={18} />
                                            Filters
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-text-muted gap-2"
                                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                        >
                                            {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" className="text-text-muted gap-2">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && activeTab === 'products' && (
                            <div className="flex items-center gap-4 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-muted">Category:</span>
                                    <select
                                        className="px-3 py-1 text-sm border border-border-subtle rounded-md bg-background"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-muted">Stock:</span>
                                    <select
                                        className="px-3 py-1 text-sm border border-border-subtle rounded-md bg-background"
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                                    >
                                        <option value="all">All Stock</option>
                                        <option value="low">Low Stock (&lt;10)</option>
                                        <option value="out">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {activeTab === 'products' ? (
                        viewMode === 'list' ? (
                            <table className="w-full">
                                <thead className="bg-background-subtle border-b border-border-subtle">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Stock</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-text-subtle uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-text-subtle uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-background-subtle/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-xl bg-background-subtle border border-border-subtle overflow-hidden">
                                                        {product.image ? (
                                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-text-subtle">
                                                                <ImageIcon size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-main">{product.name}</p>
                                                        <p className="text-[10px] text-text-subtle uppercase tracking-widest">SKU: {product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={14} className="text-text-subtle" />
                                                    <span className="text-sm font-medium text-text-muted">{product.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-text-main">${product.price.toFixed(2)}</span>
                                                {product.discount && product.discount > 0 && (
                                                    <p className="text-xs text-danger line-through">${(product.price * (1 + product.discount / 100)).toFixed(2)}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${product.stock === 'unlimited' ? 'text-success' : typeof product.stock === 'number' && product.stock < 10 ? 'text-danger' : 'text-text-main'}`}>
                                                    {product.stock === 'unlimited' ? '∞' : product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={product.isActive ? 'success' : 'warning'} className="text-[10px] font-black uppercase">
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowAddProduct(true);
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-danger hover:text-danger hover:bg-danger/10"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            // Grid View
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
                                        <Card key={product.id} className="bg-background-subtle border-border-subtle hover:shadow-md transition-shadow">
                                            <div className="p-4">
                                                <div className="relative mb-4">
                                                    <div className="relative w-full h-32 rounded-lg bg-background border border-border-subtle overflow-hidden">
                                                        {product.image ? (
                                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-text-subtle">
                                                                <ImageIcon size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        variant={product.isActive ? 'success' : 'warning'}
                                                        className="absolute top-2 right-2 text-[10px] font-black uppercase"
                                                    >
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-bold text-text-main mb-1 truncate">{product.name}</h3>
                                                <p className="text-sm text-text-muted mb-2">{product.category}</p>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-mono font-bold text-text-main">${product.price.toFixed(2)}</span>
                                                    <span className={`text-sm font-bold ${product.stock === 'unlimited' ? 'text-success' : typeof product.stock === 'number' && product.stock < 10 ? 'text-danger' : 'text-text-main'}`}>
                                                        {product.stock === 'unlimited' ? '∞' : product.stock}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowAddProduct(true);
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 text-danger hover:text-danger hover:bg-danger/10"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : activeTab === 'categories' ? (
                        // Categories Tab
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-text-main">Manage Categories</h3>
                                <Button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setShowAddCategory(true);
                                    }}
                                    className="gap-2"
                                >
                                    <Plus size={16} />
                                    Add Category
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <Card key={category.id} className="p-4 bg-background-subtle border-border-subtle">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                    style={{ backgroundColor: category.color }}
                                                ></div>
                                                <h4 className="font-bold text-text-main">{category.name}</h4>
                                            </div>
                                            <Badge variant="neutral" className="text-xs">
                                                {category.productCount} products
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setEditingCategory(category);
                                                    setShowAddCategory(true);
                                                }}
                                            >
                                                <Edit3 size={14} className="mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-danger hover:text-danger hover:bg-danger/10"
                                                onClick={() => handleDeleteCategory(category.id)}
                                            >
                                                <Trash2 size={14} className="mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'insights' ? (
                        // AI Insights Tab
                        <div className="p-6 space-y-6">
                            {/* AI Service Status */}
                            <Card className="p-6 border-2 border-primary bg-primary/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${ai.serviceHealth?.status === 'healthy' ? 'bg-success' : 'bg-error'} animate-pulse`} />
                                        <div>
                                            <h3 className="font-bold text-text-main">AI Decision Intelligence</h3>
                                            <p className="text-sm text-text-muted">
                                                Status: {ai.serviceHealth?.status || 'Unknown'} |
                                                Version: {ai.serviceHealth?.version || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="neutral" className="text-xs">
                                        {ai.agents?.agents.length || 0} Agents Active
                                    </Badge>
                                </div>
                            </Card>

                            {/* Fraud Alerts */}
                            {fraudAlerts.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                        <AlertTriangle className="text-error" size={20} />
                                        Fraud Alerts ({fraudAlerts.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {fraudAlerts.map((alert) => (
                                            <Card key={alert.id} className="p-4 border-2 border-error/20 bg-error/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="text-error" size={18} />
                                                        <div>
                                                            <p className="font-bold text-text-main">{alert.message}</p>
                                                            <p className="text-sm text-text-muted">
                                                                Affected: {alert.affectedItems.join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={getRiskBadgeVariant(alert.severity)} className="text-xs">
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Recommendations */}
                            {aiRecommendations.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                        <TrendingUp className="text-primary" size={20} />
                                        AI Recommendations
                                    </h3>
                                    <div className="space-y-3">
                                        {aiRecommendations.map((rec, index) => (
                                            <Card key={index} className="p-4 border-2 border-primary/20 bg-primary/5">
                                                <div className="flex items-center gap-3">
                                                    <Brain className="text-primary" size={18} />
                                                    <p className="font-medium text-text-main">{rec}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Insights History */}
                            {aiInsights.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-text-main mb-4">Recent AI Analysis</h3>
                                    <div className="space-y-3">
                                        {aiInsights.slice(0, 5).map((insight, index) => (
                                            <Card key={index} className="p-4 bg-background-subtle">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-text-main">
                                                            Transaction Analysis - ${insight.data?.amount || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-text-muted">
                                                            Decision: {insight.result?.decision || 'Unknown'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="text-xs text-text-muted">
                                                                Confidence: {getConfidenceLabel(0.85)}
                                                            </div>
                                                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(0.85)}`} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge
                                                            variant={getRiskBadgeVariant(insight.result?.risk_level)}
                                                            className="text-xs"
                                                        >
                                                            {insight.result?.risk_level || 'Unknown'}
                                                        </Badge>
                                                        <div className="text-xs text-text-muted group relative">
                                                            <span className="cursor-help">Why?</span>
                                                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-text text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                AI analyzed transaction patterns and risk factors
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State for AI Insights */}
                            {fraudAlerts.length === 0 && aiRecommendations.length === 0 && aiInsights.length === 0 && (
                                <div className="text-center py-12">
                                    <Brain size={48} className="mx-auto text-text-subtle mb-4" />
                                    <h3 className="text-lg font-bold text-text-main mb-2">AI Monitoring Active</h3>
                                    <p className="text-text-muted">
                                        No immediate alerts or recommendations. AI is continuously monitoring your operations.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Empty State */}
                    {activeTab === 'products' && filteredProducts.length === 0 && (
                        <div className="p-12 text-center">
                            <Package size={48} className="mx-auto text-text-subtle mb-4" />
                            <h3 className="text-lg font-bold text-text-main mb-2">No products found</h3>
                            <p className="text-text-muted mb-6">Try adjusting your search or filters, or add your first product.</p>
                            <Button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setShowAddProduct(true);
                                }}
                                className="gap-2"
                            >
                                <Plus size={18} />
                                Add Product
                            </Button>
                        </div>
                    )}

                    {activeTab === 'categories' && categories.length === 0 && (
                        <div className="p-12 text-center">
                            <Folder size={48} className="mx-auto text-text-subtle mb-4" />
                            <h3 className="text-lg font-bold text-text-main mb-2">No categories found</h3>
                            <p className="text-text-muted mb-6">Create your first category to organize your products.</p>
                            <Button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setShowAddCategory(true);
                                }}
                                className="gap-2"
                            >
                                <Plus size={18} />
                                Add Category
                            </Button>
                        </div>
                    )}
                </Card>
            </main>

            {/* Product Modal */}
            {showAddProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border-subtle">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-text-main">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddProduct(false);
                                        setEditingProduct(null);
                                    }}
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>
                        <form
                            className="p-6 space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const stockValue = formData.get('stock') as string;
                                const productData = {
                                    name: formData.get('name') as string,
                                    description: formData.get('description') as string,
                                    category: formData.get('category') as string,
                                    price: parseFloat(formData.get('price') as string),
                                    discount: parseFloat(formData.get('discount') as string) || 0,
                                    stock: (stockValue === 'unlimited' ? 'unlimited' : parseInt(stockValue)) as number | 'unlimited',
                                    sku: formData.get('sku') as string,
                                    barcode: formData.get('barcode') as string,
                                    preparationTime: parseInt(formData.get('preparationTime') as string),
                                    cost: parseFloat(formData.get('cost') as string),
                                    tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()) || [],
                                    isActive: formData.get('isActive') === 'on'
                                };
                                handleSaveProduct(productData);
                            }}
                        >
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-main mb-2">Product Name</label>
                                        <Input
                                            name="name"
                                            required
                                            defaultValue={editingProduct?.name}
                                            placeholder="Enter product name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            className="w-full px-3 py-2 border border-border-subtle rounded-md bg-background resize-none"
                                            rows={3}
                                            defaultValue={editingProduct?.description}
                                            placeholder="Describe your product"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main mb-2">Category</label>
                                        <select
                                            name="category"
                                            className="w-full px-3 py-2 border border-border-subtle rounded-md bg-background"
                                            defaultValue={editingProduct?.category || categories[0]?.name}
                                            required
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">Price ($)</label>
                                            <Input
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                defaultValue={editingProduct?.price}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">Discount (%)</label>
                                            <Input
                                                name="discount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                defaultValue={editingProduct?.discount || 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-main mb-2">Stock</label>
                                        <select
                                            name="stock"
                                            className="w-full px-3 py-2 border border-border-subtle rounded-md bg-background mb-2"
                                            defaultValue={editingProduct?.stock === 'unlimited' ? 'unlimited' : editingProduct?.stock || 0}
                                        >
                                            <option value="unlimited">Unlimited</option>
                                            <option value="custom">Custom amount</option>
                                        </select>
                                        <Input
                                            name="stock"
                                            type="number"
                                            min="0"
                                            defaultValue={editingProduct?.stock === 'unlimited' ? '' : editingProduct?.stock || 0}
                                            placeholder="Enter stock amount"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">SKU</label>
                                            <Input
                                                name="sku"
                                                defaultValue={editingProduct?.sku}
                                                placeholder="Auto-generated if empty"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">Barcode</label>
                                            <Input
                                                name="barcode"
                                                defaultValue={editingProduct?.barcode}
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">Prep Time (min)</label>
                                            <Input
                                                name="preparationTime"
                                                type="number"
                                                min="0"
                                                defaultValue={editingProduct?.preparationTime || 0}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">Cost ($)</label>
                                            <Input
                                                name="cost"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                defaultValue={editingProduct?.cost || 0}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main mb-2">Tags</label>
                                        <Input
                                            name="tags"
                                            defaultValue={editingProduct?.tags?.join(', ')}
                                            placeholder="Separate with commas"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            id="isActive"
                                            defaultChecked={editingProduct?.isActive ?? true}
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-text-main">Active Product</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddProduct(false);
                                        setEditingProduct(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="gap-2">
                                    <Save size={16} />
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <div className="p-6 border-b border-border-subtle">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-text-main">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddCategory(false);
                                        setEditingCategory(null);
                                    }}
                                >
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>
                        <form
                            className="p-6 space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const categoryData = {
                                    name: formData.get('name') as string,
                                    color: formData.get('color') as string
                                };
                                handleSaveCategory(categoryData);
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">Category Name</label>
                                <Input
                                    name="name"
                                    required
                                    defaultValue={editingCategory?.name}
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">Color</label>
                                <input
                                    name="color"
                                    type="color"
                                    className="w-full h-10 border border-border-subtle rounded-md cursor-pointer"
                                    defaultValue={editingCategory?.color || '#00C389'}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddCategory(false);
                                        setEditingCategory(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="gap-2">
                                    <Save size={16} />
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/lib/core/POSContext';
import {
    ShoppingCart, Barcode, Scale, Plus, Minus, Trash2,
    Search, Grid, List, DollarSign, CreditCard, Calendar, AlertCircle
} from 'lucide-react';

interface Product {
    id: string;
    barcode: string;
    name: string;
    price: number;
    unit: 'piece' | 'kg' | 'lb';
    category: string;
    stock: number;
    requiresAgeVerification?: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
    weight?: number; // For weight-based items
    finalPrice: number;
}

export default function SupermarketTerminal() {
    const { engines, isInitialized } = usePOS();

    // State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [weightInput, setWeightInput] = useState('');
    const [showWeightModal, setShowWeightModal] = useState<Product | null>(null);
    const [showAgeVerification, setShowAgeVerification] = useState<Product | null>(null);
    const [scannerActive, setScannerActive] = useState(true);

    // Mock Products
    const mockProducts: Product[] = [
        { id: '1', barcode: '123456789', name: 'Organic Apples', price: 3.99, unit: 'kg', category: 'Produce', stock: 50 },
        { id: '2', barcode: '234567890', name: 'Whole Milk 1L', price: 4.99, unit: 'piece', category: 'Dairy', stock: 30 },
        { id: '3', barcode: '345678901', name: 'Bread - Whole Wheat', price: 3.49, unit: 'piece', category: 'Bakery', stock: 45 },
        { id: '4', barcode: '456789012', name: 'Ground Beef', price: 12.99, unit: 'kg', category: 'Meat', stock: 20 },
        { id: '5', barcode: '567890123', name: 'Coca Cola 2L', price: 2.99, unit: 'piece', category: 'Beverages', stock: 100 },
        { id: '6', barcode: '678901234', name: 'Bananas', price: 1.99, unit: 'kg', category: 'Produce', stock: 80 },
        { id: '7', barcode: '789012345', name: 'Eggs (12 pack)', price: 5.99, unit: 'piece', category: 'Dairy', stock: 60 },
        { id: '8', barcode: '890123456', name: 'Wine - Red', price: 19.99, unit: 'piece', category: 'Alcohol', stock: 25, requiresAgeVerification: true },
        { id: '9', barcode: '901234567', name: 'Cheese - Cheddar', price: 8.99, unit: 'kg', category: 'Dairy', stock: 15 },
        { id: '10', barcode: '012345678', name: 'Chicken Breast', price: 11.99, unit: 'kg', category: 'Meat', stock: 18 },
    ];

    const categories = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Beverages', 'Alcohol'];

    useEffect(() => {
        setProducts(mockProducts);
    }, []);

    // Barcode scanning simulation
    useEffect(() => {
        if (!scannerActive) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            // Simulate barcode scanner input (ends with Enter)
            if (e.key === 'Enter' && barcodeInput) {
                handleBarcodeScan(barcodeInput);
                setBarcodeInput('');
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                setBarcodeInput(prev => prev + e.key);
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [barcodeInput, scannerActive]);

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode);

        if (product) {
            if (product.requiresAgeVerification) {
                setShowAgeVerification(product);
            } else if (product.unit === 'kg' || product.unit === 'lb') {
                setShowWeightModal(product);
            } else {
                addToCart(product, 1);
            }
        } else {
            alert(`Product not found: ${barcode}`);
        }
    };

    const addToCart = (product: Product, quantity: number, weight?: number) => {
        if (product.stock < quantity) {
            alert(`Insufficient stock for ${product.name}`);
            return;
        }

        const finalPrice = weight
            ? product.price * weight
            : product.price * quantity;

        const existingIndex = cart.findIndex(item => item.product.id === product.id);

        if (existingIndex >= 0) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += quantity;
            if (weight) newCart[existingIndex].weight = (newCart[existingIndex].weight || 0) + weight;
            newCart[existingIndex].finalPrice += finalPrice;
            setCart(newCart);
        } else {
            setCart([...cart, {
                product,
                quantity,
                weight,
                finalPrice
            }]);
        }

        setShowWeightModal(null);
        setShowAgeVerification(null);
    };

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        const newCart = [...cart];
        const item = newCart[index];

        if (item.weight) {
            // Weight-based item
            const pricePerUnit = item.product.price;
            item.quantity = newQuantity;
            item.finalPrice = pricePerUnit * item.weight * newQuantity;
        } else {
            item.quantity = newQuantity;
            item.finalPrice = item.product.price * newQuantity;
        }

        setCart(newCart);
    };

    const removeItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.finalPrice, 0);
    };

    const processCheckout = () => {
        const total = calculateTotal();
        alert(`Processing payment of $${total.toFixed(2)}`);
        setCart([]);
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="max-w-[1920px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <ShoppingCart className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Supermarket Terminal</h1>
                            <p className="text-gray-400">Fast checkout & inventory management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`px-4 py-2 rounded-lg ${scannerActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${scannerActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                <span className="text-sm text-white">Scanner {scannerActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Cart */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sticky top-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                                <span className="flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Cart ({cart.length})
                                </span>
                                {cart.length > 0 && (
                                    <button
                                        onClick={() => setCart([])}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Clear
                                    </button>
                                )}
                            </h2>

                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <Barcode className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500">Scan or add items</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto mb-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white text-sm">{item.product.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.weight
                                                            ? `${item.weight.toFixed(2)} ${item.product.unit} @ $${item.product.price.toFixed(2)}/${item.product.unit}`
                                                            : `$${item.product.price.toFixed(2)} each`
                                                        }
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Minus className="w-3 h-3 text-white" />
                                                    </button>
                                                    <span className="text-white font-semibold w-8 text-center text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                                        className="p-1 bg-slate-600 hover:bg-slate-500 rounded"
                                                    >
                                                        <Plus className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                                <p className="text-white font-bold">${item.finalPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {cart.length > 0 && (
                                <>
                                    <div className="border-t border-slate-600 pt-4 space-y-3">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Items:</span>
                                            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-bold text-white">
                                            <span>Total:</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={processCheckout}
                                        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span>Checkout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Products */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Search and Filters */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or barcode..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === category
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                if (product.requiresAgeVerification) {
                                                    setShowAgeVerification(product);
                                                } else if (product.unit === 'kg' || product.unit === 'lb') {
                                                    setShowWeightModal(product);
                                                } else {
                                                    addToCart(product, 1);
                                                }
                                            }}
                                            className="p-4 rounded-lg border-2 border-slate-600 bg-slate-700/50 hover:border-blue-500 hover:bg-slate-700 transition-all text-left"
                                        >
                                            <p className="font-semibold text-white mb-1">{product.name}</p>
                                            <p className="text-xs text-gray-400 mb-2">{product.category}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold text-blue-400">
                                                    ${product.price.toFixed(2)}
                                                    {product.unit !== 'piece' && <span className="text-xs">/{product.unit}</span>}
                                                </p>
                                                {product.unit !== 'piece' && (
                                                    <Scale className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                                            {product.requiresAgeVerification && (
                                                <p className="text-xs text-yellow-400 mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Age 21+
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                if (product.requiresAgeVerification) {
                                                    setShowAgeVerification(product);
                                                } else if (product.unit === 'kg' || product.unit === 'lb') {
                                                    setShowWeightModal(product);
                                                } else {
                                                    addToCart(product, 1);
                                                }
                                            }}
                                            className="w-full p-4 rounded-lg border border-slate-600 bg-slate-700/50 hover:border-blue-500 hover:bg-slate-700 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 text-left">
                                                    <p className="font-semibold text-white">{product.name}</p>
                                                    <p className="text-sm text-gray-400">{product.category} • Barcode: {product.barcode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-blue-400">
                                                        ${product.price.toFixed(2)}
                                                        {product.unit !== 'piece' && <span className="text-sm">/{product.unit}</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weight Input Modal */}
                {showWeightModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <Scale className="w-6 h-6 mr-2 text-blue-400" />
                                Enter Weight
                            </h2>
                            <p className="text-gray-300 mb-4">{showWeightModal.name}</p>
                            <p className="text-sm text-gray-400 mb-4">
                                ${showWeightModal.price.toFixed(2)} per {showWeightModal.unit}
                            </p>

                            <input
                                type="number"
                                step="0.01"
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                placeholder={`Weight in ${showWeightModal.unit}...`}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4 text-lg"
                                autoFocus
                            />

                            {weightInput && (
                                <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
                                    <p className="text-blue-300 text-center">
                                        Total: ${(parseFloat(weightInput) * showWeightModal.price).toFixed(2)}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowWeightModal(null);
                                        setWeightInput('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const weight = parseFloat(weightInput);
                                        if (weight > 0) {
                                            addToCart(showWeightModal, 1, weight);
                                            setWeightInput('');
                                        }
                                    }}
                                    disabled={!weightInput || parseFloat(weightInput) <= 0}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Age Verification Modal */}
                {showAgeVerification && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-yellow-600 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <AlertCircle className="w-6 h-6 mr-2 text-yellow-400" />
                                Age Verification Required
                            </h2>
                            <p className="text-gray-300 mb-2">Customer must be 21+ to purchase:</p>
                            <p className="text-xl font-semibold text-white mb-6">{showAgeVerification.name}</p>

                            <p className="text-sm text-yellow-400 mb-4">Please verify customer's age before proceeding.</p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowAgeVerification(null)}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => addToCart(showAgeVerification, 1)}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Verified - Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

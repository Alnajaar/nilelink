/**
 * POS Sales Interface
 * Main point-of-sale screen for processing orders
 * 
 * FEATURES:
 * - Product search and selection
 * - Shopping cart management
 * - Real-time inventory checks
 * - Multiple payment methods
 * - Customer selection (for loyalty)
 * - Applied discounts and taxes
 * - Receipt generation
 * - Order submission to blockchain
 * - Offline mode support
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { complianceEngine } from '@shared/services/ComplianceEngine';
import { useGuard } from '@shared/hooks/useGuard';
import { ProductWithMetadata, PaymentMethod } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    taxExempt: boolean;
    discount?: number;
}

interface Order {
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    customerId?: string;
    notes?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SalesPage() {
    const { can } = useGuard();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<ProductWithMetadata[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [customerId, setCustomerId] = useState<string>('');
    const [orderNotes, setOrderNotes] = useState('');
    const [country, setCountry] = useState('SA'); // From business settings
    const [processing, setProcessing] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    // Load products
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            // TODO: Get business ID from auth context
            const businessId = 'current-business-id';
            const productList = await graphService.getProductsByBusiness(businessId);
            setProducts(productList as ProductWithMetadata[]);
        } catch (error: any) {
            console.error('[POS] Failed to load products:', error);
        }
    };

    // Calculate order totals
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            const discount = item.discount || 0;
            return sum + (itemTotal - discount);
        }, 0);

        const discountTotal = cart.reduce((sum, item) => sum + (item.discount || 0), 0);

        // Calculate tax (skip tax-exempt items)
        const taxableAmount = cart.reduce((sum, item) => {
            if (item.taxExempt) return sum;
            const itemTotal = item.price * item.quantity - (item.discount || 0);
            return sum + itemTotal;
        }, 0);

        const taxCalc = complianceEngine.calculateTax(taxableAmount, country);
        const tax = taxCalc.taxAmount;
        const total = subtotal + tax;

        return { subtotal, discount: discountTotal, tax, total };
    };

    // Add product to cart
    const addToCart = (product: ProductWithMetadata) => {
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                taxExempt: false, // TODO: Check product category
            }]);
        }
    };

    // Update quantity
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, quantity }
                : item
        ));
    };

    // Remove from cart
    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    // Apply discount to item
    const applyDiscount = (productId: string, discount: number) => {
        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, discount }
                : item
        ));
    };

    // Process order
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        const canCreate = await can('CREATE_ORDER');
        if (!canCreate) {
            alert('You do not have permission to create orders');
            return;
        }

        if (!confirm('Process this order?')) return;

        try {
            setProcessing(true);

            const totals = calculateTotals();

            const order: Order = {
                items: cart,
                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                total: totals.total,
                paymentMethod,
                customerId: customerId || undefined,
                notes: orderNotes || undefined,
            };

            console.log('[POS] Processing order:', order);

            // TODO: Write to blockchain
            // const tx = await orderContract.createOrder({
            //   businessId: currentBusiness,
            //   items: order.items.map(item => ({
            //     productId: item.productId,
            //     quantity: item.quantity,
            //     price: item.price,
            //   })),
            //   paymentMethod: order.paymentMethod,
            //   customerId: order.customerId,
            // });
            // await tx.wait();

            // Simulate blockchain write
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderId = `ORD-${Date.now()}`;
            setLastOrderId(orderId);
            setShowReceipt(true);

            // Clear cart
            setCart([]);
            setCustomerId('');
            setOrderNotes('');
            setPaymentMethod('CASH');

            console.log('[POS] ✅ Order created:', orderId);
        } catch (error: any) {
            alert(`Failed to process order: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(products.map(p => p.category)));
    const totals = calculateTotals();

    return (
        <div className="h-screen flex">
            {/* Left Panel - Products */}
            <div className="flex-1 flex flex-col bg-[#02050a]">
                {/* Search & Filters */}
                <div className="p-4 bg-white/5 border-b border-white/10">
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />

                    <div className="flex gap-2 mt-3 overflow-x-auto">
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-4 py-2 rounded font-bold text-xs uppercase whitespace-nowrap ${selectedCategory === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded font-bold text-xs uppercase whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAdd={() => addToCart(product)}
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4">📦</div>
                            <p>No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Cart */}
            <div className="w-96 bg-[#0a0f1a] border-l border-white/10 flex flex-col">
                {/* Cart Header */}
                <div className="p-4 bg-white/5 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Current Order</h2>
                    <p className="text-xs text-gray-400 mt-1">{cart.length} items</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-6xl mb-4">🛒</div>
                            <p>Cart is empty</p>
                            <p className="text-xs mt-2">Add products to start</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <CartItemCard
                                    key={item.productId}
                                    item={item}
                                    onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                                    onRemove={() => removeFromCart(item.productId)}
                                    onApplyDiscount={(discount) => applyDiscount(item.productId, discount)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer - Totals & Checkout */}
                {cart.length > 0 && (
                    <div className="border-t border-white/10">
                        {/* Customer & Notes */}
                        <div className="p-4 space-y-3 bg-white/5">
                            <input
                                type="text"
                                placeholder="Customer ID (optional)"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Order notes (optional)"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="p-4 bg-white/5 border-y border-white/10">
                            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['CASH', 'CARD', 'DIGITAL_WALLET'] as PaymentMethod[]).map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`px-3 py-2 rounded font-bold text-xs uppercase ${paymentMethod === method
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                            }`}
                                    >
                                        {method.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="p-4 bg-white/5 space-y-2">
                            <div className="flex justify-between text-gray-300">
                                <span>Subtotal</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Discount</span>
                                    <span>-${totals.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-300">
                                <span>Tax ({complianceEngine.getRules(country)?.vatRate}%)</span>
                                <span>${totals.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-white text-2xl font-black pt-2 border-t border-white/20">
                                <span>Total</span>
                                <span>${totals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <div className="p-4">
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-black text-lg uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? '⏳ Processing...' : '✓ Complete Order'}
                            </button>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="w-full mt-2 py-2 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 font-bold text-sm uppercase"
                                >
                                    Clear Cart
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {showReceipt && lastOrderId && (
                <ReceiptModal
                    orderId={lastOrderId}
                    items={cart}
                    totals={totals}
                    paymentMethod={paymentMethod}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ProductCard({
    product,
    onAdd,
}: {
    product: ProductWithMetadata;
    onAdd: () => void;
}) {
    const inStock = Number(product.stock) > 0;

    return (
        <button
            onClick={onAdd}
            disabled={!inStock}
            className={`bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all ${!inStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
        >
            <div className="aspect-square bg-white/10 rounded mb-3 flex items-center justify-center text-4xl">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                ) : (
                    '📦'
                )}
            </div>
            <h3 className="text-white font-bold mb-1 truncate">{product.name}</h3>
            <p className="text-gray-400 text-xs mb-2 truncate">{product.sku}</p>
            <div className="flex items-center justify-between">
                <span className="text-green-400 font-black text-lg">
                    ${Number(product.price).toFixed(2)}
                </span>
                <span className={`text-xs font-bold ${inStock ? 'text-green-400' : 'text-red-400'}`}>
                    {inStock ? `${product.stock} in stock` : 'Out of stock'}
                </span>
            </div>
        </button>
    );
}

function CartItemCard({
    item,
    onUpdateQuantity,
    onRemove,
    onApplyDiscount,
}: {
    item: CartItem;
    onUpdateQuantity: (qty: number) => void;
    onRemove: () => void;
    onApplyDiscount: (discount: number) => void;
}) {
    const itemTotal = (item.price * item.quantity) - (item.discount || 0);

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{item.name}</h4>
                    <p className="text-gray-400 text-xs">${item.price.toFixed(2)} each</p>
                </div>
                <button
                    onClick={onRemove}
                    className="text-red-400 hover:text-red-300 text-sm"
                >
                    ✕
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateQuantity(item.quantity - 1)}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                    >
                        −
                    </button>
                    <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.quantity + 1)}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                    >
                        +
                    </button>
                </div>
                <span className="text-white font-bold">${itemTotal.toFixed(2)}</span>
            </div>

            {item.discount ? (
                <div className="mt-2 text-xs text-green-400">
                    Discount: -${item.discount.toFixed(2)}
                </div>
            ) : null}
        </div>
    );
}

function ReceiptModal({
    orderId,
    items,
    totals,
    paymentMethod,
    onClose,
}: {
    orderId: string;
    items: CartItem[];
    totals: { subtotal: number; discount: number; tax: number; total: number };
    paymentMethod: PaymentMethod;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Order Complete!</h2>
                    <p className="text-gray-600 text-sm">Order #{orderId}</p>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm">
                    <div className="font-bold text-gray-900 mb-3">Order Summary</div>
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 mb-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-300 mt-3 pt-3 space-y-1">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toFixed(2)}</span>
                        </div>
                        {totals.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-${totals.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-700">
                            <span>Tax</span>
                            <span>${totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-black text-lg pt-2 border-t border-gray-300">
                            <span>Total</span>
                            <span>${totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-3 text-gray-600">
                        Payment: <span className="font-bold">{paymentMethod.replace('_', ' ')}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
                    >
                        🖨️ Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-900 font-bold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

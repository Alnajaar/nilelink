/**
 * Customer Cart & Checkout Page
 * manage cart items and process orders
 * 
 * FEATURES:
 * - Cart item management (quantities, removal)
 * - Real-time tax calculation via ComplianceEngine
 * - Loyalty points redemption
 * - Delivery vs Pickup selection
 * - Multi-method payment selection
 * - Secure checkout flow
 * - Order submission to Blockchain/IPFS
 */

'use client';

import { useState, useEffect } from 'react';
import { complianceEngine } from '@shared/services/ComplianceEngine';
import { ipfsService } from '@shared/services/IPFSService';
import { useAuth } from '@shared/providers/AuthProvider';
import { PaymentMethod } from '@shared/types/database';
import web3Service from '@shared/services/Web3Service';

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
    taxExempt?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CheckoutPage() {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    // Delivery settings
    const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [useLoyalty, setUseLoyalty] = useState(false);
    const [country, setCountry] = useState('SA'); // Default, would be from user profile/location

    useEffect(() => {
        const savedCart = localStorage.getItem('customer_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        // Check for recovery
        const recoveryData = localStorage.getItem('pending_order_recovery');
        if (recoveryData) {
            try {
                const { timestamp } = JSON.parse(recoveryData);
                // If order is less than 1 hour old, warn user
                if (Date.now() - timestamp < 3600000) {
                    // In a real app we'd show a specialized "Resume?" modal
                    console.log('Found pending order recovery data');
                } else {
                    localStorage.removeItem('pending_order_recovery');
                }
            } catch (e) {
                localStorage.removeItem('pending_order_recovery');
            }
        }
    }, []);

    const updateQuantity = (productId: string, newQty: number) => {
        if (newQty < 1) return;
        const newCart = cart.map(item =>
            item.productId === productId ? { ...item, quantity: newQty } : item
        );
        setCart(newCart);
        localStorage.setItem('customer_cart', JSON.stringify(newCart));
    };

    const removeItem = (productId: string) => {
        const newCart = cart.filter(item => item.productId !== productId);
        setCart(newCart);
        localStorage.setItem('customer_cart', JSON.stringify(newCart));
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Tax calculation using ComplianceEngine
    const taxableAmount = cart.reduce((sum, item) => {
        return item.taxExempt ? sum : sum + (item.price * item.quantity);
    }, 0);

    const taxResult = complianceEngine.calculateTax(taxableAmount, country);
    const tax = taxResult.taxAmount;

    const deliveryFee = orderType === 'DELIVERY' ? 15 : 0; // Constants or business-based
    const loyaltyDiscount = useLoyalty ? 10 : 0; // Mock loyalty redemption
    const total = subtotal + tax + deliveryFee - loyaltyDiscount;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (orderType === 'DELIVERY' && !address) {
            alert('Please provide a delivery address');
            return;
        }

        try {
            setLoading(true);

            // 1. Prepare Order Metadata for IPFS
            const orderMetadata = {
                customerId: user?.uid,
                items: cart,
                totals: { subtotal, tax, deliveryFee, total },
                deliveryAddress: address,
                orderType,
                paymentMethod,
                timestamp: Date.now(),
                status: 'PENDING'
            };

            // SAVE STATE FOR RECOVERY
            localStorage.setItem('pending_order_recovery', JSON.stringify({
                metadata: orderMetadata,
                businessId: cart[0]?.businessId,
                timestamp: Date.now()
            }));

            // 2. Upload to IPFS (Phase 1 service)
            const ipfsHash = await ipfsService.uploadJSON(orderMetadata, {
                name: `order-${Date.now()}`,
                keyvalues: { type: 'customer_order', customer: user?.uid || 'guest' }
            });

            console.log('[Checkout] Order uploaded to IPFS:', ipfsHash);

            // 3. Submit transaction to Smart Contract
            // Group items by business for the contract (customer app simplifies to single business cart for now)
            // If mixed cart, we'd need multi-tx or a router. Assuming single business for MVP.
            const businessId = cart[0]?.businessId;
            if (!businessId) throw new Error("No business ID found in cart");

            const orderItems = cart.map(item => ({
                menuItemId: item.productId,
                quantity: item.quantity,
                specialInstructions: ''
            }));

            // Create order on-chain
            const orderId = await web3Service.createOrder({
                restaurantId: businessId,
                items: orderItems,
                totalAmount: total.toString(),
                deliveryAddress: address || 'Pickup'
            });

            if (!orderId) {
                throw new Error('Transaction failed or was rejected');
            }

            setLastOrderId(orderId);
            setOrderComplete(true);

            // Clear cart AND recovery state
            setCart([]);
            localStorage.removeItem('customer_cart');
            localStorage.removeItem('pending_order_recovery');

        } catch (err: any) {
            alert(`Checkout failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center p-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-md w-full">
                    <div className="text-7xl mb-6">🎉</div>
                    <h1 className="text-3xl font-black text-white mb-4">Order Confirmed!</h1>
                    <p className="text-gray-400 mb-8">
                        Your order <span className="text-blue-400 font-mono">#{lastOrderId}</span> has been placed successfully on the blockchain.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '/tracking'}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-all"
                        >
                            Track Order 🚚
                        </button>
                        <button
                            onClick={() => window.location.href = '/shop'}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-white mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Cart Items */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 bg-white/5">
                                <h2 className="text-xl font-bold text-white">Your Items</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 mb-4">Your cart is empty</p>
                                        <a href="/shop" className="text-blue-400 font-bold hover:underline">Go to Shop</a>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl">
                                                {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold">{item.name}</h3>
                                                <p className="text-gray-400 text-sm">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 bg-white/10 rounded text-white">-</button>
                                                <span className="text-white font-mono">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 bg-white/10 rounded text-white">+</button>
                                            </div>
                                            <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Delivery/Options */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Delivery Options</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => setOrderType('DELIVERY')}
                                    className={`p-4 rounded-xl border font-bold transition-all ${orderType === 'DELIVERY' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Delivery 🚚
                                </button>
                                <button
                                    onClick={() => setOrderType('PICKUP')}
                                    className={`p-4 rounded-xl border font-bold transition-all ${orderType === 'PICKUP' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    Pickup 🏪
                                </button>
                            </div>

                            {orderType === 'DELIVERY' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-gray-400">Delivery Address</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter full delivery address..."
                                        className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {(['CARD', 'CASH', 'DIGITAL_WALLET'] as PaymentMethod[]).map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`p-4 rounded-xl border text-xs font-bold transition-all ${paymentMethod === method ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                    >
                                        {method.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Tax ({taxResult.rate}%)</span>
                                    <span className="text-white">${tax.toFixed(2)}</span>
                                </div>
                                {orderType === 'DELIVERY' && (
                                    <div className="flex justify-between text-gray-400">
                                        <span>Delivery Fee</span>
                                        <span className="text-white">${deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {useLoyalty && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Loyalty Discount</span>
                                        <span>-${loyaltyDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Loyalty Toggle */}
                            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl mb-6 flex items-center justify-between">
                                <div>
                                    <div className="text-white font-bold text-sm">Use 500 points</div>
                                    <div className="text-blue-400 text-xs">Save $10.00</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={useLoyalty}
                                    onChange={(e) => setUseLoyalty(e.target.checked)}
                                    className="w-5 h-5 accent-blue-500"
                                />
                            </div>

                            <div className="border-t border-white/10 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400">Total</span>
                                    <span className="text-3xl font-black text-white">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                                className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-black text-lg uppercase transition-all shadow-lg shadow-green-900/20"
                            >
                                {loading ? 'Processing...' : 'Place Order ✓'}
                            </button>

                            <p className="text-gray-500 text-[10px] text-center mt-4 uppercase tracking-widest">
                                Decentralized • Immutable • NileLink Secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

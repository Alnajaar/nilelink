"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Wallet, ArrowRight, MapPin, MessageSquare } from 'lucide-react';
import { generateSecureToken } from '../../utils/crypto';
import { useCustomer } from '@/contexts/CustomerContext';
import { orderApi, ApiError } from '@/shared/utils/api';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, clearCart, location, setActiveOrderId } = useCustomer();
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DIGITAL'>('CASH');
    const [deliveryAddress, setDeliveryAddress] = useState(location?.address || '');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deliveryFee = 2.50;
    const total = cartTotal + deliveryFee;

    // Redirect if cart is empty
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background-light p-6 max-w-4xl mx-auto flex items-center justify-center">
                <EmptyState
                    icon={<ShoppingBag size={32} />}
                    title="Your cart is empty"
                    description="Add some items to your cart before checking out."
                    action={{
                        label: "Browse Restaurants",
                        onClick: () => router.push('/')
                    }}
                />
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            setError('Please enter a delivery address');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Get restaurant ID from first cart item (assuming single restaurant checkout for now)
            const restaurantId = cart[0].restaurantId;

            // Prepare order items
            const orderItems = cart.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity,
                specialInstructions: specialInstructions
            }));

            // Create order via API
            const response = await orderApi.create({
                restaurantId,
                items: orderItems,
                deliveryAddress,
                specialInstructions: specialInstructions || undefined,
                paymentMethod
            }) as { order: { id: string } };

            const newOrderId = response.order.id;

            // Set active order for tracking
            setActiveOrderId(newOrderId);

            // Clear cart after successful order
            clearCart();

            // Navigate to tracking page
            router.push(`/track/${newOrderId}`);

        } catch (err) {
            console.error('Order placement failed:', err);
            if (err instanceof ApiError) {
                setError(err.message || 'Failed to place order. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light p-6">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold text-primary-dark mb-2">Processing Order...</h2>
                <p className="text-text-secondary">Please wait while we secure your order</p>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background-light p-6 max-w-4xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/cart">
                        <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-dark">Checkout</h1>
                        <p className="text-text-secondary text-sm uppercase">Secure Payment</p>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                        <p className="text-error font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-6 flex items-center gap-2">
                                <MapPin size={20} />
                                Delivery Address
                            </h3>
                            <Input
                                label="Delivery Address"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Enter your delivery address"
                                required
                            />
                            {location && (
                                <p className="text-sm text-text-secondary mt-2">
                                    Using your current location: {location.address}
                                </p>
                            )}
                        </Card>

                        {/* Special Instructions */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-6 flex items-center gap-2">
                                <MessageSquare size={20} />
                                Special Instructions (Optional)
                            </h3>
                            <textarea
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Any special delivery instructions..."
                                className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                rows={3}
                            />
                        </Card>

                        {/* Payment Method */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-6">Payment Method</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'CASH'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-background border-border-light hover:bg-background-light text-text-secondary'
                                        }`}
                                >
                                    <Wallet size={28} />
                                    <span className="text-sm font-bold">Cash on Delivery</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('DIGITAL')}
                                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'DIGITAL'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-background border-border-light hover:bg-background-light text-text-secondary'
                                        }`}
                                >
                                    <CreditCard size={28} />
                                    <span className="text-sm font-bold">Digital Payment</span>
                                </button>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card className="p-6 sticky top-6">
                            <h3 className="font-bold text-lg text-primary-dark mb-6">Order Summary</h3>

                            {/* Restaurant Info */}
                            <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                                <p className="font-medium text-primary-dark">{cart[0]?.restaurantName}</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <span className="font-medium text-primary-dark">{item.name}</span>
                                                <p className="text-xs text-text-secondary">{item.restaurantName}</p>
                                            </div>
                                        </div>
                                        <CurrencyDisplay amount={item.price * item.quantity} />
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border-light pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-text-secondary">
                                    <span>Subtotal</span>
                                    <CurrencyDisplay amount={cartTotal} />
                                </div>
                                <div className="flex justify-between text-text-secondary">
                                    <span>Delivery Fee</span>
                                    <CurrencyDisplay amount={deliveryFee} />
                                </div>
                                <div className="border-t border-border-light pt-2 flex justify-between font-bold text-xl text-primary-dark">
                                    <span>Total</span>
                                    <CurrencyDisplay amount={total} />
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border-light">
                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting || !deliveryAddress.trim()}
                                    className="w-full py-6 text-lg font-bold"
                                    rightIcon={<ArrowRight size={20} />}
                                >
                                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

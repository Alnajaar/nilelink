"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CreditCard, Wallet, MapPin, ArrowRight } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { LoadingState } from '@/components/shared/LoadingState';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, setActiveOrderId, clearCart } = useCustomer();
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DIGITAL'>('CASH');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliveryFee = 2.00;
    const total = cartTotal + deliveryFee;

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);

        // Simulating protocol interaction
        setTimeout(() => {
            const newOrderId = `ORD-${Math.floor(Math.random() * 10000)}`;
            setActiveOrderId(newOrderId);
            clearCart();
            router.push(`/track?id=${newOrderId}`);
        }, 2000);
    };

    if (cart.length === 0 && !isSubmitting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <Card className="p-8 text-center max-w-sm">
                    <h2 className="text-xl font-bold mb-4">Cart is Empty</h2>
                    <Link href="/">
                        <Button>Return to Home</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <LoadingState message="Anchoring Order to Protocol..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 pb-32 max-w-4xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/cart">
                    <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={18} />}>
                        Back to Cart
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-primary-dark">Checkout</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4 text-primary-dark">
                            <MapPin size={20} />
                            <h3 className="font-bold text-lg">Delivery Address</h3>
                        </div>
                        <div className="space-y-4">
                            <Input label="Street Address" placeholder="123 Nile St" defaultValue="Zamalek, Cairo" />
                            <Input label="Apartment / Suite" placeholder="Apt 4B" defaultValue="Block 4 Sector 9" />
                            <Input label="Instructions" placeholder="Gate code, etc." />
                        </div>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4 text-primary-dark">
                            <CreditCard size={20} />
                            <h3 className="font-bold text-lg">Payment Method</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('CASH')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH'
                                        ? 'bg-primary-dark text-white border-primary-dark'
                                        : 'bg-white border-border-light hover:border-primary-dark text-text-secondary'
                                    }`}
                            >
                                <Wallet size={24} />
                                <span className="text-sm font-medium">Cash</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('DIGITAL')}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'DIGITAL'
                                        ? 'bg-primary-dark text-white border-primary-dark'
                                        : 'bg-white border-border-light hover:border-primary-dark text-text-secondary'
                                    }`}
                            >
                                <CreditCard size={24} />
                                <span className="text-sm font-medium">Card / Crypto</span>
                            </button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card className="bg-background-white">
                        <h3 className="font-bold text-lg text-primary-dark mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
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
                            <div className="flex justify-between font-bold text-xl text-primary-dark pt-2">
                                <span>Total</span>
                                <CurrencyDisplay amount={total} />
                            </div>
                        </div>
                    </Card>

                    {/* Trust Indicator */}
                    <div className="flex items-start gap-3 p-4 bg-success/5 rounded-lg border border-success/20">
                        <ShieldCheck className="text-success shrink-0" size={20} />
                        <p className="text-xs text-success/80 leading-relaxed">
                            Your order will be cryptographically secured on the NileLink Protocol.
                            Verified by distributed consensus.
                        </p>
                    </div>

                    <Button
                        onClick={handlePlaceOrder}
                        className="w-full h-14 text-lg"
                        rightIcon={<ArrowRight size={20} />}
                    >
                        Confirm Order
                    </Button>
                </div>
            </div>
        </div>
    );
}


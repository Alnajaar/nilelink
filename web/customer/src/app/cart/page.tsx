"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const dynamic = 'force-dynamic';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export default function CartPage() {
    const { cart, removeFromCart, cartTotal, clearCart } = useCustomer();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <EmptyState
                    icon={<ShoppingBag size={32} />}
                    title="Your cart is empty"
                    description="Looks like you haven't added any items yet."
                    action={{
                        label: "Browse Restaurants",
                        onClick: () => router.push('/')
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-4xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={18} />}>
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-primary-dark">Your Cart</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <Card key={item.id} className="flex items-center gap-4 p-4">
                            <div className="w-20 h-20 bg-primary-dark/5 rounded-lg flex items-center justify-center text-3xl">
                                🍔
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-primary-dark">{item.name}</h3>
                                <p className="text-sm text-text-secondary">{item.restaurantName}</p>
                                <div className="mt-1 font-mono text-sm">
                                    <CurrencyDisplay amount={item.price} /> x {item.quantity}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="font-bold text-primary-dark">
                                    <CurrencyDisplay amount={item.price * item.quantity} />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-error hover:bg-error/10"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    <div className="flex justify-end">
                        <Button variant="ghost" className="text-error" onClick={clearCart}>
                            Clear Cart
                        </Button>
                    </div>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-4 sticky top-24">
                        <h3 className="font-bold text-lg text-primary-dark border-b border-border-light pb-4">
                            Order Summary
                        </h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span>
                                <CurrencyDisplay amount={cartTotal} />
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>Network Fee</span>
                                <CurrencyDisplay amount={2.50} />
                            </div>
                        </div>

                        <div className="border-t border-border-light pt-4 flex justify-between font-bold text-xl text-primary-dark">
                            <span>Total</span>
                            <CurrencyDisplay amount={cartTotal + 2.50} />
                        </div>

                        <Link href="/checkout" className="block w-full">
                            <Button className="w-full justify-center py-6 text-lg" rightIcon={<ArrowRight size={20} />}>
                                Proceed to Checkout
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}

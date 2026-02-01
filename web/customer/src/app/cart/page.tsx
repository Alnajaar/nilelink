"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, ArrowRight, ShoppingBag, Plus, Minus, Gift, Zap } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { PremiumCard } from '@/components/shared/PremiumCard';



const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCustomer();
    const router = useRouter();

    const subtotal = cartTotal;
    const networkFee = 2.50;
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + networkFee + tax;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pt-24">
                <PremiumCard variant="elevated" className="text-center py-16 max-w-md">
                    <div className="text-6xl mb-6">🛒</div>
                    <h2 className="text-2xl font-black text-text-primary mb-3">Your cart is empty</h2>
                    <p className="text-text-secondary mb-8">
                        Explore our restaurants and add your favorite meals to get started.
                    </p>
                    <Link href="/" className="block">
                        <PremiumButton variant="primary" fullWidth icon={<ShoppingBag size={20} />}>
                            Browse Restaurants
                        </PremiumButton>
                    </Link>
                </PremiumCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-12"
                >
                    <Link href="/">
                        <PremiumButton variant="ghost" icon={<ArrowLeft size={20} />}>
                            Back
                        </PremiumButton>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-text-primary">Your Cart</h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {cart.map((cartItem, idx) => (
                                <motion.div key={cartItem.id} variants={item}>
                                    <PremiumCard variant="elevated">
                                        <div className="p-6 flex items-center gap-6">
                                            {/* Item Image */}
                                            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl flex-shrink-0">
                                                🍔
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-text-primary mb-1 truncate">{cartItem.name}</h3>
                                                <p className="text-sm text-text-secondary mb-3">{cartItem.restaurantName}</p>
                                                <p className="text-lg font-bold text-primary-600">
                                                    ${(cartItem.price * cartItem.quantity).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                                                <button
                                                    className="p-1 hover:bg-white rounded transition-colors"
                                                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold text-sm min-w-[2rem] text-center">
                                                    {cartItem.quantity}
                                                </span>
                                                <button
                                                    className="p-1 hover:bg-white rounded transition-colors"
                                                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Remove */}
                                            <PremiumButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart(cartItem.id)}
                                                className="text-error hover:bg-error/10"
                                            >
                                                <Trash2 size={18} />
                                            </PremiumButton>
                                        </div>
                                    </PremiumCard>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Clear Cart */}
                        <div className="flex justify-end">
                            <PremiumButton
                                variant="ghost"
                                size="sm"
                                onClick={clearCart}
                                className="text-error"
                            >
                                Clear All Items
                            </PremiumButton>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PremiumCard variant="premium" className="sticky top-24 p-6 space-y-6">
                            <h3 className="text-xl font-bold text-text-primary border-b border-gray-200 pb-4">
                                Order Summary
                            </h3>

                            {/* Pricing Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm text-text-secondary">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-text-secondary">
                                    <span>Tax</span>
                                    <span className="font-semibold">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-text-secondary">
                                    <span>Network Fee</span>
                                    <span className="font-semibold">${networkFee.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Promos */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200 mb-3">
                                    <Gift size={18} className="text-primary-600" />
                                    <input
                                        type="text"
                                        placeholder="Promo code"
                                        className="bg-transparent text-sm focus:outline-none w-full text-text-primary"
                                    />
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-text-primary">Total</span>
                                    <span className="text-2xl font-black text-primary-600">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>

                                <Link href="/checkout" className="block w-full">
                                    <PremiumButton
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        icon={<ArrowRight size={20} />}
                                    >
                                        Proceed to Checkout
                                    </PremiumButton>
                                </Link>

                                {/* Trust Badges */}
                                <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200 text-xs text-text-tertiary">
                                    <span>🔒 Secure Payment</span>
                                    <span>📍 Real-time Tracking</span>
                                </div>
                            </div>
                        </PremiumCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    motion

    , AnimatePresence
} from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart,
    ArrowRight, Check, AlertTriangle, BarChart3, Clock
} from 'lucide-react';

import { Button } from '@/shared/components/Button';

export const dynamic = 'force-dynamic';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';

function TradeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [action, setAction] = useState<'buy' | 'sell'>(
        (searchParams.get('action') as 'buy' | 'sell') || 'buy'
    );
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [quantity, setQuantity] = useState<number>(10);
    const [limitPrice, setLimitPrice] = useState<number>(125.50);
    const [orderSubmitted, setOrderSubmitted] = useState(false);

    const restaurant = {
        id: 'rest-001',
        name: 'Cairo Grill Prime',
        sharePrice: 125.50,
        priceChange24h: 5.2,
        askPrice: 125.60,
        bidPrice: 125.40
    };

    const totalCost = orderType === 'market'
        ? quantity * restaurant.sharePrice
        : quantity * limitPrice;

    const handleSubmitOrder = () => {
        setOrderSubmitted(true);
        setTimeout(() => {
            router.push('/portfolio');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-surface px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-text mb-2">Trading Terminal</h1>
                            <p className="text-text opacity-70">Execute trades with zero fees and instant settlement</p>
                        </div>
                        <Button
                            onClick={() => router.push('/marketplace')}
                            variant="outline"
                            className="h-12 px-6 rounded-xl font-bold"
                        >
                            Back to Marketplace
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Trading Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 bg-white border border-surface">
                            {/* Action Selector */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setAction('buy')}
                                    className={`flex-1 p-4 rounded-xl font-black uppercase tracking-widest transition-all ${action === 'buy'
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                        }`}
                                >
                                    <TrendingUp size={20} className="mx-auto mb-2" />
                                    Buy Shares
                                </button>
                                <button
                                    onClick={() => setAction('sell')}
                                    className={`flex-1 p-4 rounded-xl font-black uppercase tracking-widest transition-all ${action === 'sell'
                                            ? 'bg-text text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                        }`}
                                >
                                    <TrendingDown size={20} className="mx-auto mb-2" />
                                    Sell Shares
                                </button>
                            </div>

                            {/* Restaurant Info */}
                            <div className="p-4 bg-surface/30 rounded-xl mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-text">{restaurant.name}</h3>
                                        <p className="text-sm text-text opacity-70">Current Market Price</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-mono font-black text-primary">
                                            ${restaurant.sharePrice}
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                            +{restaurant.priceChange24h}% today
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-text mb-3">Order Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setOrderType('market')}
                                        className={`p-4 rounded-xl font-bold transition-all border-2 ${orderType === 'market'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-surface bg-surface text-text'
                                            }`}
                                    >
                                        <p className="font-black mb-1">Market Order</p>
                                        <p className="text-xs opacity-70">Execute immediately at current price</p>
                                    </button>
                                    <button
                                        onClick={() => setOrderType('limit')}
                                        className={`p-4 rounded-xl font-bold transition-all border-2 ${orderType === 'limit'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-surface bg-surface text-text'
                                            }`}
                                    >
                                        <p className="font-black mb-1">Limit Order</p>
                                        <p className="text-xs opacity-70">Set your desired price</p>
                                    </button>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-text mb-3">Number of Shares</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full h-14 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-2xl font-mono font-black text-text"
                                />
                                <div className="flex gap-2 mt-3">
                                    {[10, 25, 50, 100].map((qty) => (
                                        <button
                                            key={qty}
                                            onClick={() => setQuantity(qty)}
                                            className="px-4 py-2 bg-surface hover:bg-surface/70 rounded-lg text-sm font-bold text-text transition-colors"
                                        >
                                            {qty}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Limit Price (if limit order) */}
                            {orderType === 'limit' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-text mb-3">Limit Price (per share)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={limitPrice}
                                        onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full h-14 px-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-2xl font-mono font-black text-text"
                                    />
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="p-6 bg-primary/5 rounded-xl mb-6 border-2 border-primary/20">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text font-medium">Shares</span>
                                        <span className="text-text font-mono font-bold">{quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text font-medium">Price per share</span>
                                        <span className="text-text font-mono font-bold">
                                            ${orderType === 'market' ? restaurant.sharePrice : limitPrice}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text font-medium">Trading Fee</span>
                                        <span className="text-primary font-bold">$0.00</span>
                                    </div>
                                    <div className="h-px bg-primary/20" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-text">Total</span>
                                        <span className="text-3xl font-mono font-black text-primary">
                                            ${totalCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmitOrder}
                                disabled={orderSubmitted}
                                className="w-full bg-primary hover:opacity-90 text-background h-14 rounded-xl font-black uppercase tracking-widest text-lg"
                            >
                                {orderSubmitted ? (
                                    <>
                                        <Check size={24} className="mr-2" />
                                        Order Executed!
                                    </>
                                ) : (
                                    <>
                                        {action === 'buy' ? <ShoppingCart size={24} className="mr-2" /> : <DollarSign size={24} className="mr-2" />}
                                        {action === 'buy' ? 'Buy' : 'Sell'} {quantity} Shares
                                    </>
                                )}
                            </Button>

                            {orderSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-primary/10 border border-primary rounded-xl flex items-center gap-3"
                                >
                                    <Check size={20} className="text-primary" />
                                    <div>
                                        <p className="font-bold text-primary">Trade Executed Successfully!</p>
                                        <p className="text-sm text-text">Redirecting to your portfolio...</p>
                                    </div>
                                </motion.div>
                            )}
                        </Card>
                    </div>

                    {/* Order Book & Market Data */}
                    <div className="space-y-6">
                        {/* Live Price */}
                        <Card className="p-6 bg-white border border-surface">
                            <h3 className="text-lg font-black text-text mb-4">Live Market Data</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                                    <span className="text-sm font-medium text-text">Ask (Sell)</span>
                                    <span className="text-xl font-mono font-black text-primary">
                                        ${restaurant.askPrice}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                    <span className="text-sm font-medium text-text">Bid (Buy)</span>
                                    <span className="text-xl font-mono font-black text-text">
                                        ${restaurant.bidPrice}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                    <span className="text-sm font-medium text-text">Spread</span>
                                    <span className="text-sm font-mono font-bold text-text">
                                        ${(restaurant.askPrice - restaurant.bidPrice).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Order Book */}
                        <Card className="p-6 bg-white border border-surface">
                            <h3 className="text-lg font-black text-text mb-4">Order Book</h3>
                            <div className="space-y-2">
                                {[
                                    { price: 125.65, qty: 150, type: 'sell' },
                                    { price: 125.60, qty: 280, type: 'sell' },
                                    { price: 125.55, qty: 420, type: 'sell' },
                                    { price: 125.40, qty: 380, type: 'buy' },
                                    { price: 125.35, qty: 520, type: 'buy' },
                                    { price: 125.30, qty: 210, type: 'buy' }
                                ].map((order, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-2 rounded ${order.type === 'sell' ? 'bg-text/5' : 'bg-primary/5'
                                            }`}
                                    >
                                        <span className={`text-sm font-mono font-bold ${order.type === 'sell' ? 'text-text' : 'text-primary'
                                            }`}>
                                            ${order.price}
                                        </span>
                                        <span className="text-xs text-text opacity-70">
                                            {order.qty} shares
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Instant Settlement */}
                        <Card className="p-6 bg-primary text-background">
                            <div className="flex items-center gap-3 mb-3">
                                <Clock size={24} />
                                <h3 className="text-lg font-black">Instant Settlement</h3>
                            </div>
                            <p className="text-sm opacity-90">
                                All trades settle immediately on blockchain. No T+2 waiting period.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
            <TradeContent />
        </Suspense>
    );
}

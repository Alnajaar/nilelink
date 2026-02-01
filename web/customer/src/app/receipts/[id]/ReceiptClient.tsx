"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Share2, ShieldCheck, Download, Star, MessageSquare } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { LedgerBadge } from '@shared/components/LedgerBadge';
import { CurrencyDisplay } from '@shared/components/CurrencyDisplay';
import { orderApi, ApiError } from '@shared/utils/api';

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    deliveryAddress: string;
    specialInstructions?: string;
    paymentMethod: string;
    createdAt: string;
    restaurant: {
        name: string;
        address?: string;
    };
    items: Array<{
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        specialInstructions?: string;
        menuItem: {
            name: string;
        };
    }>;
    payments: Array<{
        method: string;
        status: string;
    }>;
}

export default function ReceiptClient({ id }: { id: string }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const response = await orderApi.getById(id) as { order: Order };
                setOrder(response.order);
            } catch (err) {
                console.error('Failed to fetch order:', err);
                if (err instanceof ApiError) {
                    setError(err.message);
                } else {
                    setError('Failed to load receipt details');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const handleSubmitReview = async () => {
        if (!rating) return;

        setIsSubmittingReview(true);
        try {
            await orderApi.addReview(id, {
                rating,
                comment: reviewText || undefined
            });
            setShowReview(false);
            alert('Thank you for your review!');
        } catch (err) {
            console.error('Failed to submit review:', err);
            if (err instanceof ApiError) {
                alert(err.message || 'Failed to submit review. Please try again.');
            } else {
                alert('Failed to submit review. Please try again.');
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-3xl mx-auto pb-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading receipt...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-3xl mx-auto pb-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-error" />
                    </div>
                    <h2 className="text-xl font-bold text-primary-dark mb-2">Receipt Not Found</h2>
                    <p className="text-text-secondary mb-6">{error || 'We could not find your receipt.'}</p>
                    <Link href="/history">
                        <Button>Return to History</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-3xl mx-auto pb-32">
            <header className="flex items-center justify-between mb-8">
                <Link href="/history">
                    <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={18} />}>
                        Back to Orders
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Share2 size={18} />}>Share</Button>
                    <Button variant="outline" size="sm" leftIcon={<Printer size={18} />}>Print</Button>
                </div>
            </header>

            <Card className="p-8 md:p-12 print:shadow-none print:border-none">
                {/* Receipt Header */}
                <div className="text-center border-b-2 border-dashed border-black/10 pb-8 mb-8">
                    <div className="w-16 h-16 bg-primary-dark text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-black italic">
                        NL
                    </div>
                    <h1 className="text-2xl font-bold text-primary-dark mb-1">NileLink Receipt</h1>
                    <p className="text-sm text-text-secondary mb-4">Official Protocol Record</p>

                    <div className="flex justify-center">
                        <LedgerBadge verified={true} hash={`0x${id}...`} />
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                        <p className="text-text-secondary mb-1">Merchant</p>
                        <p className="font-bold text-primary-dark">{order.restaurant.name}</p>
                        <p className="text-xs text-text-secondary">{order.restaurant.address || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-text-secondary mb-1">Date</p>
                        <p className="font-bold text-primary-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-text-secondary">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary mb-1">Order ID</p>
                        <p className="font-mono font-bold text-primary-dark">#{order.id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-text-secondary mb-1">Payment Method</p>
                        <p className="font-bold text-primary-dark">{order.paymentMethod}</p>
                        <p className="text-xs text-text-secondary">{order.payments[0]?.status || 'N/A'}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead className="border-b border-black/10">
                            <tr>
                                <th className="text-left py-2 font-medium text-text-secondary">Item</th>
                                <th className="text-center py-2 font-medium text-text-secondary">Qty</th>
                                <th className="text-right py-2 font-medium text-text-secondary">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3 text-primary-dark">
                                        {item.menuItem.name}
                                        {item.specialInstructions && (
                                            <p className="text-xs text-text-secondary mt-1 italic">
                                                Note: {item.specialInstructions}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-3 text-center text-primary-dark">{item.quantity}</td>
                                    <td className="py-3 text-right font-mono">
                                        <CurrencyDisplay amount={item.totalPrice} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-black/10 pt-4 mb-8">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="font-mono">
                            <CurrencyDisplay amount={order.items.reduce((sum, item) => sum + item.totalPrice, 0)} />
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Delivery Fee</span>
                        <span className="font-mono"><CurrencyDisplay amount={2.50} /></span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary-dark pt-2 mt-2 border-t border-black/10">
                        <span>Total</span>
                        <span className="font-mono"><CurrencyDisplay amount={order.totalAmount} /></span>
                    </div>
                </div>

                {/* Verification Footer */}
                <div className="bg-black/5 p-4 rounded-lg flex items-start gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-primary-dark uppercase tracking-wider mb-1">Cryptographically Verified</p>
                        <p className="text-[10px] text-text-secondary font-mono break-all leading-tight">
                            0x7d5a...3f9c
                        </p>
                    </div>
                </div>
            </Card>

            <div className="mt-8 text-center">
                <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>Download PDF</Button>
            </div>

            {/* Review Section */}
            {order.status === 'DELIVERED' && (
                <div className="mt-8">
                    {!showReview ? (
                        <Card className="p-6 bg-primary/5 border-primary/20">
                            <div className="text-center">
                                <h3 className="font-bold text-primary-dark mb-2">How was your experience?</h3>
                                <p className="text-text-secondary text-sm mb-4">
                                    Help others by sharing your feedback about {order.restaurant.name}
                                </p>
                                <Button
                                    onClick={() => setShowReview(true)}
                                    variant="outline"
                                    leftIcon={<Star size={16} />}
                                >
                                    Write a Review
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-primary-dark flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    Write a Review
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowReview(false)}
                                >
                                    Cancel
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-primary-dark mb-3">
                                        Rating *
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="p-1"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`${star <= rating
                                                            ? 'text-warning fill-current'
                                                            : 'text-text-secondary'
                                                        } transition-colors`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-primary-dark mb-3">
                                        Your Review (Optional)
                                    </label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell others about your experience..."
                                        className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        rows={4}
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-text-secondary mt-1">
                                        {reviewText.length}/500 characters
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReview(false)}
                                        disabled={isSubmittingReview}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={!rating || isSubmittingReview}
                                    >
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

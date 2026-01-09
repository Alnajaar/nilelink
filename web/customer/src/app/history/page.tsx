"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ShieldCheck,
    History,
    ChevronRight,
    Star,
    ExternalLink,
    Store,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { orderApi, ApiError } from '@/shared/utils/api';

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    restaurant: {
        name: string;
    };
    items: Array<{
        quantity: number;
    }>;
}

export default function HistoryPage() {
    // ... items state remains same
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await orderApi.list() as { orders: Order[] };
                setOrders(response.orders);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                if (err instanceof ApiError) {
                    setError(err.message);
                } else {
                    setError('Failed to load order history');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusDisplay = (status: string) => {
        const statusMap = {
            'DELIVERED': { variant: 'success' as const, showIcon: true },
            'CANCELLED': { variant: 'error' as const, showIcon: false },
            'REFUNDED': { variant: 'warning' as const, showIcon: false },
            'default': { variant: 'info' as const, showIcon: true }
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.default;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto pb-32 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-secondary">Loading your order history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto pb-32 flex items-center justify-center">
                <div className="text-center">
                    <History size={64} className="text-error mb-4" />
                    <h2 className="text-xl font-bold text-primary-dark mb-2">Failed to Load History</h2>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto pb-32">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="bg-white border border-border-subtle rounded-xl h-10 w-10 p-0">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tight">Order History</h1>
                        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Your trusted transaction records</p>
                    </div>
                </header>

                <main className="space-y-6">
                    {orders.map((order) => {
                        const statusInfo = getStatusDisplay(order.status);
                        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                        return (
                            <div key={order.id} className="bg-white rounded-[24px] border border-border-subtle p-6 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Store size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-text-main">{order.restaurant.name}</h3>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                                {formatDate(order.createdAt)} • {itemCount} items
                                            </p>
                                        </div>
                                    </div>
                                    <CurrencyDisplay amount={order.totalAmount} className="text-lg font-bold" />
                                </div>

                                <div className="h-px bg-border-subtle w-full mb-4" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusInfo.variant}>
                                            {statusInfo.showIcon && <ShieldCheck size={12} className="mr-1" />}
                                            {order.status}
                                        </Badge>
                                        <span className="text-[10px] font-mono text-text-muted opacity-50">#{order.id.slice(-8)}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/receipts/${order.id}`}>
                                            <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 font-bold text-[10px] uppercase">
                                                Receipt
                                            </Button>
                                        </Link>
                                        <Button size="sm" className="rounded-xl h-8 px-3 font-bold text-[10px] uppercase bg-primary/10 text-primary hover:bg-primary hover:text-white">
                                            Reorder
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {orders.length === 0 && (
                        <div className="py-20 text-center opacity-50 flex flex-col items-center gap-4">
                            <History size={64} className="text-text-muted" strokeWidth={1} />
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted">No orders found</p>
                            <p className="text-text-secondary text-sm">Your order history will appear here</p>
                        </div>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}

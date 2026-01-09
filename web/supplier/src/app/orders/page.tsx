"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Clock, DollarSign, CheckCircle, XCircle,
    AlertTriangle, Truck, Edit, Search, Filter,
    MapPin, User, ChevronRight, Bell
} from 'lucide-react';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useNotification } from '@/shared/contexts/NotificationContext';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface PurchaseOrder {
    id: string;
    restaurant: string;
    restaurantId: string;
    items: Array<{
        sku: string;
        name: string;
        quantity: number;
        unit: string;
        price: number;
    }>;
    total: number;
    status: OrderStatus;
    paymentType: 'cash' | 'credit';
    deliveryDeadline: string;
    createdAt: string;
}

export default function AdvancedOrdersPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { notify } = useNotification();

    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState<PurchaseOrder[]>([
        {
            id: 'PO-001',
            restaurant: 'Cairo Grill',
            restaurantId: 'RES-001',
            items: [
                { sku: 'TOM-001', name: 'Roma Tomatoes', quantity: 50, unit: 'kg', price: 2.50 },
                { sku: 'ONI-002', name: 'Yellow Onions', quantity: 30, unit: 'kg', price: 1.80 },
                { sku: 'CHI-003', name: 'Chicken Breast', quantity: 40, unit: 'kg', price: 8.50 }
            ],
            total: 571.00,
            status: 'pending',
            paymentType: 'credit',
            deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
            id: 'PO-002',
            restaurant: 'Nile Bistro',
            restaurantId: 'RES-002',
            items: [
                { sku: 'RIC-004', name: 'Basmati Rice', quantity: 100, unit: 'kg', price: 3.20 },
                { sku: 'OIL-005', name: 'Olive Oil', quantity: 20, unit: 'L', price: 12.00 }
            ],
            total: 560.00,
            status: 'confirmed',
            paymentType: 'cash',
            deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
            id: 'PO-003',
            restaurant: 'Delta Kitchen',
            restaurantId: 'RES-003',
            items: [
                { sku: 'POT-006', name: 'Potatoes', quantity: 80, unit: 'kg', price: 1.50 },
                { sku: 'CAR-007', name: 'Carrots', quantity: 40, unit: 'kg', price: 1.80 }
            ],
            total: 192.00,
            status: 'shipped',
            paymentType: 'credit',
            deliveryDeadline: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
        }
    ]);

    const handleAcceptOrder = (orderId: string) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: 'confirmed' as OrderStatus } : o
        ));
        notify({
            type: 'success',
            title: 'Order Confirmed',
            message: `${orderId} has been accepted`
        });
    };

    const handleRejectOrder = (orderId: string) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
        ));
        notify({
            type: 'info',
            title: 'Order Rejected',
            message: `${orderId} has been cancelled`
        });
    };

    const handleMarkShipped = (orderId: string) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: 'shipped' as OrderStatus } : o
        ));
        notify({
            type: 'success',
            title: 'Order Shipped',
            message: `${orderId} is en route`
        });
    };

    const handleMarkDelivered = (orderId: string) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: 'delivered' as OrderStatus } : o
        ));
        notify({
            type: 'success',
            title: 'Order Delivered',
            message: `${orderId} successfully delivered`
        });
    };

    const getStatusColor = (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
            pending: 'bg-text/10 text-text',
            confirmed: 'bg-primary/10 text-primary',
            shipped: 'bg-primary/10 text-primary',
            delivered: 'bg-primary text-background',
            cancelled: 'bg-text/10 text-text'
        };
        return colors[status];
    };

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getTimeRemaining = (deadline: string) => {
        const diff = new Date(deadline).getTime() - Date.now();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours < 0) return 'Overdue!';
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-white border-b border-surface px-6 py-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-text">Purchase Orders</h1>
                                <p className="text-sm text-text opacity-70">Manage restaurant requests and fulfillment</p>
                            </div>
                            <Button onClick={() => router.push('/dashboard')} variant="outline" className="h-12">
                                Dashboard
                            </Button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text opacity-30" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID or restaurant..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-surface rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-text font-medium placeholder:text-text placeholder:opacity-30"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === status
                                            ? 'bg-primary text-background'
                                            : 'bg-surface text-text hover:bg-surface/70'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Orders Grid */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredOrders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <Card className="p-6 bg-white border border-surface hover:shadow-lg transition-shadow">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-black text-text">{order.id}</h3>
                                                    <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-text opacity-70">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} />
                                                        <span className="font-medium">{order.restaurant}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        <span>{formatTime(order.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle size={14} className={getTimeRemaining(order.deliveryDeadline).includes('Overdue') ? 'text-text' : ''} />
                                                        <span>Due in {getTimeRemaining(order.deliveryDeadline)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-mono font-black text-primary mb-1">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-text opacity-50 uppercase tracking-widest font-bold">
                                                    {order.paymentType}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-text opacity-50 uppercase tracking-widest mb-2">
                                                Items ({order.items.length})
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                                                        <div>
                                                            <p className="text-sm font-bold text-text">{item.name}</p>
                                                            <p className="text-xs text-text opacity-50">{item.sku}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-mono font-bold text-text">
                                                                {item.quantity} {item.unit}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleRejectOrder(order.id)}
                                                        variant="outline"
                                                        className="flex-1 h-12 rounded-xl font-bold"
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleAcceptOrder(order.id)}
                                                        className="flex-[2] bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                                                    >
                                                        <CheckCircle size={18} className="mr-2" />
                                                        Accept Order
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <Button
                                                    onClick={() => handleMarkShipped(order.id)}
                                                    className="w-full bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                                                >
                                                    <Truck size={18} className="mr-2" />
                                                    Mark as Shipped
                                                </Button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <Button
                                                    onClick={() => handleMarkDelivered(order.id)}
                                                    className="w-full bg-primary hover:opacity-90 text-background h-12 rounded-xl font-black uppercase tracking-widest"
                                                >
                                                    <CheckCircle size={18} className="mr-2" />
                                                    Confirm Delivery
                                                </Button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <div className="w-full flex items-center justify-center gap-2 text-primary">
                                                    <CheckCircle size={20} />
                                                    <span className="font-bold">Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="h-96 flex flex-col items-center justify-center text-center opacity-30">
                            <Package size={64} className="text-text mb-4" />
                            <p className="text-lg font-bold text-text">No orders found</p>
                            <p className="text-sm text-text mt-2">Try adjusting your filters or search query</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

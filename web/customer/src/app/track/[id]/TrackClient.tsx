"use client";

import React, { useState, useEffect } from 'react';
import { joinRoom, SocketEvents } from '@shared/utils/socket';
import { useSocketEvent } from '@shared/hooks/useSocket';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, Package, ShieldCheck, ChevronRight, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { CurrencyDisplay } from '@shared/components/CurrencyDisplay';
import Link from 'next/link';
import { orderApi, ApiError } from '@shared/utils/api';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@shared/components/NetworkMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-white/20 italic">Initializing Satellite Array...</div>
});

// Simulate GPS coordinates
function useSimulatedGPS(orderId: string, status: string) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (status === 'DELIVERED') {
            setProgress(100);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => (prev >= 95 ? 95 : prev + 0.3));
        }, 200);
        return () => clearInterval(interval);
    }, [orderId, status]);

    return progress;
}

interface Order {
    id: string;
    status: string;
    totalAmount: number;
    deliveryAddress: string;
    createdAt: string;
    items: Array<{
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        menuItem: {
            name: string;
        };
    }>;
}

export default function TrackClient({ id }: { id: string }) {
    const orderId = id;
    const [order, setOrder] = useState<Order | null>(null);
    const [orderStatus, setOrderStatus] = useState('PENDING');
    const [estimatedTime, setEstimatedTime] = useState('15 mins');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const driverProgress = useSimulatedGPS(orderId, orderStatus);

    // Fetch order details on mount
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const response = await orderApi.getById(orderId) as { order: Order };
                setOrder(response.order);
                setOrderStatus(response.order.status);
            } catch (err) {
                console.error('Failed to fetch order:', err);
                if (err instanceof ApiError) {
                    setError(err.message);
                } else {
                    setError('Failed to load order details');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    // Join order room
    useEffect(() => {
        if (orderId) {
            joinRoom(`order_${orderId}`);
        }
    }, [orderId]);

    // Socket listeners
    useSocketEvent(SocketEvents.ORDER_UPDATED, (updatedOrder: any) => {
        if (updatedOrder.id === orderId) {
            setOrderStatus(updatedOrder.status);
            setOrder(prev => prev ? { ...prev, status: updatedOrder.status } : null);
        }
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background pb-20">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold text-primary-dark mb-2">Loading Order...</h2>
                <p className="text-text-secondary">Please wait while we fetch your order details</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background pb-20 p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-error" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-dark mb-2">Order Not Found</h2>
                    <p className="text-text-secondary mb-6">{error || 'We could not find your order details.'}</p>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusDisplay = (status: string) => {
        const statusMap = {
            'PENDING': { label: 'Order Placed', color: 'warning' },
            'CONFIRMED': { label: 'Order Confirmed', color: 'info' },
            'PREPARING': { label: 'Preparing', color: 'info' },
            'READY': { label: 'Ready for Pickup', color: 'success' },
            'IN_DELIVERY': { label: 'Out for Delivery', color: 'success' },
            'DELIVERED': { label: 'Delivered', color: 'success' },
            'CANCELLED': { label: 'Cancelled', color: 'error' }
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, color: 'secondary' };
    };

    const statusInfo = getStatusDisplay(orderStatus);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border-light p-4">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-primary-dark">Track Order</h1>
                        <p className="text-sm text-text-secondary">Order #{order.id.slice(-8)}</p>
                    </div>
                </div>
            </div>

            {/* High-Fidelity Tactical Map */}
            <div className="relative h-[60vh] bg-[#0f172a] overflow-hidden">
                <Map
                    locations={[
                        { id: 'dest', name: 'Your Location', latitude: 30.0444, longitude: 31.2357, color: '#3b82f6', type: 'destination' },
                        {
                            id: 'driver',
                            name: 'Karim (Driver)',
                            latitude: 30.0444 - (0.01 * (1 - driverProgress / 100)),
                            longitude: 31.2357 - (0.01 * (1 - driverProgress / 100)),
                            color: '#10b981',
                            type: 'in_transit'
                        }
                    ]}
                    center={[30.0444, 31.2357]}
                    zoom={15}
                    height="100%"
                    className="z-0"
                />

                {/* Neural Pulse Status Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pt-16 md:pt-4 z-10 pointer-events-none">
                    <div className="flex flex-col gap-2">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Satellite Active</span>
                        </div>
                        {orderStatus === 'PREPARING' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Kitchen Execution</span>
                            </motion.div>
                        )}
                    </div>

                    <div className="bg-black/60 backdrop-blur-2xl border border-white/5 p-3 rounded-2xl shadow-2xl pointer-events-auto">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">ETA</div>
                        <div className="text-xl font-black text-white">{estimatedTime}</div>
                    </div>
                </div>

                {/* Glass Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 w-full animate-scanline opacity-30 z-20" />
            </div>

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 w-full bg-background rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-40 transform transition-transform max-h-[70vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={statusInfo.color as any} className="text-xs">
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Clock size={16} />
                            <span className="text-sm">Order placed {new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <CurrencyDisplay amount={order.totalAmount} className="text-xl font-bold" />
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h4 className="font-bold text-primary-dark mb-3">Order Items</h4>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                                        {item.quantity}x
                                    </div>
                                    <span className="font-medium text-primary-dark">{item.menuItem.name}</span>
                                </div>
                                <CurrencyDisplay amount={item.totalPrice} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-6 p-4 bg-primary/5 rounded-xl">
                    <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-primary mt-0.5" />
                        <div>
                            <h4 className="font-bold text-primary-dark mb-1">Delivery Address</h4>
                            <p className="text-sm text-text-secondary">{order.deliveryAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Driver Card - Only show if in delivery */}
                {orderStatus === 'IN_DELIVERY' && (
                    <Card className="p-4 bg-background-subtle border-transparent mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-lg font-black text-primary shadow-sm">
                            KD
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-text-main">Karim (Driver)</h4>
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                                <ShieldCheck size={12} className="text-success" />
                                Verified • 4.9 <Star size={10} fill="currentColor" className="text-warning" />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0 bg-white border-border-subtle">
                            <Phone size={18} />
                        </Button>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs"
                        onClick={() => {/* TODO: Show order details modal */ }}
                    >
                        Order Details
                    </Button>
                    <Button className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        Share Link
                    </Button>
                </div>
            </div>
        </div>
    );
}

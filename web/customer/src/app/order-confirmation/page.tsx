'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Phone, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { orderApi } from '@shared/utils/api';
import { useSocket } from '@shared/contexts/SocketContext';
import Link from 'next/link';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const { socket } = useSocket();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            // router.push('/'); // Don't redirect immediately to allow UI to show empty state/loading
            // return;
        }

        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                // Using generic api.get since orderApi.getById wasn't explicitly typed yet
                // But we implemented GET /api/orders/:id in backend
                const response: any = await orderApi.getById(orderId);
                setOrder(response);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
        else setLoading(false);
    }, [orderId, router]);

    // Socket listener for updates
    useEffect(() => {
        if (!socket || !orderId) return;

        const handleUpdate = (updatedOrder: any) => {
            if (updatedOrder.id === orderId) {
                console.log('Order updated:', updatedOrder);
                setOrder(updatedOrder);
            }
        };

        // Join the specific order room if backend supports it or generic listener
        // In orders.ts we emit to `order_${order.id}`
        socket.emit('joinOrder', orderId); // Assuming backend logic handles joining rooms via event, OR we just listen globally if client joins automatically
        // Actually, backend usually handles joins.
        // If our backend doesn't have 'joinOrder' event handler, we might rely on the user.id room or just listen to 'order:updated'
        // and filter by ID.

        socket.on('order:updated', handleUpdate);

        return () => {
            socket.off('order:updated', handleUpdate);
        };
    }, [socket, orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-pulse">Loading Order...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Order not found
            </div>
        );
    }

    const steps = ['PENDING', 'APPROVED', 'PREPARING', 'READY', 'COMPLETED'];
    const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);

    // Handle rejected/cancelled
    const isFailed = ['REJECTED', 'CANCELLED'].includes(order.status);

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Order Received!</h1>
                    <p className="text-slate-400">Order #{order.id.slice(-6)} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-6">
                {/* Status Tracker */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Order Status</h2>

                    {isFailed ? (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-500 text-center font-bold">
                            Order has been {order.status.toLowerCase()}.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between relative">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-10" />

                                {steps.slice(0, 4).map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isActive = index === currentStepIndex;

                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'bg-slate-900 border-slate-700 text-slate-500'
                                                }`}>
                                                {isCompleted && <CheckCircle className="w-4 h-4" />}
                                                {isActive && !isCompleted && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                            </div>
                                            <span className={`text-xs font-bold uppercase transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-600'
                                                }`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <div>
                                    <div className="text-sm font-bold text-blue-400">Estimated Delivery</div>
                                    <div className="text-white">35 - 45 mins</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Your Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-sm font-bold text-white">
                                        {item.quantity}x
                                    </div>
                                    <span className="text-slate-300">{item.menuItem?.name || 'Item'}</span>
                                </div>
                                <span className="text-white font-mono">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center">
                            <span className="text-slate-400">Total</span>
                            <span className="text-xl font-bold text-white">${Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <Link href="/restaurants" className="block w-full text-center py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition">
                    Browse More Restaurants
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}

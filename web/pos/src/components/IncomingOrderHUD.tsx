'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBag, ArrowRight, X, CheckCircle2, Clock } from 'lucide-react';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import { SocketEvents, joinRoom } from '@/shared/utils/socket';
import { usePOS } from '@/contexts/POSContext';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { Badge } from '@/shared/components/Badge';

export function IncomingOrderHUD() {
    const { branchId, restaurant } = usePOS();
    const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
    const [showAlert, setShowAlert] = useState(false);

    // Join the restaurant-specific room for real-time updates
    useEffect(() => {
        if (restaurant?.id) {
            joinRoom(`restaurant_${restaurant.id}`);
        }
    }, [restaurant?.id]);

    // Listen for new orders
    useSocketEvent(SocketEvents.ORDER_CREATED, (order) => {
        setIncomingOrders(prev => {
            // Check if order already exists
            if (prev.find(o => o.id === order.id)) return prev;
            return [order, ...prev];
        });
        setShowAlert(true);
        // Play notification sound
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play();
        } catch (e) { }
    });

    // Listen for order updates (e.g. status changes from PAID)
    useSocketEvent(SocketEvents.ORDER_UPDATED, (updatedOrder) => {
        setIncomingOrders(prev => {
            const index = prev.findIndex(o => o.id === updatedOrder.id);
            if (index !== -1) {
                const newOrders = [...prev];
                newOrders[index] = updatedOrder;
                return newOrders;
            }
            // If it's a PAID order that wasn't in list (maybe skipped order:new?), add it
            if (updatedOrder.paymentStatus === 'PAID') {
                return [updatedOrder, ...prev];
            }
            return prev;
        });
    });

    const removeOrder = (orderId: string) => {
        setIncomingOrders(prev => prev.filter(o => o.id !== orderId));
        if (incomingOrders.length <= 1) setShowAlert(false);
    };

    if (incomingOrders.length === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 max-w-sm w-full">
            <AnimatePresence>
                {incomingOrders.map((order, index) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="bg-white border border-primary/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group"
                    >
                        {/* Animated Pulse Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background shadow-lg shadow-primary/20">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-text-primary uppercase tracking-tighter text-lg italic">New Order</h4>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                                        ID: #{order.id.slice(-6)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeOrder(order.id)}
                                className="p-2 hover:bg-neutral rounded-xl transition-colors text-text-muted"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4 relative z-10">
                            <div className="flex items-center justify-between p-4 bg-neutral/50 rounded-2xl border border-border-subtle">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40">Settlement Total</span>
                                    <span className="font-black text-text-primary text-xl italic tracking-tighter">
                                        ${Number(order.totalAmount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <Badge className={`${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-[8px] font-black uppercase tracking-widest px-3 py-1`}>
                                        {order.paymentStatus}
                                    </Badge>
                                    <Badge className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1">
                                        {order.paymentMethod}
                                    </Badge>
                                </div>
                            </div>

                            <button
                                className="w-full py-4 bg-primary text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center gap-3 group/btn"
                            >
                                Accept & Transfer to Kitchen
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

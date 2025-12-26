"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SocketEvents } from '@/shared/utils/socket';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import {
    Wallet,
    Bike,
    Car,
    Navigation,
    MapPin,
    Clock,
    AlertTriangle,
    TrendingUp,
    Battery,
    Wifi,
    WifiOff,
    Target,
    Award,
    Gauge,
    Eye,
    MessageSquare,
    Star,
    Timer,
    Phone,
    Camera,
    Power,
    Bell,
    Package
} from 'lucide-react';
import { useNetworkStatus } from '@/components/shared/hooks/useNetworkStatus';

export default function DriverHome() {
    const { user } = useAuth();
    const status = useNetworkStatus();
    const isOnline = status === 'online';
    const [isDriverActive, setIsDriverActive] = useState(true);
    const [currentLocation, setCurrentLocation] = useState("Zamalek District");
    const [batteryLevel, setBatteryLevel] = useState(87);
    const [networkStrength, setNetworkStrength] = useState(4);
    const [activeDeliveries, setActiveDeliveries] = useState(3);
    const [todayEarnings, setTodayEarnings] = useState(245.50);
    const [cashInHand, setCashInHand] = useState(89.75);
    const [newOrderNotification, setNewOrderNotification] = useState<any>(null);
    const [performance, setPerformance] = useState({
        rating: 4.9,
        deliveries: 47,
        onTimeRate: 98,
        customerSatisfaction: 96
    });

    // Listen for orders ready for pickup (REAL-TIME DISPATCH NOTIFICATION)
    useSocketEvent(SocketEvents.ORDER_UPDATED, (order: any) => {
        if (order.status === 'READY' && isDriverActive) {
            setNewOrderNotification(order);
            // Play notification sound
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => { });
            } catch (e) { }
            // Auto-clear after 10s
            setTimeout(() => setNewOrderNotification(null), 10000);
        }
    }, [isDriverActive]);

    return (
        <div className="min-h-screen bg-background-light">
            {/* New Order Notification Toast */}
            <AnimatePresence>
                {newOrderNotification && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="fixed top-20 right-4 z-50 bg-success text-white p-6 rounded-2xl shadow-2xl max-w-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                <Bell size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">New Pickup Ready!</h3>
                                <p className="text-sm opacity-90 mb-2">
                                    Order #{newOrderNotification.orderNumber} from {newOrderNotification.restaurant?.name || 'Restaurant'}
                                </p>
                                <div className="flex gap-2">
                                    <Link
                                        href="/driver/queue"
                                        className="px-4 py-2 bg-white text-success rounded-lg font-bold text-sm hover:bg-gray-100 transition"
                                    >
                                        View Order
                                    </Link>
                                    <button
                                        onClick={() => setNewOrderNotification(null)}
                                        className="px-4 py-2 bg-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/30 transition"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Advanced Status Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isDriverActive ? 'bg-success animate-pulse' : 'bg-gray-400'}`} />
                        <span className="font-bold text-primary-dark">
                            {isDriverActive ? 'Active' : 'Offline'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            {isOnline ? <Wifi size={16} className="text-success" /> : <WifiOff size={16} className="text-error" />}
                            <span className="text-text-secondary">{networkStrength}G</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Battery size={16} className={batteryLevel > 20 ? 'text-success' : 'text-error'} />
                            <span className="text-text-secondary">{batteryLevel}%</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* Earnings Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-primary-dark to-secondary-soft text-white p-6 rounded-2xl shadow-lg"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm opacity-75 mb-1">Today's Earnings</p>
                            <h2 className="text-4xl font-black">${todayEarnings.toFixed(2)}</h2>
                        </div>
                        <Wallet size={32} className="opacity-50" />
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div>
                            <p className="opacity-75">Cash in Hand</p>
                            <p className="font-bold">${cashInHand.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="opacity-75">Active Deliveries</p>
                            <p className="font-bold">{activeDeliveries}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/driver/queue" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                        <Package size={32} className="text-primary-dark mb-3" />
                        <h3 className="font-bold text-primary-dark">View Queue</h3>
                        <p className="text-sm text-text-secondary">Available orders</p>
                    </Link>
                    <button className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-left">
                        <Navigation size={32} className="text-success mb-3" />
                        <h3 className="font-bold text-primary-dark">Navigate</h3>
                        <p className="text-sm text-text-secondary">Current delivery</p>
                    </button>
                </div>

                {/* Performance Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="font-bold text-lg mb-4">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-text-secondary mb-1">Rating</p>
                            <div className="flex items-center gap-2">
                                <Star size={20} className="text-amber-500 fill-amber-500" />
                                <span className="text-2xl font-bold">{performance.rating}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary mb-1">Deliveries</p>
                            <span className="text-2xl font-bold">{performance.deliveries}</span>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary mb-1">On-Time Rate</p>
                            <span className="text-2xl font-bold text-success">{performance.onTimeRate}%</span>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary mb-1">Satisfaction</p>
                            <span className="text-2xl font-bold text-success">{performance.customerSatisfaction}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

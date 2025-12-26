"use client";

import React, { useState, useEffect } from 'react';
import { joinRoom, SocketEvents } from '@/shared/utils/socket';
import { useSocketEvent } from '@/shared/hooks/useSocket';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone, Package } from 'lucide-react';

// Simulate GPS coordinates changing
function useSimulatedGPS(orderId: string) {
    const [location, setLocation] = useState({ lat: 30.0444, lng: 31.2357 }); // Cairo

    useEffect(() => {
        const interval = setInterval(() => {
            setLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.001,
                lng: prev.lng + (Math.random() - 0.5) * 0.001,
            }));
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [orderId]);

    return location;
}

export default function TrackClient({ id }: { id: string }) {
    const orderId = id;
    const [orderStatus, setOrderStatus] = useState('IN_DELIVERY');
    const [estimatedTime, setEstimatedTime] = useState('12 mins');
    const driverLocation = useSimulatedGPS(orderId);

    // Join order-specific room for real-time updates
    useEffect(() => {
        joinRoom(`order_${orderId}`);
    }, [orderId]);

    // Listen for status updates
    useSocketEvent(SocketEvents.ORDER_UPDATED, (order: any) => {
        if (order.id === orderId) {
            setOrderStatus(order.status);
        }
    }, [orderId]);

    // Listen for driver location updates
    useSocketEvent(SocketEvents.DRIVER_LOCATION, (data: any) => {
        if (data.orderId === orderId) {
            // In a real app, update map marker position
            console.log('Driver location:', data.location);
        }
    }, [orderId]);

    return (
        <div className="min-h-screen bg-background-light">
            {/* Map Placeholder */}
            <div className="relative h-96 bg-gradient-to-br from-primary-dark to-secondary-soft">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <MapPin size={64} className="mx-auto mb-4 animate-bounce" />
                        <p className="text-2xl font-bold">Tracking Your Delivery</p>
                        <p className="text-sm opacity-75">Driver Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</p>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="p-6 space-y-6">
                {/* Status Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white border-l-4 border-success p-6 rounded-2xl shadow-md"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-primary-dark">Order #{orderId}</h2>
                            <p className="text-text-secondary flex items-center gap-2 mt-1">
                                <Clock size={16} />
                                Estimated arrival: {estimatedTime}
                            </p>
                        </div>
                        <span className="px-4 py-2 bg-success text-white rounded-full text-sm font-bold">
                            {orderStatus}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs text-text-secondary mb-2">
                            <span>Order Placed</span>
                            <span>Preparing</span>
                            <span>On the Way</span>
                            <span>Delivered</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-success"
                                initial={{ width: '0%' }}
                                animate={{ width: orderStatus === 'DELIVERED' ? '100%' : '66%' }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Driver Info */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="font-bold text-lg mb-4">Your Driver</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            K
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-primary-dark">Karim Driver</p>
                            <p className="text-sm text-text-secondary">4.9 ★ • 245 deliveries</p>
                        </div>
                        <button className="w-12 h-12 bg-success text-white rounded-full flex items-center justify-center">
                            <Phone size={20} />
                        </button>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Package size={20} />
                        Your Order
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>2x Lamb Kofta</span>
                            <span className="text-text-secondary">$36.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>1x Mint Lemonade</span>
                            <span className="text-text-secondary">$3.50</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>$39.50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

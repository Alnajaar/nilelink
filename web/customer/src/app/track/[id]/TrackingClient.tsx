'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    MapPin,
    CheckCircle,
    Navigation,
    Phone,
    MessageSquare,
    ShieldCheck,
    Zap,
    User,
    Star
} from 'lucide-react';
import { useSocketEvent, useSocket } from '@shared/hooks/useSocket';
import { joinRoom } from '@shared/utils/socket';
import { SocketEvents } from '@shared/utils/socket';
import RealtimeMap from '@/components/RealtimeMap';
import AuthGuard from '@shared/components/AuthGuard';

const StatusStep = ({ icon: Icon, label, time, completed, active }: any) => (
    <div className="flex gap-6 relative">
        <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                active ? 'bg-white border-blue-600 text-blue-600 animate-pulse shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-300'
                }`}>
                <Icon size={22} />
            </div>
            <div className={`w-0.5 flex-1 transition-all duration-500 my-2 ${completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        </div>
        <div className="pt-2 pb-10">
            <h4 className={`text-sm font-black uppercase tracking-widest ${active ? 'text-blue-600' : completed ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">{time}</p>
        </div>
    </div>
);

export default function TrackingClient({ orderId }: { orderId: string }) {
    return (
        <AuthGuard>
            <TrackingContent orderId={orderId} />
        </AuthGuard>
    );
}

function TrackingContent({ orderId }: { orderId: string }) {
    const { isConnected: socketConnected } = useSocket();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [driver, setDriver] = useState<any>(null);

    const statusMap = {
        'PENDING': 0,
        'CONFIRMED': 0,
        'PREPARING': 1,
        'READY': 2,
        'IN_TRANSIT': 3,
        'DELIVERED': 4,
        'COMPLETED': 4
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // In actual production this would be a full URL or standard relative path
                const response = await fetch(`/api/orders/${orderId}`);
                const data = await response.json();

                if (data.success) {
                    setOrder(data.data);
                } else {
                    setError('Failed to load order');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load order');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (order && order.status === 'PENDING' && !loading) {
            pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/orders/${orderId}`);
                    const data = await response.json();
                    if (data.success && data.data.status !== 'PENDING') {
                        setOrder(data.data);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 5000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [order, orderId, loading]);

    useEffect(() => {
        if (orderId && socketConnected) {
            joinRoom(`order_${orderId}`);
        }
    }, [orderId, socketConnected]);

    useSocketEvent(SocketEvents.ORDER_UPDATED, (updatedOrder: any) => {
        if (updatedOrder.id === orderId) {
            setOrder(updatedOrder);
        }
    });

    useSocketEvent(SocketEvents.DRIVER_LOCATION, (locationData: any) => {
        if (locationData.orderId === orderId) {
            setDriverLocation({
                lat: locationData.latitude,
                lng: locationData.longitude
            });
        }
    });

    useSocketEvent(SocketEvents.DRIVER_ASSIGNED, (assignmentData: any) => {
        if (assignmentData.orderId === orderId) {
            setDriver(assignmentData.driver);
            setOrder((prev: any) => prev ? { ...prev, delivery: { ...prev.delivery, driver: assignmentData.driver } } : null);
        }
    });

    const calculateETA = () => {
        if (!driverLocation || !order?.deliveryLat || !order?.deliveryLng) {
            return null;
        }
        const R = 6371;
        const dLat = (order.deliveryLat - driverLocation.lat) * (Math.PI / 180);
        const dLon = (order.deliveryLng - driverLocation.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(driverLocation.lat * (Math.PI / 180)) * Math.cos(order.deliveryLat * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;
        const speedKmh = 20;
        const timeMinutes = Math.ceil((distanceKm / speedKmh) * 60);
        return timeMinutes + 5;
    };

    const eta = calculateETA();
    const currentStatusIndex = order ? (statusMap[order.status as keyof typeof statusMap] ?? 0) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-red-900 mb-2">SYSTEM ERROR</h2>
                    <p className="text-red-700 mb-4 font-medium">{error || 'Order not found'}</p>
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4 text-left">
                        <p className="text-red-800 text-sm font-medium mb-2">Technical Details:</p>
                        <ul className="text-red-700 text-xs space-y-1">
                            <li>• Backend API connection failed</li>
                            <li>• Real-time tracking unavailable</li>
                            <li>• Order data cannot be loaded</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="h-[50vh] mb-6">
                <RealtimeMap
                    driverLocation={driverLocation ? {
                        id: 'driver',
                        name: driver?.firstName ? `${driver.firstName} ${driver.lastName}` : 'Driver',
                        latitude: driverLocation.lat,
                        longitude: driverLocation.lng,
                        color: '#3b82f6',
                        type: 'driver',
                        lastUpdate: Date.now()
                    } : undefined}
                    customerLocation={{
                        id: 'customer',
                        name: 'Delivery Address',
                        latitude: 24.7136,
                        longitude: 46.6753,
                        color: '#ef4444',
                        type: 'customer'
                    }}
                    restaurantLocation={{
                        id: 'restaurant',
                        name: order.restaurantName || order.restaurant?.name || 'Restaurant',
                        latitude: 24.7136,
                        longitude: 46.6753,
                        color: '#8b5cf6',
                        type: 'restaurant'
                    }}
                    orderStatus={order?.status || 'UNKNOWN'}
                    eta={eta || undefined}
                    isConnected={socketConnected}
                />
            </div>

            <main className="max-w-2xl mx-auto px-8 py-12 -mt-4 relative z-10 bg-white rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                            Order #{order.orderNumber || `NL-${orderId.slice(-4)}`}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Placed from <span className="text-blue-600 font-bold">{order.restaurantName || order.restaurant?.name || 'Restaurant'}</span>
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                            Total: ${Number(order.total || order.totalAmount || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <Package size={24} className="text-slate-300" />
                    </div>
                </div>

                <div className="space-y-0">
                    <StatusStep
                        icon={CheckCircle}
                        label="Order Confirmed"
                        time={order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                        completed={currentStatusIndex >= 0}
                        active={currentStatusIndex === 0}
                    />
                    <StatusStep
                        icon={Zap}
                        label="Preparing Meal"
                        time=""
                        completed={currentStatusIndex >= 1}
                        active={currentStatusIndex === 1}
                    />
                    <StatusStep
                        icon={Navigation}
                        label="Courier Picked Up"
                        time=""
                        completed={currentStatusIndex >= 2}
                        active={currentStatusIndex === 2}
                    />
                    <StatusStep
                        icon={MapPin}
                        label="Arriving Soon"
                        time=""
                        completed={currentStatusIndex >= 3}
                        active={currentStatusIndex === 3}
                    />
                    <StatusStep
                        icon={ShieldCheck}
                        label="Delivered"
                        time=""
                        completed={currentStatusIndex >= 4}
                        active={currentStatusIndex === 4}
                    />
                </div>

                {driver || order.delivery?.driver ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <User size={24} className="text-slate-300" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900">
                                        {driver?.firstName && driver?.lastName
                                            ? `${driver.firstName} ${driver.lastName}`
                                            : order.delivery?.driver?.firstName && order.delivery?.driver?.lastName
                                                ? `${order.delivery.driver.firstName} ${order.delivery.driver.lastName}`
                                                : 'Driver Assigned'
                                        }
                                    </h4>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-slate-700">
                                            {driver?.rating || order.delivery?.driver?.rating || '4.9'}/5
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold ml-2">
                                            • {driver?.deliveryCount || '1.2K'} DELIVERIES
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                    <Phone size={18} />
                                </button>
                                <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Delivery Address</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {order.deliveryAddress || order.delivery?.dropoffAddress || 'Address not available'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Real-time Tracking</p>
                                <p className={`text-xs font-bold ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
                                    {socketConnected ? '● Connected' : '● Disconnected'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-center">
                        <Navigation size={32} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 font-medium">Waiting for driver assignment...</p>
                        <p className="text-slate-400 text-sm mt-1">Driver will be assigned soon</p>
                    </div>
                )}
            </main>
        </div>
    );
}

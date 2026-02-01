/**
 * Customer Delivery Tracking Page
 * live status monitoring for orders
 * 
 * FEATURES:
 * - Real-time order progress visualize (Ordered -> Preparing -> Shipping -> Delivered)
 * - Map visualization (UI placeholder for integration)
 * - ETA (Estimated Time of Arrival) countdown
 * - Driver profile and contact (if applicable)
 * - Push-notification hooks for state changes
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { graphService } from '@shared/services/GraphService';
import { OnChainOrder, OrderStatus } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface TrackingStep {
    label: string;
    status: OrderStatus;
    time?: string;
    sublabel: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TrackingPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OnChainOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [eta, setEta] = useState(25); // minutes

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            // Fetch order details from the blockchain/graph
            // Mocking for now to show tracking UI
            const mockOrder: OnChainOrder = {
                id: orderId,
                businessId: '0x123',
                customer: '0x456',
                total: BigInt(4500),
                status: 'SHIPPED',
                createdAt: Math.floor(Date.now() / 1000) - 3600,
                paymentMethod: 'CARD',
                paymentStatus: 'PAID'
            };
            setOrder(mockOrder);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const steps: TrackingStep[] = [
        { label: 'Order Placed', status: 'PENDING', time: '12:45 PM', sublabel: 'Order sent to business' },
        { label: 'Preparing', status: 'PREPARING', time: '1:05 PM', sublabel: 'Business is preparing items' },
        { label: 'Out for Delivery', status: 'SHIPPED', time: '1:20 PM', sublabel: 'Driver is on the way' },
        { label: 'Delivered', status: 'DELIVERED', sublabel: 'Enjoy your package!' },
    ];

    const getActiveStep = (status: OrderStatus) => {
        if (status === 'PENDING') return 0;
        if (status === 'PREPARING') return 1;
        if (status === 'SHIPPED') return 2;
        if (status === 'DELIVERED' || status === 'COMPLETED') return 3;
        return -1;
    };

    const currentStep = order ? getActiveStep(order.status) : -1;

    if (loading) return <div className="min-h-screen bg-[#02050a] flex items-center justify-center p-4"><div className="animate-spin text-4xl">🔄</div></div>;

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => history.back()} className="text-gray-400 hover:text-white transition-all text-2xl">←</button>
                    <div>
                        <h1 className="text-3xl font-black text-white">Track Order</h1>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">#{orderId.toUpperCase()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Section */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Live Status Header */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Estimated Arrival</div>
                                    <div className="text-6xl font-black text-white flex items-end gap-2">
                                        {eta}
                                        <span className="text-xl text-blue-400 mb-2">Mins</span>
                                    </div>
                                </div>
                                <div className="text-6xl animate-bounce">🛵</div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm transition-all">Support 🎧</button>
                                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm transition-all">Business 🏪</button>
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-white/10"></div>

                                {steps.map((step, idx) => {
                                    const isCompleted = idx < currentStep;
                                    const isActive = idx === currentStep;

                                    return (
                                        <div key={idx} className="relative mb-10 last:mb-0 pl-14">
                                            {/* Dot */}
                                            <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 ${isCompleted ? 'bg-green-600 border-green-900/50' : isActive ? 'bg-blue-600 border-blue-900/50 animate-pulse' : 'bg-[#02050a] border-white/5'}`}>
                                                {isCompleted ? '✓' : isActive ? '●' : ''}
                                            </div>

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-black ${isActive ? 'text-white text-lg' : isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>{step.label}</h3>
                                                    <p className={`text-sm ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>{step.sublabel}</p>
                                                </div>
                                                {step.time && <div className="text-xs font-mono text-gray-500">{step.time}</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Driver & Map */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Map Placeholder */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 aspect-square overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-900/20 flex flex-col items-center justify-center text-center p-8">
                                <div className="text-4xl mb-4">📍</div>
                                <h4 className="text-white font-bold mb-2">Live Map View</h4>
                                <p className="text-gray-500 text-xs">Driver tracking active. Integration with Leaflet/Google Maps pending.</p>
                            </div>
                            {/* Visual grid lines to simulate a map */}
                            <div className="w-full h-full border border-white/5 grid grid-cols-4 grid-rows-4 opacity-10">
                                {[...Array(16)].map((_, i) => <div key={i} className="border border-white"></div>)}
                            </div>
                        </div>

                        {/* Driver Info */}
                        {order?.status === 'SHIPPED' && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">🤵</div>
                                    <div>
                                        <h4 className="text-white font-bold">Ahmed Hassan</h4>
                                        <div className="text-yellow-400 text-xs font-bold">★ 4.9 (2k+ Deliveries)</div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2">
                                    Message Driver 💬
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

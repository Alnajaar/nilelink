"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, CheckCircle, Navigation, Clock } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { deliveryApi } from '@shared/utils/api';

// Toggle between 'DISPATCHER' and 'DRIVER' view for demo
const VIEW_MODE = 'DRIVER';

export default function DeliveryPage() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const [available, mine] = await Promise.all([
                deliveryApi.getAvailable().catch(() => []),
                deliveryApi.getHistory().catch(() => [])
            ]);
            setDeliveries(available);
            setMyDeliveries(mine);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleAccept = async (id: string) => {
        try {
            await deliveryApi.claim(id);
            alert('Delivery Accepted!');
            refresh();
        } catch (e) {
            alert('Failed to accept task.');
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await deliveryApi.updateStatus(id, status);
            refresh();
        } catch (e) {
            alert('Status update failed');
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary pb-20">
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to NileLink
                    </Link>
                    <Badge className="bg-primary text-white border-0">
                        {VIEW_MODE} MODE
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                        NileFleet Command
                    </h1>
                    <Button onClick={refresh} disabled={loading} size="sm">
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Available for Dispatch / Clean */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Navigation size={20} className="text-primary" />
                            Dispatch Queue ({deliveries.length})
                        </h2>
                        <div className="space-y-4">
                            {deliveries.map(d => (
                                <Card key={d.id || d.order.id} className="p-6 bg-white border border-neutral-200 hover:border-primary transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mb-2">
                                                Ready for Pickup
                                            </Badge>
                                            <h3 className="font-bold text-lg">{d.order.restaurant.name}</h3>
                                            <p className="text-sm opacity-60 flex items-center gap-1">
                                                <MapPin size={12} /> {d.order.restaurant.address}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl">${d.order.totalAmount}</p>
                                            <p className="text-xs uppercase opacity-50">{d.order.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-primary text-white" onClick={() => handleAccept(d.id || d.order.id)}>
                                        Accept Delivery
                                    </Button>
                                </Card>
                            ))}
                            {deliveries.length === 0 && (
                                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-2xl opacity-50">
                                    No orders ready for pickup.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Active Deliveries */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-green-600" />
                            My Active Tasks
                        </h2>
                        <div className="space-y-4">
                            {myDeliveries.filter(d => d.status !== 'DELIVERED').map(d => ( // Filter out completed for cleaner view
                                <Card key={d.id} className="p-6 bg-white border-l-4 border-green-500 shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <Badge className="bg-green-100 text-green-700 border-green-200 mb-2">
                                                {d.status.replace('_', ' ')}
                                            </Badge>
                                            <p className="text-xs opacity-50">Order #{d.orderId.slice(-6)}</p>
                                        </div>
                                        <Clock size={20} className="text-neutral-300" />
                                    </div>

                                    <div className="flex gap-2">
                                        {d.status === 'ASSIGNED' && (
                                            <Button className="flex-1" onClick={() => handleStatusUpdate(d.id, 'PICKED_UP')}>
                                                Confirm Pickup
                                            </Button>
                                        )}
                                        {d.status === 'PICKED_UP' && (
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusUpdate(d.id, 'DELIVERED')}>
                                                Complete Delivery
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {myDeliveries.filter(d => d.status !== 'DELIVERED').length === 0 && (
                                <div className="p-8 text-center bg-neutral-50 rounded-2xl opacity-50">
                                    You have no active deliveries.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

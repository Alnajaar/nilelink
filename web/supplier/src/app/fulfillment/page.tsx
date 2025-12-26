"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { StateIndicator } from '@/components/shared/StateIndicator';
import { MapPin, Truck } from 'lucide-react';

export default function FulfillmentPage() {
    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary-dark">Fulfillment Tracking</h1>
                    <p className="text-text-secondary">Monitor active shipments and delivery status.</p>
                </div>
            </header>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/10 text-sm text-text-secondary">
                                <th className="p-4 font-medium">Shipment ID</th>
                                <th className="p-4 font-medium">Destination</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">ETA</th>
                                <th className="p-4 font-medium">Driver</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {[1, 2, 3, 4].map((i) => (
                                <tr key={i} className="hover:bg-black/5 transition-colors">
                                    <td className="p-4 font-mono text-sm font-bold text-primary-dark">#SHP-2025-{100 + i}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-text-secondary" />
                                            <span className="font-medium">Zamalek Warehouse 4</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {i === 1 ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                                                <Truck size={12} /> In Transit
                                            </div>
                                        ) : i === 2 ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                                                <StateIndicator status="online" /> Delivered
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider">
                                                Processing
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm font-mono">14:30 PM</td>
                                    <td className="p-4 text-sm">Karim M.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

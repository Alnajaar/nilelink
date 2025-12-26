"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Package, Truck, Search } from 'lucide-react';

export default function SupplierRequestsPage() {
    return (
        <div className="h-full p-6 bg-background-light overflow-y-auto">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-dark">Supplier Requests</h1>
                <Button leftIcon={<Package size={18} />}>New Request</Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Creating New Request Card */}
                <Card className="p-6 border-dashed border-2 border-primary-dark/20 bg-primary-dark/5 flex flex-col items-center justify-center text-center gap-4 hover:bg-primary-dark/10 transition-colors cursor-pointer min-h-[200px]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-dark shadow-sm">
                        <Package size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-primary-dark">Request Stock</h3>
                        <p className="text-sm text-text-secondary">Create a new inventory order</p>
                    </div>
                </Card>

                {[1, 2].map((i) => (
                    <Card key={i} className="p-6 flex flex-col justify-between min-h-[200px]">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-primary-dark">Organic Tomatoes</h3>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Pending</span>
                            </div>
                            <div className="space-y-2 text-sm text-text-secondary mb-6">
                                <div className="flex items-center gap-2">
                                    <Truck size={14} />
                                    <span>Green Valley Farms</span>
                                </div>
                                <div>Quantity: <span className="font-bold text-primary-dark">50 kg</span></div>
                                <div>ETA: <span className="font-mono">Tomorrow, 10:00 AM</span></div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

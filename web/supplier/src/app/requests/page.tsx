"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LedgerBadge } from '@/components/shared/LedgerBadge';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function SupplierRequestsPage() {
    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-primary-dark">Inventory Requests</h1>
                <p className="text-text-secondary">Manage incoming supply requests from diverse merchants.</p>
            </header>

            <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-dark/5 rounded-xl">
                                    <Package className="text-primary-dark" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary-dark">Bulk Organic Tomatoes</h3>
                                    <p className="text-sm text-text-secondary">Requested by <span className="font-semibold text-primary-dark">Grand Cairo Grill</span></p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <LedgerBadge verified={true} hash="0x8f...2a" />
                                        <span className="text-xs text-text-secondary">2 hours ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="text-right hidden md:block">
                                    <div className="text-xl font-bold text-primary-dark">500 kg</div>
                                    <div className="text-sm text-text-secondary">Quantity</div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none">Decline</Button>
                                    <Button className="flex-1 md:flex-none" leftIcon={<Truck size={18} />}>Approve & Ship</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

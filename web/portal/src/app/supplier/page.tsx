"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Network, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { supplierApi } from '@shared/utils/api';

export default function SupplierPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshInventory = async () => {
        setLoading(true);
        try {
            const data = await supplierApi.getInventory();
            setInventory(data);
        } catch (e) {
            console.error("Failed to load inventory", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshInventory();
    }, []);

    const handleRestock = async (item: any) => {
        const qty = prompt(`Restock ${item.name} (Unit: ${item.unit})\nEnter quantity:`, "50");
        if (!qty) return;

        try {
            await supplierApi.restock({
                restaurantId: item.restaurantId,
                supplierId: item.supplierId || 'unknown_supplier', // Fallback for demo
                items: [{
                    name: item.name,
                    quantity: Number(qty),
                    unitCost: Number(item.unitCost),
                    unit: item.unit
                }]
            });
            alert('Restock PO Sent!');
            refreshInventory();
        } catch (e) {
            alert('Failed to restock. Check console.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary">
            <div className="border-b border-primary/20 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-surface transition-colors">
                        <ArrowLeft size={16} />
                        Back to NileLink
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            Protocol Active
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                            Supply Network
                        </h1>
                        <p className="text-xl opacity-60">Connected Suppliers & Inventory</p>
                    </div>
                    <Button onClick={refreshInventory} disabled={loading} variant="outline">
                        <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Sync Network
                    </Button>
                </div>

                <Card className="bg-white border text-center py-20 hidden">
                    {/* Placeholder for when empty */}
                    <Package size={48} className="mx-auto text-neutral-300 mb-4" />
                    <p className="font-bold text-xl">No Connected Suppliers</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                        <Card key={item.id} className="p-6 bg-white border border-neutral-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-neutral-100 rounded-xl">
                                    <Package size={24} className="text-text-primary" />
                                </div>
                                {Number(item.quantity) < 20 && (
                                    <Badge className="bg-red-100 text-red-600 border-red-200 flex gap-1">
                                        <AlertTriangle size={12} /> Low Stock
                                    </Badge>
                                )}
                            </div>

                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-sm opacity-50 mb-4">Supplier: {item.supplier?.name || "Global Network"}</p>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black">{Number(item.quantity)}</p>
                                    <p className="text-xs font-mono uppercase opacity-50">{item.unit}</p>
                                </div>
                                <Button size="sm" onClick={() => handleRestock(item)}>
                                    Restock
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {/* Add Item Placeholder */}
                    <Card className="p-6 bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                            <Network size={24} className="text-primary" />
                        </div>
                        <p className="font-bold text-primary">Connect New Supplier</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

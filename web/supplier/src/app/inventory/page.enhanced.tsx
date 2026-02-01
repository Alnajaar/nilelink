'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package, AlertTriangle, TrendingDown, BarChart3,
    Search, Filter, Plus, RefreshCw, Download, ArrowUpRight,
    ArrowDownLeft, Zap, Clock
} from 'lucide-react';

import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    current: number;
    minimum: number;
    maximum: number;
    unit: string;
    lastRestocked: Date;
    turnoverRate: number;
    status: 'optimal' | 'low' | 'overstock';
}

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const mockInventory: InventoryItem[] = [
        { id: '1', name: 'Premium Coffee Beans', sku: 'PCB-001', current: 150, minimum: 50, maximum: 300, unit: 'kg', lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), turnoverRate: 8.5, status: 'optimal' },
        { id: '2', name: 'Organic Olive Oil', sku: 'OOO-002', current: 25, minimum: 30, maximum: 150, unit: 'liters', lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), turnoverRate: 5.2, status: 'low' },
        { id: '3', name: 'Artisan Bread', sku: 'AB-003', current: 200, minimum: 100, maximum: 250, unit: 'loaves', lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), turnoverRate: 12.1, status: 'optimal' },
    ];

    const totalValue = mockInventory.reduce((sum, item) => sum + (item.current * 15), 0); // Assuming $15 average per unit
    const lowStockItems = mockInventory.filter(i => i.status === 'low').length;
    const overstockItems = mockInventory.filter(i => i.status === 'overstock').length;

    const stats = [
        { label: 'Total Items', value: mockInventory.length, icon: Package, color: 'blue' as const },
        { label: 'Inventory Value', value: `$${(totalValue / 1000).toFixed(1)}K`, icon: BarChart3, color: 'emerald' as const },
        { label: 'Low Stock Alert', value: lowStockItems, icon: AlertTriangle, color: 'amber' as const },
        { label: 'Overstock Items', value: overstockItems, icon: TrendingDown, color: 'red' as const }
    ];

    const filteredItems = mockInventory.filter(item =>
        (filterStatus === 'all' || item.status === filterStatus) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <SupplierPageTemplate
            title="Inventory Management"
            subtitle="Real-time stock level tracking and optimization"
            icon={Package}
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Restock Item
                    </Button>
                </div>
            }
        >
            {/* Stats Grid */}
            <PageSection title="Inventory Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>
            </PageSection>

            {/* Stock Analysis Chart */}
            <PageSection title="Stock Level Analysis">
                <Card className="p-8 bg-gradient-to-br from-white to-blue-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {mockInventory.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-black text-gray-900">{item.name}</h4>
                                                <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                            </div>
                                            <Badge className={`${item.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' :
                                                            item.status === 'low' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </Badge>
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                                <span>Current</span>
                                                <span>{item.current} {item.unit}</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${(item.current / item.maximum) * 100}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                                                    className={`h-full rounded-full ${
                                                        item.status === 'optimal' ? 'bg-emerald-500' :
                                                        item.status === 'low' ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Min: {item.minimum}</span>
                                                <span>Max: {item.maximum}</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Turnover Rate</p>
                                                <p className="text-lg font-black text-blue-600">{item.turnoverRate}x</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Last Restocked</p>
                                                <p className="text-xs font-bold text-gray-700">{item.lastRestocked.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </PageSection>

            {/* Detailed Table */}
            <PageSection title="Inventory Details">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Item</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-gray-600">Current</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-gray-600">Min/Max</th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Turnover</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-gray-600">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-gray-900">{item.current} {item.unit}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-600">{item.minimum} / {item.maximum}</td>
                                    <td className="px-6 py-4 text-right font-black text-blue-600">{item.turnoverRate}x</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge className={`${item.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'low' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status === 'low' && (
                                            <Button className="h-8 text-xs px-3 bg-amber-100 text-amber-700 hover:bg-amber-200">
                                                <Zap className="w-3 h-3 mr-1" />
                                                Restock
                                            </Button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PageSection>
        </SupplierPageTemplate>
    );
}
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingCart, TrendingUp, Clock, CheckCircle,
    Search, Filter, Eye, Download, Plus, ChevronDown,
    AlertCircle, Package
} from 'lucide-react';

import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface Order {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    items: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    date: Date;
    dueDate: Date;
}

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const mockOrders: Order[] = [
        { id: '1', orderNumber: 'ORD-2024-001', customer: 'Restaurant ABC', total: 5240.50, items: 12, status: 'pending', date: new Date(), dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        { id: '2', orderNumber: 'ORD-2024-002', customer: 'Cafe XYZ', total: 3180.00, items: 8, status: 'processing', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
        { id: '3', orderNumber: 'ORD-2024-003', customer: 'Food Corp', total: 8920.75, items: 24, status: 'shipped', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ];

    const stats = [
        { label: 'Total Orders', value: mockOrders.length, icon: ShoppingCart, color: 'blue' as const },
        { label: 'Pending', value: mockOrders.filter(o => o.status === 'pending').length, icon: Clock, color: 'amber' as const },
        { label: 'Delivered', value: mockOrders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'emerald' as const },
        { label: 'Revenue', value: `$${mockOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'purple' as const }
    ];

    const filteredOrders = mockOrders.filter(order =>
        (statusFilter === 'all' || order.status === statusFilter) &&
        (order.orderNumber.includes(searchTerm) || order.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-amber-100 text-amber-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <SupplierPageTemplate
            title="Order Management"
            subtitle="Track and manage customer orders"
            icon={ShoppingCart}
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            }
        >
            {/* Stats Grid */}
            <PageSection title="Order Overview">
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

            {/* Search & Filter */}
            <PageSection title="Recent Orders">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order number or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-xl
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                                     font-medium text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-12 px-4 bg-white border border-gray-300 rounded-xl font-medium text-gray-900
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                                     appearance-none cursor-pointer min-w-[200px]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="group hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-900 text-base">{order.orderNumber}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                                    </div>
                                    <Badge className={getStatusColor(order.status)}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                                        <p className="text-lg font-black text-blue-600">${order.total.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Items</p>
                                        <p className="text-lg font-black text-gray-900">{order.items}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Due</p>
                                        <p className="text-sm font-bold text-gray-700">{order.dueDate.toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <Button className="w-full h-10 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </PageSection>
        </SupplierPageTemplate>
    );
}
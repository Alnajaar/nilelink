'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Filter, ArrowLeft, Plus } from 'lucide-react';
import { TableCard } from '@/components/TableCard';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export default function TablesPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');

    // Mock tables data
    const [tables, setTables] = useState([
        { id: 1, number: '01', status: 'available', section: 'Main Hall' },
        { id: 2, number: '02', status: 'occupied', guests: 2, amount: 45.50, section: 'Main Hall' },
        { id: 3, number: '03', status: 'occupied', guests: 4, amount: 128.00, section: 'Main Hall' },
        { id: 4, number: '04', status: 'available', section: 'Main Hall' },
        { id: 5, number: '05', status: 'reserved', guests: 3, section: 'Terrace' },
        { id: 6, number: '06', status: 'available', section: 'Terrace' },
        { id: 7, number: '07', status: 'occupied', guests: 2, amount: 32.25, section: 'VIP' },
        { id: 8, number: '08', status: 'available', section: 'VIP' },
        { id: 9, number: '09', status: 'available', section: 'Balcony' },
        { id: 10, number: '10', status: 'available', section: 'Balcony' },
    ]);

    const filteredTables = tables.filter(t => filter === 'all' || t.status === filter);

    const handleTableClick = (table: any) => {
        // If occupied, go to order. If available, start new order.
        router.push(`/terminal?table=${table.number}`);
    };

    return (
        <div className="p-6 flex flex-col h-full gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-main bg-clip-text">Floor Management</h1>
                    <p className="text-sm text-text-muted font-bold">Zamalek Branch • 10 Active Tables</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                    <Button size="sm">
                        <Plus size={16} />
                        Merge Tables
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tables', value: tables.length, color: 'text-text-main' },
                    { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, color: 'text-primary' },
                    { label: 'Available', value: tables.filter(t => t.status === 'available').length, color: 'text-success' },
                    { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, color: 'text-warning' },
                ].map(stat => (
                    <Card key={stat.label} className="p-4 rounded-3xl border-border-subtle">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'available', 'occupied', 'reserved'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s as any)}
                        className={`
                            px-6 py-2 rounded-full border text-xs font-black uppercase tracking-widest transition-all
                            ${filter === s
                                ? 'bg-primary border-primary text-white shadow-lg'
                                : 'bg-white border-border-subtle text-text-muted hover:border-primary/50'
                            }
                        `}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Table Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10">
                    {filteredTables.map(table => (
                        <TableCard
                            key={table.id}
                            number={table.number}
                            status={table.status as any}
                            guests={table.guests}
                            amount={table.amount}
                            onClick={() => handleTableClick(table)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

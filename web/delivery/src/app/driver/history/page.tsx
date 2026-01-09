"use client";

import React from 'react';
import {
    Clock, CheckCircle2, ChevronRight,
    Calendar, MapPin, DollarSign,
    Box, Activity, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';

export default function DriverHistoryPage() {
    const router = useRouter();
    const history = [
        { id: 'DEL-1024', date: 'Dec 24, 14:30', name: 'Grand Cairo Grill', amt: 12.50, status: 'SUCCESS', time: '18m', dist: '2.4km' },
        { id: 'DEL-1023', date: 'Dec 24, 12:15', name: 'Nile Pizza Co', amt: 8.75, status: 'SUCCESS', time: '22m', dist: '3.1km' },
        { id: 'DEL-1022', date: 'Dec 23, 19:45', name: 'Zamalek Sushi', amt: 15.00, status: 'SUCCESS', time: '14m', dist: '1.8km' },
        { id: 'DEL-1021', date: 'Dec 23, 11:20', name: 'Bistro Cairo', amt: 22.40, status: 'SUCCESS', time: '28m', dist: '5.2km' }
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col gap-1">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-text mb-4 hover:bg-primary hover:text-white transition-all"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-4xl font-black text-text tracking-tighter uppercase leading-tight">Mission Manifest</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Full Operational History • Protocol Node Sync</p>
            </header>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 border-2 border-text bg-white">
                    <p className="text-[8px] font-black uppercase opacity-30 mb-2">Total Completed</p>
                    <p className="text-3xl font-black font-mono leading-none tracking-tighter">1,242</p>
                </Card>
                <Card className="p-6 border-2 border-surface bg-background">
                    <p className="text-[8px] font-black uppercase opacity-30 mb-2">Avg Efficiency</p>
                    <p className="text-3xl font-black font-mono leading-none tracking-tighter text-emerald-500">98%</p>
                </Card>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">Detailed Ledger</h3>
                    <Calendar size={14} className="opacity-20" />
                </div>
                {history.map((order, i) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="p-6 border-2 border-surface bg-white hover:border-text transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-text opacity-40 group-hover:bg-primary group-hover:text-background transition-all">
                                        <Box size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-text uppercase tracking-tighter leading-none mb-1">{order.name}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-text opacity-20 uppercase tracking-widest">
                                            #{order.id} • {order.date}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black font-mono tracking-tighter text-text">
                                        ${order.amt.toFixed(2)}
                                    </div>
                                    <span className="text-[8px] font-black uppercase opacity-20 tracking-widest leading-none">Net Earning</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-surface">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase opacity-20 tracking-widest">Duration</span>
                                        <span className="text-[10px] font-black uppercase text-text">{order.time}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase opacity-20 tracking-widest">Distance</span>
                                        <span className="text-[10px] font-black uppercase text-text">{order.dist}</span>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[8px] uppercase tracking-tighter">
                                    <CheckCircle2 size={10} className="mr-1 inline" /> Delivered
                                </Badge>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Load more placeholder */}
            <Button variant="outline" className="w-full h-16 border-2 border-text text-text font-black uppercase tracking-widest text-[10px] rounded-[2rem] hover:bg-surface transition-all">
                Sync Older Manifests
                <Activity size={14} className="ml-2 opacity-30" />
            </Button>
        </div>
    );
}

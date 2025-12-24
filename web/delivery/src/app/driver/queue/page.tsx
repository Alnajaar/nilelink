"use client";

import React, { useState } from 'react';
import {
    MapPin,
    Navigation,
    Box,
    Clock,
    DollarSign,
    Filter
} from 'lucide-react';

const TASKS = [
    {
        id: 'DLV-921',
        restaurant: 'Cairo Grill',
        address: '12 Tahrir Sq, Downtown',
        value: 8.50,
        type: 'pickup',
        status: 'new',
        priority: 'high',
        time: '5 min ago'
    },
    {
        id: 'DLV-925',
        restaurant: 'Nile Burger Co.',
        address: 'Block 4, Zamalek Res.',
        value: 12.00,
        type: 'delivery',
        payment: 'cash',
        status: 'accepted',
        priority: 'normal',
        time: '12 min ago'
    },
    {
        id: 'DLV-930',
        restaurant: 'Koshary El Tahrir',
        address: '15 El Dokki St.',
        value: 6.75,
        type: 'delivery',
        payment: 'epay',
        status: 'new',
        priority: 'rush',
        time: 'Just now'
    }
];

export default function QueuePage() {
    const [filter, setFilter] = useState<'all' | 'new' | 'active'>('all');

    const getPriorityColor = (p: string) => {
        if (p === 'rush') return 'bg-rose-500 text-white shadow-lg shadow-rose-900/20';
        if (p === 'high') return 'bg-amber-500 text-nile-dark';
        return 'bg-white/10 text-nile-silver';
    }

    return (
        <div className="flex flex-col gap-6 px-4">
            <header className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Load Board</h1>
                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-nile-silver">
                    <Filter size={18} />
                </button>
            </header>

            {/* Filter Pills */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'new', 'active', 'completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-white text-nile-dark' : 'bg-white/5 text-nile-silver/40'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {TASKS.map((task) => (
                    <div
                        key={task.id}
                        className="group bg-white/5 border border-white/5 rounded-3xl p-5 active:scale-[0.98] transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${task.type === 'pickup' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                    {task.type === 'pickup' ? <Box size={20} /> : <MapPin size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-[10px] font-bold text-nile-silver/40 flex items-center gap-1">
                                            <Clock size={10} /> {task.time}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{task.restaurant}</h3>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-black italic text-white text-xl">${task.value.toFixed(2)}</span>
                                {task.payment === 'cash' && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                        <DollarSign size={10} /> Cash
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                            <Navigation size={14} className="text-nile-silver/50" />
                            <p className="text-xs font-medium text-nile-silver line-clamp-1">{task.address}</p>
                        </div>

                        {task.status === 'new' ? (
                            <div className="flex gap-3">
                                <button className="flex-1 h-12 rounded-xl bg-white/5 text-nile-silver/40 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
                                    Ignore
                                </button>
                                <button className="flex-[2] h-12 rounded-xl bg-nile-silver text-nile-dark font-black text-xs uppercase tracking-wider hover:bg-white transition-colors">
                                    Accept Load
                                </button>
                            </div>
                        ) : (
                            <button className="w-full h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                In Progress <MapPin size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

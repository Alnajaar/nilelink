"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { CheckCircle2, MapPin } from 'lucide-react';

export default function DriverHistoryPage() {
    const history = [
        {
            id: 'DEL-1024',
            date: '2025-12-24',
            restaurant: 'Grand Cairo Grill',
            earnings: 12.50,
            status: 'COMPLETED',
            duration: '18 mins'
        },
        {
            id: 'DEL-1023',
            date: '2025-12-24',
            restaurant: 'Nile Pizza Co',
            earnings: 8.75,
            status: 'COMPLETED',
            duration: '22 mins'
        },
        {
            id: 'DEL-1022',
            date: '2025-12-23',
            restaurant: 'Zamalek Sushi',
            earnings: 15.00,
            status: 'COMPLETED',
            duration: '14 mins'
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary-dark">Delivery History</h1>

            <div className="space-y-4">
                {history.map((order) => (
                    <Card key={order.id} className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-primary-dark">{order.restaurant}</h3>
                                <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                                    <span>#{order.id}</span>
                                    <span>•</span>
                                    <span>{order.date}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-success">
                                    <CurrencyDisplay amount={order.earnings} />
                                </div>
                                <span className="text-xs text-text-secondary">{order.duration}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-success bg-success/5 p-2 rounded-lg border border-success/10 w-fit">
                            <CheckCircle2 size={14} />
                            <span className="font-medium">Delivered Successfully</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

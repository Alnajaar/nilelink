'use client';

import React from 'react';
import { Card } from '@/shared/components/Card';

interface TableCardProps {
    number: string;
    status: 'available' | 'occupied' | 'reserved';
    guests?: number;
    amount?: number;
    onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
    number,
    status,
    guests,
    amount,
    onClick
}) => {
    const statusConfig = {
        available: {
            bg: 'bg-success/5',
            border: 'border-success/20 hover:border-success',
            text: 'text-success',
            label: 'Available'
        },
        occupied: {
            bg: 'bg-primary/5',
            border: 'border-primary/20 hover:border-primary',
            text: 'text-primary',
            label: 'Occupied'
        },
        reserved: {
            bg: 'bg-warning/5',
            border: 'border-warning/20 hover:border-warning',
            text: 'text-warning',
            label: 'Reserved'
        }
    };

    const config = statusConfig[status];

    return (
        <Card
            onClick={onClick}
            className={`
                cursor-pointer transition-all duration-300 rounded-3xl border-2
                ${config.bg} ${config.border}
                hover:shadow-xl hover:-translate-y-1
            `}
            padding="lg"
        >
            <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-2 ${config.border} ${config.text}`}>
                    {number}
                </div>

                <div>
                    <h4 className={`text-xs font-black uppercase tracking-widest ${config.text}`}>
                        {config.label}
                    </h4>
                    {guests !== undefined && guests > 0 && (
                        <p className="text-xs text-text-muted mt-1 font-bold">
                            {guests} {guests === 1 ? 'Guest' : 'Guests'}
                        </p>
                    )}
                </div>

                {amount !== undefined && amount > 0 && (
                    <div className="mt-2 text-lg font-black text-text-main font-mono">
                        ${amount.toFixed(2)}
                    </div>
                )}
            </div>
        </Card>
    );
};

import React from 'react';
import { motion } from 'framer-motion';
import { OrderStatus } from '@shared/types/database';

interface OrderStatusBadgeProps {
    status: OrderStatus | string;
    size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {

    const getConfig = (status: string) => {
        switch (status) {
            case 'PENDING': return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' };
            case 'PREPARING': return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Preparing' };
            case 'READY': return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Ready' };
            case 'COMPLETED': return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Completed' };
            case 'CANCELLED': return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled' };
            default: return { color: 'bg-white/10 text-gray-400 border-white/10', label: status };
        }
    };

    const config = getConfig(status);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm'
    };

    return (
        <motion.span
            key={status} // Triggers animation on change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`
        inline-flex items-center justify-center font-bold tracking-wider uppercase border
        rounded-full backdrop-blur-md
        ${config.color}
        ${sizeClasses[size]}
      `}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
            {config.label}
        </motion.span>
    );
}

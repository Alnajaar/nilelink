"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle2, Truck, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusCardProps {
  status: OrderStatus;
  count?: number;
  icon: React.ReactNode;
  onClick?: () => void;
  estimate?: string;
}

const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    label: 'PENDING',
    color: '#f59e0b',
  },
  confirmed: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'CONFIRMED',
    color: '#3b82f6',
  },
  shipped: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'bg-cyan-100 text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-700',
    label: 'SHIPPED',
    color: '#06b6d4',
  },
  delivered: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'DELIVERED',
    color: '#10b981',
  },
  cancelled: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-100 text-red-600',
    badge: 'bg-red-100 text-red-700',
    label: 'CANCELLED',
    color: '#ef4444',
  },
};

export default function OrderStatusCard({
  status,
  count,
  icon,
  onClick,
  estimate,
}: OrderStatusCardProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${config.bg} ${config.border} group hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.icon} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {count !== undefined && (
          <Badge className={`${config.badge} border-0 font-black text-sm`}>
            {count}
          </Badge>
        )}
      </div>

      <h3 className="text-xl font-black text-text uppercase tracking-tight mb-3">
        {config.label}
      </h3>

      {estimate && (
        <div className="flex items-center gap-2 text-sm font-bold text-text/60 mb-2">
          <Clock size={16} />
          <span>{estimate}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text opacity-40">
          {count || 0} order{(count || 0) !== 1 ? 's' : ''}
        </span>
        <ChevronRight size={16} className="text-text/40 group-hover:text-text group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}
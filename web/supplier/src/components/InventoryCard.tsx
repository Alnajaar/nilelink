"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/shared/Badge';

interface InventoryCardProps {
  name: string;
  sku: string;
  current: number;
  minimum: number;
  maximum: number;
  unit: string;
  price?: number;
  category?: string;
  onClick?: () => void;
}

export default function InventoryCard({
  name,
  sku,
  current,
  minimum,
  maximum,
  unit,
  price,
  category,
  onClick,
}: InventoryCardProps) {
  const stockPercentage = (current / maximum) * 100;
  const isLowStock = current < minimum;
  const isOptimal = current >= minimum && current <= maximum;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-6 border-2 border-gray-200 hover:border-primary transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-black text-text uppercase tracking-tight">{name}</h3>
            <p className="text-xs font-bold text-text/60 mt-1">{sku}</p>
            {category && (
              <Badge className="mt-2 bg-primary/10 text-primary border-0 text-xs font-black">
                {category}
              </Badge>
            )}
          </div>
          {isOptimal ? (
            <CheckCircle2 size={24} className="text-emerald-600" />
          ) : isLowStock ? (
            <AlertCircle size={24} className="text-amber-600" />
          ) : (
            <TrendingUp size={24} className="text-blue-600" />
          )}
        </div>

        {/* Stock Level */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-black text-text">
              {current} {unit}
            </span>
            <span className="text-xs font-bold text-text/60">
              Min: {minimum} | Max: {maximum}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${isLowStock ? 'bg-amber-500' : isOptimal ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {price && (
            <span className="text-lg font-black text-primary">
              ${(price * current).toFixed(2)}
            </span>
          )}
          <Badge
            className={`border-0 text-xs font-black uppercase ${isLowStock
                ? 'bg-amber-100 text-amber-700'
                : isOptimal
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
          >
            {isLowStock ? '⚠️ Low Stock' : isOptimal ? '✓ Optimal' : '📈 Excess'}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}
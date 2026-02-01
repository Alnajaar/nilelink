"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { AlertCircle, Zap } from 'lucide-react';

export type StationType = 'grill' | 'prep' | 'dessert' | 'drinks' | 'plating';

interface StationSelectorProps {
  selectedStation?: StationType;
  onSelect?: (station: StationType) => void;
  stationStats?: Record<StationType, { pending: number; preparing: number; total: number }>;
  isLoading?: boolean;
}

const stations: Record<StationType, { 
  label: string; 
  icon: string; 
  color: string; 
  bg: string; 
  bgLight: string;
  textColor: string;
  borderColor: string;
}> = {
  grill: { 
    label: 'GRILL', 
    icon: '🔥', 
    color: 'text-red-600', 
    bg: 'bg-red-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300'
  },
  prep: { 
    label: 'PREP', 
    icon: '🔪', 
    color: 'text-blue-600', 
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  dessert: { 
    label: 'DESSERT', 
    icon: '🍰', 
    color: 'text-pink-600', 
    bg: 'bg-pink-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-300'
  },
  drinks: { 
    label: 'DRINKS', 
    icon: '🥤', 
    color: 'text-cyan-600', 
    bg: 'bg-cyan-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-300'
  },
  plating: { 
    label: 'PLATING', 
    icon: '🍽️', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300'
  },
};

export default function StationSelector({
  selectedStation,
  onSelect,
  stationStats,
  isLoading = false,
}: StationSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.entries(stations) as [StationType, typeof stations.grill][]).map(([station, config], idx) => {
          const stats = stationStats?.[station];
          const isSelected = selectedStation === station;
          const hasUrgent = stats && stats.pending > 2;

          return (
            <motion.button
              key={station}
              onClick={() => onSelect?.(station)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group cursor-pointer transition-all"
            >
              <Card
                className={`p-6 text-center h-full border-2 transition-all relative overflow-hidden ${
                  isSelected
                    ? `${config.bgLight} ${config.borderColor} shadow-xl shadow-current/20 border-current`
                    : `bg-white hover:${config.bgLight} border-border-subtle hover:border-current/50`
                }`}
              >
                {/* Background Orb */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg}/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:${config.bg}/10 transition-all`} />

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="active-station"
                    className={`absolute top-2 right-2 w-3 h-3 ${config.bg} rounded-full`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Station Icon */}
                <motion.div
                  animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
                  className="text-5xl mb-3 relative z-10"
                >
                  {config.icon}
                </motion.div>

                {/* Station Label */}
                <h3 className={`font-black text-sm uppercase tracking-widest ${config.textColor} mb-4 relative z-10`}>
                  {config.label}
                </h3>

                {/* Stats Display */}
                {stats ? (
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-center gap-2">
                      {hasUrgent && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Zap size={14} className="text-red-500" />
                        </motion.div>
                      )}
                      <span className="text-2xl font-black text-text-primary">{stats.total}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                      <Badge className="bg-amber-100 text-amber-700 border-0 px-2 py-1">
                        {stats.pending}P
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-0 px-2 py-1">
                        {stats.preparing}A
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-black text-text-secondary/50 relative z-10">—</p>
                )}

                <p className="text-xs font-bold text-text-secondary/60 mt-4 relative z-10 uppercase tracking-widest">
                  {stats ? 'Orders' : 'No Data'}
                </p>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
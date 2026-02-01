"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { AlertCircle, TrendingUp } from 'lucide-react';

export type StationType = 'grill' | 'prep' | 'dessert' | 'drinks' | 'plating';

interface StationLoad {
  station: StationType;
  utilization: number;
  ordersCount: number;
  avgTime: number;
  status: 'optimal' | 'busy' | 'critical';
}

interface StationLoadIndicatorProps {
  stations: StationLoad[];
}

const stationColors: Record<StationType, { bg: string; text: string; icon: string; border: string }> = {
  grill: { bg: 'bg-red-50', text: 'text-red-700', icon: '🔥', border: 'border-red-200' },
  prep: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔪', border: 'border-blue-200' },
  dessert: { bg: 'bg-pink-50', text: 'text-pink-700', icon: '🍰', border: 'border-pink-200' },
  drinks: { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: '🥤', border: 'border-cyan-200' },
  plating: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🍽️', border: 'border-emerald-200' },
};

const statusConfig = {
  optimal: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Optimal' },
  busy: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Busy' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
};

export default function StationLoadIndicator({ stations }: StationLoadIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="p-8 border-2 border-border-subtle bg-white/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
              Station Load Analysis
            </h3>
            <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest mt-1">
              Real-time Capacity & Bottleneck Detection
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center"
          >
            <TrendingUp size={18} className="text-primary" />
          </motion.div>
        </div>

        <div className="space-y-6">
          {stations.map((station, idx) => {
            const config = stationColors[station.station];
            const status = statusConfig[station.status];
            const isCritical = station.status === 'critical';

            return (
              <motion.div
                key={station.station}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border-2 transition-all ${config.bg} ${config.border} ${
                  isCritical ? 'ring-2 ring-red-300' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div>
                      <h4 className={`font-black uppercase tracking-widest text-sm ${config.text}`}>
                        {station.station.toUpperCase()}
                      </h4>
                      <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest mt-1">
                        {station.ordersCount} Orders
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-[0.1em] ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </motion.div>
                </div>

                {/* Load Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-text-secondary/60 uppercase tracking-widest">
                      Utilization
                    </span>
                    <span className={`text-sm font-black ${config.text}`}>
                      {station.utilization}%
                    </span>
                  </div>

                  <motion.div
                    className="h-3 bg-white/50 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${station.utilization}%` }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className={`h-full transition-colors ${
                        station.status === 'critical'
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : station.status === 'busy'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                    />
                  </motion.div>

                  {/* Avg Time */}
                  <div className="flex items-center justify-between pt-2 border-t border-current/10">
                    <span className="text-xs font-bold text-text-secondary/60">Avg Prep Time</span>
                    <span className="text-sm font-black text-text-primary">
                      {station.avgTime}
                      <span className="text-xs opacity-60">m</span>
                    </span>
                  </div>
                </div>

                {/* Warning */}
                {isCritical && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-current/20 flex items-start gap-3"
                  >
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
                      Capacity Alert: Consider assigning additional staff
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
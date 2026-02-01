"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Clock, Zap } from 'lucide-react';

interface TimeTrackingWidgetProps {
  elapsedSeconds: number;
  targetSeconds: number;
  orderNumber: string;
  onWarning?: (isWarning: boolean) => void;
  onCritical?: (isCritical: boolean) => void;
}

export default function TimeTrackingWidget({
  elapsedSeconds,
  targetSeconds,
  orderNumber,
  onWarning,
  onCritical,
}: TimeTrackingWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const percentageComplete = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const isWarning = elapsedSeconds > targetSeconds && elapsedSeconds <= targetSeconds + 300; // 5 min warning
  const isCritical = elapsedSeconds > targetSeconds + 300;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    onWarning?.(isWarning);
  }, [isWarning, onWarning]);

  useEffect(() => {
    onCritical?.(isCritical);
  }, [isCritical, onCritical]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const targetMinutes = Math.floor(targetSeconds / 60);

  const getTimeColor = () => {
    if (isCritical) return 'from-red-600 to-red-400';
    if (isWarning) return 'from-amber-600 to-orange-400';
    return 'from-emerald-600 to-teal-400';
  };

  const getTextColor = () => {
    if (isCritical) return 'text-red-700';
    if (isWarning) return 'text-amber-700';
    return 'text-emerald-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className={`p-6 border-2 overflow-hidden relative ${
        isCritical ? 'border-red-300 bg-red-50' : isWarning ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'
      }`}>
        {/* Background Orb */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getTimeColor()} opacity-5 blur-3xl rounded-full -mr-16 -mt-16`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock size={18} className={getTextColor()} />
              <span className={`font-black uppercase text-xs tracking-widest ${getTextColor()}`}>
                Order #{orderNumber}
              </span>
            </div>
            {isCritical && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-red-600 rounded-full"
              />
            )}
          </div>

          {/* Time Display */}
          <motion.div
            animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
            className="text-center mb-6"
          >
            <div className={`text-5xl font-black tracking-tighter leading-none mb-2 ${getTextColor()}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
              Target: {targetMinutes}m
            </p>
          </motion.div>

          {/* Progress Circle */}
          <div className="mb-6 relative w-full h-2 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageComplete}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`h-full bg-gradient-to-r ${getTimeColor()}`}
            />
          </div>

          {/* Status Message */}
          {isCritical ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-center justify-center text-red-700"
            >
              <Zap size={14} />
              <span className="text-xs font-black uppercase tracking-widest">
                Critical Delay - Immediate Attention Required
              </span>
            </motion.div>
          ) : isWarning ? (
            <div className="text-center text-amber-700">
              <span className="text-xs font-black uppercase tracking-widest">
                ⚠️ Behind Schedule by {minutes - targetMinutes}m
              </span>
            </div>
          ) : (
            <div className="text-center text-emerald-700">
              <span className="text-xs font-black uppercase tracking-widest">
                ✓ On Track
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
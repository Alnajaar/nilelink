"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  timestamp: Date;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  station: string;
  duration?: number;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  estimatedCompletionTime?: Date;
  slaTargetMinutes?: number;
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: '⏳' },
  preparing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '👨‍🍳' },
  ready: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✓' },
  completed: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '✅' },
};

export default function OrderTimeline({ 
  events, 
  estimatedCompletionTime,
  slaTargetMinutes = 30 
}: OrderTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSLACompliant, setIsSLACompliant] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (estimatedCompletionTime) {
        setIsSLACompliant(now <= estimatedCompletionTime);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [estimatedCompletionTime]);

  const getTimeRemaining = () => {
    if (!estimatedCompletionTime) return null;
    const diff = estimatedCompletionTime.getTime() - currentTime.getTime();
    if (diff <= 0) return { label: 'READY', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    const isCritical = minutes < 5;
    return {
      label: `${minutes}m ${seconds}s`,
      color: isCritical ? 'text-red-600' : minutes < 10 ? 'text-amber-600' : 'text-blue-600',
      bg: isCritical ? 'bg-red-50' : minutes < 10 ? 'bg-amber-50' : 'bg-blue-50',
      isCritical
    };
  };

  const timeRemaining = getTimeRemaining();
  const completionPercentage = events.length > 0 ? Math.min((events.filter(e => e.status === 'completed').length / 4) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="p-8 border-2 border-border-subtle bg-white/60 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                Order Timeline
              </h3>
              <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest mt-1">
                Real-time Progress Tracking
              </p>
            </div>
          </div>

          {timeRemaining && (
            <motion.div
              animate={timeRemaining.isCritical ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: timeRemaining.isCritical ? Infinity : 0 }}
              className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 font-black uppercase text-sm tracking-[0.1em] ${
                timeRemaining.bg
              } border-current/20 ${timeRemaining.color}`}
            >
              <Clock size={16} />
              {timeRemaining.label}
            </motion.div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-text-secondary/60 uppercase tracking-widest">
              Completion Status
            </span>
            <span className="text-sm font-black text-text-primary">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <motion.div
            className="h-2 bg-neutral rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-primary to-emerald-500"
            />
          </motion.div>
        </div>

        {/* SLA Status */}
        {estimatedCompletionTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-8 p-4 rounded-2xl border-2 flex items-center gap-3 ${
              isSLACompliant 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            {isSLACompliant ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                  On Track • SLA Target: {slaTargetMinutes}min
                </p>
              </>
            ) : (
              <>
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 animate-pulse" />
                <p className="text-xs font-black text-red-700 uppercase tracking-widest">
                  Behind Schedule • Immediate Attention Needed
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock size={32} className="text-text-secondary/30 mb-3" />
              <p className="text-xs font-black text-text-secondary/50 uppercase tracking-widest">
                No Events Yet
              </p>
            </div>
          ) : (
            events.map((event, index) => {
              const statusColor = statusColors[event.status];
              const isLast = index === events.length - 1;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 relative"
                >
                  {/* Timeline Dot & Line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ scale: isLast ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: isLast ? 2 : 0, repeat: isLast ? Infinity : 0 }}
                      className={`w-5 h-5 rounded-full border-3 flex items-center justify-center flex-shrink-0 ${
                        statusColor.bg
                      } border-current`}
                    >
                      {!isLast && (
                        <div className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </motion.div>
                    {!isLast && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 48 }}
                        className={`w-1 ${statusColor.bg} my-2`}
                      />
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="pb-4 flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-black text-sm uppercase tracking-[0.1em] ${statusColor.text}`}>
                        {statusColor.icon} {event.status.toUpperCase()}
                      </span>
                      <Badge className={`${statusColor.bg} ${statusColor.text} text-xs font-bold border-0 px-3 py-1`}>
                        {event.station}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-text-secondary/70">
                      <span>{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      {event.duration && (
                        <>
                          <span className="text-text-secondary/30">•</span>
                          <span className="text-text-primary font-black">⏱️ {event.duration}m</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </motion.div>
  );
}
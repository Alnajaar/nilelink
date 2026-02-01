"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Clock, TrendingUp, AlertCircle, CheckCircle2, Flame, Users, Zap } from 'lucide-react';

interface KitchenMetrics {
  activeOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  averagePrepTime: number;
  slacompliance: number;
  kitchenUtilization: number;
  completedToday: number;
  estimatedWaitTime: number;
}

interface KitchenMetricsHUDProps {
  metrics: KitchenMetrics;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function KitchenMetricsHUD({
  metrics,
  isLoading = false,
  onRefresh,
}: KitchenMetricsHUDProps) {
  const [displayMetrics, setDisplayMetrics] = useState(metrics);

  useEffect(() => {
    setDisplayMetrics(metrics);
  }, [metrics]);

  const metricsList = [
    {
      icon: Flame,
      label: 'Active Orders',
      value: displayMetrics.activeOrders,
      unit: 'ops',
      color: 'from-primary to-orange-500',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      trend: '+2' // would come from props
    },
    {
      icon: AlertCircle,
      label: 'Pending',
      value: displayMetrics.pendingOrders,
      unit: 'waiting',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      isCritical: displayMetrics.pendingOrders > 5
    },
    {
      icon: Clock,
      label: 'Avg Prep Time',
      value: displayMetrics.averagePrepTime,
      unit: 'min',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: CheckCircle2,
      label: 'SLA Compliance',
      value: displayMetrics.slacompliance,
      unit: '%',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      isPercentage: true
    },
    {
      icon: TrendingUp,
      label: 'Kitchen Load',
      value: displayMetrics.kitchenUtilization,
      unit: '%',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      isPercentage: true,
      isCritical: displayMetrics.kitchenUtilization > 80
    },
    {
      icon: Users,
      label: 'Completed Today',
      value: displayMetrics.completedToday,
      unit: 'orders',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+15'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsList.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`p-6 border-2 border-border-subtle overflow-hidden relative group hover:shadow-xl transition-all ${metric.bgColor}`}>
                {/* Background Gradient Orb */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-all`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-md`}
                    >
                      <Icon size={20} className={metric.textColor} />
                    </motion.div>
                    {metric.isCritical && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs font-black uppercase">
                          Alert
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    <motion.div
                      key={displayMetrics[metric.label.toLowerCase().replace(/\s/g, '') as keyof KitchenMetrics] || Math.random()}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-5xl font-black tracking-tighter leading-none mb-2 ${metric.textColor}`}
                    >
                      {metric.isPercentage ? metric.value : Math.round(metric.value)}
                      <span className="text-lg opacity-60">{metric.isPercentage ? '%' : ''}</span>
                    </motion.div>
                    <p className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
                      {metric.label}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-current/10 flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">
                      {metric.unit}
                    </span>
                    {metric.trend && (
                      <motion.span
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                      >
                        {metric.trend}
                      </motion.span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
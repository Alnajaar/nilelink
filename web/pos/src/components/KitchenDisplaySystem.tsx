"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertCircle, CheckCircle2, Flame, TrendingUp, Package,
  Filter, Zap, ChefHat, Timer, Pause, Play, Menu, X
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';
export type StationType = 'grill' | 'prep' | 'dessert' | 'drinks' | 'plating';
export type PriorityType = 'normal' | 'high' | 'urgent';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
  station: StationType;
  status: OrderStatus;
  timeStarted?: Date;
  estimatedTime: number;
}

interface KDSOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  type: 'dine-in' | 'takeaway' | 'delivery';
  table?: string;
  createdAt: Date;
  priority: PriorityType;
}

interface KitchenDisplaySystemProps {
  orders: KDSOrder[];
  currentStation?: StationType;
  onStatusChange?: (orderId: string, itemId: string, status: OrderStatus) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const stationConfig: Record<StationType, { bg: string; border: string; icon: string; label: string; bgLight: string; textColor: string }> = {
  grill: { bg: 'bg-red-600', bgLight: 'bg-red-50', border: 'border-red-300', textColor: 'text-red-700', icon: '🔥', label: 'GRILL STATION' },
  prep: { bg: 'bg-blue-600', bgLight: 'bg-blue-50', border: 'border-blue-300', textColor: 'text-blue-700', icon: '🔪', label: 'PREP STATION' },
  dessert: { bg: 'bg-pink-600', bgLight: 'bg-pink-50', border: 'border-pink-300', textColor: 'text-pink-700', icon: '🍰', label: 'DESSERT STATION' },
  drinks: { bg: 'bg-cyan-600', bgLight: 'bg-cyan-50', border: 'border-cyan-300', textColor: 'text-cyan-700', icon: '🥤', label: 'BEVERAGE STATION' },
  plating: { bg: 'bg-emerald-600', bgLight: 'bg-emerald-50', border: 'border-emerald-300', textColor: 'text-emerald-700', icon: '🍽️', label: 'PLATING STATION' },
};

const statusConfig: Record<OrderStatus, { bg: string; bgLight: string; text: string; label: string; icon: string }> = {
  pending: { bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', label: 'PENDING', icon: '⏳' },
  preparing: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', label: 'PREPARING', icon: '👨‍🍳' },
  ready: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', label: 'READY', icon: '✓' },
  completed: { bg: 'bg-purple-500', bgLight: 'bg-purple-50', text: 'text-purple-700', label: 'COMPLETED', icon: '✅' },
};

const priorityConfig: Record<PriorityType, { color: string; bg: string; bgLight: string; label: string }> = {
  normal: { color: 'text-slate-600', bg: 'bg-slate-100', bgLight: 'bg-slate-50', label: 'NORMAL' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', bgLight: 'bg-orange-50', label: 'HIGH' },
  urgent: { color: 'text-red-600', bg: 'bg-red-100', bgLight: 'bg-red-50', label: 'URGENT' },
};

export default function KitchenDisplaySystem({
  orders,
  currentStation,
  onStatusChange,
  onRefresh,
  isLoading = false,
}: KitchenDisplaySystemProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('pending');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');
  const [isPaused, setIsPaused] = useState(false);

  const getStationItems = () => {
    return orders
      .flatMap(order =>
        order.items
          .filter(item => !currentStation || item.station === currentStation)
          .map(item => ({ 
            ...item, 
            orderId: order.id, 
            orderNumber: order.orderNumber, 
            orderPriority: order.priority,
            orderType: order.type,
            table: order.table
          }))
      )
      .filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { urgent: 0, high: 1, normal: 2 };
          const priorityDiff = priorityOrder[a.orderPriority] - priorityOrder[b.orderPriority];
          if (priorityDiff !== 0) return priorityDiff;
        }
        return (a.timeStarted?.getTime() || 0) - (b.timeStarted?.getTime() || 0);
      });
  };

  const stationItems = getStationItems();
  const pendingCount = stationItems.filter(i => i.status === 'pending').length;
  const preparingCount = stationItems.filter(i => i.status === 'preparing').length;
  const readyCount = stationItems.filter(i => i.status === 'ready').length;

  const handleStatusAdvance = (orderId: string, itemId: string, currentStatus: OrderStatus) => {
    if (isPaused) return;
    const statusSequence: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statusSequence.indexOf(currentStatus);
    if (currentIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIndex + 1];
      onStatusChange?.(orderId, itemId, nextStatus);
    }
  };

  const getTimeElapsed = (startTime?: Date) => {
    if (!startTime) return '0m';
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    return `${diff}m`;
  };

  const getTimeWarning = (startTime?: Date, estimatedTime?: number): 'normal' | 'warning' | 'critical' => {
    if (!startTime) return 'normal';
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);
    if (estimatedTime && elapsed > estimatedTime + 10) return 'critical';
    if (estimatedTime && elapsed > estimatedTime) return 'warning';
    return 'normal';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-neutral via-background to-neutral/50 space-y-6 p-6">
      {/* Advanced Header with Metrics */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-border-subtle rounded-3xl p-8 shadow-lg"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <ChefHat size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none mb-2">
                {currentStation ? stationConfig[currentStation].label : 'KITCHEN DISPLAY'}
              </h2>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">
                Real-time Order Management & Sequence Tracking
              </p>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="flex items-center gap-8">
            <div className="flex gap-6">
              {[
                { icon: AlertCircle, count: pendingCount, label: 'PENDING', color: 'text-amber-600' },
                { icon: Timer, count: preparingCount, label: 'PREPARING', color: 'text-blue-600' },
                { icon: CheckCircle2, count: readyCount, label: 'READY', color: 'text-emerald-600' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center">
                      <Icon size={20} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-text-secondary uppercase tracking-widest opacity-60">{stat.label}</p>
                      <p className="text-3xl font-black text-text-primary tracking-tight">{stat.count}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Control Buttons */}
            <div className="h-12 w-[1px] bg-border-subtle" />
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaused(!isPaused)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all font-black ${
                  isPaused 
                    ? 'bg-red-100 text-red-600 shadow-lg shadow-red-100' 
                    : 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100'
                }`}
                title={isPaused ? 'Resume Operations' : 'Pause Operations'}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefresh}
                disabled={isLoading}
                className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all font-black disabled:opacity-50"
                title="Refresh Orders"
              >
                <TrendingUp size={18} className={isLoading ? 'animate-spin' : ''} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            {(['all', 'pending', 'preparing'] as const).map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all border ${
                  filter === status
                    ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20'
                    : 'bg-white text-text-secondary border-border-subtle hover:border-primary/50'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            {(['priority', 'time'] as const).map((sort) => (
              <motion.button
                key={sort}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all border ${
                  sortBy === sort
                    ? 'bg-neutral text-text-primary border-text-primary/20'
                    : 'bg-white text-text-secondary border-border-subtle hover:border-text-secondary/50'
                }`}
              >
                {sort === 'priority' ? '⚡ Priority' : '⏱️ Time'}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
          <AnimatePresence mode="popLayout">
            {stationItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-2xl font-black text-text-primary uppercase mb-2 tracking-tight">Station Clear</h3>
                <p className="text-text-secondary font-bold max-w-sm">All orders completed for this station. Great work! 🎉</p>
              </motion.div>
            ) : (
              stationItems.map((item, idx) => {
                const status = statusConfig[item.status];
                const station = stationConfig[item.station];
                const priority = priorityConfig[item.orderPriority];
                const timeWarning = getTimeWarning(item.timeStarted, item.estimatedTime);

                return (
                  <motion.div
                    key={`${item.orderId}-${item.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: idx * 0.05 }}
                    className="cursor-pointer h-full"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      onClick={() => handleStatusAdvance(item.orderId, item.id, item.status)}
                      className={`h-full rounded-3xl p-6 border-2 transition-all group overflow-hidden relative ${
                        station.bgLight
                      } ${station.border} hover:shadow-2xl hover:border-primary/50`}
                    >
                      {/* Background Gradient Orb */}
                      <div className={`absolute top-0 right-0 w-32 h-32 ${station.bg}/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:${station.bg}/20 transition-all`} />

                      {/* Priority Badge */}
                      <motion.div
                        animate={
                          item.orderPriority === 'urgent'
                            ? { scale: [1, 1.1, 1] }
                            : undefined
                        }
                        transition={
                          item.orderPriority === 'urgent'
                            ? { duration: 1, repeat: Infinity }
                            : {}
                        }
                        className="relative z-10 mb-4"
                      >
                        <Badge
                          className={`${priority.bg} ${priority.color} border-0 font-black text-xs uppercase px-3 py-1 shadow-md`}
                        >
                          {item.orderPriority === 'urgent'
                            ? '🚨 URGENT'
                            : item.orderPriority === 'high'
                            ? '⚡ HIGH'
                            : '• NORMAL'}
                        </Badge>
                      </motion.div>

                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-current/10 relative z-10">
                        <div>
                          <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter leading-none mb-2">
                            #{item.orderNumber}
                          </h3>
                          <p className="text-xs font-bold text-text-secondary/70 uppercase tracking-widest">
                            {item.orderType.replace('-', ' ')} {item.table ? `• TABLE ${item.table}` : ''}
                          </p>
                        </div>
                        <div className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">{station.icon}</div>
                      </div>

                      {/* Item Details */}
                      <div className="mb-6 relative z-10">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-primary shadow-sm flex-shrink-0">
                            {item.quantity}×
                          </div>
                          <p className="text-sm font-bold text-text-primary line-clamp-2 pt-1">{item.name}</p>
                        </div>

                        {item.specialInstructions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-white/60 rounded-2xl border-l-4 border-primary"
                          >
                            <p className="text-xs font-bold text-text-primary/80 italic leading-snug">
                              💬 {item.specialInstructions}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Status & Time Section */}
                      <div className="space-y-3 pt-4 border-t-2 border-current/10 relative z-10">
                        {/* Time Elapsed with Warning */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-text-secondary/60 uppercase tracking-widest">Elapsed</span>
                          <motion.span
                            animate={
                              timeWarning === 'critical'
                                ? { color: ['#EF4444', '#FCA5A5', '#EF4444'] }
                                : {}
                            }
                            transition={
                              timeWarning === 'critical'
                                ? { duration: 1, repeat: Infinity }
                                : {}
                            }
                            className={`text-2xl font-black tracking-tighter ${
                              timeWarning === 'critical'
                                ? 'text-red-600'
                                : timeWarning === 'warning'
                                ? 'text-amber-600'
                                : 'text-text-primary'
                            }`}
                          >
                            {getTimeElapsed(item.timeStarted)}
                          </motion.span>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-center ${status.bgLight} border-2 ${status.bg.replace('bg-', 'border-')}/30`}
                        >
                          <span className="text-2xl block mb-1">{status.icon}</span>
                          <p className={`text-xs font-black uppercase tracking-[0.2em] ${status.text}`}>
                            {status.label}
                          </p>
                        </div>

                        {/* Action Button */}
                        {item.status !== 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusAdvance(item.orderId, item.id, item.status);
                            }}
                            disabled={isPaused}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-background font-black uppercase text-xs rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-[0.2em]"
                          >
                            {item.status === 'pending'
                              ? '▶️ Start Prep'
                              : item.status === 'preparing'
                              ? '✓ Mark Ready'
                              : '✅ Complete'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 195, 137, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 195, 137, 0.4);
        }
      `}</style>
    </div>
  );
}
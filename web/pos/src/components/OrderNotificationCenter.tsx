"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';

export type NotificationType = 'order' | 'alert' | 'info' | 'success';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // auto-dismiss after ms
}

interface OrderNotificationCenterProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

const typeConfig: Record<NotificationType, { icon: React.ComponentType<any>; bg: string; text: string; border: string }> = {
  order: { icon: Bell, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  alert: { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  info: { icon: Info, bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const positionClasses: Record<string, string> = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
};

export default function OrderNotificationCenter({
  notifications,
  onDismiss,
  position = 'bottom-right',
  maxVisible = 4,
}: OrderNotificationCenterProps) {
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setDisplayNotifications(notifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  useEffect(() => {
    // Auto-dismiss notifications
    const timers = notifications.map(notification => {
      if (notification.duration) {
        return setTimeout(() => {
          onDismiss?.(notification.id);
        }, notification.duration);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].type === 'alert') {
      playNotificationSound();
    }
  }, [notifications]);

  return (
    <div className={`fixed z-50 ${positionClasses[position]} pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {displayNotifications.map((notification, idx) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, x: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`mb-4 pointer-events-auto`}
            >
              <motion.div
                className={`${config.bg} ${config.border} border-2 rounded-2xl p-5 shadow-xl backdrop-blur-xl max-w-md overflow-hidden relative`}
              >
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 blur-2xl rounded-full -mr-8 -mt-8`} />

                {/* Content */}
                <div className="relative z-10 flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 border border-current/20`}>
                    <Icon size={18} className={config.text} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-sm uppercase tracking-[0.1em] ${config.text} mb-1`}>
                      {notification.title}
                    </h4>
                    <p className="text-xs font-bold text-text-secondary/80 leading-snug">
                      {notification.message}
                    </p>

                    {notification.action && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={notification.action.onClick}
                        className={`mt-3 text-xs font-black uppercase tracking-[0.1em] ${config.text} hover:opacity-80 transition-opacity`}
                      >
                        {notification.action.label} →
                      </motion.button>
                    )}
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDismiss?.(notification.id)}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors ${config.text}`}
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Auto-dismiss Progress */}
                {notification.duration && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notification.duration / 1000 }}
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-current opacity-30"
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, X, Package, ShoppingCart, TrendingDown,
    AlertTriangle, Info, CheckCircle, XCircle, Filter,
    MoreVertical, Trash2, Eye
} from 'lucide-react';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

type NotificationType = 'order' | 'inventory' | 'payment' | 'system' | 'alert';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | NotificationType>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'order',
            priority: 'high',
            title: 'New Order Received',
            message: 'Order #ORD-2345 for 50kg chicken breast has been placed.',
            timestamp: new Date(Date.now() - 5 * 60000),
            read: false,
            actionUrl: '/orders'
        },
        {
            id: '2',
            type: 'inventory',
            priority: 'urgent',
            title: 'Low Stock Alert',
            message: 'Ground Beef is running low (5kg remaining). Consider restocking.',
            timestamp: new Date(Date.now() - 30 * 60000),
            read: false,
            actionUrl: '/inventory'
        },
        {
            id: '3',
            type: 'payment',
            priority: 'medium',
            title: 'Payment Received',
            message: 'Payment of $1,250 received for invoice #INV-789.',
            timestamp: new Date(Date.now() - 2 * 60 * 60000),
            read: true,
            actionUrl: '/ledger'
        },
        {
            id: '4',
            type: 'order',
            priority: 'medium',
            title: 'Order Shipped',
            message: 'Order #ORD-2340 has been shipped successfully.',
            timestamp: new Date(Date.now() - 4 * 60 * 60000),
            read: true,
            actionUrl: '/fulfillment'
        },
        {
            id: '5',
            type: 'system',
            priority: 'low',
            title: 'System Update',
            message: 'New features available! Check out the updated dashboard.',
            timestamp: new Date(Date.now() - 24 * 60 * 60000),
            read: true,
            actionUrl: '/dashboard'
        }
    ]);

    const getTypeIcon = (type: NotificationType) => {
        switch (type) {
            case 'order': return ShoppingCart;
            case 'inventory': return Package;
            case 'payment': return TrendingDown;
            case 'alert': return AlertTriangle;
            case 'system': return Info;
        }
    };

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case 'order': return 'text-blue-400 bg-blue-500/10';
            case 'inventory': return 'text-purple-400 bg-purple-500/10';
            case 'payment': return 'text-emerald-400 bg-emerald-500/10';
            case 'alert': return 'text-red-400 bg-red-500/10';
            case 'system': return 'text-yellow-400 bg-yellow-500/10';
        }
    };

    const getPriorityBadge = (priority: NotificationPriority) => {
        const colors = {
            low: 'bg-slate-500/10 text-slate-400',
            medium: 'bg-blue-500/10 text-blue-400',
            high: 'bg-orange-500/10 text-orange-400',
            urgent: 'bg-red-500/10 text-red-400'
        };
        return colors[priority];
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const filteredNotifications = notifications.filter(notif => {
        if (showUnreadOnly && notif.read) return false;
        if (filter !== 'all' && notif.type !== filter) return false;
        return true;
    });

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
                            <p className="text-slate-400">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark All Read</span>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('order')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'order'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setFilter('inventory')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'inventory'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                Inventory
                            </button>
                            <button
                                onClick={() => setFilter('payment')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'payment'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                Payments
                            </button>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showUnreadOnly}
                                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-400">Unread only</span>
                        </label>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-16">
                                <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">No notifications</h3>
                                <p className="text-slate-500">You're all caught up!</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification, index) => {
                                const Icon = getTypeIcon(notification.type);

                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-4 hover:bg-slate-900/70 transition ${notification.read ? 'border-slate-800/50' : 'border-blue-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-lg ${getTypeColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-1">
                                                    <h3 className="font-semibold text-white">{notification.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                                                            {notification.priority}
                                                        </span>
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                                            {getTimeAgo(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-sm mb-3">{notification.message}</p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {notification.actionUrl && (
                                                        <a
                                                            href={notification.actionUrl}
                                                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                                                        >
                                                            View Details →
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4 text-emerald-400" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 hover:bg-slate-800 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

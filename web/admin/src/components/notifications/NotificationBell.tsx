'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X, Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from './NotificationContext';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, otherwise standard classnames

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'error': return <AlertOctagon className="w-4 h-4 text-red-400" />;
            case 'alert': return <Bell className="w-4 h-4 text-purple-400" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/5 transition-colors group"
            >
                <Bell className={cn("w-6 h-6 transition-colors", isOpen ? "text-blue-400" : "text-gray-400 group-hover:text-white")} />

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#02050a]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0B1121] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-blue-400 transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={16} />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-red-400 transition-colors"
                                        title="Clear all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className={cn(
                                                "p-4 hover:bg-white/5 transition-colors relative group",
                                                !n.read ? "bg-blue-500/5" : ""
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={cn("text-xs font-bold", !n.read ? "text-white" : "text-gray-400")}>
                                                            {n.title}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed mb-2 break-words">
                                                        {n.message}
                                                    </p>

                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                        {!n.read && (
                                                            <button
                                                                onClick={() => markAsRead(n.id)}
                                                                className="text-[10px] text-blue-400 hover:underline"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n.id)}
                                                            className="text-[10px] text-red-400 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-white/5 bg-black/20 text-center">
                            <button className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
                                View All History
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

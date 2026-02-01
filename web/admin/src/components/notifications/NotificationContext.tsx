'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'alert';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('admin_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        } else {
            // Add initial greeting notification
            addNotification({
                type: 'info',
                title: 'Welcome Back',
                message: 'System is fully operational. Dashboard real-time sync is active.',
            });
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

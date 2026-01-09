'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    notify: (notificationOrType: Omit<Notification, 'id'> | 'success' | 'error' | 'warning' | 'info', message?: string, duration?: number) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after duration
        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration || 5000);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const notify = (notificationOrType: any, message?: string, duration?: number) => {
        if (typeof notificationOrType === 'object') {
            // Called with notification object
            addNotification(notificationOrType);
        } else {
            // Called with type, message, duration
            addNotification({ type: notificationOrType, title: message || '', duration });
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            notify,
            removeNotification,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
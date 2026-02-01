import { useState, useEffect, useCallback } from 'react';
import { notificationService, type NotificationPayload } from '../services/NotificationService';

export const useNotifications = (userId?: string, userType?: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin') => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Load initial notifications if userId is provided
  useEffect(() => {
    if (userId) {
      const userNotifications = notificationService.getUserNotifications(userId);
      setNotifications(userNotifications);
      setUnreadCount(notificationService.getUnreadCount(userId));
    }
  }, [userId]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!userType) return;

    const handleNotification = (notification: NotificationPayload) => {
      setNotifications(prev => [notification, ...prev]);
      
      if (userId) {
        setUnreadCount(notificationService.getUnreadCount(userId));
      }
    };

    // Subscribe to notifications for this user type
    notificationService.subscribeToType(userType, handleNotification);

    // If we have a specific user, subscribe to their notifications
    if (userId) {
      notificationService.subscribeToUser(userId, userType, handleNotification);
    }

    return () => {
      notificationService.unsubscribe(handleNotification);
    };
  }, [userType, userId]);

  const markAsRead = useCallback((notificationId: string) => {
    if (userId) {
      notificationService.markAsRead(notificationId, userId);
      setUnreadCount(notificationService.getUnreadCount(userId));
      
      // Update local state to reflect the read status
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    if (userId) {
      notificationService.markAllAsRead(userId);
      setUnreadCount(0);
      
      // Update local state to reflect the read status
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  }, [userId]);

  const sendNotification = useCallback((
    recipientId: string,
    recipientType: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) => {
    return notificationService.sendToUser(recipientId, recipientType, title, message, metadata);
  }, []);

  const broadcastNotification = useCallback((
    type: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) => {
    return notificationService.broadcastToType(type, title, message, metadata);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    broadcastNotification,
    getUnreadNotifications: userId ? () => notificationService.getUnreadUserNotifications(userId) : () => [],
    getRecentNotifications: (limit: number = 10) => notificationService.getRecentNotifications(limit),
  };
};
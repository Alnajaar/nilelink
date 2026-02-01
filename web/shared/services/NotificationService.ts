import { EventEmitter } from 'events';

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'broadcast';
  recipientType: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin';
  recipientId?: string;
  senderId: string;
  timestamp: number;
  read: boolean;
  metadata?: Record<string, any>;
}

interface NotificationListener {
  (notification: NotificationPayload): void;
}

class NotificationService {
  private static instance: NotificationService;
  private emitter: EventEmitter;
  private notifications: Map<string, NotificationPayload>;
  private unreadCounts: Map<string, number>;

  private constructor() {
    this.emitter = new EventEmitter();
    this.notifications = new Map();
    this.unreadCounts = new Map();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send a notification to specific recipients
   */
  public sendNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>): NotificationPayload {
    const notification: NotificationPayload = {
      ...payload,
      id: this.generateId(),
      timestamp: Date.now(),
      read: false
    };

    // Store the notification
    this.notifications.set(notification.id, notification);

    // Update unread count for recipient
    if (notification.recipientId) {
      const currentCount = this.unreadCounts.get(notification.recipientId) || 0;
      this.unreadCounts.set(notification.recipientId, currentCount + 1);
    }

    // Emit the notification event
    this.emitter.emit('notification', notification);
    this.emitter.emit(`notification:${notification.recipientType}`, notification);
    
    if (notification.recipientId) {
      this.emitter.emit(`notification:${notification.recipientType}:${notification.recipientId}`, notification);
    }

    return notification;
  }

  /**
   * Send a broadcast notification to all users of a specific type
   */
  public broadcastToType(
    type: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): NotificationPayload[] {
    const payload = {
      title,
      message,
      type: 'broadcast' as const,
      recipientType: type,
      senderId: 'system',
      metadata
    };

    // For a real system, this would broadcast to all users of the specified type
    // For now, we'll just create a notification that can be queried
    const notification = this.sendNotification(payload);
    return [notification]; // In a real system, this would return all sent notifications
  }

  /**
   * Send a targeted notification to a specific user
   */
  public sendToUser(
    recipientId: string,
    recipientType: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): NotificationPayload {
    const payload = {
      title,
      message,
      type: 'info' as const,
      recipientType,
      recipientId,
      senderId: 'system',
      metadata
    };

    return this.sendNotification(payload);
  }

  /**
   * Subscribe to notifications for a specific type
   */
  public subscribeToType(type: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin', listener: NotificationListener): void {
    this.emitter.on(`notification:${type}`, listener);
  }

  /**
   * Subscribe to notifications for a specific user
   */
  public subscribeToUser(userId: string, type: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin', listener: NotificationListener): void {
    this.emitter.on(`notification:${type}:${userId}`, listener);
  }

  /**
   * Subscribe to all notifications
   */
  public subscribe(listener: NotificationListener): void {
    this.emitter.on('notification', listener);
  }

  /**
   * Unsubscribe from notifications
   */
  public unsubscribe(listener: NotificationListener): void {
    this.emitter.removeListener('notification', listener);
  }

  /**
   * Mark a notification as read
   */
  public markAsRead(notificationId: string, userId?: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    notification.read = true;
    
    // Update unread count if user ID is provided
    if (userId) {
      const currentCount = this.unreadCounts.get(userId) || 0;
      if (currentCount > 0) {
        this.unreadCounts.set(userId, Math.max(0, currentCount - 1));
      }
    }

    return true;
  }

  /**
   * Mark all notifications for a user as read
   */
  public markAllAsRead(userId: string): void {
    const userNotifications = this.getUserNotifications(userId);
    userNotifications.forEach(notification => {
      this.markAsRead(notification.id, userId);
    });
  }

  /**
   * Get notifications for a specific user
   */
  public getUserNotifications(userId: string): NotificationPayload[] {
    return Array.from(this.notifications.values())
      .filter(notification => notification.recipientId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unread notifications for a specific user
   */
  public getUnreadUserNotifications(userId: string): NotificationPayload[] {
    return this.getUserNotifications(userId).filter(notification => !notification.read);
  }

  /**
   * Get unread count for a user
   */
  public getUnreadCount(userId: string): number {
    return this.unreadCounts.get(userId) || 0;
  }

  /**
   * Get notifications by type
   */
  public getNotificationsByType(type: 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin'): NotificationPayload[] {
    return Array.from(this.notifications.values())
      .filter(notification => notification.recipientType === type)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get recent notifications
   */
  public getRecentNotifications(limit: number = 10): NotificationPayload[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear all notifications (for testing purposes)
   */
  public clearAllNotifications(): void {
    this.notifications.clear();
    this.unreadCounts.clear();
  }

  /**
   * Generate a unique ID for notifications
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  public cleanupOldNotifications(): number {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.timestamp < thirtyDaysAgo) {
        this.notifications.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export types
export type { NotificationPayload, NotificationListener };
export { NotificationService };
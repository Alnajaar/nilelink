'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Send, Users, Globe } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';

interface NotificationCenterProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  showUnreadBadge?: boolean;
  maxVisible?: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'top-right',
  showUnreadBadge = true,
  maxVisible = 5
}) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const userType = user?.role as 'pos' | 'supplier' | 'delivery' | 'driver' | 'customer' | 'admin' || undefined;
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    broadcastNotification,
    getUnreadNotifications
  } = useNotifications(userId, userType);

  const [isOpen, setIsOpen] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // Determine if user is admin for admin controls
  useEffect(() => {
    if (userType === 'admin') {
      setShowAdminControls(true);
    }
  }, [userType]);

  const visibleNotifications = notifications.slice(0, maxVisible);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleBroadcastNotification = () => {
    if (showAdminControls) {
      broadcastNotification(
        'pos',
        'System Message',
        'This is a broadcast message to all POS users.',
        { broadcast: true }
      );
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className={`fixed z-50 ${positionClasses[position]}`}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
          >
            <Bell className="w-5 h-5" />
            {showUnreadBadge && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              style={{
                top: position.startsWith('top') ? '100%' : 'auto',
                bottom: position.startsWith('bottom') ? '100%' : 'auto',
                right: position.endsWith('right') ? 0 : 'auto',
                left: position.endsWith('left') ? 0 : 'auto',
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Mark all read
                  </button>
                )}
              </div>

              {/* Admin Controls */}
              {showAdminControls && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex gap-2">
                    <button
                      onClick={handleBroadcastNotification}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <Globe className="w-3 h-3" /> Broadcast
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                      <Users className="w-3 h-3" /> Targeted
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {visibleNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {visibleNotifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {notifications.length > maxVisible && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {maxVisible} of {notifications.length} notifications
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Award, Check, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import Layout from '../components/layout/Layout';

const iconMap: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-500" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
  follow: <UserPlus className="w-4 h-4 text-green-500" />,
  badge: <Award className="w-4 h-4 text-yellow-500" />,
};

const Notifications: React.FC = () => {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Layout showParticles={false}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </motion.button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full"
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">
              No notifications yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              When people interact with your posts you'll see it here.
            </p>
          </motion.div>
        )}

        {/* Notification List */}
        <AnimatePresence>
          {!isLoading &&
            notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className={`flex items-start gap-4 p-4 rounded-xl mb-3 border cursor-pointer transition-all duration-200 ${
                  notification.read
                    ? 'bg-white/60 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full flex items-center justify-center shadow-sm">
                  {iconMap[notification.type] ?? (
                    <Bell className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {notification.message || notification.content || 'You have a new notification'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <div className="flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full mt-1" />
                )}

                {/* Read check */}
                {notification.read && (
                  <Check className="flex-shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5" />
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Notifications;

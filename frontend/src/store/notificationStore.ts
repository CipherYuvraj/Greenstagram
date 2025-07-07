import { create } from 'zustand';
import { apiClient } from '../services/api';

type Notification = {
  _id: string;
  read: boolean;
  [key: string]: any;
};

const useNotificationStore = create<{
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}>((zustandSet, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      zustandSet({ isLoading: true });
      
      const response = await apiClient.get('/api/notifications');
      
      const notifications = response.data.data.notifications || [];
      const unreadCount = response.data.data.unreadCount || 0;
      
      zustandSet({ 
        notifications, 
        unreadCount, 
        isLoading: false,
        error: null
      });
    } catch (error: unknown) {
      console.warn('Failed to fetch notifications:', error);
      let errorMessage = 'Failed to fetch notifications';
      if (typeof error === 'object' && error !== null && 'response' in (error as any)) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err.response?.data?.message || errorMessage;
      }
      zustandSet({ 
        error: errorMessage, 
        isLoading: false,
        // Keep previous data on error
        notifications: get().notifications,
        unreadCount: get().unreadCount
      });
    }
  },
  
  markAsRead: async (notificationId: any) => {
    try {
      await apiClient.put(`/api/notifications/${notificationId}/read`);
      
      const notifications = get().notifications.map(notification => 
        notification._id === notificationId ? 
        { ...notification, read: true } : notification
      );
      
      const unreadCount = notifications.filter(notification => !notification.read).length;
      
      zustandSet({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  
  markAllAsRead: async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      
      const notifications = get().notifications.map(notification => 
        ({ ...notification, read: true })
      );
      
      zustandSet({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
  
  clearNotifications: async () => {
    try {
      await apiClient.delete('/api/notifications');
      
      zustandSet({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}));

export { useNotificationStore };


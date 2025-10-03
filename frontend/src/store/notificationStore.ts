import { create } from 'zustand';
import { apiService } from '../services/api';

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
      
      const response = await apiService.getNotifications();
      
      const notifications = response.data?.notifications || response.notifications || [];
      const unreadCount = response.data?.unreadCount || response.unreadCount || 0;
      
      zustandSet({ 
        notifications, 
        unreadCount, 
        isLoading: false,
        error: null
      });
    } catch (error: unknown) {
      console.warn('Failed to fetch notifications:', error);
      let errorMessage = 'Failed to fetch notifications';
      if (typeof error === 'object' && error !== null && 'message' in (error as any)) {
        errorMessage = (error as { message: string }).message;
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
      await apiService.markNotificationAsRead(notificationId);
      
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
      await apiService.markAllNotificationsAsRead();
      
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
      await apiService.clearNotifications();
      
      zustandSet({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}));

export { useNotificationStore };


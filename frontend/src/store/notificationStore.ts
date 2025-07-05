import { create } from 'zustand';
import axios from 'axios';
import { Notification } from '../types';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    // Get token from auth store properly
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    set({ isLoading: true });
    
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const notifications = response.data.data.notifications || [];
      const unreadCount = notifications.filter(
        (notification: Notification) => !notification.read
      ).length;
      
      set({ 
        notifications, 
        unreadCount, 
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications', 
        isLoading: false 
      });
    }
  },
  
  markAsRead: async (notificationId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const notifications = get().notifications.map(notification => 
        notification._id === notificationId ? 
        { ...notification, read: true } : notification
      );
      
      const unreadCount = notifications.filter(notification => !notification.read).length;
      
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  
  markAllAsRead: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const notifications = get().notifications.map(notification => 
        ({ ...notification, read: true })
      );
      
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
  
  clearNotifications: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    try {
      await axios.delete('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}));

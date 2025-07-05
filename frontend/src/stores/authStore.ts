import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '../types';
import { apiClient } from '../services/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const response = await apiClient.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ loading: true });
          const response = await apiClient.post('/auth/register', userData);
          const { token, user } = response.data.data;
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData } 
          });
        }
      },

      refreshToken: async () => {
        try {
          const response = await apiClient.post('/auth/refresh');
          const { token } = response.data.data;
          
          localStorage.setItem('token', token);
          set({ token });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          set({ loading: true });
          const response = await apiClient.get('/auth/me');
          const { user } = response.data.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          get().logout();
          set({ loading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

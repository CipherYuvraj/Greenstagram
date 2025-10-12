import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  ecoLevel: number;
  ecoPoints: number;
  currentStreak: number;
  isPrivate: boolean;
  bio?: string;
  interests?: string[];
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (token: string, user: User) => void;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (token: string, user: User) => {
        try {
          // Store token in localStorage for persistence
          localStorage.setItem('token', token);
          
          // Make sure the token is set in the API service
          apiService.setToken(token);
          
          // Update the state
          set({ token, user, error: null, isLoading: false });
          
          // Fetch the latest user data
          await get().fetchProfile();
        } catch (error) {
          console.error('Login error:', error);
          localStorage.removeItem('token');
          set({ token: null, user: null, error: 'Failed to log in', isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.post('auth/register', userData);
          const { user, token } = response.data;
          
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          set({ user, token, isLoading: false, error: null });
          return response;
        } catch (error: any) {
          // Clear token on error
          localStorage.removeItem('token');
          
          const errorMessage = error.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false, user: null, token: null });
          throw error;
        }
      },

      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        // Reset state
        set({
          user: null,
          token: null,
          error: null,
          isLoading: false
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData }
          });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.get('auth/me');
          const user = response.data;
          
          set({ user, isLoading: false });
          return user;
        } catch (error: any) {
          // If unauthorized, log the user out
          if (error.message?.includes('401') || error.message?.includes('token')) {
            get().logout();
          }
          
          console.error('Failed to fetch profile:', error);
          set({ error: 'Failed to load user profile', isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'greenstagram-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Token will be automatically included via the API service
          console.log('Rehydrated token from storage');
        }
      }
    }
  )
);

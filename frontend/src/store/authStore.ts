import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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

      login: (token: string, user: User) => {
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user, error: null });
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.post('/api/auth/register', userData);
          const { user, token } = response.data.data;
          
          // Set axios default header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ 
            user, 
            token, 
            isLoading: false,
            error: null 
          });

        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            user: null,
            token: null 
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        // Remove token from axios headers
        delete axios.defaults.headers.common['Authorization'];
        
        set({ 
          user: null, 
          token: null, 
          error: null 
        });

        // Call logout endpoint for analytics
        axios.post('/api/auth/logout').catch(() => {
          // Ignore errors on logout
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
        const token = get().token;
        if (!token) return;

        try {
          // Ensure axios has the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await axios.get('/api/auth/profile');
          const user = response.data.data;
          
          set({ user });
        } catch (error: any) {
          console.error('Failed to fetch profile:', error);
          if (error.response?.status === 401) {
            // Token is invalid, logout user
            get().logout();
          }
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
        // Set axios header on app load if token exists
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }
  )
);

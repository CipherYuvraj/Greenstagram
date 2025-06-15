import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  ecoLevel: number;
  ecoPoints: number;
  badges: string[];
  streaks: {
    current: number;
    longest: number;
    lastActivity?: string;
  };
  interests: string[];
  followers: string[];
  following: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  fetchProfile: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  interests?: string[];
}

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://greenstagram-backend.azurewebsites.net'
    : 'http://localhost:5000');

axios.defaults.baseURL = API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (emailOrUsername: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.post('/api/auth/login', {
            emailOrUsername,
            password
          });

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
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            user: null,
            token: null 
          });
          throw new Error(errorMessage);
        }
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

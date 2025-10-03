import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

const applyTheme = (resolvedTheme: ResolvedTheme) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (theme: Theme) => {
        const resolvedTheme = resolveTheme(theme);
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },
      toggleTheme: () => {
        const { theme } = get();
        let newTheme: Theme;
        
        if (theme === 'system') {
          // If currently system, toggle to opposite of current system preference
          const systemTheme = getSystemTheme();
          newTheme = systemTheme === 'light' ? 'dark' : 'light';
        } else {
          // If currently light or dark, toggle to the opposite
          newTheme = theme === 'light' ? 'dark' : 'light';
        }
        
        get().setTheme(newTheme);
      },
      initializeTheme: () => {
        const { theme } = get();
        const resolvedTheme = resolveTheme(theme);
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
        
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            const currentTheme = get().theme;
            if (currentTheme === 'system') {
              const newResolvedTheme = getSystemTheme();
              applyTheme(newResolvedTheme);
              set({ resolvedTheme: newResolvedTheme });
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'greenstagram-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  useThemeStore.getState().initializeTheme();
}
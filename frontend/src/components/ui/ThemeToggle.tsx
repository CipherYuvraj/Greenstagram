import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, Theme } from '../../store/themeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  className = '' 
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  const getIcon = () => {
    switch (resolvedTheme) {
      case 'dark':
        return Moon;
      case 'light':
        return Sun;
      default:
        return Sun;
    }
  };

  const Icon = getIcon();

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: resolvedTheme === 'dark' ? 180 : 0,
            scale: 1 
          }}
          transition={{ 
            duration: 0.3, 
            ease: 'easeInOut' 
          }}
        >
          <Icon 
            size={20} 
            className={`transition-colors ${
              resolvedTheme === 'dark' 
                ? 'text-yellow-400' 
                : 'text-gray-600 dark:text-gray-300'
            }`} 
          />
        </motion.div>
      </motion.button>
    );
  }

  // Dropdown variant for more options
  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </span>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { value: 'light' as Theme, icon: Sun, label: 'Light' },
            { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
            { value: 'system' as Theme, icon: Monitor, label: 'System' },
          ].map(({ value, icon: IconComponent, label }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                theme === value
                  ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent size={16} />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
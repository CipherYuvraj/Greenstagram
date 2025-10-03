import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import ParticleBackground from '../ui/ParticleBackground';
import FloatingElements from '../ui/FloatingElements';
import { useThemeStore } from '../../store/themeStore';

interface LayoutProps {
  children: React.ReactNode;
  showParticles?: boolean;
  particleTheme?: 'eco' | 'nature' | 'ocean' | 'forest';
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showParticles = true,
  particleTheme = 'eco',
  className = ''
}) => {
  const { initializeTheme } = useThemeStore();
  
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 transition-colors duration-300">
      {/* Ambient background effects */}
      {showParticles && (
        <>
          <ParticleBackground 
            particleCount={60} 
            theme={particleTheme} 
            interactive={true}
          />
          <FloatingElements 
            count={20} 
            theme="nature"
          />
        </>
      )}
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative z-10 ${className}`}
      >
        {children}
      </motion.main>
      
      {/* Footer gradient overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 dark:from-gray-900/50 to-transparent pointer-events-none z-5 transition-colors duration-300" />
    </div>
  );
};

export default Layout;
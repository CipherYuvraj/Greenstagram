import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'eco';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  particleEffect?: boolean;
  glowEffect?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  particleEffect = true,
  glowEffect = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<number>();

  const variants = {
    primary: {
      bg: 'bg-gradient-to-r from-primary-500 to-primary-600',
      hover: 'hover:from-primary-600 hover:to-primary-700',
      glow: 'shadow-primary-500/25',
      particle: '#10b981'
    },
    secondary: {
      bg: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
      hover: 'hover:from-secondary-600 hover:to-secondary-700',
      glow: 'shadow-secondary-500/25',
      particle: '#22c55e'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      glow: 'shadow-green-500/25',
      particle: '#10b981'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      hover: 'hover:from-red-600 hover:to-red-700',
      glow: 'shadow-red-500/25',
      particle: '#ef4444'
    },
    eco: {
      bg: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500',
      hover: 'hover:from-emerald-600 hover:via-green-600 hover:to-teal-600',
      glow: 'shadow-emerald-500/25',
      particle: '#059669'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const createParticles = (x: number, y: number) => {
    if (!particleEffect) return;
    
    const newParticles: Particle[] = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 1,
        color: variants[variant].particle
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const updateParticles = () => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // gravity
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0)
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createParticles(x, y);
    }
    
    onClick?.();
  };

  useEffect(() => {
    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative overflow-hidden rounded-lg font-medium text-white
        transition-all duration-300 transform-gpu
        ${variants[variant].bg}
        ${variants[variant].hover}
        ${sizes[size]}
        ${glowEffect ? `shadow-lg ${variants[variant].glow}` : ''}
        ${isHovered ? 'shadow-xl scale-105' : ''}
        ${isClicked ? 'scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Glow effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${variants[variant].particle}40, transparent 70%)`
          }}
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.6 : 0.3
          }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          Icon && <Icon className="w-4 h-4" />
        )}
        <span>{children}</span>
      </div>
      
      {/* Particle effects */}
      {particleEffect && particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: particle.life,
            scale: particle.life * 0.5 + 0.5,
            x: particle.vx * 10,
            y: particle.vy * 10
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      ))}
      
      {/* Ripple effect */}
      {isClicked && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${variants[variant].particle}40 0%, transparent 70%)`
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
};

export default AnimatedButton;

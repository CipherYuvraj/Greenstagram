import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// Define the Particle interface
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

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'eco' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  rounded?: boolean;
  glowEffect?: boolean;
  particleEffect?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  rounded = false,
  glowEffect = false,
  particleEffect = false
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
    eco: {
      bg: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500',
      hover: 'hover:from-emerald-600 hover:via-green-600 hover:to-teal-600',
      glow: 'shadow-emerald-500/25',
      particle: '#059669'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      hover: 'hover:from-red-600 hover:to-red-700',
      glow: 'shadow-red-500/25',
      particle: '#ef4444'
    },
    outline: {
      bg: 'bg-transparent',
      hover: 'hover:bg-gray-100',
      glow: 'shadow-none',
      particle: 'transparent'
    },
    ghost: {
      bg: 'bg-transparent',
      hover: 'hover:bg-gray-100',
      glow: 'shadow-none',
      particle: 'transparent'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
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
        relative flex items-center justify-center overflow-hidden rounded-lg font-medium
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
      type={type}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Glow effect */}
      {glowEffect && !disabled && !loading && (
        <motion.div
          className={`absolute inset-0 ${rounded ? 'rounded-full' : 'rounded-lg'} bg-white opacity-0`}
          animate={{
            opacity: [0, 0.2, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      )}

      {/* Particle effect */}
      {particleEffect && !disabled && !loading && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-white`}
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 60],
                y: [0, (Math.random() - 0.5) * 60],
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <span className="flex items-center justify-center space-x-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
          />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2" />}
            <span>{children}</span>
            {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 ml-2" />}
          </>
        )}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;

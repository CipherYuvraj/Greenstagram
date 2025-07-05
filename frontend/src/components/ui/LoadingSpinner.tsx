import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'eco' | 'dots' | 'pulse' | 'orbit';
  color?: string;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = '#10b981',
  text,
  className = ''
}) => {
  const sizes = {
    sm: { spinner: 'w-4 h-4', text: 'text-sm' },
    md: { spinner: 'w-8 h-8', text: 'text-base' },
    lg: { spinner: 'w-12 h-12', text: 'text-lg' },
    xl: { spinner: 'w-16 h-16', text: 'text-xl' }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'eco':
        return (
          <div className={`relative ${sizes[size].spinner}`}>
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ 
                borderTopColor: color,
                borderRightColor: `${color}80`
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Inner particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ 
                  backgroundColor: color,
                  left: '50%',
                  top: '10%',
                  transformOrigin: '0 200%'
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.2
                }}
              />
            ))}
            
            {/* Center pulse */}
            <motion.div
              className="absolute inset-0 m-auto w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`relative ${sizes[size].spinner}`}>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: color }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6
                }}
              />
            ))}
          </div>
        );

      case 'orbit':
        return (
          <div className={`relative ${sizes[size].spinner}`}>
            {/* Central particle */}
            <div
              className="absolute inset-0 m-auto w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            
            {/* Orbiting particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: `${color}cc`,
                  left: '50%',
                  top: '10%',
                  transformOrigin: '0 300%'
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            className={`rounded-full border-4 border-gray-200 ${sizes[size].spinner}`}
            style={{ borderTopColor: color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderSpinner()}
      </motion.div>
      
      {text && (
        <motion.p
          className={`text-gray-600 font-medium ${sizes[size].text}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;

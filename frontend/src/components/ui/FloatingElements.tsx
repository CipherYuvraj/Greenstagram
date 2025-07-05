import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  color: string;
  shape: 'leaf' | 'circle' | 'star' | 'flower' | 'bubble';
}

interface FloatingElementsProps {
  count?: number;
  theme?: 'nature' | 'eco' | 'ocean' | 'space';
  className?: string;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  count = 25,
  theme = 'nature',
  className = ''
}) => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  const themes = {
    nature: {
      colors: ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'],
      shapes: ['leaf', 'flower', 'circle'] as const
    },
    eco: {
      colors: ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'],
      shapes: ['leaf', 'star', 'circle'] as const
    },
    ocean: {
      colors: ['#0891b2', '#0e7490', '#155e75', '#06b6d4', '#67e8f9'],
      shapes: ['bubble', 'circle', 'star'] as const
    },
    space: {
      colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#a78bfa', '#c4b5fd'],
      shapes: ['star', 'circle', 'bubble'] as const
    }
  };

  useEffect(() => {
    const newElements: FloatingElement[] = [];
    
    for (let i = 0; i < count; i++) {
      const themeConfig = themes[theme];
      newElements.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 10,
        rotation: Math.random() * 360,
        speed: Math.random() * 2 + 0.5,
        color: themeConfig.colors[Math.floor(Math.random() * themeConfig.colors.length)],
        shape: themeConfig.shapes[Math.floor(Math.random() * themeConfig.shapes.length)]
      });
    }
    
    setElements(newElements);
  }, [count, theme]);

  const renderShape = (element: FloatingElement) => {
    const { shape, size, color } = element;
    
    switch (shape) {
      case 'leaf':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13L13.5 7.5C13.1 6.4 12 5.9 10.9 6.3C9.8 6.7 9.3 7.8 9.7 8.9L12 15L6 9H4V11L10 17L14 21H16L12 17L18 11L21 9Z"
              fill={color}
              opacity={0.7}
            />
          </svg>
        );
      
      case 'flower':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path
              d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,5A3,3 0 0,1 22,8A3,3 0 0,1 19,11H13A3,3 0 0,1 10,8A3,3 0 0,1 13,5H19M19,13A3,3 0 0,1 22,16A3,3 0 0,1 19,19H13A3,3 0 0,1 10,16A3,3 0 0,1 13,13H19M12,10A3,3 0 0,1 15,13V19A3,3 0 0,1 12,22A3,3 0 0,1 9,19V13A3,3 0 0,1 12,10M5,5A3,3 0 0,1 8,8A3,3 0 0,1 5,11H11A3,3 0 0,1 14,8A3,3 0 0,1 11,5H5M5,13A3,3 0 0,1 8,16A3,3 0 0,1 5,19H11A3,3 0 0,1 14,16A3,3 0 0,1 11,13H5Z"
              fill={color}
              opacity={0.6}
            />
          </svg>
        );
      
      case 'star':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path
              d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"
              fill={color}
              opacity={0.8}
            />
          </svg>
        );
      
      case 'bubble':
        return (
          <div
            className="rounded-full border-2"
            style={{
              width: size,
              height: size,
              borderColor: color,
              background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)`
            }}
          />
        );
      
      default:
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              opacity: 0.6
            }}
          />
        );
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          initial={{
            x: element.x,
            y: element.y,
            rotate: element.rotation
          }}
          animate={{
            x: [element.x, element.x + 50, element.x - 30, element.x],
            y: [element.y, element.y - 100, element.y - 50, element.y],
            rotate: [element.rotation, element.rotation + 180, element.rotation + 360]
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.6, 1, 0.4, 0.6]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {renderShape(element)}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;

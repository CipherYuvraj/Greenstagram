import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleProps {
  particleCount?: number;
  theme?: 'eco' | 'nature' | 'ocean' | 'forest';
  interactive?: boolean;
  className?: string;
}

const ParticleBackground: React.FC<ParticleProps> = ({
  particleCount = 50,
  theme = 'eco',
  interactive = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Theme configuration
  const themeColors = {
    eco: ['#10b981', '#34d399', '#6ee7b7'],
    nature: ['#22c55e', '#4ade80', '#86efac'],
    ocean: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
    forest: ['#15803d', '#22c55e', '#4ade80']
  };

  const colors = themeColors[theme];
  
  // Generate particles
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  // Mouse interaction effect
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const container = containerRef.current;
    const particleElements = container.querySelectorAll('.particle');
    
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;
      
      particleElements.forEach((particle, _index) => {
        const particleX = parseFloat((particle as HTMLElement).style.left);
        const particleY = parseFloat((particle as HTMLElement).style.top);
        
        const dx = (mouseX / width) * 100 - particleX;
        const dy = (mouseY / height) * 100 - particleY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
          const angle = Math.atan2(dy, dx);
          const force = (20 - distance) * 0.2;
          
          (particle as HTMLElement).style.transform = 
            `translate(${-Math.cos(angle) * force}px, ${-Math.sin(angle) * force}px)`;
        } else {
          (particle as HTMLElement).style.transform = '';
        }
      });
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: 0.4
          }}
          animate={{
            x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.6, 0.4, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
);
  
};

export default ParticleBackground;

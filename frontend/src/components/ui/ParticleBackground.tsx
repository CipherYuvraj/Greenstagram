import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  pulse: number;
  connections: number[];
}

interface ParticleBackgroundProps {
  particleCount?: number;
  theme?: 'eco' | 'nature' | 'ocean' | 'forest';
  interactive?: boolean;
  className?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 80,
  theme = 'eco',
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  const themeColors = useMemo(() => {
    const themes = {
      eco: ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'],
      nature: ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'],
      ocean: ['#0891b2', '#0e7490', '#155e75', '#06b6d4', '#67e8f9'],
      forest: ['#059669', '#047857', '#064e3b', '#10b981', '#34d399']
    };
    return themes[theme];
  }, [theme]);

  const initParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        connections: []
      });
    }
    
    particlesRef.current = particles;
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    );
    
    gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16)}`);
    gradient.addColorStop(1, `${particle.color}00`);
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add pulsing effect
    const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
    ctx.beginPath();
    ctx.strokeStyle = `${particle.color}${Math.floor((particle.opacity * 0.3) * 255).toString(16)}`;
    ctx.lineWidth = 1;
    ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const opacity = (120 - distance) / 120 * 0.3;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const updateParticles = (width: number, height: number) => {
    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    
    particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off edges
      if (particle.x <= 0 || particle.x >= width) particle.speedX *= -1;
      if (particle.y <= 0 || particle.y >= height) particle.speedY *= -1;
      
      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
      
      // Update pulse
      particle.pulse += 0.02;
      
      // Mouse interaction
      if (interactive) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.speedX += (dx / distance) * force * 0.01;
          particle.speedY += (dy / distance) * force * 0.01;
          particle.opacity = Math.min(1, particle.opacity + force * 0.02);
        } else {
          particle.opacity = Math.max(0.1, particle.opacity - 0.01);
        }
      }
      
      // Apply friction
      particle.speedX *= 0.99;
      particle.speedY *= 0.99;
    });
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // Clear canvas with slight trail effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    updateParticles(width, height);
    drawConnections(ctx);
    
    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    initParticles(canvas.width, canvas.height);
    animate();
    
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, theme, interactive]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;

"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

interface EnergyFlowAnimationProps {
  color?: string;
  particleCount?: number;
  speed?: number;
  width?: number | string;
  height?: number | string;
  direction?: 'horizontal' | 'vertical' | 'radial';
  intensity?: 'low' | 'medium' | 'high';
  animationDelay?: number;
}

export const EnergyFlowAnimation: React.FC<EnergyFlowAnimationProps> = ({
  color = '#3b82f6', // Default to blue
  particleCount = 30,
  speed = 3,
  width = '100%',
  height = '100%',
  direction = 'horizontal',
  intensity = 'medium',
  animationDelay = 0,
}) => {
  const containerRef = React.useRef(null);
  const [particles, setParticles] = React.useState([]);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  
  // Set intensity factors
  const intensityFactors = {
    low: { opacity: 0.3, sizeMultiplier: 0.7 },
    medium: { opacity: 0.5, sizeMultiplier: 1 },
    high: { opacity: 0.8, sizeMultiplier: 1.3 },
  };
  
  // Initialize animation on mount
  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Get container dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    
    // Generate initial particles
    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      return generateParticle(rect.width, rect.height, i, direction, intensityFactors[intensity]);
    });
    
    setParticles(newParticles);
    
    // Window resize handler
    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      setDimensions({ width: newRect.width, height: newRect.height });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef, particleCount, direction, intensity]);
  
  // Generate a new particle
  const generateParticle = (
    width: number, 
    height: number, 
    id: number,
    dir: 'horizontal' | 'vertical' | 'radial',
    intensityFactor: { opacity: number, sizeMultiplier: number }
  ) => {
    // Common particle properties
    const baseSize = Math.random() * 3 + 1;
    const size = baseSize * intensityFactor.sizeMultiplier;
    const baseOpacity = Math.random() * 0.3 + 0.2;
    const opacity = Math.min(baseOpacity * intensityFactor.opacity, 0.8);
    const baseDuration = (Math.random() * 5 + 3) / speed;
    
    // Position and animation properties based on direction
    if (dir === 'horizontal') {
      return {
        id,
        x: 0, // Start from left
        y: Math.random() * height,
        size,
        duration: baseDuration,
        opacity,
      };
    } else if (dir === 'vertical') {
      return {
        id,
        x: Math.random() * width,
        y: 0, // Start from top
        size,
        duration: baseDuration,
        opacity,
      };
    } else { // radial
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.min(width, height) * 0.5;
      return {
        id,
        x: width / 2, // Center X
        y: height / 2, // Center Y
        size,
        duration: baseDuration,
        opacity,
        angle,
        distance,
      };
    }
  };
  
  // Get animation variants based on direction
  const getAnimationVariants = (particle: any, dir: string) => {
    if (dir === 'horizontal') {
      return {
        initial: { x: -10, opacity: 0 },
        animate: { 
          x: dimensions.width + 10,
          opacity: [0, particle.opacity, particle.opacity, 0],
          transition: { 
            duration: particle.duration,
            ease: "linear",
            repeat: Infinity,
            delay: animationDelay + (particle.id * 0.2) % 2
          }
        }
      };
    } else if (dir === 'vertical') {
      return {
        initial: { y: -10, opacity: 0 },
        animate: { 
          y: dimensions.height + 10,
          opacity: [0, particle.opacity, particle.opacity, 0],
          transition: { 
            duration: particle.duration,
            ease: "linear",
            repeat: Infinity,
            delay: animationDelay + (particle.id * 0.2) % 2
          }
        }
      };
    } else { // radial
      const endX = dimensions.width / 2 + Math.cos(particle.angle) * dimensions.width;
      const endY = dimensions.height / 2 + Math.sin(particle.angle) * dimensions.height;
      
      return {
        initial: { 
          x: dimensions.width / 2,
          y: dimensions.height / 2,
          opacity: 0
        },
        animate: { 
          x: endX,
          y: endY,
          opacity: [0, particle.opacity, particle.opacity, 0],
          transition: { 
            duration: particle.duration,
            ease: "linear",
            repeat: Infinity,
            delay: animationDelay + (particle.id * 0.1) % 3
          }
        }
      };
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width, 
        height, 
        position: 'absolute', 
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {particles.map((particle) => {
        const variants = getAnimationVariants(particle, direction);
        
        return (
          <motion.div
            key={particle.id}
            initial="initial"
            animate="animate"
            variants={variants}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: color,
              filter: `blur(${particle.size / 2}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// Pulsing energy indicator (for use on cards, charts etc.)
export const PulsingEnergyIndicator: React.FC<{
  color?: string;
  size?: number;
  pulseIntensity?: 'low' | 'medium' | 'high';
}> = ({ 
  color = '#3b82f6',
  size = 10,
  pulseIntensity = 'medium'
}) => {
  // Set intensity factors
  const intensityFactors = {
    low: { scale: 1.3, duration: 3 },
    medium: { scale: 1.5, duration: 2 },
    high: { scale: 1.8, duration: 1.5 },
  };
  
  const { scale, duration } = intensityFactors[pulseIntensity];
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '50%', 
          backgroundColor: color,
          position: 'absolute',
          zIndex: 1
        }} 
      />
      <motion.div
        animate={{
          scale: [1, scale, 1],
          opacity: [0.8, 0, 0.8]
        }}
        transition={{
          duration,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '50%', 
          backgroundColor: color,
          position: 'absolute',
          filter: 'blur(2px)'
        }}
      />
    </div>
  );
}; 
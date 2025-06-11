/**
 * Premium Animations Library
 * Provides advanced animation utilities for premium components
 */

// Types for animations
export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/**
 * Animation timing configurations
 */
export const ANIMATION_TIMING = {
  fastest: 150,
  fast: 300,
  normal: 500,
  slow: 800,
  slowest: 1200
};

/**
 * Standard easings collection
 */
export const ANIMATION_EASINGS = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  // CSS cubic-bezier values for advanced easing functions
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'
};

/**
 * Returns CSS animation style properties for consistent animations
 */
export function getAnimationStyles(
  animationType: string,
  options: {
    duration?: number;
    easing?: AnimationEasing;
    direction?: AnimationDirection;
    delay?: number;
    iterations?: number;
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  } = {}
): React.CSSProperties {
  const {
    duration = ANIMATION_TIMING.normal,
    easing = 'ease-out',
    direction = 'normal',
    delay = 0,
    iterations = 1,
    fillMode = 'both'
  } = options;

  const easingValue = ANIMATION_EASINGS[easing as keyof typeof ANIMATION_EASINGS] || easing;

  return {
    animation: `${animationType} ${duration}ms ${easingValue} ${direction} ${delay}ms ${iterations} ${fillMode}`
  };
}

/**
 * Responsive animation timing based on screen size
 * Makes animations faster on mobile for better UX
 */
export function getResponsiveDuration(duration: number, screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number {
  const factors: Record<string, number> = {
    xs: 0.6, // Faster on smallest screens
    sm: 0.8,
    md: 1.0, // Standard duration
    lg: 1.1,
    xl: 1.2  // Slightly slower on largest screens for better visual effect
  };
  
  return Math.round(duration * (factors[screenSize] || 1));
}

/**
 * Creates a staggered animation delay for list items
 */
export function getStaggeredDelay(index: number, baseDelay: number = 50, maxItems: number = 20): number {
  // Cap the index to prevent extremely long delays
  const normalizedIndex = Math.min(index, maxItems);
  return normalizedIndex * baseDelay;
}

/**
 * Generates CSS for premium animation keyframes
 */
export function generateKeyframeCSS(): string {
  return `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 20px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translate3d(0, -20px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale3d(0.3, 0.3, 0.3);
      }
      50% {
        opacity: 1;
      }
    }
    
    @keyframes slideInRight {
      from {
        transform: translate3d(100%, 0, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes slideInLeft {
      from {
        transform: translate3d(-100%, 0, 0);
        visibility: visible;
      }
      to {
        transform: translate3d(0, 0, 0);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale3d(1, 1, 1);
      }
      50% {
        transform: scale3d(1.05, 1.05, 1.05);
      }
      100% {
        transform: scale3d(1, 1, 1);
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    
    @keyframes glow {
      from {
        box-shadow: 0 0 0px rgba(59, 130, 246, 0);
      }
      to {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      }
    }
    
    @keyframes breathe {
      0%, 100% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.03);
        opacity: 1;
      }
    }
    
    /* Responsive variants */
    @media (max-width: 640px) {
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }
    }
  `;
}

/**
 * Premium loading states with animated indicators
 */
export const LOADING_ANIMATIONS = {
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1000px_100%]',
  breathe: 'animate-breathe',
  bounce: 'animate-bounce'
};

/**
 * Presets for common premium animation combinations
 */
export const ANIMATION_PRESETS = {
  cardEnter: {
    animation: 'fadeInUp',
    duration: ANIMATION_TIMING.normal,
    easing: 'ease-out' as AnimationEasing,
    fillMode: 'both' as const
  },
  cardHover: {
    animation: 'pulse',
    duration: ANIMATION_TIMING.slow,
    easing: 'spring' as AnimationEasing,
    iterations: 'infinite' as any
  },
  buttonClick: {
    animation: 'pulse',
    duration: ANIMATION_TIMING.fastest,
    easing: 'ease-out' as AnimationEasing,
    fillMode: 'forwards' as const
  },
  notificationBadge: {
    animation: 'pulse',
    duration: ANIMATION_TIMING.normal,
    iterations: 'infinite' as any,
    easing: 'ease-in-out' as AnimationEasing
  }
}; 
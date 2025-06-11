"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, applyRippleEffect } from '../../utils/cn';

// Define button variants using class-variance-authority
const premiumButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-200 bg-white hover:bg-gray-50 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-blue-400",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-800/50 text-gray-900 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-gray-900/90",
        gradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
        neumorph: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_-2px_4px_rgba(255,255,255,0.2)]"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      elevation: {
        none: "",
        low: "shadow-sm",
        medium: "shadow-md",
        high: "shadow-lg"
      },
      glow: {
        none: "",
        subtle: "after:absolute after:inset-0 after:rounded-md after:opacity-0 hover:after:opacity-100 after:transition-opacity after:shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:after:shadow-[0_0_8px_rgba(59,130,246,0.2)]",
        always: "after:absolute after:inset-0 after:rounded-md after:shadow-[0_0_12px_rgba(59,130,246,0.5)] dark:after:shadow-[0_0_12px_rgba(59,130,246,0.3)]"
      },
      animated: {
        true: "",
        false: ""
      },
      ripple: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      elevation: "none",
      glow: "none",
      animated: false,
      ripple: false
    },
  }
);

// Define animation keyframes
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

// Define ripple animation styles
const rippleStyles = `
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.25);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

export interface PremiumButtonProps {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  variant?: any;
  size?: any;
  elevation?: any;
  glow?: any;
  animated?: boolean;
  ripple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: any;
  [key: string]: any;
}

const PremiumButton = React.forwardRef((props: PremiumButtonProps, ref: any) => {
  const { 
    className, 
    variant, 
    size, 
    loading, 
    disabled, 
    children, 
    onClick,
    ...otherProps 
  } = props;

  // Create animation style injection
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      // Add styles only once
      if (!document.getElementById('premium-button-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'premium-button-styles';
        styleEl.textContent = `${pulseAnimation}\n${rippleStyles}`;
        document.head.appendChild(styleEl);
      }
    }
  }, []);
  
  // Add ripple effect if enabled
  const handleClick = (e: any) => {
    if (props.ripple && e.currentTarget) {
      applyRippleEffect(e.currentTarget, e);
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  // Animation styles
  const animationStyle = props.animated ? {
    animation: 'pulse 2s infinite ease-in-out'
  } : {};
  
  return (
    <button
      className={cn(premiumButtonVariants({ 
        variant, 
        size, 
        elevation: props.elevation, 
        glow: props.glow,
        className 
      }))}
      ref={ref}
      onClick={handleClick}
      style={animationStyle}
      {...otherProps}
    >
      {/* Add ripple container if ripple is enabled */}
      {props.ripple && <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none" />}
      
      {/* Button content with icons */}
      {props.leftIcon && <span className="mr-2">{props.leftIcon}</span>}
      {children}
      {props.rightIcon && <span className="ml-2">{props.rightIcon}</span>}
    </button>
  );
});
PremiumButton.displayName = "PremiumButton";

export { PremiumButton, premiumButtonVariants }; 
/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  interactive?: boolean;
  glowAccent?: 'blue' | 'green' | 'amber' | 'purple' | 'none';
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const PremiumCard = React.forwardRef(
  ({ className, children, variant = 'default', interactive = true, glowAccent = 'none', ...props }: PremiumCardProps, ref: any) => {
    // Base styles for all card variants
    const baseStyles = "rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden";
    
    // Variant-specific styles
    const variantStyles = {
      default: "bg-white dark:bg-gray-950 shadow-sm",
      glass: "bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm shadow-sm border-gray-200/80 dark:border-gray-800/80",
      elevated: "bg-white dark:bg-gray-950 shadow-md"
    };
    
    // Glow accent styles
    const glowStyles = {
      none: "",
      blue: "before:absolute before:inset-0 before:rounded-lg before:shadow-[0_0_15px_rgba(59,130,246,0.3)] before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      green: "before:absolute before:inset-0 before:rounded-lg before:shadow-[0_0_15px_rgba(34,197,94,0.3)] before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      amber: "before:absolute before:inset-0 before:rounded-lg before:shadow-[0_0_15px_rgba(251,191,36,0.3)] before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      purple: "before:absolute before:inset-0 before:rounded-lg before:shadow-[0_0_15px_rgba(139,92,246,0.3)] before:opacity-0 hover:before:opacity-100 before:transition-opacity"
    };
    
    // Interactive styles for hover/focus states
    const interactiveStyles = interactive 
      ? "transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:shadow-inner active:translate-y-0 relative"
      : "";
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          interactive && interactiveStyles,
          glowAccent !== 'none' && "relative before:z-[-1]",
          glowAccent !== 'none' && glowStyles[glowAccent],
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

// Card components
export const PremiumCardHeader = React.forwardRef(
  ({ className, ...props }: CardHeaderProps, ref: any) => (
    <div
      ref={ref}
      className={cn("p-6 flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);

PremiumCardHeader.displayName = "PremiumCardHeader";

export const PremiumCardTitle = React.forwardRef(
  ({ className, ...props }: CardTitleProps, ref: any) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);

PremiumCardTitle.displayName = "PremiumCardTitle";

export const PremiumCardDescription = React.forwardRef(
  ({ className, ...props }: CardDescriptionProps, ref: any) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  )
);

PremiumCardDescription.displayName = "PremiumCardDescription";

export const PremiumCardContent = React.forwardRef(
  ({ className, ...props }: CardContentProps, ref: any) => (
    <div
      ref={ref}
      className={cn("px-6 pb-6 pt-0", className)}
      {...props}
    />
  )
);

PremiumCardContent.displayName = "PremiumCardContent";

export const PremiumCardFooter = React.forwardRef(
  ({ className, ...props }: CardFooterProps, ref: any) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);

PremiumCardFooter.displayName = "PremiumCardFooter"; 
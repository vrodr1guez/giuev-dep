'use client';

import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'dynamic' | 'striped' | 'animated';
}

export const Progress = ({
  className = '',
  value = 0,
  max = 100,
  showLabel = false,
  variant = 'default',
  ...props
}: ProgressProps) => {
  const percentage = Math.round((value / max) * 100);
  
  // Determine color based on variant
  let progressColor = 'bg-primary';
  
  if (variant === 'dynamic') {
    progressColor = percentage < 30
      ? 'bg-red-500'
      : percentage < 70
      ? 'bg-yellow-500'
      : 'bg-green-500';
  } else if (variant === 'success') {
    progressColor = 'bg-green-500';
  } else if (variant === 'warning') {
    progressColor = 'bg-yellow-500';
  } else if (variant === 'danger') {
    progressColor = 'bg-red-500';
  } else if (variant === 'striped') {
    progressColor = 'bg-primary bg-[repeating-linear-gradient(45deg,_#3b82f6_0,_#3b82f6_10px,_#2563eb_10px,_#2563eb_20px)]';
  } else if (variant === 'animated') {
    progressColor = 'bg-primary bg-[repeating-linear-gradient(45deg,_#3b82f6_0,_#3b82f6_10px,_#2563eb_10px,_#2563eb_20px)] animate-pulse';
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all', progressColor)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {percentage}%
        </div>
      )}
    </div>
  );
}; 
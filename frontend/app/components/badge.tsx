import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  status?: 'active' | 'inactive' | 'pending' | 'critical';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'default',
  status,
  children,
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
  };

  const statusClasses = status ? {
    active: 'before:content-[""] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-green-500 before:mr-1.5',
    inactive: 'before:content-[""] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-gray-400 before:mr-1.5',
    pending: 'before:content-[""] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-yellow-500 before:mr-1.5',
    critical: 'before:content-[""] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-red-500 before:mr-1.5',
  }[status] : '';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        statusClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}; 
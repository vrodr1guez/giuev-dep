"use client";

import * as React from 'react';
import { LineChart, BarChart, PieChart } from 'lucide-react';

interface PremiumChartProps {
  type: 'line' | 'bar' | 'pie';
  height?: string;
  title?: string;
  subtitle?: string;
  data?: any;
  loading?: boolean;
  animated?: boolean;
  gradientBackground?: boolean;
  glassmorphism?: boolean;
  children?: React.ReactNode;
}

export function PremiumChart({
  type = 'line',
  height = '300px',
  title,
  subtitle,
  data,
  loading = false,
  animated = true,
  gradientBackground = true,
  glassmorphism = false,
  children
}: PremiumChartProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Chart container classes
  const containerClasses = [
    "relative rounded-xl overflow-hidden transition-all duration-300",
    height,
    glassmorphism ? "backdrop-blur-md bg-white/10 dark:bg-gray-900/30 border border-white/20 dark:border-gray-800/50" : "bg-white dark:bg-gray-900",
    isHovered ? "shadow-lg transform scale-[1.01]" : "shadow-md",
  ].join(" ");
  
  // Gradient background
  const gradientStyle = gradientBackground ? {
    background: "linear-gradient(120deg, rgba(56,128,255,0.05) 0%, rgba(0,0,0,0) 100%)"
  } : {};
  
  // Chart icon selection
  const ChartIcon = type === 'line' ? LineChart : type === 'bar' ? BarChart : PieChart;
  const iconColorClass = type === 'line' ? "text-blue-500" : type === 'bar' ? "text-purple-500" : "text-green-500";
  
  return (
    <div 
      className={containerClasses}
      style={gradientStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient overlay - visible when hovered */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr from-blue-50/20 to-purple-50/20 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}
      />
      
      {/* Chart top glow effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {/* Title section */}
      {(title || subtitle) && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          {title && <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      
      {/* Chart content */}
      <div className="relative p-4">
        {loading ? (
          // Loading state
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
          </div>
        ) : null}
        
        {/* Placeholder content if no children */}
        {!children && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className={`rounded-full p-3 bg-gray-100/80 dark:bg-gray-800/80 ${iconColorClass}`}>
              <ChartIcon className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {animated ? "Interactive chart will appear here" : "Chart will appear here"}
            </p>
          </div>
        )}
        
        {/* Actual chart content */}
        <div className={`${animated ? 'transition-all duration-500' : ''}`}>
          {children}
        </div>
      </div>
      
      {/* Bottom gradient effect */}
      {animated && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent pointer-events-none" />
      )}
      
      {/* Interactive hover effect for corners */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-transparent transition-all duration-300 ${isHovered ? 'border-blue-500/50' : ''}`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent transition-all duration-300 ${isHovered ? 'border-blue-500/50' : ''}`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-transparent transition-all duration-300 ${isHovered ? 'border-blue-500/50' : ''}`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-transparent transition-all duration-300 ${isHovered ? 'border-blue-500/50' : ''}`} />
    </div>
  );
} 
/// <reference path="../../types/react.d.ts" />
"use client";

import * as React from 'react';
import { Moon, Sun, Settings, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PremiumThemeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  gradient?: string;
}

interface PremiumThemeSwitcherProps {
  className?: string;
  align?: 'start' | 'center' | 'end';
  showLabel?: boolean;
  glassEffect?: boolean;
  animated?: boolean;
}

export function PremiumThemeSwitcher({
  className,
  align = 'center',
  showLabel = true,
  glassEffect = true,
  animated = true,
}: PremiumThemeSwitcherProps) {
  // Use a simple theme state since we don't have next-themes
  const [theme, setTheme] = React.useState('system' as string);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Mock theme change function (in a real app this would use next-themes)
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // This would normally apply the theme to the document
    console.log(`Theme changed to: ${newTheme}`);
  };
  
  const themeOptions: PremiumThemeOption[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      gradient: 'from-amber-300 to-yellow-500'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      gradient: 'from-indigo-500 to-purple-700'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Settings className="h-4 w-4" />,
      gradient: 'from-blue-400 to-emerald-400'
    },
  ];
  
  const currentOption = themeOptions.find(opt => opt.value === theme) || themeOptions[2];
  
  const containerClasses = cn(
    "relative rounded-full p-1 transition-all duration-300 select-none",
    glassEffect ? "backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-800/50" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
    isHovered ? "shadow-md" : "shadow-sm",
    className
  );
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Calculate dropdown alignment classes
  const dropdownAlignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0"
  };
  
  return (
    <div className="relative inline-block">
      <button
        className={containerClasses}
        onClick={toggleMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* Current selection with icon */}
          <span className={`inline-flex items-center justify-center rounded-full w-6 h-6 bg-gradient-to-br ${currentOption.gradient} text-white`}>
            {currentOption.icon}
          </span>
          
          {showLabel && (
            <span className="text-sm font-medium">
              {currentOption.label}
            </span>
          )}
          
          {/* Premium sparkle indicator */}
          <Sparkles className="h-3 w-3 text-blue-500" />
        </div>
        
        {/* Button highlight effect */}
        <div className={cn(
          "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          isHovered ? "opacity-100" : "",
          `bg-gradient-to-r ${currentOption.gradient} opacity-10`
        )} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-40 rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900",
            glassEffect ? "backdrop-blur-lg bg-white/90 dark:bg-gray-900/90" : "",
            dropdownAlignClasses[align],
            animated ? "animate-in fade-in-80 zoom-in-95" : ""
          )}
        >
          <div className="p-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  "transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                  theme === option.value && "bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => {
                  handleThemeChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className={`inline-flex items-center justify-center rounded-full w-5 h-5 bg-gradient-to-br ${option.gradient} text-white`}>
                  {option.icon}
                </span>
                <span>{option.label}</span>
                
                {theme === option.value && (
                  <span className="ml-auto rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                )}
              </button>
            ))}
          </div>
          
          {/* Premium badge */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
            <div className="flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" /> Premium Themes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * Useful for conditional styling with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random ID for elements that need unique identifiers
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if color is light or dark to ensure proper contrast
 */
export function isLightColor(color: string): boolean {
  // Hex color
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  // Simple check for known light colors
  const lightColors = ['white', 'light', 'yellow', 'lime', 'cyan'];
  return lightColors.some(c => color.includes(c));
}

/**
 * Format number with thousands separators and optional decimal places
 */
export function formatNumber(
  value: number,
  options: { 
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string {
  const { 
    decimals = 0, 
    prefix = '', 
    suffix = '',
    compact = false
  } = options;
  
  let formattedValue: string;
  
  if (compact) {
    // Use Intl.NumberFormat for compact notation (K, M, B, etc.)
    formattedValue = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: decimals
    }).format(value);
  } else {
    // Use Intl.NumberFormat for standard formatting
    formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
  
  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Get contrasting text color (black or white) based on background color
 */
export function getContrastColor(bgColor: string): 'black' | 'white' {
  return isLightColor(bgColor) ? 'black' : 'white';
}

/**
 * Returns a function that applies a material-like ripple effect to an element
 */
export function applyRippleEffect(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  // Position the ripple element
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple-effect");

  // Remove existing ripples
  const ripple = button.querySelector(".ripple-effect");
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);

  // Remove the ripple element after animation completes
  setTimeout(() => {
    circle.remove();
  }, 600);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Wait for a specified amount of time (useful for animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Color related utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-500',
    available: 'bg-green-100 text-green-800 border-green-500',
    occupied: 'bg-blue-100 text-blue-800 border-blue-500',
    'in-use': 'bg-blue-100 text-blue-800 border-blue-500',
    charging: 'bg-blue-100 text-blue-800 border-blue-500',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    faulted: 'bg-red-100 text-red-800 border-red-500',
    offline: 'bg-gray-100 text-gray-800 border-gray-500',
    inactive: 'bg-gray-100 text-gray-800 border-gray-500',
    critical: 'bg-red-100 text-red-800 border-red-500',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    info: 'bg-blue-100 text-blue-800 border-blue-500',
    success: 'bg-green-100 text-green-800 border-green-500',
  };
  
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-500';
} 
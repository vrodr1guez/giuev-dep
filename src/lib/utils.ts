import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  notation: 'standard' | 'scientific' | 'engineering' | 'compact' = 'compact'
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatNumber(
  value: number,
  notation: 'standard' | 'scientific' | 'engineering' | 'compact' = 'standard',
  maximumFractionDigits: number = 0
) {
  return new Intl.NumberFormat('en-US', {
    notation,
    maximumFractionDigits,
  }).format(value)
}

export function formatPercentage(value: number, maximumFractionDigits: number = 1) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits,
  }).format(value / 100)
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let lastFunc: NodeJS.Timeout
  let lastRan: number
  return ((...args: any[]) => {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }) as T
} 
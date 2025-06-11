'use client'

import * as React from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Placeholder for future query client integration
  // Can be enhanced with react-query/tanstack-query later if needed
  return <>{children}</>
} 
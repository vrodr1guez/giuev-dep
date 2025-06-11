// This file provides a workaround for React import issues
import React from 'react';

// Export all React components with namespace
export default React;
export const { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef, 
  useContext, 
  createContext,
  forwardRef,
  Fragment,
  createElement
} = React; 
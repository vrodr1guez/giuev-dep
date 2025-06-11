// This is a helper file that re-exports React functionality in a way that's compatible
// with both ESM and CommonJS
import React from 'react';

// Re-export everything from React
export { React };
export default React;

// Core hooks
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useContext = React.useContext;
export const useRef = React.useRef;
export const useMemo = React.useMemo;
export const useCallback = React.useCallback;
export const useReducer = React.useReducer;

// Component-related
export const forwardRef = React.forwardRef;
export const createElement = React.createElement;
export const Fragment = React.Fragment;
export const cloneElement = React.cloneElement;
export const memo = React.memo;
export const createContext = React.createContext;

// Children utilities
export const Children = React.Children;

// Types
export type FC<P = {}> = React.FC<P>;
export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;
export type CSSProperties = React.CSSProperties; 
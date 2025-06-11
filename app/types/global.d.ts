/// <reference types="react" />
/// <reference types="react-redux" />

declare module 'react' {
  import * as React from 'react';
  
  // Re-export all React types and hooks
  export type FC<P = {}> = React.FC<P>;
  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
  export type ChangeEvent<T> = React.ChangeEvent<T>;
  export type MouseEvent<T> = React.MouseEvent<T>;
  export type CSSProperties = React.CSSProperties;
  
  // Hooks
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useCallback: typeof React.useCallback;
  export const useMemo: typeof React.useMemo;
  export const useRef: typeof React.useRef;
  export const useContext: typeof React.useContext;
  
  export default React;
}

declare module 'react-redux' {
  export * from 'react-redux';
  export interface DefaultRootState {}
}

// Global type definitions
// Extends the Window interface
interface Window {
  process?: {
    env: {
      NODE_ENV: 'development' | 'production' | 'test';
      [key: string]: string | undefined;
    };
  };
}

// Global process for Node.js environment
declare var process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
  cwd: () => string;
};

// Global __dirname for Node.js environment
declare var __dirname: string;

// Make TypeScript happy with importing CSS modules
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image imports
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

// Additional module declarations for specific libraries
declare module 'leaflet/dist/leaflet.css' {
  const content: any;
  export default content;
}

// Override certain React types to fix TypeScript errors
import 'react'

declare global {
  namespace React {
    // Fix forwardRef implicit any errors
    interface ForwardRefExoticComponent<P = any> {
      defaultProps?: Partial<P>
      displayName?: string
    }

    // Fix various ReactNode children errors
    interface FunctionComponent<P = {}> {
      (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null
      propTypes?: WeakValidationMap<P>
      contextTypes?: ValidationMap<any>
      defaultProps?: Partial<P>
      displayName?: string
    }
  }
}

// Make TypeScript recognize module imports and exports
declare module 'react' {
  export default React
  export import Children = React.Children
  export import Component = React.Component
  export import PureComponent = React.PureComponent
  export import createElement = React.createElement
  export import createRef = React.createRef
  export import forwardRef = React.forwardRef
  export import Fragment = React.Fragment
  export import StrictMode = React.StrictMode
  export import createContext = React.createContext
  export import createFactory = React.createFactory
  export import cloneElement = React.cloneElement
  export import createPortal = React.createPortal
  export import memo = React.memo
  export import isValidElement = React.isValidElement
  export import useState = React.useState
  export import useEffect = React.useEffect
  export import useContext = React.useContext
  export import useReducer = React.useReducer
  export import useCallback = React.useCallback
  export import useMemo = React.useMemo
  export import useRef = React.useRef
  export import useImperativeHandle = React.useImperativeHandle
  export import useLayoutEffect = React.useLayoutEffect
  export import useDebugValue = React.useDebugValue
  export import lazy = React.lazy
  export import Suspense = React.Suspense
}

export {} 
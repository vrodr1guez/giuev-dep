// Module declarations for external dependencies

// React
declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

// React DOM
declare module 'react-dom' {
  import * as ReactDOM from 'react-dom';
  export = ReactDOM;
  export as namespace ReactDOM;
}

// Redux toolkit
declare module '@reduxjs/toolkit' {
  export * from '../types/redux-toolkit';
}

// Node built-in modules
declare module 'path' {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
}

// Vite
declare module 'vite' {
  export function defineConfig(config: any): any;
}

// Vite plugins
declare module '@vitejs/plugin-react' {
  function reactPlugin(options?: any): any;
  export default reactPlugin;
}

// Recharts
declare module 'recharts' {
  import { ReactNode, ComponentType } from 'react';

  // Common types
  export type Point = {
    x: number;
    y: number;
  };
  
  export interface ChartProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
  }

  // Component exports
  export const AreaChart: ComponentType<ChartProps>;
  export const Area: ComponentType<any>;
  export const BarChart: ComponentType<ChartProps>;
  export const Bar: ComponentType<any>;
  export const LineChart: ComponentType<ChartProps>;
  export const Line: ComponentType<any>;
  export const PieChart: ComponentType<ChartProps>;
  export const Pie: ComponentType<any>;
  export const Cell: ComponentType<any>;
  export const XAxis: ComponentType<any>;
  export const YAxis: ComponentType<any>;
  export const CartesianGrid: ComponentType<any>;
  export const Tooltip: ComponentType<any>;
  export const Legend: ComponentType<any>;
  export const ResponsiveContainer: ComponentType<any>;
  export const ReferenceLine: ComponentType<any>;
}

// For zod schema references
declare namespace z {
  export type infer<T> = T extends { _input: infer U } ? U : never;
}

// Leaflet
declare module 'leaflet' {
  export type Map = any;
  export type Marker = any;
  export type LatLngExpression = [number, number] | { lat: number; lng: number };
  export type DivIcon = any;
  
  const leaflet = {
    map: (el: string | HTMLElement) => any,
    tileLayer: (url: string, options?: any) => any,
    marker: (latlng: LatLngExpression, options?: any) => any,
    divIcon: (options?: any) => any
  };
  
  export default leaflet;
}

// Zod
declare module 'zod' {
  export const z: any;
  export function object(schema: any): any;
  export function string(): any;
  export function number(): any;
  export function boolean(): any;
  export function array(schema: any): any;
}

// Next.js
declare module 'next/link' {
  import React from 'react';
  
  interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    [key: string]: any;
  }
  
  export default function Link(props: React.PropsWithChildren<LinkProps>): JSX.Element;
}

// Empty file to satisfy imports 
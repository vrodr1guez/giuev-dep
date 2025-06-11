// Global TypeScript declarations to fix module import issues
import React from 'react';

declare global {
  // Make React available globally
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

// Fix for module imports
declare module 'recharts' {
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const ResponsiveContainer: any;
  export const Tooltip: any;
  export const Legend: any;
  export const Line: any;
  export const LineChart: any;
  export const BarChart: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Area: any;
  export const AreaChart: any;
  export const Radar: any;
  export const RadarChart: any;
  export const PolarGrid: any;
  export const PolarAngleAxis: any;
  export const ReferenceLine: any;
} 
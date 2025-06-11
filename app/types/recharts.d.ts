declare module 'recharts' {
  import * as React from 'react';

  // Common types
  export type AxisDomain = [number, number] | [string, string];

  // Fix for JSX element type errors - make all components extend React.Component properly
  interface CommonProps {
    className?: string;
    style?: React.CSSProperties;
  }

  // Properly declare the component types to work with JSX
  export interface ResponsiveContainerProps extends CommonProps {
    width?: string | number;
    height?: string | number;
    aspect?: number;
    minWidth?: string | number;
    minHeight?: string | number;
    debounce?: number;
    id?: string;
    children?: React.ReactNode;
  }

  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;

  export interface LineChartProps extends CommonProps {
    width?: number;
    height?: number;
    data?: any[];
    layout?: 'horizontal' | 'vertical';
    syncId?: string;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: React.ReactNode;
  }

  export const LineChart: React.FC<LineChartProps>;

  export interface BarChartProps extends CommonProps {
    width?: number;
    height?: number;
    data?: any[];
    layout?: 'horizontal' | 'vertical';
    barGap?: number;
    barCategoryGap?: number | string;
    barSize?: number;
    maxBarSize?: number;
    children?: React.ReactNode;
  }

  export const BarChart: React.FC<BarChartProps>;

  export interface PieChartProps extends CommonProps {
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: React.ReactNode;
  }

  export const PieChart: React.FC<PieChartProps>;

  export interface CartesianGridProps extends CommonProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
    horizontalCoordinatesGenerator?: Function;
    verticalCoordinatesGenerator?: Function;
    strokeDasharray?: string;
  }

  export const CartesianGrid: React.FC<CartesianGridProps>;

  export interface XAxisProps extends CommonProps {
    hide?: boolean;
    dataKey?: string;
    xAxisId?: string | number;
    width?: number;
    height?: number;
    type?: 'number' | 'category';
    domain?: [number | string, number | string];
    allowDecimals?: boolean;
    allowDataOverflow?: boolean;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    tickFormatter?: (value: any) => string;
    ticks?: any[];
    tickCount?: number;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    padding?: { left?: number; right?: number };
    minTickGap?: number;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    label?: string | number | React.ReactElement | object;
    mirror?: boolean;
    orientation?: 'top' | 'bottom';
  }

  export const XAxis: React.FC<XAxisProps>;

  export interface YAxisProps extends CommonProps {
    hide?: boolean;
    dataKey?: string;
    yAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'left' | 'right';
    type?: 'number' | 'category';
    domain?: [number | string, number | string];
    allowDecimals?: boolean;
    allowDataOverflow?: boolean;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    tickFormatter?: (value: any) => string;
    ticks?: any[];
    tickCount?: number;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    padding?: { top?: number; bottom?: number };
    minTickGap?: number;
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    label?: string | number | React.ReactElement | object;
    mirror?: boolean;
    unit?: string;
  }

  export const YAxis: React.FC<YAxisProps>;

  export interface TooltipProps extends CommonProps {
    content?: React.ReactElement | Function;
    viewBox?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
    active?: boolean;
    offset?: number;
    position?: { x?: number; y?: number };
    coordinate?: { x?: number; y?: number };
    cursor?: boolean | object | React.ReactElement;
    separator?: string;
    formatter?: Function;
    labelFormatter?: Function;
    wrapperStyle?: object;
    contentStyle?: object;
    itemStyle?: object;
    labelStyle?: object;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  }

  export const Tooltip: React.FC<TooltipProps>;

  export interface LegendProps extends CommonProps {
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    iconSize?: number;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    payload?: Array<{
      value: string;
      type?: string;
      id?: string;
      color?: string;
    }>;
    formatter?: Function;
    onClick?: Function;
    onMouseEnter?: Function;
    onMouseLeave?: Function;
    wrapperStyle?: object;
  }

  export const Legend: React.FC<LegendProps>;

  export interface LineProps extends CommonProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    activeDot?: boolean | object | React.ReactElement;
    dot?: boolean | object | React.ReactElement | Function;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    name?: string;
    yAxisId?: string | number;
    xAxisId?: string | number;
    connectNulls?: boolean;
  }

  export const Line: React.FC<LineProps>;

  export interface BarProps extends CommonProps {
    dataKey: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    maxBarSize?: number;
    minPointSize?: number;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    label?: boolean | object | React.ReactElement | Function;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    stackId?: string | number;
    background?: boolean | object | React.ReactElement;
    name?: string;
    yAxisId?: string | number;
    xAxisId?: string | number;
  }

  export const Bar: React.FC<BarProps>;

  export interface PieProps extends CommonProps {
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    paddingAngle?: number;
    startAngle?: number;
    endAngle?: number;
    minAngle?: number;
    nameKey?: string;
    dataKey: string;
    data?: object[];
    blendStroke?: boolean;
    activeIndex?: number | number[];
    activeShape?: object | Function | React.ReactElement;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    label?: boolean | object | React.ReactElement | Function;
    labelLine?: boolean | object | React.ReactElement | Function;
    onClick?: Function;
    onMouseEnter?: Function;
    onMouseLeave?: Function;
    children?: React.ReactNode;
  }

  export const Pie: React.FC<PieProps>;

  export interface CellProps extends CommonProps {
    fill?: string;
    stroke?: string;
    key?: string | number;
  }

  export const Cell: React.FC<CellProps>;
} 
"use client";

import * as React from 'react';
import { LineChart, BarChart, PieChart, ArrowUp, ArrowDown, Info, Maximize2, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { PremiumButton } from './premium-button';

// Define chart types and colors
const CHART_COLORS = {
  blue: {
    primary: 'rgba(59, 130, 246, 1)',
    light: 'rgba(59, 130, 246, 0.2)',
    gradient: 'from-blue-500 to-blue-600',
  },
  purple: {
    primary: 'rgba(168, 85, 247, 1)',
    light: 'rgba(168, 85, 247, 0.2)',
    gradient: 'from-purple-500 to-purple-600',
  },
  green: {
    primary: 'rgba(34, 197, 94, 1)',
    light: 'rgba(34, 197, 94, 0.2)',
    gradient: 'from-green-500 to-green-600',
  },
  amber: {
    primary: 'rgba(245, 158, 11, 1)',
    light: 'rgba(245, 158, 11, 0.2)',
    gradient: 'from-amber-500 to-amber-600',
  },
};

// Demo data generator
const generateDemoData = (type: string, dataPoints: number = 12) => {
  if (type === 'line') {
    return Array.from({ length: dataPoints }, (_, i) => ({
      label: `${i + 1}`,
      value: Math.floor(Math.random() * 80) + 20, // Random value between 20-100
    }));
  }
  
  if (type === 'bar') {
    return Array.from({ length: dataPoints }, (_, i) => ({
      label: `Category ${i + 1}`,
      value: Math.floor(Math.random() * 80) + 20, // Random value between 20-100
    }));
  }
  
  if (type === 'pie') {
    return Array.from({ length: 4 }, (_, i) => ({
      label: `Segment ${i + 1}`,
      value: Math.floor(Math.random() * 30) + 10, // Random value between 10-40
    }));
  }
  
  return [];
};

interface PremiumAdvancedChartProps {
  type: 'line' | 'bar' | 'pie';
  title?: string;
  subtitle?: string;
  data?: any[];
  color?: 'blue' | 'purple' | 'green' | 'amber';
  height?: string;
  className?: string;
  loading?: boolean;
  animated?: boolean;
  glassmorphism?: boolean;
  interactive?: boolean;
  showControls?: boolean;
  showLegend?: boolean;
}

export function PremiumAdvancedChart({
  type = 'line',
  title,
  subtitle,
  data: providedData,
  color = 'blue',
  height = '300px',
  className,
  loading = false,
  animated = true,
  glassmorphism = true,
  interactive = true,
  showControls = true,
  showLegend = true,
}: PremiumAdvancedChartProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeDataPoint, setActiveDataPoint] = React.useState(null as number | null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  
  // Generate demo data if not provided
  const data = React.useMemo(() => 
    providedData || generateDemoData(type, type === 'pie' ? 4 : 12), 
  [providedData, type]);
  
  // Calculate max value for scaling
  const maxValue = React.useMemo(() => 
    Math.max(...data.map(item => item.value)) * 1.1, 
  [data]);
  
  // Simulate data loading if animation is enabled
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setIsDataLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsDataLoaded(true);
    }
  }, [animated]);
  
  // Canvas drawing for charts
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    if (!canvasRef.current || !isDataLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw based on chart type
    if (type === 'line') {
      drawLineChart(ctx, data, rect, CHART_COLORS[color], activeDataPoint, animated && isDataLoaded);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, rect, CHART_COLORS[color], activeDataPoint, animated && isDataLoaded);
    } else if (type === 'pie') {
      drawPieChart(ctx, data, rect, activeDataPoint, animated && isDataLoaded);
    }
    
  }, [data, type, color, activeDataPoint, isDataLoaded, animated]);
  
  // Handle canvas interactions
  const handleCanvasMouseMove = (e: any) => {
    if (!interactive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Calculate which data point is being hovered
    if (type === 'line' || type === 'bar') {
      const pointWidth = rect.width / data.length;
      const index = Math.floor(x / pointWidth);
      setActiveDataPoint(index >= 0 && index < data.length ? index : null);
    }
  };
  
  const handleCanvasMouseLeave = () => {
    setActiveDataPoint(null);
  };
  
  // Container classes
  const containerClasses = cn(
    "relative overflow-hidden transition-all duration-300 rounded-xl",
    glassmorphism ? 
      "backdrop-blur-md bg-white/10 dark:bg-gray-900/30 border border-white/20 dark:border-gray-800/50" : 
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
    isHovered && !isFullscreen ? "shadow-lg" : "shadow-md",
    className
  );
  
  // Get chart icon
  const ChartIcon = React.useMemo(() => {
    if (type === 'line') return LineChart;
    if (type === 'bar') return BarChart;
    return PieChart;
  }, [type]);
  
  // Style for container
  const containerStyle = {
    height: isFullscreen ? '100vh' : height,
  };
  
  // Get trend info if available
  const hasTrend = data.length > 1;
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trendPercentage = hasTrend ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isTrendPositive = trendPercentage >= 0;
  
  return (
    <div
      className={cn(
        containerClasses,
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      )}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with title and controls */}
      {(title || showControls) && (
        <div className="p-4 flex justify-between items-start border-b border-gray-100 dark:border-gray-800">
          {title && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
              
              {/* Trend indicator */}
              {hasTrend && (
                <div className="flex items-center mt-1">
                  <div className={cn(
                    "text-xs font-medium flex items-center gap-1 rounded-full px-1.5 py-0.5",
                    isTrendPositive ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : 
                                     "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                  )}>
                    {isTrendPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(trendPercentage).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showControls && (
            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                ripple={true}
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => console.log('Download chart')}
              >
                <span className="hidden sm:inline">Export</span>
              </PremiumButton>
              
              <PremiumButton
                variant="outline"
                size="sm"
                ripple={true}
                leftIcon={<Maximize2 className="h-4 w-4" />}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </PremiumButton>
            </div>
          )}
        </div>
      )}
      
      {/* Canvas container */}
      <div className="relative p-4 flex-1 h-full flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Chart canvas */}
            <div className="flex-1 relative min-h-[200px]">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer"
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
              />
              
              {/* Tooltip for data point */}
              {activeDataPoint !== null && data[activeDataPoint] && (
                <div className="absolute pointer-events-none bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-sm"
                     style={{
                       left: `${(activeDataPoint / (data.length - 1)) * 100}%`,
                       transform: 'translateX(-50%)',
                       top: '10px'
                     }}>
                  <div className="font-medium">{data[activeDataPoint].label}</div>
                  <div className="text-blue-600 dark:text-blue-400">{data[activeDataPoint].value}</div>
                </div>
              )}
              
              {/* Placeholder before animation */}
              {!isDataLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ChartIcon className={`h-12 w-12 text-${color}-100 dark:text-${color}-900/20 mb-4`} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading chart data...
                  </p>
                </div>
              )}
            </div>
            
            {/* Legend */}
            {showLegend && type === 'pie' && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" 
                         style={{ backgroundColor: getPieChartColor(index) }} />
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Bottom info strip */}
      <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <Info className="h-3 w-3 mr-1" />
        {type === 'line' ? 'Line chart showing data trends over time' :
         type === 'bar' ? 'Bar chart showing data distribution by category' :
         'Pie chart showing proportional data distribution'}
      </div>
    </div>
  );
}

// Drawing functions
function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: any[],
  rect: DOMRect,
  colors: any,
  activePoint: number | null,
  animated: boolean
) {
  if (!data.length) return;
  
  const width = rect.width;
  const height = rect.height - 40; // Leave room for labels
  const padding = 20;
  const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
  
  // Draw grid lines
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * (i / 4);
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
  }
  ctx.stroke();
  
  // Calculate points
  const points = data.map((d, i) => ({
    x: padding + (width - padding * 2) * (i / (data.length - 1)),
    y: height - (((d.value / maxValue) * (height - padding * 2)) + padding),
    value: d.value,
    label: d.label
  }));
  
  // Animation progress
  const animProgress = animated ? Math.min(1, Date.now() % 5000 / 1000) : 1;
  const visiblePoints = animated ? 
    points.slice(0, Math.ceil(points.length * animProgress)) : 
    points;
  
  if (visiblePoints.length < 2) return;
  
  // Draw area
  ctx.beginPath();
  ctx.moveTo(visiblePoints[0].x, height);
  visiblePoints.forEach(point => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(visiblePoints[visiblePoints.length - 1].x, height);
  ctx.fillStyle = colors.light;
  ctx.fill();
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
  visiblePoints.forEach(point => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw points
  visiblePoints.forEach((point, i) => {
    ctx.beginPath();
    const radius = activePoint === i ? 6 : 4;
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = activePoint === i ? '#FFFFFF' : colors.primary;
    ctx.fill();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw labels on x-axis
    ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(point.label, point.x, height - 5);
  });
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: any[],
  rect: DOMRect,
  colors: any,
  activeBar: number | null,
  animated: boolean
) {
  if (!data.length) return;
  
  const width = rect.width;
  const height = rect.height - 40; // Leave room for labels
  const padding = 20;
  const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
  
  // Calculate bar dimensions
  const barCount = data.length;
  const barWidth = (width - padding * 2) / barCount * 0.7;
  const barGap = (width - padding * 2) / barCount * 0.3;
  
  // Draw grid lines
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * (i / 4);
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
  }
  ctx.stroke();
  
  // Animation progress
  const animProgress = animated ? Math.min(1, Date.now() % 5000 / 1000) : 1;
  
  // Draw bars
  data.forEach((d, i) => {
    const barHeight = ((d.value / maxValue) * (height - padding * 2)) * animProgress;
    const x = padding + i * ((width - padding * 2) / barCount);
    const y = height - barHeight - padding;
    
    // Bar body
    ctx.beginPath();
    ctx.rect(x + barGap/2, y, barWidth, barHeight);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.light);
    
    ctx.fillStyle = activeBar === i ? colors.primary : gradient;
    ctx.fill();
    
    // Bar highlight
    if (activeBar === i) {
      ctx.beginPath();
      ctx.rect(x + barGap/2, y, barWidth, barHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw labels on x-axis
    ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.label.substring(0, 8), x + barWidth/2 + barGap/2, height - 5);
  });
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  data: any[],
  rect: DOMRect,
  activeSegment: number | null,
  animated: boolean
) {
  if (!data.length) return;
  
  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.5;
  
  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // Animation progress
  const animProgress = animated ? Math.min(1, Date.now() % 5000 / 1000) : 1;
  const endAngle = animProgress * Math.PI * 2;
  
  let startAngle = 0;
  
  // Draw segments
  data.forEach((d, i) => {
    const segmentAngle = (d.value / total) * endAngle;
    const angle = startAngle + segmentAngle / 2;
    
    // Calculate if segment should be pulled out
    const pull = activeSegment === i ? radius * 0.1 : 0;
    const offsetX = pull * Math.cos(angle);
    const offsetY = pull * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(centerX + offsetX, centerY + offsetY);
    ctx.arc(
      centerX + offsetX, 
      centerY + offsetY, 
      radius, 
      startAngle, 
      startAngle + segmentAngle
    );
    ctx.lineTo(centerX + offsetX, centerY + offsetY);
    ctx.fillStyle = getPieChartColor(i);
    ctx.fill();
    
    // Stroke
    ctx.lineWidth = activeSegment === i ? 2 : 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    
    // Draw percentage in center of segment
    if (segmentAngle > 0.2) {
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(startAngle + segmentAngle / 2) * labelRadius + offsetX;
      const labelY = centerY + Math.sin(startAngle + segmentAngle / 2) * labelRadius + offsetY;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((d.value / total) * 100) + '%', labelX, labelY);
    }
    
    startAngle += segmentAngle;
  });
  
  // Draw center hole for donut chart
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = animated ? 'rgba(255, 255, 255, 0.8)' : '#FFFFFF';
  ctx.fill();
  
  // Draw total in center
  ctx.fillStyle = 'rgba(107, 114, 128, 0.8)';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Total', centerX, centerY - 10);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText(total.toString(), centerX, centerY + 10);
}

// Helper to get consistent pie chart colors
function getPieChartColor(index: number): string {
  const colors = [
    'rgba(59, 130, 246, 1)',   // Blue
    'rgba(168, 85, 247, 1)',    // Purple
    'rgba(34, 197, 94, 1)',     // Green
    'rgba(245, 158, 11, 1)',    // Amber
    'rgba(239, 68, 68, 1)',     // Red
    'rgba(16, 185, 129, 1)',    // Emerald
    'rgba(14, 165, 233, 1)',    // Sky
    'rgba(236, 72, 153, 1)',    // Pink
  ];
  
  return colors[index % colors.length];
} 
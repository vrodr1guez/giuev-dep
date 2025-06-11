import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from "../../ui/card";

export interface KpiTrend {
  value: string;
  direction: 'up' | 'down' | 'neutral';
  label: string;
  isPositive?: boolean;
}

export interface KpiCardProps {
  title: string;
  value: string;
  trend?: KpiTrend;
  icon: React.ReactNode;
  color: string;
  linkTo?: string;
  loading?: boolean;
  sparklineData?: number[];
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title, 
  value, 
  trend, 
  icon, 
  color, 
  linkTo, 
  loading = false,
  sparklineData,
  className = '' 
}: KpiCardProps) => {
  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.isPositive !== undefined) {
      // If isPositive is explicitly set, use that
      return trend.isPositive 
        ? 'text-green-500' 
        : 'text-red-500';
    }
    
    // Otherwise use direction and if trend starts with + or -
    if (trend.direction === 'up') {
      return trend.value.startsWith('+') ? 'text-green-500' : 'text-red-500';
    } else if (trend.direction === 'down') {
      return trend.value.startsWith('-') ? 'text-red-500' : 'text-green-500';
    }
    
    return 'text-gray-500';
  };
  
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min;
    const width = 60;
    const height = 24;
    const points = sparklineData.map((value: number, index: number) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - min) / (range || 1)) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="absolute bottom-2 right-2 opacity-30">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };
  
  const cardContent = (
    <Card className={`relative group overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }}></div>
      <div className="p-4 pl-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className="p-2 rounded-md transition-colors" style={{ backgroundColor: `${color}20` }}>
            {icon}
          </div>
        </div>
        
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 animate-pulse rounded mb-2"></div>
        ) : (
          <p className="text-2xl font-bold tracking-tight mb-1">{value}</p>
        )}
        
        {trend && !loading && (
          <div className="flex items-center text-xs">
            {trend.direction === 'up' ? (
              <TrendingUp size={14} className={`${getTrendColor()} mr-1`} />
            ) : trend.direction === 'down' ? (
              <TrendingDown size={14} className={`${getTrendColor()} mr-1`} />
            ) : (
              <span className="w-3.5 h-3.5"></span>
            )}
            <span className={getTrendColor()}>
              {trend.value} {trend.label}
            </span>
          </div>
        )}
        
        {loading && (
          <div className="h-3 w-24 bg-gray-700 animate-pulse rounded"></div>
        )}
        
        {renderSparkline()}
        
        {!loading && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent to-opacity-10 group-hover:opacity-10 transition-opacity duration-300" 
            style={{ backgroundColor: `${color}10` }}
          ></div>
        )}
      </div>
    </Card>
  );

  if (linkTo && !loading) {
    return <Link href={linkTo}>{cardContent}</Link>;
  }
  
  return cardContent;
};

export default KpiCard; 
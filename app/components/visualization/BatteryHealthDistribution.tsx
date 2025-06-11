'use client';

import React, { useMemo } from 'react';
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { BatteryCharging, Info, MoreHorizontal } from 'lucide-react';

export interface BatteryHealthCategory {
  name: string;
  label: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface BatteryHealthDistributionProps {
  data: BatteryHealthCategory[];
  loading?: boolean;
  onCategoryClick?: (category: BatteryHealthCategory) => void;
  className?: string;
}

export const BatteryHealthDistribution: React.FC<BatteryHealthDistributionProps> = ({
  data,
  loading = false,
  onCategoryClick,
  className = ''
}) => {
  // Calculate total vehicles
  const totalVehicles = useMemo(() => {
    return data.reduce((sum, category) => sum + category.count, 0);
  }, [data]);

  return (
    <Card className={`battery-health-distribution overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-700">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BatteryCharging size={16} className="text-green-500" />
          <span>Battery Health Distribution</span>
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full"
            aria-label="Information"
          >
            <Info size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="h-48 w-48 rounded-full bg-gray-700 animate-pulse mx-auto"></div>
            <div className="w-full grid grid-cols-1 gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-700 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Radial bars visualization */}
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Total Vehicles</div>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                </div>
              </div>
              
              {/* SVG for radial bars */}
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <g transform="translate(100,100)">
                  {data.map((category, index) => {
                    // Calculate dimensions for each ring
                    const ringWidth = 10;
                    const spacing = 2;
                    const radius = 60 - (index * (ringWidth + spacing));
                    const circumference = 2 * Math.PI * radius;
                    const percentage = category.percentage;
                    const dashArray = `${(circumference * percentage) / 100} ${circumference}`;
                    
                    return (
                      <circle
                        key={category.name}
                        cx="0"
                        cy="0"
                        r={radius}
                        fill="transparent"
                        stroke={category.fill}
                        strokeWidth={ringWidth}
                        strokeDasharray={dashArray}
                        className="transition-all duration-700 ease-out cursor-pointer hover:opacity-90"
                        onClick={() => onCategoryClick && onCategoryClick(category)}
                      />
                    );
                  })}
                </g>
              </svg>
            </div>
            
            {/* Legend */}
            <div className="w-full grid grid-cols-1 gap-2 mt-4">
              {data.map((category) => (
                <div 
                  key={category.name}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => onCategoryClick && onCategoryClick(category)}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.fill }}
                    ></span>
                    <span className="text-sm">{category.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{category.count}</span>
                    <span className="text-xs text-gray-400">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BatteryHealthDistribution; 
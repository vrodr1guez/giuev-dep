'use client';

import React from 'react';

interface BatteryStatusProps {
  level: number;
  soh: number;
  showRange?: boolean;
  range?: number;
}

const BatteryStatus: React.FC<BatteryStatusProps> = ({ 
  level, 
  soh, 
  showRange = false, 
  range 
}) => {
  const getBatteryLevelColor = (level: number): string => {
    if (level >= 60) return 'bg-green-500';
    if (level >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSoHColor = (soh: number): string => {
    if (soh >= 95) return 'text-green-500';
    if (soh >= 90) return 'text-blue-500';
    if (soh >= 85) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-16 rounded-full ${getBatteryLevelColor(level)}`} style={{ width: '4rem' }}>
          <div className="h-full rounded-full" style={{ width: `${level}%` }}></div>
        </div>
        <span className="text-sm font-medium">{level}%</span>
      </div>
      <div className="flex items-center text-xs text-gray-500">
        <span className={`font-medium ${getSoHColor(soh)}`}>SoH: {soh}%</span>
        {showRange && range && (
          <span className="ml-2">• {range} mi</span>
        )}
      </div>
    </div>
  );
};

export default BatteryStatus; 
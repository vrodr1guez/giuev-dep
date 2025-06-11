import * as React from 'react';
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Activity, AlertTriangle, Calendar, CheckCircle, Settings } from 'lucide-react';

export interface FleetHealthMetric {
  name: string;
  score: number;
  color: string;
  icon: React.ReactNode;
}

export interface FleetHealthGaugeProps {
  overallScore: number;
  metrics: FleetHealthMetric[];
  loading?: boolean;
  className?: string;
}

export const FleetHealthGauge: React.FC<FleetHealthGaugeProps> = ({
  overallScore,
  metrics,
  loading = false,
  className = ''
}) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 95) return '#22c55e'; // green
    if (score >= 85) return '#3b82f6'; // blue
    if (score >= 75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Calculate gauge rotation (from -90 to 90 degrees)
  const getRotation = (score: number) => {
    // Convert 0-100 to -90 to 90 degrees
    return -90 + (score / 100) * 180;
  };

  return (
    <Card className={`fleet-health-gauge overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-700">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity size={16} className="text-blue-500" />
          <span>Fleet Health</span>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col items-center">
        {loading ? (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-4">
            <div className="h-32 w-32 rounded-full bg-gray-700 animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-700 animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            {/* Gauge visualization */}
            <div className="relative w-48 h-24 my-4">
              {/* Gauge background */}
              <div className="absolute inset-0 top-auto h-1/2 bg-gray-700 rounded-b-full"></div>
              <div className="absolute inset-0 top-auto h-1/2 bg-gray-800 rounded-b-full overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
                {/* Colored fill */}
                <div 
                  className="absolute inset-0 top-auto h-1/2 transition-all duration-700 ease-out"
                  style={{
                    background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore}%, transparent ${overallScore}%)`,
                    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 0 100%, 0 0)'
                  }}
                ></div>
              </div>
              
              {/* Gauge needle */}
              <div className="absolute top-0 left-1/2 w-1 h-1/2 -translate-x-1/2 origin-bottom transition-transform duration-700" 
                style={{ transform: `rotate(${getRotation(overallScore)}deg)` }}>
                <div className="w-1 h-full bg-white rounded-t-full"></div>
                <div className="w-3 h-3 rounded-full bg-white absolute bottom-0 left-1/2 -translate-x-1/2"></div>
              </div>
              
              {/* Score display */}
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <span className="text-2xl font-bold">{overallScore}%</span>
              </div>
              
              {/* Scale markers */}
              <div className="absolute top-0 left-0 w-full flex justify-between px-2">
                <span className="text-xs text-gray-500">0</span>
                <span className="text-xs text-gray-500">50</span>
                <span className="text-xs text-gray-500">100</span>
              </div>
            </div>
            
            {/* Health metrics breakdown */}
            <div className="w-full grid grid-cols-1 gap-2 mt-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md" style={{ backgroundColor: `${metric.color}20` }}>
                      {metric.icon}
                    </div>
                    <span className="text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-1.5 bg-gray-700 rounded-full mr-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${metric.score}%`,
                          backgroundColor: metric.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{metric.score}%</span>
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

export default FleetHealthGauge; 
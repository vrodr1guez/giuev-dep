'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  CloudLightning, 
  ThermometerSun, 
  Wind, 
  Droplets, 
  Snowflake, 
  Sun,
  Info
} from 'lucide-react';

interface WeatherCondition {
  type: 'rain' | 'snow' | 'heat' | 'cold' | 'wind' | 'optimal';
  label: string;
  icon: React.ReactNode;
  impactData: {
    rangeImpactPercent: number;
    efficiencyImpactPercent: number;
    chargingImpactPercent: number;
    batteryHealthImpactPercent: number;
  };
  recommendedActions: string[];
}

interface WeatherDataPoint {
  temperature: number;
  condition: string;
  wind: number;
  humidity: number;
  precipitation: number;
  icon: React.ReactNode;
}

interface WeatherImpactWidgetProps {
  weatherData: WeatherDataPoint;
  className?: string;
  loading?: boolean;
  onInfoClick?: () => void;
}

// Custom tooltip for the impact chart
const CustomImpactTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-md">
        <p className="text-xs font-bold mb-1">{label}</p>
        <div className="grid grid-cols-1 gap-y-1">
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              className="text-xs" 
              style={{ color: entry.fill }}
            >
              {entry.name}: {entry.value > 0 ? '+' : ''}{entry.value}%
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const WeatherImpactWidget = ({ 
  weatherData,
  className = '',
  loading = false,
  onInfoClick
}: WeatherImpactWidgetProps) => {
  // Determine the current weather impact type based on conditions
  const determineWeatherImpactType = (): WeatherCondition['type'] => {
    const { temperature, wind, precipitation } = weatherData;
    
    if (precipitation > 30) return 'rain';
    if (temperature < 32) return 'cold';
    if (temperature > 90) return 'heat';
    if (wind > 15) return 'wind';
    return 'optimal';
  };

  // Get the weather impact data for the current conditions
  const getWeatherImpact = (): WeatherCondition => {
    const impactType = determineWeatherImpactType();
    
    const impactMap: Record<WeatherCondition['type'], WeatherCondition> = {
      rain: {
        type: 'rain',
        label: 'Rainy Conditions',
        icon: <Droplets size={24} className="text-blue-400" />,
        impactData: {
          rangeImpactPercent: -12,
          efficiencyImpactPercent: -8,
          chargingImpactPercent: -5,
          batteryHealthImpactPercent: -2
        },
        recommendedActions: [
          'Reduce highway speeds to improve range',
          'Allow extra time for charging',
          'Use pre-conditioning when parked at charging stations'
        ]
      },
      snow: {
        type: 'snow',
        label: 'Snowy Conditions',
        icon: <Snowflake size={24} className="text-blue-200" />,
        impactData: {
          rangeImpactPercent: -30,
          efficiencyImpactPercent: -25,
          chargingImpactPercent: -15,
          batteryHealthImpactPercent: -5
        },
        recommendedActions: [
          'Reduce speed significantly',
          'Keep battery level above 40%',
          'Schedule 20% extra time for all trips',
          'Use garage parking when available'
        ]
      },
      heat: {
        type: 'heat',
        label: 'Hot Weather',
        icon: <ThermometerSun size={24} className="text-amber-500" />,
        impactData: {
          rangeImpactPercent: -15,
          efficiencyImpactPercent: -10,
          chargingImpactPercent: 5,
          batteryHealthImpactPercent: -8
        },
        recommendedActions: [
          'Use scheduled charging during cooler hours',
          'Utilize pre-conditioning while connected to power',
          'Park in shaded areas when possible',
          'Consider reducing climate control usage'
        ]
      },
      cold: {
        type: 'cold',
        label: 'Cold Weather',
        icon: <Snowflake size={24} className="text-blue-500" />,
        impactData: {
          rangeImpactPercent: -20,
          efficiencyImpactPercent: -18,
          chargingImpactPercent: -25,
          batteryHealthImpactPercent: -3
        },
        recommendedActions: [
          'Precondition vehicle while connected to power',
          'Maintain battery level above 20%',
          'Allow 30% extra time for charging',
          'Use seat heaters instead of cabin heating when possible'
        ]
      },
      wind: {
        type: 'wind',
        label: 'Windy Conditions',
        icon: <Wind size={24} className="text-gray-400" />,
        impactData: {
          rangeImpactPercent: -8,
          efficiencyImpactPercent: -7,
          chargingImpactPercent: 0,
          batteryHealthImpactPercent: 0
        },
        recommendedActions: [
          'Reduce highway speeds',
          'Plan routes to minimize headwind exposure',
          'Allow extra time for trips in high wind areas'
        ]
      },
      optimal: {
        type: 'optimal',
        label: 'Optimal Conditions',
        icon: <Sun size={24} className="text-yellow-400" />,
        impactData: {
          rangeImpactPercent: 5,
          efficiencyImpactPercent: 3,
          chargingImpactPercent: 2,
          batteryHealthImpactPercent: 1
        },
        recommendedActions: [
          'Ideal conditions for maximum range',
          'Good time for long trips',
          'Battery performance at optimal levels'
        ]
      }
    };
    
    return impactMap[impactType];
  };

  const weatherImpact = getWeatherImpact();
  
  // Transform the impact data for the chart
  const chartData = [
    {
      name: 'Range',
      impact: weatherImpact.impactData.rangeImpactPercent,
      fill: weatherImpact.impactData.rangeImpactPercent >= 0 ? '#22c55e' : '#ef4444'
    },
    {
      name: 'Efficiency',
      impact: weatherImpact.impactData.efficiencyImpactPercent,
      fill: weatherImpact.impactData.efficiencyImpactPercent >= 0 ? '#22c55e' : '#ef4444'
    },
    {
      name: 'Charging',
      impact: weatherImpact.impactData.chargingImpactPercent,
      fill: weatherImpact.impactData.chargingImpactPercent >= 0 ? '#22c55e' : '#ef4444'
    },
    {
      name: 'Battery Health',
      impact: weatherImpact.impactData.batteryHealthImpactPercent,
      fill: weatherImpact.impactData.batteryHealthImpactPercent >= 0 ? '#22c55e' : '#ef4444'
    }
  ];

  if (loading) {
    return (
      <Card className={`weather-impact-widget overflow-hidden ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium flex items-center">
            Weather Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full rounded-md bg-gray-700 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`weather-impact-widget overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Weather Impact Analysis</span>
            <Badge 
              variant="outline" 
              className={`
                ${weatherImpact.type === 'optimal' ? 'bg-green-500/20 text-green-400 border-green-500/50' : ''}
                ${weatherImpact.type === 'rain' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : ''}
                ${weatherImpact.type === 'snow' ? 'bg-blue-200/20 text-blue-200 border-blue-200/50' : ''}
                ${weatherImpact.type === 'heat' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : ''}
                ${weatherImpact.type === 'cold' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : ''}
                ${weatherImpact.type === 'wind' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : ''}
              `}
            >
              {weatherImpact.label}
            </Badge>
          </div>
          <div 
            className="cursor-pointer" 
            onClick={onInfoClick}
            title="Click for more information about weather impacts"
          >
            <Info size={16} className="text-gray-400 hover:text-gray-300" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-4">
          {/* Current Weather Conditions */}
          <div className="col-span-12 sm:col-span-4 bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Weather</span>
              <div>{weatherData.icon}</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Temperature:</span>
                <span className="text-xs font-medium">{weatherData.temperature}°F</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Condition:</span>
                <span className="text-xs font-medium">{weatherData.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Wind:</span>
                <span className="text-xs font-medium">{weatherData.wind} mph</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Humidity:</span>
                <span className="text-xs font-medium">{weatherData.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Precipitation:</span>
                <span className="text-xs font-medium">{weatherData.precipitation}%</span>
              </div>
            </div>
          </div>
          
          {/* Impact Chart */}
          <div className="col-span-12 sm:col-span-8 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={{ stroke: '#4b5563' }} />
                <YAxis 
                  tick={{ fill: '#9ca3af' }} 
                  axisLine={{ stroke: '#4b5563' }} 
                  unit="%" 
                  domain={[-30, 10]}
                />
                <Tooltip content={<CustomImpactTooltip />} />
                <Bar 
                  dataKey="impact" 
                  name="Impact" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <text
                      key={`label-${index}`}
                      x={index * 80 + 40}
                      y={entry.impact < 0 ? 150 + entry.impact * 5 + 15 : 150 - entry.impact * 5 - 10}
                      fill="#fff"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={12}
                    >
                      {`${entry.impact > 0 ? '+' : ''}${entry.impact}%`}
                    </text>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="mt-4 border-t border-gray-700 pt-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Recommended Actions:</h4>
          <ul className="space-y-1">
            {weatherImpact.recommendedActions.map((action, index) => (
              <li key={index} className="text-xs pl-4 relative">
                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherImpactWidget; 
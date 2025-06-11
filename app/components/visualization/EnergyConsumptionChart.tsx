import * as React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { Button } from "../ui/button";

interface EnergyDataPoint {
  day?: string;
  week?: string;
  month?: string;
  kWh: number;
  cost: number;
  peak: number;
  offPeak: number;
}

interface EnergyConsumptionChartProps {
  data: EnergyDataPoint[];
  timeRange: 'day' | 'week' | 'month';
  loading?: boolean;
  onRangeChange?: (range: 'day' | 'week' | 'month') => void;
  className?: string;
}

// Custom tooltip for the area chart
const CustomEnergyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-md">
        <p className="text-xs font-bold mb-1">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p className="text-xs text-purple-400">Total: {payload[0].value} kWh</p>
          <p className="text-xs text-green-400">Cost: ${payload[1].value}</p>
          <p className="text-xs text-amber-400">Peak: {payload[2].value} kWh</p>
          <p className="text-xs text-blue-400">Off-Peak: {payload[3].value} kWh</p>
        </div>
      </div>
    );
  }
  return null;
};

const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({ 
  data,
  timeRange, 
  loading = false,
  onRangeChange,
  className = ''
}) => {
  // Calculate average energy consumption
  const averageKwh = React.useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.kWh, 0) / data.length);
  }, [data]);

  // Calculate total energy consumption
  const totalKwh = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.kWh, 0);
  }, [data]);

  // Calculate total cost
  const totalCost = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.cost, 0);
  }, [data]);

  const handleTimeRangeChange = (range: 'day' | 'week' | 'month') => {
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  // Determine which key to use for X axis based on time range
  const getXAxisKey = () => {
    switch (timeRange) {
      case 'day': return 'day';
      case 'week': return 'week';
      case 'month': return 'month';
      default: return 'day';
    }
  };

  if (loading) {
    return (
      <div className={`energy-consumption-widget bg-gray-800 rounded-lg overflow-hidden ${className}`}>
        <div className="widget-header flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold">Energy Consumption Trends</h2>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === 'day' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 py-1 rounded-md text-xs ${timeRange === 'day' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
              disabled
            >
              Day
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 py-1 rounded-md text-xs ${timeRange === 'week' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
              disabled
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'} 
              size="sm"
              className={`px-2 py-1 rounded-md text-xs ${timeRange === 'month' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
              disabled
            >
              Month
            </Button>
          </div>
        </div>
        <div className="p-4 h-[300px] flex items-center justify-center">
          <div className="h-[250px] w-full rounded-md bg-gray-700 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`energy-consumption-widget bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="widget-header flex justify-between items-center p-4 border-b border-gray-700">
        <div>
          <h2 className="font-semibold">Energy Consumption Trends</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Total: {totalKwh} kWh</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-400">Cost: ${totalCost}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'day' ? 'default' : 'outline'} 
            size="sm"
            className={`px-2 py-1 rounded-md text-xs ${timeRange === 'day' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
            onClick={() => handleTimeRangeChange('day')}
          >
            Day
          </Button>
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            className={`px-2 py-1 rounded-md text-xs ${timeRange === 'week' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
            onClick={() => handleTimeRangeChange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            className={`px-2 py-1 rounded-md text-xs ${timeRange === 'month' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700'}`}
            onClick={() => handleTimeRangeChange('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOffPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis 
              dataKey={getXAxisKey()} 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#4b5563' }}
              unit=" kWh"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#4b5563' }}
              unit=" $"
            />
            
            <Tooltip content={<CustomEnergyTooltip />} />
            <Legend />
            
            <ReferenceLine
              y={averageKwh}
              yAxisId="left"
              stroke="#fff"
              strokeDasharray="3 3"
              label={{ value: `Avg: ${averageKwh} kWh`, position: 'insideTopRight', fill: '#fff' }}
            />
            
            <Area
              type="monotone"
              dataKey="kWh"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorKwh)"
              yAxisId="left"
              name="Total"
            />
            
            <Area
              type="monotone"
              dataKey="peak"
              stroke="#f59e0b"
              fillOpacity={0.5}
              fill="url(#colorPeak)"
              yAxisId="left"
              name="Peak"
            />
            
            <Area
              type="monotone"
              dataKey="offPeak"
              stroke="#3b82f6"
              fillOpacity={0.5}
              fill="url(#colorOffPeak)"
              yAxisId="left"
              name="Off-Peak"
            />
            
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#22c55e"
              yAxisId="right"
              name="Cost ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyConsumptionChart; 
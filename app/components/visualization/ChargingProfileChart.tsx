import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ChargingSchedulePoint {
  timestamp: string;
  chargingPower: number;
  expectedSoC: number;
  price: number;
  renewable: number;
  isCritical: boolean;
}

interface ChargingProfileChartProps {
  schedule: ChargingSchedulePoint[];
  height?: number;
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChargingProfileChart: React.FC<ChargingProfileChartProps> = ({
  schedule,
  height = 400
}) => {
  // Handle empty data gracefully
  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex justify-center items-center border rounded-md bg-slate-50" style={{ height }}>
        <p className="text-slate-500">No charging schedule data available</p>
      </div>
    );
  }
  
  // Process data for visualization
  const chartData = schedule.map((point) => ({
    ...point,
    formattedTime: formatTime(point.timestamp),
    // Flag critical charging points
    criticalPoint: point.isCritical ? point.chargingPower : 0,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="formattedTime" 
          tick={{ fontSize: 12 }} 
          interval="preserveStartEnd"
          angle={-20}
          textAnchor="end"
          height={60}
        />
        
        {/* Left Y-axis for SoC percentage */}
        <YAxis 
          yAxisId="soc" 
          domain={[0, 100]} 
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12 }}
          label={{ value: 'State of Charge (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        
        {/* Right Y-axis for charging power */}
        <YAxis 
          yAxisId="power" 
          orientation="right" 
          domain={[0, 'auto']} 
          tickFormatter={(value) => `${value} kW`}
          tick={{ fontSize: 12 }}
          label={{ value: 'Charging Power (kW)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
        />
        
        {/* Right Y-axis for price */}
        <YAxis 
          yAxisId="price" 
          orientation="right" 
          domain={[0, 'auto']} 
          hide={true}
        />
        
        <Tooltip 
          formatter={(value: number, name: string) => {
            if (name === 'expectedSoC') return [`${value.toFixed(1)}%`, 'State of Charge'];
            if (name === 'chargingPower') return [`${value.toFixed(1)} kW`, 'Charging Power'];
            if (name === 'price') return [`$${value.toFixed(3)}/kWh`, 'Energy Price'];
            if (name === 'criticalPoint') return [`${value.toFixed(1)} kW`, 'Critical Charging'];
            if (name === 'renewable') return [`${value.toFixed(0)}%`, 'Renewable Energy'];
            return [value, name];
          }}
          labelFormatter={(label) => `Time: ${label}`}
        />
        
        <Legend verticalAlign="top" height={36} />
        
        {/* Area chart for SoC */}
        <Area 
          yAxisId="soc"
          type="monotone" 
          dataKey="expectedSoC" 
          name="expectedSoC" 
          fill="#3b82f6" 
          stroke="#2563eb"
          fillOpacity={0.3}
        />
        
        {/* Bar chart for charging power */}
        <Bar 
          yAxisId="power"
          dataKey="chargingPower" 
          name="chargingPower" 
          fill="#10b981" 
          barSize={20}
        />
        
        {/* Display critical charging periods with a different color */}
        <Bar 
          yAxisId="power"
          dataKey="criticalPoint" 
          name="criticalPoint" 
          fill="#ef4444" 
          barSize={20}
        />
        
        {/* Line chart for price */}
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="price" 
          name="price" 
          stroke="#f59e0b" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}; 
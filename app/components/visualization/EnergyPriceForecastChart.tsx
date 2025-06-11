import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  Bar
} from 'recharts';

interface EnergyPrice {
  timestamp: string;
  price: number;
  renewable: number;
  demand: number;
  isOptimal: boolean;
}

interface EnergyPriceForecastChartProps {
  data: EnergyPrice[];
  showRenewable?: boolean;
  showDemand?: boolean;
  height?: number;
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatXAxis = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  
  // Same day handling
  if (date.getDate() === now.getDate() && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear()) {
    return formatTime(timestamp);
  }
  
  // Next day handling
  if (date.getDate() === tomorrow.getDate() && 
      date.getMonth() === tomorrow.getMonth() && 
      date.getFullYear() === tomorrow.getFullYear()) {
    return `${formatTime(timestamp)} (Tomorrow)`;
  }
  
  // Other days
  return `${formatTime(timestamp)}, ${formatDate(timestamp)}`;
};

export const EnergyPriceForecastChart: React.FC<EnergyPriceForecastChartProps> = ({ 
  data, 
  showRenewable = false, 
  showDemand = false,
  height = 300
}) => {
  // Handle empty data gracefully
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center border rounded-md bg-slate-50" style={{ height }}>
        <p className="text-slate-500">No forecast data available</p>
      </div>
    );
  }
  
  // Create optimized data for visualization - add annotations for optimal charging periods
  const chartData = data.map((point) => ({
    ...point,
    formattedTime: formatXAxis(point.timestamp),
    optimalIndicator: point.isOptimal ? point.price : null,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      {showRenewable || showDemand ? (
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="formattedTime" 
            tick={{ fontSize: 12 }} 
            interval={'preserveStartEnd'}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="price" 
            domain={[0, 'auto']} 
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontSize: 12 }}
            label={{ value: 'Price ($/kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          {(showRenewable || showDemand) && (
            <YAxis 
              yAxisId="percent" 
              orientation="right" 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
          )}
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'price') return [`$${value.toFixed(3)}/kWh`, 'Price'];
              if (name === 'renewable') return [`${value.toFixed(0)}%`, 'Renewable'];
              if (name === 'demand') return [`${value.toFixed(0)}%`, 'Grid Demand'];
              if (name === 'optimalIndicator') return [`$${value.toFixed(3)}/kWh`, 'Optimal Charging'];
              return [value, name];
            }}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend verticalAlign="top" height={36} />
          
          {/* Price line */}
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            name="price" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={false} 
          />
          
          {/* Optimal charging indicators */}
          <Bar
            yAxisId="price"
            dataKey="optimalIndicator"
            name="optimalIndicator"
            barSize={20}
            fill="#4ade80"
            fillOpacity={0.4}
          />
          
          {/* Renewable energy percentage */}
          {showRenewable && (
            <Line 
              yAxisId="percent"
              type="monotone" 
              dataKey="renewable" 
              name="renewable"
              stroke="#16a34a" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
          
          {/* Grid demand */}
          {showDemand && (
            <Line 
              yAxisId="percent"
              type="monotone" 
              dataKey="demand" 
              name="demand"
              stroke="#dc2626" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      ) : (
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="formattedTime" 
            tick={{ fontSize: 12 }} 
            interval={'preserveStartEnd'}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[0, 'auto']} 
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'price') return [`$${value.toFixed(3)}/kWh`, 'Price'];
              if (name === 'optimalIndicator') return [`$${value.toFixed(3)}/kWh`, 'Optimal Charging'];
              return [value, name];
            }}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend verticalAlign="top" height={36} />
          
          {/* Line for price */}
          <Line 
            type="monotone" 
            dataKey="price" 
            name="price" 
            stroke="#2563eb" 
            dot={false} 
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
          
          {/* Line for optimal periods */}
          <Line 
            type="monotone" 
            dataKey="optimalIndicator" 
            name="optimalIndicator" 
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}; 
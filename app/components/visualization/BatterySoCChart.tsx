'use client';

import { React, useMemo } from '../../lib/reactHelpers';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Button } from "../../ui/button";
import { MoreHorizontal } from 'lucide-react';

interface SocDistributionItem {
  name: string;
  value: number;
  fill: string;
}

interface BatterySoCChartProps {
  data: SocDistributionItem[];
  loading?: boolean;
  onSegmentClick?: (entry: SocDistributionItem) => void;
  className?: string;
}

const RADIAN = Math.PI / 180;

// Custom label renderer for the pie chart
const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent, 
  index, 
  name, 
  value 
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return value > 0 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md">
        <p className="text-xs font-semibold">{payload[0].name}</p>
        <p className="text-xs">Vehicles: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const BatterySoCChart: React.FC<BatterySoCChartProps> = ({ 
  data, 
  loading = false, 
  onSegmentClick,
  className = '' 
}) => {
  // Calculate average SoC
  const averageSoC = useMemo(() => {
    if (!data.length) return 0;
    
    return Math.round(
      data.reduce((sum, item) => {
        // Extract the range from name (e.g., "0-20%" => [0, 20])
        const range = item.name.replace('%', '').split('-').map(Number);
        const midpoint = (range[0] + range[1]) / 2;
        return sum + (item.value * midpoint);
      }, 0) / 
      data.reduce((sum, item) => sum + item.value, 0)
    );
  }, [data]);

  if (loading) {
    return (
      <div className={`soc-distribution-widget bg-gray-800 rounded-lg overflow-hidden ${className}`}>
        <div className="widget-header flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold">Battery SoC Distribution</h2>
          <Button variant="outline" size="icon" className="bg-gray-700 p-1.5 rounded-md">
            <MoreHorizontal size={16} />
          </Button>
        </div>
        <div className="p-4 h-[300px] flex items-center justify-center">
          <div className="h-[250px] w-[250px] rounded-full bg-gray-700 animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`soc-distribution-widget bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="widget-header flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="font-semibold">Battery SoC Distribution</h2>
        <Button variant="outline" size="icon" className="bg-gray-700 p-1.5 rounded-md">
          <MoreHorizontal size={16} />
        </Button>
      </div>
      <div className="p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              onClick={onSegmentClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
            
            {/* Center text showing average SoC */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.5em" fontSize="12" fill="#888">Avg. SoC</tspan>
              <tspan x="50%" dy="1.5em" fontSize="24" fontWeight="bold" fill="#fff">{averageSoC}%</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BatterySoCChart; 
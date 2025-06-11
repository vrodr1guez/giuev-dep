'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Button } from '../ui/button';
import { TrendingUp, Battery, Users, Filter } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface BatteryHealthData {
  name: string;
  value: number;
  fill: string;
}

interface EnergyConsumptionData {
  date: string;
  sessions: number;
  avgDurationMin: number;
}

interface DriverEfficiencyData {
  name: string;
  efficiency: number;
  trips: number;
  fill: string;
}

type TimeRange = 'day' | 'week' | 'month';

interface QuickStatsProps {
  batteryHealthData: BatteryHealthData[];
  energyConsumptionData: EnergyConsumptionData[];
  driverEfficiencyData: DriverEfficiencyData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  stats: {
    totalVehicles: number;
    activeVehicles: number;
    totalDistance: number;
    energyConsumed: number;
  };
}

const QuickStats: React.FC<QuickStatsProps> = ({
  batteryHealthData,
  energyConsumptionData,
  driverEfficiencyData,
  timeRange,
  onTimeRangeChange,
  stats
}) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Fleet Performance Metrics</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange('day')}
            >
              Day
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange('month')}
            >
              Month
            </Button>
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="energy">
          <TabsList className="mb-4">
            <TabsTrigger value="energy">Energy Usage</TabsTrigger>
            <TabsTrigger value="battery">Battery Health</TabsTrigger>
            <TabsTrigger value="driver">Driver Efficiency</TabsTrigger>
          </TabsList>
          
          {/* Energy Usage Chart */}
          <TabsContent value="energy" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Energy Consumption & Charging Sessions</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" unit=" sessions" />
                  <YAxis yAxisId="right" orientation="right" unit=" min" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3b82f6" 
                    name="Sessions" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="avgDurationMin" 
                    stroke="#10b981" 
                    name="Avg. Duration (min)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Battery Health Chart */}
          <TabsContent value="battery" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Fleet Battery Health Status</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={batteryHealthData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    label
                  >
                    {batteryHealthData.map((entry: BatteryHealthData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Driver Efficiency Chart */}
          <TabsContent value="driver" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Driver Efficiency Ratings</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverEfficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit=" kWh/km" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" name="Efficiency (kWh/km)">
                    {driverEfficiencyData.map((entry: DriverEfficiencyData, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-bold">{stats.totalVehicles}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Active Vehicles</p>
            <p className="text-2xl font-bold">{stats.activeVehicles}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total Distance</p>
            <p className="text-2xl font-bold">{stats.totalDistance} km</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Energy Consumed</p>
            <p className="text-2xl font-bold">{stats.energyConsumed} kWh</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats; 
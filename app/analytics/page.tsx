'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  PieChart, 
  Activity,
  Zap,
  Battery,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Legend
} from 'recharts';

interface EnergyData {
  date: string;
  consumption: number;
  generation: number;
  cost: number;
  efficiency: number;
}

interface UsagePattern {
  hour: number;
  usage: number;
  sessions: number;
}

interface LocationData {
  location: string;
  sessions: number;
  revenue: number;
  utilization: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('energy');
  
  // Mock data generation
  const [energyData, setEnergyData] = useState([] as EnergyData[]);
  const [usagePatterns, setUsagePatterns] = useState([] as UsagePattern[]);
  const [locationData, setLocationData] = useState([] as LocationData[]);

  useEffect(() => {
    // Generate mock energy data
    const generateEnergyData = () => {
      const data: EnergyData[] = [];
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString(),
          consumption: Math.random() * 500 + 200,
          generation: Math.random() * 300 + 100,
          cost: Math.random() * 1000 + 500,
          efficiency: Math.random() * 20 + 80
        });
      }
      
      setEnergyData(data);
    };

    // Generate usage patterns (24 hours)
    const generateUsagePatterns = () => {
      const patterns: UsagePattern[] = [];
      for (let hour = 0; hour < 24; hour++) {
        patterns.push({
          hour,
          usage: Math.random() * 100 + 20,
          sessions: Math.floor(Math.random() * 50 + 10)
        });
      }
      setUsagePatterns(patterns);
    };

    // Generate location data
    const generateLocationData = () => {
      const locations = [
        'Downtown Station A',
        'Mall Parking Lot B',
        'Highway Rest Stop C',
        'Office Complex D',
        'Residential Area E'
      ];
      
      const data: LocationData[] = locations.map(location => ({
        location,
        sessions: Math.floor(Math.random() * 200 + 50),
        revenue: Math.random() * 5000 + 1000,
        utilization: Math.random() * 40 + 60
      }));
      
      setLocationData(data);
    };

    generateEnergyData();
    generateUsagePatterns();
    generateLocationData();
  }, [timeRange]);

  const pieChartData = [
    { name: 'Fast Charging', value: 45, fill: '#3b82f6' },
    { name: 'Standard Charging', value: 35, fill: '#10b981' },
    { name: 'Slow Charging', value: 20, fill: '#f59e0b' }
  ];

  const efficiencyData = energyData.map(item => ({
    date: item.date,
    efficiency: item.efficiency,
    cost: item.cost / 10 // Scale for visualization
  }));

  const totalConsumption = energyData.reduce((sum, item) => sum + item.consumption, 0);
  const totalCost = energyData.reduce((sum, item) => sum + item.cost, 0);
  const avgEfficiency = energyData.reduce((sum, item) => sum + item.efficiency, 0) / energyData.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into EV charging operations</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="energy">Energy Analysis</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="locations">Location Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Consumption Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Energy Consumption Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="consumption" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        name="Consumption (kWh)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="generation" 
                        stackId="1"
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6}
                        name="Generation (kWh)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Charging Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Charging Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost vs Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Cost vs Efficiency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cost" fill="#f59e0b" name="Cost ($)" />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Efficiency (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Usage Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  24-Hour Usage Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={usagePatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usage" fill="#3b82f6" name="Usage (kWh)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Session Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Charging Sessions by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usagePatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Sessions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Morning Peak</h3>
                  <p className="text-2xl font-bold text-blue-600">7-9 AM</p>
                  <p className="text-sm text-blue-600">Average: 85 sessions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Afternoon Peak</h3>
                  <p className="text-2xl font-bold text-green-600">12-2 PM</p>
                  <p className="text-sm text-green-600">Average: 92 sessions</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Evening Peak</h3>
                  <p className="text-2xl font-bold text-purple-600">5-7 PM</p>
                  <p className="text-sm text-purple-600">Average: 78 sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Session Duration</span>
                    <span className="font-semibold">45 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Station Uptime</span>
                    <span className="font-semibold text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Energy Efficiency</span>
                    <span className="font-semibold">87.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold text-blue-600">4.6/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Usage vs Efficiency Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usagePatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="usage" name="Usage" unit="kWh" />
                      <YAxis dataKey="sessions" name="Sessions" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Sessions</th>
                      <th className="text-left p-2">Revenue</th>
                      <th className="text-left p-2">Utilization</th>
                      <th className="text-left p-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationData.map((location, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{location.location}</td>
                        <td className="p-2">{location.sessions}</td>
                        <td className="p-2">${location.revenue.toFixed(0)}</td>
                        <td className="p-2">{location.utilization.toFixed(1)}%</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            {location.utilization > 80 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={location.utilization > 80 ? 'text-green-600' : 'text-red-600'}>
                              {location.utilization > 80 ? 'Excellent' : 'Needs Attention'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
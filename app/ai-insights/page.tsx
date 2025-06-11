"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Zap, TrendingUp, Car, Battery, 
  Calendar, Clock, Download, RefreshCw, Filter,
  ArrowRight, AlertTriangle, ArrowUp,
  Wrench, BarChart, Settings, FileText,
  ChevronRight, Cpu, Database, BarChart2,
  Activity, Search
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

// Add a CardDescription component if it's missing
const CardDescription = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = React.useState('performance');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [realTimeData, setRealTimeData] = React.useState(null);
  const [mlPredictions, setMlPredictions] = React.useState(null);
  
  // Fetch real-time data from our ML API
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        const [mlResponse, fleetResponse] = await Promise.all([
          fetch('http://localhost:8000/ml/fleet-insights'),
          fetch('http://localhost:8000/api/dashboard/metrics')
        ]);
        
        if (mlResponse.ok && fleetResponse.ok) {
          const mlData = await mlResponse.json();
          const fleetData = await fleetResponse.json();
          setRealTimeData({ ...mlData, ...fleetData });
        }
      } catch (error) {
        console.error('Failed to fetch AI data:', error);
        // Fallback to mock data
        setRealTimeData(mockData);
      }
    };
    
    fetchAIData();
    const interval = setInterval(fetchAIData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:8000/ml/fleet-insights');
      if (response.ok) {
        const data = await response.json();
        setRealTimeData(data);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  // Mock data for fallback
  const mockData = {
    fleetEfficiency: 87,
    energyOptimization: 12.5,
    costReduction: 1230,
    batteryHealth: 94.3,
    energyEfficiency: 3.8,
    optimalCharging: 76,
    maintenancePrediction: 3
  };
  
  // Sample insights with enhanced data
  const aiInsights = [
    {
      id: 1,
      title: 'Battery Degradation Analysis',
      description: 'Three vehicles showing unusual battery degradation patterns',
      category: 'Battery Health',
      urgency: 'Medium',
      timestamp: '2 hours ago',
      icon: <Battery className="h-5 w-5 text-amber-500" />,
      impact: 'Medium',
      confidence: 85,
      action: 'Schedule battery inspection'
    },
    {
      id: 2,
      title: 'Route Optimization Opportunity',
      description: 'Potential 15% energy savings by optimizing delivery routes',
      category: 'Efficiency',
      urgency: 'High',
      timestamp: '4 hours ago',
      icon: <BarChart2 className="h-5 w-5 text-green-500" />,
      impact: 'High',
      confidence: 92,
      action: 'Apply route optimization'
    },
    {
      id: 3,
      title: 'Predictive Maintenance Alert',
      description: 'Two vehicles require maintenance within 14 days',
      category: 'Maintenance',
      urgency: 'High',
      timestamp: '1 day ago',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      impact: 'High',
      confidence: 78,
      action: 'Schedule maintenance'
    },
    {
      id: 4,
      title: 'Off-Peak Charging Recommendation',
      description: 'Shift 35% of charging sessions to off-peak hours to reduce costs',
      category: 'Cost Optimization',
      urgency: 'Medium',
      timestamp: '2 days ago',
      icon: <Zap className="h-5 w-5 text-blue-500" />,
      impact: 'Medium',
      confidence: 89,
      action: 'Update charging schedule'
    },
  ];
  
  // Performance data for charts
  const performanceData = [
    { month: 'Jan', efficiency: 85, cost: 1200, emissions: 145 },
    { month: 'Feb', efficiency: 87, cost: 1150, emissions: 142 },
    { month: 'Mar', efficiency: 89, cost: 1100, emissions: 138 },
    { month: 'Apr', efficiency: 91, cost: 1050, emissions: 135 },
    { month: 'May', efficiency: 88, cost: 1180, emissions: 140 },
    { month: 'Jun', efficiency: 92, cost: 980, emissions: 132 }
  ];
  
  const batteryHealthData = [
    { name: 'Excellent (>90%)', value: 65, color: '#22c55e' },
    { name: 'Good (80-90%)', value: 25, color: '#3b82f6' },
    { name: 'Fair (70-80%)', value: 8, color: '#f59e0b' },
    { name: 'Poor (<70%)', value: 2, color: '#ef4444' }
  ];
  
  const data = realTimeData || mockData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              AI Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Advanced analytics and intelligent recommendations for your EV fleet
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              <span>Generate Report</span>
            </Button>
          </div>
        </motion.div>
        
        {/* AI Summary Card with real-time data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h2 className="text-xl font-semibold mr-2">AI Fleet Analysis</h2>
                    <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <Activity className="h-3 w-3 mr-1" />
                      Live Data
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    AI analysis has identified 3 significant optimization opportunities and 2 areas for potential improvement in your fleet operations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Fleet Efficiency</div>
                        <div className="font-semibold flex items-center">
                          {data.fleetEfficiency}%
                          <ArrowUp className="h-3 w-3 ml-1 text-green-500" />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Energy Optimization</div>
                        <div className="font-semibold flex items-center">
                          +{data.energyOptimization}% 
                          <ArrowUp className="h-3 w-3 ml-1 text-green-500" />
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Cost Reduction</div>
                        <div className="font-semibold flex items-center">
                          ${data.costReduction}/mo
                          <ArrowUp className="h-3 w-3 ml-1 text-green-500" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Key Insights Cards with enhanced animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Battery className="mr-2 h-5 w-5 text-blue-500" />
                  <span>Battery Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-3xl font-bold">{data.batteryHealth}%</div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+2.1%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Average battery health across fleet
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-sm">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-gray-600 dark:text-gray-300">2 vehicles require attention</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-purple-500" />
                  <span>Energy Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-3xl font-bold">{data.energyEfficiency} mi/kWh</div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+0.2</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Average fleet energy efficiency
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">5% better than industry average</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-green-500" />
                  <span>Optimal Charging</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-3xl font-bold">{data.optimalCharging}%</div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+14%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Charging during off-peak hours
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">Best time: 10 PM - 6 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-red-500" />
                  <span>Maintenance Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                  <div className="text-3xl font-bold">{data.maintenancePrediction}</div>
                  <div className="text-amber-500 text-sm font-medium flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Attention</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Vehicles needing service soon
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">Schedule within 14 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced AI Insights List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-none shadow-lg mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-purple-600" />
                  Latest AI Insights
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search insights..." className="pl-10 w-48 lg:w-64" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>All Insights</DropdownMenuItem>
                      <DropdownMenuItem>Battery Health</DropdownMenuItem>
                      <DropdownMenuItem>Efficiency</DropdownMenuItem>
                      <DropdownMenuItem>Maintenance</DropdownMenuItem>
                      <DropdownMenuItem>Cost Optimization</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{insight.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              insight.urgency === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {insight.urgency}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{insight.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-xs font-normal">
                              {insight.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{insight.timestamp}</span>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            {insight.action}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Enhanced Tabs with Real Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Tabs defaultValue="performance" className="w-full mb-8">
            <TabsList className="mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-lg shadow-sm">
              <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <BarChart className="h-4 w-4 mr-2" />
                Performance Analysis
              </TabsTrigger>
              <TabsTrigger value="efficiency" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <Zap className="h-4 w-4 mr-2" />
                Efficiency Insights
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <BrainCircuit className="h-4 w-4 mr-2" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Predictive Forecast
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance">
              <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Fleet Performance Analysis</CardTitle>
                  <CardDescription>AI-powered analysis of your fleet's overall performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} name="Efficiency %" />
                        <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} name="Cost ($)" />
                        <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={2} name="Emissions (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">92%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Peak Efficiency</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$980</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lowest Monthly Cost</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">132kg</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lowest Emissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="efficiency">
              <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Battery Health Distribution</CardTitle>
                  <CardDescription>Detailed analysis of battery health across your fleet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={batteryHealthData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {batteryHealthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>Actionable recommendations to improve fleet operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                      <h4 className="font-semibold">Optimize Charging Schedule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Shift 35% of charging to off-peak hours to save $450/month</p>
                      <Button size="sm" className="mt-2">Apply Recommendation</Button>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                      <h4 className="font-semibold">Route Optimization</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Implement AI-suggested routes to reduce energy consumption by 15%</p>
                      <Button size="sm" className="mt-2">View Routes</Button>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg">
                      <h4 className="font-semibold">Maintenance Schedule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Schedule maintenance for 3 vehicles to prevent performance degradation</p>
                      <Button size="sm" className="mt-2">Schedule Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="forecast">
              <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Predictive Forecast</CardTitle>
                  <CardDescription>Machine learning forecast of future fleet performance and needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Predicted Efficiency" />
                        <Area type="monotone" dataKey="cost" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Predicted Cost" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Training and Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  AI Training & Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  The AI model is continuously learning from your fleet data to provide more accurate insights and recommendations.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data points collected</span>
                    <span className="font-medium">1,324,567</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last model update</span>
                    <span className="font-medium">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prediction accuracy</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data sources</span>
                    <span className="font-medium">7 active</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure AI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
                  Feature Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Help us improve the AI system by suggesting features and data points you'd like to see analyzed.
                </p>
                <div className="space-y-4">
                  <Input placeholder="What insights would you like the AI to generate?" />
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      Driver Behavior Analysis
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                      Weather Impact Predictions
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Carbon Offset Tracking
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                      Advanced Route Planning
                    </Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    Submit Suggestion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
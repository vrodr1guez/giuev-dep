"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Map, LayoutGrid, Calendar, Navigation, 
  BarChart, Battery, MoreHorizontal, Search,
  Filter, Download, Plus, RefreshCw,
  CheckSquare, Clock, Car, MapPin, Zap,
  ChevronRight, TrendingUp, AlertTriangle,
  Route, Users, DollarSign, Settings,
  Target, Shield, Award, FileText,
  Globe, Activity, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function RoutesPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [routesData, setRoutesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch real-time data
  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/dashboard/metrics');
        if (response.ok) {
          const data = await response.json();
          setRoutesData(data);
        } else {
          setRoutesData(mockSummaryStats);
        }
      } catch (error) {
        console.error('Failed to fetch routes data:', error);
        setError('Failed to load real-time data. Using cached data.');
        setRoutesData(mockSummaryStats);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoutesData();
    const interval = setInterval(fetchRoutesData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/metrics');
      if (response.ok) {
        const data = await response.json();
        setRoutesData(data);
      } else {
        setError('API unavailable. Using cached data.');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      setError('Refresh failed. Check network connection.');
    }
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  // Mock data
  const mockSummaryStats = {
    totalRoutes: 5,
    activeRoutes: 2,
    scheduledRoutes: 2,
    completedRoutes: 1,
    totalDistance: '147.0 km',
    avgEfficiency: 3.9,
    totalConsumption: 50.9,
    costOptimization: 23.4,
    carbonSaved: 10.4
  };
  
  // Enhanced sample route data
  const routes = [
    { 
      id: 'R001', 
      name: 'Downtown Delivery Route', 
      vehicle: 'Tesla Model Y', 
      vehicleId: 'EV-438',
      driver: 'John Smith', 
      distance: '35.4 km', 
      stops: 8, 
      status: 'Active',
      startTime: '08:30 AM',
      endTime: '12:45 PM',
      batteryStart: 92,
      batteryEnd: 64,
      consumption: 8.3,
      efficiency: 4.2,
      lastUpdated: '10 minutes ago',
      optimized: true,
      priority: 'High',
      estimatedCost: '$12.45',
      carbonSaved: '2.3 kg'
    },
    { 
      id: 'R002', 
      name: 'West Ottawa Service Route', 
      vehicle: 'Ford F-150 Lightning', 
      vehicleId: 'EV-221',
      driver: 'Michael Brown', 
      distance: '22.7 km', 
      stops: 5, 
      status: 'Scheduled',
      startTime: '01:15 PM',
      endTime: '04:30 PM',
      batteryStart: 78,
      batteryEnd: 56,
      consumption: 12.4,
      efficiency: 3.8,
      lastUpdated: '2 hours ago',
      optimized: true,
      priority: 'Medium',
      estimatedCost: '$15.20',
      carbonSaved: '1.8 kg'
    },
    { 
      id: 'R003', 
      name: 'Airport Shuttle Route', 
      vehicle: 'Tesla Model 3', 
      vehicleId: 'EV-119',
      driver: 'Emily Chen', 
      distance: '42.1 km', 
      stops: 3, 
      status: 'Active',
      startTime: '06:45 AM',
      endTime: '11:30 AM',
      batteryStart: 100,
      batteryEnd: 72,
      consumption: 9.8,
      efficiency: 4.7,
      lastUpdated: '25 minutes ago',
      optimized: true,
      priority: 'High',
      estimatedCost: '$18.75',
      carbonSaved: '3.1 kg'
    },
    { 
      id: 'R004', 
      name: 'East Side Delivery', 
      vehicle: 'Chevrolet Bolt', 
      vehicleId: 'EV-305',
      driver: 'Sarah Johnson', 
      distance: '18.3 km', 
      stops: 12, 
      status: 'Completed',
      startTime: '09:00 AM',
      endTime: '02:15 PM',
      batteryStart: 85,
      batteryEnd: 67,
      consumption: 6.2,
      efficiency: 3.9,
      lastUpdated: '1 day ago',
      optimized: false,
      priority: 'Low',
      estimatedCost: '$9.30',
      carbonSaved: '1.2 kg'
    },
    { 
      id: 'R005', 
      name: 'Suburban Loop', 
      vehicle: 'Rivian R1T', 
      vehicleId: 'EV-492',
      driver: 'Unassigned', 
      distance: '28.5 km', 
      stops: 6, 
      status: 'Scheduled',
      startTime: '10:00 AM',
      endTime: '01:30 PM',
      batteryStart: 90,
      batteryEnd: 74,
      consumption: 14.2,
      efficiency: 3.1,
      lastUpdated: '3 hours ago',
      optimized: false,
      priority: 'Medium',
      estimatedCost: '$21.45',
      carbonSaved: '2.0 kg'
    }
  ];

  // Summary statistics
  const summaryStats = routesData || mockSummaryStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Professional Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                <Route className="h-4 w-4 mr-2" />
                Enterprise Route Management Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Intelligent Route
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Optimization
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                AI-powered route planning and optimization for enterprise EV fleets. 
                Maximize efficiency, minimize costs, and reduce environmental impact.
              </p>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Live Tracking Active
                  </span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enterprise Security
                  </span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ISO 27001 Certified
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-8">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Syncing...' : 'Sync Data'}
                </Button>
                <Button variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button variant="outline" className="hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Route Plan
              </Button>
            </div>
          </div>
          
          {/* Error/Status Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg"
            >
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">System Notice</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Professional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Routes</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{summaryStats.totalRoutes}</h3>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <Route className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center text-xs">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {summaryStats.activeRoutes} Active
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {summaryStats.scheduledRoutes} Scheduled
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance Today</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{summaryStats.totalDistance}</h3>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    ↑ 12% vs. last week
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fleet Efficiency</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{summaryStats.avgEfficiency} <span className="text-lg">km/kWh</span></h3>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <BarChart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Target className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    5% above target
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Energy Usage</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{summaryStats.totalConsumption} <span className="text-lg">kWh</span></h3>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                    <Battery className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Activity className="h-4 w-4 text-orange-500 mr-2" />
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    8% optimization
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Carbon Saved</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{summaryStats.carbonSaved || '10.4'} <span className="text-lg">kg CO₂</span></h3>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Layers className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    Today's impact
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Enhanced Professional Map and Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Tabs defaultValue="map" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <TabsList className="grid w-auto grid-cols-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="map" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                    <Map className="h-4 w-4 mr-2" />
                    Live Map
                  </TabsTrigger>
                  <TabsTrigger value="list" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Data View
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Real-time updates</span>
                </div>
              </div>
              
              {/* Enhanced Search and Filters */}
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    type="text" 
                    placeholder="Search routes, vehicles, drivers..." 
                    className="pl-10 w-full lg:w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700"
                  />
                </div>
                
                <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-200 font-medium">
                  <option>All Statuses</option>
                  <option>🟢 Active</option>
                  <option>🔵 Scheduled</option>
                  <option>⚪ Completed</option>
                  <option>🔴 Delayed</option>
                </select>
                
                <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-200 font-medium">
                  <option>All Vehicle Types</option>
                  <option>Tesla Model Y</option>
                  <option>Tesla Model 3</option>
                  <option>Ford F-150 Lightning</option>
                  <option>Chevrolet Bolt EV</option>
                  <option>Rivian R1T</option>
                </select>
                
                <Input 
                  type="date"
                  className="w-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200 dark:border-gray-700"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <TabsContent value="map" className="mt-0">
              <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
                    {/* Map Interface */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative">
                          <Map className="h-24 w-24 text-blue-500 mx-auto mb-6" />
                          <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Enterprise Route Intelligence</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          AI-powered real-time fleet tracking with predictive analytics and route optimization
                        </p>
                        
                        {/* Map Features */}
                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-sm">
                          <div className="flex items-center justify-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                            <Activity className="h-4 w-4 text-green-500 mr-2" />
                            <span className="font-medium">Live GPS Tracking</span>
                          </div>
                          <div className="flex items-center justify-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                            <Target className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-medium">Route Optimization</span>
                          </div>
                          <div className="flex items-center justify-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                            <BarChart className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="font-medium">Traffic Analytics</span>
                          </div>
                          <div className="flex items-center justify-center p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                            <Shield className="h-4 w-4 text-orange-500 mr-2" />
                            <span className="font-medium">Security Monitoring</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional Map Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Live Fleet Operations Center</h3>
                          <p className="text-sm opacity-90">
                            Monitoring {summaryStats.totalRoutes} routes • {summaryStats.activeRoutes} vehicles active • Updated {isLoading ? 'now' : '2 min ago'}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 border-white/40 text-white backdrop-blur-sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset View
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 border-white/40 text-white backdrop-blur-sm">
                            <Layers className="h-4 w-4 mr-2" />
                            Layers
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 border-white/40 text-white backdrop-blur-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Export Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Route Operations Dashboard</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Real-time monitoring and management of all fleet routes
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">Live Data</span>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Route Details
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Vehicle & Driver
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Performance
                          </th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Economics
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Priority
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {routes.map((route, index) => (
                          <motion.tr
                            key={route.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{route.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                                  <span className="flex items-center">
                                    <Route className="h-3 w-3 mr-1" />
                                    {route.id}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {route.stops} stops
                                  </span>
                                  <span className="flex items-center">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    {route.distance}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {route.startTime} - {route.endTime}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                  <Car className="h-4 w-4 mr-2 text-blue-500" />
                                  {route.vehicle}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  ID: {route.vehicleId}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {route.driver}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                  route.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  route.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                }`}>
                                  {route.status}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {route.lastUpdated}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="space-y-2">
                                <div className="flex items-center justify-end">
                                  <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                                  <span className="text-sm font-medium">{route.efficiency} km/kWh</span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <Battery className="h-3 w-3 mr-1 text-orange-500" />
                                  <span className="text-sm">{route.consumption} kWh</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Battery: {route.batteryStart}% → {route.batteryEnd}%
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="space-y-2">
                                <div className="flex items-center justify-end">
                                  <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                                  <span className="text-sm font-semibold">{route.estimatedCost}</span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <Globe className="h-3 w-3 mr-1 text-emerald-500" />
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    -{route.carbonSaved} CO₂
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                route.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                route.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {route.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Target className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Professional Table Footer */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        Showing {routes.length} routes • Last updated: {new Date().toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh All
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Enhanced Routes Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Routes</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <LayoutGrid className="h-4 w-4 rotate-90" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`border-l-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all ${
                  route.status === 'Active' ? 'border-l-green-500' :
                  route.status === 'Scheduled' ? 'border-l-blue-500' :
                  'border-l-gray-300'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{route.id}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          route.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {route.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                          route.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          route.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {route.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                          <span>{route.vehicle} ({route.vehicleId})</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                          <span>{route.stops} stops</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Distance</p>
                          <p className="font-medium">{route.distance}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Driver</p>
                          <p className="font-medium">{route.driver}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Efficiency</p>
                          <p className="font-medium">{route.efficiency} km/kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 mb-1">Energy Cost</p>
                          <p className="font-medium">{route.estimatedCost}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-gray-500 dark:text-gray-400">Battery Level</span>
                          <span className="font-medium">{route.batteryStart}% → {route.batteryEnd}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${route.batteryEnd}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{route.startTime} - {route.endTime}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 dark:text-green-400">-{route.carbonSaved} CO₂</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-between items-center">
                        <Button variant="outline" size="sm" className="text-sm">
                          View Details
                        </Button>
                        {!route.optimized && (
                          <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700 text-white">
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Optimize
                          </Button>
                        )}
                        {route.optimized && (
                          <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                            Optimized
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
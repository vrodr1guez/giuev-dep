"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LineChart, 
  BarChart, 
  Battery, 
  Car, 
  Zap, 
  Calendar, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  Settings, 
  RefreshCw,
  MapPin,
  ChevronRight,
  Bell,
  Download,
  BarChart2,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('today');
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of your fleet performance, charging status, and key metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === 'today' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setTimeRange('today')}
            >
              Today
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === 'week' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-500" />
              <span>Fleet Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                <span>92% Active</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total vehicles in fleet
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  <span className="text-gray-600 dark:text-gray-300">22 Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-red-500"></span>
                  <span className="text-gray-600 dark:text-gray-300">2 Maintenance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Battery className="mr-2 h-5 w-5 text-purple-500" />
              <span>Charging Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                <span>33% of Fleet</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Vehicles currently charging
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <div>Avg. Charge Level</div>
                <div className="font-medium">68%</div>
              </div>
              <Progress className="h-2 mt-2" value={68} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Zap className="mr-2 h-5 w-5 text-amber-500" />
              <span>Energy Consumption</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">432 kWh</div>
              <div className="text-green-500 text-sm font-medium flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>8.2%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total energy used today
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">Peak: 2-4 PM</span>
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  $108.32
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              <span>Operational Savings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">$1,250</div>
              <div className="text-green-500 text-sm font-medium flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>12.8%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Monthly cost reduction
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">YTD: $11,890</span>
                </div>
                <div>
                  <Link href="/reports/savings" className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center">
                    <span>Details</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Fleet Activity and Performance Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Fleet Performance</CardTitle>
              <CardDescription>Daily energy usage and efficiency metrics</CardDescription>
            </div>
            <div>
              <select className="bg-transparent text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1">
                <option>Energy Usage</option>
                <option>Efficiency</option>
                <option>Cost per km</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              {/* Placeholder for actual chart component */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="h-16 w-16 text-blue-100 dark:text-blue-900/20 mx-auto mb-4" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Interactive chart showing fleet performance data
                  </div>
                  <div className="mt-4">
                    <Button size="sm" variant="outline">Load Chart Data</Button>
                  </div>
                </div>
              </div>
              
              {/* This would be replaced with actual chart in production */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent rounded-b-lg"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Fleet Activity</CardTitle>
            <CardDescription>Current vehicle status</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-4">
              {/* Active */}
              <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
                  <Car className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Active & Available</h4>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">14</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fully operational vehicles</p>
                </div>
              </div>
              
              {/* Charging */}
              <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                  <Battery className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Charging</h4>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">8</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Currently at charging stations</p>
                </div>
              </div>
              
              {/* In Use */}
              <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">On Route</h4>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400">0</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Actively on delivery routes</p>
                </div>
              </div>
              
              {/* Maintenance */}
              <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mr-4">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Maintenance</h4>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400">2</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Undergoing maintenance or repair</p>
                </div>
              </div>
              
              {/* Issues */}
              <div className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-4">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Issues Reported</h4>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400">1</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicles with reported problems</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Car className="h-4 w-4 mr-2" />
              View Fleet Manager
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Tabs Section */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            Quick Insights
          </TabsTrigger>
          <TabsTrigger value="charging" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            Charging Infrastructure
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            Active Routes
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            Alerts & Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card className="border-none shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Driver Efficiency Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600">
                      <span className="font-semibold">TJ</span>
                    </div>
                    <div>
                      <p className="font-medium">Thomas Johnson</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">4.2 mi/kWh average</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">Top Performance</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600">
                      <span className="font-semibold">LS</span>
                    </div>
                    <div>
                      <p className="font-medium">Laura Smith</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">3.9 mi/kWh average</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">Consistent</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600">
                      <span className="font-semibold">RS</span>
                    </div>
                    <div>
                      <p className="font-medium">Robert Stevens</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">3.1 mi/kWh average</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400">Needs Coaching</Badge>
                </div>
              </CardContent>
              <CardFooter className="bg-white/80 dark:bg-white/5 rounded-b-lg border-t border-gray-100 dark:border-gray-800">
                <Button variant="ghost" className="w-full justify-between">
                  <span>View All Driver Analytics</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Alerts & Notifications */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-amber-500" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-300">Maintenance Alert</p>
                    <p className="text-sm text-red-700 dark:text-red-400">Vehicle #EV-108 battery diagnostic warning detected.</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Charging Completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">4 vehicles finished charging at Station #CS-002.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Driver Assignment Updated</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Route assignments updated for tomorrow's deliveries.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Efficiency Milestone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fleet reached 10,000 kWh energy savings milestone.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 rounded-b-lg border-t border-gray-100 dark:border-gray-800">
                <Button variant="ghost" className="w-full justify-between">
                  <span>View All Notifications</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charging">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Battery className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium">Charging Infrastructure Overview</h3>
            <p className="max-w-md mx-auto mt-2">
              Detailed charging infrastructure analytics and controls 
              will be available in this section.
            </p>
            <Button size="sm" className="mt-4">View Charging Stations</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="routes">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium">Active Routes Overview</h3>
            <p className="max-w-md mx-auto mt-2">
              View and manage all currently active vehicle routes 
              and delivery schedules in this section.
            </p>
            <Button size="sm" className="mt-4">View Route Manager</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium">Alerts & Notifications</h3>
            <p className="max-w-md mx-auto mt-2">
              Configure and view system alerts and notifications
              for your entire EV fleet operation.
            </p>
            <Button size="sm" className="mt-4">Configure Alerts</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/route-planning">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32">
              <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="font-medium">Route Planning</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optimize delivery routes</p>
            </div>
          </Link>
          
          <Link href="/charging-stations">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32">
              <Battery className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="font-medium">Charging Stations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage charging infrastructure</p>
            </div>
          </Link>
          
          <Link href="/vehicles">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32">
              <Car className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-medium">Vehicle Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fleet overview and details</p>
            </div>
          </Link>
          
          <Link href="/ai-insights">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-32">
              <BarChart className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <h3 className="font-medium">AI Insights</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Advanced analytics and predictions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 
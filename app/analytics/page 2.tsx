"use client";

import React from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  LineChart, 
  PieChart as PieChartIcon,
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Filter,
  MapPin,
  Zap,
  Battery,
  Car,
  Users,
  Clock,
  ArrowRight,
  ChevronDown,
  Info,
  AlertTriangle,
  Check,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('30d');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Analytics & Reporting
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive insights into your EV charging infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="relative">
            <select 
              className="appearance-none pl-4 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Energy Delivered</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">124,568 kWh</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+12.5%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 110,726 kWh</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 12.5%
                </span>
              </div>
              <Progress value={87} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Charge Time</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">42 min</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">-8.7%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 46 min</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" /> 8.7%
                </span>
              </div>
              <Progress value={65} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Charging Sessions</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">3,842</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+24.1%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <Battery className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 3,096 sessions</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 24.1%
                </span>
              </div>
              <Progress value={92} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Network Utilization</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">68.2%</h3>
                  <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">+2.3%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <BarChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 66.7%</span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 2.3%
                </span>
              </div>
              <Progress value={68} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics Tabs */}
      <Tabs defaultValue="energy" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="energy" className="space-y-6 mt-6">
          {/* Energy Consumption Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Energy Consumption Trends</CardTitle>
                  <CardDescription>Daily energy delivery across all charging stations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-96 relative">
                {/* Placeholder for Chart - Would be replaced with actual chart component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-blue-100 dark:text-blue-900/20 mx-auto mb-4" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Energy consumption chart showing daily trends
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent rounded-b-lg"></div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Peak energy delivery time: 7:00 AM - 9:00 AM</span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Energy Distribution & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Energy Distribution</CardTitle>
                <CardDescription>By station type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  {/* Placeholder for Chart - Would be replaced with actual chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <PieChartIcon className="h-16 w-16 text-blue-100 dark:text-blue-900/20 mx-auto mb-4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">DC Fast Chargers</span>
                    </div>
                    <div className="text-sm font-medium">64.2% (79,972 kWh)</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm">Level 2 AC Chargers</span>
                    </div>
                    <div className="text-sm font-medium">32.5% (40,485 kWh)</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Level 1 AC Chargers</span>
                    </div>
                    <div className="text-sm font-medium">3.3% (4,111 kWh)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Energy Efficiency Analysis</CardTitle>
                  <CardDescription>Cost and carbon metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Average Energy Cost</div>
                      <div className="text-2xl font-bold mt-1">$0.142/kWh</div>
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          <span>3.4% vs previous period</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Energy Cost</div>
                      <div className="text-2xl font-bold mt-1">$17,689</div>
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex items-center text-amber-600 dark:text-amber-400">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span>8.7% vs previous period</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Carbon Offset</div>
                      <div className="text-2xl font-bold mt-1">53.2 tCO₂e</div>
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span>12.5% vs previous period</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Renewable Energy Mix</div>
                      <div className="text-2xl font-bold mt-1">42.8%</div>
                      <div className="flex items-center mt-2 text-xs">
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span>5.2% vs previous period</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Time of Use Analysis</CardTitle>
                  <CardDescription>Energy distribution by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 relative">
                    {/* Placeholder for Chart - Would be replaced with actual chart component */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart className="h-12 w-12 text-blue-100 dark:text-blue-900/20 mx-auto" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent rounded-b-lg"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-500">Morning Peak</div>
                      <div className="font-medium mt-1">7-9 AM</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">28.4%</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-500">Midday</div>
                      <div className="font-medium mt-1">11 AM-1 PM</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">21.7%</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-500">Afternoon</div>
                      <div className="font-medium mt-1">2-4 PM</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">18.3%</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-500">Evening Peak</div>
                      <div className="font-medium mt-1">5-7 PM</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">31.6%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Energy Anomalies & Recommendations */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Energy Insights & Recommendations</CardTitle>
              <CardDescription>AI-driven analysis of your energy consumption patterns</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <div className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Unusual Consumption Pattern Detected</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Headquarters Station showed a 32% increase in energy consumption during off-peak hours (1-4 AM).
                      This may indicate system inefficiency or unauthorized usage.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Investigate
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cost Optimization Opportunity</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Shifting 15% of your charging load from evening peak (5-7 PM) to midday (11 AM-1 PM) 
                      could save approximately $1,240 per month based on time-of-use rates.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Plan
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Solar Integration Potential</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Based on your charging patterns and location data, installing solar canopies at your 
                      Depot Station could offset 38% of energy consumption with an estimated ROI of 3.2 years.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 py-3">
              <Button variant="ghost" className="w-full justify-center">
                View All Insights
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <div className="h-96 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="text-center p-6">
              <BarChart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sessions Analytics</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Detailed charging session analytics including duration, energy delivered, and user behavior patterns.
              </p>
              <Button className="mt-4">View Sessions Analytics</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stations" className="mt-6">
          <div className="h-96 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Station Performance</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Comparative analysis of charging station performance, utilization rates, and maintenance metrics.
              </p>
              <Button className="mt-4">View Station Analytics</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <div className="h-96 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">User Behavior Analysis</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Insights into user charging habits, preferences, and engagement patterns across your network.
              </p>
              <Button className="mt-4">View User Analytics</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Saved Reports</h2>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Report</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Performance Report</CardTitle>
              <CardDescription>Auto-generated on 1st of each month</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Comprehensive overview of network performance, energy metrics, and financial data.
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Energy</Badge>
                <Badge variant="outline" className="text-xs">Financial</Badge>
                <Badge variant="outline" className="text-xs">Performance</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <div className="text-xs text-gray-500">Last generated: Oct 1, 2023</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fleet Usage Analysis</CardTitle>
              <CardDescription>Weekly report on fleet charging patterns</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Detailed breakdown of vehicle-specific charging metrics, efficiency, and route analysis.
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Fleet</Badge>
                <Badge variant="outline" className="text-xs">Vehicles</Badge>
                <Badge variant="outline" className="text-xs">Routes</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <div className="text-xs text-gray-500">Last generated: Sep 28, 2023</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sustainability Impact</CardTitle>
              <CardDescription>Quarterly environmental impact report</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Carbon emissions reduction, renewable energy utilization, and sustainability metrics.
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Carbon</Badge>
                <Badge variant="outline" className="text-xs">Emissions</Badge>
                <Badge variant="outline" className="text-xs">Renewable</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <div className="text-xs text-gray-500">Last generated: Jul 15, 2023</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 
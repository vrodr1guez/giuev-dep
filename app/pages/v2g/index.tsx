"use client";

import * as React from 'react';
import { 
  Battery, BarChart2, Filter, Download, Plus, 
  CheckCircle, AlertTriangle, Clock, Calendar,
  Info, Zap, Settings, ChevronDown, RefreshCw, 
  ArrowUp, ArrowDown, Cloud, Sun, TrendingUp, 
  DollarSign as CreditCard, DollarSign, Home, Activity
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Mock data for V2G program
const v2gStats = {
  totalParticipatingVehicles: 15,
  totalCapacity: 375, // kWh
  averageUtilization: 42, // percent
  energyFeedToGrid: {
    today: 68, // kWh
    thisWeek: 420, // kWh
    thisMonth: 1850 // kWh
  },
  revenue: {
    today: 34, // dollars
    thisWeek: 210, // dollars
    thisMonth: 925 // dollars
  },
  scheduledEvents: 3,
  upcomingGridEvent: {
    time: 'Today, 6:00 PM - 8:00 PM',
    type: 'Peak Demand Response',
    priorityLevel: 'High',
    potentialEarnings: 45, // dollars
    participatingVehicles: 12
  },
  gridHealthStatus: 'Stable',
  demandResponseSavings: 12500, // dollars annually
  co2Reduction: 3.2 // tons
};

// Mock data for eligible vehicles
const eligibleVehicles = [
  {
    id: 'EV001',
    name: 'Tesla Model 3',
    driver: 'John Davis',
    currentSoC: 85,
    availableEnergy: 42, // kWh available for V2G
    status: 'Available',
    location: 'HQ Charging Hub',
    enrolled: true,
    scheduledUntil: '5:00 PM',
    scheduleConflict: false,
    potentialEarning: '$5.10'
  },
  {
    id: 'EV003',
    name: 'Chevy Bolt',
    driver: 'Robert Kennedy',
    currentSoC: 78,
    availableEnergy: 31,
    status: 'Available',
    location: 'HQ Charging Hub',
    enrolled: true,
    scheduledUntil: '6:30 PM',
    scheduleConflict: true,
    potentialEarning: '$3.75'
  },
  {
    id: 'EV008',
    name: 'Ford F-150 Lightning',
    driver: 'Michael Chen',
    currentSoC: 92,
    availableEnergy: 65,
    status: 'Available',
    location: 'Downtown Hub',
    enrolled: true,
    scheduledUntil: 'None',
    scheduleConflict: false,
    potentialEarning: '$7.80'
  },
  {
    id: 'EV012',
    name: 'Rivian R1T',
    driver: 'Sarah Johnson',
    currentSoC: 88,
    availableEnergy: 58,
    status: 'In Use',
    location: 'On Road',
    enrolled: true,
    scheduledUntil: 'None',
    scheduleConflict: false,
    potentialEarning: '$0.00'
  },
  {
    id: 'EV015',
    name: 'Hyundai Ioniq 5',
    driver: 'Emily Rodriguez',
    currentSoC: 76,
    availableEnergy: 28,
    status: 'Available',
    location: 'Warehouse Depot',
    enrolled: false,
    scheduledUntil: 'Not enrolled',
    scheduleConflict: false,
    potentialEarning: '$3.40'
  }
];

// Mock data for grid events
const gridEvents = [
  {
    id: 'GE001',
    title: 'Evening Peak Demand Response',
    date: 'Today',
    time: '6:00 PM - 8:00 PM',
    status: 'Upcoming',
    type: 'Peak Shaving',
    priority: 'High',
    expectedDemand: 1200, // kW
    participatingVehicles: 12,
    potentialContribution: 220, // kWh
    estimatedRevenue: 132, // dollars
    notification: 'Sent to all drivers'
  },
  {
    id: 'GE002',
    title: 'Afternoon Frequency Regulation',
    date: 'Tomorrow',
    time: '2:00 PM - 4:00 PM',
    status: 'Scheduled',
    type: 'Frequency Regulation',
    priority: 'Medium',
    expectedDemand: 950, // kW
    participatingVehicles: 8,
    potentialContribution: 160, // kWh
    estimatedRevenue: 96, // dollars
    notification: 'Pending'
  },
  {
    id: 'GE003',
    title: 'Morning Renewable Integration',
    date: 'May 15, 2023',
    time: '9:00 AM - 11:00 AM',
    status: 'Scheduled',
    type: 'Renewable Integration',
    priority: 'Low',
    expectedDemand: 780, // kW
    participatingVehicles: 6,
    potentialContribution: 120, // kWh
    estimatedRevenue: 72, // dollars
    notification: 'Not sent'
  },
  {
    id: 'GE004',
    title: 'Weekend Grid Stability',
    date: 'May 20, 2023',
    time: '1:00 PM - 5:00 PM',
    status: 'Scheduled',
    type: 'Grid Stability',
    priority: 'Medium',
    expectedDemand: 1100, // kW
    participatingVehicles: 10,
    potentialContribution: 200, // kWh
    estimatedRevenue: 120, // dollars
    notification: 'Not sent'
  }
];

// Historical performance data
const historicalPerformance = [
  { month: 'Jan', energy: 1200, revenue: 600, events: 12 },
  { month: 'Feb', energy: 1350, revenue: 675, events: 14 },
  { month: 'Mar', energy: 1500, revenue: 750, events: 15 },
  { month: 'Apr', energy: 1720, revenue: 860, events: 18 },
  { month: 'May', energy: 1850, revenue: 925, events: 19 },
];

const V2GManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">V2G Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage Vehicle-to-Grid operations and grid support events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            Schedule Event
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Participating Vehicles</TabsTrigger>
          <TabsTrigger value="events">Grid Events</TabsTrigger>
          <TabsTrigger value="settings">Program Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Participating Vehicles</p>
                    <h3 className="text-2xl font-bold mt-1">{v2gStats.totalParticipatingVehicles}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Battery size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Total fleet capacity: {v2gStats.totalCapacity} kWh</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grid Contribution Today</p>
                    <h3 className="text-2xl font-bold mt-1">{v2gStats.energyFeedToGrid.today} kWh</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Zap size={24} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    8% from yesterday
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Today</p>
                    <h3 className="text-2xl font-bold mt-1">${v2gStats.revenue.today}</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <CreditCard size={24} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    Monthly: ${v2gStats.revenue.thisMonth}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grid Status</p>
                    <h3 className="text-2xl font-bold mt-1">{v2gStats.gridHealthStatus}</h3>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-blue-500 flex items-center">
                    <Info size={14} className="mr-1" />
                    {v2gStats.scheduledEvents} scheduled events
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Grid Event Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Next Grid Event</CardTitle>
              <CardDescription>Be prepared for upcoming grid support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium">{v2gStats.upcomingGridEvent.type}</h3>
                      <p className="text-sm text-gray-500">{v2gStats.upcomingGridEvent.time}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="font-medium text-red-600">{v2gStats.upcomingGridEvent.priorityLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Participating Vehicles</p>
                      <p className="font-medium">{v2gStats.upcomingGridEvent.participatingVehicles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Potential Earnings</p>
                      <p className="font-medium text-green-600">${v2gStats.upcomingGridEvent.potentialEarnings}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Calendar size={16} className="mr-1" />
                    View Details
                  </Button>
                  <Button size="sm">
                    <CheckCircle size={16} className="mr-1" />
                    Manage Participation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">V2G Performance</CardTitle>
                <CardDescription>Historical contribution and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    [Interactive Chart: Monthly energy contribution and revenue]
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Total Energy</p>
                    <p className="text-xl font-semibold mt-1">{v2gStats.energyFeedToGrid.thisMonth} kWh</p>
                    <p className="text-xs text-green-500 flex items-center justify-center mt-1">
                      <ArrowUp size={12} className="mr-1" />
                      8% from last month
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-xl font-semibold mt-1">${v2gStats.revenue.thisMonth}</p>
                    <p className="text-xs text-green-500 flex items-center justify-center mt-1">
                      <ArrowUp size={12} className="mr-1" />
                      11% from last month
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Grid Events</p>
                    <p className="text-xl font-semibold mt-1">19</p>
                    <p className="text-xs text-green-500 flex items-center justify-center mt-1">
                      <ArrowUp size={12} className="mr-1" />
                      4 more than last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Environmental Impact</CardTitle>
                <CardDescription>CO2 emissions reduced</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="h-24 w-24 rounded-full border-8 border-green-500 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">{v2gStats.co2Reduction}</span>
                  </div>
                  <p className="text-lg font-medium">Tons of CO2 Saved</p>
                  <p className="text-sm text-gray-500">Through V2G operations this month</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Annual Demand Response Savings:</p>
                  <p className="text-lg font-semibold text-green-600">${v2gStats.demandResponseSavings.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Available V2G Capacity</CardTitle>
              <CardDescription>Current fleet status and potential grid support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Driver</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">SoC</th>
                      <th className="px-4 py-3">Available Energy</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Scheduled Until</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleVehicles.slice(0, 4).map((vehicle) => (
                      <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{vehicle.name}</td>
                        <td className="px-4 py-3">{vehicle.driver}</td>
                        <td className="px-4 py-3">{vehicle.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Battery className="text-blue-500 mr-1" size={16} />
                            {vehicle.currentSoC}%
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Zap className="text-amber-500 mr-1" size={16} />
                            {vehicle.availableEnergy} kWh
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            vehicle.status === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={vehicle.scheduleConflict ? 'text-red-500' : ''}>
                            {vehicle.scheduledUntil}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm">Dispatch</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button variant="link">View All {v2gStats.totalParticipatingVehicles} Vehicles</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participating Vehicles</CardTitle>
              <CardDescription>Manage vehicles in your V2G program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">This tab would contain a complete list of all vehicles enrolled in the V2G program, their participation settings, and detailed statistics about their contribution.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grid Events</CardTitle>
              <CardDescription>Schedule and manage grid support events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">This tab would contain a complete list of past, current, and future grid events, with options to schedule new events, set parameters for participation, and view detailed results of completed events.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure V2G program parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">This tab would contain program settings, including minimum SoC thresholds, revenue sharing options, automatic participation rules, and integrations with grid operators.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default V2GManagementPage; 
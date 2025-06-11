"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LineChart, 
  BarChart, 
  PieChart,
  ArrowRight,
  Car,
  Battery,
  Zap,
  Clock,
  Settings,
  Sparkles,
  User,
  Bell,
  Search,
  Calendar,
  MapPin,
  Download,
  Filter
} from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent, PremiumCardFooter } from '../components/ui/premium-card';
import { PremiumButton } from '../components/ui/premium-button';
import { PremiumChart } from '../components/ui/premium-chart';
import { PremiumThemeSwitcher } from '../components/ui/premium-theme-switcher';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatNumber, formatDate } from '../lib/utils';

// Sample EV charging locations for map
const CHARGING_LOCATIONS = [
  { id: 1, name: "Headquarters", status: "active", chargers: 12, available: 5 },
  { id: 2, name: "Downtown Hub", status: "active", chargers: 8, available: 2 },
  { id: 3, name: "East Campus", status: "maintenance", chargers: 6, available: 0 },
  { id: 4, name: "West Terminal", status: "active", chargers: 10, available: 7 },
  { id: 5, name: "South Station", status: "active", chargers: 4, available: 1 }
];

// Sample vehicles data
const VEHICLES = [
  { id: 101, name: "Fleet Van 01", batteryLevel: 78, status: "available", location: "Headquarters" },
  { id: 102, name: "Delivery Truck 05", batteryLevel: 23, status: "charging", location: "Downtown Hub" },
  { id: 103, name: "Passenger EV 12", batteryLevel: 92, status: "available", location: "West Terminal" },
  { id: 104, name: "Utility Vehicle 03", batteryLevel: 45, status: "in-use", location: "Mobile" },
  { id: 105, name: "Fleet Van 07", batteryLevel: 12, status: "charging", location: "Headquarters" }
];

// Sample recent activities
const RECENT_ACTIVITIES = [
  { id: 1, title: "Charging Session Completed", vehicle: "Fleet Van 01", time: "10 min ago", energy: "23.4 kWh" },
  { id: 2, title: "Maintenance Alert", location: "East Campus", time: "1 hour ago", status: "critical" },
  { id: 3, title: "Vehicle Checked Out", vehicle: "Utility Vehicle 03", time: "2 hours ago", user: "John Doe" },
  { id: 4, title: "New Report Generated", report: "Daily Usage Summary", time: "5 hours ago" },
  { id: 5, title: "Charging Session Started", vehicle: "Delivery Truck 05", time: "6 hours ago", location: "Downtown Hub" }
];

// Sample analytics data
const ENERGY_DATA = {
  daily: [42.3, 38.1, 45.7, 53.2, 47.8, 51.9, 60.4, 58.3, 55.2, 64.1, 68.5, 71.2, 67.8],
  weekly: [320, 350, 410, 390, 450, 470, 510],
  monthly: [1250, 1380, 1510, 1690, 1790, 1850, 1920, 2100, 2250, 2380, 2510, 2680]
};

export default function PremiumDashboardPage() {
  // Responsive hooks
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });
  
  // State
  const [timeRange, setTimeRange] = React.useState('week');
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  // Load animation effect when component mounts
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    setLoaded(true);
  }, []);
  
  // Handle data refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };
  
  // Choose layout based on screen size
  const getGridClass = () => {
    if (isMobile) return "grid-cols-1 gap-4";
    if (isTabletOrMobile) return "grid-cols-2 gap-5";
    return "grid-cols-4 gap-6";
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Premium Header with Responsive Design */}
      <div className={`transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient">
              Premium Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete overview of your EV charging infrastructure
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Only show theme switcher on larger screens */}
            {!isMobile && (
              <PremiumThemeSwitcher showLabel={!isTabletOrMobile} />
            )}
            
            {/* Search button - collapses on mobile */}
            <div className="relative flex-grow lg:flex-grow-0 max-w-sm">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Notification button */}
            <div className="relative">
              <PremiumButton
                variant="outline"
                size="sm"
                ripple={true}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
              </PremiumButton>
              
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50 animate-fade-in-down">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {RECENT_ACTIVITIES.slice(0, 3).map((activity, index) => (
                      <div key={activity.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <Link href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile button */}
            <PremiumButton
              variant="ghost"
              size="sm"
              ripple={true}
            >
              <User className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </PremiumButton>
          </div>
        </div>
        
        {/* Responsive Navigation Tabs */}
        <Tabs 
          defaultValue="overview" 
          className="w-full" 
          onValueChange={setActiveTab}
        >
          <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} w-full`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="charging">Charging</TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="energy">Energy</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Main Dashboard Content */}
      <div className={`transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* KPI Cards with Responsive Grid */}
        <div className={`grid ${getGridClass()} mb-6`}>
          <PremiumCard 
            variant="glass" 
            hover={true} 
            strokeHighlight={true}
            highlightColor="blue"
            className="backdrop-blur-md"
          >
            <PremiumCardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vehicles</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">42</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+5</Badge>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                  <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Available: 35</span>
                  <span>In Use: 7</span>
                </div>
                <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[83%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
          
          <PremiumCard 
            variant="glass" 
            hover={true} 
            strokeHighlight={true}
            highlightColor="purple"
            className="backdrop-blur-md"
          >
            <PremiumCardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Charging Stations</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">18</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+2</Badge>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                  <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Active: 16</span>
                  <span>Maintenance: 2</span>
                </div>
                <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[89%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
          
          <PremiumCard 
            variant="glass" 
            hover={true} 
            strokeHighlight={true}
            highlightColor="green"
            className="backdrop-blur-md"
          >
            <PremiumCardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Energy Delivered</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">128.4 kWh</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+24%</Badge>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Today's Usage</span>
                  <span>Peak: 9AM-11AM</span>
                </div>
                <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[76%] bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
          
          <PremiumCard 
            variant="glass" 
            hover={true} 
            strokeHighlight={true}
            highlightColor="amber"
            className="backdrop-blur-md"
          >
            <PremiumCardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">8</h3>
                    <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Live</Badge>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <Battery className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Avg Duration: 43 min</span>
                  <span>Capacity: 40%</span>
                </div>
                <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[40%] bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </div>
        
        {/* Main Content Area - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area - Takes 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <PremiumChart 
              type="line"
              height={isMobile ? "250px" : "350px"}
              title="Energy Consumption Trends"
              subtitle="Daily energy delivery across all charging stations"
              animated={true}
              gradientBackground={true}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <select
                  className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                
                <PremiumButton 
                  variant="outline" 
                  size="sm" 
                  ripple={true}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  {!isMobile && "Export"}
                </PremiumButton>
              </div>
              
              {/* Placeholder for actual chart */}
              <div className="h-[200px] sm:h-[280px] w-full flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 sm:h-16 sm:w-16 text-blue-100 dark:text-blue-900/20 mx-auto mb-4" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Interactive energy consumption chart
                  </div>
                  <PremiumButton 
                    variant="gradient" 
                    ripple={true}
                    className="mt-4"
                  >
                    Load Chart
                  </PremiumButton>
                </div>
              </div>
            </PremiumChart>
            
            {/* Lower Data Section - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Vehicles Status */}
              <PremiumCard 
                variant="glass" 
                hover={true} 
                innerGlow={true}
                highlightColor="blue"
              >
                <PremiumCardHeader>
                  <PremiumCardTitle>
                    <Car className="h-4 w-4 mr-2" />
                    Vehicle Status
                  </PremiumCardTitle>
                  <PremiumCardDescription>
                    Most recent vehicle activities
                  </PremiumCardDescription>
                </PremiumCardHeader>
                <PremiumCardContent className="px-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[250px] overflow-y-auto">
                    {VEHICLES.map((vehicle) => (
                      <div key={vehicle.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{vehicle.location}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full ${
                                vehicle.batteryLevel > 60 ? 'bg-green-500' : 
                                vehicle.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${vehicle.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{vehicle.batteryLevel}%</span>
                          <Badge className={`
                            ${vehicle.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              vehicle.status === 'charging' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                          `}>
                            {vehicle.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCardContent>
                <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800">
                  <Link href="/vehicles" className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center">
                    View All Vehicles
                  </Link>
                </PremiumCardFooter>
              </PremiumCard>
              
              {/* Recent Activity */}
              <PremiumCard 
                variant="glass" 
                hover={true} 
                innerGlow={true}
                highlightColor="purple"
              >
                <PremiumCardHeader>
                  <PremiumCardTitle>
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Activity
                  </PremiumCardTitle>
                  <PremiumCardDescription>
                    Latest events and notifications
                  </PremiumCardDescription>
                </PremiumCardHeader>
                <PremiumCardContent className="px-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[250px] overflow-y-auto">
                    {RECENT_ACTIVITIES.map((activity) => (
                      <div key={activity.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {activity.vehicle && <span>Vehicle: {activity.vehicle}</span>}
                          {activity.location && <span>Location: {activity.location}</span>}
                          {activity.energy && <span>Energy: {activity.energy}</span>}
                          {activity.user && <span>User: {activity.user}</span>}
                          {activity.report && <span>Report: {activity.report}</span>}
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCardContent>
                <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800">
                  <Link href="/activities" className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center">
                    View All Activities
                  </Link>
                </PremiumCardFooter>
              </PremiumCard>
            </div>
          </div>
          
          {/* Sidebar - Takes 1/3 width on desktop, full width on mobile */}
          <div className="space-y-6">
            {/* Charging Station Locations */}
            <PremiumCard 
              variant="glass" 
              hover={true} 
              innerGlow={true}
              highlightColor="green"
            >
              <PremiumCardHeader>
                <PremiumCardTitle>
                  <MapPin className="h-4 w-4 mr-2" />
                  Charging Locations
                </PremiumCardTitle>
                <PremiumCardDescription>
                  Status of all charging stations
                </PremiumCardDescription>
              </PremiumCardHeader>
              <PremiumCardContent className="px-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {CHARGING_LOCATIONS.map((location) => (
                    <div key={location.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{location.name}</div>
                        <Badge className={`
                          ${location.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                        `}>
                          {location.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {location.available} of {location.chargers} chargers available
                      </div>
                      <div className="mt-2 relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600 rounded-full" 
                          style={{ width: `${(location.available / location.chargers) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCardContent>
              <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800">
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="w-full"
                  ripple={true}
                  leftIcon={<MapPin className="h-4 w-4" />}
                >
                  Open Map View
                </PremiumButton>
              </PremiumCardFooter>
            </PremiumCard>
            
            {/* Quick Actions */}
            <PremiumCard 
              variant="glass" 
              hover={true} 
              innerGlow={true}
              highlightColor="amber"
            >
              <PremiumCardHeader>
                <PremiumCardTitle>
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  Premium Features
                </PremiumCardTitle>
                <PremiumCardDescription>
                  Advanced tools and reports
                </PremiumCardDescription>
              </PremiumCardHeader>
              <PremiumCardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/premium-analytics">
                    <PremiumButton
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className="w-full justify-start"
                      ripple={true}
                      leftIcon={<BarChart className="h-4 w-4" />}
                    >
                      Premium Analytics
                    </PremiumButton>
                  </Link>
                  
                  <Link href="/premium-reports">
                    <PremiumButton
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className="w-full justify-start"
                      ripple={true}
                      leftIcon={<LineChart className="h-4 w-4" />}
                    >
                      Premium Reports
                    </PremiumButton>
                  </Link>
                  
                  <Link href="/settings">
                    <PremiumButton
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className="w-full justify-start"
                      ripple={true}
                      leftIcon={<Settings className="h-4 w-4" />}
                    >
                      Dashboard Settings
                    </PremiumButton>
                  </Link>
                </div>
              </PremiumCardContent>
              <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800">
                <Link href="/premium" className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center flex items-center justify-center">
                  <span>Manage Premium Features</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </PremiumCardFooter>
            </PremiumCard>
          </div>
        </div>
      </div>
    </div>
  );
} 
/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Activity, AlertCircle, AlertOctagon, AlertTriangle, ArrowDown, ArrowUp, 
  Battery, BatteryCharging, Bell, Calendar, Car, ChevronDown, Clock, 
  Download, Filter, Info, Leaf, MapPin, MoreHorizontal, RefreshCw, Search, 
  Settings, Zap, Maximize2, Layers, Plus, Minus, Compass, CheckCircle, 
  FileText, PlusCircle, CalendarPlus, Sun, Moon, Cpu, Droplets, Wind,
  BarChart2, PieChart as PieChartIcon, TrendingUp, TrendingDown, Users, DollarSign,
  ThermometerSun, Bolt, Gauge, PlugZap, Route, Shield, CloudLightning
} from 'lucide-react';
import Link from 'next/link';

// Import our new visualization components
import FleetMap from '../visualization/FleetMap';
import BatterySoCChart from '../visualization/BatterySoCChart';
import EnergyConsumptionChart from '../visualization/EnergyConsumptionChart';
import WeatherImpactWidget from '../visualization/WeatherImpactWidget';

// Import our new UI components
import { KpiCard } from './KpiCard';
import { AlertPanel, Alert } from './AlertPanel';

// Mock data for charts and visualizations
const mockVehicleStatusData = [
  { name: 'Driving', count: 18, fill: '#22c55e' },
  { name: 'Charging', count: 5, fill: '#8b5cf6' },
  { name: 'Idle', count: 2, fill: '#f59e0b' },
  { name: 'Maintenance', count: 1, fill: '#64748b' },
  { name: 'Offline', count: 0, fill: '#ef4444' },
];

const mockEnergyConsumptionData = [
  { day: 'Mon', kWh: 120, cost: 24, peak: 18, offPeak: 102 },
  { day: 'Tue', kWh: 150, cost: 30, peak: 25, offPeak: 125 },
  { day: 'Wed', kWh: 110, cost: 22, peak: 15, offPeak: 95 },
  { day: 'Thu', kWh: 180, cost: 36, peak: 30, offPeak: 150 },
  { day: 'Fri', kWh: 200, cost: 40, peak: 35, offPeak: 165 },
  { day: 'Sat', kWh: 90, cost: 18, peak: 10, offPeak: 80 },
  { day: 'Sun', kWh: 75, cost: 15, peak: 5, offPeak: 70 },
];

const mockWeeklyEnergyConsumptionData = [
  { week: 'W1', kWh: 925, cost: 185, peak: 138, offPeak: 787 },
  { week: 'W2', kWh: 875, cost: 175, peak: 120, offPeak: 755 },
  { week: 'W3', kWh: 950, cost: 190, peak: 145, offPeak: 805 },
  { week: 'W4', kWh: 1050, cost: 210, peak: 160, offPeak: 890 },
];

const mockMonthlyEnergyConsumptionData = [
  { month: 'Jan', kWh: 3800, cost: 760, peak: 570, offPeak: 3230 },
  { month: 'Feb', kWh: 3500, cost: 700, peak: 525, offPeak: 2975 },
  { month: 'Mar', kWh: 3900, cost: 780, peak: 585, offPeak: 3315 },
  { month: 'Apr', kWh: 4200, cost: 840, peak: 630, offPeak: 3570 },
  { month: 'May', kWh: 3800, cost: 760, peak: 570, offPeak: 3230 },
];

const mockSoCDistributionData = [
  { name: '0-20%', value: 2, fill: '#ef4444' },
  { name: '21-40%', value: 3, fill: '#f59e0b' },
  { name: '41-60%', value: 5, fill: '#22c55e' },
  { name: '61-80%', value: 10, fill: '#3b82f6' },
  { name: '81-100%', value: 6, fill: '#8b5cf6' },
];

const mockChargingSessionsData = [
  { date: '05/01', sessions: 10, avgDurationMin: 45, energyDelivered: 250 },
  { date: '05/02', sessions: 12, avgDurationMin: 40, energyDelivered: 280 },
  { date: '05/03', sessions: 8, avgDurationMin: 50, energyDelivered: 220 },
  { date: '05/04', sessions: 15, avgDurationMin: 35, energyDelivered: 320 },
  { date: '05/05', sessions: 11, avgDurationMin: 42, energyDelivered: 260 },
  { date: '05/06', sessions: 9, avgDurationMin: 48, energyDelivered: 240 },
  { date: '05/07', sessions: 13, avgDurationMin: 38, energyDelivered: 290 },
];

const mockVehicleLocations = [
  { id: 'EV001', lat: 40.7128, lng: -74.0060, status: 'driving', soc: 65, driver: 'John D.', model: 'Tesla Model 3', range: 185, speed: 42 },
  { id: 'EV002', lat: 40.7282, lng: -73.9942, status: 'charging', soc: 45, driver: 'Sarah M.', model: 'Nissan Leaf', range: 98, speed: 0 },
  { id: 'EV003', lat: 40.7589, lng: -73.9851, status: 'driving', soc: 78, driver: 'Robert K.', model: 'Chevy Bolt', range: 210, speed: 38 },
  { id: 'EV004', lat: 40.7549, lng: -74.0039, status: 'idle', soc: 92, driver: 'Emma L.', model: 'Ford Mustang Mach-E', range: 270, speed: 0 },
  { id: 'EV005', lat: 40.7429, lng: -73.9915, status: 'driving', soc: 23, driver: 'Michael P.', model: 'Hyundai Kona Electric', range: 62, speed: 35 },
  { id: 'EV007', lat: 40.7382, lng: -74.0150, status: 'alert', soc: 15, driver: 'David W.', model: 'Kia EV6', range: 45, speed: 28 },
];

const mockChargingStations = [
  { id: 'CS001', lat: 40.7200, lng: -74.0000, type: 'fast', available: 2, total: 4, power: 150 },
  { id: 'CS002', lat: 40.7350, lng: -73.9900, type: 'standard', available: 0, total: 6, power: 50 },
  { id: 'CS003', lat: 40.7500, lng: -74.0100, type: 'fast', available: 1, total: 2, power: 350 },
  { id: 'CS004', lat: 40.7450, lng: -73.9800, type: 'standard', available: 3, total: 8, power: 22 },
];

const mockAlerts: Alert[] = [
  { 
    id: 'ALT001', 
    type: 'critical', 
    title: 'Critical Battery Alert', 
    description: 'Vehicle EV007: Battery at 15%', 
    vehicle: 'EV007',
    time: '10 min ago',
    actions: [
      { label: 'View Vehicle', link: '/vehicles/EV007', variant: 'secondary' },
      { label: 'Resolve', link: '#', variant: 'destructive' }
    ]
  },
  { 
    id: 'ALT002', 
    type: 'warning', 
    title: 'Charging Station Offline', 
    description: 'Station CS002: Connector #2 Offline', 
    station: 'CS002',
    time: '25 min ago',
    actions: [
      { label: 'View Station', link: '/charging-stations/CS002', variant: 'secondary' },
      { label: 'Check Status', link: '#', variant: 'warning' }
    ]
  },
  { 
    id: 'ALT003', 
    type: 'info', 
    title: 'Driver Coaching Alert', 
    description: 'Driver John D: Harsh Braking Detected', 
    driver: 'John D',
    time: '45 min ago',
    actions: [
      { label: 'View Details', link: '/drivers/JohnD/feedback', variant: 'secondary' },
      { label: 'Send Feedback', link: '#', variant: 'primary' }
    ]
  },
  { 
    id: 'ALT004', 
    type: 'v2g', 
    title: 'V2G Dispatch Alert', 
    description: 'Grid demand spike expected in 30 mins', 
    time: '1 hour ago',
    actions: [
      { label: 'View Forecast', link: '/energy/forecast', variant: 'secondary' },
      { label: 'Manage V2G', link: '/v2g', variant: 'primary' }
    ]
  },
];

const mockUpcomingEvents = [
  {
    id: 'EVT001',
    type: 'maintenance',
    title: 'Maintenance',
    description: 'Vehicle EV012',
    time: 'Today',
    timeStatus: 'upcoming'
  },
  {
    id: 'EVT002',
    type: 'battery',
    title: 'Battery Check',
    description: '5 Vehicles',
    time: 'Tomorrow',
    timeStatus: 'scheduled'
  },
  {
    id: 'EVT003',
    type: 'route',
    title: 'Route Optimization',
    description: 'Weekly Schedule',
    time: 'In 2 days',
    timeStatus: 'scheduled'
  }
];

const mockBatteryHealthData = [
  { name: 'Excellent (>95%)', value: 8, fill: '#22c55e' },
  { name: 'Good (90-95%)', value: 12, fill: '#3b82f6' },
  { name: 'Fair (85-90%)', value: 4, fill: '#f59e0b' },
  { name: 'Poor (<85%)', value: 2, fill: '#ef4444' },
];

const mockDriverEfficiencyData = [
  { name: 'John D.', efficiency: 4.8, trips: 28, fill: '#22c55e' },
  { name: 'Sarah M.', efficiency: 4.5, trips: 22, fill: '#3b82f6' },
  { name: 'Robert K.', efficiency: 4.2, trips: 18, fill: '#8b5cf6' },
  { name: 'Emma L.', efficiency: 4.7, trips: 25, fill: '#22c55e' },
  { name: 'Michael P.', efficiency: 3.9, trips: 15, fill: '#f59e0b' },
  { name: 'David W.', efficiency: 3.6, trips: 12, fill: '#ef4444' },
];

const mockWeatherData = {
  temperature: 72,
  condition: 'Partly Cloudy',
  wind: 8,
  humidity: 65,
  precipitation: 20,
  icon: <CloudLightning size={24} className="text-blue-400" />
};

// Mock sparkline data for KPI cards
const mockSparklineData = {
  activeEvs: [20, 21, 22, 21, 23, 24, 24],
  fleetHealth: [88, 89, 90, 91, 89, 90, 92],
  avgSoc: [68, 72, 65, 60, 58, 62, 60],
  energyToday: [120, 140, 125, 150, 145, 130, 156],
  alerts: [1, 2, 3, 5, 4, 3, 4],
  co2Saved: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2]
};

// Main Dashboard Component
const EnhancedDashboardOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState('day' as 'day' | 'week' | 'month');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState(mockAlerts as Alert[]);
  const [energyData, setEnergyData] = useState(mockEnergyConsumptionData);
  const [refreshing, setRefreshing] = useState(false);
  
  const totalVehicles = mockVehicleStatusData.reduce((sum, item) => sum + item.count, 0);
  const averageSoC = Math.round(
    mockSoCDistributionData.reduce((sum, item) => sum + (item.value * (parseInt(item.name.split('-')[0]) + parseInt(item.name.split('-')[1])) / 2), 0) / 
    mockSoCDistributionData.reduce((sum, item) => sum + item.value, 0)
  );
  
  const fleetHealthScore = 92;

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle time range change for energy consumption chart
  useEffect(() => {
    if (timeRange === 'day') {
      setEnergyData(mockEnergyConsumptionData);
    } else if (timeRange === 'week') {
      setEnergyData(mockWeeklyEnergyConsumptionData as any);
    } else if (timeRange === 'month') {
      setEnergyData(mockMonthlyEnergyConsumptionData as any);
    }
  }, [timeRange]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would update a global theme context
  };

  const handleDismissAlert = (id: string) => {
    setActiveAlerts(activeAlerts.filter(alert => alert.id !== id));
  };

  const handleDismissAllAlerts = () => {
    setActiveAlerts([]);
  };

  const handleRefreshData = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Dashboard</h1>
          <p className="text-gray-400">Real-time overview of your EV fleet</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="date-range-picker flex items-center bg-gray-800 rounded-md py-1.5 px-3 text-sm border border-gray-700">
            <Calendar size={16} className="mr-2" />
            <span>Last 7 Days</span>
            <ChevronDown size={16} className="ml-2" />
          </div>
          <Button 
            variant="outline"
            size="icon"
            className="refresh-btn rounded-md"
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="export-btn rounded-md"
          >
            <Download size={16} />
          </Button>
        </div>
      </div>
      
      {/* KPI Summary Cards */}
      <div className="kpi-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard 
          title="Active EVs" 
          value="24" 
          trend={{ value: "+2", direction: "up", label: "from yesterday", isPositive: true }}
          icon={<Car className="text-green-500" size={20} />}
          color="#22c55e"
          linkTo="/vehicles"
          loading={loading}
          sparklineData={mockSparklineData.activeEvs}
        />
        
        <KpiCard 
          title="Fleet Health" 
          value="92%" 
          trend={{ value: "+3%", direction: "up", label: "from last week", isPositive: true }}
          icon={<Activity className="text-blue-500" size={20} />}
          color="#3b82f6"
          loading={loading}
          sparklineData={mockSparklineData.fleetHealth}
        />
        
        <KpiCard 
          title="Avg. SoC" 
          value={`${averageSoC}%`}
          trend={{ value: "-5%", direction: "down", label: "from yesterday", isPositive: false }}
          icon={<Battery className="text-purple-500" size={20} />}
          color="#8b5cf6"
          loading={loading}
          sparklineData={mockSparklineData.avgSoc}
        />
        
        <KpiCard 
          title="Energy Today" 
          value="156 kWh" 
          trend={{ value: "+12%", direction: "up", label: "from yesterday", isPositive: true }}
          icon={<Zap className="text-amber-500" size={20} />}
          color="#f59e0b"
          linkTo="/energy-management"
          loading={loading}
          sparklineData={mockSparklineData.energyToday}
        />
        
        <KpiCard 
          title="Alerts" 
          value={activeAlerts.length.toString()} 
          trend={{ 
            value: activeAlerts.filter(a => a.type === 'critical').length.toString(), 
            direction: "neutral", 
            label: "critical", 
            isPositive: activeAlerts.filter(a => a.type === 'critical').length === 0 
          }}
          icon={<AlertCircle className="text-red-500" size={20} />}
          color="#ef4444"
          linkTo="/alerts"
          loading={loading}
          sparklineData={mockSparklineData.alerts}
        />
        
        <KpiCard 
          title="CO₂ Saved" 
          value="1.2 tons" 
          trend={{ value: "+8%", direction: "up", label: "from last week", isPositive: true }}
          icon={<Leaf className="text-green-500" size={20} />}
          color="#22c55e"
          loading={loading}
          sparklineData={mockSparklineData.co2Saved}
        />
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="dashboard-grid grid grid-cols-12 gap-6">
        {/* Fleet Map - Spans most of the width */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <FleetMap 
            vehicles={mockVehicleLocations}
            stations={mockChargingStations}
            loading={loading}
            onVehicleClick={(vehicle) => console.log('Vehicle clicked:', vehicle)}
            onStationClick={(station) => console.log('Station clicked:', station)}
          />
        </div>

        {/* Alerts Panel */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <AlertPanel 
            alerts={activeAlerts}
            onDismiss={handleDismissAlert}
            onDismissAll={handleDismissAllAlerts}
            loading={loading}
            maxItems={4}
            showViewAll={true}
          />
        </div>

        {/* Battery SoC Distribution */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <BatterySoCChart 
            data={mockSoCDistributionData}
            loading={loading}
            onSegmentClick={(entry) => console.log('SoC segment clicked:', entry)}
          />
        </div>

        {/* Energy Consumption Trends */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-8">
          <EnergyConsumptionChart 
            data={energyData}
            timeRange={timeRange}
            loading={loading}
            onRangeChange={(range) => setTimeRange(range)}
          />
        </div>

        {/* Weather Impact Widget */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <WeatherImpactWidget 
            weatherData={mockWeatherData}
            loading={loading} 
            onInfoClick={() => console.log('Weather info clicked')}
          />
        </div>

        {/* Other metrics and widgets can be added here */}
        {/* These would be part of future enhancements */}
      </div>
    </div>
  );
};

export default EnhancedDashboardOverview; 
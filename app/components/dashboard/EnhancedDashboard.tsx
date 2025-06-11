/// <reference path="../../types/react.d.ts" />
"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Battery, 
  Zap, 
  Calendar, 
  Clock, 
  TrendingUp as Fuel, 
  Car, 
  MapPin,
  ArrowUp as ArrowUpRight,
  ArrowDown as ArrowDownRight,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Mock data for the dashboard
const mockData = {
  totalVehicles: 42,
  activeVehicles: 35,
  totalStations: 24,
  activeStations: 22,
  energyUsed: {
    value: 1284.5,
    unit: "kWh",
    trend: 8.2,
    increasing: true
  },
  costSaved: {
    value: 3250,
    unit: "$",
    trend: 12.5,
    increasing: true
  },
  co2Reduced: {
    value: 624,
    unit: "kg",
    trend: 5.3,
    increasing: true
  },
  alerts: [
    { id: 1, level: "warning", message: "Vehicle EV-023 battery health at 78%", time: "10 min ago" },
    { id: 2, level: "error", message: "Charging station #12 offline", time: "35 min ago" },
    { id: 3, level: "success", message: "Fleet maintenance completed", time: "2 hours ago" },
    { id: 4, level: "info", message: "Software update available", time: "1 day ago" }
  ],
  vehicles: [
    { id: "EV-021", batteryLevel: 82, status: "Charging", location: "HQ Station" },
    { id: "EV-045", batteryLevel: 45, status: "In Use", location: "Downtown" },
    { id: "EV-033", batteryLevel: 68, status: "Available", location: "South Hub" },
    { id: "EV-018", batteryLevel: 24, status: "Low Battery", location: "West Station" }
  ]
};

const EnhancedDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Simulate loading data
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Function to render different badge styles
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case "Charging":
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Charging</Badge>;
      case "In Use":
        return <Badge className="bg-green-100 text-green-800 border border-green-200">In Use</Badge>;
      case "Available":
        return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">Available</Badge>;
      case "Low Battery":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Low Battery</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{status}</Badge>;
    }
  };
  
  // Function to render alert badge style
  const renderAlertBadge = (level: string) => {
    switch(level) {
      case "error":
        return <Badge className="bg-red-100 text-red-800 border border-red-200">Error</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Warning</Badge>;
      case "success":
        return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">Success</Badge>;
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Info</Badge>;
      default:
        return null;
    }
  };
  
  // Function to render alert icon
  const renderAlertIcon = (level: string) => {
    switch(level) {
      case "error":
        return <div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="h-4 w-4 text-red-600" /></div>;
      case "warning":
        return <div className="p-2 bg-amber-100 rounded-full"><AlertTriangle className="h-4 w-4 text-amber-600" /></div>;
      case "success":
        return <div className="p-2 bg-emerald-100 rounded-full"><CheckCircle className="h-4 w-4 text-emerald-600" /></div>;
      case "info":
        return <div className="p-2 bg-blue-100 rounded-full"><RefreshCw className="h-4 w-4 text-blue-600" /></div>;
      default:
        return null;
    }
  };
  
  // Render battery level with appropriate color
  const renderBatteryLevel = (level: number) => {
    let color = 'text-green-500';
    if (level < 30) color = 'text-red-500';
    else if (level < 60) color = 'text-amber-500';
    
    return <span className={color}>{level}%</span>;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 skeleton-loader mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton-loader rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="h-64 skeleton-loader rounded-lg"></div>
          <div className="h-64 skeleton-loader rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-grid-blue">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold gradient-text">Enhanced Fleet Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={refreshing}
            className="bg-white"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d card-premium">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                <h3 className="text-2xl font-bold mt-1">{mockData.totalVehicles}</h3>
                <p className="text-xs text-gray-500 mt-1">{mockData.activeVehicles} active</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full float-animation-slow">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d card-premium">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Charging Stations</p>
                <h3 className="text-2xl font-bold mt-1">{mockData.totalStations}</h3>
                <p className="text-xs text-gray-500 mt-1">{mockData.activeStations} active</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full float-animation">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d card-premium">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Energy Used</p>
                <h3 className="text-2xl font-bold mt-1">{mockData.energyUsed.value.toLocaleString()} {mockData.energyUsed.unit}</h3>
                <p className="text-xs flex items-center mt-1">
                  {mockData.energyUsed.increasing ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={mockData.energyUsed.increasing ? "text-green-500" : "text-red-500"}>
                    {mockData.energyUsed.trend}%
                  </span>
                  <span className="text-gray-500 ml-1">vs. last week</span>
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full float-animation-slow">
                <Fuel className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-3d card-premium">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">CO2 Reduced</p>
                <h3 className="text-2xl font-bold mt-1">{mockData.co2Reduced.value.toLocaleString()} {mockData.co2Reduced.unit}</h3>
                <p className="text-xs flex items-center mt-1">
                  {mockData.co2Reduced.increasing ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={mockData.co2Reduced.increasing ? "text-green-500" : "text-red-500"}>
                    {mockData.co2Reduced.trend}%
                  </span>
                  <span className="text-gray-500 ml-1">vs. last week</span>
                </p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-full float-animation">
                <span className="h-5 w-5 text-emerald-600 flex items-center justify-center font-bold">🌿</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status */}
        <Card className="card-premium overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Vehicle Status</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {mockData.vehicles.map(vehicle => (
                <div key={vehicle.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${
                        vehicle.batteryLevel < 30 ? 'bg-red-100' : 
                        vehicle.batteryLevel < 60 ? 'bg-amber-100' : 'bg-green-100'
                      }`}>
                        <Battery className={`h-5 w-5 ${
                          vehicle.batteryLevel < 30 ? 'text-red-600' : 
                          vehicle.batteryLevel < 60 ? 'text-amber-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{vehicle.id}</h3>
                        <div className="flex items-center text-gray-500 text-xs mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {vehicle.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {renderStatusBadge(vehicle.status)}
                      <div className="text-sm mt-1">
                        Battery: {renderBatteryLevel(vehicle.batteryLevel)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* System Alerts */}
        <Card className="card-premium overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {mockData.alerts.map(alert => (
                <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {renderAlertIcon(alert.level)}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{alert.message}</p>
                        {renderAlertBadge(alert.level)}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Usage Analytics Preview */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 glass-effect">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Usage Analytics</h2>
          <Button variant="outline" size="sm" className="bg-white">View Details</Button>
        </div>
        
        <div className="flex items-center justify-center h-52 text-gray-400 animated-border rounded-lg p-6">
          <div className="text-center">
            <BarChart className="h-12 w-12 mx-auto mb-2 text-blue-500 opacity-50" />
            <p>Analytics visualization would appear here</p>
            <p className="text-sm text-gray-500">Click "View Details" for full reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard; 
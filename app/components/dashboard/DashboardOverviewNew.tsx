/// <reference path="../../types/react.d.ts" />
"use client";

import React from 'react';
import { 
  Activity, Battery, Zap, Car, AlertCircle, 
  AlertTriangle, AlertOctagon, MapPin, ArrowUp, 
  ArrowDown, Search, Filter, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Components
import KPISummary from './KPISummary';
import FleetMapComponent from './FleetMapComponent';
import RecentAlerts from './RecentAlerts';
import QuickStats from './QuickStats';
import VehicleSummary from './VehicleSummary';

// Mock data
import { 
  fleetSummary, 
  vehicleStatusData, 
  socDistributionData, 
  chargingSessionsData, 
  alertsData,
  vehicleLocations,
  chargingStations,
  batteryHealthData,
  driverEfficiencyData,
  vehicleData
} from '../../constants/dashboard';

const DashboardOverviewNew: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('day' as 'day' | 'week' | 'month');
  const [mapView, setMapView] = React.useState('all' as 'all' | 'vehicles' | 'stations');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fleet Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive overview of your EV fleet performance and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </Button>
        </div>
      </div>
      
      {/* KPI Summary */}
      <KPISummary data={fleetSummary} />
      
      {/* Interactive Fleet Map */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <div className="flex justify-between items-center">
            <CardTitle>Fleet Map</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={mapView === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMapView('all')}
              >
                All
              </Button>
              <Button 
                variant={mapView === 'vehicles' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMapView('vehicles')}
              >
                Vehicles
              </Button>
              <Button 
                variant={mapView === 'stations' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMapView('stations')}
              >
                Charging Stations
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px]">
            <FleetMapComponent 
              vehicles={vehicleLocations}
              stations={chargingStations}
              viewMode={mapView}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Two-column layout for Alerts and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="md:col-span-1">
          <RecentAlerts alerts={alertsData} />
        </div>
        
        {/* Quick Stats */}
        <div className="md:col-span-2">
          <QuickStats 
            batteryHealthData={batteryHealthData}
            energyConsumptionData={chargingSessionsData}
            driverEfficiencyData={driverEfficiencyData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            stats={{
              totalVehicles: fleetSummary.totalVehicles,
              activeVehicles: 24,
              totalDistance: 1250,
              energyConsumed: fleetSummary.energyConsumed.value
            }}
          />
        </div>
      </div>
      
      {/* Vehicle Summary */}
      <VehicleSummary vehicles={vehicleData} />
      
      {/* Action Links */}
      <div className="flex justify-between items-center mt-6">
        <Link href="/reports" className="text-sm font-medium text-primary hover:underline flex items-center">
          View Detailed Reports
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            Download Dashboard Data
          </Button>
          <Button size="sm">
            Configure Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewNew; 
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  MapPin, 
  BatteryCharging, 
  Calendar, 
  Clock, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap, 
  BarChart,
  Edit,
  Car,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Progress } from '../../../components/ui/progress';

// Mock station data
const getStationData = (id) => {
  return {
    id,
    name: "Headquarters Station 3",
    location: "Main Campus Building A",
    coordinates: "37.7749,-122.4194",
    status: "active",
    lastMaintenance: "2023-08-15",
    nextMaintenance: "2023-11-15",
    installDate: "2022-05-10",
    model: "PowerCharge Pro 350",
    manufacturer: "ElectroFlow",
    firmwareVersion: "v4.2.1",
    connectorTypes: ["CCS", "CHAdeMO"],
    maxPower: 350,
    totalPorts: 4,
    availablePorts: 2,
    totalEnergy: 4582.3, // kWh delivered
    chargingSessions: 312,
    uptime: 98.7,
    maintenanceLog: [
      {
        date: "2023-08-15",
        type: "Routine Inspection",
        technician: "John Doe",
        notes: "All systems operational. Cleaned connectors."
      },
      {
        date: "2023-06-03",
        type: "Repair",
        technician: "Sarah Smith",
        notes: "Replaced display screen after damage from weather event."
      },
      {
        date: "2023-02-20",
        type: "Firmware Update",
        technician: "Remote Update",
        notes: "Updated to firmware v4.2.0."
      }
    ],
    activeCharging: [
      {
        port: 1,
        vehicleId: "V-1234",
        vehicleName: "Fleet Van 03",
        startTime: "10:30 AM",
        duration: "45 min",
        energyDelivered: 32.5,
        batteryLevel: 78
      },
      {
        port: 3,
        vehicleId: "V-5678",
        vehicleName: "Delivery Truck 12",
        startTime: "11:15 AM",
        duration: "20 min",
        energyDelivered: 18.2,
        batteryLevel: 42
      }
    ]
  };
};

export default function StationDetailPage({ params }) {
  const stationId = params.id;
  const station = getStationData(stationId);
  const [activeTab, setActiveTab] = React.useState('overview');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/ev-management/stations" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Station Details</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{station.name}</h2>
            <Badge 
              className={`w-fit ${
                station.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : station.status === 'maintenance' 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {station.status === 'active' ? 'Operational' : station.status === 'maintenance' ? 'In Maintenance' : 'Offline'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="h-4 w-4" />
            <span>{station.location}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            asChild
          >
            <Link href={`/ev-management/stations/${stationId}/edit`}>
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Station</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 sm:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charging">Charging</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Key Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Station Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.model}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.manufacturer}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Installation Date</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.installDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Firmware</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.firmwareVersion}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Power</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.maxPower} kW</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Connector Types</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">{station.connectorTypes.join(", ")}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Port Status */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ports Available</span>
                      <span className="text-sm font-semibold">{station.availablePorts} of {station.totalPorts}</span>
                    </div>
                    <Progress value={(station.availablePorts / station.totalPorts) * 100} className="h-2" />
                  </div>
                  
                  {/* Uptime */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</span>
                      <span className="text-sm font-semibold">{station.uptime}%</span>
                    </div>
                    <Progress value={station.uptime} className="h-2" />
                  </div>
                  
                  {/* Maintenance Status */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Next Maintenance</span>
                      </div>
                      <span className="text-sm">{station.nextMaintenance}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Last Maintenance</span>
                      </div>
                      <span className="text-sm">{station.lastMaintenance}</span>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <span>Remote Restart</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <span>Diagnostics</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Energy</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                        <Zap className="h-4 w-4" />
                        {station.totalEnergy.toLocaleString()} kWh
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sessions</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                        <BatteryCharging className="h-4 w-4" />
                        {station.chargingSessions}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm font-medium mb-2">Port Utilization</div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {Math.round(((station.totalPorts - station.availablePorts) / station.totalPorts) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded bg-blue-200 text-xs">
                        <div style={{ width: `${((station.totalPorts - station.availablePorts) / station.totalPorts) * 100}%` }} className="flex flex-col justify-center whitespace-nowrap bg-blue-600 shadow-none text-center text-white"></div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <BarChart className="h-4 w-4 mr-2" />
                    <span>View Detailed Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Charging Sessions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Active Charging Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {station.activeCharging.map((session, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Port {session.port}</div>
                        <div className="font-medium">{session.vehicleName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{session.vehicleId}</div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Battery Level</span>
                          <span className="font-medium">{session.batteryLevel}%</span>
                        </div>
                        <Progress value={session.batteryLevel} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Start Time</div>
                          <div className="font-medium">{session.startTime}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Duration</div>
                          <div className="font-medium">{session.duration}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Energy</div>
                          <div className="font-medium">{session.energyDelivered} kWh</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty port cards */}
              {Array(station.totalPorts - station.activeCharging.length).fill(0).map((_, index) => (
                <Card key={`empty-${index}`} className="border-dashed">
                  <CardContent className="p-4 flex items-center justify-center h-[200px] text-center">
                    <div>
                      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <BatteryCharging className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                      </div>
                      <div className="mt-4 text-gray-500 dark:text-gray-400">
                        <div className="font-medium">Port {station.activeCharging.length + index + 1}</div>
                        <div className="text-sm mt-1">Available</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row justify-between">
              <CardTitle className="text-lg">Maintenance History</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={`/ev-management/stations/maintenance`}>
                  <span>Schedule Maintenance</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 before:absolute before:top-0 before:left-2 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                {station.maintenanceLog.map((log, index) => (
                  <div key={index} className="relative mb-6 last:mb-0">
                    <div className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                      {log.type.includes('Repair') ? (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      ) : log.type.includes('Firmware') ? (
                        <Settings className="h-3 w-3 text-blue-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.type}</div>
                        <div className="text-sm text-gray-500">{log.date}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {log.notes}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Technician: {log.technician}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="charging" className="mt-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Charging History</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Detailed charging history and statistics.
            </p>
            <Button className="mt-4">Load Charging Data</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Station Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Usage patterns, energy metrics, and performance trends.
            </p>
            <Button className="mt-4">View Analytics</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
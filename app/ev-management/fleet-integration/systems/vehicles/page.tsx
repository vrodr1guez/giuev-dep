"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, Car, Battery, Calendar, Clock, Filter,
  Download, Search, Plus, ChevronDown, Zap,
  CheckCircle, AlertCircle, Settings, RefreshCw,
  MapPin, User, Wrench, Shield, BarChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Progress } from '../../../../components/ui/progress';

export default function FleetIntegrationVehiclesPage() {
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Sample data for connected fleet systems
  const fleetSystems = [
    { id: '1', name: 'GIU Fleet Management', connectedVehicles: 48 },
    { id: '2', name: 'RouteOptimizer Pro', connectedVehicles: 36 },
    { id: '3', name: 'Maintenance Plus', connectedVehicles: 48 },
    { id: '4', name: 'Driver Portal', connectedVehicles: 42 }
  ];

  // Sample vehicle data with more detailed and realistic attributes
  const vehicles = [
    {
      id: 'V-2024-103',
      name: 'Tesla Model Y',
      regNumber: 'EV-2023-001',
      fleetSystem: 'GIU Fleet Management',
      systemId: '1',
      status: 'Active',
      batteryLevel: 72,
      range: 189,
      lastSync: '10 minutes ago',
      nextService: '2024-08-15',
      driverAssigned: 'Thomas Johnson',
      driverId: 'D-0045',
      location: 'Headquarters Parking',
      coordinates: '47.6205° N, 122.3493° W',
      mileage: 12450,
      lastCharged: '2 hours ago',
      image: '/vehicles/tesla-model-y.jpg',
      make: 'Tesla',
      model: 'Model Y',
      year: 2023,
      vin: '5YJ3E1EA8KF123456',
      batteryCapacity: '75 kWh',
      maxRange: 330,
      chargingRate: '250 kW',
      routeAssigned: 'Downtown Loop'
    },
    {
      id: 'V-2024-085',
      name: 'Tesla Model 3',
      regNumber: 'EV-2023-002',
      fleetSystem: 'RouteOptimizer Pro',
      systemId: '2',
      status: 'Charging',
      batteryLevel: 45,
      range: 118,
      lastSync: '5 minutes ago',
      nextService: '2024-10-22',
      driverAssigned: 'Laura Smith',
      driverId: 'D-0036',
      location: 'Charging Station 2',
      coordinates: '47.6240° N, 122.3510° W',
      mileage: 28310,
      lastCharged: 'In Progress',
      image: '/vehicles/tesla-model-3.jpg',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      vin: '5YJ3E1EA7PF789012',
      batteryCapacity: '82 kWh',
      maxRange: 358,
      chargingRate: '250 kW',
      routeAssigned: 'Airport Shuttle'
    },
    {
      id: 'V-2024-127',
      name: 'Ford F-150 Lightning',
      regNumber: 'EV-2023-003',
      fleetSystem: 'Maintenance Plus',
      systemId: '3',
      status: 'Maintenance',
      batteryLevel: 100,
      range: 320,
      lastSync: '2 hours ago',
      nextService: 'In Progress',
      driverAssigned: 'Unassigned',
      driverId: 'N/A',
      location: 'Service Center',
      coordinates: '47.6150° N, 122.3550° W',
      mileage: 8120,
      lastCharged: '1 day ago',
      image: '/vehicles/ford-f150.jpg',
      make: 'Ford',
      model: 'F-150 Lightning',
      year: 2023,
      vin: '1FTEW1EP7NFA34567',
      batteryCapacity: '131 kWh',
      maxRange: 320,
      chargingRate: '150 kW',
      routeAssigned: 'North Delivery Route'
    },
    {
      id: 'V-2024-092',
      name: 'Rivian R1T',
      regNumber: 'EV-2023-004',
      fleetSystem: 'GIU Fleet Management',
      systemId: '1',
      status: 'Active',
      batteryLevel: 81,
      range: 255,
      lastSync: '15 minutes ago',
      nextService: '2024-07-05',
      driverAssigned: 'Robert Stevens',
      driverId: 'D-0078',
      location: 'Distribution Center',
      coordinates: '47.6180° N, 122.3590° W',
      mileage: 5640,
      lastCharged: '8 hours ago',
      image: '/vehicles/rivian-r1t.jpg',
      make: 'Rivian',
      model: 'R1T',
      year: 2023,
      vin: '7FCTB1918NA890123',
      batteryCapacity: '135 kWh',
      maxRange: 314,
      chargingRate: '200 kW',
      routeAssigned: 'Mountain Delivery Route'
    },
    {
      id: 'V-2024-118',
      name: 'Chevrolet Bolt',
      regNumber: 'EV-2022-011',
      fleetSystem: 'Driver Portal',
      systemId: '4',
      status: 'Issue',
      batteryLevel: 23,
      range: 52,
      lastSync: '4 hours ago',
      nextService: '2024-06-12',
      driverAssigned: 'Michael Thompson',
      driverId: 'D-0023',
      location: 'Route 33',
      coordinates: '47.6100° N, 122.3420° W',
      mileage: 32180,
      lastCharged: '2 days ago',
      image: '/vehicles/chevy-bolt.jpg',
      make: 'Chevrolet',
      model: 'Bolt',
      year: 2022,
      vin: '1G1FZ6S01N4123456',
      batteryCapacity: '65 kWh',
      maxRange: 259,
      chargingRate: '55 kW',
      routeAssigned: 'City Center Route'
    },
    {
      id: 'V-2024-076',
      name: 'Volkswagen ID.4',
      regNumber: 'EV-2023-018',
      fleetSystem: 'RouteOptimizer Pro',
      systemId: '2',
      status: 'Active',
      batteryLevel: 65,
      range: 180,
      lastSync: '18 minutes ago',
      nextService: '2024-09-25',
      driverAssigned: 'Jennifer Lee',
      driverId: 'D-0051',
      location: 'East Delivery Hub',
      coordinates: '47.6290° N, 122.3380° W',
      mileage: 15730,
      lastCharged: '12 hours ago',
      image: '/vehicles/vw-id4.jpg',
      make: 'Volkswagen',
      model: 'ID.4',
      year: 2023,
      vin: 'WVWZZZE1ZNP567890',
      batteryCapacity: '82 kWh',
      maxRange: 275,
      chargingRate: '125 kW',
      routeAssigned: 'East Side Loop'
    },
    {
      id: 'V-2024-089',
      name: 'Hyundai IONIQ 5',
      regNumber: 'EV-2023-027',
      fleetSystem: 'Maintenance Plus',
      systemId: '3',
      status: 'Active',
      batteryLevel: 92,
      range: 270,
      lastSync: '7 minutes ago',
      nextService: '2024-08-05',
      driverAssigned: 'David Rodriguez',
      driverId: 'D-0067',
      location: 'South Depot',
      coordinates: '47.5980° N, 122.3320° W',
      mileage: 9845,
      lastCharged: '5 hours ago',
      image: '/vehicles/hyundai-ioniq5.jpg',
      make: 'Hyundai',
      model: 'IONIQ 5',
      year: 2023,
      vin: 'KMHLB4AB8PU234567',
      batteryCapacity: '77.4 kWh',
      maxRange: 303,
      chargingRate: '350 kW',
      routeAssigned: 'South Commercial Route'
    },
    {
      id: 'V-2024-104',
      name: 'Kia EV6',
      regNumber: 'EV-2023-032',
      fleetSystem: 'Driver Portal',
      systemId: '4',
      status: 'Charging',
      batteryLevel: 38,
      range: 98,
      lastSync: '4 minutes ago',
      nextService: '2024-11-18',
      driverAssigned: 'Sarah Johnson',
      driverId: 'D-0032',
      location: 'West Charging Hub',
      coordinates: '47.6185° N, 122.3720° W',
      mileage: 18320,
      lastCharged: 'In Progress',
      image: '/vehicles/kia-ev6.jpg',
      make: 'Kia',
      model: 'EV6',
      year: 2023,
      vin: 'KNDC1DLC1P5678901',
      batteryCapacity: '77.4 kWh',
      maxRange: 310,
      chargingRate: '350 kW',
      routeAssigned: 'West Commercial Route'
    }
  ];

  // Filter vehicles based on selected system, status, and search query
  const filteredVehicles = vehicles.filter(vehicle => {
    // Filter by fleet system
    if (selectedSystem !== 'all' && vehicle.systemId !== selectedSystem) {
      return false;
    }
    
    // Filter by status
    if (filterStatus !== 'all' && vehicle.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.regNumber.toLowerCase().includes(query) ||
        vehicle.driverAssigned.toLowerCase().includes(query) ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort vehicles based on selected sort criteria
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'battery':
        return b.batteryLevel - a.batteryLevel;
      case 'lastSync':
        // This is a simplification; in a real app, you'd convert dates to timestamps
        return a.lastSync.localeCompare(b.lastSync);
      default:
        return 0;
    }
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch(status.toLowerCase()) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'charging':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Zap className="h-3 w-3 mr-1" />
            Charging
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Wrench className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case 'issue':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Issue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/ev-management/fleet-integration" className="flex items-center hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Fleet Integration
        </Link>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Connected Vehicles</h1>
          <p className="text-gray-600">View and manage vehicles synchronized from fleet management systems</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="inline-flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Sync Vehicles</span>
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fleet System
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
            >
              <option value="all">All Systems ({vehicles.length})</option>
              {fleetSystems.map(system => (
                <option key={system.id} value={system.id}>
                  {system.name} ({system.connectedVehicles})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 bottom-3 h-4 w-4 text-gray-400" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="charging">Charging</option>
              <option value="maintenance">Maintenance</option>
              <option value="issue">Issues</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Vehicle Name</option>
              <option value="status">Status</option>
              <option value="battery">Battery Level</option>
              <option value="lastSync">Last Sync</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                placeholder="Search by name, ID, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sortedVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">{vehicle.name}</CardTitle>
                  <div className="text-sm text-gray-500 mb-1">{vehicle.regNumber} • {vehicle.make} {vehicle.model}</div>
                  <StatusBadge status={vehicle.status} />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Fleet System</div>
                  <div className="text-sm text-gray-500">{vehicle.fleetSystem}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Battery className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Battery:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress className="w-24 h-2" value={vehicle.batteryLevel} />
                    <span className="font-semibold">{vehicle.batteryLevel}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Car className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Range:</span>
                  </div>
                  <span className="font-semibold">{vehicle.range} miles</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Location:</span>
                  </div>
                  <span className="font-semibold">{vehicle.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Driver:</span>
                  </div>
                  <span className="font-semibold">{vehicle.driverAssigned}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Next Service:</span>
                  </div>
                  <span className="font-semibold">{vehicle.nextService}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Last Sync:</span>
                  </div>
                  <span className="font-semibold">{vehicle.lastSync}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link 
                  href={`/vehicles/${vehicle.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </Link>
                <Button variant="outline" size="sm" className="h-8">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Fleet Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <div className="text-sm text-gray-600">Total Vehicles</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {vehicles.filter(v => v.status.toLowerCase() === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Vehicles</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {vehicles.filter(v => v.status.toLowerCase() === 'maintenance').length}
              </div>
              <div className="text-sm text-gray-600">In Maintenance</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {vehicles.filter(v => v.status.toLowerCase() === 'issue').length}
              </div>
              <div className="text-sm text-gray-600">Issues Reported</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
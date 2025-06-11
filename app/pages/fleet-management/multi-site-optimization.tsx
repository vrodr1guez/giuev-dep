'use client';

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  BarChart,
  Battery,
  Home as Building,
  Calendar as CalendarClock,
  Car,
  ChevronDown,
  Clock,
  Download,
  MapPin as LocateFixed,
  Map,
  MapPin,
  Globe as Network,
  RefreshCw as RefreshCcw,
  Settings,
  ExternalLink as Share2,
  Zap,
  TrendingUp,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle,
  Tooltip
} from 'react-leaflet';

// This would be a dynamic import in a real Next.js app for SSR compatibility
// import dynamic from 'next/dynamic';
// const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
// const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
// const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
// const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

interface ChargingHub {
  id: string;
  name: string;
  location: [number, number]; // [latitude, longitude]
  capacity: number; // kW
  currentLoad: number; // kW
  availableConnectors: number;
  totalConnectors: number;
  energyPrice: number; // $/kWh
  renewablePercentage: number;
  vehicles: VehicleAtSite[];
}

interface VehicleAtSite {
  id: string;
  name: string;
  licensePlate: string;
  currentSoC: number;
  targetSoC: number;
  pluggedIn: boolean;
  chargingPower?: number;
  estimatedCompletion?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChargingRecommendation {
  vehicleId: string;
  currentSite: string;
  recommendedSite: string;
  currentPrice: number;
  recommendedPrice: number;
  savings: number;
  distance: number; // km to recommended site
  estimatedTravelTime: number; // minutes to recommended site
}

const MultiSiteOptimizationPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chargingHubs, setChargingHubs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // NYC default
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real app, fetch this data from the API
    const mockChargingHubs: ChargingHub[] = [
      {
        id: 'hub1',
        name: 'Downtown Charging Hub',
        location: [40.7128, -74.0060], // New York City coordinates
        capacity: 500,
        currentLoad: 320,
        availableConnectors: 8,
        totalConnectors: 15,
        energyPrice: 0.18,
        renewablePercentage: 35,
        vehicles: [
          {
            id: 'v1',
            name: 'Tesla Model Y',
            licensePlate: 'ABC123',
            currentSoC: 45,
            targetSoC: 90,
            pluggedIn: true,
            chargingPower: 50,
            estimatedCompletion: '14:30',
            priority: 'high'
          },
          {
            id: 'v2',
            name: 'Ford F-150 Lightning',
            licensePlate: 'XYZ789',
            currentSoC: 22,
            targetSoC: 80,
            pluggedIn: true,
            chargingPower: 75,
            estimatedCompletion: '15:45',
            priority: 'medium'
          },
          {
            id: 'v3',
            name: 'Chevrolet Bolt',
            licensePlate: 'DEF456',
            currentSoC: 78,
            targetSoC: 85,
            pluggedIn: false,
            priority: 'low'
          }
        ]
      },
      {
        id: 'hub2',
        name: 'Suburban Depot',
        location: [40.7282, -74.0776], // NJ coordinates
        capacity: 750,
        currentLoad: 180,
        availableConnectors: 12,
        totalConnectors: 20,
        energyPrice: 0.14,
        renewablePercentage: 60,
        vehicles: [
          {
            id: 'v4',
            name: 'Rivian R1T',
            licensePlate: 'GHI789',
            currentSoC: 15,
            targetSoC: 90,
            pluggedIn: true,
            chargingPower: 110,
            estimatedCompletion: '16:30',
            priority: 'high'
          },
          {
            id: 'v5',
            name: 'Hyundai Ioniq 5',
            licensePlate: 'JKL012',
            currentSoC: 55,
            targetSoC: 85,
            pluggedIn: true,
            chargingPower: 70,
            estimatedCompletion: '13:15',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'hub3',
        name: 'Airport Fleet Hub',
        location: [40.6413, -73.7781], // JFK Airport coordinates
        capacity: 1000,
        currentLoad: 720,
        availableConnectors: 4,
        totalConnectors: 25,
        energyPrice: 0.22,
        renewablePercentage: 28,
        vehicles: [
          {
            id: 'v6',
            name: 'Tesla Model 3',
            licensePlate: 'MNO345',
            currentSoC: 30,
            targetSoC: 80,
            pluggedIn: true,
            chargingPower: 48,
            estimatedCompletion: '17:00',
            priority: 'medium'
          },
          {
            id: 'v7',
            name: 'VW ID.4',
            licensePlate: 'PQR678',
            currentSoC: 62,
            targetSoC: 95,
            pluggedIn: true,
            chargingPower: 37,
            estimatedCompletion: '14:45',
            priority: 'low'
          },
          {
            id: 'v8',
            name: 'Nissan Leaf',
            licensePlate: 'STU901',
            currentSoC: 25,
            targetSoC: 85,
            pluggedIn: false,
            priority: 'high'
          }
        ]
      },
      {
        id: 'hub4',
        name: 'Solar-powered Hub',
        location: [40.8448, -73.8648], // Bronx coordinates
        capacity: 400,
        currentLoad: 90,
        availableConnectors: 9,
        totalConnectors: 12,
        energyPrice: 0.12,
        renewablePercentage: 90,
        vehicles: [
          {
            id: 'v9',
            name: 'Tesla Model X',
            licensePlate: 'VWX234',
            currentSoC: 40,
            targetSoC: 90,
            pluggedIn: true,
            chargingPower: 60,
            estimatedCompletion: '13:30',
            priority: 'medium'
          }
        ]
      }
    ];
    
    setChargingHubs(mockChargingHubs);
    
    // Mock recommendations for relocating vehicles
    const mockRecommendations: ChargingRecommendation[] = [
      {
        vehicleId: 'v6',
        currentSite: 'hub3',
        recommendedSite: 'hub4',
        currentPrice: 0.22,
        recommendedPrice: 0.12,
        savings: 7.50,
        distance: 12.5,
        estimatedTravelTime: 18
      },
      {
        vehicleId: 'v3',
        currentSite: 'hub1',
        recommendedSite: 'hub2',
        currentPrice: 0.18,
        recommendedPrice: 0.14,
        savings: 2.80,
        distance: 8.7,
        estimatedTravelTime: 14
      },
      {
        vehicleId: 'v2',
        currentSite: 'hub1',
        recommendedSite: 'hub4',
        currentPrice: 0.18,
        recommendedPrice: 0.12,
        savings: 9.36,
        distance: 15.3,
        estimatedTravelTime: 25
      }
    ];
    
    setRecommendations(mockRecommendations);
  }, []);
  
  // Get vehicle details by ID
  const getVehicleById = (vehicleId: string) => {
    for (const hub of chargingHubs) {
      const vehicle = hub.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        return { vehicle, hub };
      }
    }
    return null;
  };
  
  // Get hub by ID
  const getHubById = (hubId: string) => {
    return chargingHubs.find(hub => hub.id === hubId) || null;
  };
  
  // Generate load color based on current load vs capacity
  const getLoadColor = (currentLoad: number, capacity: number) => {
    const loadPercent = (currentLoad / capacity) * 100;
    if (loadPercent < 50) return 'text-green-500';
    if (loadPercent < 80) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Generate circle color for the map based on site load
  const getCircleColor = (currentLoad: number, capacity: number) => {
    const loadPercent = (currentLoad / capacity) * 100;
    if (loadPercent < 50) return 'green';
    if (loadPercent < 80) return 'orange';
    return 'red';
  };
  
  // Simulate generating multi-site optimization recommendations
  const generateRecommendations = () => {
    setIsLoading(true);
    
    // In a real app, this would call an API
    setTimeout(() => {
      // For the demo, we'll just use the existing recommendations
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Multi-site Fleet Management</h1>
          <p className="text-muted-foreground max-w-3xl">
            Optimize EV charging across multiple locations based on energy prices, grid load, and vehicle needs
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => generateRecommendations()}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Refresh'}
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Network className="h-4 w-4" />
            Optimize Fleet
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charging-hubs">Charging Hubs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    {chargingHubs.length}
                  </div>
                  <Building className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {chargingHubs.reduce((sum, hub) => sum + hub.totalConnectors, 0)} total connectors
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vehicles Charging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    {chargingHubs.reduce((sum, hub) => sum + hub.vehicles.filter(v => v.pluggedIn).length, 0)}
                  </div>
                  <Battery className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {chargingHubs.reduce((sum, hub) => sum + hub.vehicles.length, 0)} total vehicles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    {chargingHubs.reduce((sum, hub) => sum + hub.capacity - hub.currentLoad, 0)} kW
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {chargingHubs.reduce((sum, hub) => sum + hub.availableConnectors, 0)} available connectors
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    {recommendations.length}
                  </div>
                  <BarChart className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toFixed(2)} potential savings
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Charging Hub Network</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] relative">
                <div className="absolute inset-0">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={11} 
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {chargingHubs.map(hub => (
                      <React.Fragment key={hub.id}>
                        <Marker 
                          position={hub.location}
                          eventHandlers={{
                            click: () => setSelectedSite(hub.id)
                          }}
                        >
                          <Popup>
                            <div className="p-1">
                              <h3 className="font-bold">{hub.name}</h3>
                              <p className="text-sm">
                                {hub.availableConnectors} of {hub.totalConnectors} connectors available
                              </p>
                              <p className="text-sm">
                                ${hub.energyPrice.toFixed(2)}/kWh &bull; {hub.renewablePercentage}% renewable
                              </p>
                              <p className="text-sm mt-1">
                                <span className={getLoadColor(hub.currentLoad, hub.capacity)}>
                                  {hub.currentLoad} kW
                                </span> 
                                / {hub.capacity} kW capacity
                              </p>
                            </div>
                          </Popup>
                          <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
                            {hub.name}
                          </Tooltip>
                        </Marker>
                        
                        <Circle 
                          center={hub.location} 
                          radius={500} 
                          pathOptions={{ 
                            fillColor: getCircleColor(hub.currentLoad, hub.capacity),
                            fillOpacity: 0.3,
                            color: getCircleColor(hub.currentLoad, hub.capacity),
                            weight: 1
                          }} 
                        />
                      </React.Fragment>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hub Status</CardTitle>
                  
                  <Select 
                    value={selectedSite || ''} 
                    onValueChange={(value) => setSelectedSite(value || null)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select hub" />
                    </SelectTrigger>
                    <SelectContent>
                      {chargingHubs.map(hub => (
                        <SelectItem key={hub.id} value={hub.id}>
                          {hub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {selectedSite ? (
                  <div className="space-y-4">
                    {(() => {
                      const hub = getHubById(selectedSite);
                      if (!hub) return <p>Hub not found</p>;
                      
                      return (
                        <>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{hub.name}</p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">Current Load</p>
                            <p className="font-medium">
                              <span className={getLoadColor(hub.currentLoad, hub.capacity)}>
                                {hub.currentLoad} kW
                              </span> 
                              <span className="text-muted-foreground"> / {hub.capacity} kW</span>
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">Energy Price</p>
                            <p className="font-medium">
                              ${hub.energyPrice.toFixed(2)}/kWh
                              <span className="text-sm text-muted-foreground ml-2">
                                ({hub.renewablePercentage}% renewable)
                              </span>
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">Connectors</p>
                            <p className="font-medium">
                              {hub.availableConnectors} available / {hub.totalConnectors} total
                            </p>
                          </div>
                          
                          <hr className="my-2" />
                          
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">Vehicles at this location</p>
                            
                            {hub.vehicles.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No vehicles at this location</p>
                            ) : (
                              <div className="space-y-2 mt-1">
                                {hub.vehicles.map(vehicle => (
                                  <div 
                                    key={vehicle.id} 
                                    className="flex justify-between items-center bg-slate-100 p-2 rounded-md"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Car className="h-4 w-4 text-slate-600" />
                                      <div>
                                        <p className="text-sm font-medium">{vehicle.name}</p>
                                        <p className="text-xs text-slate-500">{vehicle.licensePlate}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">
                                        {vehicle.currentSoC}% → {vehicle.targetSoC}%
                                      </p>
                                      {vehicle.pluggedIn && (
                                        <p className="text-xs text-green-600">
                                          {vehicle.chargingPower} kW
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">Select a charging hub to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charging-hubs" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Hub</th>
                      <th className="text-center py-3 px-4">Energy Price</th>
                      <th className="text-center py-3 px-4">Renewable %</th>
                      <th className="text-center py-3 px-4">Load</th>
                      <th className="text-center py-3 px-4">Connectors</th>
                      <th className="text-center py-3 px-4">Vehicles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargingHubs.map(hub => (
                      <tr key={hub.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-slate-600" />
                            <div>
                              <p className="font-medium">{hub.name}</p>
                              <p className="text-xs text-gray-500">{hub.location[0].toFixed(2)}, {hub.location[1].toFixed(2)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <p className="font-medium">${hub.energyPrice.toFixed(2)}/kWh</p>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              {hub.renewablePercentage}%
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <p className="font-medium">
                            <span className={getLoadColor(hub.currentLoad, hub.capacity)}>
                              {hub.currentLoad} kW
                            </span>
                            <span className="text-muted-foreground"> / {hub.capacity} kW</span>
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                hub.currentLoad / hub.capacity < 0.5 
                                  ? 'bg-green-500' 
                                  : hub.currentLoad / hub.capacity < 0.8 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${(hub.currentLoad / hub.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <p className="font-medium">{hub.availableConnectors} / {hub.totalConnectors}</p>
                          <p className="text-xs text-gray-500">available</p>
                        </td>
                        <td className="text-center py-3 px-4">
                          <p className="font-medium">{hub.vehicles.filter(v => v.pluggedIn).length} / {hub.vehicles.length}</p>
                          <p className="text-xs text-gray-500">plugged in</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Charging Location Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    The system found {recommendations.length} opportunities to optimize charging by relocating vehicles to different sites.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Vehicle</th>
                          <th className="text-center py-3 px-4">Current Site</th>
                          <th className="text-center py-3 px-4">Recommended Site</th>
                          <th className="text-center py-3 px-4">Distance</th>
                          <th className="text-center py-3 px-4">Price Difference</th>
                          <th className="text-center py-3 px-4">Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.map(recommendation => {
                          const vehicleInfo = getVehicleById(recommendation.vehicleId);
                          const currentHub = getHubById(recommendation.currentSite);
                          const recommendedHub = getHubById(recommendation.recommendedSite);
                          
                          if (!vehicleInfo || !currentHub || !recommendedHub) return null;
                          
                          return (
                            <tr key={recommendation.vehicleId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Car className="h-5 w-5 text-slate-600" />
                                  <div>
                                    <p className="font-medium">{vehicleInfo.vehicle.name}</p>
                                    <p className="text-xs text-gray-500">{vehicleInfo.vehicle.licensePlate}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-3 px-4">
                                <p className="font-medium">{currentHub.name}</p>
                                <p className="text-xs text-gray-500">${currentHub.energyPrice.toFixed(2)}/kWh</p>
                              </td>
                              <td className="text-center py-3 px-4">
                                <p className="font-medium">{recommendedHub.name}</p>
                                <p className="text-xs text-green-600">${recommendedHub.energyPrice.toFixed(2)}/kWh</p>
                              </td>
                              <td className="text-center py-3 px-4">
                                <p className="font-medium">{recommendation.distance.toFixed(1)} km</p>
                                <p className="text-xs text-gray-500">{recommendation.estimatedTravelTime} min</p>
                              </td>
                              <td className="text-center py-3 px-4">
                                <p className="font-medium text-green-600">
                                  ${(recommendation.currentPrice - recommendation.recommendedPrice).toFixed(2)}/kWh
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(((recommendation.currentPrice - recommendation.recommendedPrice) / recommendation.currentPrice) * 100).toFixed(0)}% lower
                                </p>
                              </td>
                              <td className="text-center py-3 px-4">
                                <p className="font-medium text-green-600">${recommendation.savings.toFixed(2)}</p>
                                <div className="flex justify-center mt-1">
                                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                    Apply
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Share2 className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-lg font-medium">No recommendations available</h3>
                  <p className="mt-1 text-sm text-slate-500">The system hasn't identified any optimization opportunities.</p>
                  <Button
                    className="mt-6"
                    onClick={generateRecommendations}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Recommendations'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiSiteOptimizationPage; 
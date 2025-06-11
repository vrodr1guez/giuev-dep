/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Filter, Plus, ChevronDown, MapPin, Power, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChargingStation {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  provider: string;
  status: 'active' | 'maintenance' | 'offline' | 'faulted';
  isPublic: boolean;
  connectorTypes: string[];
  powerCapacityKw: number;
  availability: {
    totalConnectors: number;
    availableConnectors: number;
    inUseConnectors: number;
    faultedConnectors: number;
  };
}

type FilterType = {
  status: string;
  connectorType: string;
  provider: string;
  availability: string;
  isPublic: string;
};

const ChargingStationsMap = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState({
    status: 'all',
    connectorType: 'all',
    provider: 'all',
    availability: 'all',
    isPublic: 'all',
  } as FilterType);
  
  // Mock data - in a real app, this would come from an API
  const stations: ChargingStation[] = [
    {
      id: 1,
      name: "Main Depot Fast Charging Hub",
      location: {
        latitude: 45.4215,
        longitude: -75.6972,
        address: "123 Corporate Drive",
        city: "Ottawa",
      },
      provider: "ChargePoint",
      status: "active",
      isPublic: false,
      connectorTypes: ["CCS2", "CHAdeMO", "Type2"],
      powerCapacityKw: 150,
      availability: {
        totalConnectors: 6,
        availableConnectors: 3,
        inUseConnectors: 2,
        faultedConnectors: 1,
      },
    },
    {
      id: 2,
      name: "Downtown Public Station",
      location: {
        latitude: 45.4112,
        longitude: -75.6981,
        address: "456 Main Street",
        city: "Ottawa",
      },
      provider: "Tesla",
      status: "active",
      isPublic: true,
      connectorTypes: ["Tesla", "CCS2"],
      powerCapacityKw: 250,
      availability: {
        totalConnectors: 8,
        availableConnectors: 5,
        inUseConnectors: 3,
        faultedConnectors: 0,
      },
    },
    {
      id: 3,
      name: "East End Supercharger",
      location: {
        latitude: 45.4201,
        longitude: -75.6899,
        address: "789 East Avenue",
        city: "Ottawa",
      },
      provider: "EVgo",
      status: "maintenance",
      isPublic: true,
      connectorTypes: ["CCS2", "CHAdeMO"],
      powerCapacityKw: 350,
      availability: {
        totalConnectors: 4,
        availableConnectors: 0,
        inUseConnectors: 0,
        faultedConnectors: 4,
      },
    },
    {
      id: 4,
      name: "West Ottawa Depot",
      location: {
        latitude: 45.4250,
        longitude: -75.7001,
        address: "321 West Road",
        city: "Ottawa",
      },
      provider: "Electrify Canada",
      status: "faulted",
      isPublic: false,
      connectorTypes: ["CCS2", "Type2"],
      powerCapacityKw: 75,
      availability: {
        totalConnectors: 2,
        availableConnectors: 0,
        inUseConnectors: 0,
        faultedConnectors: 2,
      },
    },
    {
      id: 5,
      name: "South Mall Charging",
      location: {
        latitude: 45.4150,
        longitude: -75.7050,
        address: "100 Mall Boulevard",
        city: "Ottawa",
      },
      provider: "FLO",
      status: "active",
      isPublic: true,
      connectorTypes: ["Type2"],
      powerCapacityKw: 50,
      availability: {
        totalConnectors: 12,
        availableConnectors: 8,
        inUseConnectors: 4,
        faultedConnectors: 0,
      },
    },
  ];

  // Get unique values for filter options
  const providers = Array.from(new Set(stations.map(station => station.provider)));
  const connectorTypes = Array.from(
    new Set(stations.flatMap(station => station.connectorTypes))
  );

  // Filter stations based on search and filters
  const filteredStations = stations.filter(station => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      station.name.toLowerCase().includes(searchTermLower) ||
      station.location.address.toLowerCase().includes(searchTermLower) ||
      station.location.city.toLowerCase().includes(searchTermLower) ||
      station.provider.toLowerCase().includes(searchTermLower);
    
    // Status filter
    const matchesStatus = filters.status === 'all' || station.status === filters.status;
    
    // Connector type filter
    const matchesConnector = filters.connectorType === 'all' || 
      station.connectorTypes.includes(filters.connectorType);
    
    // Provider filter
    const matchesProvider = filters.provider === 'all' || 
      station.provider === filters.provider;
    
    // Availability filter
    const matchesAvailability = filters.availability === 'all' || 
      (filters.availability === 'available' && station.availability.availableConnectors > 0) ||
      (filters.availability === 'full' && station.availability.availableConnectors === 0);
    
    // Public/Private filter
    const matchesPublic = filters.isPublic === 'all' || 
      (filters.isPublic === 'public' && station.isPublic) ||
      (filters.isPublic === 'private' && !station.isPublic);
    
    return matchesSearch && matchesStatus && matchesConnector && 
      matchesProvider && matchesAvailability && matchesPublic;
  });

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'faulted': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Handler for viewing station details
  const handleViewStation = (id: number) => {
    router.push(`/charging-stations/${id}`);
  };

  // Handler for adding a new station
  const handleAddStation = () => {
    router.push('/charging-stations/add');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Charging Stations Map</h1>
        <button 
          onClick={handleAddStation}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Station</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-64 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search stations..."
                  className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                  <option value="faulted">Faulted</option>
                </select>
              </div>

              {/* Connector Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connector Type</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.connectorType}
                  onChange={(e) => setFilters({...filters, connectorType: e.target.value})}
                >
                  <option value="all">All Connectors</option>
                  {connectorTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Provider filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.provider}
                  onChange={(e) => setFilters({...filters, provider: e.target.value})}
                >
                  <option value="all">All Providers</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              {/* Availability filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                >
                  <option value="all">All Availability</option>
                  <option value="available">Has Available Connectors</option>
                  <option value="full">Fully Occupied</option>
                </select>
              </div>

              {/* Public/Private filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={filters.isPublic}
                  onChange={(e) => setFilters({...filters, isPublic: e.target.value})}
                >
                  <option value="all">All Access Types</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Station count */}
          <div className="text-sm text-gray-500">
            Showing {filteredStations.length} of {stations.length} stations
          </div>
        </div>

        {/* Map and station cards */}
        <div className="flex-1 space-y-6">
          {/* Map */}
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-gray-100 h-[400px] w-full flex items-center justify-center">
                {/* This is a placeholder for the actual map. In a real app, you would use a library like Google Maps, Leaflet, or Mapbox */}
                <div className="text-gray-500 text-center absolute inset-0 flex items-center justify-center">
                  <div>
                    <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                    <p>Interactive Map Would Display Here</p>
                    <p className="text-sm mt-2">Using Google Maps, Leaflet, or Mapbox</p>
                  </div>
                </div>
                
                {/* Map overlay with station list */}
                <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md z-10 max-h-[336px] w-72 overflow-y-auto">
                  <h3 className="font-medium mb-2">Station List</h3>
                  <div className="space-y-2">
                    {filteredStations.map(station => (
                      <div 
                        key={station.id} 
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleViewStation(station.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
                          <div>
                            <div className="font-medium text-sm">{station.name}</div>
                            <div className="text-xs text-gray-500">{station.location.address}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center text-xs text-green-600">
                                <Zap className="h-3 w-3 mr-1" />
                                {station.availability.availableConnectors}/{station.availability.totalConnectors}
                              </div>
                              <div className="text-xs text-gray-500">{station.powerCapacityKw} kW</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Station cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map(station => (
              <Card key={station.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewStation(station.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{station.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
                  </div>
                  <p className="text-xs text-gray-500">{station.location.address}, {station.location.city}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Power className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm">{station.powerCapacityKw} kW</span>
                    </div>
                    <div className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                      {station.provider}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-1">
                      {station.connectorTypes.map((type, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs">
                      {station.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="grid grid-cols-3 gap-1 text-center text-xs">
                      <div>
                        <div className="font-semibold text-green-600">{station.availability.availableConnectors}</div>
                        <div className="text-gray-500">Available</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-600">{station.availability.inUseConnectors}</div>
                        <div className="text-gray-500">In Use</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{station.availability.faultedConnectors}</div>
                        <div className="text-gray-500">Faulted</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingStationsMap; 
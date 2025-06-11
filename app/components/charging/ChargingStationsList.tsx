/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Filter, ChevronDown, Zap, MapPin, WifiOff, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChargingStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  connectors: ChargingConnector[];
  lastMaintenance?: string;
  powerRating: number; // in kW
  networkProvider?: string;
}

interface ChargingConnector {
  id: string;
  type: 'CCS' | 'CHAdeMO' | 'Type2' | 'Tesla';
  powerOutput: number; // in kW
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
}

const ChargingStationsList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all' as string);
  const [connectorFilter, setConnectorFilter] = React.useState('all' as string);
  
  // Mock data - in a real app, this would come from an API
  const stations: ChargingStation[] = [
    {
      id: 'cs-001',
      name: 'Downtown Charging Hub',
      location: {
        lat: 45.4215,
        lng: -75.6972,
        address: '123 Main Street, Ottawa, ON'
      },
      status: 'available',
      connectors: [
        { id: 'conn-001', type: 'CCS', powerOutput: 150, status: 'available' },
        { id: 'conn-002', type: 'CHAdeMO', powerOutput: 50, status: 'available' },
        { id: 'conn-003', type: 'Type2', powerOutput: 22, status: 'in-use' }
      ],
      lastMaintenance: '2024-04-15',
      powerRating: 200,
      networkProvider: 'ChargePoint'
    },
    {
      id: 'cs-002',
      name: 'West End Depot',
      location: {
        lat: 45.3475,
        lng: -75.7566,
        address: '456 West Avenue, Ottawa, ON'
      },
      status: 'in-use',
      connectors: [
        { id: 'conn-004', type: 'CCS', powerOutput: 50, status: 'in-use' },
        { id: 'conn-005', type: 'Type2', powerOutput: 22, status: 'available' }
      ],
      lastMaintenance: '2024-03-30',
      powerRating: 100,
      networkProvider: 'Electrify Canada'
    },
    {
      id: 'cs-003',
      name: 'East Side Station',
      location: {
        lat: 45.4315,
        lng: -75.6512,
        address: '789 East Road, Ottawa, ON'
      },
      status: 'maintenance',
      connectors: [
        { id: 'conn-006', type: 'CCS', powerOutput: 150, status: 'maintenance' },
        { id: 'conn-007', type: 'Tesla', powerOutput: 250, status: 'maintenance' }
      ],
      lastMaintenance: '2024-05-20',
      powerRating: 250,
      networkProvider: 'Tesla'
    },
    {
      id: 'cs-004',
      name: 'North Ottawa Fast Charging',
      location: {
        lat: 45.4512,
        lng: -75.7245,
        address: '321 North Blvd, Ottawa, ON'
      },
      status: 'available',
      connectors: [
        { id: 'conn-008', type: 'CCS', powerOutput: 350, status: 'available' },
        { id: 'conn-009', type: 'CCS', powerOutput: 350, status: 'available' }
      ],
      lastMaintenance: '2024-05-10',
      powerRating: 700,
      networkProvider: 'Electrify Canada'
    },
    {
      id: 'cs-005',
      name: 'South Mall Charging',
      location: {
        lat: 45.3890,
        lng: -75.6498,
        address: '555 South Mall Road, Ottawa, ON'
      },
      status: 'offline',
      connectors: [
        { id: 'conn-010', type: 'Type2', powerOutput: 22, status: 'offline' },
        { id: 'conn-011', type: 'CCS', powerOutput: 50, status: 'offline' }
      ],
      lastMaintenance: '2024-02-15',
      powerRating: 100,
      networkProvider: 'FLO'
    }
  ];

  // Get unique connector types for the filter
  const connectorTypes = Array.from(
    new Set(stations.flatMap(station => station.connectors.map(c => c.type)))
  );
  
  // Filter stations based on search and filters
  const filteredStations = stations.filter(station => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      station.id.toLowerCase().includes(searchTermLower) ||
      station.name.toLowerCase().includes(searchTermLower) ||
      station.location.address?.toLowerCase().includes(searchTermLower) ||
      station.networkProvider?.toLowerCase().includes(searchTermLower);
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
    
    // Connector filter
    const matchesConnector = connectorFilter === 'all' || 
      station.connectors.some(c => c.type === connectorFilter);
    
    return matchesSearch && matchesStatus && matchesConnector;
  });

  // Helper to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleViewStation = (id: string) => {
    router.push(`/charging-stations/${id}`);
  };

  const handleAddStation = () => {
    router.push('/charging-stations/add');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Charging Station Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, location, or provider..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm">Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm">Connector: {connectorFilter === 'all' ? 'All' : connectorFilter}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={connectorFilter}
                  onChange={(e) => setConnectorFilter(e.target.value)}
                >
                  <option value="all">All Connectors</option>
                  {connectorTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredStations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No charging stations match your search criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-medium">Station</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Connectors</th>
                  <th className="p-3 font-medium">Power</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Network</th>
                  <th className="p-3 font-medium">Last Maintenance</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStations.map(station => (
                  <tr key={station.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{station.name}</div>
                      <div className="text-gray-500 text-xs">{station.id}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(station.status)}`}>
                        {station.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {station.connectors.map(connector => (
                          <span 
                            key={connector.id} 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(connector.status)}`}
                            title={`${connector.type} - ${connector.powerOutput}kW - ${connector.status}`}
                          >
                            {connector.type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                        {station.powerRating} kW
                      </div>
                    </td>
                    <td className="p-3 max-w-[200px] truncate" title={station.location.address}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-red-500 mr-1" />
                        {station.location.address}
                      </div>
                    </td>
                    <td className="p-3">
                      {station.networkProvider || 'Independent'}
                    </td>
                    <td className="p-3">
                      {formatDate(station.lastMaintenance)}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewStation(station.id)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          View
                        </button>
                        {station.status === 'maintenance' || station.status === 'offline' ? (
                          <button className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100">
                            Repair
                          </button>
                        ) : (
                          <button className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                            Maintain
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredStations.length} of {stations.length} charging stations
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-600">1</button>
            <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Next</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChargingStationsList; 
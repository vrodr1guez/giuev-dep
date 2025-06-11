/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Filter, Plus, ChevronDown, Battery, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Vehicle {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive' | 'retired';
  current_driver?: string;
  soc?: number;
  soh?: number;
  location?: string;
  fleet?: string;
}

const VehiclesList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all' as string);
  const [fleetFilter, setFleetFilter] = React.useState('all' as string);
  
  // Mock data - in a real app, this would come from an API
  const vehicles: Vehicle[] = [
    {
      id: 1,
      vin: "1HGCM82633A123456",
      license_plate: "ABC123",
      make: "Tesla",
      model: "Model Y",
      year: 2023,
      status: "active",
      current_driver: "John Smith",
      soc: 68,
      soh: 96,
      location: "Ottawa Downtown",
      fleet: "Sales Team"
    },
    {
      id: 2,
      vin: "5YJSA1E40HF000123",
      license_plate: "XYZ789",
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      status: "active",
      current_driver: "Emily Chen",
      soc: 42,
      soh: 95,
      location: "West Ottawa",
      fleet: "Sales Team"
    },
    {
      id: 3,
      vin: "1FTFW1ET1MFA00348",
      license_plate: "DEF456",
      make: "Ford",
      model: "F-150 Lightning",
      year: 2022,
      status: "maintenance",
      current_driver: "Michael Brown",
      soc: 22,
      soh: 91,
      location: "Service Center",
      fleet: "Maintenance"
    },
    {
      id: 4,
      vin: "1G1FY6S07H4115362",
      license_plate: "GHI789",
      make: "Chevrolet",
      model: "Bolt",
      year: 2021,
      status: "active",
      current_driver: "Sarah Johnson",
      soc: 89,
      soh: 88,
      location: "East Ottawa",
      fleet: "Delivery"
    },
    {
      id: 5,
      vin: "7FTTW0063NRA12435",
      license_plate: "JKL012",
      make: "Rivian",
      model: "R1T",
      year: 2023,
      status: "inactive",
      soc: 12,
      soh: 97,
      location: "Main Depot",
      fleet: "Delivery"
    },
  ];

  // Get unique fleets for the filter
  const fleets = Array.from(new Set(vehicles.map(vehicle => vehicle.fleet))).filter(Boolean);
  
  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      vehicle.vin.toLowerCase().includes(searchTermLower) ||
      vehicle.license_plate.toLowerCase().includes(searchTermLower) ||
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTermLower) ||
      (vehicle.current_driver && vehicle.current_driver.toLowerCase().includes(searchTermLower));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    // Fleet filter
    const matchesFleet = fleetFilter === 'all' || vehicle.fleet === fleetFilter;
    
    return matchesSearch && matchesStatus && matchesFleet;
  });

  // Helper to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to get battery level color
  const getBatteryLevelClass = (soc?: number) => {
    if (!soc) return 'text-gray-400';
    if (soc > 60) return 'text-green-500';
    if (soc > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleViewVehicle = (id: number) => {
    router.push(`/vehicles/${id}`);
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/add');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <button 
          onClick={handleAddVehicle}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Vehicle Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by VIN, license plate, or model..."
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
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm">Fleet: {fleetFilter === 'all' ? 'All' : fleetFilter}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={fleetFilter}
                    onChange={(e) => setFleetFilter(e.target.value)}
                  >
                    <option value="all">All Fleets</option>
                    {fleets.map((fleet, index) => (
                      <option key={index} value={fleet}>{fleet}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No vehicles match your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 font-medium">Vehicle</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Driver</th>
                    <th className="p-3 font-medium">Battery</th>
                    <th className="p-3 font-medium">Location</th>
                    <th className="p-3 font-medium">Fleet</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="text-gray-500 text-xs">{vehicle.license_plate} • {vehicle.vin}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(vehicle.status)}`}>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        {vehicle.current_driver || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Battery className={`h-4 w-4 ${getBatteryLevelClass(vehicle.soc)}`} />
                          <span>{vehicle.soc ?? '—'}%</span>
                          {vehicle.soh && <span className="text-xs text-gray-500">SoH: {vehicle.soh}%</span>}
                        </div>
                      </td>
                      <td className="p-3">{vehicle.location || <span className="text-gray-400">—</span>}</td>
                      <td className="p-3">{vehicle.fleet || <span className="text-gray-400">—</span>}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewVehicle(vehicle.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-600">1</button>
              <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclesList; 
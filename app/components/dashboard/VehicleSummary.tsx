/// <reference path="../../types/react.d.ts" />
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, Car, Battery, ChevronRight, AlertCircle, Zap, MapPin, Clock } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface VehicleData {
  id: string;
  model: string;
  driver: string;
  status: string;
  soc: number;
  location: string;
  lastUpdated: string;
}

interface VehicleSummaryProps {
  vehicles: VehicleData[];
}

const VehicleSummary: React.FC<VehicleSummaryProps> = ({ vehicles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null as string | null);
  
  // Filter vehicles based on search term and status filter
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      searchTerm === '' || 
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === null || 
      vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Function to get status color and styling
  const getStatusStyle = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'charging':
        return 'status-charging';
      case 'maintenance':
        return 'status-warning';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold';
    }
  };
  
  // Function to get SoC color based on percentage
  const getSoCColor = (soc: number) => {
    if (soc < 20) return 'bg-red-500';
    if (soc < 40) return 'bg-amber-500';
    if (soc < 60) return 'bg-yellow-500';
    if (soc < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'charging':
        return <Zap className="w-4 h-4 icon-charging" />;
      case 'active':
        return <Car className="w-4 h-4 icon-electric" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 icon-energy" />;
      default:
        return <Car className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="card-premium fade-in">
      <CardHeader className="py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <div className="w-10 h-10 gradient-electric rounded-xl flex items-center justify-center mr-3">
              <Car className="w-5 h-5 text-white" />
            </div>
            Vehicle Fleet Summary
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search vehicles..."
                className="input-premium pl-10 w-full sm:w-[240px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={statusFilter === null ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter(null)}
                className="transition-all duration-200 hover:scale-105"
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('active')}
                className="transition-all duration-200 hover:scale-105"
              >
                Active
              </Button>
              <Button 
                variant={statusFilter === 'charging' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('charging')}
                className="transition-all duration-200 hover:scale-105"
              >
                Charging
              </Button>
              <Button 
                variant={statusFilter === 'maintenance' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('maintenance')}
                className="transition-all duration-200 hover:scale-105"
              >
                Maintenance
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="table-premium">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left font-semibold p-4 pl-6">Vehicle</th>
                  <th className="text-left font-semibold p-4">Driver</th>
                  <th className="text-left font-semibold p-4">Status</th>
                  <th className="text-left font-semibold p-4">Battery</th>
                  <th className="text-left font-semibold p-4">Location</th>
                  <th className="text-left font-semibold p-4">Updated</th>
                  <th className="text-right font-semibold p-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle, index) => (
                    <tr 
                      key={vehicle.id} 
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.id}</div>
                            <div className="text-sm text-gray-500">{vehicle.model}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{vehicle.driver}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(vehicle.status)}
                          <span className={getStatusStyle(vehicle.status)}>
                            {vehicle.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="progress-electric">
                              <div 
                                className="progress-fill"
                                style={{ width: `${vehicle.soc}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Battery className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{vehicle.soc}%</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{vehicle.location}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 text-sm">{vehicle.lastUpdated}</span>
                        </div>
                      </td>
                      
                      <td className="p-4 pr-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-200"
                        >
                          <Link href={`/vehicles/${vehicle.id}`} className="flex items-center">
                            Details
                            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">No vehicles found</div>
                        <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{vehicles.length}</span> vehicles
          </div>
          <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-all duration-200">
            <Link href="/vehicles" className="flex items-center">
              Manage All Vehicles
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default VehicleSummary; 
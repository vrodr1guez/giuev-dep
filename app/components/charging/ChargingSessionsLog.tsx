/// <reference path="../../types/react.d.ts" />
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Filter, ChevronDown, Download, Calendar, Clock, Zap, Battery, Car, MapPin } from 'lucide-react';

interface ChargingSession {
  id: string;
  vehicleId: number;
  vehicleName: string;
  licencePlate: string;
  stationId: number;
  stationName: string;
  connectorType: string;
  startTime: string;
  endTime: string | null;
  energyDelivered: number | null;
  duration: number | null;
  cost: number | null;
  userId: string;
  userName: string;
  status: 'in_progress' | 'completed' | 'stopped' | 'faulted';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

type FilterType = {
  dateRange: string;
  vehicle: string;
  station: string;
  status: string;
  paymentStatus: string;
};

const ChargingSessionsLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    vehicle: 'all',
    station: 'all',
    status: 'all',
    paymentStatus: 'all',
  } as FilterType);

  // Mock data - in a real app, this would come from an API
  const sessions: ChargingSession[] = [
    {
      id: 'cs-001',
      vehicleId: 1,
      vehicleName: 'Tesla Model Y',
      licencePlate: 'ABC123',
      stationId: 1,
      stationName: 'Main Depot Fast Charging Hub',
      connectorType: 'CCS2',
      startTime: '2024-05-15T08:30:00Z',
      endTime: '2024-05-15T09:45:00Z',
      energyDelivered: 35.2,
      duration: 75,
      cost: 12.32,
      userId: 'user-001',
      userName: 'John Smith',
      status: 'completed',
      paymentStatus: 'completed',
    },
    {
      id: 'cs-002',
      vehicleId: 2,
      vehicleName: 'Tesla Model 3',
      licencePlate: 'XYZ789',
      stationId: 2,
      stationName: 'Downtown Public Station',
      connectorType: 'Tesla',
      startTime: '2024-05-15T10:15:00Z',
      endTime: null,
      energyDelivered: 12.7,
      duration: 30,
      cost: 4.45,
      userId: 'user-002',
      userName: 'Emily Chen',
      status: 'in_progress',
      paymentStatus: 'pending',
    },
    {
      id: 'cs-003',
      vehicleId: 3,
      vehicleName: 'Ford F-150 Lightning',
      licencePlate: 'DEF456',
      stationId: 1,
      stationName: 'Main Depot Fast Charging Hub',
      connectorType: 'CCS2',
      startTime: '2024-05-14T18:20:00Z',
      endTime: '2024-05-14T20:10:00Z',
      energyDelivered: 85.6,
      duration: 110,
      cost: 29.96,
      userId: 'user-003',
      userName: 'Michael Brown',
      status: 'completed',
      paymentStatus: 'completed',
    },
    {
      id: 'cs-004',
      vehicleId: 4,
      vehicleName: 'Chevrolet Bolt',
      licencePlate: 'GHI789',
      stationId: 5,
      stationName: 'South Mall Charging',
      connectorType: 'Type2',
      startTime: '2024-05-14T14:45:00Z',
      endTime: '2024-05-14T15:30:00Z',
      energyDelivered: 8.1,
      duration: 45,
      cost: 2.83,
      userId: 'user-004',
      userName: 'Sarah Johnson',
      status: 'stopped',
      paymentStatus: 'completed',
    },
    {
      id: 'cs-005',
      vehicleId: 5,
      vehicleName: 'Rivian R1T',
      licencePlate: 'JKL012',
      stationId: 4,
      stationName: 'West Ottawa Depot',
      connectorType: 'CCS2',
      startTime: '2024-05-14T09:00:00Z',
      endTime: '2024-05-14T09:05:00Z',
      energyDelivered: 0.5,
      duration: 5,
      cost: 0.18,
      userId: 'user-005',
      userName: 'David Wilson',
      status: 'faulted',
      paymentStatus: 'refunded',
    },
  ];

  // Get unique values for filter options
  const vehicles = Array.from(
    new Set(sessions.map(session => `${session.vehicleName} (${session.licencePlate})`))
  );
  const stations = Array.from(new Set(sessions.map(session => session.stationName)));

  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      session.vehicleName.toLowerCase().includes(searchTermLower) ||
      session.licencePlate.toLowerCase().includes(searchTermLower) ||
      session.stationName.toLowerCase().includes(searchTermLower) ||
      session.userName.toLowerCase().includes(searchTermLower) ||
      session.id.toLowerCase().includes(searchTermLower);
    
    // Date range filter
    let matchesDateRange = true;
    const sessionDate = new Date(session.startTime);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    if (filters.dateRange === 'today') {
      matchesDateRange = sessionDate >= today;
    } else if (filters.dateRange === 'yesterday') {
      matchesDateRange = sessionDate >= yesterday && sessionDate < today;
    } else if (filters.dateRange === 'week') {
      matchesDateRange = sessionDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      matchesDateRange = sessionDate >= monthAgo;
    }
    
    // Vehicle filter
    const matchesVehicle = filters.vehicle === 'all' || 
      `${session.vehicleName} (${session.licencePlate})` === filters.vehicle;
    
    // Station filter
    const matchesStation = filters.station === 'all' || 
      session.stationName === filters.station;
    
    // Status filter
    const matchesStatus = filters.status === 'all' || 
      session.status === filters.status;
    
    // Payment status filter
    const matchesPaymentStatus = filters.paymentStatus === 'all' || 
      session.paymentStatus === filters.paymentStatus;
    
    return matchesSearch && matchesDateRange && matchesVehicle && 
           matchesStation && matchesStatus && matchesPaymentStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format duration
  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'In progress';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-yellow-100 text-yellow-800';
      case 'faulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Charging Sessions Log</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by vehicle, license plate, station..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Date Range filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm">Date: {filters.dateRange === 'all' ? 'All Time' : filters.dateRange}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>

              {/* Vehicle filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                    <Car size={16} className="text-gray-500" />
                    <span className="text-sm">Vehicle: {filters.vehicle === 'all' ? 'All' : 'Selected'}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={filters.vehicle}
                    onChange={(e) => setFilters({...filters, vehicle: e.target.value})}
                  >
                    <option value="all">All Vehicles</option>
                    {vehicles.map((vehicle, i) => (
                      <option key={i} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Station filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-sm">Station: {filters.station === 'all' ? 'All' : 'Selected'}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={filters.station}
                    onChange={(e) => setFilters({...filters, station: e.target.value})}
                  >
                    <option value="all">All Stations</option>
                    {stations.map((station, i) => (
                      <option key={i} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm">Status: {filters.status === 'all' ? 'All' : filters.status.replace('_', ' ')}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="stopped">Stopped</option>
                    <option value="faulted">Faulted</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No charging sessions match your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 font-medium">Session ID</th>
                    <th className="p-3 font-medium">Vehicle</th>
                    <th className="p-3 font-medium">Station</th>
                    <th className="p-3 font-medium">Start Time</th>
                    <th className="p-3 font-medium">Duration</th>
                    <th className="p-3 font-medium">Energy</th>
                    <th className="p-3 font-medium">Cost</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Payment</th>
                    <th className="p-3 font-medium">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSessions.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{session.id}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{session.vehicleName}</div>
                          <div className="text-gray-500 text-xs">{session.licencePlate}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{session.stationName}</div>
                          <div className="text-gray-500 text-xs">{session.connectorType}</div>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{formatDate(session.startTime)}</td>
                      <td className="p-3">{formatDuration(session.duration)}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                          {session.energyDelivered !== null ? `${session.energyDelivered.toFixed(1)} kWh` : '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        {session.cost !== null ? `$${session.cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                          {session.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(session.paymentStatus)}`}>
                          {session.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">{session.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredSessions.length} of {sessions.length} sessions
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-600">1</button>
              <button className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">{filteredSessions.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Energy</p>
                <p className="text-2xl font-bold">
                  {filteredSessions.reduce((sum, session) => sum + (session.energyDelivered || 0), 0).toFixed(1)} kWh
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${filteredSessions.reduce((sum, session) => sum + (session.cost || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <div className="h-6 w-6 text-green-500 flex items-center justify-center font-bold">$</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Battery className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChargingSessionsLog; 
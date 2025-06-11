/// <reference path="../../types/react.d.ts" />
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import Link from 'next/link';
import {
  BatteryCharging,
  Download,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Zap,
  Map,
  List
} from 'lucide-react';
import ChargingStationStatusBadge from './ChargingStationStatusBadge';
import AddStationDialog from './AddStationDialog';
import dynamic from 'next/dynamic';

// Dynamically import the map component to prevent SSR issues with leaflet
const ChargingStationMap = dynamic(() => import('./ChargingStationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-900/10 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-3"></div>
    </div>
  )
});

// Mock data for charging stations
const mockChargingStations = [
  {
    id: 'cs001',
    name: 'Downtown Hub - Station 1',
    status: 'available',
    connectors: 3,
    power: 150,
    location: 'Downtown',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St, Downtown',
    lastUpdated: '10 minutes ago',
    connectorDetails: [
      { id: 'c001', type: 'CCS', power: 150, status: 'available' },
      { id: 'c002', type: 'CHAdeMO', power: 100, status: 'available' },
      { id: 'c003', type: 'Type 2', power: 22, status: 'available' }
    ]
  },
  {
    id: 'cs002',
    name: 'West End Depot',
    status: 'in-use',
    connectors: 2,
    power: 100,
    location: 'West End',
    coordinates: { lat: 40.7282, lng: -74.0060 },
    address: '456 West St, West End',
    lastUpdated: '5 minutes ago',
    connectorDetails: [
      { id: 'c004', type: 'CCS', power: 100, status: 'in-use' },
      { id: 'c005', type: 'Type 2', power: 22, status: 'available' }
    ]
  },
  {
    id: 'cs003',
    name: 'East Side Station',
    status: 'maintenance',
    connectors: 4,
    power: 250,
    location: 'East Side',
    coordinates: { lat: 40.7128, lng: -73.9800 },
    address: '789 East Ave, East Side',
    lastUpdated: '1 hour ago',
    connectorDetails: [
      { id: 'c006', type: 'CCS', power: 250, status: 'maintenance' },
      { id: 'c007', type: 'CCS', power: 250, status: 'maintenance' },
      { id: 'c008', type: 'CHAdeMO', power: 100, status: 'maintenance' },
      { id: 'c009', type: 'Type 2', power: 22, status: 'maintenance' }
    ]
  }
];

// Status options for filtering
const statusOptions = ['All', 'Available', 'In-Use', 'Maintenance', 'Offline'];

// Main Charging Management Page Component
const ChargingManagement = () => {
  const [stations, setStations] = useState(mockChargingStations);
  const [filteredStations, setFilteredStations] = useState(mockChargingStations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [mapCenter] = useState([40.7128, -74.0060] as [number, number]);
  const [mapZoom] = useState(13);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let results = [...stations];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(station => 
          station.name.toLowerCase().includes(query) ||
          station.location.toLowerCase().includes(query) ||
          station.address.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'All') {
        results = results.filter(station => 
          station.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      setFilteredStations(results);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, stations]);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Handle add station
  const handleAddStation = (data: any) => {
    console.log('Add station data:', data);
    // In a real implementation, we would save this data to the database
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Charging Management</h1>
          <p className="text-muted-foreground">Manage and monitor your charging infrastructure</p>
        </div>
        <div>
          <AddStationDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddStation}
          />
        </div>
      </div>
      
      {/* View Toggle and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stations by name or location..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Download size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export Stations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Sliders size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Advanced Filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="border-l pl-2 ml-2">
                <Tabs defaultValue={viewMode} className="w-[180px]">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="list" className="flex items-center gap-1">
                      <List size={14} />
                      <span>List View</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-1">
                      <Map size={14} />
                      <span>Map View</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content based on view mode */}
      <div>
        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Charging Stations</CardTitle>
              <CardDescription>
                {loading ? (
                  "Loading stations..."
                ) : (
                  `Showing ${filteredStations.length} charging station${filteredStations.length !== 1 ? 's' : ''}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Connectors</TableHead>
                      <TableHead>Power</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading state
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={`loading-${index}`} className="animate-pulse">
                          <TableCell><div className="h-6 bg-gray-100 rounded w-3/4"></div></TableCell>
                          <TableCell><div className="h-6 bg-gray-100 rounded w-20"></div></TableCell>
                          <TableCell><div className="h-6 bg-gray-100 rounded w-24"></div></TableCell>
                          <TableCell><div className="h-6 bg-gray-100 rounded w-16"></div></TableCell>
                          <TableCell><div className="h-6 bg-gray-100 rounded w-28"></div></TableCell>
                          <TableCell className="text-right"><div className="h-6 bg-gray-100 rounded w-16 ml-auto"></div></TableCell>
                        </TableRow>
                      ))
                    ) : filteredStations.length > 0 ? (
                      // Station data
                      filteredStations.map((station) => (
                        <TableRow key={station.id}>
                          <TableCell>
                            <div className="font-medium">{station.name}</div>
                          </TableCell>
                          <TableCell>
                            <ChargingStationStatusBadge status={station.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span>{station.connectors} connector{station.connectors !== 1 ? 's' : ''}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Zap size={14} className="mr-1 text-amber-500" />
                              {station.power} kW
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1 text-muted-foreground" />
                              {station.location}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/charging-stations/${station.id}`}>View</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // No results
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <BatteryCharging size={48} className="mb-2 opacity-20" />
                            <p>No charging stations found matching your filters</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('All');
                              }}
                            >
                              Clear all filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Map View */}
        {viewMode === 'map' && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Charging Station Map</CardTitle>
              <CardDescription>
                {loading ? (
                  "Loading stations..."
                ) : (
                  `Showing ${filteredStations.length} charging station${filteredStations.length !== 1 ? 's' : ''}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ChargingStationMap 
                stations={filteredStations}
                loading={loading}
                center={mapCenter}
                zoom={mapZoom}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChargingManagement; 
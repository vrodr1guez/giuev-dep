/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import BatteryStatus from './BatteryStatus';
import StatusBadge from './StatusBadge';
import Link from 'next/link';
import {
  Battery,
  Car,
  Download,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sliders
} from 'lucide-react';

// Mock data for vehicles based on user-provided information
const mockVehicles = [
  {
    id: 'v001',
    name: '2023 Tesla Model Y',
    licensePlate: 'ABC123',
    vin: '1HGCM82633A123456',
    status: 'active',
    driver: {
      id: 'd001',
      name: 'John Smith',
      image: null
    },
    battery: {
      level: 68,
      soh: 96,
      range: 210
    },
    location: 'Ottawa Downtown',
    fleet: 'Sales Team',
    lastUpdated: '10 minutes ago'
  },
  {
    id: 'v002',
    name: '2023 Tesla Model 3',
    licensePlate: 'XYZ789',
    vin: '5YJSA1E40HF000123',
    status: 'active',
    driver: {
      id: 'd002',
      name: 'Emily Chen',
      image: null
    },
    battery: {
      level: 42,
      soh: 95,
      range: 130
    },
    location: 'West Ottawa',
    fleet: 'Sales Team',
    lastUpdated: '5 minutes ago'
  },
  {
    id: 'v003',
    name: '2022 Ford F-150 Lightning',
    licensePlate: 'DEF456',
    vin: '1FTFW1ET1MFA00348',
    status: 'maintenance',
    driver: {
      id: 'd003',
      name: 'Michael Brown',
      image: null
    },
    battery: {
      level: 22,
      soh: 91,
      range: 68
    },
    location: 'Service Center',
    fleet: 'Maintenance',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'v004',
    name: '2021 Chevrolet Bolt',
    licensePlate: 'GHI789',
    vin: '1G1FY6S07H4115362',
    status: 'active',
    driver: {
      id: 'd004',
      name: 'Sarah Johnson',
      image: null
    },
    battery: {
      level: 89,
      soh: 88,
      range: 220
    },
    location: 'East Ottawa',
    fleet: 'Delivery',
    lastUpdated: '15 minutes ago'
  },
  {
    id: 'v005',
    name: '2023 Rivian R1T',
    licensePlate: 'JKL012',
    vin: '7FTTW0063NRA12435',
    status: 'inactive',
    driver: null,
    battery: {
      level: 12,
      soh: 97,
      range: 35
    },
    location: 'Main Depot',
    fleet: 'Delivery',
    lastUpdated: '1 day ago'
  }
];

// Fleet options for filtering
const fleetOptions = ['All', 'Sales Team', 'Maintenance', 'Delivery'];

// Status options for filtering
const statusOptions = ['All', 'Active', 'Maintenance', 'Inactive'];

// Main Vehicle Management Page Component
const VehicleManagement = () => {
  const [vehicles, setVehicles] = React.useState(mockVehicles);
  const [filteredVehicles, setFilteredVehicles] = React.useState(mockVehicles);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [fleetFilter, setFleetFilter] = React.useState('All');
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(5);

  // Apply filters when they change
  React.useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let results = [...vehicles];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(vehicle => 
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.licensePlate.toLowerCase().includes(query) ||
          vehicle.vin.toLowerCase().includes(query) ||
          vehicle.location.toLowerCase().includes(query) ||
          (vehicle.driver && vehicle.driver.name.toLowerCase().includes(query))
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'All') {
        results = results.filter(vehicle => 
          vehicle.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      // Apply fleet filter
      if (fleetFilter !== 'All') {
        results = results.filter(vehicle => 
          vehicle.fleet === fleetFilter
        );
      }
      
      setFilteredVehicles(results);
      setCurrentPage(1); // Reset to first page when filters change
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, fleetFilter, vehicles]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage and monitor your EV fleet</p>
        </div>
        <div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add New Vehicle
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, drivers, or locations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Fleet:</span>
                <Select value={fleetFilter} onValueChange={setFleetFilter}>
                  {fleetOptions.map((fleet) => (
                    <SelectItem key={fleet} value={fleet}>
                      {fleet}
                    </SelectItem>
                  ))}
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
                    <p>Export Vehicles</p>
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
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Vehicle Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>
            {loading ? (
              "Loading vehicles..."
            ) : (
              `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredVehicles.length)} of ${filteredVehicles.length} vehicles`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading state
                  Array(itemsPerPage).fill(0).map((_, index) => (
                    <TableRow key={`loading-${index}`} className="animate-pulse">
                      <TableCell>
                        <div className="h-6 bg-gray-700/30 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-1/2 mt-2"></div>
                      </TableCell>
                      <TableCell><div className="h-6 bg-gray-700/30 rounded w-20"></div></TableCell>
                      <TableCell><div className="h-6 bg-gray-700/30 rounded w-24"></div></TableCell>
                      <TableCell><div className="h-6 bg-gray-700/30 rounded w-16"></div></TableCell>
                      <TableCell><div className="h-6 bg-gray-700/30 rounded w-28"></div></TableCell>
                      <TableCell><div className="h-6 bg-gray-700/30 rounded w-20"></div></TableCell>
                      <TableCell className="text-right"><div className="h-6 bg-gray-700/30 rounded w-16 ml-auto"></div></TableCell>
                    </TableRow>
                  ))
                ) : currentItems.length > 0 ? (
                  // Vehicle data
                  currentItems.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.licensePlate} • {vehicle.vin}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={vehicle.status} />
                      </TableCell>
                      <TableCell>
                        {vehicle.driver ? (
                          <Link href={`/drivers/${vehicle.driver.id}`} className="hover:underline">
                            {vehicle.driver.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <BatteryStatus 
                          level={vehicle.battery.level} 
                          soh={vehicle.battery.soh} 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-muted-foreground" />
                          {vehicle.location}
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.fleet}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/vehicles/${vehicle.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // No results
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Car size={48} className="mb-2 opacity-20" />
                        <p>No vehicles found matching your filters</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                            setFleetFilter('All');
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
        
        {/* Pagination */}
        {filteredVehicles.length > 0 && (
          <div className="py-4 px-6 flex items-center justify-between border-t">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VehicleManagement; 
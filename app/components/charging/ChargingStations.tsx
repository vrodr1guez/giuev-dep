/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { cn } from "../../lib/utils";
import {
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Download,
  Map,
  ListFilter
} from 'lucide-react';

// Define station type
interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  connectors: string;
  power: string;
}

const ChargingStations = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState('list' as 'list' | 'map');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(false);
  
  // Mock data
  const stations: ChargingStation[] = [
    {
      id: 'CS001',
      name: 'Downtown Hub - Station 1',
      location: 'Downtown',
      status: 'available',
      connectors: '3 connectors',
      power: '150 kW',
    },
    {
      id: 'CS002',
      name: 'West End Depot',
      location: 'West End',
      status: 'in-use',
      connectors: '2 connectors',
      power: '100 kW',
    },
    {
      id: 'CS003',
      name: 'East Side Station',
      location: 'East Side',
      status: 'maintenance',
      connectors: '4 connectors',
      power: '250 kW',
    }
  ];
  
  // Filter stations based on search and status
  const filteredStations = React.useMemo(() => {
    return stations.filter(station => 
      (statusFilter === 'all' || station.status === statusFilter) &&
      (searchTerm === '' || 
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [stations, statusFilter, searchTerm]);
  
  // Status badge colors
  const getStatusBadge = (status: ChargingStation['status']) => {
    const statusColors: Record<string, { bg: string, text: string, icon?: React.ReactNode }> = {
      'available': { bg: 'bg-green-100', text: 'text-green-800' },
      'in-use': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'offline': { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    
    const { bg, text } = statusColors[status] || statusColors['offline'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${bg} ${text}`}>
        {status}
      </span>
    );
  };
  
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
      {/* View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                className="flex items-center gap-2"
                onClick={() => setViewMode('list')}
              >
                <ListFilter size={16} />
                List View
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'outline'} 
                className="flex items-center gap-2"
                onClick={() => setViewMode('map')}
              >
                <Map size={16} />
                Map View
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
              
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
              
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={() => router.push('/charging-stations/new')}
              >
                <Plus size={16} />
                Add Station
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stations by name or location..."
                className="pl-8"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
        </CardContent>
      </Card>
      
      {/* Stations Content */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Charging Stations</CardTitle>
          <CardDescription>
            {loading ? 
              "Loading stations..." : 
              `Showing ${filteredStations.length} charging stations`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          "p-0",
          viewMode === 'map' ? "pt-4" : ""
        )}>
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connectors</TableHead>
                    <TableHead>Power</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    Array(3).fill(0).map((_, index) => (
                      <TableRow key={`loading-${index}`} className="animate-pulse">
                        <TableCell><div className="h-6 bg-gray-100 rounded w-3/4"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-100 rounded w-24"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-100 rounded w-28"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-100 rounded w-16"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-100 rounded w-24"></div></TableCell>
                        <TableCell className="text-right"><div className="h-6 bg-gray-100 rounded w-16 ml-auto"></div></TableCell>
                      </TableRow>
                    ))
                  ) : filteredStations.length > 0 ? (
                    filteredStations.map((station: ChargingStation) => (
                      <TableRow key={station.id}>
                        <TableCell className="font-medium">{station.name}</TableCell>
                        <TableCell>{getStatusBadge(station.status)}</TableCell>
                        <TableCell>{station.connectors}</TableCell>
                        <TableCell>{station.power}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1 text-muted-foreground" />
                            {station.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/charging-stations/${station.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <MapPin size={48} className="mb-2 opacity-20" />
                          <p>No charging stations found</p>
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
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
          ) : (
            <div className="p-6 h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map size={48} className="mx-auto mb-4 opacity-20" />
                <p className="mb-2">Map view will be implemented here</p>
                <p className="text-sm">This will show the geographical distribution of all charging stations</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChargingStations; 
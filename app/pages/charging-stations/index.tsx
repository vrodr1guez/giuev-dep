"use client";

import * as React from 'react';
import { 
  Battery, BarChart2, Filter, Download, Plus, MapPin, 
  CheckCircle, X, AlertTriangle, Clock, 
  Info, Zap, Settings, ChevronDown, RefreshCw, ArrowUp, Search
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';

// Mock data
const mockChargingStations = [
  {
    id: 'CS001',
    name: 'HQ Charging Hub',
    location: 'Company Headquarters',
    address: '123 Corporate Blvd, Suite 500',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    status: 'online',
    type: 'DC Fast Charger',
    connectorTypes: ['CCS', 'CHAdeMO'],
    power: 150,
    utilization: 78,
    availability: {
      total: 8,
      available: 3,
      inUse: 4,
      reserved: 1,
      outOfService: 0
    },
    lastMaintenance: '2023-10-15',
    energyDelivered: {
      today: 345,
      week: 2450,
      month: 10200
    },
    incidents: 0
  },
  {
    id: 'CS002',
    name: 'Warehouse Depot',
    location: 'Main Distribution Center',
    address: '456 Logistics Way',
    coordinates: { lat: 40.7282, lng: -73.9942 },
    status: 'online',
    type: 'Level 2 AC',
    connectorTypes: ['Type 2'],
    power: 22,
    utilization: 65,
    availability: {
      total: 12,
      available: 5,
      inUse: 7,
      reserved: 0,
      outOfService: 0
    },
    lastMaintenance: '2023-11-02',
    energyDelivered: {
      today: 180,
      week: 1250,
      month: 5400
    },
    incidents: 0
  },
  {
    id: 'CS003',
    name: 'Downtown Hub',
    location: 'City Center Branch',
    address: '789 Main Street',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    status: 'partial',
    type: 'Mixed (AC/DC)',
    connectorTypes: ['CCS', 'Type 2', 'CHAdeMO'],
    power: 50,
    utilization: 92,
    availability: {
      total: 6,
      available: 0,
      inUse: 5,
      reserved: 0,
      outOfService: 1
    },
    lastMaintenance: '2023-09-28',
    energyDelivered: {
      today: 210,
      week: 1580,
      month: 6800
    },
    incidents: 1
  },
  {
    id: 'CS004',
    name: 'Retail Location',
    location: 'Shopping Mall',
    address: '101 Retail Drive',
    coordinates: { lat: 40.7549, lng: -74.0039 },
    status: 'offline',
    type: 'Level 2 AC',
    connectorTypes: ['Type 2'],
    power: 22,
    utilization: 0,
    availability: {
      total: 4,
      available: 0,
      inUse: 0,
      reserved: 0,
      outOfService: 4
    },
    lastMaintenance: '2023-08-15',
    energyDelivered: {
      today: 0,
      week: 320,
      month: 2800
    },
    incidents: 2
  },
  {
    id: 'CS005',
    name: 'West Side Depot',
    location: 'West Regional Office',
    address: '202 West Business Park',
    coordinates: { lat: 40.7429, lng: -73.9915 },
    status: 'online',
    type: 'DC Fast Charger',
    connectorTypes: ['CCS'],
    power: 350,
    utilization: 45,
    availability: {
      total: 2,
      available: 1,
      inUse: 1,
      reserved: 0,
      outOfService: 0
    },
    lastMaintenance: '2023-11-10',
    energyDelivered: {
      today: 425,
      week: 2850,
      month: 9500
    },
    incidents: 0
  },
];

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    online: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
    offline: { color: 'bg-red-100 text-red-800', icon: <X size={14} className="mr-1" /> },
    partial: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle size={14} className="mr-1" /> },
    maintenance: { color: 'bg-blue-100 text-blue-800', icon: <Settings size={14} className="mr-1" /> }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Power badge component
const PowerBadge = ({ power }) => {
  let color;
  if (power >= 150) {
    color = 'bg-purple-100 text-purple-800';
  } else if (power >= 50) {
    color = 'bg-indigo-100 text-indigo-800';
  } else {
    color = 'bg-blue-100 text-blue-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Zap size={14} className="mr-1" />
      {power} kW
    </span>
  );
};

// Main component
const ChargingStationsPage = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredStations = React.useMemo(() => {
    let stations = [...mockChargingStations];
    
    // Filter by tab
    if (activeTab !== 'all') {
      stations = stations.filter(station => station.status === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      stations = stations.filter(station => 
        station.name.toLowerCase().includes(query) || 
        station.location.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query)
      );
    }
    
    return stations;
  }, [activeTab, searchQuery, mockChargingStations]);

  const totalStations = mockChargingStations.length;
  const onlineStations = mockChargingStations.filter(s => s.status === 'online').length;
  const partialStations = mockChargingStations.filter(s => s.status === 'partial').length;
  const offlineStations = mockChargingStations.filter(s => s.status === 'offline').length;
  
  const totalConnectors = mockChargingStations.reduce((acc, station) => acc + station.availability.total, 0);
  const availableConnectors = mockChargingStations.reduce((acc, station) => acc + station.availability.available, 0);
  const utilizationRate = Math.round((1 - (availableConnectors / totalConnectors)) * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Charging Stations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage your EV charging infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            Add Station
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stations</p>
                <h3 className="text-2xl font-bold mt-1">{totalStations}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Battery size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                {onlineStations} Online
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-red-500 flex items-center">
                <X size={14} className="mr-1" />
                {offlineStations} Offline
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Connectors</p>
                <h3 className="text-2xl font-bold mt-1">{totalConnectors}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Zap size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                {availableConnectors} Available
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-blue-500 flex items-center">
                <Battery size={14} className="mr-1" />
                {totalConnectors - availableConnectors} In Use
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilization Rate</p>
                <h3 className="text-2xl font-bold mt-1">{utilizationRate}%</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <BarChart2 size={24} />
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-4">
              <div 
                className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full" 
                style={{ width: `${utilizationRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Energy Delivered Today</p>
                <h3 className="text-2xl font-bold mt-1">
                  {mockChargingStations.reduce((acc, station) => acc + station.energyDelivered.today, 0)} kWh
                </h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Zap size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                12% from yesterday
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <Tabs 
          defaultValue="all" 
          className="w-full sm:w-auto"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="all">All Stations</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-72">
            <Input
              type="search"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Select defaultValue="name">
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="utilization">Sort by Utilization</option>
            <option value="power">Sort by Power</option>
          </Select>
        </div>
      </div>

      {/* Stations list */}
      <div className="space-y-4">
        {filteredStations.length > 0 ? (
          filteredStations.map(station => (
            <Card key={station.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Station info */}
                  <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{station.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-1">
                          <MapPin size={14} className="mr-1" /> 
                          {station.location} - {station.address}
                        </p>
                      </div>
                      <StatusBadge status={station.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="outline" className="bg-gray-50">
                        {station.type}
                      </Badge>
                      <PowerBadge power={station.power} />
                      {station.connectorTypes.map(type => (
                        <Badge key={type} variant="outline" className="bg-gray-50">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Station stats */}
                  <div className="w-full lg:w-96 p-6 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Availability</p>
                        <div className="flex space-x-1 mt-1">
                          {Array.from({ length: station.availability.total }).map((_, i) => {
                            let colorClass;
                            if (i < station.availability.available) {
                              colorClass = 'bg-green-500';
                            } else if (i < (station.availability.available + station.availability.inUse)) {
                              colorClass = 'bg-blue-500';
                            } else if (i < (station.availability.available + station.availability.inUse + station.availability.reserved)) {
                              colorClass = 'bg-amber-500';
                            } else {
                              colorClass = 'bg-red-500';
                            }
                            return <div key={i} className={`h-2 w-6 rounded-sm ${colorClass}`}></div>;
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {station.availability.available} available of {station.availability.total}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Utilization</p>
                        <p className="text-xl font-semibold mt-1">{station.utilization}%</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Energy Today</p>
                        <p className="text-xl font-semibold mt-1">{station.energyDelivered.today} kWh</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Maintained</p>
                        <p className="text-sm font-medium mt-1 flex items-center">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          {station.lastMaintenance}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center">
                        {station.incidents > 0 ? (
                          <span className="text-red-500 text-sm flex items-center">
                            <AlertTriangle size={14} className="mr-1" />
                            {station.incidents} active {station.incidents === 1 ? 'issue' : 'issues'}
                          </span>
                        ) : (
                          <span className="text-green-500 text-sm flex items-center">
                            <CheckCircle size={14} className="mr-1" />
                            No issues
                          </span>
                        )}
                      </div>
                      <div>
                        <Button variant="link" size="sm">Details</Button>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Info size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No stations found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargingStationsPage; 
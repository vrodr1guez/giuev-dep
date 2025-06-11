"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Battery, 
  Zap, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Download,
  CheckCircle,
  AlertCircle,
  Cpu,
  X,
  Settings,
  MapPin,
  ArrowDown
} from 'lucide-react';

const SmartGridVehiclesPage = () => {
  const [filterActive, setFilterActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock vehicles data
  const vehicles = [
    {
      id: '1',
      name: 'Tesla Model 3 LR',
      licensePlate: 'EV-123-456',
      status: 'online',
      v2gStatus: 'active',
      batteryLevel: 78,
      batteryCapacity: 75, // kWh
      location: 'Main Depot - Bay 12',
      lastActive: '2023-06-15T14:30:00Z',
      v2gEnabled: true,
      v2gRevenue: 186.75,
      driver: 'John Smith',
      department: 'Sales'
    },
    {
      id: '2',
      name: 'Nissan Leaf',
      licensePlate: 'EV-789-012',
      status: 'online',
      v2gStatus: 'standby',
      batteryLevel: 65,
      batteryCapacity: 62, // kWh
      location: 'City Hall Parking',
      lastActive: '2023-06-15T13:15:00Z',
      v2gEnabled: true,
      v2gRevenue: 124.50,
      driver: 'Emily Johnson',
      department: 'Operations'
    },
    {
      id: '3',
      name: 'Ford F-150 Lightning',
      licensePlate: 'EV-345-678',
      status: 'online',
      v2gStatus: 'standby',
      batteryLevel: 82,
      batteryCapacity: 131, // kWh
      location: 'Downtown Garage B',
      lastActive: '2023-06-15T12:45:00Z',
      v2gEnabled: true,
      v2gRevenue: 215.30,
      driver: 'Mike Williams',
      department: 'Facilities'
    },
    {
      id: '4',
      name: 'Chevrolet Bolt',
      licensePlate: 'EV-901-234',
      status: 'online',
      v2gStatus: 'charging',
      batteryLevel: 45,
      batteryCapacity: 65, // kWh
      location: 'Public Library Parking',
      lastActive: '2023-06-15T10:30:00Z',
      v2gEnabled: true,
      v2gRevenue: 98.25,
      driver: 'Sarah Davis',
      department: 'Marketing'
    },
    {
      id: '5',
      name: 'Hyundai Ioniq 5',
      licensePlate: 'EV-567-890',
      status: 'offline',
      v2gStatus: 'offline',
      batteryLevel: 74,
      batteryCapacity: 77, // kWh
      location: 'Central Plaza Parking',
      lastActive: '2023-06-14T18:20:00Z',
      v2gEnabled: true,
      v2gRevenue: 132.60,
      driver: 'David Wilson',
      department: 'IT'
    },
    {
      id: '6',
      name: 'Kia EV6',
      licensePlate: 'EV-234-567',
      status: 'online',
      v2gStatus: 'standby',
      batteryLevel: 88,
      batteryCapacity: 77, // kWh
      location: 'West Side Mall Parking',
      lastActive: '2023-06-15T14:10:00Z',
      v2gEnabled: true,
      v2gRevenue: 145.75,
      driver: 'Jennifer Brown',
      department: 'HR'
    },
    {
      id: '7',
      name: 'Rivian R1T',
      licensePlate: 'EV-890-123',
      status: 'maintenance',
      v2gStatus: 'offline',
      batteryLevel: 0,
      batteryCapacity: 135, // kWh
      location: 'Service Center',
      lastActive: '2023-06-10T09:15:00Z',
      v2gEnabled: false,
      v2gRevenue: 192.10,
      driver: 'Robert Miller',
      department: 'Field Services'
    }
  ];

  // Filter vehicles based on search term and status filter
  const filteredVehicles = vehicles.filter(vehicle => 
    (vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
     vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || vehicle.status === statusFilter || vehicle.v2gStatus === statusFilter)
  );

  // Sort vehicles based on selected option
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'battery') {
      return b.batteryLevel - a.batteryLevel;
    } else if (sortBy === 'v2g_revenue') {
      return b.v2gRevenue - a.v2gRevenue;
    } else if (sortBy === 'last_active') {
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }
    return 0;
  });

  // Generate stats
  const stats = {
    totalVehicles: vehicles.length,
    onlineVehicles: vehicles.filter(v => v.status === 'online').length,
    v2gActiveVehicles: vehicles.filter(v => v.v2gStatus === 'active').length,
    totalV2GRevenue: `$${vehicles.reduce((sum, vehicle) => sum + vehicle.v2gRevenue, 0).toFixed(2)}`,
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // V2G status styling
  const getV2GStatusStyles = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'standby':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'charging':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      case 'offline':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 dark:text-white"
          >
            Smart Grid Vehicles
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-3 mt-4 md:mt-0"
          >
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium py-2 px-4 rounded-lg flex items-center shadow-sm hover:shadow transition-shadow">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </motion.div>
        </div>
        
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Vehicles</p>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalVehicles}</h2>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                {stats.onlineVehicles} online now
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">V2G Active</p>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.v2gActiveVehicles}</h2>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Providing power to grid now
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Battery Level</p>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {Math.round(vehicles.reduce((sum, v) => sum + v.batteryLevel, 0) / vehicles.length)}%
                </h2>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Battery className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Across all operational vehicles
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total V2G Revenue</p>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalV2GRevenue}</h2>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ArrowDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              This month
            </div>
          </div>
        </motion.div>
        
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search vehicles by name, license plate, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterActive(!filterActive)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                  filterActive 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="battery">Sort by Battery Level</option>
                <option value="v2g_revenue">Sort by V2G Revenue</option>
                <option value="last_active">Sort by Last Active</option>
              </select>
            </div>
          </div>
          
          {filterActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Status</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="active">V2G Active</option>
                  <option value="standby">V2G Standby</option>
                  <option value="charging">Charging</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Departments</option>
                  <option value="sales">Sales</option>
                  <option value="operations">Operations</option>
                  <option value="facilities">Facilities</option>
                  <option value="marketing">Marketing</option>
                  <option value="it">IT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Battery Level</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Any Level</option>
                  <option value="high">High (75%+)</option>
                  <option value="medium">Medium (40-75%)</option>
                  <option value="low">Low (Below 40%)</option>
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Vehicles List */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {sortedVehicles.map((vehicle, index) => (
            <motion.div 
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
                {/* Vehicle Info */}
                <div className="p-6 md:col-span-1 flex">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg h-fit mr-4 flex-shrink-0">
                    <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{vehicle.name}</h3>
                      {vehicle.status === 'online' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      ) : vehicle.status === 'offline' ? (
                        <X className="h-4 w-4 text-gray-400 ml-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.licensePlate}</div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getV2GStatusStyles(vehicle.v2gStatus)}`}>
                        V2G: {vehicle.v2gStatus.charAt(0).toUpperCase() + vehicle.v2gStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 p-6 md:col-span-2 lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery</div>
                      <div className="mt-1 flex items-center">
                        <Battery className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-800 dark:text-white">{vehicle.batteryLevel}%</span>
                            <span className="text-gray-500 dark:text-gray-400">{vehicle.batteryCapacity} kWh</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                vehicle.batteryLevel > 60 ? 'bg-green-500' : 
                                vehicle.batteryLevel > 30 ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${vehicle.batteryLevel}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
                      <div className="mt-1 flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span className="text-gray-800 dark:text-white">{vehicle.location}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver</div>
                      <div className="mt-1 text-gray-800 dark:text-white">{vehicle.driver}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{vehicle.department}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</div>
                      <div className="mt-1 text-gray-800 dark:text-white">
                        {formatDate(vehicle.lastActive)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(vehicle.lastActive)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">V2G Revenue</div>
                      <div className="mt-1 text-green-600 dark:text-green-400 font-medium">
                        ${vehicle.v2gRevenue.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        This month
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions Column */}
                <div className="border-t md:border-l border-gray-100 dark:border-gray-700 p-6 md:col-span-1 flex flex-col justify-center">
                  <div className="space-y-3">
                    <a
                      href={`/ev-management/smart-grid/vehicles/${vehicle.id}`}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                    <a
                      href={`/ev-management/smart-grid/vehicles/${vehicle.id}/settings`}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {sortedVehicles.length === 0 && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-10 text-center">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No vehicles found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SmartGridVehiclesPage; 
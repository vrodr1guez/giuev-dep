/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { 
  AlertCircle, Battery, Zap, Navigation, Map, 
  CheckSquare, MessageSquare, Award, Menu, X,
  CornerUpRight, Clock, Calendar, TrendingUp, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

// Simple placeholder for PulsingEnergyIndicator
const PulsingEnergyIndicator = ({ color, size, pulseIntensity }: any) => (
  <div 
    className="absolute -top-1 -right-1 rounded-full animate-pulse" 
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: color,
      opacity: pulseIntensity === 'low' ? 0.6 : 0.8 
    }} 
  />
);

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface RouteWaypoint {
  id: string;
  type: 'start' | 'stop' | 'charging' | 'destination';
  name: string;
  address: string;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

interface Route {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  estimatedDistance: number;
  estimatedDuration: number;
  estimatedEnergyUsage: number;
  waypoints: RouteWaypoint[];
}

interface VehicleStatus {
  id: string;
  name: string;
  licensePlate: string;
  model: string;
  stateOfCharge: number;
  estimatedRange: number;
  status: 'available' | 'charging' | 'in_use' | 'maintenance';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const DriverMobileView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('route');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [expandedWaypoint, setExpandedWaypoint] = React.useState(null as string | null);

  // Tab navigation items
  const tabs: TabItem[] = [
    { id: 'route', label: 'My Route', icon: <Navigation size={20} /> },
    { id: 'vehicle', label: 'Vehicle', icon: <Battery size={20} /> },
    { id: 'charging', label: 'Charging', icon: <Zap size={20} /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={20} /> },
    { id: 'scorecard', label: 'Scorecard', icon: <Award size={20} /> },
  ];

  // Mock data for current route
  const currentRoute: Route = {
    id: 'route-123',
    title: 'Downtown Delivery Route',
    description: '5 deliveries in downtown area',
    date: '2024-05-16',
    status: 'in_progress',
    estimatedDistance: 35.2,
    estimatedDuration: 125,
    estimatedEnergyUsage: 15.5,
    waypoints: [
      {
        id: 'wp-1',
        type: 'start',
        name: 'Main Depot',
        address: '123 Industrial Ave, Business District',
        departureTime: '08:00 AM',
        notes: 'Check with dispatch before departure'
      },
      {
        id: 'wp-2',
        type: 'stop',
        name: 'Office Supplies Co.',
        address: '456 Business St, Downtown',
        arrivalTime: '08:25 AM',
        departureTime: '08:45 AM',
        notes: 'Deliver to loading dock, ask for John'
      },
      {
        id: 'wp-3',
        type: 'stop',
        name: 'City Hospital',
        address: '789 Health Ave, Medical District',
        arrivalTime: '09:10 AM',
        departureTime: '09:30 AM',
        notes: 'Priority delivery, use dedicated EV parking'
      },
      {
        id: 'wp-4',
        type: 'charging',
        name: 'Downtown Fast Charging',
        address: '321 Energy St, Downtown',
        arrivalTime: '09:45 AM',
        departureTime: '10:15 AM',
        notes: 'Charge to at least 80%'
      },
      {
        id: 'wp-5',
        type: 'stop',
        name: 'Tech Innovations Inc.',
        address: '555 Technology Blvd, Innovation Park',
        arrivalTime: '10:40 AM',
        departureTime: '11:00 AM',
        notes: 'Fragile items, handle with care'
      },
      {
        id: 'wp-6',
        type: 'destination',
        name: 'Main Depot',
        address: '123 Industrial Ave, Business District',
        arrivalTime: '11:30 AM'
      }
    ]
  };

  // Mock data for vehicle status
  const vehicleStatus: VehicleStatus = {
    id: 'vehicle-456',
    name: 'Van 12',
    licensePlate: 'EV-12345',
    model: 'Ford E-Transit',
    stateOfCharge: 68,
    estimatedRange: 120,
    status: 'in_use',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Current St, Downtown'
    }
  };

  // Mock data for nearby charging stations
  const nearbyChargingStations = [
    {
      id: 'cs-1',
      name: 'Downtown Fast Charging',
      distance: 2.1,
      availability: '3/4 available',
      power: '150 kW DC',
      connectors: ['CCS', 'CHAdeMO'],
      address: '321 Energy St, Downtown'
    },
    {
      id: 'cs-2',
      name: 'Central Mall Charging',
      distance: 3.5,
      availability: '2/6 available',
      power: '50 kW DC',
      connectors: ['CCS'],
      address: '456 Shopping Ave, Downtown'
    },
    {
      id: 'cs-3',
      name: 'City Public Charging',
      distance: 4.2,
      availability: '5/8 available',
      power: '22 kW AC',
      connectors: ['Type 2'],
      address: '789 Public Rd, Civic Center'
    }
  ];

  // Mock data for vehicle checklist
  const checklist = {
    preTrip: [
      { id: 'pre-1', task: 'Check tire pressure', completed: true },
      { id: 'pre-2', task: 'Verify battery charge level', completed: true },
      { id: 'pre-3', task: 'Check headlights & signals', completed: true },
      { id: 'pre-4', task: 'Inspect windshield & wipers', completed: false },
      { id: 'pre-5', task: 'Check brake function', completed: true }
    ],
    postTrip: [
      { id: 'post-1', task: 'Connect to charger', completed: false },
      { id: 'post-2', task: 'Report any issues', completed: false },
      { id: 'post-3', task: 'Complete delivery confirmation', completed: false },
      { id: 'post-4', task: 'Secure vehicle', completed: false },
      { id: 'post-5', task: 'Submit trip report', completed: false }
    ]
  };

  // Mock data for driver scorecard
  const driverScorecard = {
    efficiency: 87,
    trend: 'improving',
    categories: [
      { name: 'Energy Efficiency', score: 90, change: '+2.5' },
      { name: 'Smooth Driving', score: 85, change: '+5.0' },
      { name: 'Regenerative Braking', score: 92, change: '+1.2' },
      { name: 'Optimal Speed', score: 88, change: '+3.7' },
      { name: 'Route Adherence', score: 95, change: '0.0' }
    ],
    tips: [
      'Continue to maintain a consistent speed on highways',
      'Use climate control efficiently by pre-conditioning while connected to charger',
      'Try to anticipate stops to maximize regenerative braking'
    ]
  };

  // Function to get waypoint icon
  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-full shadow-md">{expandedWaypoint ? <Map size={18} color="white" /> : <Map size={16} color="white" />}</div>;
      case 'stop':
        return <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-full shadow-md">{expandedWaypoint ? <CheckSquare size={18} color="white" /> : <CheckSquare size={16} color="white" />}</div>;
      case 'charging':
        return <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-full shadow-md">{expandedWaypoint ? <Zap size={18} color="white" /> : <Zap size={16} color="white" />}</div>;
      case 'destination':
        return <div className="bg-gradient-to-r from-red-400 to-red-500 p-2 rounded-full shadow-md">{expandedWaypoint ? <Map size={18} color="white" /> : <Map size={16} color="white" />}</div>;
      default:
        return <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-2 rounded-full shadow-md">{expandedWaypoint ? <Map size={18} color="white" /> : <Map size={16} color="white" />}</div>;
    }
  };

  // Function to get battery status color
  const getBatteryStatusColor = (soc: number) => {
    if (soc >= 60) return 'text-green-500';
    if (soc >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Function to toggle waypoint details
  const toggleWaypoint = (id: string) => {
    if (expandedWaypoint === id) {
      setExpandedWaypoint(null);
    } else {
      setExpandedWaypoint(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[667px] w-[375px] bg-white border border-gray-300 rounded-xl overflow-hidden shadow-xl"
    >
      {/* Mobile app header with nav toggle */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Battery size={20} />
            <PulsingEnergyIndicator color="#fff" size={6} pulseIntensity="low" />
          </div>
          <span className="font-medium">GIU EV Fleet</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen(!menuOpen)} 
          className="p-1 rounded-md hover:bg-white/20 transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile navigation menu (appears when toggled) */}
      {menuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-200 shadow-lg"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                <span className="text-blue-600 font-bold">JS</span>
              </div>
              <div>
                <div className="font-medium">John Smith</div>
                <div className="text-sm text-gray-500">Driver #D12345</div>
              </div>
            </div>
            <div className="space-y-1">
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    activeTab === tab.id ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMenuOpen(false);
                  }}
                >
                  <div className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}>
                    {tab.icon}
                  </div>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
              <motion.button 
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all hover:bg-gray-100 mt-4 text-gray-500"
              >
                <MessageSquare size={20} />
                <span>Contact Dispatch</span>
              </motion.button>
              <motion.button 
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all hover:bg-gray-100 text-gray-500"
              >
                <AlertCircle size={20} />
                <span>Report Issue</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* My Route Tab */}
        {activeTab === 'route' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{currentRoute.title}</h2>
              <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-medium shadow-sm">
                In Progress
              </span>
            </div>
            <p className="text-gray-500 text-sm">{currentRoute.description}</p>
            
            <div className="flex items-center justify-between bg-white p-3 rounded-lg text-sm shadow-sm">
              <div className="text-center">
                <p className="text-gray-500">Distance</p>
                <p className="font-bold">{currentRoute.estimatedDistance} km</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Duration</p>
                <p className="font-bold">{Math.floor(currentRoute.estimatedDuration / 60)}h {currentRoute.estimatedDuration % 60}m</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Energy</p>
                <p className="font-bold">{currentRoute.estimatedEnergyUsage} kWh</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Route Waypoints</h3>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <Navigation size={14} />
                  <span>Open in Maps</span>
                </motion.button>
              </div>
              
              <div className="space-y-2">
                {currentRoute.waypoints.map((waypoint, index) => (
                  <motion.div 
                    key={waypoint.id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-white border rounded-lg overflow-hidden shadow-sm ${expandedWaypoint === waypoint.id ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'}`}
                    onClick={() => toggleWaypoint(waypoint.id)}
                    whileHover={{ y: -2, transition: { duration: 0.1 } }}
                  >
                    <div className="flex items-center p-3 cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          {getWaypointIcon(waypoint.type)}
                          {index < currentRoute.waypoints.length - 1 && (
                            <div className="absolute top-[calc(100%+2px)] left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{waypoint.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{waypoint.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {waypoint.arrivalTime 
                            ? `Arrive: ${waypoint.arrivalTime}` 
                            : waypoint.departureTime 
                              ? `Depart: ${waypoint.departureTime}` 
                              : ''}
                        </p>
                        {expandedWaypoint === waypoint.id ? (
                          <div className="p-1 bg-gray-100 rounded">
                            <X size={14} />
                          </div>
                        ) : (
                          <div className="p-1 bg-gray-100 rounded">
                            <CornerUpRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {expandedWaypoint === waypoint.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="px-3 py-2 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 text-sm"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {waypoint.arrivalTime && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <Clock size={14} />
                              <span>Arrival: {waypoint.arrivalTime}</span>
                            </div>
                          )}
                          {waypoint.departureTime && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <Clock size={14} />
                              <span>Departure: {waypoint.departureTime}</span>
                            </div>
                          )}
                        </div>
                        {waypoint.notes && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Notes:</p>
                            <p className="text-xs text-gray-600">{waypoint.notes}</p>
                          </div>
                        )}
                        <div className="mt-2 flex justify-end gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded shadow-sm"
                          >
                            Navigate
                          </motion.button>
                          {waypoint.type === 'stop' && (
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded shadow-sm"
                            >
                              Complete
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Vehicle Status Tab */}
        {activeTab === 'vehicle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Vehicle Status</h2>
              <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-medium shadow-sm">
                {vehicleStatus.status === 'in_use' ? 'In Use' : vehicleStatus.status}
              </span>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="font-medium">{vehicleStatus.name}</p>
                  <p className="text-sm text-gray-500">{vehicleStatus.model}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{vehicleStatus.licensePlate}</p>
                  <p className="text-sm text-gray-500">License Plate</p>
                </div>
              </div>
              
              <div className="mt-4 mb-2">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Battery Level</p>
                  <p className={`text-sm font-bold ${getBatteryStatusColor(vehicleStatus.stateOfCharge)}`}>
                    {vehicleStatus.stateOfCharge}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full relative ${
                      vehicleStatus.stateOfCharge >= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                      vehicleStatus.stateOfCharge >= 30 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${vehicleStatus.stateOfCharge}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-lg text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Est. Range</p>
                  <p className="font-bold">{vehicleStatus.estimatedRange} km</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Required</p>
                  <p className="font-bold">35 km</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Status</p>
                  <p className="font-bold text-green-600">Sufficient</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium">Current Location</h3>
              </div>
              <div className="p-4">
                {vehicleStatus.location ? (
                  <>
                    <div className="h-40 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <p className="text-gray-500">Map Would Be Displayed Here</p>
                    </div>
                    <p className="text-sm font-medium">{vehicleStatus.location.address}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Location data not available</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-3 mt-6">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md"
              >
                <Navigation size={18} />
                <span>Navigate to Next Stop</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md"
              >
                <AlertCircle size={18} />
                <span>Report Issue</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Charging Tab */}
        {activeTab === 'charging' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Charging</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                vehicleStatus.stateOfCharge >= 60 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 
                vehicleStatus.stateOfCharge >= 30 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' : 
                'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
              }`}>
                {vehicleStatus.stateOfCharge}% Battery
              </span>
            </div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <h3 className="font-medium mb-2">Current Battery Status</h3>
              
              <div className="mt-4 mb-2">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium">Battery Level</p>
                  <p className={`text-sm font-bold ${getBatteryStatusColor(vehicleStatus.stateOfCharge)}`}>
                    {vehicleStatus.stateOfCharge}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full relative ${
                      vehicleStatus.stateOfCharge >= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                      vehicleStatus.stateOfCharge >= 30 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${vehicleStatus.stateOfCharge}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-lg text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Est. Range</p>
                  <p className="font-bold">{vehicleStatus.estimatedRange} km</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">To Destination</p>
                  <p className="font-bold">35 km</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Status</p>
                  <p className="font-bold text-green-600">Sufficient</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="font-medium mb-2">Nearby Charging Stations</h3>
              
              <div className="space-y-2">
                {nearbyChargingStations.map((station, index) => (
                  <motion.div 
                    key={station.id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.1 } }}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{station.name}</p>
                        <p className="text-xs text-gray-500">{station.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{station.distance} km</p>
                        <p className="text-xs text-green-600">{station.availability}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs">
                      <div className="flex gap-1">
                        {station.connectors.map((connector, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded">
                            {connector}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          {station.power}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs shadow-sm"
                      >
                        Navigate
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="font-medium">Next Planned Charging</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {getWaypointIcon('charging')}
                  <div>
                    <p className="font-medium">Downtown Fast Charging</p>
                    <p className="text-xs text-gray-500">321 Energy St, Downtown</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Clock size={14} />
                    <span>Arrival: 09:45 AM</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Clock size={14} />
                    <span>Departure: 10:15 AM</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p>Notes: Charge to at least 80%</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded shadow-sm"
                  >
                    Navigate
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Vehicle Checklists</h2>
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full shadow-sm">
                <Calendar size={14} />
                <span>May 16, 2024</span>
              </div>
            </div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Pre-Trip Checklist</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs shadow-sm">
                  4/5 Completed
                </span>
              </div>
              <div className="p-2">
                {checklist.preTrip.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
                    className="flex items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        className="h-4 w-4 rounded text-blue-600 sr-only peer"
                        onChange={() => {}} // In a real app, this would update the state
                      />
                      <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        item.completed ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {item.completed && <Check size={12} color="white" />}
                      </div>
                    </div>
                    <span className={`ml-3 text-sm transition-all ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.task}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Post-Trip Checklist</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full text-xs shadow-sm">
                  0/5 Completed
                </span>
              </div>
              <div className="p-2">
                {checklist.postTrip.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                    className="flex items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        className="h-4 w-4 rounded text-blue-600 sr-only peer"
                        onChange={() => {}} // In a real app, this would update the state
                      />
                      <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                        item.completed ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {item.completed && <Check size={12} color="white" />}
                      </div>
                    </div>
                    <span className={`ml-3 text-sm transition-all ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.task}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <div className="flex justify-center mt-3">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md"
              >
                Submit Completed Checklist
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Scorecard Tab */}
        {activeTab === 'scorecard' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Driver Scorecard</h2>
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full shadow-sm">
                <TrendingUp size={14} />
                <span className="font-medium">{driverScorecard.trend}</span>
              </span>
            </div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="10" 
                  />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${driverScorecard.efficiency * 2.83} 283` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={
                      driverScorecard.efficiency >= 85 ? 'url(#scoreGradient)' :
                      driverScorecard.efficiency >= 70 ? '#eab308' : 
                      '#ef4444'
                    }
                    strokeWidth="10" 
                    strokeDashoffset="0" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-3xl font-bold"
                  >
                    {driverScorecard.efficiency}
                  </motion.span>
                  <span className="text-xs text-gray-500">Efficiency Score</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="font-medium">Performance Categories</h3>
              </div>
              <div className="p-3">
                {driverScorecard.categories.map((category, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 + index * 0.08 }}
                    className="mb-3 last:mb-0"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm">{category.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{category.score}</span>
                        <span className={`text-xs ${parseFloat(category.change) > 0 ? 'text-green-600' : parseFloat(category.change) < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {category.change}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${category.score}%` }}
                        transition={{ duration: 0.7, delay: 0.4 + index * 0.08 }}
                        className={`h-2 rounded-full relative ${
                          category.score >= 85 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                          category.score >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="font-medium">Efficiency Tips</h3>
              </div>
              <div className="p-3">
                <ul className="space-y-2">
                  {driverScorecard.tips.map((tip, index) => (
                    <motion.li 
                      key={index} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.4 + index * 0.1 }}
                      className="text-sm flex items-start gap-2"
                    >
                      <div className="mt-0.5 text-green-500 bg-green-50 p-0.5 rounded">
                        <CheckSquare size={14} />
                      </div>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Bottom tab navigation */}
      <div className="bg-white border-t border-gray-200 py-2 px-4 grid grid-cols-5 gap-1 shadow-lg">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md ${
              activeTab === tab.id ? 
              'text-blue-600 bg-gradient-to-b from-blue-50 to-transparent' : 
              'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
            {tab.icon}
            <span className="text-[10px] mt-1">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default DriverMobileView; 
"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  BarChart2, 
  ChevronRight,
  ChevronDown,
  ArrowUp, 
  Battery,
  Car,
  MapPin,
  Check,
  X,
  Download,
  FileText,
  CheckCircle,
  Layers,
  Activity,
  Users,
  Info
} from 'lucide-react';

type EventDetailProps = {
  params: {
    id: string;
  };
};

const EventDetail = ({ params }: EventDetailProps) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(['details', 'participants'] as string[]);

  // Mock event data
  const event = {
    id,
    name: 'Peak Demand Response Event',
    type: 'demand_response',
    status: 'active',
    startTime: '2023-06-15T14:00:00Z',
    endTime: '2023-06-15T18:00:00Z',
    description: 'Critical peak load reduction event triggered by grid operator due to extreme heat conditions and high AC usage in the service area.',
    severity: 'high',
    location: 'Northern Grid Sector',
    targetReduction: 1240, // kW
    currentReduction: 967, // kW
    percentComplete: 78,
    vehiclesParticipating: 42,
    energyProvided: 3868, // kWh
    estimatedRevenue: 1160.40, // $
    operator: 'PG&E Grid Services',
    notificationSent: '2023-06-15T12:30:00Z',
    forecasts: {
      demandWithoutResponse: [1800, 1950, 2100, 2000, 1900, 1800],
      demandWithResponse: [1800, 1650, 1580, 1500, 1450, 1400],
      timeLabels: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    },
    notes: [
      {
        id: 'note-1',
        author: 'System',
        content: 'Event automatically triggered based on grid conditions',
        timestamp: '2023-06-15T12:28:00Z'
      },
      {
        id: 'note-2',
        author: 'Jane Smith',
        content: 'Increased vehicle participation target to meet grid requirements',
        timestamp: '2023-06-15T13:15:00Z'
      }
    ],
    participants: [
      {
        id: 'v-123',
        name: 'Tesla Model 3 Fleet #7',
        vehicleCount: 12,
        status: 'active',
        energyProvided: 720,
        currentPower: 180,
        location: 'Downtown Charging Hub'
      },
      {
        id: 'v-456',
        name: 'Municipal Bus Depot',
        vehicleCount: 8,
        status: 'active',
        energyProvided: 1240,
        currentPower: 310,
        location: 'Central Bus Terminal'
      },
      {
        id: 'v-789',
        name: 'Logistics Company EVs',
        vehicleCount: 15,
        status: 'active',
        energyProvided: 1125,
        currentPower: 290,
        location: 'Distribution Center'
      },
      {
        id: 'v-101',
        name: 'Corporate Campus',
        vehicleCount: 7,
        status: 'partial',
        energyProvided: 783,
        currentPower: 152,
        location: 'Tech Park Charging Area'
      }
    ],
    powerProgress: 85, // percentage of requested power currently being provided
    energyProgress: 62, // percentage of requested energy delivered so far
    revenueGenerated: 112.50, // $ so far
    carbonOffset: 187.5, // kg
    gridPrice: 0.38, // $ per kWh during event
    utility: 'Pacific Gas & Electric',
    utilityContactPerson: 'Sarah Johnson',
    utilityContactEmail: 'sjohnson@pge-example.com'
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

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(event.endTime);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return { hours: 0, minutes: 0 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const timeRemaining = calculateTimeRemaining();

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layers className="h-5 w-5 mr-2" /> },
    { id: 'participants', label: 'Participants', icon: <Car className="h-5 w-5 mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { id: 'history', label: 'Event History', icon: <Clock className="h-5 w-5 mr-2" /> }
  ];

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Event status styling
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'pending':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'completed':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management/smart-grid" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Grid</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/ev-management/smart-grid/events" className="hover:text-blue-600 dark:hover:text-blue-400">Grid Events</a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800 dark:text-white">{event.name}</span>
        </div>

        {/* Event Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className={`p-3 rounded-lg mr-4 ${
              event.severity === 'high' 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : event.severity === 'medium'
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <AlertTriangle className={`h-8 w-8 ${
                event.severity === 'high' 
                  ? 'text-red-600 dark:text-red-400' 
                  : event.severity === 'medium'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{event.name}</h1>
              <div className="flex flex-wrap items-center text-gray-500 dark:text-gray-400 mt-1 gap-3">
                <span>ID: {event.id}</span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {event.location}
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-4 md:mt-0"
          >
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusStyles(event.status)}`}>
              <div className={`h-2 w-2 rounded-full mr-2 ${
                event.status === 'active' ? 'bg-green-500' : 
                event.status === 'pending' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </div>
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center hover:shadow-sm">
              <FileText className="h-4 w-4 mr-1" /> Export Report
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center hover:shadow-sm">
              <CheckCircle className="h-4 w-4 mr-1" /> Save
            </button>
          </motion.div>
        </div>

        {/* Event Description */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-3/4 md:pr-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Event Description</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Date</h3>
                  <p className="text-gray-800 dark:text-white flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(event.startTime)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Period</h3>
                  <p className="text-gray-800 dark:text-white flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Grid Operator</h3>
                  <p className="text-gray-800 dark:text-white flex items-center mt-1">
                    <Zap className="h-4 w-4 mr-2 text-gray-400" />
                    {event.operator}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/4 mt-6 md:mt-0 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Remaining</h3>
                <div className="flex items-end">
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">
                    {timeRemaining.hours}:{timeRemaining.minutes < 10 ? `0${timeRemaining.minutes}` : timeRemaining.minutes}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 ml-2 mb-1">hr:min</div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${event.percentComplete}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {event.percentComplete}% Complete
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md border border-gray-100 dark:border-gray-700 p-1"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium min-w-max ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-b-xl shadow-md border-x border-b border-gray-100 dark:border-gray-700 p-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Status Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Target Reduction Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Reduction</h3>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{event.targetReduction} kW</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current: {event.currentReduction} kW</div>
                    </div>
                    <div className="flex items-center justify-center h-8 px-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {Math.round((event.currentReduction / event.targetReduction) * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Participating Vehicles Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Participating Vehicles</h3>
                    <Car className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{event.vehiclesParticipating}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Across {event.participants.length} fleets</div>
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </motion.div>

                {/* Revenue Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Revenue</h3>
                    <Download className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">${event.estimatedRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{event.energyProvided} kWh provided</div>
                    </div>
                    <div className="flex items-center justify-center h-8 px-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">+12%</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Demand Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Demand Reduction Impact</h3>
                <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <BarChart2 className="h-10 w-10 mx-auto mb-2" />
                    <p>Interactive demand chart would be displayed here</p>
                    <p className="text-sm">Showing forecast vs. actual demand reduction</p>
                  </div>
                </div>
              </motion.div>

              {/* Event Notes */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Event Notes</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 flex items-center">
                    Add Note <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {event.notes.map(note => (
                    <div key={note.id} className="border-l-2 border-blue-400 dark:border-blue-500 pl-4 py-2">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium text-gray-800 dark:text-white">{note.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(note.timestamp)} {formatTime(note.timestamp)}
                        </p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick View of Participants */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Participating Fleets</h3>
                  <button
                    onClick={() => setActiveTab('participants')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fleet Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Power</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Energy Provided</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {event.participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-3 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-white">{participant.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{participant.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                            {participant.vehicleCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              participant.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                            }`}>
                              {participant.status === 'active' ? (
                                <><Check className="h-3 w-3 mr-1" /> Active</>
                              ) : (
                                <><AlertTriangle className="h-3 w-3 mr-1" /> Partial</>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-800 dark:text-white">{participant.currentPower} kW</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-800 dark:text-white">{participant.energyProvided} kWh</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Detailed list of all participating vehicle fleets, their current status, and contribution to this grid event.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Fleets</h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{event.participants.length}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicles Participating</h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{event.vehiclesParticipating}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Load</h4>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {(event.currentReduction / event.vehiclesParticipating).toFixed(1)} kW per vehicle
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Interactive list of participants */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {event.participants.map((participant) => (
                    <div key={participant.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="mr-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{participant.name}</h4>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {participant.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                          }`}>
                            {participant.status === 'active' ? 'Active' : 'Partial'}
                          </span>
                          <button 
                            onClick={() => toggleSection(participant.id)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            {expandedSections.includes(participant.id) ? (
                              <ArrowUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {expandedSections.includes(participant.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-6 pl-16"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicles</h5>
                              <p className="text-gray-800 dark:text-white">{participant.vehicleCount}</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Power</h5>
                              <p className="text-gray-800 dark:text-white">{participant.currentPower} kW</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Energy Provided</h5>
                              <p className="text-gray-800 dark:text-white">{participant.energyProvided} kWh</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                              View Details
                            </button>
                            <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                              Message Fleet
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics and History tabs would be implemented similarly */}
          {activeTab === 'analytics' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Analytics Coming Soon</h3>
              <p>Detailed analytics for this grid event are currently under development.</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Event History</h3>
              <p>Timeline and historical data for this grid event will be available here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail; 
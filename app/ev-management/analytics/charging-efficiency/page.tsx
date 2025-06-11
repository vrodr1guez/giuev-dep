"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Zap, TrendingUp, TrendingDown, Activity, Clock, 
  Download, Filter, RefreshCw, Settings, Target, BarChart3, 
  Gauge, Loader2, Battery, CheckCircle, AlertCircle, MapPin,
  ThermometerSun, Timer, User, Car, Plug
} from 'lucide-react';

// Types for efficiency data
interface EfficiencyMetric {
  stationId: string;
  stationName: string;
  location: string;
  efficiency: number;
  powerDelivered: number;
  energyLoss: number;
  utilizationRate: number;
  avgChargingTime: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface ChargingSession {
  id: string;
  stationId: string;
  vehicleType: string;
  startTime: string;
  duration: number;
  energyDelivered: number;
  powerRating: number;
  efficiency: number;
  cost: number;
}

interface OptimizationRecommendation {
  id: string;
  type: 'efficiency' | 'utilization' | 'maintenance' | 'configuration';
  title: string;
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  stations: string[];
}

export default function ChargingEfficiencyPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedStation, setSelectedStation] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Sample efficiency metrics
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetric[]>([
    {
      stationId: 'ST001',
      stationName: 'Corporate HQ Alpha',
      location: 'Downtown Plaza',
      efficiency: 94.2,
      powerDelivered: 47.8,
      energyLoss: 2.9,
      utilizationRate: 78.5,
      avgChargingTime: 42,
      status: 'excellent'
    },
    {
      stationId: 'ST002',
      stationName: 'Corporate HQ Beta',
      location: 'Downtown Plaza',
      efficiency: 91.8,
      powerDelivered: 45.2,
      energyLoss: 4.1,
      utilizationRate: 82.1,
      avgChargingTime: 38,
      status: 'good'
    },
    {
      stationId: 'ST003',
      stationName: 'Distribution Center',
      location: 'Industrial Zone',
      efficiency: 87.3,
      powerDelivered: 41.6,
      energyLoss: 6.2,
      utilizationRate: 65.4,
      avgChargingTime: 51,
      status: 'warning'
    },
    {
      stationId: 'ST004',
      stationName: 'Retail Central',
      location: 'City Center',
      efficiency: 89.1,
      powerDelivered: 43.8,
      energyLoss: 5.4,
      utilizationRate: 71.8,
      avgChargingTime: 47,
      status: 'good'
    },
    {
      stationId: 'ST005',
      stationName: 'Remote Station',
      location: 'Suburban Area',
      efficiency: 74.6,
      powerDelivered: 35.2,
      energyLoss: 12.1,
      utilizationRate: 54.3,
      avgChargingTime: 63,
      status: 'critical'
    }
  ]);

  // Sample charging sessions
  const [chargingSessions, setChargingSessions] = useState<ChargingSession[]>([
    { id: 'CS001', stationId: 'ST001', vehicleType: 'Tesla Model 3', startTime: '08:30', duration: 35, energyDelivered: 42.5, powerRating: 50, efficiency: 95.1, cost: 12.75 },
    { id: 'CS002', stationId: 'ST002', vehicleType: 'BMW i4', startTime: '09:15', duration: 28, energyDelivered: 38.2, powerRating: 50, efficiency: 92.3, cost: 11.46 },
    { id: 'CS003', stationId: 'ST001', vehicleType: 'Nissan Leaf', startTime: '11:45', duration: 45, energyDelivered: 31.8, powerRating: 43, efficiency: 88.7, cost: 9.54 },
    { id: 'CS004', stationId: 'ST003', vehicleType: 'Ford Mustang Mach-E', startTime: '14:20', duration: 52, energyDelivered: 48.6, powerRating: 50, efficiency: 86.2, cost: 14.58 },
    { id: 'CS005', stationId: 'ST004', vehicleType: 'Audi e-tron', startTime: '16:30', duration: 41, energyDelivered: 44.1, powerRating: 50, efficiency: 90.8, cost: 13.23 }
  ]);

  // Sample optimization recommendations
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([
    {
      id: 'R001',
      type: 'efficiency',
      title: 'Cable Resistance Optimization',
      description: 'Replace aging charging cables to reduce resistance and improve power delivery efficiency',
      impact: 8.5,
      effort: 'medium',
      timeline: '2-3 weeks',
      stations: ['ST003', 'ST005']
    },
    {
      id: 'R002',
      type: 'utilization',
      title: 'Smart Load Balancing',
      description: 'Implement dynamic load balancing to optimize power distribution across multiple charging sessions',
      impact: 12.3,
      effort: 'high',
      timeline: '6-8 weeks',
      stations: ['ST001', 'ST002', 'ST004']
    },
    {
      id: 'R003',
      type: 'maintenance',
      title: 'Preventive Cooling System Maintenance',
      description: 'Schedule enhanced cooling system maintenance to prevent thermal throttling during peak usage',
      impact: 6.7,
      effort: 'low',
      timeline: '1-2 weeks',
      stations: ['ST003', 'ST005']
    },
    {
      id: 'R004',
      type: 'configuration',
      title: 'Power Management Firmware Update',
      description: 'Deploy latest firmware with improved power management algorithms',
      impact: 4.2,
      effort: 'low',
      timeline: '1 week',
      stations: ['ST001', 'ST002', 'ST003', 'ST004', 'ST005']
    }
  ]);

  const timeframes = [
    { value: 'today', label: 'Today', period: '24h' },
    { value: 'week', label: 'Last 7 Days', period: '7d' },
    { value: 'month', label: 'Last 30 Days', period: '30d' },
    { value: 'quarter', label: 'Last Quarter', period: '90d' }
  ];

  const stations = [
    { value: 'all', label: 'All Stations' },
    ...efficiencyMetrics.map(station => ({
      value: station.stationId,
      label: station.stationName
    }))
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'utilization': return <Activity className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'configuration': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Efficiency Analytics</h2>
          <p className="text-gray-500">Analyzing charging performance and optimizing station efficiency...</p>
        </div>
      </div>
    );
  }

  const avgEfficiency = efficiencyMetrics.reduce((sum, station) => sum + station.efficiency, 0) / efficiencyMetrics.length;
  const avgUtilization = efficiencyMetrics.reduce((sum, station) => sum + station.utilizationRate, 0) / efficiencyMetrics.length;
  const totalEnergyDelivered = chargingSessions.reduce((sum, session) => sum + session.energyDelivered, 0);
  const avgChargingTime = chargingSessions.reduce((sum, session) => sum + session.duration, 0) / chargingSessions.length;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link 
          href="/ev-management/analytics" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analytics Dashboard
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Charging Efficiency Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis of charging station performance, energy efficiency, and optimization opportunities
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label} ({tf.period})
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center bg-white shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Avg Efficiency</div>
              <div className="text-2xl font-bold text-blue-900">{avgEfficiency.toFixed(1)}%</div>
              <div className="text-sm text-blue-600 flex items-center">
                +3.2% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-700">across all stations</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Utilization Rate</div>
              <div className="text-2xl font-bold text-green-900">{avgUtilization.toFixed(1)}%</div>
              <div className="text-sm text-green-600 flex items-center">
                +5.7% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-green-700">station capacity used</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Battery className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Energy Delivered</div>
              <div className="text-2xl font-bold text-purple-900">{totalEnergyDelivered.toFixed(1)} kWh</div>
              <div className="text-sm text-purple-600 flex items-center">
                +12.4% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-700">total sessions today</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">Avg Session Time</div>
              <div className="text-2xl font-bold text-orange-900">{avgChargingTime.toFixed(0)} min</div>
              <div className="text-sm text-orange-600 flex items-center">
                -4.1% <TrendingDown className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-orange-700">faster charging times</div>
        </div>
      </div>

      {/* Station Performance Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Station Efficiency Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed efficiency metrics and performance analysis for each charging station</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white"
              >
                {stations.map((station) => (
                  <option key={station.value} value={station.value}>
                    {station.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Station Metrics */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Station Efficiency Metrics</h3>
            <div className="space-y-4">
              {efficiencyMetrics.map((station) => (
                <div key={station.stationId} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Plug className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{station.stationName}</h4>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {station.location}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                      {station.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="ml-2 font-bold text-blue-600">{station.efficiency}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Power:</span>
                      <span className="ml-2 font-medium">{station.powerDelivered} kW</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Energy Loss:</span>
                      <span className="ml-2 font-medium text-red-600">{station.energyLoss}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Time:</span>
                      <span className="ml-2 font-medium">{station.avgChargingTime} min</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Utilization Rate</span>
                      <span>{station.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          station.utilizationRate > 80 ? 'bg-green-500' : 
                          station.utilizationRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${station.utilizationRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Trends */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Efficiency Trends</h3>
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 h-80 rounded-lg flex items-center justify-center border border-gray-100 mb-6">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Real-time Efficiency Monitoring</h4>
                <p className="text-sm text-gray-600 max-w-sm">
                  Live tracking of charging efficiency, power delivery rates, and performance optimization metrics
                </p>
                <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                  View Live Dashboard
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600 font-medium">Peak Efficiency</div>
                <div className="text-lg font-bold text-blue-900">94.2%</div>
                <div className="text-xs text-blue-600">Corporate HQ Alpha</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-sm text-red-600 font-medium">Needs Attention</div>
                <div className="text-lg font-bold text-red-900">74.6%</div>
                <div className="text-xs text-red-600">Remote Station</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Charging Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Recent Charging Sessions</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time session data with efficiency and performance metrics</p>
          </div>
          <Link 
            href="/ev-management/sessions" 
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            View All Sessions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Station</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Start Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Energy</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Efficiency</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Cost</th>
              </tr>
            </thead>
            <tbody>
              {chargingSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{session.vehicleType}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {efficiencyMetrics.find(s => s.stationId === session.stationId)?.stationName}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {session.startTime}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {session.duration} min
                  </td>
                  <td className="py-4 px-4 text-blue-600 font-medium">
                    {session.energyDelivered} kWh
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.efficiency > 90 ? 'text-green-600 bg-green-100' :
                      session.efficiency > 80 ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {session.efficiency}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    ${session.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Optimization Recommendations</h2>
            <p className="text-sm text-gray-600 mt-1">AI-powered suggestions to improve charging efficiency and station performance</p>
          </div>
          <div className="text-sm text-gray-500">
            Potential Improvement: <span className="font-bold text-blue-600">{recommendations.reduce((sum, rec) => sum + rec.impact, 0).toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    rec.type === 'efficiency' ? 'bg-blue-100 text-blue-600' :
                    rec.type === 'utilization' ? 'bg-green-100 text-green-600' :
                    rec.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getTypeIcon(rec.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">+{rec.impact}%</div>
                  <div className="text-xs text-gray-500">efficiency gain</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(rec.effort)}`}>
                  {rec.effort} effort
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {rec.timeline}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  {rec.stations.length} stations
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Affects: {rec.stations.slice(0, 2).join(', ')}{rec.stations.length > 2 ? ` +${rec.stations.length - 2} more` : ''}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Implement →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency Improvement Plan */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Smart Efficiency Enhancement Program</h2>
        <p className="mb-6 max-w-3xl mx-auto text-blue-100">
          Our comprehensive analysis shows potential for 31.7% efficiency improvement across all charging stations 
          through targeted optimizations and smart management systems.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Quick Wins</h3>
            <p className="text-sm text-blue-100">4.2% improvement</p>
            <p className="text-xs text-blue-200 mt-1">Firmware updates & configuration</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Infrastructure Upgrades</h3>
            <p className="text-sm text-blue-100">15.2% improvement</p>
            <p className="text-xs text-blue-200 mt-1">Cable replacement & maintenance</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Smart Systems</h3>
            <p className="text-sm text-blue-100">12.3% improvement</p>
            <p className="text-xs text-blue-200 mt-1">AI load balancing & optimization</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            href="/ev-management/optimization/efficiency" 
            className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            View Enhancement Plan
          </Link>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium">
            Schedule Implementation
          </button>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Real-time efficiency monitoring</span>
          </div>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Next optimization scan: {new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
} 
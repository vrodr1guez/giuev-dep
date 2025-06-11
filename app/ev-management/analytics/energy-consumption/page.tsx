"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Zap, TrendingUp, TrendingDown, Calendar, Clock, 
  Download, Filter, RefreshCw, Settings, Eye, BarChart3, 
  LineChart, Activity, Battery, Target, AlertCircle, 
  CheckCircle, Gauge, Loader2, Sun, Moon, CloudRain,
  Thermometer, Wind, MapPin, Users, Building, Car
} from 'lucide-react';

// Types for energy data
interface EnergyConsumption {
  timestamp: string;
  consumption: number;
  demand: number;
  efficiency: number;
  cost: number;
}

interface StationData {
  id: string;
  name: string;
  location: string;
  consumption: number;
  capacity: number;
  utilization: number;
  efficiency: number;
  status: 'optimal' | 'high' | 'critical';
}

interface WeatherImpact {
  condition: string;
  temperature: number;
  impact: number;
  icon: React.ReactNode;
}

export default function EnergyConsumptionAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('consumption');
  const [selectedView, setSelectedView] = useState('overview');

  // Sample energy consumption data
  const [consumptionData, setConsumptionData] = useState<EnergyConsumption[]>([
    { timestamp: '00:00', consumption: 145, demand: 180, efficiency: 82.5, cost: 23.45 },
    { timestamp: '04:00', consumption: 89, demand: 120, efficiency: 85.2, cost: 14.32 },
    { timestamp: '08:00', consumption: 267, demand: 310, efficiency: 79.8, cost: 42.87 },
    { timestamp: '12:00', consumption: 312, demand: 380, efficiency: 77.3, cost: 51.23 },
    { timestamp: '16:00', consumption: 398, demand: 450, efficiency: 75.1, cost: 64.78 },
    { timestamp: '20:00', consumption: 234, demand: 290, efficiency: 81.4, cost: 37.65 }
  ]);

  const [stationsData, setStationsData] = useState<StationData[]>([
    { id: '1', name: 'Corporate HQ Alpha', location: 'Downtown', consumption: 1247, capacity: 1500, utilization: 83.1, efficiency: 94.2, status: 'optimal' },
    { id: '2', name: 'Corporate HQ Beta', location: 'Downtown', consumption: 1198, capacity: 1500, utilization: 79.9, efficiency: 91.8, status: 'optimal' },
    { id: '3', name: 'Distribution Center', location: 'Industrial Zone', consumption: 892, capacity: 1200, utilization: 74.3, efficiency: 87.3, status: 'optimal' },
    { id: '4', name: 'Retail Central', location: 'City Center', consumption: 634, capacity: 800, utilization: 79.3, efficiency: 82.1, status: 'high' },
    { id: '5', name: 'Remote Station', location: 'Suburban', consumption: 345, capacity: 600, utilization: 57.5, efficiency: 74.6, status: 'critical' }
  ]);

  const weatherData: WeatherImpact[] = [
    { condition: 'Sunny', temperature: 24, impact: -5.2, icon: <Sun className="h-4 w-4 text-yellow-500" /> },
    { condition: 'Cloudy', temperature: 18, impact: 2.1, icon: <CloudRain className="h-4 w-4 text-gray-500" /> },
    { condition: 'Cold', temperature: 5, impact: 12.8, icon: <Thermometer className="h-4 w-4 text-blue-500" /> }
  ];

  const timeframes = [
    { value: 'today', label: 'Today', period: '24h' },
    { value: 'week', label: 'Last 7 Days', period: '7d' },
    { value: 'month', label: 'Last 30 Days', period: '30d' },
    { value: 'quarter', label: 'Last Quarter', period: '90d' },
    { value: 'year', label: 'Last Year', period: '365d' }
  ];

  const metrics = [
    { value: 'consumption', label: 'Energy Consumption', unit: 'kWh' },
    { value: 'demand', label: 'Peak Demand', unit: 'kW' },
    { value: 'efficiency', label: 'Energy Efficiency', unit: '%' },
    { value: 'cost', label: 'Energy Cost', unit: '$' }
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
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'high': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Energy Analytics</h2>
          <p className="text-gray-500">Analyzing consumption patterns and forecasting energy demand...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Energy Consumption Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis of energy usage patterns, peak demand forecasting, and consumption optimization insights
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
              <span>Refresh Data</span>
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Energy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Total Consumption</div>
              <div className="text-2xl font-bold text-blue-900">47,832 kWh</div>
              <div className="text-sm text-blue-600 flex items-center">
                +12.4% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-700">vs. previous period</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Peak Demand</div>
              <div className="text-2xl font-bold text-green-900">398 kW</div>
              <div className="text-sm text-green-600 flex items-center">
                +8.7% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-green-700">highest this period</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Avg. Efficiency</div>
              <div className="text-2xl font-bold text-purple-900">81.7%</div>
              <div className="text-sm text-purple-600 flex items-center">
                +3.2% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-700">energy optimization</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">Cost per kWh</div>
              <div className="text-2xl font-bold text-orange-900">$0.164</div>
              <div className="text-sm text-orange-600 flex items-center">
                -5.1% <TrendingDown className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-orange-700">cost optimization</div>
        </div>
      </div>

      {/* Energy Consumption Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Energy Consumption Patterns</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time energy usage and demand forecasting</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white"
              >
                {metrics.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </button>
          </div>
        </div>

        {/* Enhanced Chart Visualization */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 h-96 rounded-lg flex items-center justify-center relative border border-gray-100 mb-6">
          <div className="absolute inset-0 p-8">
            <div className="h-full w-full flex items-end justify-between">
              {consumptionData.map((data, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-full max-w-16 flex flex-col items-center">
                    {/* Consumption Bar */}
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500 shadow-sm mb-1"
                      style={{ height: `${(data.consumption / 400) * 80}%` }}
                      title={`Consumption: ${data.consumption} kWh`}
                    ></div>
                    {/* Demand Line */}
                    <div 
                      className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300 hover:from-green-600 hover:to-green-500 shadow-sm opacity-70"
                      style={{ height: `${(data.demand / 450) * 60}%` }}
                      title={`Demand: ${data.demand} kW`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{data.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Energy Consumption</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
                <span className="text-sm font-medium">Peak Demand</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">Live Feed</div>
              <div className="text-xs text-gray-500">Updated every 5 min</div>
            </div>
          </div>
        </div>

        {/* Consumption Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Peak Hours</div>
                <div className="text-lg font-bold text-blue-900">4:00 PM - 6:00 PM</div>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xs text-blue-600 mt-2">Average: 385 kW demand</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Optimal Hours</div>
                <div className="text-lg font-bold text-green-900">2:00 AM - 6:00 AM</div>
              </div>
              <Sun className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mt-2">Efficiency: 85.2% average</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Load Factor</div>
                <div className="text-lg font-bold text-purple-900">73.4%</div>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-xs text-purple-600 mt-2">Above industry average</div>
          </div>
        </div>
      </div>

      {/* Station Performance and Weather Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Station Energy Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Station Energy Performance</h2>
              <p className="text-sm text-gray-600 mt-1">Individual station consumption and efficiency metrics</p>
            </div>
            <Link 
              href="/ev-management/analytics/stations" 
              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View All Stations
            </Link>
          </div>
          
          <div className="space-y-4">
            {stationsData.map((station) => (
              <div key={station.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{station.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {station.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{station.consumption.toLocaleString()} kWh</div>
                    <div className="text-xs text-gray-500">
                      {station.utilization}% utilization
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Capacity:</span>
                    <span className="ml-2 font-medium">{station.capacity.toLocaleString()} kWh</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Efficiency:</span>
                    <span className="ml-2 font-medium">{station.efficiency}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                      {getStatusIcon(station.status)}
                      <span className="ml-1 capitalize">{station.status}</span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilization</span>
                    <span>{station.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        station.utilization > 80 ? 'bg-red-500' : 
                        station.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${station.utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Impact Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Environmental Impact Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Weather conditions affecting energy consumption patterns</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Configure Alerts
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            {weatherData.map((weather, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {weather.icon}
                    <div>
                      <div className="font-medium text-gray-900">{weather.condition}</div>
                      <div className="text-sm text-gray-500">{weather.temperature}°C</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${weather.impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {weather.impact > 0 ? '+' : ''}{weather.impact}%
                    </div>
                    <div className="text-xs text-gray-500">consumption impact</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Conditions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-900">Current Conditions</h3>
              <div className="text-xs text-blue-600">Live Data</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700">18°C</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700">Light breeze</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700">+2.1% impact</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700">Normal demand</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Forecasting */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Energy Demand Forecasting</h2>
            <p className="text-sm text-gray-600 mt-1">AI-powered predictions for upcoming energy consumption patterns</p>
          </div>
          <div className="flex gap-3">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Next 7 Days
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center">
              <LineChart className="h-4 w-4 mr-1" />
              View Full Forecast
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-green-900">Tomorrow</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-2">52,340 kWh</div>
            <div className="text-sm text-green-700">+9.4% predicted increase</div>
            <div className="text-xs text-green-600 mt-2">Peak: 6:00 PM (420 kW)</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-yellow-900">This Week</h3>
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-900 mb-2">341,280 kWh</div>
            <div className="text-sm text-yellow-700">+6.2% vs last week</div>
            <div className="text-xs text-yellow-600 mt-2">Avg efficiency: 82.1%</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-purple-900">Next Month</h3>
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-2">1.47 MWh</div>
            <div className="text-sm text-purple-700">+11.8% growth projected</div>
            <div className="text-xs text-purple-600 mt-2">Optimization potential: 8.3%</div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Energy Optimization Recommendations</h2>
        <p className="mb-6 max-w-3xl mx-auto text-blue-100">
          Our AI analysis has identified opportunities to reduce energy consumption by up to 15% 
          through smart scheduling and load balancing optimization.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Peak Shaving</h3>
            <p className="text-sm text-blue-100">Reduce peak demand charges by 12%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Load Balancing</h3>
            <p className="text-sm text-blue-100">Optimize station utilization by 8%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-sm text-blue-100">Improve efficiency by 6%</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            href="/ev-management/optimization" 
            className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            View Optimization Plan
          </Link>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium">
            Schedule Analysis
          </button>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time monitoring active</span>
          </div>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Next forecast: {new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
} 
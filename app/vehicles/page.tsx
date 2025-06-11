"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Battery, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Zap, 
  Settings, 
  Filter,
  Download,
  Plus,
  Search,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  User,
  BarChart,
  Activity,
  TrendingUp,
  MapPin,
  Route,
  Fuel,
  Shield,
  Bell,
  Eye,
  Brain,
  Truck,
  Navigation,
  Wifi,
  Target,
  Database,
  Layers,
  Globe,
  RefreshCw,
  Star,
  Award,
  DollarSign,
  Gauge,
  Radio,
  Cpu,
  BrainCircuit as AIBrain,
  Sparkles,
  LineChart,
  PieChart,
  Users,
  Wrench,
  Video,
  Smartphone,
  Key,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Home,
  Building,
  Cog as ConfigIcon,
  BarChart3,
  TrendingDown,
  Sunrise,
  Moon,
  Sun,
  CloudRain,
  CloudSnow,
  Leaf,
  TreePine
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';

// $15M ENTERPRISE FLEET MANAGEMENT COMMAND CENTER
export default function FleetManagementCommandCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [aiInsights, setAiInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Real-time metrics simulation
  useEffect(() => {
    const updateMetrics = () => {
      setRealTimeMetrics({
        totalVehicles: 247,
        activeVehicles: 189,
        charging: 23,
        maintenance: 8,
        avgBatteryLevel: 67 + Math.random() * 6 - 3,
        totalMileageToday: 12847 + Math.floor(Math.random() * 500),
        energyConsumed: 2847.5 + Math.random() * 100,
        costSavings: 8947.32 + Math.random() * 200,
        co2Avoided: 156.7 + Math.random() * 10,
        uptime: 99.3 + Math.random() * 0.6,
        efficiency: 94.7 + Math.random() * 4
      });
    };
    
    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // AI-Powered Fleet Insights
  useEffect(() => {
    setAiInsights([
      {
        type: 'optimization',
        priority: 'high',
        title: 'Route Optimization Opportunity',
        description: 'AI detected 23% efficiency improvement possible on Route 7',
        impact: '+$3,247/month',
        action: 'Optimize Now'
      },
      {
        type: 'predictive',
        priority: 'medium',
        title: 'Predictive Maintenance Alert',
        description: 'Vehicle EV-2023-089 brake pads need attention in 2-3 weeks',
        impact: 'Prevent $1,890 repair',
        action: 'Schedule Service'
      },
      {
        type: 'energy',
        priority: 'low',
        title: 'Energy Cost Optimization',
        description: 'Charging during off-peak hours could save $890/month',
        impact: '+15% efficiency',
        action: 'Update Schedule'
      }
    ]);
  }, []);

  // Comprehensive vehicle data with real-time status
  const vehicles = useMemo(() => [
    {
      id: 'v-001',
      name: 'Tesla Model Y Performance',
      model: 'Model Y',
      year: 2024,
      registrationNumber: 'EV-2024-001',
      status: 'active',
      batteryLevel: 87,
      range: 234,
      maxRange: 330,
      lastCharged: '2 hours ago',
      chargingSpeed: null,
      driverAssigned: 'Thomas Johnson',
      driverRating: 4.8,
      location: { lat: 37.7749, lng: -122.4194, name: 'Headquarters - San Francisco' },
      currentRoute: 'Downtown Delivery Route',
      speed: 45,
      mileage: 12450,
      efficiency: 4.2,
      cost: { daily: 23.45, monthly: 687.30 },
      maintenance: {
        lastService: '2024-01-15',
        nextService: '2024-07-15',
        status: 'excellent',
        healthScore: 96
      },
      aiInsights: ['High efficiency performer', 'Optimal charging pattern'],
      image: '/vehicles/tesla-model-y.jpg',
      vin: 'YT1234567890123456',
      insurance: { provider: 'Tesla Insurance', expires: '2025-01-15' },
      features: ['Autopilot', 'Supercharging', 'OTA Updates', 'Mobile App'],
      environmental: { co2Saved: 2.3, treesEquivalent: 0.8 }
    },
    {
      id: 'v-002',
      name: 'Tesla Model 3 Long Range',
      model: 'Model 3',
      year: 2024,
      registrationNumber: 'EV-2024-002',
      status: 'charging',
      batteryLevel: 45,
      range: 118,
      maxRange: 358,
      lastCharged: 'Charging now',
      chargingSpeed: '150 kW',
      driverAssigned: 'Laura Smith',
      driverRating: 4.9,
      location: { lat: 37.7849, lng: -122.4094, name: 'Supercharger Station - Mission Bay' },
      currentRoute: null,
      speed: 0,
      mileage: 28310,
      efficiency: 4.5,
      cost: { daily: 19.80, monthly: 594.00 },
      maintenance: {
        lastService: '2024-01-22',
        nextService: '2024-07-22',
        status: 'excellent',
        healthScore: 94
      },
      aiInsights: ['Optimal charging schedule', 'Route efficiency leader'],
      image: '/vehicles/tesla-model-3.jpg',
      vin: 'LR9876543210987654',
      insurance: { provider: 'Tesla Insurance', expires: '2025-02-22' },
      features: ['Enhanced Autopilot', 'Premium Connectivity', 'Heat Pump'],
      environmental: { co2Saved: 4.1, treesEquivalent: 1.4 }
    },
    {
      id: 'v-003',
      name: 'Ford F-150 Lightning Pro',
      model: 'F-150 Lightning', 
      year: 2024,
      registrationNumber: 'EV-2024-003',
      status: 'maintenance',
      batteryLevel: 100,
      range: 320,
      maxRange: 320,
      lastCharged: '1 day ago',
      chargingSpeed: null,
      driverAssigned: 'Unassigned',
      driverRating: null,
      location: { lat: 37.7649, lng: -122.4294, name: 'Service Center - SOMA' },
      currentRoute: null,
      speed: 0,
      mileage: 8120,
      efficiency: 2.8,
      cost: { daily: 0, monthly: 0 },
      maintenance: {
        lastService: 'In progress',
        nextService: '2024-07-10',
        status: 'maintenance',
        healthScore: 89
      },
      aiInsights: ['Preventive maintenance on schedule', 'High payload efficiency'],
      image: '/vehicles/ford-f150.jpg',
      vin: 'FL1122334455667788',
      insurance: { provider: 'Ford Protect', expires: '2025-03-10' },
      features: ['Pro Power Onboard', 'Intelligent Backup Power', 'Ford Co-Pilot360'],
      environmental: { co2Saved: 1.8, treesEquivalent: 0.6 }
    }
  ], []);

        return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enterprise Command Center Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black">Fleet Management Command Center</h1>
                  <p className="text-blue-100 text-lg">Real-time monitoring, AI insights, and comprehensive fleet operations</p>
                </div>
              </div>
              
              {/* Live Fleet Metrics Dashboard */}
              <div className="grid grid-cols-6 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-blue-300" />
                      <span className="text-sm text-blue-100">Total Fleet</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.totalVehicles}</div>
                  <div className="text-xs text-green-300">+12 this month</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-green-300" />
                      <span className="text-sm text-blue-100">Active</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.activeVehicles}</div>
                  <div className="text-xs text-green-300">{((realTimeMetrics.activeVehicles / realTimeMetrics.totalVehicles) * 100).toFixed(1)}% active</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Battery className="w-5 h-5 text-blue-300" />
                      <span className="text-sm text-blue-100">Avg Battery</span>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.avgBatteryLevel?.toFixed(1)}%</div>
                  <div className="text-xs text-blue-300">Optimal range</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-300" />
                      <span className="text-sm text-blue-100">Cost Savings</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">${realTimeMetrics.costSavings?.toFixed(0)}</div>
                  <div className="text-xs text-green-300">vs fuel fleet</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AIBrain className="w-5 h-5 text-purple-300" />
                      <span className="text-sm text-blue-100">AI Efficiency</span>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.efficiency?.toFixed(1)}%</div>
                  <div className="text-xs text-purple-300">ML optimized</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-indigo-300" />
                      <span className="text-sm text-blue-100">Uptime</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.uptime?.toFixed(1)}%</div>
                  <div className="text-xs text-green-300">99.9% SLA</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 text-green-100 rounded-full px-4 py-2 text-sm font-bold">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>ALL SYSTEMS OPERATIONAL</span>
                </div>
              </div>
              
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl p-3 border border-white/20 transition-all">
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl p-3 border border-white/20 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comprehensive Navigation Tabs */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Fleet Overview', icon: BarChart3, badge: null },
                { id: 'vehicles', label: 'Vehicle Management', icon: Car, badge: realTimeMetrics.totalVehicles },
                { id: 'real-time', label: 'Real-Time Monitoring', icon: Activity, badge: 'LIVE' },
                { id: 'ai-insights', label: 'AI Insights', icon: AIBrain, badge: aiInsights.length },
                { id: 'routes', label: 'Route Optimization', icon: Route, badge: null },
                { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench, badge: realTimeMetrics.maintenance },
                { id: 'analytics', label: 'Advanced Analytics', icon: LineChart, badge: null },
                { id: 'sustainability', label: 'Sustainability', icon: Sparkles, badge: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tab.badge === 'LIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* AI-Powered Insights Section */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
        <div>
                  <h2 className="text-3xl font-bold mb-2">AI-Powered Fleet Intelligence</h2>
                  <p className="text-blue-100">Advanced machine learning insights for optimal fleet performance</p>
        </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <AIBrain className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${
                        insight.priority === 'high' ? 'bg-red-500/20' :
                        insight.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                      }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        insight.priority === 'high' ? 'bg-red-500/20 text-red-100' :
                        insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-green-500/20 text-green-100'
                      }`}>
                        {insight.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                    <p className="text-blue-100 text-sm mb-4">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-green-300 font-bold">{insight.impact}</div>
                      <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-all">
                        {insight.action}
                      </button>
        </div>
      </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fleet Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Route className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-green-500 text-sm font-bold">+12.3%</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Daily Mileage</h3>
                <p className="text-3xl font-black text-blue-600">{realTimeMetrics.totalMileageToday?.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">miles today</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-green-500 text-sm font-bold">-8.7%</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Energy Used</h3>
                <p className="text-3xl font-black text-green-600">{realTimeMetrics.energyConsumed?.toFixed(1)}</p>
                <p className="text-gray-500 text-sm">kWh today</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-green-500 text-sm font-bold">+23.1%</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cost Savings</h3>
                <p className="text-3xl font-black text-purple-600">${realTimeMetrics.costSavings?.toFixed(0)}</p>
                <p className="text-gray-500 text-sm">vs fuel fleet</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-green-500 text-sm font-bold">+5.2%</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">CO₂ Avoided</h3>
                <p className="text-3xl font-black text-indigo-600">{realTimeMetrics.co2Avoided?.toFixed(1)}</p>
                <p className="text-gray-500 text-sm">tons this month</p>
              </div>
            </div>
            
            {/* Fleet Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fleet Status Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">{realTimeMetrics.activeVehicles}</div>
                  <div className="text-gray-500">Active & Operational</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Battery className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{realTimeMetrics.charging}</div>
                  <div className="text-gray-500">Charging</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-10 h-10 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{realTimeMetrics.maintenance}</div>
                  <div className="text-gray-500">Maintenance</div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-600">3</div>
                  <div className="text-gray-500">Need Attention</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Management Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            {/* Advanced Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                      placeholder="Search by vehicle name, VIN, driver, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
                
                <div>
          <select 
                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="charging">Charging</option>
            <option value="maintenance">Maintenance</option>
            <option value="issue">Issues</option>
          </select>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className={`flex-1 p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <BarChart className="w-5 h-5 mx-auto" />
                  </button>
                  <button 
                    className={`flex-1 p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <BarChart3 className="w-5 h-5 mx-auto" />
                  </button>
        </div>
      </div>
      
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">Showing {vehicles.length} vehicles</span>
                  {selectedVehicles.size > 0 && (
                    <span className="text-blue-600 font-medium">{selectedVehicles.size} selected</span>
                  )}
          </div>
                
                <div className="flex items-center space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all">
                    <Plus className="w-4 h-4" />
                    <span>Add Vehicle</span>
                  </button>
                  
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl flex items-center space-x-2 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
              </div>
              </div>
          </div>
          
            {/* Comprehensive Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Vehicle Header */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{vehicle.name}</h3>
                          <p className="text-blue-100">{vehicle.registrationNumber}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          vehicle.status === 'active' ? 'bg-green-500/20 text-green-100' :
                          vehicle.status === 'charging' ? 'bg-blue-500/20 text-blue-100' :
                          vehicle.status === 'maintenance' ? 'bg-amber-500/20 text-amber-100' :
                          'bg-red-500/20 text-red-100'
                        }`}>
                          {vehicle.status.toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Battery Status */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Battery className="w-5 h-5" />
                            <span className="text-sm">Battery Level</span>
                          </div>
                          <span className="text-lg font-bold">{vehicle.batteryLevel}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              vehicle.batteryLevel > 70 ? 'bg-green-400' :
                              vehicle.batteryLevel > 30 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${vehicle.batteryLevel}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-blue-100 mt-1">
                          <span>{vehicle.range} mi range</span>
                          <span>Max: {vehicle.maxRange} mi</span>
                </div>
              </div>
              
                      {/* AI Insights Badge */}
                      {vehicle.aiInsights && vehicle.aiInsights.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <AIBrain className="w-4 h-4" />
                          <span className="text-xs">AI: {vehicle.aiInsights[0]}</span>
                        </div>
                      )}
                </div>
                
                    {/* Live Status Indicator */}
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
                
                  {/* Vehicle Details */}
                  <div className="p-6 space-y-4">
                    {/* Driver & Location */}
                    <div className="grid grid-cols-2 gap-4">
                <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Driver</span>
                  </div>
                        <div className="font-medium text-gray-900">
                          {vehicle.driverAssigned || 'Unassigned'}
                        </div>
                        {vehicle.driverRating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{vehicle.driverRating}</span>
                          </div>
                        )}
                </div>
                
                <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Location</span>
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                          {vehicle.location.name}
                        </div>
                        {vehicle.speed > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {vehicle.speed} mph
                    </div>
                  )}
                      </div>
                </div>
                
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{vehicle.mileage.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Miles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{vehicle.efficiency}</div>
                        <div className="text-xs text-gray-500">mi/kWh</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{vehicle.maintenance.healthScore}%</div>
                        <div className="text-xs text-gray-500">Health</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4">
                      <Link 
                        href={`/vehicles/${vehicle.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-center text-sm font-medium transition-all"
                      >
                        Details
                      </Link>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm transition-all">
                        <Route className="w-4 h-4" />
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Real-Time Monitoring Tab */}
        {activeTab === 'real-time' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Real-Time Fleet Monitoring</h2>
                  <p className="text-blue-100">Live tracking and monitoring of your entire fleet</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.activeVehicles}</div>
                  <div className="text-blue-100 text-sm">Vehicles Active</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-6 h-6" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.charging}</div>
                  <div className="text-blue-100 text-sm">Currently Charging</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Route className="w-6 h-6" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.totalMileageToday?.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">Miles Today</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <AIBrain className="w-6 h-6" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.efficiency?.toFixed(1)}%</div>
                  <div className="text-blue-100 text-sm">AI Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Access Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions & Fleet Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/ev-management" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl text-center transition-all group">
              <Car className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900">EV Management</div>
              <div className="text-xs text-gray-500">Advanced controls</div>
                  </Link>
            
            <Link href="/route-planning" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl text-center transition-all group">
              <Route className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900">Route Planning</div>
              <div className="text-xs text-gray-500">Optimize routes</div>
            </Link>
            
            <Link href="/maintenance/battery-health" className="bg-green-50 hover:bg-green-100 p-4 rounded-xl text-center transition-all group">
              <Battery className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900">Battery Health</div>
              <div className="text-xs text-gray-500">Monitor health</div>
            </Link>
            
            <Link href="/charging-stations" className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-xl text-center transition-all group">
              <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-gray-900">Charging Stations</div>
              <div className="text-xs text-gray-500">Manage charging</div>
            </Link>
          </div>
              </div>
              
        {/* Route Optimization Tab - NEW IMPLEMENTATION */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                  <div>
                  <h2 className="text-3xl font-bold mb-2">AI Route Optimization</h2>
                  <p className="text-orange-100">Intelligent routing for maximum efficiency and cost savings</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <Route className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <MapPin className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-orange-100 text-sm">Active Routes</div>
                  <div className="text-xs text-green-300 mt-1">+23% efficiency</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-6 h-6" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">$3,247</div>
                  <div className="text-orange-100 text-sm">Monthly Savings</div>
                  <div className="text-xs text-green-300 mt-1">vs manual routing</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-6 h-6" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">2.3h</div>
                  <div className="text-orange-100 text-sm">Time Saved Daily</div>
                  <div className="text-xs text-green-300 mt-1">per vehicle</div>
                </div>
              </div>
            </div>
            
            {/* Route Management Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Live Route Optimization</h3>
                    <div className="space-y-4">
                  {[
                    { route: 'Downtown Delivery', vehicles: 8, status: 'Optimized', savings: '+18%', color: 'green' },
                    { route: 'Airport Logistics', vehicles: 6, status: 'Optimizing', savings: '+12%', color: 'blue' },
                    { route: 'Suburban Routes', vehicles: 12, status: 'Active', savings: '+25%', color: 'green' },
                    { route: 'Highway Express', vehicles: 4, status: 'Planning', savings: '+8%', color: 'yellow' }
                  ].map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${route.color}-500`}></div>
                      <div>
                          <div className="font-medium text-gray-900">{route.route}</div>
                          <div className="text-sm text-gray-500">{route.vehicles} vehicles</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold text-${route.color}-600`}>{route.savings}</div>
                        <div className="text-xs text-gray-500">{route.status}</div>
                      </div>
                    </div>
                  ))}
                      </div>
                      
                <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                  Optimize All Routes
                </button>
                        </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Route Performance Analytics</h3>
                <div className="space-y-6">
                        <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Fuel Efficiency</span>
                      <span className="text-sm font-bold text-green-600">+23%</span>
                        </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '83%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">vs last quarter</div>
                  </div>
                  
                        <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Cost Optimization</span>
                      <span className="text-sm font-bold text-blue-600">+25.7%</span>
                        </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">operational savings</div>
                  </div>
                  
                        <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Uptime Performance</span>
                      <span className="text-sm font-bold text-purple-600">99.3%</span>
                        </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{width: '99%'}}></div>
                      </div>
                    <div className="text-xs text-gray-500 mt-1">fleet availability</div>
                    </div>
                  </div>
                  
                <div className="flex space-x-3 mt-6">
                  <Link href="/reports" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Generate Report
                  </Link>
                  <Link href="/premium-analytics" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Premium Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Hub Tab - NEW IMPLEMENTATION */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                  <div>
                  <h2 className="text-3xl font-bold mb-2">Predictive Maintenance Hub</h2>
                  <p className="text-amber-100">AI-powered maintenance scheduling and fleet health monitoring</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <Wrench className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.totalVehicles - realTimeMetrics.maintenance - 3}</div>
                  <div className="text-amber-100 text-sm">Healthy Vehicles</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.maintenance}</div>
                  <div className="text-amber-100 text-sm">In Maintenance</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-6 h-6" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-amber-100 text-sm">Scheduled This Week</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">$1.89M</div>
                  <div className="text-amber-100 text-sm">Prevented Costs</div>
                </div>
              </div>
            </div>
            
            {/* Maintenance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Maintenance Alerts & Predictions</h3>
                    <div className="space-y-4">
                  {[
                    { vehicle: 'EV-2024-001', issue: 'Brake Pad Replacement', priority: 'High', days: 3, cost: '$890' },
                    { vehicle: 'EV-2024-089', issue: 'Battery Calibration', priority: 'Medium', days: 7, cost: '$450' },
                    { vehicle: 'EV-2024-156', issue: 'Tire Rotation', priority: 'Low', days: 14, cost: '$120' },
                    { vehicle: 'EV-2024-203', issue: 'Software Update', priority: 'Medium', days: 5, cost: '$0' }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          alert.priority === 'High' ? 'bg-red-500' :
                          alert.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{alert.vehicle}</div>
                          <div className="text-sm text-gray-600">{alert.issue}</div>
                        </div>
                        </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{alert.days} days</div>
                        <div className="text-sm text-gray-500">{alert.cost}</div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all">
                        Schedule
                      </button>
                    </div>
                  ))}
                      </div>
                      
                <div className="flex space-x-4 mt-6">
                  <Link href="/maintenance/battery-health" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Battery Health
                  </Link>
                  <Link href="/maintenance/enhanced-battery-health" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Enhanced Analytics
                  </Link>
                          </div>
                        </div>
                        
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Maintenance Performance</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">96.2%</div>
                    <div className="text-gray-600">Fleet Health Score</div>
                    <div className="text-xs text-green-600 mt-1">+2.1% this month</div>
                          </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">3.2 days</div>
                    <div className="text-gray-600">Avg Downtime</div>
                    <div className="text-xs text-green-600 mt-1">-18% reduction</div>
                        </div>
                        
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">$12.4K</div>
                    <div className="text-gray-600">Monthly Savings</div>
                    <div className="text-xs text-green-600 mt-1">vs reactive maintenance</div>
                            </div>
                            </div>
                
                <button className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Analytics Tab - NEW IMPLEMENTATION */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Advanced Fleet Analytics</h2>
                  <p className="text-indigo-100">Deep insights, predictive modeling, and performance optimization</p>
                        </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <LineChart className="w-8 h-8" />
                      </div>
                    </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-6 h-6" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-indigo-100 text-sm">Data Points/Min</div>
                  </div>
                  
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <PieChart className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">94.7%</div>
                  <div className="text-indigo-100 text-sm">Prediction Accuracy</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-6 h-6" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">+23%</div>
                  <div className="text-indigo-100 text-sm">Efficiency Gain</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Database className="w-6 h-6" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">2.1TB</div>
                  <div className="text-indigo-100 text-sm">Data Processed</div>
                </div>
            </div>
            </div>
            
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Trends</h3>
                <div className="space-y-6">
              <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Energy Efficiency</span>
                      <span className="text-lg font-bold text-green-600">+18.3%</span>
                </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{width: '83%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">vs last quarter</div>
              </div>
              
                <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Cost Optimization</span>
                      <span className="text-lg font-bold text-blue-600">+25.7%</span>
                </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">operational savings</div>
                  </div>
                  
                <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Uptime Performance</span>
                      <span className="text-lg font-bold text-purple-600">99.3%</span>
                </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full" style={{width: '99%'}}></div>
              </div>
                    <div className="text-xs text-gray-500 mt-1">fleet availability</div>
            </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Link href="/reports" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Generate Report
                  </Link>
                  <Link href="/premium-analytics" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl text-center font-medium transition-all">
                    Premium Analytics
                  </Link>
              </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Predictive Insights</h3>
                <div className="space-y-4">
                  {[
                    { metric: 'Battery Degradation', prediction: '2.3% next month', status: 'normal', color: 'green' },
                    { metric: 'Maintenance Costs', prediction: '+$12K next quarter', status: 'attention', color: 'yellow' },
                    { metric: 'Energy Consumption', prediction: '-8% optimization possible', status: 'opportunity', color: 'blue' },
                    { metric: 'Fleet Expansion', prediction: '+15 vehicles recommended', status: 'growth', color: 'purple' }
                  ].map((insight, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${insight.color}-500`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{insight.metric}</div>
                          <div className="text-sm text-gray-600">{insight.prediction}</div>
              </div>
              </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full bg-${insight.color}-100 text-${insight.color}-800`}>
                        {insight.status.toUpperCase()}
            </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                  AI Analysis Dashboard
                </button>
                </div>
              </div>
          </div>
        )}

        {/* Sustainability Tab - NEW IMPLEMENTATION */}
        {activeTab === 'sustainability' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Sustainability Impact</h2>
                  <p className="text-green-100">Environmental benefits and carbon footprint reduction tracking</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Leaf className="w-6 h-6" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
                  <div className="text-2xl font-bold">{realTimeMetrics.co2Avoided?.toFixed(1)}</div>
                  <div className="text-green-100 text-sm">Tons CO₂ Avoided</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <TreePine className="w-6 h-6" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">847</div>
                  <div className="text-green-100 text-sm">Trees Equivalent</div>
              </div>
              
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Fuel className="w-6 h-6" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold">12.4K</div>
                  <div className="text-green-100 text-sm">Gallons Saved</div>
              </div>
              
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-6 h-6" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
                  <div className="text-2xl font-bold">A+</div>
                  <div className="text-green-100 text-sm">Sustainability Score</div>
                </div>
              </div>
      </div>
      
            {/* Sustainability Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Environmental Impact</h3>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {(realTimeMetrics.co2Avoided * 12).toFixed(1)}
            </div>
                    <div className="text-gray-700 font-medium">Tons CO₂ Avoided Annually</div>
                    <div className="text-sm text-green-600 mt-1">Equivalent to planting 2,847 trees</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">78.2K</div>
                      <div className="text-gray-700 text-sm">kWh Clean Energy</div>
            </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">-92%</div>
                      <div className="text-gray-700 text-sm">Emissions vs ICE</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                  Sustainability Report
                </button>
            </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Sustainability Goals</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Carbon Neutral Goal</span>
                      <span className="text-sm font-bold text-green-600">78% Complete</span>
            </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{width: '78%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Target: Dec 2024</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Renewable Energy</span>
                      <span className="text-sm font-bold text-blue-600">85% Complete</span>
            </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Target: 100% renewable</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Waste Reduction</span>
                      <span className="text-sm font-bold text-purple-600">92% Complete</span>
            </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full" style={{width: '92%'}}></div>
        </div>
                    <div className="text-xs text-gray-500 mt-1">Zero waste target</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                    Set New Goals
                  </button>
                  <button className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-all">
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
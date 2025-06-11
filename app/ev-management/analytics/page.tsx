"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart, PieChart, LineChart, Download, Calendar, 
  Filter, ChevronDown, ArrowRight, FileText, Battery,
  Zap, DollarSign, TrendingDown, TrendingUp, RefreshCw,
  Settings, Eye, AlertCircle, CheckCircle, Clock,
  BarChart3, Activity, Target, Gauge, Loader2
} from 'lucide-react';

// Types for analytics data
interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  target?: string;
  status: 'good' | 'warning' | 'critical';
}

interface ChartData {
  period: string;
  consumption: number;
  cost: number;
  efficiency: number;
}

interface StationEfficiency {
  id: string;
  name: string;
  efficiency: number;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
  uptime: number;
  sessions: number;
}

export default function AdvancedPerformanceAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('energy');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample enhanced KPI data
  const [kpiData, setKpiData] = useState<KPIData[]>([
    { 
      label: 'Total Energy Delivered', 
      value: '47,832 kWh', 
      change: '+12.4%', 
      trend: 'up',
      target: '50,000 kWh',
      status: 'good'
    },
    { 
      label: 'Revenue Generated', 
      value: '$9,247', 
      change: '+8.7%', 
      trend: 'up',
      target: '$10,000',
      status: 'good'
    },
    { 
      label: 'Average Utilization', 
      value: '73.2%', 
      change: '+5.8%', 
      trend: 'up',
      target: '80%',
      status: 'warning'
    },
    { 
      label: 'Carbon Footprint Reduced', 
      value: '23.1 tons CO₂', 
      change: '+15.2%', 
      trend: 'up',
      target: '25 tons',
      status: 'good'
    }
  ]);

  const [stationEfficiency, setStationEfficiency] = useState<StationEfficiency[]>([
    { id: '1', name: 'Corporate HQ Station Alpha', efficiency: 94.2, status: 'excellent', uptime: 99.1, sessions: 287 },
    { id: '2', name: 'Corporate HQ Station Beta', efficiency: 91.8, status: 'excellent', uptime: 98.7, sessions: 265 },
    { id: '3', name: 'Distribution Center Hub', efficiency: 87.3, status: 'good', uptime: 97.2, sessions: 198 },
    { id: '4', name: 'Retail Location Central', efficiency: 82.1, status: 'good', uptime: 96.8, sessions: 156 },
    { id: '5', name: 'Remote Service Station', efficiency: 74.6, status: 'needs-attention', uptime: 94.3, sessions: 89 }
  ]);

  // Enhanced time range options
  const timeRanges = [
    { value: 'today', label: 'Today', period: '24h' },
    { value: 'week', label: 'Last 7 Days', period: '7d' },
    { value: 'month', label: 'Last 30 Days', period: '30d' },
    { value: 'quarter', label: 'Last Quarter', period: '90d' },
    { value: 'year', label: 'Last Year', period: '365d' },
    { value: 'ytd', label: 'Year to Date', period: 'YTD' }
  ];

  // Enhanced report types with more professional descriptions
  const reportTypes = [
    {
      id: 'energy-analytics',
      title: 'Energy Consumption Analytics',
      description: 'Comprehensive analysis of energy usage patterns, peak demand forecasting, and load distribution optimization',
      icon: <Zap className="h-10 w-10 text-blue-500" />,
      href: '/ev-management/analytics/energy-consumption',
      color: 'bg-blue-50 border-blue-200',
      metrics: ['47.8 MWh', '12.4% ↑'],
      category: 'Energy Management'
    },
    {
      id: 'financial-optimization',
      title: 'Financial Performance & ROI',
      description: 'Advanced cost analysis, revenue optimization, and financial forecasting with predictive modeling',
      icon: <DollarSign className="h-10 w-10 text-green-500" />,
      href: '/ev-management/analytics/cost-optimization',
      color: 'bg-green-50 border-green-200',
      metrics: ['$9.2k Revenue', '8.7% ↑'],
      category: 'Financial Analytics'
    },
    {
      id: 'operational-excellence',
      title: 'Operational Excellence Dashboard',
      description: 'Station performance monitoring, utilization analytics, and maintenance optimization insights',
      icon: <Activity className="h-10 w-10 text-purple-500" />,
      href: '/ev-management/analytics/charging-efficiency',
      color: 'bg-purple-50 border-purple-200',
      metrics: ['73.2% Util.', '5.8% ↑'],
      category: 'Operations'
    },
    {
      id: 'sustainability-impact',
      title: 'Sustainability Impact Assessment',
      description: 'Environmental impact tracking, carbon footprint analysis, and renewable energy integration metrics',
      icon: <Target className="h-10 w-10 text-teal-500" />,
      href: '/ev-management/analytics/sustainability',
      color: 'bg-teal-50 border-teal-200',
      metrics: ['23.1t CO₂', '15.2% ↑'],
      category: 'Sustainability'
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Export functionality
  const handleExport = (format: string) => {
    // Simulate export
    const filename = `analytics-report-${selectedTimeRange}-${Date.now()}.${format}`;
    console.log(`Exporting ${filename}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs-attention': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Analytics Dashboard</h2>
          <p className="text-gray-500">Preparing your performance insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Performance Analytics
          </h1>
          <p className="text-gray-600">
            Enterprise-grade analytics platform delivering comprehensive insights into charging infrastructure performance, 
            financial metrics, and operational excellence indicators
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label} ({range.period})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center bg-white shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            <span>Advanced Filters</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center bg-white shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Summary with Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <div key={index} className={`p-6 rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${getKPIStatusColor(kpi.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{kpi.label}</h3>
              <div className="flex items-center space-x-1">
                {kpi.status === 'good' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {kpi.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                {kpi.status === 'critical' && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
              <div className="flex items-center justify-between">
                <div className={`text-sm flex items-center ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-1" />
                  )}
                </div>
                {kpi.target && (
                  <div className="text-xs text-gray-500">
                    Target: {kpi.target}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'energy', label: 'Energy Analytics', icon: Zap },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'operations', label: 'Operations', icon: Activity },
            { id: 'sustainability', label: 'Sustainability', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Energy Consumption Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Energy Consumption Trends</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time energy delivery and consumption patterns</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select className="pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white">
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Link 
              href="/ev-management/analytics/energy-consumption" 
              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full Analysis
            </Link>
          </div>
        </div>
        
        {/* Enhanced Chart Placeholder with Better Visualization */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-80 rounded-lg flex items-center justify-center relative border border-blue-100">
          <div className="absolute inset-0 p-8">
            <div className="h-full w-full flex items-end justify-between">
              {[30, 45, 60, 40, 70, 55, 65, 50, 75, 60, 80, 85].map((height, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{i * 2}h</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Live Data Stream</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">Total Consumption</div>
            <div className="text-2xl font-bold text-blue-900">47,832 kWh</div>
            <div className="text-xs text-blue-600 mt-1">+12.4% vs last period</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 font-medium">Peak Efficiency Day</div>
            <div className="text-2xl font-bold text-green-900">Tuesday</div>
            <div className="text-xs text-green-600 mt-1">94.2% average efficiency</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-600 font-medium">Avg. Daily Output</div>
            <div className="text-2xl font-bold text-purple-900">1,594 kWh</div>
            <div className="text-xs text-purple-600 mt-1">Within optimal range</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-sm text-orange-600 font-medium">Growth Trend</div>
            <div className="text-2xl font-bold text-orange-900">+8.2%</div>
            <div className="text-xs text-orange-600 mt-1">Exceeding projections</div>
          </div>
        </div>
      </div>

      {/* Enhanced Charging Efficiency and Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Advanced Station Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Station Performance Matrix</h2>
              <p className="text-sm text-gray-600 mt-1">Comprehensive efficiency and reliability metrics</p>
            </div>
            <Link 
              href="/ev-management/analytics/charging-efficiency" 
              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure Thresholds
            </Link>
          </div>
          
          <div className="space-y-4">
            {stationEfficiency.map((station) => (
              <div key={station.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(station.status)}`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{station.name}</h4>
                      <p className="text-xs text-gray-500">{station.sessions} sessions this period</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{station.efficiency}%</div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <span className="ml-2 font-medium">{station.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">{station.status.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Performance</span>
                    <span>{station.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusColor(station.status)}`}
                      style={{ width: `${station.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Advanced Cost Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Revenue & Cost Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Financial performance and optimization opportunities</p>
            </div>
            <Link 
              href="/ev-management/analytics/cost-optimization" 
              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
            >
              <Gauge className="h-4 w-4 mr-1" />
              Optimization Insights
            </Link>
          </div>
          
          {/* Enhanced Pie Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 h-60 rounded-lg flex items-center justify-center relative border border-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full border-8 border-blue-500 relative">
                <div 
                  className="absolute top-0 right-0 bottom-0 left-0 border-8 border-green-500 rounded-full"
                  style={{ 
                    clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)' 
                  }}
                ></div>
                <div 
                  className="absolute top-0 right-0 bottom-0 left-0 border-8 border-orange-500 rounded-full"
                  style={{ 
                    clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 40%, 25% 30%)' 
                  }}
                ></div>
              </div>
              <div className="absolute text-center">
                <div className="text-lg font-bold text-gray-900">$9,247</div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Off-Peak Revenue</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-900">$5,086</div>
                <div className="text-xs text-green-600">55% (Optimal)</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Standard Rate</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-900">$2,774</div>
                <div className="text-xs text-blue-600">30% (Target)</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Peak Premium</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-900">$1,387</div>
                <div className="text-xs text-orange-600">15% (Premium)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Report Types */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Analytics Portfolio</h2>
            <p className="text-gray-600 mt-1">Comprehensive reporting suite for data-driven decision making</p>
          </div>
          <Link 
            href="/ev-management/analytics/custom" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Custom Analytics Builder
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <Link
              key={report.id}
              href={report.href}
              className={`block p-6 border-2 rounded-xl hover:shadow-lg transition-all duration-300 ${report.color} hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {report.icon}
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{report.category}</span>
                    <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{report.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  {report.metrics.map((metric, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-bold text-gray-900">{metric}</span>
                    </div>
                  ))}
                </div>
                <div className="inline-flex items-center text-blue-600 font-medium">
                  <span>View Report</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Enhanced Custom Reports */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Custom Report Library</h2>
            <p className="text-sm text-gray-600 mt-1">Scheduled and on-demand reporting infrastructure</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href="/ev-management/analytics/templates" 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Template Library
            </Link>
            <Link 
              href="/ev-management/analytics/custom" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create Advanced Report
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Configuration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Execution
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule Pattern
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Executive Performance Summary', created: '2024-05-10', lastRun: '2024-05-17', schedule: 'Weekly', status: 'active' },
                { name: 'Financial Optimization Analysis', created: '2024-02-15', lastRun: '2024-05-01', schedule: 'Monthly', status: 'active' },
                { name: 'Station Comparative Assessment', created: '2024-04-20', lastRun: '2024-05-15', schedule: 'On Demand', status: 'pending' }
              ].map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{report.name}</div>
                        <div className="text-sm text-gray-500">Advanced analytics configuration</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.created}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.lastRun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.schedule}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Execute</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Configure</button>
                    <button className="text-red-600 hover:text-red-900">Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Call-to-Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics Capabilities</h2>
        <p className="mb-6 max-w-3xl mx-auto text-blue-100">
          Transform your EV charging infrastructure with AI-powered insights, predictive analytics, 
          and enterprise-grade reporting solutions tailored to your operational requirements.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Schedule Analytics Consultation
          </Link>
          <Link 
            href="/ev-management/analytics/examples" 
            className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium"
          >
            Explore Sample Reports
          </Link>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time data active</span>
          </div>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Next refresh: {new Date(Date.now() + 5 * 60 * 1000).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
} 
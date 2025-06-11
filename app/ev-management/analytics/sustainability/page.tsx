"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Leaf, TrendingUp, TrendingDown, Wind, Sun, 
  Download, Filter, RefreshCw, Settings, Target, BarChart3, 
  Gauge, Loader2, Globe, CheckCircle, AlertCircle, Zap,
  Recycle, TreePine, Droplets, Factory, Award, Shield
} from 'lucide-react';

// Types for sustainability data
interface CarbonMetric {
  category: string;
  current: number;
  baseline: number;
  reduction: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface RenewableEnergyData {
  source: string;
  percentage: number;
  capacity: number;
  generation: number;
  savings: number;
  carbonOffset: number;
}

interface ESGMetric {
  category: 'environmental' | 'social' | 'governance';
  metric: string;
  score: number;
  benchmark: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SustainabilityGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'achieved' | 'delayed';
  impact: string;
}

export default function SustainabilityPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample carbon metrics
  const [carbonMetrics, setCarbonMetrics] = useState<CarbonMetric[]>([
    { category: 'Direct Emissions', current: 2847, baseline: 4150, reduction: 31.4, target: 2075, unit: 'tCO2e', trend: 'improving' },
    { category: 'Energy Consumption', current: 1456, baseline: 2890, reduction: 49.6, target: 1156, unit: 'tCO2e', trend: 'improving' },
    { category: 'Transportation', current: 892, baseline: 1240, reduction: 28.1, target: 620, unit: 'tCO2e', trend: 'stable' },
    { category: 'Supply Chain', current: 1124, baseline: 1580, reduction: 28.9, target: 790, unit: 'tCO2e', trend: 'improving' },
    { category: 'Waste Management', current: 156, baseline: 345, reduction: 54.8, target: 103, unit: 'tCO2e', trend: 'improving' }
  ]);

  // Sample renewable energy data
  const [renewableData, setRenewableData] = useState<RenewableEnergyData[]>([
    { source: 'Solar Power', percentage: 45.2, capacity: 850, generation: 1247, savings: 89400, carbonOffset: 542 },
    { source: 'Wind Power', percentage: 28.7, capacity: 540, generation: 789, savings: 56700, carbonOffset: 324 },
    { source: 'Hydroelectric', percentage: 18.3, capacity: 345, generation: 503, savings: 36100, carbonOffset: 187 },
    { source: 'Geothermal', percentage: 7.8, capacity: 147, generation: 214, savings: 15300, carbonOffset: 98 }
  ]);

  // Sample ESG metrics
  const [esgMetrics, setEsgMetrics] = useState<ESGMetric[]>([
    { category: 'environmental', metric: 'Carbon Footprint Reduction', score: 87, benchmark: 75, trend: 'up', description: 'Year-over-year CO2 emissions reduction' },
    { category: 'environmental', metric: 'Renewable Energy Usage', score: 92, benchmark: 80, trend: 'up', description: 'Percentage of renewable energy in total consumption' },
    { category: 'environmental', metric: 'Waste Reduction', score: 78, benchmark: 70, trend: 'up', description: 'Waste diversion from landfills' },
    { category: 'social', metric: 'Community Impact', score: 85, benchmark: 72, trend: 'up', description: 'Local community engagement and benefits' },
    { category: 'social', metric: 'Employee Satisfaction', score: 91, benchmark: 83, trend: 'stable', description: 'Employee engagement in sustainability initiatives' },
    { category: 'governance', metric: 'Sustainability Reporting', score: 94, benchmark: 85, trend: 'up', description: 'Transparency in environmental reporting' }
  ]);

  // Sample sustainability goals
  const [sustainabilityGoals, setSustainabilityGoals] = useState<SustainabilityGoal[]>([
    {
      id: 'G001',
      title: 'Carbon Neutral Operations',
      description: 'Achieve net-zero carbon emissions across all charging infrastructure',
      targetDate: '2030-12-31',
      progress: 68,
      status: 'on-track',
      impact: '100% carbon reduction'
    },
    {
      id: 'G002',
      title: '100% Renewable Energy',
      description: 'Power all charging stations with renewable energy sources',
      targetDate: '2028-06-30',
      progress: 92,
      status: 'on-track',
      impact: '1,250 tCO2e annually'
    },
    {
      id: 'G003',
      title: 'Circular Economy Integration',
      description: 'Implement circular economy principles in infrastructure lifecycle',
      targetDate: '2026-03-31',
      progress: 34,
      status: 'at-risk',
      impact: '60% waste reduction'
    },
    {
      id: 'G004',
      title: 'Ecosystem Restoration',
      description: 'Plant 10,000 trees to offset remaining carbon footprint',
      targetDate: '2025-12-31',
      progress: 78,
      status: 'on-track',
      impact: '500 tCO2e sequestration'
    }
  ]);

  const timeframes = [
    { value: 'week', label: 'Last Week', period: '7d' },
    { value: 'month', label: 'Last Month', period: '30d' },
    { value: 'quarter', label: 'Last Quarter', period: '90d' },
    { value: 'year', label: 'Last Year', period: '365d' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'carbon', label: 'Carbon Footprint' },
    { value: 'renewable', label: 'Renewable Energy' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'social', label: 'Social Impact' }
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'up': return 'text-green-600 bg-green-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'declining':
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'achieved': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-4 w-4" />;
      case 'social': return <Globe className="h-4 w-4" />;
      case 'governance': return <Shield className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Sustainability Analytics</h2>
          <p className="text-gray-500">Analyzing environmental impact and sustainability performance...</p>
        </div>
      </div>
    );
  }

  const totalCarbonReduction = carbonMetrics.reduce((sum, metric) => sum + metric.reduction, 0) / carbonMetrics.length;
  const totalRenewablePercentage = renewableData.reduce((sum, source) => sum + source.percentage, 0);
  const totalCarbonOffset = renewableData.reduce((sum, source) => sum + source.carbonOffset, 0);
  const avgESGScore = esgMetrics.reduce((sum, metric) => sum + metric.score, 0) / esgMetrics.length;

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
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sustainability Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive environmental impact assessment, carbon footprint tracking, and ESG performance monitoring
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none bg-white shadow-sm focus:ring-2 focus:ring-green-500"
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
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              <span>ESG Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Sustainability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Carbon Reduction</div>
              <div className="text-2xl font-bold text-green-900">{totalCarbonReduction.toFixed(1)}%</div>
              <div className="text-sm text-green-600 flex items-center">
                +4.2% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-green-700">vs. baseline year</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Renewable Energy</div>
              <div className="text-2xl font-bold text-blue-900">{totalRenewablePercentage.toFixed(1)}%</div>
              <div className="text-sm text-blue-600 flex items-center">
                +8.3% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-700">of total energy consumption</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <TreePine className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Carbon Offset</div>
              <div className="text-2xl font-bold text-purple-900">{totalCarbonOffset.toLocaleString()}</div>
              <div className="text-sm text-purple-600 flex items-center">
                +12.1% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-700">tCO2e annually</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">ESG Score</div>
              <div className="text-2xl font-bold text-orange-900">{avgESGScore.toFixed(0)}/100</div>
              <div className="text-sm text-orange-600 flex items-center">
                +6.8 <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-orange-700">industry leading</div>
        </div>
      </div>

      {/* Carbon Footprint Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Carbon Footprint Reduction</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed analysis of emissions reduction across all operational categories</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carbon Metrics */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Emission Categories</h3>
            <div className="space-y-4">
              {carbonMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{metric.category}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.trend}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <span className="ml-2 font-bold">{metric.current.toLocaleString()} {metric.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Baseline:</span>
                      <span className="ml-2 font-medium">{metric.baseline.toLocaleString()} {metric.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reduction:</span>
                      <span className="ml-2 font-bold text-green-600">{metric.reduction}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Target:</span>
                      <span className="ml-2 font-medium">{metric.target.toLocaleString()} {metric.unit}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress to Target</span>
                      <span>{Math.round(((metric.baseline - metric.current) / (metric.baseline - metric.target)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${Math.min(100, ((metric.baseline - metric.current) / (metric.baseline - metric.target)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carbon Trends */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Emission Trends</h3>
            <div className="bg-gradient-to-br from-gray-50 to-green-50 h-80 rounded-lg flex items-center justify-center border border-gray-100 mb-6">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Carbon Footprint Tracking</h4>
                <p className="text-sm text-gray-600 max-w-sm">
                  Real-time monitoring of emissions across all operational categories with predictive analytics
                </p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                  View Detailed Analysis
                </button>
              </div>
            </div>

            {/* Emission Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm text-green-600 font-medium">Best Performer</div>
                <div className="text-lg font-bold text-green-900">Waste Management</div>
                <div className="text-xs text-green-600">54.8% reduction</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="text-sm text-yellow-600 font-medium">Focus Area</div>
                <div className="text-lg font-bold text-yellow-900">Transportation</div>
                <div className="text-xs text-yellow-600">28.1% reduction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Renewable Energy Portfolio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Renewable Energy Portfolio</h2>
            <p className="text-sm text-gray-600 mt-1">Clean energy sources powering our charging infrastructure</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Capacity: <span className="font-bold text-blue-600">{renewableData.reduce((sum, source) => sum + source.capacity, 0).toLocaleString()} MW</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renewableData.map((source, idx) => (
            <div key={idx} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    source.source === 'Solar Power' ? 'bg-yellow-100 text-yellow-600' :
                    source.source === 'Wind Power' ? 'bg-blue-100 text-blue-600' :
                    source.source === 'Hydroelectric' ? 'bg-cyan-100 text-cyan-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {source.source === 'Solar Power' && <Sun className="h-5 w-5" />}
                    {source.source === 'Wind Power' && <Wind className="h-5 w-5" />}
                    {source.source === 'Hydroelectric' && <Droplets className="h-5 w-5" />}
                    {source.source === 'Geothermal' && <Factory className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{source.source}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Energy Mix:</span>
                  <span className="text-sm font-bold text-blue-600">{source.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Capacity:</span>
                  <span className="text-sm font-medium">{source.capacity} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Generation:</span>
                  <span className="text-sm font-medium">{source.generation.toLocaleString()} MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Annual Savings:</span>
                  <span className="text-sm font-bold text-green-600">${source.savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Carbon Offset:</span>
                  <span className="text-sm font-bold text-green-600">{source.carbonOffset} tCO2e</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Contribution</span>
                  <span>{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      source.source === 'Solar Power' ? 'bg-yellow-500' :
                      source.source === 'Wind Power' ? 'bg-blue-500' :
                      source.source === 'Hydroelectric' ? 'bg-cyan-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG Performance Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">ESG Performance Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Environmental, Social, and Governance metrics tracking</p>
          </div>
          <Link 
            href="/ev-management/esg-report" 
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            Full ESG Report →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {['environmental', 'social', 'governance'].map((category) => (
            <div key={category}>
              <h3 className="font-medium text-gray-900 mb-4 capitalize flex items-center">
                {getCategoryIcon(category)}
                <span className="ml-2">{category}</span>
              </h3>
              <div className="space-y-4">
                {esgMetrics.filter(metric => metric.category === category).map((metric, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{metric.metric}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(metric.trend)}`}>
                        {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                        {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                        {metric.trend === 'stable' && <Target className="h-3 w-3" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.score}</span>
                      <span className="text-sm text-gray-500">vs {metric.benchmark} benchmark</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Performance</span>
                        <span>{Math.round((metric.score / 100) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.score >= 90 ? 'bg-green-500' :
                            metric.score >= 75 ? 'bg-blue-500' :
                            metric.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability Goals */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Sustainability Goals & Targets</h2>
            <p className="text-sm text-gray-600 mt-1">Long-term environmental commitments and progress tracking</p>
          </div>
          <div className="text-sm text-gray-500">
            Overall Progress: <span className="font-bold text-green-600">{Math.round(sustainabilityGoals.reduce((sum, goal) => sum + goal.progress, 0) / sustainabilityGoals.length)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sustainabilityGoals.map((goal) => (
            <div key={goal.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  <span className="font-bold text-blue-600">{goal.progress}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      goal.progress >= 80 ? 'bg-green-500' :
                      goal.progress >= 60 ? 'bg-blue-500' :
                      goal.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Expected Impact: <span className="font-medium text-green-600">{goal.impact}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability Action Plan */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Climate Action Commitment</h2>
        <p className="mb-6 max-w-3xl mx-auto text-green-100">
          Our comprehensive sustainability strategy aims for carbon neutrality by 2030, with intermediate milestones 
          for renewable energy adoption and circular economy implementation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">2025 Targets</h3>
            <p className="text-sm text-green-100">75% renewable energy</p>
            <p className="text-xs text-green-200 mt-1">50% emission reduction</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">2028 Milestones</h3>
            <p className="text-sm text-green-100">100% renewable energy</p>
            <p className="text-xs text-green-200 mt-1">80% emission reduction</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">2030 Vision</h3>
            <p className="text-sm text-green-100">Carbon neutral operations</p>
            <p className="text-xs text-green-200 mt-1">Circular economy integrated</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            href="/ev-management/sustainability/action-plan" 
            className="px-6 py-3 bg-white text-green-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            View Action Plan
          </Link>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-green-600 transition-colors font-medium">
            Download ESG Report
          </button>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sustainability monitoring active</span>
          </div>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Next ESG assessment: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
} 
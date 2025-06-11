"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calculator, 
  Download, Filter, RefreshCw, Settings, Target, PieChart, 
  BarChart3, Activity, Zap, Clock, AlertCircle, CheckCircle, 
  Gauge, Loader2, CreditCard, Wallet, Building, MapPin
} from 'lucide-react';

// Types for cost data
interface CostMetric {
  category: string;
  current: number;
  previous: number;
  savings: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  category: string;
}

interface ROIProject {
  id: string;
  name: string;
  investment: number;
  annualSavings: number;
  roi: number;
  paybackPeriod: number;
  status: 'proposed' | 'approved' | 'in-progress' | 'completed';
}

export default function CostOptimizationPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample cost metrics
  const [costMetrics, setCostMetrics] = useState<CostMetric[]>([
    { category: 'Energy Costs', current: 127540, previous: 142300, savings: 14760, target: 120000, status: 'good' },
    { category: 'Infrastructure', current: 89200, previous: 93500, savings: 4300, target: 85000, status: 'warning' },
    { category: 'Maintenance', current: 34600, previous: 41200, savings: 6600, target: 30000, status: 'good' },
    { category: 'Operations', current: 52800, previous: 54900, savings: 2100, target: 48000, status: 'warning' },
    { category: 'Personnel', current: 186400, previous: 189200, savings: 2800, target: 180000, status: 'excellent' }
  ]);

  // Sample savings opportunities
  const [savingsOpportunities, setSavingsOpportunities] = useState<SavingsOpportunity[]>([
    {
      id: '1',
      title: 'Peak Demand Optimization',
      description: 'Implement smart charging schedules to reduce peak demand charges',
      potentialSavings: 24000,
      timeframe: '6 months',
      difficulty: 'medium',
      impact: 'high',
      category: 'Energy'
    },
    {
      id: '2',
      title: 'Preventive Maintenance Program',
      description: 'Establish predictive maintenance to reduce emergency repairs',
      potentialSavings: 18500,
      timeframe: '3 months',
      difficulty: 'easy',
      impact: 'medium',
      category: 'Maintenance'
    },
    {
      id: '3',
      title: 'Energy Storage Integration',
      description: 'Deploy battery storage systems for load balancing and grid arbitrage',
      potentialSavings: 35200,
      timeframe: '12 months',
      difficulty: 'hard',
      impact: 'high',
      category: 'Infrastructure'
    },
    {
      id: '4',
      title: 'Automated Load Management',
      description: 'Implement AI-driven load balancing across charging stations',
      potentialSavings: 15800,
      timeframe: '4 months',
      difficulty: 'medium',
      impact: 'medium',
      category: 'Technology'
    },
    {
      id: '5',
      title: 'Renewable Energy Procurement',
      description: 'Secure long-term renewable energy contracts at lower rates',
      potentialSavings: 42700,
      timeframe: '8 months',
      difficulty: 'hard',
      impact: 'high',
      category: 'Energy'
    }
  ]);

  // Sample ROI projects
  const [roiProjects, setRoiProjects] = useState<ROIProject[]>([
    { id: '1', name: 'Smart Grid Integration', investment: 450000, annualSavings: 127000, roi: 28.2, paybackPeriod: 3.5, status: 'approved' },
    { id: '2', name: 'Solar Panel Installation', investment: 320000, annualSavings: 85000, roi: 26.6, paybackPeriod: 3.8, status: 'in-progress' },
    { id: '3', name: 'Energy Management System', investment: 180000, annualSavings: 65000, roi: 36.1, paybackPeriod: 2.8, status: 'completed' },
    { id: '4', name: 'Fleet Optimization Software', investment: 125000, annualSavings: 48000, roi: 38.4, paybackPeriod: 2.6, status: 'proposed' },
    { id: '5', name: 'Predictive Maintenance', investment: 95000, annualSavings: 42000, roi: 44.2, paybackPeriod: 2.3, status: 'approved' }
  ]);

  const timeframes = [
    { value: 'week', label: 'Last Week', period: '7d' },
    { value: 'month', label: 'Last Month', period: '30d' },
    { value: 'quarter', label: 'Last Quarter', period: '90d' },
    { value: 'year', label: 'Last Year', period: '365d' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'energy', label: 'Energy Costs' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'operations', label: 'Operations' },
    { value: 'technology', label: 'Technology' }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-gray-600 bg-gray-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Cost Analytics</h2>
          <p className="text-gray-500">Analyzing cost optimization opportunities and ROI projections...</p>
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
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Cost Optimization Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive financial analysis, savings identification, and ROI optimization for EV charging operations
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
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Total Savings</div>
              <div className="text-2xl font-bold text-green-900">$31,560</div>
              <div className="text-sm text-green-600 flex items-center">
                +18.3% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-green-700">vs. previous period</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Cost per kWh</div>
              <div className="text-2xl font-bold text-blue-900">$0.147</div>
              <div className="text-sm text-blue-600 flex items-center">
                -8.2% <TrendingDown className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-700">energy efficiency improved</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Average ROI</div>
              <div className="text-2xl font-bold text-purple-900">34.7%</div>
              <div className="text-sm text-purple-600 flex items-center">
                +5.4% <TrendingUp className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-purple-700">across all projects</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">Payback Period</div>
              <div className="text-2xl font-bold text-orange-900">2.8 yrs</div>
              <div className="text-sm text-orange-600 flex items-center">
                -0.3 yrs <TrendingDown className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          <div className="text-xs text-orange-700">average across projects</div>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Cost Category Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed breakdown of operational costs and savings opportunities</p>
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
          {/* Cost Metrics Table */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Cost Performance by Category</h3>
            <div className="space-y-4">
              {costMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{metric.category}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <span className="ml-2 font-bold">${metric.current.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Previous:</span>
                      <span className="ml-2 font-medium">${metric.previous.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Savings:</span>
                      <span className="ml-2 font-bold text-green-600">${metric.savings.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Target:</span>
                      <span className="ml-2 font-medium">${metric.target.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress to Target</span>
                      <span>{Math.round(((metric.previous - metric.current) / (metric.previous - metric.target)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${Math.min(100, ((metric.previous - metric.current) / (metric.previous - metric.target)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Trends Visualization */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Monthly Cost Trends</h3>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 h-80 rounded-lg flex items-center justify-center border border-gray-100">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Interactive Cost Analytics</h4>
                <p className="text-sm text-gray-600 max-w-sm">
                  Visual representation of cost trends, savings progression, and budget performance across all categories
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  View Full Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Opportunities */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Savings Opportunities</h2>
            <p className="text-sm text-gray-600 mt-1">Identified opportunities for cost reduction and efficiency improvement</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Potential: <span className="font-bold text-green-600">${savingsOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savingsOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                  <p className="text-sm text-gray-600">{opportunity.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${opportunity.potentialSavings.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">annual savings</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty} implementation
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.impact)}`}>
                  {opportunity.impact} impact
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {opportunity.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Implementation: {opportunity.timeframe}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Projects */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">ROI Investment Projects</h2>
            <p className="text-sm text-gray-600 mt-1">Current and proposed projects with return on investment analysis</p>
          </div>
          <Link 
            href="/ev-management/projects" 
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            View All Projects →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Investment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Annual Savings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">ROI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Payback</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {roiProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    ${project.investment.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-green-600 font-medium">
                    ${project.annualSavings.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-blue-600 font-bold">{project.roi}%</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {project.paybackPeriod} years
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'text-green-600 bg-green-100' :
                      project.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                      project.status === 'approved' ? 'text-purple-600 bg-purple-100' :
                      'text-gray-600 bg-gray-100'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Optimization Recommendations */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Smart Cost Optimization Plan</h2>
        <p className="mb-6 max-w-3xl mx-auto text-green-100">
          Our AI-powered analysis has identified $136,200 in annual savings opportunities through strategic 
          optimization and smart technology implementation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Immediate Actions</h3>
            <p className="text-sm text-green-100">$43,300 potential savings</p>
            <p className="text-xs text-green-200 mt-1">0-3 months implementation</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Medium-term Projects</h3>
            <p className="text-sm text-green-100">$58,700 potential savings</p>
            <p className="text-xs text-green-200 mt-1">3-12 months implementation</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Strategic Investments</h3>
            <p className="text-sm text-green-100">$34,200 potential savings</p>
            <p className="text-xs text-green-200 mt-1">12+ months implementation</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            href="/ev-management/optimization/plan" 
            className="px-6 py-3 bg-white text-green-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Download Full Plan
          </Link>
          <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-green-600 transition-colors font-medium">
            Schedule Consultation
          </button>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Cost tracking active</span>
          </div>
          <span>•</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Next analysis: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
} 
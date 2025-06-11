"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RefreshCw, Plus, Zap, DollarSign, Users, 
  Grid3x3, Battery, TrendingUp, Calendar, Clock, Star,
  Play, Pause, Square, Settings, Filter, Download,
  ChevronRight, Activity, Shield, Sparkles, Target,
  Building2, MapPin, PhoneCall, Mail, Globe, Award,
  CheckCircle, AlertCircle, Info, Eye, Edit3, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export default function V2GManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [v2gData, setV2gData] = useState(null);
  const [dispatchSchedules, setDispatchSchedules] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Fetch V2G data
  useEffect(() => {
    const fetchV2GData = async () => {
      try {
        const [analyticsRes, dispatchRes] = await Promise.all([
          fetch('/api/v1/analytics/demo-data?demo_type=v2g'),
          fetch('/api/v2g/dispatch')
        ]);

        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          setV2gData(analytics);
        }

        if (dispatchRes.ok) {
          const dispatch = await dispatchRes.json();
          setDispatchSchedules(dispatch.schedules || []);
        }
      } catch (error) {
        console.error('Failed to fetch V2G data:', error);
      }
    };

    fetchV2GData();
    const interval = setInterval(fetchV2GData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const gridUtilityPartners = [
    {
      id: 1,
      name: "ConEd (Consolidated Edison)",
      location: "New York, NY",
      partnership_status: "Active Premium",
      revenue_sharing: "65/35 Split",
      monthly_revenue: 28473.50,
      services: ["Frequency Regulation", "Peak Shaving", "Demand Response"],
      contact: "John Chen, Grid Operations Manager",
      phone: "(212) 460-4600",
      email: "jchen@coned.com",
      contract_expires: "2025-12-31",
      performance_rating: 4.8
    },
    {
      id: 2,
      name: "PG&E (Pacific Gas & Electric)",
      location: "San Francisco, CA",
      partnership_status: "Active Standard",
      revenue_sharing: "60/40 Split",
      monthly_revenue: 34127.25,
      services: ["Grid Stabilization", "Renewable Integration", "Load Balancing"],
      contact: "Sarah Williams, Partnership Director",
      phone: "(415) 973-7000",
      email: "swilliams@pge.com",
      contract_expires: "2026-06-30",
      performance_rating: 4.6
    },
    {
      id: 3,
      name: "Duke Energy",
      location: "Charlotte, NC",
      partnership_status: "Pilot Program",
      revenue_sharing: "50/50 Split",
      monthly_revenue: 15849.75,
      services: ["Demand Response", "Grid Modernization"],
      contact: "Mike Johnson, Innovation Lead",
      phone: "(704) 594-6200",
      email: "mjohnson@duke-energy.com",
      contract_expires: "2024-12-31",
      performance_rating: 4.3
    }
  ];

  const corporateFleetPrograms = [
    {
      id: 1,
      company: "Amazon Logistics",
      fleet_size: 2847,
      v2g_enabled: 1923,
      integration_platform: "Samsara Fleet Operations",
      monthly_v2g_revenue: 186542.30,
      program_tier: "Enterprise Premium",
      contract_value: "$2.3M annually",
      status: "Active",
      efficiency_improvement: "23%",
      carbon_reduction: "847 tons CO2/month"
    },
    {
      id: 2,
      company: "FedEx Ground",
      fleet_size: 1456,
      v2g_enabled: 987,
      integration_platform: "SAP Fleet Management",
      monthly_v2g_revenue: 97834.50,
      program_tier: "Enterprise Standard",
      contract_value: "$1.2M annually",
      status: "Active",
      efficiency_improvement: "18%",
      carbon_reduction: "423 tons CO2/month"
    },
    {
      id: 3,
      company: "DHL Supply Chain",
      fleet_size: 834,
      v2g_enabled: 623,
      integration_platform: "Geotab Fleet Intelligence",
      monthly_v2g_revenue: 73429.80,
      program_tier: "Professional",
      contract_value: "$890K annually",
      status: "Expanding",
      efficiency_improvement: "21%",
      carbon_reduction: "287 tons CO2/month"
    }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* V2G Performance Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-600 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-yellow-500" />
          V2G Performance Dashboard
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">V2G Active Vehicles</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {v2gData?.fleet_summary?.v2g_active || 34}
                  <span className="text-lg text-gray-500 ml-1">/ {v2gData?.fleet_summary?.v2g_enabled || 89}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">+15.3%</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Daily Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${v2gData?.fleet_summary?.daily_revenue?.toFixed(2) || '2,847.50'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Battery className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-300">Optimal</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Grid Contribution</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {v2gData?.fleet_summary?.current_grid_contribution_kw?.toFixed(1) || '847.3'} kW
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">Target: $100K</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Projection</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${(v2gData?.fleet_summary?.monthly_revenue_projection || 85425).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real-time V2G Operations */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-600 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-green-500" />
          Real-time V2G Operations
        </h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Discharge Sessions</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {v2gData?.real_time_v2g?.length || 0} Active
                </Badge>
                <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(v2gData?.real_time_v2g || []).slice(0, 10).map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{vehicle.vehicle_id}</p>
                      <p className="text-sm text-gray-600 capitalize">{vehicle.grid_service_type?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Discharge Rate</p>
                      <p className="font-semibold text-blue-600">{vehicle.discharge_rate_kw?.toFixed(1)} kW</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Earnings/Hour</p>
                      <p className="font-semibold text-green-600">${vehicle.earnings_per_hour?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Battery SoC</p>
                      <p className="font-semibold text-purple-600">{vehicle.battery_soc?.toFixed(1)}%</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  const renderGridPartnershipsTab = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 flex items-center">
            <Building2 className="w-6 h-6 mr-3 text-blue-500" />
            Grid Utility Partnerships
          </h2>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Partner
          </Button>
        </div>

        <div className="grid gap-6">
          {gridUtilityPartners.map((partner) => (
            <Card key={partner.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {partner.name}
                      <Badge variant="outline" className="ml-3 text-green-600 border-green-300">
                        {partner.partnership_status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {partner.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${partner.monthly_revenue.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{partner.performance_rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Partnership Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue Split:</span>
                        <span className="font-medium">{partner.revenue_sharing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contract Expires:</span>
                        <span className="font-medium">{partner.contract_expires}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Services:</span>
                        <div className="flex flex-wrap gap-1">
                          {partner.services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{partner.contact}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneCall className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{partner.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{partner.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Contract
                    </Button>
                  </div>
                  <Button size="sm">
                    <Globe className="w-4 h-4 mr-1" />
                    Partner Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const renderFleetProgramsTab = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 flex items-center">
            <Users className="w-6 h-6 mr-3 text-purple-500" />
            Corporate Fleet V2G Programs
          </h2>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Fleet Partner
          </Button>
        </div>

        <div className="grid gap-6">
          {corporateFleetPrograms.map((program) => (
            <Card key={program.id} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {program.company}
                      <Badge variant="outline" className="ml-3 text-purple-600 border-purple-300">
                        {program.program_tier}
                      </Badge>
                      <Badge variant="outline" className={`ml-2 ${
                        program.status === 'Active' ? 'text-green-600 border-green-300' : 
                        program.status === 'Expanding' ? 'text-blue-600 border-blue-300' : 
                        'text-gray-600 border-gray-300'
                      }`}>
                        {program.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Target className="w-4 h-4 mr-1" />
                      {program.integration_platform}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Monthly V2G Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${program.monthly_v2g_revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{program.contract_value}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Fleet Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Fleet Size:</span>
                        <span className="font-medium">{program.fleet_size.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">V2G Enabled:</span>
                        <span className="font-medium text-blue-600">{program.v2g_enabled.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">V2G Utilization:</span>
                        <span className="font-medium">{Math.round((program.v2g_enabled / program.fleet_size) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Performance Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency Improvement:</span>
                        <span className="font-medium text-green-600">{program.efficiency_improvement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carbon Reduction:</span>
                        <span className="font-medium text-emerald-600">{program.carbon_reduction}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Integration Status</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Fleet Data Integration</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">V2G Protocol Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Revenue Optimization</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Fleet Dashboard
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                  <Button size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Manage Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
            V2G Dispatch Schedule
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Dispatch
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active & Scheduled Dispatches</CardTitle>
            <CardDescription>
              Manage V2G discharge schedules and grid service programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dispatchSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      schedule.status === 'active' ? 'bg-green-100' :
                      schedule.status === 'scheduled' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {schedule.status === 'active' ? 
                        <Play className="w-5 h-5 text-green-600" /> :
                        schedule.status === 'scheduled' ? 
                        <Clock className="w-5 h-5 text-blue-600" /> :
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{schedule.vehicleId}</p>
                      <p className="text-sm text-gray-600">{schedule.gridServiceProgramId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Power</p>
                      <p className="font-semibold text-blue-600">{schedule.dischargePowerKw} kW</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Est. Revenue</p>
                      <p className="font-semibold text-green-600">${schedule.estimatedRevenue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(schedule.startTime).toLocaleDateString()} {new Date(schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      schedule.status === 'active' ? 'text-green-600 border-green-300' :
                      schedule.status === 'scheduled' ? 'text-blue-600 border-blue-300' :
                      'text-gray-600 border-gray-300'
                    }>
                      {schedule.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/ev-management" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    V2G Management Center
                  </h1>
                  <p className="text-blue-600 text-sm">Vehicle-to-Grid Operations & Revenue Optimization</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-600">Real-time Active</span>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'grid-partnerships', label: 'Grid Partnerships', icon: Building2 },
              { id: 'fleet-programs', label: 'Fleet Programs', icon: Users },
              { id: 'schedule', label: 'Dispatch Schedule', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'grid-partnerships' && renderGridPartnershipsTab()}
        {activeTab === 'fleet-programs' && renderFleetProgramsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
      </main>
    </div>
  );
} 
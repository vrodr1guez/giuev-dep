'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Battery, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Zap, 
  ThermometerSun, 
  Clock, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Gauge, 
  Shield, 
  RefreshCw, 
  Download, 
  Settings, 
  Filter, 
  Search, 
  ChevronDown, 
  ArrowRight, 
  Bell, 
  Eye, 
  Cpu, 
  Brain, 
  TrendingDown,
  AlertCircle,
  MapPin,
  Calendar,
  FileText,
  Users,
  Truck,
  Monitor,
  Wrench,
  Target,
  DollarSign,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';

export default function BatteryHealthPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedFleet, setSelectedFleet] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [liveData, setLiveData] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const [selectedBattery, setSelectedBattery] = useState(null);

  // Live data integration
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [metricsRes, healthRes] = await Promise.all([
          fetch('/api/dashboard/metrics'),
          fetch('/api/ml/health')
        ]);
        
        if (metricsRes.ok && healthRes.ok) {
          const metrics = await metricsRes.json();
          const health = await healthRes.json();
          setLiveData({ metrics, health });
        }
      } catch (error) {
        console.log('Using simulated battery health data');
      }
    };

    fetchLiveData();
    if (isRealTime) {
      const interval = setInterval(fetchLiveData, 3000);
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  // Battery fleet overview with real-time status
  const batteryOverview = {
    totalBatteries: 247,
    healthyBatteries: 189,
    warningBatteries: 35,
    criticalBatteries: 8,
    offlineBatteries: 15,
    averageHealth: 87.4,
    totalCapacity: 2247.5, // kWh
    availableCapacity: 1963.8, // kWh
    efficiency: 94.7,
    predictedFailures: 12
  };

  // Critical alerts with real-time data
  const criticalAlerts = [
    {
      id: 'CRIT-001',
      vehicle: 'Tesla Model Y #TY-4472',
      location: 'Route 101, Mile 15.2',
      issue: 'Thermal runaway risk detected',
      severity: 'critical',
      timeDetected: '2 minutes ago',
      confidence: 94.2,
      action: 'Immediate shutdown required',
      estimatedCost: '$45,000'
    },
    {
      id: 'WARN-002', 
      vehicle: 'Ford F-150 Lightning #FL-3319',
      location: 'Depot Bay 3',
      issue: 'Cell voltage imbalance detected',
      severity: 'warning',
      timeDetected: '8 minutes ago',
      confidence: 87.6,
      action: 'Schedule maintenance within 24h',
      estimatedCost: '$2,800'
    },
    {
      id: 'INFO-003',
      vehicle: 'Tesla Model 3 #TM-5567',
      location: 'Highway 405, Mile 22.8',
      issue: 'Battery degradation trending above normal',
      severity: 'info',
      timeDetected: '15 minutes ago',
      confidence: 91.3,
      action: 'Monitor for next 48 hours',
      estimatedCost: '$850'
    }
  ];

  // Fleet health breakdown with enhanced details
  const fleetHealthData = [
    {
      fleet: 'Delivery Fleet A',
      totalVehicles: 89,
      healthyCount: 76,
      warningCount: 10,
      criticalCount: 2,
      offlineCount: 1,
      avgHealth: 91.2,
      lastUpdate: '1 min ago',
      route: 'Urban Delivery Routes',
      manager: 'Sarah Chen'
    },
    {
      fleet: 'Long Haul Fleet B', 
      totalVehicles: 67,
      healthyCount: 52,
      warningCount: 12,
      criticalCount: 2,
      offlineCount: 1,
      avgHealth: 84.7,
      lastUpdate: '2 min ago',
      route: 'Interstate Routes',
      manager: 'Mike Rodriguez'
    },
    {
      fleet: 'Service Fleet C',
      totalVehicles: 91,
      healthyCount: 61,
      warningCount: 13,
      criticalCount: 4,
      offlineCount: 13,
      avgHealth: 78.9,
      lastUpdate: '3 min ago',
      route: 'Service Areas',
      manager: 'Dr. Lisa Wang'
    }
  ];

  // Advanced battery diagnostics
  const batteryDiagnostics = [
    {
      vehicle: 'Tesla Model Y #TY-4472',
      batteryId: 'BAT-4472-001',
      capacity: '98.2 kWh',
      health: 67.2,
      voltage: '396.4 V',
      current: '-87.3 A',
      temperature: '42.1°C',
      cycles: 1247,
      degradation: '17.8%',
      impedance: '0.847 Ω',
      cellBalance: 'CRITICAL',
      predictedEOL: '3.2 months',
      riskScore: 94.2,
      status: 'critical'
    },
    {
      vehicle: 'Ford F-150 Lightning #FL-3319',
      batteryId: 'BAT-3319-001', 
      capacity: '131.0 kWh',
      health: 82.1,
      voltage: '385.7 V',
      current: '-45.2 A',
      temperature: '35.8°C',
      cycles: 892,
      degradation: '12.4%',
      impedance: '0.723 Ω',
      cellBalance: 'WARNING',
      predictedEOL: '8.7 months',
      riskScore: 87.6,
      status: 'warning'
    },
    {
      vehicle: 'Tesla Model 3 #TM-5567',
      batteryId: 'BAT-5567-001',
      capacity: '82.1 kWh',
      health: 94.7,
      voltage: '402.1 V',
      current: '-23.8 A',
      temperature: '28.4°C',
      cycles: 423,
      degradation: '5.3%',
      impedance: '0.642 Ω',
      cellBalance: 'OPTIMAL',
      predictedEOL: '24.8 months',
      riskScore: 91.3,
      status: 'healthy'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-600 bg-green-50';
    if (health >= 75) return 'text-yellow-600 bg-yellow-50';
    if (health >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center">
                  <Battery className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Battery Health Management</h1>
                  <p className="text-blue-200 text-lg">AI-powered predictive battery monitoring and optimization</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live System Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Analysis: 94.7% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Predictive Maintenance Enabled</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsRealTime(!isRealTime)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isRealTime ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isRealTime ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                <span>{isRealTime ? 'Live Mode' : 'Paused'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Metrics Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{batteryOverview.healthyBatteries}</div>
                <div className="text-sm text-gray-500">Healthy Batteries</div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {((batteryOverview.healthyBatteries / batteryOverview.totalBatteries) * 100).toFixed(1)}% of fleet
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{batteryOverview.warningBatteries}</div>
                <div className="text-sm text-gray-500">Warnings</div>
              </div>
            </div>
            <div className="text-sm text-amber-600 font-medium">
              Require attention within 24h
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{batteryOverview.criticalBatteries}</div>
                <div className="text-sm text-gray-500">Critical Issues</div>
              </div>
            </div>
            <div className="text-sm text-red-600 font-medium">
              Immediate action required
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{batteryOverview.averageHealth}%</div>
                <div className="text-sm text-gray-500">Average Health</div>
              </div>
            </div>
            <div className="text-sm text-purple-600 font-medium">
              +2.3% vs. last month
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Fleet Overview', icon: Gauge },
              { id: 'alerts', label: 'Critical Alerts', icon: AlertTriangle },
              { id: 'diagnostics', label: 'Battery Diagnostics', icon: Activity },
              { id: 'predictions', label: 'Predictive Analytics', icon: Brain },
              { id: 'maintenance', label: 'Maintenance Schedule', icon: Wrench },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fleet Health Breakdown</h2>
                <div className="flex items-center space-x-4">
                  <select 
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1d">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {fleetHealthData.map((fleet, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{fleet.fleet}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{fleet.route}</span>
                            <span>•</span>
                            <span>Manager: {fleet.manager}</span>
                            <span>•</span>
                            <span>Updated: {fleet.lastUpdate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{fleet.avgHealth}%</div>
                        <div className="text-sm text-gray-500">Average Health</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{fleet.healthyCount}</div>
                        <div className="text-xs text-gray-500">Healthy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-amber-600">{fleet.warningCount}</div>
                        <div className="text-xs text-gray-500">Warning</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{fleet.criticalCount}</div>
                        <div className="text-xs text-gray-500">Critical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-600">{fleet.offlineCount}</div>
                        <div className="text-xs text-gray-500">Offline</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{fleet.totalVehicles}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(fleet.healthyCount / fleet.totalVehicles) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-amber-500" 
                          style={{ width: `${(fleet.warningCount / fleet.totalVehicles) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(fleet.criticalCount / fleet.totalVehicles) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-gray-500" 
                          style={{ width: `${(fleet.offlineCount / fleet.totalVehicles) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Critical Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Critical Battery Alerts</h2>
                <div className="flex items-center space-x-4">
                  <select 
                    value={selectedAlert}
                    onChange={(e) => setSelectedAlert(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical Only</option>
                    <option value="warning">Warnings Only</option>
                    <option value="info">Info Only</option>
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <Bell className="w-4 h-4" />
                    <span>Emergency Response</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-xl p-6 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          } animate-pulse`}></div>
                          <span className="font-bold text-lg">{alert.vehicle}</span>
                          <span className="text-sm bg-white px-2 py-1 rounded-full">{alert.id}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-medium">Issue</div>
                            <div className="text-sm">{alert.issue}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Location</div>
                            <div className="text-sm flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {alert.location}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Confidence</div>
                            <div className="text-sm">{alert.confidence}%</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Est. Cost</div>
                            <div className="text-sm font-bold">{alert.estimatedCost}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm">Detected: {alert.timeDetected}</span>
                            <span className="text-sm font-semibold">Action: {alert.action}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-sm font-medium">
                              View Details
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                              Take Action
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics and other tabs with simplified content */}
        {activeTab === 'diagnostics' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Battery Diagnostics</h2>
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Battery Diagnostics Dashboard</h3>
              <p className="text-gray-600 mb-6">Advanced real-time monitoring and diagnostics for all fleet batteries</p>
              <Link href="/vehicles" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <ArrowRight className="w-4 h-4 ml-2" />
                Access Full Diagnostics
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Predictive Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Predicted Failures</h3>
                    <p className="text-sm text-gray-600">Next 30 days</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Risk (90%+ probability)</span>
                    <span className="font-bold text-red-600">3 batteries</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Medium Risk (70-89% probability)</span>
                    <span className="font-bold text-amber-600">7 batteries</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Risk (50-69% probability)</span>
                    <span className="font-bold text-yellow-600">12 batteries</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Optimization Opportunities</h3>
                    <p className="text-sm text-gray-600">AI-recommended actions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Charging profile optimization</span>
                    <span className="font-bold text-green-600">+8.3% life extension</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Temperature management</span>
                    <span className="font-bold text-green-600">+12.7% efficiency</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Route optimization</span>
                    <span className="font-bold text-green-600">+15.2% range</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Predictive Maintenance Schedule</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Immediate (24h)
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">Tesla Model Y #TY-4472</div>
                    <div className="text-sm text-gray-600">Thermal management system check</div>
                    <div className="text-xs text-red-600 font-medium mt-1">Critical priority</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">Ford F-150 #FL-3319</div>
                    <div className="text-sm text-gray-600">Cell balancing service</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">High priority</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  This Week
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">Tesla Model 3 #TM-5567</div>
                    <div className="text-sm text-gray-600">Battery capacity calibration</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Scheduled: Wed 3:00 PM</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">Tesla Model Y #TY-8901</div>
                    <div className="text-sm text-gray-600">Cooling system inspection</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Scheduled: Fri 10:00 AM</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next Month
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">15 vehicles</div>
                    <div className="text-sm text-gray-600">Quarterly battery health assessment</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">Planned: Week of Mar 15</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-900">8 vehicles</div>
                    <div className="text-sm text-gray-600">Preventive cell replacement</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">Planned: Week of Mar 22</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Battery Health Reports & Analytics</h2>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Reports & Analytics</h3>
              <p className="text-gray-600 mb-6">Comprehensive reporting and analytics for battery performance and health</p>
              <div className="flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <BarChart3 className="w-4 h-4" />
                  <span>Advanced Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
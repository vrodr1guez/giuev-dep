"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Battery, 
  Zap, 
  Car, 
  Leaf, 
  BarChart2, 
  Server, 
  Cpu, 
  Clock, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  BarChart
} from 'lucide-react';
import axios from 'axios';

const EVManagementDemo = () => {
  const [activeDemo, setActiveDemo] = useState('charging');
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoData, setDemoData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const demoOptions = [
    { id: 'charging', label: 'Smart Charging', icon: <Zap className="h-5 w-5 mr-2" />, color: 'from-purple-500 to-purple-600' },
    { id: 'fleet', label: 'Fleet Management', icon: <Car className="h-5 w-5 mr-2" />, color: 'from-blue-500 to-blue-600' },
    { id: 'energy', label: 'Energy Optimization', icon: <Battery className="h-5 w-5 mr-2" />, color: 'from-green-500 to-green-600' },
    { id: 'v2g', label: 'V2G Integration', icon: <Leaf className="h-5 w-5 mr-2" />, color: 'from-teal-500 to-teal-600' },
    { id: 'analytics', label: 'Advanced Analytics', icon: <BarChart2 className="h-5 w-5 mr-2" />, color: 'from-amber-500 to-amber-600' },
    { id: 'api', label: 'API Integration', icon: <Server className="h-5 w-5 mr-2" />, color: 'from-rose-500 to-rose-600' },
  ];

  const demoContent = {
    charging: {
      title: "Smart Charging Demo",
      description: "Experience how our advanced AI optimizes charging schedules based on energy prices, vehicle needs, and grid capacity.",
      features: [
        "Dynamic load balancing across charging stations",
        "Demand response integration with utility providers",
        "Smart scheduling based on vehicle priority and departure times",
        "Automatic fault detection and resolution",
        "Remote monitoring and control capabilities"
      ],
      metrics: [
        { label: "Energy Cost Savings", value: "32%", color: "text-green-500" },
        { label: "Peak Demand Reduction", value: "47%", color: "text-blue-500" },
        { label: "Charging Efficiency", value: "93%", color: "text-purple-500" }
      ]
    },
    fleet: {
      title: "Fleet Management Demo",
      description: "See how our platform provides complete visibility and control over your EV fleet operations.",
      features: [
        "Real-time vehicle status monitoring and alerts",
        "Driver behavior analysis and coaching",
        "Preventative maintenance scheduling",
        "Range prediction and route optimization",
        "Asset utilization analytics"
      ],
      metrics: [
        { label: "Fleet Uptime", value: "98.7%", color: "text-green-500" },
        { label: "Maintenance Cost Reduction", value: "28%", color: "text-blue-500" },
        { label: "Range Optimization", value: "22%", color: "text-purple-500" }
      ]
    },
    energy: {
      title: "Energy Optimization Demo",
      description: "Discover how our platform reduces energy costs while maximizing renewable energy usage.",
      features: [
        "Time-of-use pricing optimization",
        "Demand charge management",
        "Renewable energy prioritization",
        "Energy storage integration",
        "Peak shaving and load shifting capabilities"
      ],
      metrics: [
        { label: "Renewable Energy Usage", value: "65%", color: "text-green-500" },
        { label: "Demand Charge Savings", value: "41%", color: "text-blue-500" },
        { label: "Grid Service Revenue", value: "$14K/yr", color: "text-purple-500" }
      ]
    },
    v2g: {
      title: "V2G Integration Demo",
      description: "Learn how our platform enables vehicle-to-grid services to generate revenue and support grid stability.",
      features: [
        "Bidirectional power flow management",
        "Participation in energy markets",
        "Grid frequency regulation",
        "Virtual power plant capabilities",
        "Battery health optimization during V2G operations"
      ],
      metrics: [
        { label: "V2G Revenue", value: "$2,800/veh/yr", color: "text-green-500" },
        { label: "Grid Service Success Rate", value: "99.2%", color: "text-blue-500" },
        { label: "Battery Impact", value: "<3%", color: "text-purple-500" }
      ]
    },
    analytics: {
      title: "Advanced Analytics Demo",
      description: "Explore powerful data insights that drive better business decisions and operational improvements.",
      features: [
        "Custom dashboards and reporting",
        "Predictive maintenance algorithms",
        "Energy usage pattern analysis",
        "Carbon emission tracking and reporting",
        "TCO and ROI calculators"
      ],
      metrics: [
        { label: "Prediction Accuracy", value: "94.5%", color: "text-green-500" },
        { label: "Data Processing Speed", value: "<2 sec", color: "text-blue-500" },
        { label: "Business Insights Generated", value: "250+", color: "text-purple-500" }
      ]
    },
    api: {
      title: "API Integration Demo",
      description: "See how our open API platform allows seamless integration with your existing systems and third-party services.",
      features: [
        "RESTful API with comprehensive documentation",
        "Webhook support for real-time events",
        "Enterprise SSO integration",
        "Custom data export options",
        "Partner ecosystem connections"
      ],
      metrics: [
        { label: "API Uptime", value: "99.99%", color: "text-green-500" },
        { label: "Average Response Time", value: "85ms", color: "text-blue-500" },
        { label: "Integration Partners", value: "45+", color: "text-purple-500" }
      ]
    }
  };

  const fetchDemoData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/analytics/demo-data?demo_type=${activeDemo}`);
      setDemoData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching demo data:", err);
      setError("Failed to load demo data. Try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoData();
    
    // Set up refresh interval if playing
    if (isPlaying) {
      const intervalId = setInterval(fetchDemoData, 5000);
      setRefreshInterval(intervalId);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [activeDemo, isPlaying]);

  useEffect(() => {
    if (isPlaying && !refreshInterval) {
      const intervalId = setInterval(fetchDemoData, 5000);
      setRefreshInterval(intervalId);
    } else if (!isPlaying && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [isPlaying]);

  const renderDemoVisualization = () => {
    if (loading && !demoData) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading demo data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 h-80 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium mb-2">Error Loading Data</p>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <button 
              onClick={fetchDemoData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!demoData) {
      return null;
    }

    switch (activeDemo) {
      case 'charging':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Live Charging Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demoData.live_data.active_sessions}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Power Utilization</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{demoData.live_data.power_utilization.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Energy Delivered</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{demoData.live_data.energy_delivered.toFixed(1)} kWh</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Load</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{demoData.live_data.current_load.toFixed(1)} kW</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Energy Price Signals</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {demoData.live_data.price_signals.map((signal, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{signal.time}</span>
                        <span className={`font-medium ${index === 0 ? 'text-green-500' : (signal.price > 0.15 ? 'text-red-500' : 'text-blue-500')}`}>
                          ${signal.price.toFixed(2)}/kWh
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Charging Stations</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {demoData.live_data.charging_stations.map((station, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">{station.id}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            station.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : station.status === 'idle'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {station.status}
                          </span>
                        </div>
                        {station.status === 'active' && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{station.power.toFixed(1)} kW</div>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${station.utilization}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'fleet':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fleet Management Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Vehicles</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {demoData.stats?.total_vehicles || 23}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {demoData.stats?.available || 8}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {demoData.stats?.in_use || 12}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average SOC</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {demoData.stats?.avg_soc ? demoData.stats.avg_soc.toFixed(1) : "70.5"}%
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Vehicle Status</h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SOC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Range</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {demoData.vehicles?.map((vehicle, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{vehicle.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{vehicle.model}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              vehicle.status === 'available' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : vehicle.status === 'in_use'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : vehicle.status === 'charging'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {vehicle.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex items-center">
                              <span className="mr-2">{vehicle.soc.toFixed(1)}%</span>
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    vehicle.soc > 70 ? 'bg-green-500' : 
                                    vehicle.soc > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${vehicle.soc}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{vehicle.range.toFixed(0)} mi</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{vehicle.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'v2g':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">V2G Operations Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Today</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">${demoData?.revenue_stats?.today?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue This Week</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${demoData?.revenue_stats?.this_week?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">V2G Vehicles</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{demoData?.v2g_capable_vehicles?.length || 0}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Projected Annual</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${demoData?.revenue_stats?.projected_annual ? (demoData.revenue_stats.projected_annual / 1000).toFixed(1) + "k" : "0.0k"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Grid Services</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {demoData?.grid_services?.map((service, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{service.service}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            service.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : service.status === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Vehicles</p>
                            <p className="font-medium text-gray-700 dark:text-gray-200">{service.vehicles}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Power</p>
                            <p className="font-medium text-gray-700 dark:text-gray-200">{service.power.toFixed(1)} kW</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="font-medium text-green-600">${service.revenue.toFixed(2)}/hr</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">V2G Capable Vehicles</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {demoData?.v2g_capable_vehicles?.map((vehicle, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-200">{vehicle.id}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{vehicle.model}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`h-2 w-2 rounded-full ${vehicle.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{vehicle.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm">
                            <div className="mr-2">
                              <span className="text-purple-600 dark:text-purple-400">{vehicle.soc.toFixed(0)}%</span>
                              <span className="text-gray-500 dark:text-gray-400 ml-2">{vehicle.max_discharge.toFixed(1)} kW</span>
                            </div>
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  vehicle.soc > 70 ? 'bg-green-500' : 
                                  vehicle.soc > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${vehicle.soc}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Analytics Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Energy Usage Trends</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium text-gray-700 dark:text-gray-200">Weekly Energy Usage (kWh)</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">View Details</div>
                    </div>
                    <div className="flex-1 flex items-end space-x-2">
                      {demoData?.energy_usage?.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm" 
                            style={{ height: `${(item.amount / 300) * 100}%` }}>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.day}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Carbon Savings</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-600 dark:text-gray-300">Daily CO₂ Reduction</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{demoData?.carbon_savings?.daily?.toFixed(1) || 0} kg</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-600 dark:text-gray-300">Monthly CO₂ Reduction</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{demoData?.carbon_savings?.monthly?.toFixed(1) || 0} kg</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-600 dark:text-gray-300">Yearly CO₂ Reduction</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">{demoData?.carbon_savings?.yearly?.toFixed(1) || 0} kg</div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600 dark:text-gray-300">Equivalent Trees Planted</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">{demoData?.carbon_savings?.equivalent_trees || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Efficiency Trends</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64">
                  <div className="h-full flex flex-col">
                    <div className="mb-3 flex justify-between">
                      <div className="font-medium text-gray-700 dark:text-gray-200">Monthly Efficiency (%)</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">View Report</div>
                    </div>
                    <div className="flex-1 relative">
                      <div className="absolute inset-0">
                        <div className="h-full flex items-end">
                          {demoData?.efficiency_trends?.map((trend, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full h-full flex items-end">
                                <div 
                                  className="w-4/5 bg-gradient-to-t from-purple-500 to-purple-300 dark:from-purple-600 dark:to-purple-400 rounded-t-sm mx-auto" 
                                  style={{ height: `${trend.efficiency}%` }}>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-top-left">{trend.month}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Predictive Insights</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
                      <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">Maintenance Alert</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Vehicle V005 battery health declining. Scheduled maintenance recommended within 2 weeks.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                      <div className="font-medium text-green-700 dark:text-green-300 mb-1">Energy Cost Optimization</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Shifting 30% of charging to off-peak hours could save $1,200 next month.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                      <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">Fleet Utilization</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">15% increase in fleet utilization possible with optimized scheduling.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
                      <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">Demand Forecast</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Predicted 22% increase in charging demand next month based on historical patterns.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'api':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">API Integration Platform</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">API Endpoints</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {demoData?.endpoints?.map((endpoint, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-mono text-sm font-medium text-rose-600 dark:text-rose-400">{endpoint.path}</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{endpoint.calls_today.toLocaleString()} calls today</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="flex items-center">
                              <div className="mr-2 text-gray-500 dark:text-gray-400">Success Rate:</div>
                              <div className={`font-medium ${
                                endpoint.success_rate > 99 ? 'text-green-600 dark:text-green-400' : 
                                endpoint.success_rate > 95 ? 'text-amber-600 dark:text-amber-400' : 
                                'text-red-600 dark:text-red-400'
                              }`}>{endpoint.success_rate.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className="mr-2 text-gray-500 dark:text-gray-400">Response Time:</div>
                              <div className={`font-medium ${
                                endpoint.avg_response_time < 100 ? 'text-green-600 dark:text-green-400' : 
                                endpoint.avg_response_time < 200 ? 'text-amber-600 dark:text-amber-400' : 
                                'text-red-600 dark:text-red-400'
                              }`}>{endpoint.avg_response_time.toFixed(0)}ms</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">Integration Status</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {demoData?.integration_status?.map((integration, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-200">{integration.partner}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Last sync: {integration.last_sync}</div>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${
                            integration.status === 'Connected' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                          <span className={`ml-2 text-sm ${
                            integration.status === 'Connected' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>{integration.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">API Documentation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                  <div className="font-mono text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">GET /api/v1/vehicles</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fetch all vehicles with filtering options including status, location, and charge level.</p>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="font-mono text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">POST /api/v1/charging/start</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Initiate a charging session with vehicle ID, connector ID, and charging parameters.</p>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="font-mono text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">GET /api/v1/analytics/summary</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Retrieve energy usage, cost savings, and operational statistics for custom date ranges.</p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button className="inline-flex items-center text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-sm font-medium">
                  <span>Explore Full API Documentation</span>
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 flex items-center justify-center h-80">
            <div className="text-center">
              <BarChart className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Please select a demo from the left to view visualization.</p>
            </div>
          </div>
        );
    }
  };

  const currentDemo = demoContent[activeDemo as keyof typeof demoContent];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
            EV Management Platform Demo
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto"
          >
            Explore our comprehensive EV charging and fleet management platform through interactive demonstrations
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Demo Selector */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/4"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <ChevronRight className="h-5 w-5 mr-2" /> Demo Categories
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {demoOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveDemo(option.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center transition-all ${
                      activeDemo === option.id
                        ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                    {activeDemo === option.id && (
                      <ChevronRight className="h-5 w-5 ml-auto" />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Demo session: 15:00
                  </div>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    {isPlaying ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-start mb-4">
                <Sparkles className="h-10 w-10 text-white/80 mr-3" />
                <div>
                  <h3 className="font-bold text-lg">Need a custom demo?</h3>
                  <p className="text-purple-100 text-sm">
                    Schedule a personalized demo with our product specialists
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white hover:bg-gray-100 text-purple-600 font-medium py-2 rounded-lg flex items-center justify-center text-sm"
              >
                Schedule Custom Demo
                <ChevronRight className="h-4 w-4 ml-1" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Demo Content */}
          <motion.div 
            key={activeDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-3/4 space-y-8"
          >
            {/* Demo Header */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">{currentDemo.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{currentDemo.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentDemo.metrics.map((metric, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Demo Visualization */}
            {renderDemoVisualization()}

            {/* Demo Features */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDemo.features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full mr-3 mt-0.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EVManagementDemo; 
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, Download, Calendar, Filter, ExternalLink } from 'lucide-react';

export default function MarketForecastPage() {
  // Sample data for energy price forecasts
  const energyPriceData = [
    { month: 'Jan', peak: 0.148, offPeak: 0.092, average: 0.120 },
    { month: 'Feb', peak: 0.152, offPeak: 0.094, average: 0.123 },
    { month: 'Mar', peak: 0.145, offPeak: 0.091, average: 0.118 },
    { month: 'Apr', peak: 0.139, offPeak: 0.087, average: 0.113 },
    { month: 'May', peak: 0.142, offPeak: 0.089, average: 0.115 },
    { month: 'Jun', peak: 0.158, offPeak: 0.098, average: 0.128 },
    { month: 'Jul', peak: 0.172, offPeak: 0.105, average: 0.138 },
    { month: 'Aug', peak: 0.168, offPeak: 0.102, average: 0.135 },
    { month: 'Sep', peak: 0.156, offPeak: 0.097, average: 0.127 },
    { month: 'Oct', peak: 0.149, offPeak: 0.093, average: 0.121 },
    { month: 'Nov', peak: 0.154, offPeak: 0.095, average: 0.124 },
    { month: 'Dec', peak: 0.162, offPeak: 0.099, average: 0.130 },
  ];

  // Sample data for grid load distribution
  const gridLoadData = [
    { name: 'Residential', value: 35 },
    { name: 'Commercial', value: 25 },
    { name: 'Industrial', value: 20 },
    { name: 'EV Charging', value: 15 },
    { name: 'Other', value: 5 },
  ];

  // Sample data for demand response potential
  const demandResponseData = [
    { hour: '00:00', potential: 12 },
    { hour: '02:00', potential: 10 },
    { hour: '04:00', potential: 8 },
    { hour: '06:00', potential: 15 },
    { hour: '08:00', potential: 25 },
    { hour: '10:00', potential: 35 },
    { hour: '12:00', potential: 38 },
    { hour: '14:00', potential: 40 },
    { hour: '16:00', potential: 45 },
    { hour: '18:00', potential: 48 },
    { hour: '20:00', potential: 32 },
    { hour: '22:00', potential: 20 },
  ];

  // Sample data for renewable energy forecast
  const renewableData = [
    { month: 'Jan', solar: 18, wind: 42, hydro: 30 },
    { month: 'Feb', solar: 22, wind: 38, hydro: 30 },
    { month: 'Mar', solar: 30, wind: 35, hydro: 28 },
    { month: 'Apr', solar: 35, wind: 32, hydro: 32 },
    { month: 'May', solar: 40, wind: 28, hydro: 36 },
    { month: 'Jun', solar: 45, wind: 25, hydro: 32 },
    { month: 'Jul', solar: 48, wind: 22, hydro: 28 },
    { month: 'Aug', solar: 45, wind: 24, hydro: 26 },
    { month: 'Sep', solar: 38, wind: 30, hydro: 28 },
    { month: 'Oct', solar: 30, wind: 35, hydro: 30 },
    { month: 'Nov', solar: 22, wind: 40, hydro: 32 },
    { month: 'Dec', solar: 18, wind: 45, hydro: 34 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management" className="hover:text-blue-600 dark:hover:text-blue-400">EV Management</a>
          <span className="mx-2">/</span>
          <a href="/ev-management/smart-grid" className="hover:text-blue-600 dark:hover:text-blue-400">Smart Grid</a>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-200">Market Forecast</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Energy Market Forecast</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Analysis and projections for energy markets and grid conditions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <ExternalLink className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Current Market: Balanced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Carbon Intensity: Low (124 g/kWh)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-purple-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Renewable Mix: 42%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Grid Stability: High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                Updated: Today, 10:15 AM
              </span>
            </div>
          </div>
        </motion.div>

        {/* Energy Price Forecast */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Energy Price Forecast</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">12-month projection of energy prices ($/kWh)</p>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Peak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Off-Peak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-purple-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Average</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyPriceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  domain={[0.08, 0.18]}
                />
                <Tooltip formatter={(value) => [`$${value.toFixed(3)}`, 'Price per kWh']} />
                <Legend />
                <Line type="monotone" dataKey="peak" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="offPeak" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Average</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">$0.155/kWh</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">+3.2% vs. last year</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Off-Peak Average</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$0.095/kWh</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">+1.8% vs. last year</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak/Off-Peak Ratio</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.63x</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">+1.4% vs. last year</div>
            </div>
          </div>
        </motion.div>

        {/* Grid Load Distribution & Demand Response */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Grid Load Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gridLoadData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gridLoadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Load Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {gridLoadData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              EV charging load projected to increase to 25% by 2026
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Demand Response Potential</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandResponseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="hour" />
                  <YAxis label={{ value: 'Megawatts (MW)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} MW`, 'Demand Response Potential']} />
                  <Bar dataKey="potential" fill="#6366f1" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Potential</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">48 MW</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">18:00 - 19:00</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">27.33 MW</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">+18% vs. last month</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Renewable Energy Forecast */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Renewable Energy Forecast</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">12-month projection of renewable energy mix (%)</p>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Solar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Wind</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Hydro</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={renewableData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
                <Area type="monotone" dataKey="solar" stackId="1" stroke="#eab308" fill="#fde047" />
                <Area type="monotone" dataKey="wind" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="hydro" stackId="1" stroke="#22c55e" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Solar</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">32.6%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">+5.2% vs. last year</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Wind</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">33.0%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">+1.8% vs. last year</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Hydro</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">30.5%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">-0.5% vs. last year</div>
            </div>
          </div>
        </motion.div>

        {/* Guidance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Smart Charging Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-2">Optimal Charging Windows</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Primary:</span>
                  <span className="font-medium">01:00 - 05:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Secondary:</span>
                  <span className="font-medium">13:00 - 15:00</span>
                </div>
                <div className="text-xs opacity-80 mt-2">
                  Using these windows can reduce energy costs by up to 24%
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-2">Grid Service Opportunities</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Demand Response:</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency Regulation:</span>
                  <span className="font-medium">Medium</span>
                </div>
                <div className="text-xs opacity-80 mt-2">
                  Projected revenue: $8.50 - $12.75 per vehicle per month
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold mb-2">Carbon Impact</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Best Carbon Intensity:</span>
                  <span className="font-medium">02:00 - 06:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Reduction:</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="text-xs opacity-80 mt-2">
                  Smart charging can save up to 145g CO₂/kWh vs. peak times
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

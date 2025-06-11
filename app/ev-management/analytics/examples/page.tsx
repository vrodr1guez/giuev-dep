"use client";

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  PieChart, 
  LineChart, 
  ArrowRight, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';

const AnalyticsExamplesPage = () => {
  const [activeCategory, setActiveCategory] = useState('dashboards');
  const [copiedIndex, setCopiedIndex] = useState(null as number | null);

  const categories = [
    { id: 'dashboards', label: 'Dashboards', icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { id: 'reports', label: 'Reports', icon: <LineChart className="h-5 w-5 mr-2" /> },
    { id: 'visualizations', label: 'Visualizations', icon: <PieChart className="h-5 w-5 mr-2" /> },
    { id: 'code', label: 'Code Samples', icon: <FileText className="h-5 w-5 mr-2" /> },
  ];

  const analyticsExamples = {
    dashboards: [
      {
        title: 'Fleet Operations Dashboard',
        description: 'A comprehensive view of your entire fleet with real-time metrics on vehicle status, energy consumption, and charging levels.',
        image: 'https://via.placeholder.com/600x400?text=Fleet+Operations+Dashboard',
        tags: ['Real-time', 'Interactive', 'KPIs'],
        linkUrl: '#fleet-dashboard',
      },
      {
        title: 'Charging Station Performance',
        description: 'Monitor all charging stations with detailed analytics on utilization, energy delivery, and maintenance needs.',
        image: 'https://via.placeholder.com/600x400?text=Charging+Station+Performance',
        tags: ['Network', 'Uptime', 'Efficiency'],
        linkUrl: '#station-dashboard',
      },
      {
        title: 'Energy Management Dashboard',
        description: 'Optimize your energy usage with insights on consumption patterns, peak demand, and cost forecasts.',
        image: 'https://via.placeholder.com/600x400?text=Energy+Management+Dashboard',
        tags: ['Costs', 'Renewable', 'Grid'],
        linkUrl: '#energy-dashboard',
      }
    ],
    reports: [
      {
        title: 'Monthly Fleet Performance Report',
        description: 'Comprehensive report showing key metrics, trends, and anomalies for the entire fleet over the reporting period.',
        image: 'https://via.placeholder.com/600x400?text=Fleet+Performance+Report',
        tags: ['PDF', 'Excel', 'Scheduled'],
        linkUrl: '#fleet-report',
      },
      {
        title: 'Driver Efficiency Analysis',
        description: 'Detailed breakdown of driver behavior, energy efficiency, and recommendations for improvement.',
        image: 'https://via.placeholder.com/600x400?text=Driver+Efficiency+Analysis',
        tags: ['Coaching', 'Metrics', 'Comparison'],
        linkUrl: '#driver-report',
      },
      {
        title: 'Charging Infrastructure ROI Report',
        description: 'Financial analysis of your charging infrastructure with cost savings, payback periods, and future projections.',
        image: 'https://via.placeholder.com/600x400?text=ROI+Report',
        tags: ['Financial', 'Projections', 'TCO'],
        linkUrl: '#roi-report',
      }
    ],
    visualizations: [
      {
        title: 'Energy Flow Sankey Diagram',
        description: 'Interactive visualization showing energy flow from source to vehicle, with breakdowns by time, location, and vehicle type.',
        image: 'https://via.placeholder.com/600x400?text=Energy+Flow+Sankey',
        tags: ['Interactive', 'D3.js', 'Flow'],
        linkUrl: '#sankey-viz',
      },
      {
        title: 'Geospatial Charging Heatmap',
        description: 'Map-based visualization showing charging demand hotspots across your service area with temporal filtering.',
        image: 'https://via.placeholder.com/600x400?text=Charging+Heatmap',
        tags: ['GIS', 'Temporal', 'Demand'],
        linkUrl: '#heatmap-viz',
      },
      {
        title: 'Battery Health Radar Chart',
        description: 'Multi-dimensional view of battery health factors across your fleet with comparative analysis.',
        image: 'https://via.placeholder.com/600x400?text=Battery+Health+Chart',
        tags: ['Predictive', 'Comparative', 'Health'],
        linkUrl: '#battery-viz',
      }
    ],
    code: [
      {
        title: 'API Integration for Real-time Data',
        description: 'Code samples for integrating our real-time data APIs into your existing systems and dashboards.',
        code: `// Example API request for real-time vehicle data
import axios from 'axios';

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.giuev.com/v1';

async function getVehicleRealTimeData(vehicleId) {
  try {
    const response = await axios.get(
      \`\${BASE_URL}/vehicles/\${vehicleId}/realtime\`,
      {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    throw error;
  }
}

// Usage
getVehicleRealTimeData('v-12345')
  .then(data => {
    console.log('Battery level:', data.batteryLevel);
    console.log('Charging status:', data.chargingStatus);
    console.log('Current location:', data.location);
  });`,
        language: 'javascript',
        tags: ['API', 'Real-time', 'Vehicles'],
      },
      {
        title: 'Custom Dashboard Widget with React',
        description: 'React component for creating a responsive energy consumption widget for your applications.',
        code: `import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchEnergyData } from './api';

const EnergyConsumptionWidget = ({ vehicleId, timeRange = '24h' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const energyData = await fetchEnergyData(vehicleId, timeRange);
        setData(energyData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [vehicleId, timeRange]);

  if (loading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="energy-widget">
      <h3>Energy Consumption - {timeRange}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="kWh" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyConsumptionWidget;`,
        language: 'jsx',
        tags: ['React', 'Chart', 'Component'],
      },
      {
        title: 'Data Processing with Python',
        description: 'Python scripts for processing and analyzing charging session data from CSV exports.',
        code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# Load charging session data
def load_charging_data(csv_file):
    """Load and preprocess charging session data from CSV file"""
    df = pd.read_csv(csv_file)
    
    # Convert timestamp columns to datetime
    df['start_time'] = pd.to_datetime(df['start_time'])
    df['end_time'] = pd.to_datetime(df['end_time'])
    
    # Calculate session duration in minutes
    df['duration_minutes'] = (df['end_time'] - df['start_time']).dt.total_seconds() / 60
    
    # Calculate energy delivery rate (kW)
    df['avg_power_kw'] = df['energy_delivered_kwh'] / (df['duration_minutes'] / 60)
    
    return df

# Analyze charging patterns by time of day
def analyze_charging_patterns(df):
    """Analyze charging patterns by time of day"""
    # Extract hour from start time
    df['hour_of_day'] = df['start_time'].dt.hour
    
    # Group by hour of day and calculate metrics
    hourly_stats = df.groupby('hour_of_day').agg({
        'session_id': 'count',
        'energy_delivered_kwh': 'sum',
        'duration_minutes': 'mean',
        'avg_power_kw': 'mean'
    }).reset_index()
    
    hourly_stats.rename(columns={'session_id': 'num_sessions'}, inplace=True)
    
    return hourly_stats

# Visualize results
def plot_charging_patterns(hourly_stats):
    """Create visualization of charging patterns"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # Plot number of sessions and energy delivered
    ax1.bar(hourly_stats['hour_of_day'], hourly_stats['num_sessions'], alpha=0.7, label='Number of Sessions')
    ax1.set_xlabel('Hour of Day')
    ax1.set_ylabel('Number of Sessions')
    ax1.set_xticks(range(0, 24))
    ax1.grid(axis='y', linestyle='--', alpha=0.7)
    
    ax1_twin = ax1.twinx()
    ax1_twin.plot(hourly_stats['hour_of_day'], hourly_stats['energy_delivered_kwh'], 
                 color='red', marker='o', linestyle='-', linewidth=2, label='Energy Delivered (kWh)')
    ax1_twin.set_ylabel('Total Energy Delivered (kWh)')
    
    lines, labels = ax1.get_legend_handles_labels()
    lines2, labels2 = ax1_twin.get_legend_handles_labels()
    ax1.legend(lines + lines2, labels + labels2, loc='upper left')
    
    # Plot average duration and power
    ax2.bar(hourly_stats['hour_of_day'], hourly_stats['duration_minutes'], alpha=0.7, label='Avg. Duration (min)')
    ax2.set_xlabel('Hour of Day')
    ax2.set_ylabel('Average Duration (minutes)')
    ax2.set_xticks(range(0, 24))
    ax2.grid(axis='y', linestyle='--', alpha=0.7)
    
    ax2_twin = ax2.twinx()
    ax2_twin.plot(hourly_stats['hour_of_day'], hourly_stats['avg_power_kw'], 
                 color='green', marker='s', linestyle='-', linewidth=2, label='Avg. Power (kW)')
    ax2_twin.set_ylabel('Average Power (kW)')
    
    lines, labels = ax2.get_legend_handles_labels()
    lines2, labels2 = ax2_twin.get_legend_handles_labels()
    ax2.legend(lines + lines2, labels + labels2, loc='upper left')
    
    plt.tight_layout()
    plt.savefig('charging_patterns.png', dpi=300)
    plt.show()
    
    return fig

# Main execution
if __name__ == "__main__":
    df = load_charging_data('charging_sessions.csv')
    hourly_stats = analyze_charging_patterns(df)
    plot_charging_patterns(hourly_stats)
    
    print("Analysis complete! Results saved to charging_patterns.png")`,
        language: 'python',
        tags: ['Python', 'Analysis', 'Pandas'],
      }
    ]
  };

  const examples = analyticsExamples[activeCategory as keyof typeof analyticsExamples];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
            Analytics Examples Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto"
          >
            Explore our library of sample analytics, reports, visualizations, and code examples for your EV management platform
          </motion.p>
        </div>

        {/* Category Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center mb-10 gap-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow'
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Search and Filter Section - For future implementation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 mb-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {activeCategory === 'dashboards' && 'Interactive Dashboard Examples'}
                {activeCategory === 'reports' && 'Report Templates & Examples'}
                {activeCategory === 'visualizations' && 'Data Visualization Gallery'}
                {activeCategory === 'code' && 'Code Samples & Snippets'}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download All
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium">
                View Documentation
              </button>
            </div>
          </div>
        </motion.div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCategory !== 'code' ? (
            // Display cards for dashboards, reports, and visualizations
            examples.map((example, index) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  <img 
                    src={example.image} 
                    alt={example.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{example.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{example.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {example.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={example.linkUrl}
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            // Display code examples
            examples.map((example: any, index) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 col-span-1 lg:col-span-3"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{example.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{example.description}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(example.code, index)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {example.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto font-mono text-sm">
                    <pre className="language-{example.language}">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Custom Analytics Solutions CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full inline-block">
                  <Activity className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Need Custom Analytics Solutions?</h2>
                <p className="text-blue-100 mb-6 max-w-2xl">
                  Our analytics team can help you build custom dashboards, reports, and data integrations specific to your fleet's unique requirements.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg flex items-center shadow-md hover:shadow-lg transition-all">
                    Schedule a Consultation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                  <button className="px-6 py-3 bg-blue-700/30 hover:bg-blue-700/40 text-white border border-white/20 font-medium rounded-lg flex items-center backdrop-blur-sm">
                    View Custom Solutions
                    <Zap className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsExamplesPage; 
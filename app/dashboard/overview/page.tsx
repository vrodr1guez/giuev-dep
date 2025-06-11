'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  Battery, 
  Zap, 
  BrainCircuit, 
  RefreshCw,
  TrendingUp,
  Maximize2,
  Clock,
  Activity,
  AlertCircle,
  Car,
  Users,
  DollarSign,
  Gauge,
  Network,
  Eye,
  Lock,
  Target,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Shield
} from 'lucide-react';
import MLDashboardEmbed from '@/app/components/MLDashboardEmbed';
import SystemStatus from '@/app/components/SystemStatus';
import { useRealTimeData } from '@/app/hooks/useRealTimeData';

// Enhanced metric card component
function MetricCard({ metric, onRefresh }) {
  const { title, value, change, changeType, isLoading, icon: Icon, description } = metric;
  
  return (
    <div className="bg-slate-800/70 rounded-xl border border-slate-700/50 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/90 group">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${
          changeType === 'positive' ? 'bg-emerald-900/30 text-emerald-500' : 
          changeType === 'negative' ? 'bg-red-900/30 text-red-500' : 
          'bg-blue-900/30 text-blue-500'
        }`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs">
            <span className={changeType === 'positive' ? 'text-emerald-500' : changeType === 'negative' ? 'text-red-500' : 'text-blue-500'}>
              {change}
            </span>
            <span className="text-slate-400">vs prev</span>
          </div>
          <button
            onClick={onRefresh}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 transition-all"
            title="Refresh this metric"
          >
            <RefreshCw className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {isLoading ? (
          <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-700"></div>
        ) : (
          <p className="mt-1 text-2xl font-semibold text-slate-200 transition-all duration-500">
            {value}
          </p>
        )}
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
        {isLoading && (
          <div className="flex items-center mt-1 text-xs text-slate-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1"></div>
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}

// Bidirectional Twin Status Card
function BidirectionalTwinCard({ title, value, status, icon: Icon, description, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-900/30 text-blue-500 border-blue-900/50",
    green: "bg-emerald-900/30 text-emerald-500 border-emerald-900/50", 
    purple: "bg-purple-900/30 text-purple-500 border-purple-900/50",
    orange: "bg-orange-900/30 text-orange-500 border-orange-900/50",
    red: "bg-red-900/30 text-red-500 border-red-900/50"
  };

  return (
    <div className={`bg-slate-800/70 rounded-xl border border-slate-700/50 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:${colorClasses[color]} group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' : status === 'warning' ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>
          <span className="text-xs text-slate-400 capitalize">{status}</span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
      <p className="text-lg font-semibold text-slate-200 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

// Chart card component
function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-slate-800/70 rounded-xl border border-slate-700/50 p-5 shadow-lg backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 mr-3 rounded-lg bg-blue-900/30 text-blue-500">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="font-medium text-slate-200">{title}</h2>
        </div>
        <button className="p-1 text-slate-400 hover:text-blue-400 rounded-full">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

// Connection status indicator
function ConnectionStatusIndicator({ status, lastUpdate, isAutoRefreshEnabled, onToggleAutoRefresh }) {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        {status === 'connected' && (
          <>
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-green-400">Live</span>
          </>
        )}
        {status === 'connecting' && (
          <>
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-yellow-400">Connecting...</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-400">Offline</span>
          </>
        )}
      </div>
      
      {lastUpdate && (
        <div className="flex items-center space-x-1 text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Last: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}
      
      <button
        onClick={onToggleAutoRefresh}
        className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
          isAutoRefreshEnabled 
            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
        title={isAutoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
      >
        {isAutoRefreshEnabled ? <RefreshCw className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        <span>{isAutoRefreshEnabled ? 'Live' : 'Manual'}</span>
      </button>
    </div>
  );
}

export default function DashboardOverview() {
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const [bidirectionalData, setBidirectionalData] = useState({
    totalStations: 0,
    totalVehicles: 0,
    activeSessions: 0,
    networkEfficiency: 0,
    federatedAccuracy: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Use the real-time data hook
  const {
    metrics,
    isLoading: dataLoading,
    lastUpdate,
    error,
    connectionStatus,
    refresh,
    toggleAutoRefresh,
    isAutoRefreshEnabled
  } = useRealTimeData({
    refreshInterval: 15000,
    enableAutoRefresh: true,
    endpoints: ['/api/dashboard/metrics']
  });

  // Fetch bidirectional twin data
  useEffect(() => {
    const fetchBidirectionalData = async () => {
      try {
        const response = await fetch('/api/bidirectional-twin?type=network_status');
        if (response.ok) {
          const data = await response.json();
          setBidirectionalData(data);
        }
      } catch (error) {
        console.error('Failed to fetch bidirectional data:', error);
      }
    };

    fetchBidirectionalData();
    const interval = setInterval(fetchBidirectionalData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced metrics with bidirectional twin data
  const enhancedMetrics = [
    ...metrics,
    {
      id: 'digital_twins',
      title: 'Digital Twins',
      value: `${bidirectionalData.totalStations + bidirectionalData.totalVehicles}`,
      change: '+12%',
      changeType: 'positive',
      isLoading: dataLoading,
      icon: Network,
      description: `${bidirectionalData.totalStations} stations, ${bidirectionalData.totalVehicles} vehicles`
    }
  ];

  // Global refresh handler
  const handleGlobalRefresh = async () => {
    setGlobalRefreshing(true);
    await refresh();
    setGlobalRefreshing(false);
  };

  // Demonstration handler
  const handleDemonstration = async () => {
    setIsOptimizing(true);
    try {
      // Create demo session
      await fetch('/api/bidirectional-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_station',
          stationId: `demo_station_${Date.now()}`,
          data: { powerCapacity: 150, efficiency: 0.94 }
        })
      });

      await fetch('/api/bidirectional-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_vehicle', 
          vehicleId: `demo_vehicle_${Date.now()}`,
          data: { soc: 45, soh: 94 }
        })
      });
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 text-gray-100 pb-12">
      <header className="bg-slate-800/70 border-b border-slate-700/80 shadow-lg sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              EV Charging Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <ConnectionStatusIndicator 
                status={connectionStatus}
                lastUpdate={lastUpdate}
                isAutoRefreshEnabled={isAutoRefreshEnabled}
                onToggleAutoRefresh={toggleAutoRefresh}
              />
              <button 
                onClick={handleGlobalRefresh}
                disabled={globalRefreshing || dataLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-md text-sm font-medium transition flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${globalRefreshing ? 'animate-spin' : ''}`} />
                {globalRefreshing ? 'Refreshing...' : 'Refresh All'}
              </button>
              <button 
                onClick={handleDemonstration}
                disabled={isOptimizing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-md text-sm font-medium transition flex items-center"
              >
                <Network className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
                {isOptimizing ? 'Demo Running...' : 'Demo Twin System'}
              </button>
            </div>
          </div>
          <nav className="flex items-center mt-2 gap-1">
            <Link
              href="/dashboard/overview"
              className="px-4 py-2 bg-slate-700 text-white rounded-md text-sm font-medium transition"
            >
              Overview
            </Link>
            <Link
              href="/ml-dashboard"
              className="px-4 py-2 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-md text-sm font-medium transition"
            >
              ML Dashboard
            </Link>
            <Link
              href="/ai-insights"
              className="px-4 py-2 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-md text-sm font-medium transition"
            >
              AI Insights
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-md text-sm font-medium transition"
            >
              Reports
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-medium text-slate-200 mb-1">Dashboard Overview</h2>
            <p className="text-slate-400">Monitor your EV charging infrastructure with bidirectional digital twins</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium transition flex items-center">
              <Maximize2 className="w-3 h-3 mr-1" />
              <span>Expand View</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-300 font-medium">Connection Error</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Enhanced metrics overview with bidirectional twin data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {enhancedMetrics.map((metric) => (
            <MetricCard 
              key={metric.id}
              metric={metric}
              onRefresh={refresh}
            />
          ))}
        </div>

        {/* Bidirectional Digital Twin Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-lg bg-purple-900/30 text-purple-400">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-slate-200">Bidirectional Digital Twin Network</h2>
                <p className="text-sm text-slate-400">Real-time station-vehicle communication & federated learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Live Network Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <BidirectionalTwinCard
              title="Real-time Optimization" 
              value="Active"
              status="active"
              icon={Gauge}
              description="Power optimized based on battery health, temperature & network conditions"
              color="green"
            />
            <BidirectionalTwinCard
              title="Autonomous Recognition"
              value={`${bidirectionalData.activeSessions}/hr`}
              status="active" 
              icon={Eye}
              description="Stations instantly recognize vehicles and adapt charging profiles"
              color="blue"
            />
            <BidirectionalTwinCard
              title="Collective Intelligence"
              value={`${Math.round(bidirectionalData.federatedAccuracy * 100)}%`}
              status="active"
              icon={BrainCircuit}
              description="Network gets smarter with each charging session"
              color="purple"
            />
            <BidirectionalTwinCard
              title="Privacy-Preserved Learning"
              value="98.5%"
              status="active"
              icon={Lock}
              description="Stations share insights without exposing sensitive data"
              color="orange"
            />
            <BidirectionalTwinCard
              title="Predictive Maintenance"
              value="30% ↓"
              status="active"
              icon={Target}
              description="Prevents costly failures and downtime"
              color="red"
            />
          </div>
        </div>

        {/* System Status Panel */}
        <div className="mb-8">
          <SystemStatus />
        </div>

        {/* Enhanced Charts section with bidirectional twin analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <ChartCard title="Energy Consumption Trend" icon={LineChart}>
            <MLDashboardEmbed 
              section="enhanced-forecasting" 
              height={300} 
              title="Energy Usage Prediction"
              description="Real-time forecasting with bidirectional optimization"
              showHeader={false}
              refreshInterval={30000}
            />
          </ChartCard>
          <ChartCard title="Digital Twin Performance" icon={Network}>
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{bidirectionalData.totalStations}</div>
                    <div className="text-xs text-slate-400">Station Twins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{bidirectionalData.totalVehicles}</div>
                    <div className="text-xs text-slate-400">Vehicle Twins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{bidirectionalData.activeSessions}</div>
                    <div className="text-xs text-slate-400">Active Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{Math.round(bidirectionalData.networkEfficiency * 100)}%</div>
                    <div className="text-xs text-slate-400">Network Efficiency</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300">Bidirectional communication active</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ML Insights section with enhanced features */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-lg bg-indigo-900/30 text-indigo-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-medium text-slate-200">Live ML Insights & Federated Learning</h2>
            </div>
            <div className="text-xs text-slate-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Federated learning across {bidirectionalData.totalStations} stations
            </div>
          </div>

          <MLDashboardEmbed 
            section="multi-task-learning"
            height={500}
            title="Advanced ML Predictions with Bidirectional Twins"
            description="Multi-task learning enhanced by station-vehicle communication and federated intelligence"
            refreshInterval={20000}
          />
        </div>

        {/* Enhanced Quick links with bidirectional features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/ml-dashboard?section=online-learning" 
            className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 hover:border-blue-900/50 transition-all group flex flex-col"
          >
            <div className="p-3 mb-4 rounded-lg bg-blue-900/20 text-blue-400 w-fit group-hover:bg-blue-900/30">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2 group-hover:text-blue-400">Online Learning</h3>
            <p className="text-sm text-slate-400 mb-4">Models continuously learn from bidirectional twin interactions</p>
            <div className="mt-auto text-blue-400 text-sm font-medium flex items-center">
              View dashboard
              <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link 
            href="/ml-dashboard?section=energy-optimization" 
            className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 hover:border-green-900/50 transition-all group flex flex-col"
          >
            <div className="p-3 mb-4 rounded-lg bg-green-900/20 text-green-400 w-fit group-hover:bg-green-900/30">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2 group-hover:text-green-400">Energy Optimization</h3>
            <p className="text-sm text-slate-400 mb-4">Real-time optimization through station-vehicle communication</p>
            <div className="mt-auto text-green-400 text-sm font-medium flex items-center">
              View dashboard
              <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link 
            href="/ai-insights" 
            className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 hover:border-purple-900/50 transition-all group flex flex-col"
          >
            <div className="p-3 mb-4 rounded-lg bg-purple-900/20 text-purple-400 w-fit group-hover:bg-purple-900/30">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2 group-hover:text-purple-400">AI Insights</h3>
            <p className="text-sm text-slate-400 mb-4">Advanced analytics powered by federated learning</p>
            <div className="mt-auto text-purple-400 text-sm font-medium flex items-center">
              View insights
              <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 
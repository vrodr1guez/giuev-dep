'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Car, 
  BarChart, 
  TrendingUp, 
  Shield, 
  BrainCircuit as Brain, 
  Navigation as Network, 
  ArrowRight, 
  CheckCircle,
  Users,
  Award,
  Sparkles,
  Battery,
  Home as Building,
  AlertTriangle,
  RefreshCw,
  Gauge,
  FileText,
  Search as Eye,
  Database,
  Layers,
  X,
  Navigation as Wifi,
  Compass as Target,
  Clock as Lock,
  Clock,
  Home,
  Activity,
  Settings,
  Info,
  Download,
  Filter,
  Bell,
  Calendar,
  Map,
  MapPin,
  PlusCircle,
  Edit,
  Trash,
  Save,
  Upload,
  ThermometerSun as Thermometer,
  Search as Monitor,
  Sun as Lightbulb,
  Zap as Rocket,
  Award as Star,
  ArrowRight as Play,
  X as Pause,
  RefreshCw as RotateCcw,
  Maximize2 as Maximize,
  Settings as Terminal,
  DollarSign,
  LineChart
} from 'lucide-react';

export default function SmartGridPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveData, setLiveData] = useState({
    gridLoad: 87.3,
    revenue: 1247,
    efficiency: 94.7,
    vehicles: 156,
    marketPrice: 0.42,
    gridFrequency: 59.98,
    powerFlow: 245.7,
    batteryHealth: 96.2,
    totalCustomers: 1847,
    activeConnections: 892,
    totalEnergyTraded: 3465.8,
    carbonOffset: 2341.5,
    gridStability: 99.8,
    responseTime: 0.8,
    predictionAccuracy: 94.7,
    revenueGrowth: 23.5
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedCustomer, setSelectedCustomer] = useState('all');

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      // Simulate live data updates
      setLiveData(prev => ({
        gridLoad: 85 + Math.random() * 10,
        revenue: 1200 + Math.random() * 100,
        efficiency: 93 + Math.random() * 3,
        vehicles: 150 + Math.floor(Math.random() * 20),
        marketPrice: 0.35 + Math.random() * 0.15,
        gridFrequency: 59.95 + Math.random() * 0.1,
        powerFlow: 200 + Math.random() * 100,
        batteryHealth: 95 + Math.random() * 3,
        totalCustomers: 1840 + Math.floor(Math.random() * 20),
        activeConnections: 880 + Math.floor(Math.random() * 30),
        totalEnergyTraded: 3400 + Math.random() * 200,
        carbonOffset: 2300 + Math.random() * 100,
        gridStability: 99.5 + Math.random() * 0.5,
        responseTime: 0.7 + Math.random() * 0.3,
        predictionAccuracy: 94 + Math.random() * 2,
        revenueGrowth: 20 + Math.random() * 10
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const gridMetrics = [
    { 
      value: `$${liveData.revenue.toFixed(0)}`, 
      label: 'Today Revenue', 
      icon: DollarSign, 
      description: 'V2G earnings',
      color: 'text-green-600',
      trend: '+12.5%',
      target: '$1,500'
    },
    { 
      value: `${liveData.gridLoad.toFixed(1)}%`, 
      label: 'Grid Load', 
      icon: Activity, 
      description: 'Current demand',
      color: 'text-blue-600',
      trend: '+3.2%',
      target: '90%'
    },
    { 
      value: `${liveData.powerFlow.toFixed(0)} kW`, 
      label: 'Power Flow', 
      icon: Zap, 
      description: 'Bidirectional',
      color: 'text-purple-600',
      trend: '+8.7%',
      target: '300 kW'
    },
    { 
      value: `${liveData.vehicles}`, 
      label: 'Active Vehicles', 
      icon: Car, 
      description: 'V2G enabled',
      color: 'text-indigo-600',
      trend: '+5',
      target: '200'
    },
    { 
      value: `${liveData.gridFrequency.toFixed(2)} Hz`, 
      label: 'Grid Frequency', 
      icon: Gauge, 
      description: 'Stability metric',
      color: 'text-emerald-600',
      trend: 'Stable',
      target: '60.00 Hz'
    },
    { 
      value: `${liveData.batteryHealth.toFixed(1)}%`, 
      label: 'Fleet Health', 
      icon: Battery, 
      description: 'Average SoH',
      color: 'text-orange-600',
      trend: '+0.3%',
      target: '98%'
    }
  ];

  const v2gCapabilities = [
    {
      id: 'frequency-regulation',
      icon: Activity,
      title: 'Frequency Regulation',
      badge: 'PREMIUM SERVICE',
      description: 'Provide rapid response to grid frequency changes with <1s response time',
      features: [
        { icon: Zap, text: 'Sub-second response time' },
        { icon: Brain, text: 'AI-powered frequency prediction' },
        { icon: DollarSign, text: '$200-400/MW/month revenue' },
        { icon: Shield, text: '99.8% reliability guarantee' },
        { icon: Gauge, text: 'Real-time frequency monitoring' }
      ],
      stats: {
        main: '<1s',
        sub: 'Response Time',
        additional: '10x faster than competitors'
      },
      liveMetrics: [
        { label: 'Frequency', value: liveData.gridFrequency.toFixed(2), unit: 'Hz' },
        { label: 'Response Rate', value: '99.8', unit: '%' },
        { label: 'Revenue/MW', value: '320', unit: '$' }
      ]
    },
    {
      id: 'demand-response',
      icon: TrendingUp,
      title: 'Demand Response',
      badge: 'PEAK OPTIMIZATION',
      description: 'Reduce grid demand during peak hours with 94.7% prediction accuracy',
      features: [
        { icon: Brain, text: 'ML demand forecasting' },
        { icon: Clock, text: 'Automated peak shaving' },
        { icon: BarChart, text: 'Load balancing optimization' },
        { icon: DollarSign, text: '$150-300/MW/month revenue' },
        { icon: Target, text: 'Precision load management' }
      ],
      stats: {
        main: '94.7%',
        sub: 'Prediction Accuracy',
        additional: 'vs 70% industry avg'
      },
      liveMetrics: [
        { label: 'Peak Reduction', value: '35', unit: '%' },
        { label: 'Load Factor', value: '0.87', unit: '' },
        { label: 'Efficiency', value: liveData.efficiency.toFixed(1), unit: '%' }
      ]
    },
    {
      id: 'energy-arbitrage',
      icon: DollarSign,
      title: 'Energy Arbitrage',
      badge: 'MARKET OPTIMIZATION',
      description: 'Buy low, sell high with ML price forecasting and automated trading',
      features: [
        { icon: LineChart, text: 'Price prediction algorithms' },
        { icon: RefreshCw, text: 'Automated trading execution' },
        { icon: BarChart, text: 'Portfolio optimization' },
        { icon: Shield, text: 'Risk management protocols' },
        { icon: TrendingUp, text: 'Revenue maximization' }
      ],
      stats: {
        main: `$${liveData.marketPrice.toFixed(2)}`,
        sub: 'Current Price/kWh',
        additional: 'Real-time pricing'
      },
      liveMetrics: [
        { label: 'Profit Margin', value: '23.5', unit: '%' },
        { label: 'Trade Success', value: '91.3', unit: '%' },
        { label: 'Daily Trades', value: '47', unit: '' }
      ]
    }
  ];

  const fleetVehicles = [
    {
      id: 'EV-001',
      name: 'Fleet Van #103',
      model: 'Ford E-Transit V2G',
      status: 'Grid Connected',
      location: 'Depot A - Bay 3',
      batteryLevel: 85,
      capacity: '68 kWh',
      available: '45 kWh',
      committed: '25 kWh',
      revenue: 12.75,
      gridServices: ['Frequency Regulation', 'Demand Response'],
      lastUpdate: '2 min ago',
      health: 97.2,
      temperature: 23
    },
    {
      id: 'EV-002',
      name: 'Delivery Van #218',
      model: 'Lightning F-150 V2G',
      status: 'Grid Connected',
      location: 'Depot B - Bay 1',
      batteryLevel: 72,
      capacity: '131 kWh',
      available: '60 kWh',
      committed: '30 kWh',
      revenue: 18.30,
      gridServices: ['Energy Arbitrage', 'Voltage Support'],
      lastUpdate: '1 min ago',
      health: 98.1,
      temperature: 25
    },
    {
      id: 'EV-003',
      name: 'Utility Truck #42',
      model: 'Rivian EDV V2G',
      status: 'Charging',
      location: 'Field Station C',
      batteryLevel: 45,
      capacity: '135 kWh',
      available: '0 kWh',
      committed: '0 kWh',
      revenue: 0.00,
      gridServices: [],
      lastUpdate: '5 min ago',
      health: 95.8,
      temperature: 22
    },
    {
      id: 'EV-004',
      name: 'Executive Car #15',
      model: 'Tesla Model S V2G',
      status: 'Grid Connected',
      location: 'HQ Parking',
      batteryLevel: 90,
      capacity: '100 kWh',
      available: '30 kWh',
      committed: '15 kWh',
      revenue: 9.65,
      gridServices: ['Frequency Regulation'],
      lastUpdate: '30 sec ago',
      health: 96.5,
      temperature: 24
    }
  ];

  const gridEvents = [
    {
      id: 1,
      type: 'Frequency Regulation',
      status: 'Active',
      priority: 'High',
      startTime: '14:00',
      endTime: '18:00',
      duration: '4h',
      compensation: '$0.51/kWh',
      commitment: '70 kWh',
      vehicles: 3,
      revenue: 35.70,
      description: 'Grid frequency stabilization during peak demand',
      gridOperator: 'PJM Interconnection'
    },
    {
      id: 2,
      type: 'Demand Response',
      status: 'Scheduled',
      priority: 'Medium',
      startTime: '21:00',
      endTime: '05:00',
      duration: '8h',
      compensation: '$0.38/kWh',
      commitment: '120 kWh',
      vehicles: 5,
      revenue: 45.60,
      description: 'Overnight load balancing and energy storage',
      gridOperator: 'CAISO'
    },
    {
      id: 3,
      type: 'Energy Arbitrage',
      status: 'Completed',
      priority: 'Low',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      compensation: '$0.48/kWh',
      commitment: '65 kWh',
      vehicles: 3,
      revenue: 31.20,
      description: 'Peak hour energy sales to maximize revenue',
      gridOperator: 'ERCOT'
    }
  ];

  const marketData = [
    { time: '00:00', price: 0.12, demand: 65, renewable: 45 },
    { time: '02:00', price: 0.08, demand: 55, renewable: 52 },
    { time: '04:00', price: 0.07, demand: 50, renewable: 48 },
    { time: '06:00', price: 0.15, demand: 70, renewable: 35 },
    { time: '08:00', price: 0.18, demand: 85, renewable: 28 },
    { time: '10:00', price: 0.22, demand: 90, renewable: 32 },
    { time: '12:00', price: 0.25, demand: 95, renewable: 38 },
    { time: '14:00', price: 0.30, demand: 100, renewable: 42 },
    { time: '16:00', price: 0.42, demand: 105, renewable: 35 },
    { time: '18:00', price: 0.38, demand: 98, renewable: 30 },
    { time: '20:00', price: 0.28, demand: 88, renewable: 25 },
    { time: '22:00', price: 0.18, demand: 75, renewable: 20 }
  ];

  // Unique Technology Metrics
  const uniqueTechMetrics = [
    {
      icon: Brain,
      title: 'AI Response Time',
      value: `${liveData.responseTime.toFixed(1)}s`,
      benchmark: 'vs 5-10s industry',
      improvement: '10x Faster',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Activity,
      title: 'Prediction Accuracy',
      value: `${liveData.predictionAccuracy.toFixed(1)}%`,
      benchmark: 'vs 70% industry',
      improvement: '+35% Better',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Shield,
      title: 'Grid Stability',
      value: `${liveData.gridStability.toFixed(1)}%`,
      benchmark: 'vs 95% standard',
      improvement: 'Enterprise Grade',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Growth',
      value: `+${liveData.revenueGrowth.toFixed(1)}%`,
      benchmark: 'Monthly increase',
      improvement: '3x Industry Avg',
      color: 'from-orange-600 to-red-600'
    }
  ];

  // Customer V2G Connections Data
  const customerConnections = [
    {
      id: 'CUST-001',
      company: 'Tesla Fleet Services',
      type: 'Enterprise',
      vehicles: 245,
      activeNow: 198,
      totalCapacity: '24.5 MWh',
      availableCapacity: '18.7 MWh',
      monthlyRevenue: 125840,
      gridServices: ['Frequency Regulation', 'Demand Response', 'Energy Arbitrage'],
      connectionQuality: 99.8,
      lastSync: '2 sec ago'
    },
    {
      id: 'CUST-002',
      company: 'Amazon Logistics',
      type: 'Enterprise',
      vehicles: 312,
      activeNow: 276,
      totalCapacity: '40.8 MWh',
      availableCapacity: '32.4 MWh',
      monthlyRevenue: 198450,
      gridServices: ['Demand Response', 'Peak Shaving', 'Voltage Support'],
      connectionQuality: 99.5,
      lastSync: '1 sec ago'
    },
    {
      id: 'CUST-003',
      company: 'City Transit Authority',
      type: 'Government',
      vehicles: 156,
      activeNow: 134,
      totalCapacity: '20.3 MWh',
      availableCapacity: '15.8 MWh',
      monthlyRevenue: 87620,
      gridServices: ['Frequency Regulation', 'Emergency Response'],
      connectionQuality: 99.9,
      lastSync: '3 sec ago'
    },
    {
      id: 'CUST-004',
      company: 'Walmart Distribution',
      type: 'Enterprise',
      vehicles: 189,
      activeNow: 167,
      totalCapacity: '24.7 MWh',
      availableCapacity: '19.2 MWh',
      monthlyRevenue: 112380,
      gridServices: ['Energy Arbitrage', 'Demand Response'],
      connectionQuality: 99.7,
      lastSync: '1 sec ago'
    }
  ];

  // Backend Integration Status
  const backendSystems = [
    {
      name: 'Grid Operator API',
      status: 'Connected',
      latency: '12ms',
      uptime: '99.99%',
      lastData: 'Real-time',
      icon: Network
    },
    {
      name: 'ML Prediction Engine',
      status: 'Active',
      latency: '8ms',
      uptime: '99.98%',
      lastData: '0.5s ago',
      icon: Brain
    },
    {
      name: 'Payment Gateway',
      status: 'Connected',
      latency: '45ms',
      uptime: '99.95%',
      lastData: '2s ago',
      icon: DollarSign
    },
    {
      name: 'Vehicle Telemetry',
      status: 'Streaming',
      latency: '5ms',
      uptime: '99.97%',
      lastData: 'Real-time',
      icon: Car
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Premium Navigation */}
      <nav className="nav-premium fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-electric rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-display-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GIU Intelligence
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-item">Home</Link>
              <Link href="/digital-twin-dashboard" className="nav-item">Digital Twin</Link>
              <Link href="/ml-dashboard" className="nav-item">ML Platform</Link>
              <Link href="/ev-management" className="nav-item">Fleet Intelligence</Link>
              <Link href="/grid-integration" className="nav-item">Grid Integration</Link>
              <Link href="/auth/login" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Updated */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/20 to-purple-100/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full px-6 py-3 mb-8 shadow-2xl">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  {liveData.activeConnections} Live V2G Connections
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                Enterprise V2G Command Center
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Powered by GIU Intelligence
                </span>
              </h1>
              
              <p className="text-2xl text-gray-700 mb-12 max-w-5xl mx-auto leading-relaxed font-medium">
                Managing <span className="text-blue-600 font-bold">{liveData.totalCustomers.toLocaleString()} enterprise customers</span> with 
                <span className="text-green-600 font-bold"> {liveData.activeConnections} active V2G connections</span> generating
                <span className="text-purple-600 font-bold"> ${(liveData.revenue * 30).toLocaleString()}/month</span> in grid revenue.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/ev-management/demo" className="btn-primary px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all bg-gradient-to-r from-green-600 to-emerald-600">
                  View Live Demo
                  <Play className="w-6 h-6 ml-2" />
                </Link>
                <Link href="/api-docs" className="btn-secondary px-12 py-6 text-xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Backend API Docs
                  <Database className="w-6 h-6 ml-2" />
                </Link>
              </div>

              {/* Key Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <div className="text-3xl font-black text-blue-600">{liveData.totalEnergyTraded.toFixed(0)} MWh</div>
                  <div className="text-sm text-gray-600 font-medium">Energy Traded Today</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <div className="text-3xl font-black text-green-600">{liveData.carbonOffset.toFixed(0)} tons</div>
                  <div className="text-sm text-gray-600 font-medium">CO₂ Offset</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <div className="text-3xl font-black text-purple-600">{liveData.gridStability.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600 font-medium">Grid Stability</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <div className="text-3xl font-black text-orange-600">&lt;{liveData.responseTime.toFixed(1)}s</div>
                  <div className="text-sm text-gray-600 font-medium">AI Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Technology Advantages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider">Unique Technology</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Why GIU Intelligence Leads the Market
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our proprietary AI and backend infrastructure delivers unmatched performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {uniqueTechMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
                       style={{ 
                         backgroundImage: `linear-gradient(to right, ${metric.color.split(' ')[1]}, ${metric.color.split(' ')[3]})` 
                       }}></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <Icon className="w-12 h-12 text-white mb-4" />
                    <div className="text-3xl font-black text-white mb-2">{metric.value}</div>
                    <div className="text-lg font-bold text-white mb-1">{metric.title}</div>
                    <div className="text-sm text-gray-400 mb-3">{metric.benchmark}</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${metric.color} text-white`}>
                      {metric.improvement}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer V2G Connections Dashboard */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Enterprise V2G Connections</h2>
              <p className="text-gray-600">Real-time monitoring of all customer fleets</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="enterprise">Enterprise Only</option>
                <option value="government">Government Only</option>
                <option value="utility">Utility Only</option>
              </select>
              <button className="btn-primary px-6 py-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {customerConnections.map((customer) => (
              <div key={customer.id} className="card-premium p-8 hover:scale-101 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{customer.company}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {customer.type}
                      </span>
                    </div>
                    <p className="text-gray-600">Customer ID: {customer.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${customer.connectionQuality > 99.5 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {customer.connectionQuality}% Connection Quality
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Last sync: {customer.lastSync}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.vehicles}</p>
                    <p className="text-sm text-green-600 font-medium">{customer.activeNow} active</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                    <p className="text-2xl font-bold text-blue-600">{customer.totalCapacity}</p>
                    <p className="text-sm text-gray-600">{customer.availableCapacity} available</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${customer.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600 font-medium">+18.5% MoM</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Active Grid Services</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.gridServices.map((service, index) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                        <BarChart className="w-4 h-4 mr-1" />
                        View Analytics
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure Services
                      </button>
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Revenue Report
                      </button>
                    </div>
                    <Link href={`/customers/${customer.id}`} className="text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backend Systems Integration Status */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 py-3 mb-6">
              <Database className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Backend Integration</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Real-Time System Status
            </h2>
            <p className="text-xl text-gray-600">
              All backend systems operating at peak performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {backendSystems.map((system, index) => {
              const Icon = system.icon;
              return (
                <div key={index} className="card-premium p-6 text-center">
                  <Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{system.name}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    system.status === 'Connected' || system.status === 'Active' || system.status === 'Streaming' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
                    {system.status}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latency:</span>
                      <span className="font-medium">{system.latency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium text-green-600">{system.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Data:</span>
                      <span className="font-medium">{system.lastData}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Grid Metrics Dashboard */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-2 mb-4">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-bold">LIVE DATA</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Real-Time Grid Operations
            </h2>
            <p className="text-xl text-gray-600">
              Live metrics from your V2G-enabled fleet
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {gridMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index}
                  className="metric-card text-center transition-all duration-500 cursor-pointer hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold">
                    {metric.trend}
                  </div>
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${metric.color}`} />
                  <div className="text-3xl font-black text-gray-900 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {metric.description}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Target: {metric.target}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* V2G Capabilities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-2 mb-6">
              <Network className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Advanced V2G Services</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Complete Grid Service Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Participate in multiple grid markets simultaneously with AI-powered optimization
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full shadow-lg p-2 border border-gray-200">
              {v2gCapabilities.map((capability) => (
                <button
                  key={capability.id}
                  onClick={() => setActiveTab(capability.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === capability.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {capability.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {v2gCapabilities.map((capability) => {
            if (activeTab !== capability.id) return null;
            const Icon = capability.icon;
            
            return (
              <div key={capability.id} className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-6">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-bold">{capability.badge}</span>
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    {capability.title}
                  </h3>
                  <p className="text-xl text-gray-600 mb-8">
                    {capability.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {capability.features.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FeatureIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <p className="text-gray-700 leading-relaxed font-medium">{feature.text}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Link 
                    href="/grid-integration"
                    className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-lg"
                  >
                    Learn More About {capability.title}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="card-premium p-8">
                    <div className="text-center mb-8">
                      <Icon className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                      <div className="text-5xl font-black text-gray-900 mb-2">
                        {capability.stats.main}
                      </div>
                      <p className="text-xl text-gray-600 font-medium mb-2">
                        {capability.stats.sub}
                      </p>
                      <p className="text-sm text-green-600 font-bold">
                        {capability.stats.additional}
                      </p>
                    </div>

                    {/* Live Metrics */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 text-green-500 mr-2" />
                        Live Performance
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {capability.liveMetrics.map((metric, index) => (
                          <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {metric.value}{metric.unit}
                            </div>
                            <div className="text-sm text-gray-600">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 blur-xl"></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fleet Status Dashboard */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">V2G Fleet Status</h2>
              <p className="text-gray-600">Real-time monitoring of your grid-connected vehicles</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary px-4 py-2">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </button>
              <button className="btn-primary px-4 py-2">
                <Maximize className="w-4 h-4 mr-2" />
                Full View
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Vehicle Cards */}
            <div className="lg:col-span-2">
              <div className="grid gap-6">
                {fleetVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="card-premium p-6 hover:scale-102 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                        <p className="text-gray-600">{vehicle.model}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{vehicle.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          vehicle.status === 'Grid Connected' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'Charging' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{vehicle.lastUpdate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Battery Level</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                vehicle.batteryLevel > 70 ? 'bg-green-500' : 
                                vehicle.batteryLevel > 40 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${vehicle.batteryLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{vehicle.batteryLevel}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Available</p>
                        <p className="text-lg font-bold text-blue-600">{vehicle.available}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Committed</p>
                        <p className="text-lg font-bold text-purple-600">{vehicle.committed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-green-600">${vehicle.revenue.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {vehicle.gridServices.map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {service}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Battery className="w-4 h-4" />
                          <span>{vehicle.health}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Thermometer className="w-4 h-4" />
                          <span>{vehicle.temperature}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Events Sidebar */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Active Grid Events</h3>
              <div className="space-y-4">
                {gridEvents.map((event) => (
                  <div key={event.id} className="card-premium p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{event.type}</h4>
                        <p className="text-sm text-gray-600">{event.gridOperator}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'Active' ? 'bg-green-100 text-green-800' :
                        event.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium text-green-600">${event.revenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicles:</span>
                        <span className="font-medium">{event.vehicles}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Visualization */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Energy Market Intelligence</h2>
            <p className="text-xl text-gray-600">Real-time pricing and demand forecasting</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Price Chart */}
            <div className="card-premium p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Market Prices (24h)</h3>
                <div className="flex space-x-2">
                  {['24h', '7d', '30d'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedTimeframe(period)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTimeframe === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end">
                  {marketData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full mx-1 rounded-t transition-all duration-300 ${
                          data.price > 0.30 ? 'bg-red-500' : 
                          data.price > 0.20 ? 'bg-orange-500' : 
                          data.price > 0.10 ? 'bg-green-500' : 
                          'bg-blue-500'
                        }`} 
                        style={{ height: `${data.price * 400}px` }}
                      ></div>
                      <div className="text-xs mt-2 text-gray-500">{data.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${liveData.marketPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Current Price/kWh</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">+23.5%</p>
                  <p className="text-sm text-gray-600">vs Yesterday</p>
                </div>
              </div>
            </div>

            {/* Demand Forecast */}
            <div className="card-premium p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Demand Forecast</h3>
              
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end">
                  {marketData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full mx-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-300"
                        style={{ height: `${data.demand * 2.5}px` }}
                      ></div>
                      <div className="text-xs mt-2 text-gray-500">{data.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{liveData.gridLoad.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Current Load</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">94.7%</p>
                  <p className="text-sm text-gray-600">Forecast Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 rounded-full px-6 py-3 mb-8">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">Maximize Grid Revenue</span>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-6">
            Turn Your Fleet Into a Grid Asset
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join the energy revolution with AI-powered V2G technology that generates revenue 
            while supporting grid stability and sustainability goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link href="/pricing" className="btn-primary bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
              Start Earning Revenue
              <DollarSign className="w-6 h-6 ml-2" />
            </Link>
            <Link href="/ev-management/demo" className="btn-secondary bg-white/10 backdrop-blur-sm text-white border-white/20 px-12 py-6 text-xl font-bold">
              Schedule Demo
              <Calendar className="w-6 h-6 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-sm text-gray-400">
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">Real-time Control</p>
              <p className="text-xs">Sub-second response</p>
            </div>
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold">AI Optimization</p>
              <p className="text-xs">94.7% accuracy</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold">Revenue Generation</p>
              <p className="text-xs">$500-1500/vehicle/year</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="font-semibold">Grid Certified</p>
              <p className="text-xs">Enterprise grade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 gradient-electric rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">GIU Intelligence</span>
                  <p className="text-sm text-gray-400">Smart Grid Integration Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                The most advanced V2G platform with AI-powered optimization, 
                real-time grid integration, and automated revenue generation.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">Response Time</p>
                  <p className="font-bold">&lt;1 Second</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">Accuracy</p>
                  <p className="font-bold">94.7%</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">Revenue/Vehicle</p>
                  <p className="font-bold">$500-1500/vehicle/year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
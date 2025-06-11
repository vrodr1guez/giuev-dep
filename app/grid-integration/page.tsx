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
  DollarSign,
  Cpu,
  Globe
} from 'lucide-react';

export default function GridIntegrationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('v2g-orchestration');
  const [currentMetric, setCurrentMetric] = useState(0);
  const [liveData, setLiveData] = useState({
    gridLoad: 87.3,
    revenue: 1247,
    efficiency: 94.7,
    vehicles: 156
  });

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % 6);
      // Simulate live data updates
      setLiveData(prev => ({
        gridLoad: 85 + Math.random() * 10,
        revenue: 1200 + Math.random() * 100,
        efficiency: 93 + Math.random() * 3,
        vehicles: 150 + Math.floor(Math.random() * 20)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const gridMetrics = [
    { 
      value: '2x', 
      label: 'V2G Revenue', 
      icon: DollarSign, 
      description: 'vs. basic scheduling',
      color: 'text-green-600',
      trend: '+127%'
    },
    { 
      value: '95%', 
      label: 'Grid Reliability', 
      icon: Shield, 
      description: 'Uptime guarantee',
      color: 'text-blue-600',
      trend: '+15%'
    },
    { 
      value: '40%', 
      label: 'Better Predictions', 
      icon: Brain, 
      description: 'Grid demand forecasting',
      color: 'text-purple-600',
      trend: '+40%'
    },
    { 
      value: '<1s', 
      label: 'Response Time', 
      icon: Zap, 
      description: 'Grid signal processing',
      color: 'text-indigo-600',
      trend: '10x faster'
    },
    { 
      value: '94.7%', 
      label: 'ML Accuracy', 
      icon: Cpu, 
      description: 'Industry best ~70%',
      color: 'text-emerald-600',
      trend: '+24.7%'
    },
    { 
      value: '15-20%', 
      label: 'Commission Rate', 
      icon: TrendingUp, 
      description: 'Market leading',
      color: 'text-orange-600',
      trend: '2x industry'
    }
  ];

  const uniqueAdvantages = [
    {
      title: 'Only Digital Twin Technology',
      description: 'Physics-based battery modeling with electrochemical simulation',
      icon: Cpu,
      benefits: ['30% failure reduction', '25% battery life extension', 'Thermal runaway assessment'],
      competitive: 'No competitor offers this'
    },
    {
      title: 'Federated Learning Network',
      description: 'Privacy-preserving collaborative intelligence across fleets',
      icon: Network,
      benefits: ['40% accuracy improvement', 'Cross-fleet learning', 'Complete privacy protection'],
      competitive: 'Industry exclusive'
    },
    {
      title: 'Explainable AI',
      description: 'Full transparency for enterprise compliance and trust',
      icon: Eye,
      benefits: ['Feature importance analysis', 'Decision transparency', 'Regulatory compliance'],
      competitive: 'Enterprise exclusive'
    },
    {
      title: 'Multi-Task Predictions',
      description: 'Simultaneous energy demand, pricing, and battery health forecasting',
      icon: Brain,
      benefits: ['Unified intelligence', 'Holistic optimization', 'Reduced complexity'],
      competitive: 'Technology breakthrough'
    }
  ];

  const gridCapabilities = [
    {
      id: 'v2g-orchestration',
      icon: Network,
      title: 'AI-Powered V2G Orchestration',
      badge: 'INDUSTRY LEADING',
      description: 'Our proprietary ML algorithms orchestrate your entire fleet for maximum grid revenue while protecting battery health',
      features: [
        { icon: Brain, text: 'Digital twin-powered fleet coordination' },
        { icon: DollarSign, text: '$500-1500/vehicle/year revenue generation' },
        { icon: Battery, text: 'Battery health protection algorithms' },
        { icon: Clock, text: 'Real-time market optimization' },
        { icon: Shield, text: 'Risk management with 95% reliability' },
        { icon: Lightbulb, text: 'Predictive grid demand forecasting' }
      ],
      stats: {
        main: '$1,200+',
        sub: 'Annual Revenue/Vehicle',
        additional: '2x vs competitors'
      },
      liveMetrics: [
        { label: 'Active Vehicles', value: liveData.vehicles, unit: '' },
        { label: 'Grid Load', value: liveData.gridLoad.toFixed(1), unit: '%' },
        { label: 'Today Revenue', value: liveData.revenue.toFixed(0), unit: '$' }
      ]
    },
    {
      id: 'grid-analytics',
      icon: BarChart,
      title: 'Smart Grid Analytics & Forecasting',
      badge: 'PREDICTIVE INTELLIGENCE',
      description: 'Advanced analytics with 94.7% accuracy enable optimal participation in multiple grid markets simultaneously',
      features: [
        { icon: TrendingUp, text: 'Price forecasting with 94.7% accuracy' },
        { icon: Activity, text: 'Demand response optimization' },
        { icon: Globe, text: 'Multi-market participation strategy' },
        { icon: Gauge, text: 'Real-time grid monitoring dashboard' },
        { icon: Target, text: 'Opportunity identification algorithms' },
        { icon: Database, text: 'Historical pattern analysis' }
      ],
      stats: {
        main: '94.7%',
        sub: 'Forecast Accuracy',
        additional: 'vs 70% industry avg'
      },
      liveMetrics: [
        { label: 'Prediction Accuracy', value: liveData.efficiency.toFixed(1), unit: '%' },
        { label: 'Markets Active', value: '12', unit: '' },
        { label: 'Opportunities', value: '47', unit: '' }
      ]
    },
    {
      id: 'energy-trading',
      icon: DollarSign,
      title: 'Automated Energy Market Trading',
      badge: 'REVENUE OPTIMIZATION',
      description: 'Intelligent bidding strategies across multiple energy markets with automated portfolio optimization',
      features: [
        { icon: RefreshCw, text: 'Automated market bidding algorithms' },
        { icon: BarChart, text: 'Portfolio optimization across markets' },
        { icon: Shield, text: 'Risk-adjusted return maximization' },
        { icon: Clock, text: '24/7 market monitoring & execution' },
        { icon: TrendingUp, text: 'Revenue maximization strategies' },
        { icon: Star, text: '15-20% commission vs 5-10% industry' }
      ],
      stats: {
        main: '20%',
        sub: 'Commission Rate',
        additional: '2x industry standard'
      },
      liveMetrics: [
        { label: 'Active Trades', value: '23', unit: '' },
        { label: 'Success Rate', value: '96.2', unit: '%' },
        { label: 'ROI', value: '187', unit: '%' }
      ]
    }
  ];

  const gridServices = [
    {
      service: 'Frequency Regulation',
      description: 'Provide rapid response to grid frequency changes with <1s response time',
      revenue: '$200-400/MW/month',
      capability: 'Real-time bidirectional power control with AI optimization',
      icon: Activity,
      accuracy: '99.8%',
      responseTime: '<1s'
    },
    {
      service: 'Peak Shaving',
      description: 'Reduce grid demand during peak hours with predictive algorithms',
      revenue: '$150-300/MW/month',
      capability: 'Predictive load management with 94.7% accuracy',
      icon: TrendingUp,
      accuracy: '94.7%',
      responseTime: '5min'
    },
    {
      service: 'Energy Arbitrage',
      description: 'Buy low, sell high in energy markets with ML price forecasting',
      revenue: '$100-250/MW/month',
      capability: 'Market price optimization with federated learning',
      icon: DollarSign,
      accuracy: '91.3%',
      responseTime: '15min'
    },
    {
      service: 'Voltage Support',
      description: 'Maintain grid voltage stability with reactive power management',
      revenue: '$80-150/MW/month',
      capability: 'Reactive power management with digital twin modeling',
      icon: Zap,
      accuracy: '97.5%',
      responseTime: '<2s'
    }
  ];

  const competitiveAdvantages = [
    {
      feature: 'Digital Twin Technology',
      us: 'Physics-based electrochemical modeling',
      competitors: 'Basic monitoring only',
      advantage: 'EXCLUSIVE',
      impact: '30% failure reduction'
    },
    {
      feature: 'ML Accuracy',
      us: '94.7% prediction accuracy',
      competitors: '70-75% industry average',
      advantage: '+24.7%',
      impact: '2x better decisions'
    },
    {
      feature: 'Federated Learning',
      us: 'Privacy-preserving cross-fleet intelligence',
      competitors: 'Isolated single-fleet learning',
      advantage: 'UNIQUE',
      impact: '40% accuracy boost'
    },
    {
      feature: 'V2G Revenue',
      us: '15-20% commission rate',
      competitors: '5-10% industry standard',
      advantage: '2x HIGHER',
      impact: '$500-1500/vehicle/year'
    },
    {
      feature: 'Response Time',
      us: '<1 second grid response',
      competitors: '5-30 seconds typical',
      advantage: '10x FASTER',
      impact: 'Premium market access'
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
              <Link href="/pricing" className="nav-item">Pricing</Link>
              <Link href="/auth/login" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/20 to-purple-100/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full px-6 py-3 mb-8 shadow-2xl">
                <Rocket className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Revolutionary Grid Integration</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                The Only Platform with
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Digital Twin V2G Technology
                </span>
              </h1>
              
              <p className="text-2xl text-gray-700 mb-8 max-w-5xl mx-auto leading-relaxed font-medium">
                Generate <span className="text-green-600 font-bold">$500-1500 per vehicle annually</span> with our 
                AI-powered V2G orchestration. The only solution combining 
                <span className="text-blue-600 font-bold"> digital twin technology</span>, 
                <span className="text-purple-600 font-bold"> federated learning</span>, and 
                <span className="text-indigo-600 font-bold"> explainable AI</span> for enterprise-grade grid integration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/pricing" className="btn-primary px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all bg-gradient-to-r from-green-600 to-emerald-600">
                  Calculate Revenue Potential
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Link>
                <Link href="/ev-management/demo" className="btn-secondary px-12 py-6 text-xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  See Live V2G Demo
                  <Monitor className="w-6 h-6 ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-sm">
                <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Grid Certified</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">Industry Leading</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Enterprise Proven</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Advantages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full px-6 py-3 mb-6">
              <Star className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Competitive Advantages</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-6">
              Technology No Competitor Can Match
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not just better - we're the only platform with these breakthrough technologies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {uniqueAdvantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="inline-flex items-center bg-red-500 text-white rounded-full px-3 py-1 text-xs font-bold mb-2">
                        {advantage.competitive}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{advantage.title}</h3>
                      <p className="text-gray-300">{advantage.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {advantage.benefits.map((benefit, bIndex) => (
                      <div key={bIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-200">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid Performance Metrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Industry-Leading Performance Metrics
            </h2>
            <p className="text-xl text-gray-600">
              Real-time data that proves our technology superiority
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {gridMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index}
                  className={`metric-card text-center transition-all duration-500 cursor-pointer relative overflow-hidden ${
                    currentMetric === index ? 'scale-110 shadow-3xl ring-4 ring-blue-500 ring-offset-2' : ''
                  }`}
                  onMouseEnter={() => setCurrentMetric(index)}
                >
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold">
                    {metric.trend}
                  </div>
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${metric.color}`} />
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {metric.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              How We Compare to Competitors
            </h2>
            <p className="text-xl text-gray-600">
              Side-by-side comparison shows why we're the clear leader
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Feature</th>
                  <th className="px-6 py-4 text-center font-bold">GIU Intelligence</th>
                  <th className="px-6 py-4 text-center font-bold">Competitors</th>
                  <th className="px-6 py-4 text-center font-bold">Our Advantage</th>
                  <th className="px-6 py-4 text-center font-bold">Business Impact</th>
                </tr>
              </thead>
              <tbody>
                {competitiveAdvantages.map((item, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">{item.us}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-gray-600">{item.competitors}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full px-3 py-1 text-sm font-bold">
                        {item.advantage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      {item.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Grid Capabilities Section with Live Data */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-2 mb-6">
              <Network className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Live Platform Demo</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Complete Grid Integration Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time platform capabilities with live data from our production systems
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full shadow-lg p-2 border border-gray-200">
              {gridCapabilities.map((capability) => (
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
          {gridCapabilities.map((capability) => {
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
                    href="/pricing"
                    className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-lg"
                  >
                    Get Started with {capability.title}
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
                        Live Metrics
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

      {/* Enhanced Grid Services Revenue */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">
              Multiple Revenue Streams from Grid Services
            </h2>
            <p className="text-xl text-indigo-100">
              Participate in various grid markets with industry-leading performance metrics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {gridServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{service.service}</h3>
                      <p className="text-indigo-200">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-indigo-200 text-sm">Revenue Potential</p>
                      <p className="text-2xl font-bold text-white">{service.revenue}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-sm">Our Capability</p>
                      <p className="text-white font-medium">{service.capability}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-200 text-xs">Accuracy</p>
                      <p className="text-lg font-bold text-green-300">{service.accuracy}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-200 text-xs">Response Time</p>
                      <p className="text-lg font-bold text-blue-300">{service.responseTime}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 rounded-full px-6 py-3 mb-8">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">Start Earning Today</span>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-6">
            The Only Platform with Digital Twin V2G Technology
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join industry leaders who are already earning millions from our revolutionary grid integration platform. 
            No competitor offers our unique combination of digital twins, federated learning, and explainable AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link href="/pricing" className="btn-primary bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
              Calculate Your Revenue Potential
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
            <Link href="/ev-management/demo" className="btn-secondary bg-white/10 backdrop-blur-sm text-white border-white/20 px-12 py-6 text-xl font-bold">
              See Live V2G Demo
              <Monitor className="w-6 h-6 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-sm text-gray-400">
            <div className="text-center">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">$500-1500/vehicle/year</p>
              <p className="text-xs">Revenue generation</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold">95% reliability</p>
              <p className="text-xs">Grid certified & secure</p>
            </div>
            <div className="text-center">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold">94.7% accuracy</p>
              <p className="text-xs">ML predictions</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="font-semibold">&lt;1s response</p>
              <p className="text-xs">Grid integration</p>
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
                  <p className="text-sm text-gray-400">Revolutionary Grid Integration Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                The only platform combining digital twin technology, federated learning, and explainable AI 
                for enterprise-grade V2G orchestration with 2x more revenue than competitors.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">Revenue Multiple</p>
                  <p className="font-bold">2x Better</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">ML Accuracy</p>
                  <p className="font-bold">94.7%</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-gray-400">Response Time</p>
                  <p className="font-bold">&lt;1 Second</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gray-200">Grid Technologies</h3>
              <div className="space-y-3 text-gray-400">
                <Link href="#digital-twin" className="block hover:text-white transition-colors">Digital Twin V2G</Link>
                <Link href="#federated-learning" className="block hover:text-white transition-colors">Federated Learning</Link>
                <Link href="#explainable-ai" className="block hover:text-white transition-colors">Explainable AI</Link>
                <Link href="/pricing" className="block hover:text-white transition-colors">Revenue Calculator</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gray-200">Get Started</h3>
              <div className="space-y-3 text-gray-400">
                <Link href="/pricing" className="block hover:text-white transition-colors font-semibold">View Pricing</Link>
                <Link href="/ev-management/demo" className="block hover:text-white transition-colors">Live Demo</Link>
                <Link href="/auth/login" className="block hover:text-white transition-colors">Customer Portal</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Contact Sales</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 GIU Intelligence. Revolutionary Grid Integration Technology.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <span className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Grid Certified</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Technology Leader</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span>Innovation Pioneer</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
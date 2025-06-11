"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, PlusCircle, Database, Server, Cloud, 
  RefreshCw, Shield, ArrowRight, Check, Star, Zap,
  Brain, Activity, Lock, Globe, Settings, Eye,
  Sparkles, Target, TrendingUp, Award, CheckCircle,
  AlertCircle, Info, HelpCircle, Filter, Search,
  Monitor, Smartphone, Radio, Wifi, Bluetooth,
  Code, Grid3x3, Factory, Building2, Truck,
  Users, Route, Battery, Calendar, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

export default function ConnectNewSystemPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 247,
    successRate: 98.7,
    avgSetupTime: '12 minutes',
    lastUpdate: 'Real-time'
  });

  // Update real-time data
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await fetch('/api/fleet-integration/stats');
        if (response.ok) {
          const data = await response.json();
          setRealTimeData({
            activeConnections: data.activeConnections,
            successRate: data.successRate,
            avgSetupTime: data.avgSetupTime,
            lastUpdate: 'Real-time'
          });
        }
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
      }
    };

    // Initial fetch
    fetchRealTimeData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchRealTimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Premium integration providers with advanced features
  const integrationProviders = [
    {
      id: 1,
      name: 'SAP Fleet Management',
      category: 'enterprise',
      description: 'Enterprise-grade fleet management with advanced analytics and predictive maintenance.',
      icon: <Factory className="h-8 w-8 text-blue-600" />,
      status: 'verified',
      rating: 4.9,
      reviews: 1247,
      setupTime: '8 minutes',
      tier: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'GDPR'],
      dataPoints: ['Real-time Vehicle Telemetry', 'Predictive Maintenance', 'Driver Analytics', 'Route Optimization', 'Fuel Management', 'Compliance Tracking'],
      pricing: 'Enterprise',
      integration: 'API + Webhook',
      supported: ['REST API', 'GraphQL', 'WebSocket'],
      aiPowered: true,
      previewData: {
        vehicles: 2847,
        routes: 5634,
        efficiency: 94.2
      }
    },
    {
      id: 2,
      name: 'Oracle Transportation Management',
      category: 'enterprise',
      description: 'Comprehensive transportation and logistics management with AI optimization.',
      icon: <Globe className="h-8 w-8 text-red-600" />,
      status: 'verified',
      rating: 4.8,
      reviews: 892,
      setupTime: '12 minutes',
      tier: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'HIPAA'],
      dataPoints: ['Logistics Optimization', 'Transportation Analytics', 'Supply Chain Data', 'Cost Management', 'Performance KPIs', 'Regulatory Compliance'],
      pricing: 'Enterprise',
      integration: 'API + ETL',
      supported: ['REST API', 'SOAP', 'EDI'],
      aiPowered: true,
      previewData: {
        shipments: 15420,
        costSavings: '$2.4M',
        onTime: 97.8
      }
    },
    {
      id: 3,
      name: 'Geotab Fleet Intelligence',
      category: 'telematics',
      description: 'Advanced telematics platform with IoT sensors and real-time vehicle monitoring.',
      icon: <Monitor className="h-8 w-8 text-green-600" />,
      status: 'verified',
      rating: 4.7,
      reviews: 2156,
      setupTime: '5 minutes',
      tier: 'Professional',
      security: ['SOC2', 'ISO27001'],
      dataPoints: ['Vehicle Telematics', 'Driver Behavior', 'Fuel Analytics', 'Maintenance Alerts', 'Safety Monitoring', 'Environmental Impact'],
      pricing: 'Per Vehicle',
      integration: 'API + SDK',
      supported: ['REST API', 'SDK', 'Webhooks'],
      aiPowered: true,
      previewData: {
        vehicles: 4521,
        fuelSaved: '847L',
        safety: 96.4
      }
    },
    {
      id: 4,
      name: 'Verizon Connect Fleet',
      category: 'telematics',
      description: 'Complete fleet visibility with GPS tracking and mobile workforce management.',
      icon: <Smartphone className="h-8 w-8 text-purple-600" />,
      status: 'verified',
      rating: 4.6,
      reviews: 1534,
      setupTime: '6 minutes',
      tier: 'Professional',
      security: ['SOC2', 'ISO27001'],
      dataPoints: ['GPS Tracking', 'Mobile Workforce', 'Asset Management', 'Customer Communications', 'Dispatch Optimization', 'Reporting Analytics'],
      pricing: 'Per Vehicle',
      integration: 'API + Mobile',
      supported: ['REST API', 'Mobile SDK', 'Webhooks'],
      aiPowered: false,
      previewData: {
        tracking: '99.9%',
        response: '2.3min',
        satisfaction: 94.1
      }
    },
    {
      id: 5,
      name: 'Samsara Fleet Operations',
      category: 'telematics',
      description: 'IoT-powered fleet management with AI dashcams and environmental monitoring.',
      icon: <Activity className="h-8 w-8 text-indigo-600" />,
      status: 'verified',
      rating: 4.8,
      reviews: 3421,
      setupTime: '7 minutes',
      tier: 'Professional',
      security: ['SOC2', 'ISO27001', 'FedRAMP'],
      dataPoints: ['AI Dashcams', 'Environmental Monitoring', 'Safety Analytics', 'Cargo Sensors', 'Driver Coaching', 'Compliance Management'],
      pricing: 'Per Vehicle',
      integration: 'API + IoT',
      supported: ['REST API', 'IoT Platform', 'Webhooks'],
      aiPowered: true,
      previewData: {
        incidents: '-67%',
        compliance: '99.2%',
        efficiency: 91.8
      }
    },
    {
      id: 6,
      name: 'Microsoft Dynamics 365 Field Service',
      category: 'erp',
      description: 'Comprehensive business platform with field service and inventory management.',
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      status: 'verified',
      rating: 4.5,
      reviews: 987,
      setupTime: '15 minutes',
      tier: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'GDPR', 'FedRAMP'],
      dataPoints: ['Field Service Management', 'Inventory Control', 'Customer Relations', 'Financial Integration', 'Resource Planning', 'Business Intelligence'],
      pricing: 'Per User',
      integration: 'API + Power Platform',
      supported: ['Graph API', 'Power Platform', 'Azure Logic Apps'],
      aiPowered: true,
      previewData: {
        tickets: 8942,
        resolution: '4.2hrs',
        satisfaction: 92.6
      }
    },
    {
      id: 7,
      name: 'Workday HCM',
      category: 'hr',
      description: 'Human capital management with driver certification and training programs.',
      icon: <Users className="h-8 w-8 text-amber-600" />,
      status: 'verified',
      rating: 4.4,
      reviews: 645,
      setupTime: '10 minutes',
      tier: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'GDPR'],
      dataPoints: ['Employee Management', 'Training Records', 'Certification Tracking', 'Performance Analytics', 'Scheduling', 'Compliance Reporting'],
      pricing: 'Per Employee',
      integration: 'API + SCIM',
      supported: ['REST API', 'SCIM', 'SAML SSO'],
      aiPowered: false,
      previewData: {
        employees: 1247,
        certifications: '98.4%',
        training: 847
      }
    },
    {
      id: 8,
      name: 'Custom API Integration',
      category: 'custom',
      description: 'Build custom integrations with your proprietary systems using our API framework.',
      icon: <Code className="h-8 w-8 text-gray-600" />,
      status: 'developer',
      rating: 4.9,
      reviews: 234,
      setupTime: '30+ minutes',
      tier: 'Developer',
      security: ['OAuth 2.0', 'JWT', 'API Keys'],
      dataPoints: ['Custom Data Models', 'Flexible Endpoints', 'Real-time Webhooks', 'Batch Processing', 'Data Transformation', 'Error Handling'],
      pricing: 'Custom',
      integration: 'Custom API',
      supported: ['REST API', 'GraphQL', 'Webhooks', 'SDK'],
      aiPowered: true,
      previewData: {
        endpoints: 47,
        uptime: '99.9%',
        latency: '45ms'
      }
    }
  ];

  // AI-powered recommendations
  const aiRecommendations = [
    {
      provider: 'SAP Fleet Management',
      confidence: 96,
      reason: 'Best match for your enterprise fleet size (500+ vehicles)',
      benefit: '$2.3M annual savings potential'
    },
    {
      provider: 'Samsara Fleet Operations',
      confidence: 89,
      reason: 'Excellent safety features for your commercial operations',
      benefit: '67% reduction in safety incidents'
    },
    {
      provider: 'Geotab Fleet Intelligence',
      confidence: 84,
      reason: 'Strong telematics capabilities for route optimization',
      benefit: '23% improvement in fuel efficiency'
    }
  ];

  // Integration categories
  const categories = [
    { id: 'all', name: 'All Systems', count: integrationProviders.length, icon: <Grid3x3 className="w-4 h-4" /> },
    { id: 'enterprise', name: 'Enterprise ERP', count: integrationProviders.filter(p => p.category === 'enterprise').length, icon: <Factory className="w-4 h-4" /> },
    { id: 'telematics', name: 'Telematics & IoT', count: integrationProviders.filter(p => p.category === 'telematics').length, icon: <Radio className="w-4 h-4" /> },
    { id: 'hr', name: 'HR & Training', count: integrationProviders.filter(p => p.category === 'hr').length, icon: <Users className="w-4 h-4" /> },
    { id: 'custom', name: 'Custom/API', count: integrationProviders.filter(p => p.category === 'custom').length, icon: <Code className="w-4 h-4" /> }
  ];

  // Filter providers based on category and search
  const filteredProviders = integrationProviders.filter(provider => {
    const matchesCategory = activeCategory === 'all' || provider.category === activeCategory;
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = (provider) => {
    setSelectedProvider(provider);
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      alert(`Successfully initiated connection to ${provider.name}!`);
    }, 2000);
  };

  const handleAIRecommendation = (recommendation) => {
    const provider = integrationProviders.find(p => p.name === recommendation.provider);
    if (provider) {
      setSelectedProvider(provider);
      // Navigate to provider details
      window.location.href = `/ev-management/fleet-integration/connect/provider/${provider.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
      {/* Premium Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/ev-management/fleet-integration" className="flex items-center hover:text-blue-600 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Fleet Integration
            </Link>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Integration Hub
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-500" />
                  Enterprise-grade system integrations with intelligent recommendations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">{realTimeData.activeConnections} Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{realTimeData.successRate.toFixed(1)}% Success</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Avg: {realTimeData.avgSetupTime}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Settings size={16} className="mr-2" />
                Integration Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* AI Recommendations Banner */}
        {showAIRecommendations && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-3">AI-Powered Integration Recommendations</h3>
                  <div className="space-y-3">
                    {aiRecommendations.map((rec, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {rec.confidence}% match
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">{rec.provider}</p>
                          <p className="text-sm text-purple-600">{rec.reason}</p>
                          <p className="text-sm font-medium text-green-700">{rec.benefit}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleAIRecommendation(rec)}>
                          <Link href={`/ev-management/fleet-integration/connect/provider/${aiRecommendations.findIndex(r => r.provider === rec.provider) + 1}`} className="flex items-center">
                            View Details
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAIRecommendations(false)}
              >
                <ChevronLeft className="w-4 h-4 rotate-90" />
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search integration providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="h-12"
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Integration Providers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {provider.status === 'verified' && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {provider.aiPowered && (
                  <Badge className="bg-purple-100 text-purple-700">
                    <Brain className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    {provider.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{provider.name}</CardTitle>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{provider.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({provider.reviews} reviews)</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {provider.tier} • {provider.setupTime} setup
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-3 text-base">
                  {provider.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Live Preview Data */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                    Live Data Preview
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(provider.previewData).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-lg font-bold text-blue-700">{value}</p>
                        <p className="text-xs text-blue-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Points */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Data Points</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.dataPoints.slice(0, 4).map((point, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        {point}
                      </Badge>
                    ))}
                    {provider.dataPoints.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.dataPoints.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Security & Compliance */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-600" />
                    Security & Compliance
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.security.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                        <Lock className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Integration Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Integration:</span>
                    <p className="text-gray-600">{provider.integration}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pricing:</span>
                    <p className="text-gray-600">{provider.pricing}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Link href={`/ev-management/fleet-integration/connect/provider/${provider.id}/details`}>
                      <Button variant="outline" size="sm">
                        <Info className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </Link>
                    <Link href={`/ev-management/fleet-integration/connect/provider/${provider.id}/preview`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </Link>
                  </div>
                  <Link href={`/ev-management/fleet-integration/connect/provider/${provider.id}/auth`}>
                    <Button 
                      disabled={isConnecting && selectedProvider?.id === provider.id}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isConnecting && selectedProvider?.id === provider.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Connect Now
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise Support Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Enterprise Integration Support</h3>
              <p className="text-gray-300">Need a custom integration? Our team can build it for you.</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">24/7 Support Available</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Code className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-semibold mb-2">Custom API Development</h4>
              <p className="text-sm text-gray-300">Build bespoke integrations for your unique systems</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="font-semibold mb-2">Security Compliance</h4>
              <p className="text-sm text-gray-300">Enterprise-grade security and compliance validation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">Dedicated Support</h4>
              <p className="text-sm text-gray-300">Dedicated integration specialists for your project</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/ev-management/fleet-integration/connect/consultation">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Consultation
              </Button>
            </Link>
            <Link href="/ev-management/fleet-integration/connect/documentation">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Info className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
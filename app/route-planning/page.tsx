"use client";

import React from 'react';
import { 
  MapPin, Navigation, Route, Car, Clock, Calendar, 
  Battery, Zap, AlertTriangle, Cloud, Droplets, 
  ChevronRight, ArrowRight, Save, Settings, Brain, 
  Sparkles, Target, TrendingUp, TrendingDown, BarChart3,
  Activity, Gauge, Wind, Sun, Thermometer, Eye,
  RefreshCw, Play, Pause, FastForward, SkipBack,
  Users, Truck, Fuel, DollarSign, Leaf, Globe,
  Shield, Lock, Star, Trophy, Award, CheckCircle,
  AlertCircle, Info, HelpCircle, Share, Download,
  Maximize2, Filter, Search, Plus, Minus, X,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  Monitor, Smartphone, Radio, Wifi, Bluetooth,
  Database, Server, Code, Grid3x3, Factory,
  Building2, Home, Phone, Mail, MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export default function RoutePlanningPage() {
  const [activeTab, setActiveTab] = React.useState('ai-planning');
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [routeCalculated, setRouteCalculated] = React.useState(false);
  const [aiMode, setAiMode] = React.useState('intelligent');
  const [fleetMode, setFleetMode] = React.useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = React.useState(true);
  const [weatherIntegration, setWeatherIntegration] = React.useState(true);
  const [trafficOptimization, setTrafficOptimization] = React.useState(true);
  
  const handleCalculateRoute = () => {
    setIsOptimizing(true);
    // Simulate advanced AI route calculation
    setTimeout(() => {
      setIsOptimizing(false);
      setRouteCalculated(true);
    }, 3000);
  };

  const handleFleetOptimization = () => {
    alert('Fleet-wide optimization initiated. Coordinating routes for 24 vehicles...');
  };

  const handleAIRecommendation = (recommendation) => {
    alert(`Applying AI recommendation: ${recommendation}`);
  };

  const handleExportRoute = (format) => {
    alert(`Exporting route in ${format} format...`);
  };

  const handleRealTimeAlert = (alert) => {
    alert(`Real-time alert: ${alert}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
      {/* Premium Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Route Planning Command Center
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-500" />
                  Advanced ML-powered route optimization with real-time fleet coordination
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">AI Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Live Traffic Data</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Fleet Coordination</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
                <Button 
                  variant={aiMode === 'intelligent' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setAiMode('intelligent')}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Intelligent
                </Button>
                <Button 
                  variant={aiMode === 'eco' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setAiMode('eco')}
                >
                  <Leaf className="w-4 h-4 mr-1" />
                  Eco
                </Button>
                <Button 
                  variant={aiMode === 'speed' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setAiMode('speed')}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Speed
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFleetMode(!fleetMode)}
                className={fleetMode ? 'bg-purple-50 border-purple-200 text-purple-700' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                Fleet Mode: {fleetMode ? 'ON' : 'OFF'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={realTimeUpdates ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                <RefreshCw size={16} className={`mr-2 ${realTimeUpdates ? 'animate-spin' : ''}`} />
                Live Updates
              </Button>
              
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Settings size={16} className="mr-2" />
                AI Config
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* AI Alerts Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900">AI Route Optimization Recommendations</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      98% confidence
                    </Badge>
                    <span className="text-sm text-purple-800">Current traffic patterns suggest 23% time savings via Highway 417 alternate route</span>
                    <Button size="sm" variant="outline" onClick={() => handleAIRecommendation('Highway 417 alternate route')}>
                      Apply
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      94% confidence
                    </Badge>
                    <span className="text-sm text-purple-800">Weather forecast shows charging efficiency boost at Station B in 2 hours</span>
                    <Button size="sm" variant="outline" onClick={() => handleAIRecommendation('Delayed charging at Station B')}>
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Premium Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active Routes</p>
                  <h3 className="text-3xl font-bold mt-1 text-blue-900">47</h3>
                  <p className="text-xs text-blue-600 mt-1">Across 8 regions</p>
                </div>
                <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                  <Route size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +18% efficiency vs manual planning
                </span>
              </div>
              <div className="mt-3">
                <Progress value={82} className="h-2" />
                <p className="text-xs text-blue-600 mt-1">82% AI optimization success rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Cost Savings Today</p>
                  <h3 className="text-3xl font-bold mt-1 text-green-900">$2,847</h3>
                  <p className="text-xs text-green-600 mt-1">AI-optimized routing</p>
                </div>
                <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center text-green-700">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowDown size={14} className="mr-1" />
                  32% reduction in fuel costs
                </span>
              </div>
              <div className="mt-3">
                <Progress value={68} className="h-2" />
                <p className="text-xs text-green-600 mt-1">68% of monthly savings target</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Real-time Optimizations</p>
                  <h3 className="text-3xl font-bold mt-1 text-purple-900">156</h3>
                  <p className="text-xs text-purple-600 mt-1">In the last hour</p>
                </div>
                <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
                  <Brain size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-purple-600 flex items-center">
                  <Activity size={14} className="mr-1" />
                  AI processing 2,400 data points/sec
                </span>
              </div>
              <div className="mt-3">
                <Progress value={94} className="h-2" />
                <p className="text-xs text-purple-600 mt-1">94% optimization success rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Carbon Reduction</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-900">847 kg</h3>
                  <p className="text-xs text-amber-600 mt-1">CO₂ saved today</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                  <Leaf size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-amber-600 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +26% vs traditional routing
                </span>
              </div>
              <div className="mt-3">
                <Progress value={87} className="h-2" />
                <p className="text-xs text-amber-600 mt-1">87% toward sustainability goal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white/50 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="ai-planning" className="data-[state=active]:bg-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Planning
            </TabsTrigger>
            <TabsTrigger value="fleet-coordination" className="data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" />
              Fleet Coordination
            </TabsTrigger>
            <TabsTrigger value="real-time" className="data-[state=active]:bg-white">
              <Activity className="w-4 h-4 mr-2" />
              Real-time Intelligence
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="data-[state=active]:bg-white">
              <Leaf className="w-4 h-4 mr-2" />
              Sustainability
            </TabsTrigger>
            <TabsTrigger value="autonomous" className="data-[state=active]:bg-white">
              <Monitor className="w-4 h-4 mr-2" />
              Autonomous Ready
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Map with Advanced Controls */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden border-none shadow-lg">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        AI-Powered Route Visualization
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {routeCalculated && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              485 km
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              4h 23m
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              92 kWh
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              $187 saved
                            </Badge>
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => alert('Opening full-screen map interface...')}>
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 h-[700px] w-full">
                      {/* Advanced Map Interface */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="grid grid-cols-12 grid-rows-8 gap-1 h-full p-4">
                          {Array.from({ length: 96 }).map((_, i) => (
                            <div key={i} className="bg-blue-300 rounded animate-pulse" style={{
                              animationDelay: `${i * 50}ms`,
                              animationDuration: '3s'
                            }}></div>
                          ))}
                        </div>
                      </div>

                      {/* Route Planning Interface */}
                      <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-lg flex items-center">
                            <Brain className="h-6 w-6 mr-3 text-purple-600" />
                            AI Route Optimizer
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-700 font-medium">AI Processing Active</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-green-100 rounded-full">
                                <MapPin className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <Input placeholder="Starting point (AI auto-detection enabled)" className="text-base" />
                                <p className="text-xs text-green-600 mt-1">📍 Current location detected via GPS</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-red-100 rounded-full">
                                <MapPin className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <Input placeholder="Destination (smart suggestions)" className="text-base" />
                                <p className="text-xs text-red-600 mt-1">🎯 AI will suggest optimal destinations</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-100 rounded-full">
                                <Car className="h-5 w-5 text-blue-600" />
                              </div>
                              <Select defaultValue="">
                                <SelectTrigger className="flex-1 text-base">
                                  <SelectValue placeholder="Select Fleet Vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tesla-y-001">Tesla Model Y-001 (87% SoC) • 420km range</SelectItem>
                                  <SelectItem value="tesla-3-002">Tesla Model 3-002 (94% SoC) • 380km range</SelectItem>
                                  <SelectItem value="ford-150-003">Ford F-150 Lightning-003 (76% SoC) • 320km range</SelectItem>
                                  <SelectItem value="rivian-004">Rivian R1T-004 (82% SoC) • 365km range</SelectItem>
                                  <SelectItem value="fleet-optimal">🤖 AI Select Optimal Vehicle</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-full">
                                  <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <Input type="date" className="text-base" defaultValue={new Date().toISOString().substring(0, 10)} />
                                  <p className="text-xs text-purple-600 mt-1">📅 Smart scheduling</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-full">
                                  <Clock className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <Input type="time" className="text-base" defaultValue="09:00" />
                                  <p className="text-xs text-purple-600 mt-1">⏰ Optimal timing</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm font-medium">AI Optimization Mode</Label>
                                <span className="text-xs text-blue-600">Advanced ML algorithms</span>
                              </div>
                              <Select defaultValue="intelligent">
                                <SelectTrigger className="text-base">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="intelligent">🧠 Intelligent Balance (Recommended)</SelectItem>
                                  <SelectItem value="speed">⚡ Maximum Speed Priority</SelectItem>
                                  <SelectItem value="efficiency">🔋 Energy Efficiency Focus</SelectItem>
                                  <SelectItem value="cost">💰 Cost Optimization</SelectItem>
                                  <SelectItem value="eco">🌱 Environmental Priority</SelectItem>
                                  <SelectItem value="comfort">😌 Comfort & Convenience</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm font-medium">Charging Strategy</Label>
                                <span className="text-xs text-green-600">Min arrival SoC: 15%</span>
                              </div>
                              <Select defaultValue="adaptive">
                                <SelectTrigger className="text-base">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="adaptive">🎯 Adaptive AI Strategy</SelectItem>
                                  <SelectItem value="minimal">⚡ Minimal Stops (Fast)</SelectItem>
                                  <SelectItem value="optimal">💎 Cost-Optimal Charging</SelectItem>
                                  <SelectItem value="rapid">🚀 Ultra-Fast Charging Only</SelectItem>
                                  <SelectItem value="green">🌿 Renewable Energy Priority</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 text-base py-3"
                            onClick={handleCalculateRoute}
                            disabled={isOptimizing}
                          >
                            {isOptimizing ? (
                              <>
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                AI Computing Optimal Route...
                              </>
                            ) : (
                              <>
                                <Brain className="w-5 h-5 mr-2" />
                                Calculate AI Route
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="text-base py-3"
                            onClick={handleFleetOptimization}
                          >
                            <Users className="w-5 h-5 mr-2" />
                            Fleet Optimization
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="text-base py-3"
                            onClick={() => handleExportRoute('GPX')}
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Export Route
                          </Button>
                        </div>
                      </div>

                      {/* Advanced Route Summary */}
                      {routeCalculated && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">AI-Optimized Route Summary</h3>
                            <div className="flex gap-3">
                              <Button variant="outline" size="sm" className="h-9">
                                <Share className="h-4 w-4 mr-2" />
                                Share Route
                              </Button>
                              <Button variant="outline" size="sm" className="h-9">
                                <Save className="h-4 w-4 mr-2" />
                                Save Route
                              </Button>
                              <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700">
                                <Play className="h-4 w-4 mr-2" />
                                Start Navigation
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-700">485 km</div>
                              <div className="text-xs text-blue-600">Total Distance</div>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                              <div className="text-2xl font-bold text-amber-700">4h 23m</div>
                              <div className="text-xs text-amber-600">Travel Time</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-700">92 kWh</div>
                              <div className="text-xs text-green-600">Energy Required</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-700">$187</div>
                              <div className="text-xs text-purple-600">Cost Savings</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-700">18%</div>
                              <div className="text-xs text-red-600">Arrival SoC</div>
                            </div>
                            <div className="text-center p-3 bg-indigo-50 rounded-lg">
                              <div className="text-2xl font-bold text-indigo-700">2</div>
                              <div className="text-xs text-indigo-600">Charging Stops</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <Zap className="h-6 w-6 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800">Fast Charging Stop 1</p>
                                <p className="text-sm text-green-600">Tesla Supercharger • 25 min • $28.40</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <Zap className="h-6 w-6 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-800">Fast Charging Stop 2</p>
                                <p className="text-sm text-blue-600">Electrify Canada • 22 min • $31.20</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                            <div className="flex items-center">
                              <Sparkles className="w-5 h-5 text-purple-600 mr-3" />
                              <div>
                                <p className="font-medium text-purple-800">AI Recommendation</p>
                                <p className="text-sm text-purple-600">
                                  This route is 23% more efficient than standard routing. Weather conditions are optimal, 
                                  and charging stations have real-time availability confirmed.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* AI Control Panel */}
              <div>
                <Card className="h-full border-none shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600" />
                      AI Control Center
                    </CardTitle>
                    <CardDescription>Advanced machine learning optimization controls</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* AI Status */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">AI System Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-green-800">Neural Network</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="font-medium text-blue-800">Traffic Analysis</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Processing</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="font-medium text-purple-800">Weather Integration</span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">Online</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Metrics */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">AI Confidence Score</span>
                              <span className="text-sm text-green-600">96%</span>
                            </div>
                            <Progress value={96} className="h-3" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Route Optimization</span>
                              <span className="text-sm text-blue-600">89%</span>
                            </div>
                            <Progress value={89} className="h-3" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Data Processing Speed</span>
                              <span className="text-sm text-purple-600">2.4k/sec</span>
                            </div>
                            <Progress value={92} className="h-3" />
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Smart Recommendations</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Traffic Alert</p>
                                <p className="text-xs text-yellow-600 mt-1">Heavy traffic detected on Highway 401. Alternate route suggested.</p>
                                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => handleRealTimeAlert('Traffic reroute applied')}>
                                  Apply Alternate
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">Weather Update</p>
                                <p className="text-xs text-blue-600 mt-1">Rain expected in 2 hours. Charging efficiency may decrease by 8%.</p>
                                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => handleRealTimeAlert('Weather adjustment applied')}>
                                  Adjust Route
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Optimization Success</p>
                                <p className="text-xs text-green-600 mt-1">Route optimized successfully. 18% time savings achieved.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" className="h-12 flex flex-col">
                            <Gauge className="w-4 h-4 mb-1" />
                            <span className="text-xs">Performance</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-12 flex flex-col">
                            <Settings className="w-4 h-4 mb-1" />
                            <span className="text-xs">AI Settings</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-12 flex flex-col">
                            <Download className="w-4 h-4 mb-1" />
                            <span className="text-xs">Export Data</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-12 flex flex-col">
                            <Share className="w-4 h-4 mb-1" />
                            <span className="text-xs">Share Route</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Fleet Coordination Tab */}
          <TabsContent value="fleet-coordination" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fleet Overview Map */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Fleet-wide Route Coordination
                  </CardTitle>
                  <CardDescription>Real-time coordination of 24 vehicles across 8 regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-10 grid-rows-6 gap-2 h-full p-4">
                        {Array.from({ length: 60 }).map((_, i) => (
                          <div key={i} className="bg-purple-300 rounded animate-pulse" style={{
                            animationDelay: `${i * 80}ms`,
                            animationDuration: '2.5s'
                          }}></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center z-10">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white">
                          <Users size={32} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Multi-Vehicle Coordination Active</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-4">
                        AI is coordinating routes for 24 vehicles to minimize conflicts and maximize efficiency
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">24</p>
                          <p className="text-xs text-gray-500">Active Vehicles</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">47</p>
                          <p className="text-xs text-gray-500">Coordinated Routes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">92%</p>
                          <p className="text-xs text-gray-500">Efficiency Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Management Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Active Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 'Route-A1', vehicles: 6, status: 'optimized', efficiency: 94 },
                      { id: 'Route-B2', vehicles: 4, status: 'active', efficiency: 87 },
                      { id: 'Route-C3', vehicles: 8, status: 'coordinating', efficiency: 91 },
                      { id: 'Route-D4', vehicles: 6, status: 'optimized', efficiency: 96 }
                    ].map((route) => (
                      <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{route.id}</p>
                          <p className="text-xs text-gray-500">{route.vehicles} vehicles</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={route.status === 'optimized' ? 'default' : 
                                   route.status === 'active' ? 'secondary' : 'outline'}
                            className="text-xs mb-1"
                          >
                            {route.status}
                          </Badge>
                          <p className="text-xs font-medium">{route.efficiency}% efficiency</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline" onClick={handleFleetOptimization}>
                    <Users className="w-4 h-4 mr-2" />
                    Optimize All Routes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                    Coordination Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Route Conflict</p>
                          <p className="text-xs text-yellow-600">Vehicles EV-007 and EV-012 approaching same charging station</p>
                          <Button size="sm" className="mt-2 h-6 text-xs">Resolve</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Optimization Opportunity</p>
                          <p className="text-xs text-blue-600">Convoy formation possible for Route-A1, 15% efficiency gain</p>
                          <Button size="sm" className="mt-2 h-6 text-xs">Apply</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Coordination Success</p>
                          <p className="text-xs text-green-600">Route-B2 optimized, 23% time savings achieved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Fleet Coordination</span>
                        <span className="text-sm text-green-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Route Efficiency</span>
                        <span className="text-sm text-blue-600">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Conflict Resolution</span>
                        <span className="text-sm text-purple-600">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">$2,847</p>
                        <p className="text-xs text-gray-600">Daily savings from coordination</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Real-time Intelligence Tab */}
          <TabsContent value="real-time" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Data Streams */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Real-time Data Streams
                    </CardTitle>
                    <CardDescription>Live data integration from multiple sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Traffic & Navigation</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">Live Traffic Data</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">Road Conditions</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Monitoring</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">Construction Alerts</span>
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">Updated</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Weather & Environment</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Sun className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium">Weather Forecast</span>
                            </div>
                            <span className="text-sm font-semibold">12°C</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Wind className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">Wind Conditions</span>
                            </div>
                            <span className="text-sm font-semibold">15 km/h</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Thermometer className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">Temperature Impact</span>
                            </div>
                            <span className="text-sm font-semibold">-5% range</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-800">Live Data Processing</h4>
                          <p className="text-sm text-blue-600">2,847 data points processed in the last minute</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-700">98.7%</p>
                          <p className="text-xs text-blue-600">Data accuracy</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-green-600" />
                      Charging Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-800">Available Stations</h4>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-700">247</p>
                        <p className="text-xs text-green-600">Within route corridor</p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-amber-800">Busy Stations</h4>
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-amber-700">18</p>
                        <p className="text-xs text-amber-600">15-30 min wait</p>
                      </div>
                      
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-red-800">Offline Stations</h4>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-red-700">3</p>
                        <p className="text-xs text-red-600">Maintenance required</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Controls */}
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-purple-600" />
                      Live Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-4">System Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Data Feed Latency</span>
                            <span className="text-sm font-semibold text-green-600">0.3s</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Update Frequency</span>
                            <span className="text-sm font-semibold text-blue-600">Real-time</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">API Responses</span>
                            <span className="text-sm font-semibold text-green-600">99.8%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Live Alerts</h4>
                        <div className="space-y-3">
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs font-medium text-yellow-800">Traffic Alert</p>
                            <p className="text-xs text-yellow-600">Highway 401 - 15 min delay</p>
                          </div>
                          
                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-medium text-blue-800">Weather Update</p>
                            <p className="text-xs text-blue-600">Light rain starting in 45 min</p>
                          </div>
                          
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-medium text-green-800">Station Available</p>
                            <p className="text-xs text-green-600">Supercharger opened - Kingston</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="h-10 text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh
                          </Button>
                          <Button size="sm" variant="outline" className="h-10 text-xs">
                            <Settings className="w-3 h-3 mr-1" />
                            Config
                          </Button>
                          <Button size="sm" variant="outline" className="h-10 text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline" className="h-10 text-xs">
                            <Share className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Route Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-30">
                      <div className="grid grid-cols-12 gap-1 h-full p-4">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="flex flex-col justify-end">
                            <div 
                              className="bg-purple-400 rounded-t"
                              style={{ height: `${Math.random() * 80 + 20}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center z-10">
                      <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-bold text-gray-800">Advanced Route Analytics</h3>
                      <p className="text-sm text-gray-600">Performance trends and optimization insights</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">94.2%</p>
                      <p className="text-sm text-blue-600">Efficiency Score</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">$47k</p>
                      <p className="text-sm text-green-600">Monthly Savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Predictive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Next Week Forecast</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700">Expected Routes</span>
                          <span className="font-semibold text-green-800">342</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700">Predicted Savings</span>
                          <span className="font-semibold text-green-800">$12,400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700">Efficiency Gain</span>
                          <span className="font-semibold text-green-800">+18%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Peak Hours Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">Morning Peak</span>
                          <span className="font-semibold text-blue-800">7:00-9:00 AM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">Evening Peak</span>
                          <span className="font-semibold text-blue-800">5:00-7:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">Optimal Window</span>
                          <span className="font-semibold text-blue-800">10:00 AM-3:00 PM</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline" onClick={() => handleExportRoute('analytics')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Analytics Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-green-600" />
                    Carbon Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <h3 className="text-3xl font-bold text-green-700 mb-2">2.47 tons</h3>
                    <p className="text-sm text-green-600 mb-4">CO₂ Reduced This Month</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      +26% vs standard routing
                    </Badge>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Renewable Energy Use</span>
                        <span className="text-sm text-green-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Eco-Route Adoption</span>
                        <span className="text-sm text-green-600">84%</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Environmental Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-800">Carbon Neutral 2024</span>
                        <span className="text-sm text-green-600">73%</span>
                      </div>
                      <Progress value={73} className="h-2" />
                      <p className="text-xs text-green-600 mt-1">On track for December target</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-800">Zero Emission Routes</span>
                        <span className="text-sm text-blue-600">67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                      <p className="text-xs text-blue-600 mt-1">Target: 80% by Q4</p>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Award className="w-4 h-4 mr-2" />
                      View Sustainability Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Carbon Negative Week</p>
                        <p className="text-xs text-green-600">Achieved 3 times this month</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                      <Star className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Efficiency Champion</p>
                        <p className="text-xs text-blue-600">Top 5% fleet performance</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Innovation Leader</p>
                        <p className="text-xs text-purple-600">Early adopter bonus</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Autonomous Ready Tab */}
          <TabsContent value="autonomous" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="w-5 h-5 mr-2 text-indigo-600" />
                    Autonomous Vehicle Integration
                  </CardTitle>
                  <CardDescription>Future-ready autonomous routing capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-indigo-800">Autonomous Readiness Score</h4>
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Beta</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-indigo-700 mb-2">87%</p>
                        <p className="text-sm text-indigo-600">Infrastructure compatibility</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">V2X Communication</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Ready</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Real-time Mapping</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium">Fleet Coordination</span>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">In Development</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI Route Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Machine Learning Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-2xl font-bold text-purple-700">2.4M</p>
                          <p className="text-xs text-purple-600">Route patterns learned</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-700">99.3%</p>
                          <p className="text-xs text-purple-600">Prediction accuracy</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Learning Progress</span>
                          <span className="text-sm text-purple-600">94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Safety Protocols</span>
                          <span className="text-sm text-green-600">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Integration Testing</span>
                          <span className="text-sm text-blue-600">76%</span>
                        </div>
                        <Progress value={76} className="h-2" />
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Code className="w-4 h-4 mr-2" />
                      Access Developer API
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                  Future Technologies Preview
                </CardTitle>
                <CardDescription>Cutting-edge features coming to route planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Radio className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">5G Integration</h4>
                    </div>
                    <p className="text-sm text-blue-600">Ultra-low latency route updates</p>
                    <Badge variant="outline" className="mt-2 text-xs">Coming Q3 2024</Badge>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Database className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Quantum Optimization</h4>
                    </div>
                    <p className="text-sm text-purple-600">Ultra-complex route calculations</p>
                    <Badge variant="outline" className="mt-2 text-xs">Research Phase</Badge>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Wifi className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">Edge Computing</h4>
                    </div>
                    <p className="text-sm text-green-600">Local processing for speed</p>
                    <Badge variant="outline" className="mt-2 text-xs">Testing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legacy tabs for compatibility */}
          <TabsContent value="saved-routes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Routes</CardTitle>
                <CardDescription>Your frequently used and optimized routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">You have no saved routes yet.</p>
                  <p className="text-sm mt-2 opacity-70">Plan a route and save it for future use</p>
                  <Button variant="outline" className="mt-4">Create Your First Route</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recurring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Routes</CardTitle>
                <CardDescription>Scheduled regular routes for your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">No recurring routes configured.</p>
                  <p className="text-sm mt-2 opacity-70">Set up regular routes to automate planning</p>
                  <Button variant="outline" className="mt-4">Configure Recurring Route</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route History</CardTitle>
                <CardDescription>Previously taken routes and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">No route history available.</p>
                  <p className="text-sm mt-2 opacity-70">Route history will appear here after trips</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 